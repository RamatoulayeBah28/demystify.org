import { getSupabaseClient } from "@/lib/supabase/client";

// Allowlist of stat keys the client is allowed to bump — keeps this
// endpoint from becoming an arbitrary-key counter someone could spam.
const ALLOWED_KEYS = new Set(["files_uploaded"]);

// Fire-and-forget anonymous aggregate counter only — no identity, no file
// content, no IP. See increment_quiz_stat for the same pattern applied
// to quiz comprehension.
export async function POST(request) {
  const { key } = await request.json();
  if (!ALLOWED_KEYS.has(key)) {
    return Response.json({ error: "Unknown stat key." }, { status: 400 });
  }

  const supabase = getSupabaseClient();
  const { error } = await supabase.rpc("increment_app_stat", { p_stat_key: key });

  if (error) {
    console.error("[api/stats/increment] RPC failed:", error);
    return Response.json({ error: "Failed to record stat." }, { status: 502 });
  }

  return Response.json({ ok: true });
}
