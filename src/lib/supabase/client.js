import { createClient } from "@supabase/supabase-js";

let client = null;

// All current Supabase-backed content (resources videos/quizzes) is
// public, read-only, and gated by RLS policies scoped to the anon role —
// so the plain anon key is sufficient here. Revisit if a future feature
// needs the service-role key for privileged writes.
export function getSupabaseClient() {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }

  client = createClient(url, anonKey);
  return client;
}
