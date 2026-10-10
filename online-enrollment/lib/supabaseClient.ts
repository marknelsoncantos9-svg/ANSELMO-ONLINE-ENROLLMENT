import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://bwcwqxfbymfuagftjnir.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3Y3dxeGZieW1mdWFnZnRqbmlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAzMTg3MzMsImV4cCI6MjEwNTg5NDczM30.R_KiExsWsGO6jI3JRVmuREQTW8f3WEKE5kWbcubdDco";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase URL or Anon Key is missing. Check your .env.local file.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
