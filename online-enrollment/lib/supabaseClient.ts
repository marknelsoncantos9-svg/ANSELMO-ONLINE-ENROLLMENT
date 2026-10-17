import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://tmrimwhwwvojbsztnbxf.supabase.co";

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtcmltd2h3d3ZvamJzenRuYnhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE1MjY0MTQsImV4cCI6MjEwNzEwMjQxNH0.OWsP76mlxRpirgO15rcuHBCttR3t7Ql-iW0k_6_0fNw";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase URL or Anon Key is missing. Check your .env.local file.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
