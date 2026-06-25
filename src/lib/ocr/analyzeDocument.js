import { createWorker } from "tesseract.js";
import { pdfjs } from "@/lib/pdf/pdfWorker";
import { FORM_DEFINITIONS } from "./formDefinitions";

const RENDER_SCALE = 3;
const MAX_PAGES_TO_SCAN = 5;
// findAnchor's proximity radius, in canvas pixels — kept proportional to
// RENDER_SCALE so it doesn't silently drift if that constant changes.
const ANCHOR_RADIUS = 100 * RENDER_SCALE;
// Values usually sit a bit further from the label than the label's own
// keyword does, so this is a bit more generous than ANCHOR_RADIUS.
const VALUE_RADIUS = ANCHOR_RADIUS * 1.5;
// Match currency amounts: optional $, digits with optional commas, optional decimal.
// Tested against a cleaned token (see parseAmount), not the raw OCR text.
const VALUE_PATTERN = /^\$?[\d,]+(\.\d{1,2})?$/;
const VALUE_SANITY_MAX = 999999;
// The form prints every box's own number as a bare label (e.g. "3" right
// next to box 3) — those are unambiguous, real box numbers, always small.
// A bare candidate at or below this is almost certainly a stray label, not
// a real wage/withholding amount.
const BOX_NUMBER_LABEL_MAX = 20;
// Letter-boxes a–f sit in the form's left column; the numbered boxes
// (1, 2, 13, 15, ...) start around x≈280*RENDER_SCALE. Capping text-field
// capture to this column stops it from picking up a same-row numbered
// box's label or value.
const TEXT_COLUMN_MAX_X = 280 * RENDER_SCALE;

async function renderPageToCanvas(pdf, pageNumber) {
  const page = await pdf.getPage(pageNumber);
  const viewport = page.getViewport({ scale: RENDER_SCALE });

  const canvas = document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;

  await page.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;
  return canvas;
}

// Image uploads (JPG/PNG) are already a single, full-resolution "page" —
// no pdf.js, no per-page loop, just decode straight to canvas.
async function renderImageToCanvas(file) {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  canvas.getContext("2d").drawImage(bitmap, 0, 0);
  bitmap.close();
  return canvas;
}

// For matching single OCR word tokens against a known word (e.g. "wages") —
// strips all whitespace too, since we're comparing whole tokens, not phrases.
function normalizeWord(text) {
  return text.toLowerCase().replace(/[^a-z0-9]/g, "").trim();
}

// For phrase search across the full page text — collapses whitespace
// instead of removing it, so multi-word phrases stay matchable as substrings.
function normalizeText(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Groups words by Tesseract's own OCR-detected line, sorted top to bottom.
// Each line's bbox is derived from its words' extents (not trusted from
// Tesseract directly, since not every build guarantees one). Text fields
// walk this structure — "the next N lines after this anchor's line" — so
// they don't depend on a guessed pixel line-height that varies by the
// source document's font and breaks on a different template.
function flattenLines(page) {
  const lines = [];
  for (const block of page.blocks ?? []) {
    for (const paragraph of block.paragraphs ?? []) {
      for (const line of paragraph.lines ?? []) {
        const lineWords = (line.words ?? []).map((word) => ({
          text: word.text,
          bbox: word.bbox,
          confidence: word.confidence ?? 0,
        }));
        if (lineWords.length === 0) continue;
        const x0 = Math.min(...lineWords.map((w) => w.bbox.x0));
        const y0 = Math.min(...lineWords.map((w) => w.bbox.y0));
        lines.push({ bbox: { x0, y0 }, words: lineWords });
      }
    }
  }
  lines.sort((a, b) => a.bbox.y0 - b.bbox.y0);
  return lines;
}

// Flat word list derived from `lines`, with each word tagged with a
// reference back to its own line — lets anchor-based lookups (findAnchor,
// findLetterAnchor) keep working against a flat list while still letting
// findNearbyText/findNearbyId walk to nearby lines via that reference.
// Mutates each word in place (rather than spreading into a copy) so this
// flat list and `line.words` share the exact same object references —
// otherwise a `Set` built from one can never match a lookup against the
// other, silently breaking every exclude/claimed check.
function flattenWords(lines) {
  const words = [];
  for (const line of lines) {
    for (const word of line.words) {
      word.line = line;
      words.push(word);
    }
  }
  return words;
}

function nearbyWord(words, anchor, keyword, radius = ANCHOR_RADIUS) {
  const target = normalizeWord(keyword);
  return words.find((w) => {
    if (normalizeWord(w.text) !== target) return false;
    const dx = w.bbox.x0 - anchor.bbox.x0;
    const dy = w.bbox.y0 - anchor.bbox.y0;
    return Math.sqrt(dx * dx + dy * dy) < radius;
  });
}

// Returns every occurrence (sorted top to bottom) of a box's number that
// also has its label's keyword nearby — not just the first number-shaped
// token in reading order. A page can contain other OCR artifacts that
// happen to normalize to the same digits (e.g. a stray bracket merged into
// a neighboring character) before the real box number appears; checking
// every candidate instead of only the first avoids locking onto one of
// those false matches and giving up. A W-2c also prints each box number
// twice — once under "Previously reported", once under "Correct
// information" — which this same scan naturally captures both occurrences of.
function findAllAnchors(words, number, keyword) {
  const pattern = new RegExp(`^${number}(?!\\d)`);
  return words
    .filter((w) => pattern.test(normalizeWord(w.text)) && (w.confidence ?? 100) > 40)
    .filter((num) => nearbyWord(words, num, keyword))
    .sort((a, b) => a.bbox.y0 - b.bbox.y0);
}

function findAnchor(words, number, keyword) {
  const [first] = findAllAnchors(words, number, keyword);
  return first ?? null;
}

// Like findAnchor, but for the form's letter-labeled boxes (a–f), which use
// a single-character label instead of a leading number. Returns the first
// match in reading order whose keyword is nearby — sufficient here because,
// unlike digits, a stray letter elsewhere on the page coinciding with both
// the right character and a coincidentally-nearby keyword is rare enough
// not to need findAllAnchors' every-occurrence scan.
function findLetterAnchor(words, letter, keyword) {
  const pattern = new RegExp(`^${letter}$`);
  return words.find((w) => pattern.test(normalizeWord(w.text)) && nearbyWord(words, w, keyword)) ?? null;
}

// Cleans stray OCR punctuation (brackets, quotes, etc.) off the ends of a
// token, checks whether what's left is money-shaped, and reconstructs its
// real decimal value. Every box on these forms prints exactly two decimal
// places, so when OCR drops the tiny "." character — collapsing e.g.
// "152.05" into "15205" — the last two digits are reliably the cents and
// the rest are the dollars, regardless of how many digits precede them.
function parseAmount(rawText) {
  const cleaned = rawText.trim().replace(/^[^0-9$]+/, "").replace(/[^0-9]+$/, "");
  if (!VALUE_PATTERN.test(cleaned)) return null;

  const hasDecimal = cleaned.includes(".");
  const hasComma = cleaned.includes(",");
  const hasDollar = cleaned.startsWith("$");
  const digitsOnly = cleaned.replace(/[^0-9]/g, "");

  let numeric;
  if (hasDecimal) {
    numeric = parseFloat(cleaned.replace(/[$,]/g, ""));
  } else {
    const padded = digitsOnly.padStart(3, "0");
    numeric = parseFloat(`${padded.slice(0, -2)}.${padded.slice(-2)}`);
  }
  if (Number.isNaN(numeric) || numeric < 0 || numeric > VALUE_SANITY_MAX) return null;

  return {
    numeric,
    hasDecimal,
    hasComma,
    hasDollar,
    digitsOnly,
    display: numeric.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
  };
}

// Temporary diagnostic: prints every digit/currency-shaped word near a
// field's anchor, closest first, so we can see why the wrong one got
// picked. Remove once real-world extraction accuracy is confirmed.
function debugFieldCandidates(label, words, anchor, exclude) {
  if (!anchor) {
    console.log(`[analyzeDocument:debug] ${label}: no anchor found on this page`);
    return;
  }
  const candidates = words
    .filter((w) => w !== anchor && !exclude.has(w) && parseAmount(w.text))
    .map((w) => {
      const dx = w.bbox.x0 - anchor.bbox.x0;
      const dy = w.bbox.y0 - anchor.bbox.y0;
      return {
        text: w.text,
        display: parseAmount(w.text).display,
        x0: w.bbox.x0,
        y0: w.bbox.y0,
        dist: Math.round(Math.sqrt(dx * dx + dy * dy)),
      };
    })
    .sort((a, b) => a.dist - b.dist)
    .slice(0, 6);
  console.log(
    `[analyzeDocument:debug] ${label}: anchor="${anchor.text}" @ (${Math.round(anchor.bbox.x0)},${Math.round(anchor.bbox.y0)})`,
  );
  console.table(candidates);
}

// Finds the value (a money-looking number) nearest a field's anchor —
// values sit next to/below their label, so proximity is the same trick
// used to find the label itself, just matched against a number shape
// instead of a known keyword. `exclude` should contain every known
// box-number anchor word AND every value word already claimed by another
// field, so neither a neighboring box's own number label nor a value
// another field already matched can be mistaken for this box's value.
// Returns the matched word (for claiming) plus its formatted display value.
function findNearbyValue(words, anchor, exclude = new Set(), radius = VALUE_RADIUS) {
  let best = null;

  for (const word of words) {
    if (word === anchor || exclude.has(word)) continue;
    const amount = parseAmount(word.text);
    if (!amount) continue;

    const isBareInt = !amount.hasDecimal && !amount.hasComma && !amount.hasDollar;

    // A bare small integer (no $, comma, or decimal) is almost certainly
    // another box's number label, not this field's value.
    if (isBareInt) {
      const plainInt = parseInt(amount.digitsOnly, 10);
      if (plainInt <= BOX_NUMBER_LABEL_MAX) continue;
    }

    const dx = word.bbox.x0 - anchor.bbox.x0;
    const dy = word.bbox.y0 - anchor.bbox.y0;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Bare integers get a tighter leash than decimals: a genuine value
    // whose OCR dropped its decimal point still prints right where the
    // value belongs, but page furniture that happens to be digit-shaped
    // (a year, an unrelated stray number elsewhere on the page) can
    // coincidentally fall anywhere within the more generous VALUE_RADIUS.
    // Capping it to ANCHOR_RADIUS stops that furniture from being treated
    // as a field's value just because nothing better was in range.
    const effectiveRadius = isBareInt ? Math.min(radius, ANCHOR_RADIUS) : radius;
    if (dist >= effectiveRadius) continue;

    // Prefer values that already had an explicit decimal point — they
    // required no reconstruction, so they're more certainly correct. This
    // has to outrank distance, not just break ties: a bare integer that's
    // page furniture (a stray box-number label, the tax year, an
    // instructions reference) can easily sit closer to an anchor than the
    // real decimal amount, and a closer-but-wrong bare integer is worse
    // than a farther-but-right decimal.
    const score = amount.hasDecimal ? 2 : 1;

    if (!best || score > best.score || (score === best.score && dist < best.dist)) {
      best = { word, display: amount.display, dist, score };
    }
  }
  return best;
}

// Walks forward from an anchor's own OCR-detected line to the line window
// this field should read from: skip `skipLines` lines after the anchor's
// line, then take the next `maxLines`. Shared by findNearbyText/
// findNearbyId so both use Tesseract's actual line segmentation instead of
// a guessed pixel line-height — line spacing varies by template/font, so a
// fixed-height window calibrated against one document breaks on another.
// `lines` is restricted to the left column first, since the anchor's own
// line and the lines below it can otherwise interleave (in y-position)
// with unrelated lines from the numbered boxes to the right.
function lineWindowAfter(lines, anchor, { skipLines, maxLines, maxX }) {
  const columnLines = lines.filter((line) => line.bbox.x0 < maxX);
  const anchorIndex = columnLines.indexOf(anchor.line);
  if (anchorIndex === -1) return [];
  const start = anchorIndex + 1 + skipLines;
  return columnLines.slice(start, start + maxLines);
}

// Collects the next few OCR-detected lines after an anchor's line and
// joins them in reading order — used for free-form text fields (names,
// addresses, control numbers) that have no fixed shape to validate
// against, unlike money (findNearbyValue) or ID numbers (findNearbyId).
// `skipLines` lets a field start further down than the line right after
// the anchor (box f borrows box e's anchor this way, to skip past the name
// line and into the address below it).
function findNearbyText(lines, anchor, exclude, { skipLines = 0, maxLines = 1, maxX = TEXT_COLUMN_MAX_X } = {}) {
  const windowLines = lineWindowAfter(lines, anchor, { skipLines, maxLines, maxX })
    // lineWindowAfter already excludes lines whose left edge is past maxX,
    // but a line's bbox is the min over its own words — if Tesseract ever
    // merges a left-column line with stray right-column content (no clear
    // column rule on this form), that line could still have words past
    // maxX. Filtering per-word here, not just per-line, catches that.
    .map((line) => line.words.filter((w) => !exclude.has(w) && w.bbox.x0 < maxX))
    .filter((lineWords) => lineWords.length > 0);
  if (windowLines.length === 0) return null;

  return {
    words: windowLines.flat(),
    display: windowLines
      .map((lineWords) => [...lineWords].sort((a, b) => a.bbox.x0 - b.bbox.x0).map((w) => w.text).join(" "))
      .join("\n"),
  };
}

// Finds a single token shaped like an ID number (SSN/EIN) within an
// anchor's line window: mostly digits, within a digit-count range. A
// dedicated check rather than reusing findNearbyText/findNearbyValue
// because IDs need a strict digit-count match, not a currency shape or
// free-form text.
function findNearbyId(lines, anchor, exclude, { minDigits, maxDigits, skipLines = 0, maxLines = 1, maxX = TEXT_COLUMN_MAX_X }) {
  for (const line of lineWindowAfter(lines, anchor, { skipLines, maxLines, maxX })) {
    for (const word of line.words) {
      if (exclude.has(word) || word.bbox.x0 >= maxX) continue;
      const cleaned = word.text.trim().replace(/^[^0-9]+/, "").replace(/[^0-9-]+$/, "");
      const digitsOnly = cleaned.replace(/[^0-9]/g, "");
      if (digitsOnly.length < minDigits || digitsOnly.length > maxDigits) continue;
      return { word, display: cleaned, digitsOnly };
    }
  }
  return null;
}

// Masks all but the last 4 digits of a Social Security number — this app
// only ever needs to show enough for the user to recognize their own
// document, never the full number.
function maskSSN(digitsOnly) {
  return `***-**-${digitsOnly.slice(-4)}`;
}

// Tries every registered form definition against this page's OCR'd words
// and picks whichever one matched the most anchors — distinct forms use
// distinct number+keyword pairs, so overlapping vocabulary (e.g. "federal"
// appears on both w2 and 1099-nec) doesn't cause cross-matches.
function matchFormDefinition(words, normalizedText) {
  let best = null;
  let bestScore = 0;
  for (const definition of FORM_DEFINITIONS) {
    const anchors = {};
    for (const { fieldId, number, keyword } of definition.fields) {
      const found = findAnchor(words, number, keyword);
      if (found) anchors[fieldId] = found;
    }
    const score = Object.keys(anchors).length;
    if (score > bestScore) {
      bestScore = score;
      best = { definition, anchors };
    }
  }
  if (!best) return null;

  const documentType = best.definition.classify
    ? best.definition.classify(normalizedText)
    : best.definition.type;

  return { documentType, definition: best.definition, anchors: best.anchors };
}

// Resolves a form definition's letter-labeled text fields (boxes a–f) and
// writes their values into `fieldValues`. Separate from the numeric-field
// loop in analyzeCanvas because these use a different anchor lookup
// (findLetterAnchor) and a different value shape (free text or ID, not
// money) — but it's the same for w2 and w2c, so it runs once here for both.
function extractTextFields(words, lines, definition, documentType, fieldValues) {
  const textFields = definition.textFields ?? [];
  const textAnchors = {};
  // Claims every word on an anchor's own line, not just the anchor token —
  // that whole line is a field's printed label, and a label is never a
  // valid value for ANY field. Without this, a field whose own line got
  // merged with a neighboring box's row by Tesseract can walk forward into
  // the next field's label line and mistake it for its own value.
  const claimed = new Set();
  for (const field of textFields) {
    if (field.anchorFrom) continue;
    const anchor = findLetterAnchor(words, field.letter, field.keyword);
    if (anchor) {
      textAnchors[field.fieldId] = anchor;
      for (const w of anchor.line.words) claimed.add(w);
    }
    console.log(
      `[analyzeDocument:debug] ${field.fieldId}: letter anchor ${
        anchor ? `"${anchor.text}" @ (${Math.round(anchor.bbox.x0)},${Math.round(anchor.bbox.y0)})` : "NOT FOUND"
      }`,
    );
  }

  for (const field of textFields) {
    const anchor = textAnchors[field.anchorFrom ?? field.fieldId];
    if (!anchor) continue;

    const opts = { skipLines: field.skipLines ?? 0, maxLines: field.lines ?? 1 };
    let found;
    if (field.kind === "id") {
      const [minDigits, maxDigits] = field.digits;
      found = findNearbyId(lines, anchor, claimed, { ...opts, minDigits, maxDigits });
      if (found) {
        fieldValues[`${documentType}:${field.fieldId}`] =
          field.mask === "ssn" ? maskSSN(found.digitsOnly) : found.display;
      }
    } else {
      found = findNearbyText(lines, anchor, claimed, opts);
      if (found) {
        fieldValues[`${documentType}:${field.fieldId}`] = found.display;
      }
    }
    // Log the masked value actually stored in fieldValues, not found.display —
    // for SSN that's the raw unmasked digits, which has no business in a log.
    const storedValue = fieldValues[`${documentType}:${field.fieldId}`];
    console.log(
      `[analyzeDocument:debug] ${field.fieldId}: value ${storedValue ? JSON.stringify(storedValue) : "NOT FOUND"}`,
    );
  }
}

async function analyzeCanvas(canvas, pageNumber) {
  const worker = await createWorker("eng");
  try {
    const { data } = await worker.recognize(canvas, {}, { blocks: true });
    const text = data.text ?? "";
    const lines = flattenLines(data);
    const words = flattenWords(lines);

    const match = matchFormDefinition(words, normalizeText(text));
    if (!match) {
      console.log(`[analyzeDocument] page ${pageNumber}: no form matched`);
      return null;
    }

    const { documentType, definition, anchors } = match;
    const fieldValues = {};

    console.log(`[analyzeDocument:debug] page ${pageNumber}: all OCR words`);
    console.table(
      words.map((w) => ({
        text: w.text,
        x0: Math.round(w.bbox.x0),
        y0: Math.round(w.bbox.y0),
        confidence: Math.round(w.confidence),
      })),
    );

    // Temporary diagnostic: shows Tesseract's own line grouping directly,
    // since the text-field extraction now walks that structure instead of
    // a guessed pixel line-height — when a field grabs the wrong content,
    // this is the fastest way to see whether it's because two visually
    // distinct rows got merged into one OCR line (or vice versa).
    console.log(`[analyzeDocument:debug] page ${pageNumber}: all OCR lines`);
    console.table(
      lines.map((line) => ({
        text: line.words.map((w) => w.text).join(" "),
        x0: Math.round(line.bbox.x0),
        y0: Math.round(line.bbox.y0),
      })),
    );

    if (documentType === "w2c") {
      // Each box number appears twice on a W-2c, in reading order:
      // "Previously reported" first, then "Correct information" — so the
      // first occurrence's nearby value is the previous amount, the
      // second occurrence's is the corrected one.
      const occurrencesByField = definition.fields.map(({ fieldId, number, keyword }) => ({
        fieldId,
        occurrences: findAllAnchors(words, number, keyword),
      }));
      const claimed = new Set(occurrencesByField.flatMap((f) => f.occurrences));

      for (const { fieldId, occurrences } of occurrencesByField) {
        const [previousAnchor, correctedAnchor] = occurrences;
        debugFieldCandidates(`${fieldId}:previous`, words, previousAnchor, claimed);
        debugFieldCandidates(`${fieldId}:corrected`, words, correctedAnchor, claimed);
        if (previousAnchor) {
          const found = findNearbyValue(words, previousAnchor, claimed);
          if (found) {
            fieldValues[`${documentType}:${fieldId}:previous`] = found.display;
            claimed.add(found.word);
          }
        }
        if (correctedAnchor) {
          const found = findNearbyValue(words, correctedAnchor, claimed);
          if (found) {
            fieldValues[`${documentType}:${fieldId}:corrected`] = found.display;
            claimed.add(found.word);
          }
        }
      }
    } else {
      const claimed = new Set(Object.values(anchors));
      for (const [fieldId, anchor] of Object.entries(anchors)) {
        debugFieldCandidates(fieldId, words, anchor, claimed);
        const found = findNearbyValue(words, anchor, claimed);
        if (found) {
          fieldValues[`${documentType}:${fieldId}`] = found.display;
          claimed.add(found.word);
        }
      }
    }

    extractTextFields(words, lines, definition, documentType, fieldValues);

    const foundFieldIds = Object.keys(anchors).join(",") || "none";
    console.log(`[analyzeDocument] page ${pageNumber}: classified as ${documentType}, fields=${foundFieldIds}`);

    return { documentType, pageNumber, fieldValues };
  } finally {
    await worker.terminate();
  }
}

const NOT_FOUND = { documentType: null, pageNumber: null, fieldValues: {} };

async function analyzePdf(file) {
  let pdf;
  try {
    const buffer = await file.arrayBuffer();
    pdf = await pdfjs.getDocument({ data: buffer }).promise;
  } catch {
    return NOT_FOUND;
  }

  const pages = Math.min(pdf.numPages, MAX_PAGES_TO_SCAN);
  for (let pageNumber = 1; pageNumber <= pages; pageNumber += 1) {
    try {
      const canvas = await renderPageToCanvas(pdf, pageNumber);
      const result = await analyzeCanvas(canvas, pageNumber);
      if (result) return result;
    } catch {
      // Try the next page rather than failing the whole document.
    }
  }

  return NOT_FOUND;
}

async function analyzeImage(file) {
  try {
    const canvas = await renderImageToCanvas(file);
    return (await analyzeCanvas(canvas, 1)) ?? NOT_FOUND;
  } catch {
    return NOT_FOUND;
  }
}

// Runs entirely in-browser; each rendered page/image and its OCR'd text are
// discarded as soon as this function returns, per the project's
// ephemeral-processing rule — nothing is persisted.
export async function analyzeDocument(file) {
  return file.type === "application/pdf" ? analyzePdf(file) : analyzeImage(file);
}
