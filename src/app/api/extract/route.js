import Anthropic from "@anthropic-ai/sdk";
import { DOCUMENT_TYPES, SUPPORTED_TYPES } from "@/lib/documentTypes";

const MODEL = "claude-opus-4-8";

function buildSystemPrompt() {
  const typeBlocks = Object.entries(DOCUMENT_TYPES).map(([type, def]) => {
    const lines = Object.entries(def.fields ?? {}).map(([key, desc]) => `  - ${key}: ${desc}`);
    if (def.correctedFields) {
      lines.push(
        ...def.correctedFields.map((key) => {
          const label = def.correctedFieldLabels[key];
          return `  - ${key}_previous / ${key}_corrected: ${label} — this form prints it twice, once under "Previously reported" and once under "Correct information"`;
        }),
      );
    }
    return `"${type}" (${def.title}):\n${lines.join("\n")}`;
  });

  return [
    "You are a document-extraction assistant for demystify.org, a tax-document explainer app. You will be shown an image or PDF of one tax document.",
    "",
    "1. Identify the document type by reading the form's own printed title. It is one of the types listed below, or \"unknown\" if it matches none of them.",
    "",
    "2. If you recognized a type, extract that type's fields exactly as printed on the document. Never estimate, guess, or calculate a value that isn't directly visible — omit a field entirely (don't include its key) if it's blank or illegible. Dollar amounts are plain decimals with no $ sign, e.g. \"152.05\".",
    "",
    "Document types and their fields:",
    "",
    typeBlocks.join("\n\n"),
    "",
    "Respond with ONLY this JSON shape — no other text, no markdown code fences, no commentary:",
    '{"documentType": "w2" | "w2c" | "1099-nec" | "unknown", "fields": {"<fieldKey>": "<value>", ...}}',
  ].join("\n");
}

const SYSTEM_PROMPT = buildSystemPrompt();

// Turns the model's flat field map into the fieldValues shape the rest of
// the app already expects: keys prefixed with the document type, and a
// w2c box split into its own :previous/:corrected keys (matching how
// W2cDocument.jsx reads them).
function buildFieldValues(documentType, fields) {
  const fieldValues = {};
  for (const [key, value] of Object.entries(fields ?? {})) {
    if (value == null || value === "") continue;
    const correctedMatch = key.match(/^(.+)_(previous|corrected)$/);
    if (correctedMatch) {
      const [, base, suffix] = correctedMatch;
      fieldValues[`${documentType}:${base}:${suffix}`] = value;
    } else {
      fieldValues[`${documentType}:${key}`] = value;
    }
  }
  return fieldValues;
}

function parseExtraction(text) {
  const cleaned = text.trim().replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  const parsed = JSON.parse(cleaned);
  if (typeof parsed.documentType !== "string") throw new Error("Missing documentType.");
  return parsed;
}

export async function POST(request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "Server is missing ANTHROPIC_API_KEY." }, { status: 500 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!file || typeof file.arrayBuffer !== "function") {
    return Response.json({ error: "file is required." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const base64 = buffer.toString("base64");
  const documentBlock =
    file.type === "application/pdf"
      ? { type: "document", source: { type: "base64", media_type: "application/pdf", data: base64 } }
      : { type: "image", source: { type: "base64", media_type: file.type, data: base64 } };

  const anthropic = new Anthropic({ apiKey });

  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 2048,
      thinking: { type: "adaptive" },
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [documentBlock, { type: "text", text: "Extract this document's fields as JSON." }],
        },
      ],
    });

    const text = response.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n");

    const { documentType, fields } = parseExtraction(text);
    if (!SUPPORTED_TYPES.has(documentType)) {
      return Response.json({ documentType: null, fieldValues: {} });
    }

    return Response.json({ documentType, fieldValues: buildFieldValues(documentType, fields) });
  } catch (error) {
    console.error("[api/extract] Extraction failed:", error);
    return Response.json({ error: "Extraction failed." }, { status: 502 });
  }
}
