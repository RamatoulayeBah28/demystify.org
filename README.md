# demystify.org

A web app that helps Somali-speaking immigrants understand US tax documents. Users upload a PDF, JPG, PNG, or HEIC file — which can contain multiple distinct forms — and Claude reads the document directly to detect every form's type, extract its fields, and annotate each one with a plain-English explanation and a Somali translation. A follow-up chatbot answers questions about tax terminology and the uploaded document. The Resources tab has Somali-voiced video walkthroughs with quick comprehension quizzes, and an Our Collaborators page highlights Somali tax experts.

Uploaded documents are processed entirely in-memory and never persisted to disk or a database — see `CLAUDE.md` for this and other architecture decisions.

## Supported form types (23)

**Income & withholding:** W-2, W-2c, 1099-NEC, 1099-INT, 1099-G, 1099-R, SSA-1099, 1098-T, 1099-MISC

**Return & schedules:** 1040, 1040-SR, Schedule 1, Schedule 1-A, Schedule 2, Schedule 3

**Withholding & payment:** W-4, 1040-ES, 9465

**Identity & registration:** W-9, 4506-T, SS-4, W-7

**Employer payroll:** 941

## Tech stack

- **Next.js (App Router)** + **Tailwind** — frontend and API routes (no separate backend server)
- **Claude API** (`@anthropic-ai/sdk`, `claude-opus-4-8` for extraction, `claude-sonnet-4-6` for chat) — document field extraction via vision and the chatbot
- **heic-convert** — in-memory HEIC → JPEG conversion before sending to Claude (HEIC files are never written to disk)
- **Supabase** — Postgres for Resources videos/quizzes, Collaborators, and anonymous aggregate usage counters; row-level security with narrow allowlisted increment functions
- **Vercel Analytics** — page-visit analytics

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in the values below
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

See `.env.example` for the full list with explanations.

| Variable | Required for |
| --- | --- |
| `ANTHROPIC_API_KEY` | Document extraction (`/api/extract`) and the chatbot (`/api/chat`) |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Resources videos/quizzes and Collaborators |
| `NEXT_PUBLIC_DONATION_LINK` | The Donate page's button (shows a "not open yet" state without it) |

### Database setup

Schema and seed data live in `supabase/migrations/`. Run each file in order against your Supabase project's SQL Editor (or via the Supabase CLI if linked). They create tables for Resources videos/quizzes, Collaborators, and anonymous usage counters — all public read-only content, never written to directly by the app except through narrow allowlisted increment functions.

## Project structure

```
src/
  app/                    Next.js App Router pages and API routes
    api/
      extract/            Multi-document extraction endpoint (Claude vision)
      chat/               Chatbot endpoint (Claude API, prompt-cached)
      collaborators/      GET endpoint for the Collaborators page
      resources/          GET videos+quizzes, POST quiz-answer stat
      stats/increment/    Anonymous aggregate counter endpoint
  components/
    TaxDocumentHelper/    Upload → detect → annotated viewer flow (23 form templates)
  lib/
    documentTypes.js      Per-type field list driving the extraction prompt (23 types)
    annotations/          Keyed Somali/English explanation library (22 JSON files;
                          1040-SR aliases 1040 via DOC_TYPE_ALIASES)
    box12Codes.js         Dynamic W-2 box 12 code-to-explanation lookup
    supabase/             Supabase client helper
supabase/
  migrations/             Schema + seed SQL, run manually (see Database setup)
```

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run lint` — ESLint

## Other docs

`CLAUDE.md` documents the project's mission and architecture decisions in detail — read it before touching document processing, the annotation library, or the chatbot's scope.
