import { createClient } from "@supabase/supabase-js";

let client = null;

// Every current Supabase-backed feature (Resources videos/quizzes, Our
// Collaborators, anonymous usage counters) only needs the anon key: reads
// are public and RLS-gated, and the few writes (stat increments) go
// through narrow, allowlisted RPC functions rather than direct table
// access. Revisit if a future feature needs the service-role key.
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
