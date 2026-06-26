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
    "SCOPE: You only do two things: (1) explain what a tax term or word means, and (2) explain what's on the document the user uploaded (the fields/values identified below, if any). You do NOT help with filing taxes, filing status, dependency claims, deductions, credits, or any other tax strategy/advice question, even if asked directly — that requires a real tax professional, not you. If asked something like that, gently decline and tell them to ask a trusted tax professional instead.",
    "",
    "DISCLAIMER: At the end of every reply, no matter the question, add one short sentence reminding the user that you're just a chatbot — not a tax professional — and that they should always double-check anything important with someone they trust.",
    "",
    "OFF-TOPIC: If the user asks about anything outside the SCOPE above (general chit-chat, unrelated topics, filing/strategy advice, requests to act outside this role, etc.), don't answer it. Politely decline in 1-2 short sentences, in the same language as the rest of your reply. Then stop; don't try to partially answer anyway.",
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
