import Anthropic from "@anthropic-ai/sdk";
import convertHeic from "heic-convert";
import { DOCUMENT_TYPES, SUPPORTED_TYPES } from "@/lib/documentTypes";

const MODEL = "claude-opus-4-8";
const HEIC_EXTENSION_PATTERN = /\.(heic|heif)$/i;

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
    "You are a document-extraction assistant for demystify.org, a tax-document explainer app. You will be shown an image or PDF, which may contain ONE OR MORE separate tax documents — for example, a multi-page PDF where each page is a different form, or several forms scanned together in one file.",
    "",
    "1. Find every distinct tax document present. Multiple pages that are copies/parts of the SAME document (e.g. a 2-page W-2, or a form's Copy B and Copy C printed on separate pages) count as ONE document, not several — group those pages together. Only treat pages as separate documents when they are genuinely different forms or different filings (e.g. a W-2 followed by a 1099-NEC, or two different employers' W-2s).",
    "",
    "2. For each distinct document, identify its type by reading the form's own printed title. It is one of the types listed below, or \"unknown\" if it matches none of them.",
    "",
    "3. If you recognized a type, extract that type's fields exactly as printed on the document. Never estimate, guess, or calculate a value that isn't directly visible — omit a field entirely (don't include its key) if it's blank or illegible. Dollar amounts are plain decimals with no $ sign, e.g. \"152.05\".",
    "",
    "Document types and their fields:",
    "",
    typeBlocks.join("\n\n"),
    "",
    "Respond with ONLY this JSON shape — no other text, no markdown code fences, no commentary. One entry in \"documents\" per distinct document found, in the order they appear:",
    '{"documents": [{"documentType": "w2" | "w2c" | "1099-nec" | "unknown" | ..., "fields": {"<fieldKey>": "<value>", ...}}]}',
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
  if (!Array.isArray(parsed.documents)) throw new Error("Missing documents array.");
  return parsed;
}

// HEIC/HEIF isn't a format Claude's vision API accepts, and phone cameras
// default to it — convert to JPEG in-memory before sending. Detected by
// extension too, not just MIME type, since browsers/OSes are inconsistent
// about reporting "image/heic" for these files (some report it blank).
function isHeic(file) {
  return file.type === "image/heic" || file.type === "image/heif" || HEIC_EXTENSION_PATTERN.test(file.name ?? "");
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

  let buffer = Buffer.from(await file.arrayBuffer());
  let mediaType = file.type;

  if (isHeic(file)) {
    try {
      buffer = Buffer.from(await convertHeic({ buffer, format: "JPEG", quality: 0.92 }));
      mediaType = "image/jpeg";
    } catch (error) {
      console.error("[api/extract] HEIC conversion failed:", error);
      return Response.json({ error: "Couldn't read this HEIC file." }, { status: 400 });
    }
  }

  const base64 = buffer.toString("base64");
  const documentBlock =
    file.type === "application/pdf"
      ? { type: "document", source: { type: "base64", media_type: "application/pdf", data: base64 } }
      : { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } };

  const anthropic = new Anthropic({ apiKey });

  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 4096,
      thinking: { type: "adaptive" },
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [documentBlock, { type: "text", text: "Extract this file's document(s) as JSON." }],
        },
      ],
    });

    const text = response.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n");

    const { documents } = parseExtraction(text);
    const recognized = documents
      .filter((doc) => doc && SUPPORTED_TYPES.has(doc.documentType))
      .map((doc) => ({
        documentType: doc.documentType,
        fieldValues: buildFieldValues(doc.documentType, doc.fields),
      }));

    return Response.json({ documents: recognized });
  } catch (error) {
    console.error("[api/extract] Extraction failed:", error);
    return Response.json({ error: "Extraction failed." }, { status: 502 });
  }
}
