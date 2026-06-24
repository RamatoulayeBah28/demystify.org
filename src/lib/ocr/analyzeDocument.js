import { createWorker } from "tesseract.js";
import { pdfjs } from "@/lib/pdf/pdfWorker";
import { FORM_DEFINITIONS } from "./formDefinitions";

const RENDER_SCALE = 2;
const MAX_PAGES_TO_SCAN = 5;
// findAnchor's proximity radius, in canvas pixels — kept proportional to
// RENDER_SCALE so it doesn't silently drift if that constant changes.
const ANCHOR_RADIUS = 100 * RENDER_SCALE;
// Values usually sit a bit further from the label than the label's own
// keyword does, so this is a bit more generous than ANCHOR_RADIUS.
const VALUE_RADIUS = ANCHOR_RADIUS * 1.5;
// Match currency amounts: optional $, digits with optional commas, optional decimal.
// Rejects numbers > 999999 (unlikely for W-2 values) and prefers decimals.
const VALUE_PATTERN = /^\$?[\d,]+(\.\d{1,2})?$/;
const VALUE_SANITY_MAX = 999999;

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

function flattenWords(page) {
  const words = [];
  for (const block of page.blocks ?? []) {
    for (const paragraph of block.paragraphs ?? []) {
      for (const line of paragraph.lines ?? []) {
        for (const word of line.words ?? []) {
          words.push({ text: word.text, bbox: word.bbox, confidence: word.confidence ?? 0 });
        }
      }
    }
  }
  return words;
}

// Prefix match, not exact equality — OCR sometimes merges a box's leading
// number with the start of its label into one word (e.g. "1Wages") when
// kerning is tight, and an exact "1" === "1Wages" check would miss that.
function findWord(words, number) {
  const pattern = new RegExp(`^${number}(?!\\d)`);
  return words.find((w) => pattern.test(normalizeWord(w.text)) && (w.confidence ?? 100) > 40);
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

function findAnchor(words, number, keyword) {
  const num = findWord(words, number);
  if (!num) return null;
  return nearbyWord(words, num, keyword) ? num : null;
}

// Like findAnchor, but returns every matching occurrence (sorted top to
// bottom) instead of just the first. A W-2c prints each box number twice —
// once under "Previously reported", once under "Correct information" — so
// finding only the first occurrence (what findAnchor does) silently grabs
// whichever value sits nearest to that first instance and mislabels it.
function findAllAnchors(words, number, keyword) {
  const pattern = new RegExp(`^${number}(?!\\d)`);
  return words
    .filter((w) => pattern.test(normalizeWord(w.text)) && (w.confidence ?? 100) > 40)
    .filter((num) => nearbyWord(words, num, keyword))
    .sort((a, b) => a.bbox.y0 - b.bbox.y0);
}

// The form prints every box's own number as a bare label (e.g. "3" right
// next to box 3) — those are unambiguous, real box numbers, always small.
// A bare candidate at or below this is almost certainly a stray label, not
// a real wage/withholding amount, which essentially never prints bare and
// this small.
const BOX_NUMBER_LABEL_MAX = 20;

// Temporary diagnostic: prints every digit/currency-shaped word near a
// field's anchor, closest first, so we can see why the wrong one got
// picked. Remove once real-world extraction accuracy is confirmed.
function debugFieldCandidates(label, words, anchor, exclude) {
  if (!anchor) {
    console.log(`[analyzeDocument:debug] ${label}: no anchor found on this page`);
    return;
  }
  const candidates = words
    .filter((w) => w !== anchor && !exclude.has(w) && VALUE_PATTERN.test(w.text.trim()))
    .map((w) => {
      const dx = w.bbox.x0 - anchor.bbox.x0;
      const dy = w.bbox.y0 - anchor.bbox.y0;
      return { text: w.text, x0: w.bbox.x0, y0: w.bbox.y0, dist: Math.round(Math.sqrt(dx * dx + dy * dy)) };
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
// box-number anchor word (across all fields, not just this one) so a
// neighboring box's own number label is never mistaken for this box's value.
function findNearbyValue(words, anchor, exclude = new Set(), radius = VALUE_RADIUS) {
  let best = null;
  let bestDist = Infinity;
  let bestScore = 0; // Prefer decimals (score: 2) over whole numbers (score: 1)

  for (const word of words) {
    if (word === anchor || exclude.has(word)) continue;
    const trimmed = word.text.trim();
    if (!VALUE_PATTERN.test(trimmed)) continue;

    // Parse numeric value for sanity checks
    const numericStr = trimmed.replace(/[\$,]/g, "");
    const numeric = parseFloat(numericStr);

    // Reject values outside reasonable range for tax document amounts
    if (numeric > VALUE_SANITY_MAX || numeric < 0) continue;

    // A bare small integer (no $, comma, or decimal) is almost certainly
    // another box's number label, not this field's value.
    const hasDecimal = trimmed.includes(".");
    const hasComma = trimmed.includes(",");
    const hasDollar = trimmed.startsWith("$");
    if (!hasDecimal && !hasComma && !hasDollar && numeric <= BOX_NUMBER_LABEL_MAX) continue;

    // Score preference: decimals are more reliable than whole numbers
    const score = hasDecimal ? 2 : 1;
    
    const dx = word.bbox.x0 - anchor.bbox.x0;
    const dy = word.bbox.y0 - anchor.bbox.y0;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist < radius && (dist < bestDist || (dist === bestDist && score > bestScore))) {
      best = trimmed;
      bestDist = dist;
      bestScore = score;
    }
  }
  return best;
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

async function analyzeCanvas(canvas, pageNumber) {
  const worker = await createWorker("eng");
  try {
    const { data } = await worker.recognize(canvas, {}, { blocks: true });
    const text = data.text ?? "";
    const words = flattenWords(data);

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

    if (documentType === "w2c") {
      // Each box number appears twice on a W-2c, in reading order:
      // "Previously reported" first, then "Correct information" — so the
      // first occurrence's nearby value is the previous amount, the
      // second occurrence's is the corrected one.
      const occurrencesByField = definition.fields.map(({ fieldId, number, keyword }) => ({
        fieldId,
        occurrences: findAllAnchors(words, number, keyword),
      }));
      const allAnchorWords = new Set(occurrencesByField.flatMap((f) => f.occurrences));

      for (const { fieldId, occurrences } of occurrencesByField) {
        const [previousAnchor, correctedAnchor] = occurrences;
        debugFieldCandidates(`${fieldId}:previous`, words, previousAnchor, allAnchorWords);
        debugFieldCandidates(`${fieldId}:corrected`, words, correctedAnchor, allAnchorWords);
        if (previousAnchor) {
          fieldValues[`${documentType}:${fieldId}:previous`] = findNearbyValue(words, previousAnchor, allAnchorWords);
        }
        if (correctedAnchor) {
          fieldValues[`${documentType}:${fieldId}:corrected`] = findNearbyValue(words, correctedAnchor, allAnchorWords);
        }
      }
    } else {
      const allAnchorWords = new Set(Object.values(anchors));
      for (const [fieldId, anchor] of Object.entries(anchors)) {
        debugFieldCandidates(fieldId, words, anchor, allAnchorWords);
        fieldValues[`${documentType}:${fieldId}`] = findNearbyValue(words, anchor, allAnchorWords);
      }
    }

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
