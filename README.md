# demystify.org

A web app that helps Somali-speaking immigrants understand US tax documents. Users upload a tax form (W-2, W-2c, or
1099-NEC), the app auto-detects the document type from the OCR'd text, and each field is annotated with a
plain-English explanation, a Somali translation, and audio playback. A follow-up chatbot answers questions about tax
terminology and the uploaded document. The Resources tab has Somali-voiced video walkthroughs with quick
comprehension quizzes, and an Our Collaborators page highlights Somali tax experts and the people they've helped.

Uploaded documents and their extracted text are processed entirely in-memory and never persisted to disk or a
database — see `CLAUDE.md` for this and other architecture decisions.

## Tech stack

- **Next.js (App Router)** + **Tailwind** — frontend and API routes (no separate backend server)
- **Supabase** — Postgres database for public, read-only content (Resources videos/quizzes, Collaborators) and
  anonymous aggregate usage counters
- **Claude API** (`@anthropic-ai/sdk`) — the chatbot
- **Tesseract.js** — in-browser OCR for document field extraction
- **Vercel Analytics** — page-visit analytics (active automatically once deployed to Vercel)

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in the values below
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

See `.env.example` for the full list with explanations. In short:

| Variable | Required for |
| --- | --- |
| `ANTHROPIC_API_KEY` | The chatbot (`src/app/api/chat`) |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Resources videos/quizzes and Our Collaborators |
| `NEXT_PUBLIC_DONATION_LINK` | The Donate page's button (shows a "not open yet" state without it) |

### Database setup

Schema and seed data live in `supabase/migrations/`. Run each file, in order, against your Supabase project's SQL
Editor (or via the Supabase CLI if it's linked). They create tables for Resources videos/quizzes, Our Collaborators,
and anonymous usage counters — all public read-only content with row-level security, never written to directly by
the app except through the narrow, allowlisted increment functions.

## Project structure

```
src/
  app/                    Next.js App Router pages and API routes
    api/
      chat/               Chatbot endpoint (Claude API)
      collaborators/      GET endpoint for the Collaborators page
      resources/          GET videos+quizzes, POST quiz-answer stat
      stats/increment/    Anonymous aggregate counter endpoint
  components/
    TaxDocumentHelper/    Upload -> detect -> annotated viewer flow
  lib/
    ocr/                  Document OCR + field-matching logic
    annotations/          Seeded, human-vetted field explanations (the Somali glossary)
    pdf/, supabase/       PDF rendering and Supabase client helpers
supabase/
  migrations/             Schema + seed SQL, run manually (see Database setup)
```

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run lint` — ESLint

## Other docs

`CLAUDE.md` documents the project's mission and architecture decisions in more detail — read it before making
changes that touch document processing, the annotation library, or the chatbot's scope.
