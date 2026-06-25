import { getSupabaseClient } from "@/lib/supabase/client";

// Fire-and-forget anonymous aggregate counter only — no per-user identity,
// no answer content, no attempt history. Bumps resources_quiz_questions'
// answered_count/correct_count via a SECURITY DEFINER function, since the
// table itself has no UPDATE grant for anon.
export async function POST(request) {
  const { questionId, isCorrect } = await request.json();
  if (!questionId || typeof isCorrect !== "boolean") {
    return Response.json({ error: "questionId and isCorrect are required." }, { status: 400 });
  }

  const supabase = getSupabaseClient();
  const { error } = await supabase.rpc("increment_quiz_stat", {
    p_question_id: questionId,
    p_is_correct: isCorrect,
  });

  if (error) {
    console.error("[api/resources/quiz-answer] RPC failed:", error);
    return Response.json({ error: "Failed to record stat." }, { status: 502 });
  }

  return Response.json({ ok: true });
}
