<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AASMNHS Online Enrollment — Agent Guide

## Commands (executable source of truth)
- `npm run dev` — Next.js dev server (Next 16.3.5, React 19, TS 5)
- `npm run build` — Production build
- `npm run start` — Serve built app
- `npm run lint` — ESLint (eslint-config-next core-web-vitals + typescript)

## Stack
- Next.js App Router (`app/`), TypeScript, Tailwind v4, lucide-react, @supabase/ssr/js
- reCAPTCHA (`react-google-recaptcha`), nodemailer (SMTP)
- Supabase: auth + DB + Storage

## Core Architecture
- Enrollment flow: `/` ? `/enroll` (track selection) ? `/form` (student info, posts to Supabase via `/api/submit-application`) ? `/requirements` (uploads to Supabase Storage bucket `enrollment-documents`, updates application) ? `/enroll/account` (calls `/api/send-account`, shows generated temp password) ? `/login`
- Staff portal: `/staff/login` (email+pw, verifies role in `profiles.role` in {`staff`,`registrar`}), redirects to `/staff/dashboard`
- Supabase clients: `lib/supabaseClient.ts` exports singleton `supabase` (browser anon) with fallback defaults. `lib/supabase/client.ts` also exports wrapper; prefer `@/lib/supabaseClient` in client components or existing conventions.
- API routes use service role when available (`SUPABASE_SERVICE_ROLE_KEY`) to bypass RLS or to admin-create/update users (see `/api/submit-application`, `/api/send-account`).

## Supabase Schema & Quirks
- Table: `public.student_applications` (schema.sql has full definition). RLS is disabled by schema (`DISABLE ROW LEVEL SECURITY`) and grants ALL to anon/auth/service_role. Status values are not constrained — code uses `pending`, `Under Review`, etc.
- `user_id` is nullable (DROP NOT NULL) to allow guest applicants.
- Many extended columns exist (guardians, address split, docs URLs, flags). `/api/submit-application` inserts a full payload and falls back to minimal base payload if backend rejects extended columns (`PGRST204`), and can auto-provision auth user if `user_id` NOT NULL is enforced (`23502`) by creating/checking auth user and retrying with `user_id`.
- Storage: bucket `enrollment-documents` (referenced in `/app/requirements/page.tsx` as `enrollment-documents`) — schema.sql shows bucket `requirements`. Upload path: `${folder}/${uuid}-${sanitizedName}`. Check actual bucket name if uploads fail; code and SQL differ slightly (`enrollment-documents` vs `requirements`). 
- Dashboard queries `student_applications` (no ORDER BY assumed; may need to inspect columns). Flexible getters read multiple possible column names.

## Environment Variables (.env.local)
Required/used:
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (client)
- `SUPABASE_SERVICE_ROLE_KEY` (server APIs; falls back to anon if missing)
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM` (nodemailer; `/api/send-account` treats placeholders as unconfigured and will still show generated password if email not sent)
- `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`, `RECAPTCHA_SECRET_KEY` (reCAPTCHA v2)

## Key Files & Entry Points
- App: `app/page.tsx`, `app/enroll/page.tsx`, `app/form/page.tsx`, `app/requirements/page.tsx`, `app/enroll/account/page.tsx`, `app/login/page.tsx`
- Staff: `app/staff/login/page.tsx`, `app/staff/dashboard/page.tsx`, `app/staff/dashboard/status/page.tsx`, `app/staff/dashboard/sections/page.tsx`, `app/staff/reset-password/page.tsx`
- API: `app/api/submit-application/route.ts`, `app/api/send-account/route.ts`, `app/api/verify-recaptcha/route.ts`
- Lib: `lib/supabaseClient.ts`, `lib/supabase/client.ts`
- DB: `supabase/schema.sql`
- Config: `tsconfig.json` (strict, moduleResolution bundler, jsx react-jsx), `eslint.config.mjs` (next config), `postcss.config.mjs`

## Gotchas for Agents
- Client uses singleton `supabase` from `@/lib/supabaseClient` (has hardcoded fallback URL/key if env missing). Don’t duplicate client creation unnecessarily.
- API routes fall back to hardcoded Supabase creds if env missing (see route.ts) — treat env as source of truth in real deployments.
- `/requirements/page.tsx` uploads to storage bucket `enrollment-documents` but schema.sql creates `requirements`. If storage policies/uploads behave unexpectedly, verify bucket name/policies in Supabase.
- reCAPTCHA token is verified server-side via `/api/verify-recaptcha` before sign-in; token can only be used once.
- Email sending is best-effort; if SMTP unconfigured, API still returns generated password for display.
- Staff auth checks `profiles.role` (case-insensitive) must be in {staff, registrar}.
- The AGENTS.md Next.js block is auto-regenerated by `next dev` — don’t remove it; committing it keeps tree clean.

## When to Consult Existing Sources
- If Next.js 16 specifics matter, check `node_modules/next/dist/docs/` as noted. If schemas/policies unclear, trust `supabase/schema.sql` and running SQL in Supabase over prose. Let config (package.json, tsconfig, eslint) be executable sources.
