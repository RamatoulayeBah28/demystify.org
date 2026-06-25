import { getSupabaseClient } from "@/lib/supabase/client";

// Single nested Supabase query (questions embedded in videos, choices
// embedded in questions) — PostgREST resolves the joins server-side in
// one round trip, so this never turns into N+1 queries regardless of how
// many videos/questions exist.
export async function GET() {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("resources_videos")
    .select(
      `
      id, youtube_id, title_en, title_so, topic, order_index,
      questions:resources_quiz_questions (
        id, question_en, question_so, order_index,
        choices:resources_quiz_choices ( id, choice_en, choice_so, is_correct, order_index )
      )
    `,
    )
    .eq("is_active", true)
    .order("order_index");

  if (error) {
    console.error("[api/resources/videos] Supabase query failed:", error);
    return Response.json({ error: "Failed to load videos." }, { status: 502 });
  }

  // Nested embeds don't reliably support ordering at every depth via the
  // query builder, so the (small) nested arrays are sorted here instead.
  const videos = (data ?? []).map((video) => ({
    id: video.id,
    youtubeId: video.youtube_id,
    titleEn: video.title_en,
    titleSo: video.title_so,
    topic: video.topic,
    questions: [...(video.questions ?? [])]
      .sort((a, b) => a.order_index - b.order_index)
      .map((q) => ({
        id: q.id,
        questionEn: q.question_en,
        questionSo: q.question_so,
        choices: [...(q.choices ?? [])]
          .sort((a, b) => a.order_index - b.order_index)
          .map((c) => ({
            id: c.id,
            choiceEn: c.choice_en,
            choiceSo: c.choice_so,
            isCorrect: c.is_correct,
          })),
      })),
  }));

  return Response.json(videos);
}
