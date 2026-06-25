# demystify.org — project context

## Mission
A web app helping Somali-speaking immigrants understand US tax 
documents through plain-language annotation, Somali translation/audio, 
and a follow-up chatbot. Many users are anxious about both taxes and 
technology — defaults should be warm, calm, and plain-language, never 
clinical or dense.

## Tech stack
Next.js (App Router) + Tailwind, Supabase (auth + db), Claude API 
(simplification/translation/chatbot), spaCy (NLP preprocessing), OCR 
for extraction. Backend is Next.js API routes (no separate Express 
server).

## Architecture decisions
- Documents are processed ephemerally. Never persist an uploaded file 
  or its raw extracted text, to disk or database. Conversion steps 
  (e.g. HEIC to JPEG) also stay in-memory only.
- Document type is auto-detected from OCR'd text (form titles like 
  "Form W-2" are printed on the document). No manual document-type 
  selector anywhere in the UI.
- Detected type is shown to the user with a lightweight confirm or 
  "that's not right" option. Never act on a guess silently. Never 
  show a numeric confidence score in the UI — confidence is used 
  internally only, to choose between the confirm-step path and the 
  unmatched-document path.
- The annotated document viewer is the centerpiece. Each labeled 
  field shows a plain-English explanation, a Somali translation, and 
  an audio icon.
- Annotations come from a seeded, human-vetted library, matched by a 
  key like w2:box1 (document type + field id) — not live generation, 
  not raw-text matching. This library doubles as the project's Somali 
  glossary: reviewed once, served many times.
- Claude API has three distinct jobs, kept separate: offline 
  generation of seed content for human review (annotations, video 
  scripts); a disclaimed live fallback only for unmatched document 
  types, grounded in the closest vetted examples and visibly marked 
  unverified; and the follow-up chatbot.
- Chatbot answers broadly — terminology, document content, and direct 
  tax-advice questions (dependency status, filing strategy, etc.) — 
  rather than redirecting elsewhere. User research found that Somali 
  users would rather ask their own trusted person than a stranger/org 
  they don't know, so a generic redirect-to-volunteers flow isn't what 
  people actually want. When a response constitutes real tax advice, 
  add a brief disclaimer that it's not a substitute for a tax 
  professional or a trusted person — a light liability guardrail, not 
  a content restriction.
- Resources tab (video walkthroughs, quizzes) is static content, 
  independent of the OCR/annotation pipeline.
- Upload accepts PDF, JPG, PNG via drag-and-drop and click-to-browse 
  on the same control. HEIC is accepted and converted server-side, 
  in-memory, before OCR.

## Working agreement
We work one step at a time. Before implementing anything, propose a 
short plan and wait for explicit confirmation. After implementing, 
stop, summarize what changed, and wait for review before moving to 
the next step. Don't bundle unrelated changes into one step.
