# demystify.org — project context

## Mission
A web app helping Somali-speaking immigrants understand US tax 
documents through plain-language annotation, Somali translation/audio, 
and a follow-up chatbot. Many users are anxious about both taxes and 
technology — defaults should be warm, calm, and plain-language, never 
clinical or dense.

## Tech stack
Next.js (App Router) + Tailwind, Supabase (auth + db), Claude API 
(document field extraction via vision, simplification/translation, 
chatbot), spaCy (NLP preprocessing). Backend is Next.js API routes (no 
separate Express server).

## Architecture decisions
- Documents are processed ephemerally. Never persist an uploaded file 
  or its raw extracted text, to disk or database. Conversion steps 
  (e.g. HEIC to JPEG) also stay in-memory only. The uploaded file is 
  sent to Claude's API (`POST /api/extract`) for field extraction — 
  it's no longer kept 100% client-side the way the original Tesseract 
  OCR pipeline was, but it's still never written to our own disk or 
  database, before or after.
- Document type and field values are extracted in one Claude vision 
  call per upload (`src/app/api/extract`), reading the document 
  directly rather than OCR'ing text and pattern-matching it. Adding a 
  new document type is: an entry in `src/lib/documentTypes.js`, an 
  annotation JSON file, and a viewer template — no per-template anchor/
  regex tuning. No manual document-type selector anywhere in the UI.
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
- Claude API has four distinct jobs, kept separate: document field 
  extraction on upload (reads the document directly via vision — see 
  above); offline generation of seed content for human review 
  (annotations, video scripts); a disclaimed live fallback only for 
  unmatched document types, grounded in the closest vetted examples 
  and visibly marked unverified; and the follow-up chatbot.
- Chatbot only explains tax terminology and the content of the user's 
  uploaded document. It declines filing-status/strategy/dependency/
  deduction-type questions outright — those need a real tax 
  professional, not a chatbot. Every reply ends with a short reminder 
  that it's just a chatbot and the user should double-check anything 
  important with someone they trust. (This is narrower than an earlier 
  version of this decision that let it answer tax-advice questions 
  directly with a disclaimer — reverted back to the original 
  terminology/document-only scope.)
- Resources tab (video walkthroughs, quizzes) is static content, 
  independent of the document upload/extraction pipeline.
- Upload accepts PDF, JPG, PNG via drag-and-drop and click-to-browse 
  on the same control. HEIC is accepted and converted server-side, 
  in-memory, before extraction.

## Working agreement
We work one step at a time. Before implementing anything, propose a 
short plan and wait for explicit confirmation. After implementing, 
stop, summarize what changed, and wait for review before moving to 
the next step. Don't bundle unrelated changes into one step.
