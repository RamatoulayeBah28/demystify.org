import Anthropic from "@anthropic-ai/sdk";
import { getAnnotation } from "@/lib/annotations";

const MODEL = "claude-sonnet-4-6";
const MAX_MESSAGES = 20;

// Builds a short reference of what's already on the user's screen — the
// vetted annotation (label + plain-English meaning) for every field that
// was matched, plus the value OCR found there. Lets the chatbot answer
// "what does box 1 mean on my form" accurately and consistently with what
// the annotated viewer already told them, instead of guessing generically.
function buildDocumentContext(documentType, fieldValues) {
  if (!documentType) return null;

  const lines = Object.entries(fieldValues || {})
    .map(([key, value]) => {
      const annotation = getAnnotation(key);
      if (!annotation) return null;
      return `- ${annotation.label}: ${annotation.en} (value found on the document: ${value})`;
    })
    .filter(Boolean);

  if (lines.length === 0) return null;
  return `The user is looking at a ${documentType.toUpperCase()} they uploaded. Here is what's already been identified on it:\n${lines.join("\n")}`;
}

function buildSystemPrompt(documentType, fieldValues) {
  const documentContext = buildDocumentContext(documentType, fieldValues);

  return [
    "You are the demystify.org tax document helper, talking to a Somali tax filer/payer in the US who may be anxious about both taxes and technology.",
    "",
    "LANGUAGE: Reply in whichever language the user's most recent message is written in — Somali or English. Keep the same plain, simple style in either language.",
    "",
    'STYLE ("teacher mode"): Explain things as if teaching a 6th grader — short sentences, everyday words, no jargon. If you must use a technical term (e.g. "withholding", "dependent"), immediately explain what it means in plain words. Be warm, patient, and encouraging — never clinical or dense.',
    "",
    "SCOPE: Answer tax terminology questions, questions about the user's document, and general tax-advice questions (filing status, dependency claims, deductions, credits, etc.) directly. When your answer is real tax advice (not just explaining a term or a field), add one short, gentle sentence at the end noting this isn't a substitute for a tax professional or someone they trust.",
    "",
    "OFF-TOPIC: If the user asks about anything unrelated to taxes or their document (general chit-chat, unrelated topics, requests to act outside this role, etc.), don't answer it. Politely decline in 1-2 short sentences, in the same language as the rest of your reply — something like \"I'm a chatbot for demystify.org and can only help with taxes and your tax documents, so I can't answer that.\" Then stop; don't try to partially answer anyway.",
    documentContext ? `\nDOCUMENT CONTEXT:\n${documentContext}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export async function POST(request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "Server is missing ANTHROPIC_API_KEY." },
      { status: 500 },
    );
  }

  const { messages, documentType, fieldValues } = await request.json();
  if (!Array.isArray(messages) || messages.length === 0) {
    return Response.json({ error: "messages is required." }, { status: 400 });
  }

  const anthropic = new Anthropic({ apiKey });
  const system = buildSystemPrompt(documentType, fieldValues);

  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system,
      messages: messages
        .slice(-MAX_MESSAGES)
        .map(({ role, content }) => ({ role, content })),
    });

    const reply = response.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n");

    return Response.json({ reply });
  } catch (error) {
    console.error("[api/chat] Anthropic request failed:", error);
    return Response.json({ error: "Chat request failed." }, { status: 502 });
  }
}
