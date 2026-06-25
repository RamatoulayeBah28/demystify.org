import { getSupabaseClient } from "@/lib/supabase/client";

// Single nested Supabase query (quotes embedded in collaborators) —
// PostgREST resolves the join server-side in one round trip, same
// pattern as GET /api/resources/videos.
export async function GET() {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("collaborators")
    .select(
      `
      id, first_name, last_name, photo_url, title, order_index,
      quotes:collaborator_quotes ( id, quote_text, author_name, order_index )
    `,
    )
    .eq("is_active", true)
    .order("order_index");

  if (error) {
    console.error("[api/collaborators] Supabase query failed:", error);
    return Response.json({ error: "Failed to load collaborators." }, { status: 502 });
  }

  const collaborators = (data ?? []).map((c) => ({
    id: c.id,
    firstName: c.first_name,
    lastName: c.last_name,
    photoUrl: c.photo_url,
    title: c.title,
    quotes: [...(c.quotes ?? [])]
      .sort((a, b) => a.order_index - b.order_index)
      .map((q) => ({
        id: q.id,
        quoteText: q.quote_text,
        authorName: q.author_name,
      })),
  }));

  return Response.json(collaborators);
}
