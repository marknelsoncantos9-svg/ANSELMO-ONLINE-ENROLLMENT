-- ============================================================
-- AASMNHS Online Enrollment - Supabase Complete Database Fix
-- Targets table: public.student_applications & storage.buckets
-- Paste this entire file into Supabase -> SQL Editor -> Click RUN.
-- This fixes:
-- 1. RLS blocking inserts (disables RLS & grants access)
-- 2. user_id NOT NULL error (makes user_id optional for new applicants)
-- 3. status check constraint error
-- 4. Missing columns (track, email, address, guardians, documents)
-- 5. Storage bucket permissions for uploading requirement documents
-- ============================================================

-- 1. Create table if not exists with core columns
CREATE TABLE IF NOT EXISTS public.student_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  first_name text,
  middle_name text,
  last_name text,
  birth_date date,
  sex text,
  contact_number text,
  address text,
  status text DEFAULT 'pending',
  submitted_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. CRITICAL: Allow guest/student applicants to enroll without requiring an existing auth user
ALTER TABLE public.student_applications ALTER COLUMN user_id DROP NOT NULL;

-- 3. Remove restrictive check constraints on status so 'pending', 'Under Review', etc. are accepted
ALTER TABLE public.student_applications DROP CONSTRAINT IF EXISTS student_applications_status_check;
ALTER TABLE public.student_applications ALTER COLUMN status SET DEFAULT 'pending';

-- 4. Remove columns not applicable to the enrollment workflow (CASCADE removes dependent old policies)
ALTER TABLE public.student_applications
  DROP COLUMN IF EXISTS preferred_strand_id CASCADE,
  DROP COLUMN IF EXISTS assigned_section_id CASCADE,
  DROP COLUMN IF EXISTS registrar_remarks CASCADE;

-- 5. Add all full enrollment form columns if not already present
ALTER TABLE public.student_applications
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS track text,
  ADD COLUMN IF NOT EXISTS extension text,
  ADD COLUMN IF NOT EXISTS place_of_birth text,
  ADD COLUMN IF NOT EXISTS gender text,
  ADD COLUMN IF NOT EXISTS religion text,
  ADD COLUMN IF NOT EXISTS is_ip_community boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_4ps_beneficiary boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS current_house_no text,
  ADD COLUMN IF NOT EXISTS current_street text,
  ADD COLUMN IF NOT EXISTS current_barangay text,
  ADD COLUMN IF NOT EXISTS current_municipality text,
  ADD COLUMN IF NOT EXISTS current_province text,
  ADD COLUMN IF NOT EXISTS current_country text,
  ADD COLUMN IF NOT EXISTS current_zip_code text,
  ADD COLUMN IF NOT EXISTS same_as_current_address boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS permanent_house_no text,
  ADD COLUMN IF NOT EXISTS permanent_street text,
  ADD COLUMN IF NOT EXISTS permanent_barangay text,
  ADD COLUMN IF NOT EXISTS permanent_municipality text,
  ADD COLUMN IF NOT EXISTS permanent_province text,
  ADD COLUMN IF NOT EXISTS permanent_country text,
  ADD COLUMN IF NOT EXISTS permanent_zip_code text,
  ADD COLUMN IF NOT EXISTS father_last_name text,
  ADD COLUMN IF NOT EXISTS father_first_name text,
  ADD COLUMN IF NOT EXISTS father_middle_name text,
  ADD COLUMN IF NOT EXISTS father_contact_number text,
  ADD COLUMN IF NOT EXISTS mother_last_name text,
  ADD COLUMN IF NOT EXISTS mother_first_name text,
  ADD COLUMN IF NOT EXISTS mother_middle_name text,
  ADD COLUMN IF NOT EXISTS mother_contact_number text,
  ADD COLUMN IF NOT EXISTS guardian_last_name text,
  ADD COLUMN IF NOT EXISTS guardian_first_name text,
  ADD COLUMN IF NOT EXISTS guardian_middle_name text,
  ADD COLUMN IF NOT EXISTS guardian_contact_number text,
  ADD COLUMN IF NOT EXISTS report_card_url text,
  ADD COLUMN IF NOT EXISTS birth_certificate_url text,
  ADD COLUMN IF NOT EXISTS other_requirement_url text,
  ADD COLUMN IF NOT EXISTS requirements_submitted boolean DEFAULT false;

-- 5. Turn OFF Row-Level Security (RLS) on student_applications completely
ALTER TABLE public.student_applications DISABLE ROW LEVEL SECURITY;

-- Grant full access to anon, authenticated, and service_role
GRANT ALL ON public.student_applications TO anon, authenticated, service_role;

-- 6. Trigger to keep updated_at current
CREATE OR REPLACE FUNCTION public.set_student_applications_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  new.updated_at = now();
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS student_applications_set_updated_at ON public.student_applications;
CREATE TRIGGER student_applications_set_updated_at
  BEFORE UPDATE ON public.student_applications
  FOR EACH ROW EXECUTE FUNCTION public.set_student_applications_updated_at();

-- 7. Configure storage bucket for requirement document uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('requirements', 'requirements', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Remove old restrictive storage policies if present
DROP POLICY IF EXISTS "requirements_upload_anon" ON storage.objects;
DROP POLICY IF EXISTS "requirements_read_public" ON storage.objects;
DROP POLICY IF EXISTS "Give public access to requirements" ON storage.objects;

-- Allow anyone to upload requirement files
CREATE POLICY "requirements_upload_anon"
  ON storage.objects FOR INSERT
  TO anon, authenticated, service_role
  WITH CHECK (bucket_id = 'requirements');

-- Allow anyone to read uploaded requirement files
CREATE POLICY "requirements_read_public"
  ON storage.objects FOR SELECT
  TO anon, authenticated, service_role
  USING (bucket_id = 'requirements');

-- Allow anyone to update requirement files if re-uploaded
DROP POLICY IF EXISTS "requirements_update_anon" ON storage.objects;
CREATE POLICY "requirements_update_anon"
  ON storage.objects FOR UPDATE
  TO anon, authenticated, service_role
  USING (bucket_id = 'requirements');
