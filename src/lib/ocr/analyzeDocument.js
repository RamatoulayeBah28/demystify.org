import { createWorker } from "tesseract.js";
import { pdfjs } from "@/lib/pdf/pdfWorker";

// "Previously reported" / "Correct information" are column headers that
// exist ONLY on Form W-2c's corrected layout — a regular W-2 has no reason
// to print them. Used to tell w2 apart from w2c. Deliberately not using the
// OMB number for this (1545-0008 vs 1545-0029, a 2-digit difference) —
// it's been observed to misread in low-quality scan regions, which
// produced real false-positive w2c classifications on actual W-2 pages.
const W2C_PHRASES = ["previously reported", "correct information"];

const RENDER_SCALE = 2;
const MAX_PAGES_TO_SCAN = 5;
// findAnchor's proximity radius, in canvas pixels — kept proportional to
// RENDER_SCALE so it doesn't silently drift if that constant changes.
const ANCHOR_RADIUS = 100 * RENDER_SCALE;

// Template positions (fraction of page) for a standard Form W-2.
// `anchor` is where each box's leading number sits — the same thing
// findAnchor measures on a real document, used to calibrate a per-document
// transform from just two found anchors. `dotOffset` is where the dot
// should actually render relative to that anchor (past the label text),
// expressed in the same normalized units so it scales with the transform.
// box15 is calibration-only — it has no annotation/dot of its own, it's
// just a second reference point far from box1 for a stable scale estimate.
const FIELD_TEMPLATE = {
  box1: { anchor: { x: 0.45, y: 0.078 }, dotOffset: { x: 0.22, y: 0.007 } },
  box2: { anchor: { x: 0.71, y: 0.078 }, dotOffset: { x: 0.21, y: 0.007 } },
  box3: { anchor: { x: 0.45, y: 0.138 }, dotOffset: { x: 0.15, y: 0.007 } },
  box15: { anchor: { x: 0.04, y: 0.42 }, dotOffset: { x: 0, y: 0 } },
};
const DISPLAYABLE_FIELD_IDS = ["box1", "box2", "box3"];

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

function isCorrectedForm(text) {
  const normalized = normalizeText(text);
  return W2C_PHRASES.some((phrase) => normalized.includes(phrase));
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

function transformPoint(point, scaleX, scaleY, dx, dy) {
  return { x: point.x * scaleX + dx, y: point.y * scaleY + dy };
}

// Picks the two found anchors whose template positions differ most in
// BOTH x and y — a pair that only differs along one axis (e.g. box1 and
// box2, which share the same template row) can't determine that axis's
// scale and would divide by ~0.
function bestAnchorPair(foundIds) {
  let best = null;
  let bestScore = 0;
  for (let i = 0; i < foundIds.length; i += 1) {
    for (let j = i + 1; j < foundIds.length; j += 1) {
      const refA = FIELD_TEMPLATE[foundIds[i]].anchor;
      const refB = FIELD_TEMPLATE[foundIds[j]].anchor;
      const score = Math.abs(refB.x - refA.x) * Math.abs(refB.y - refA.y);
      if (score > bestScore) {
        bestScore = score;
        best = [foundIds[i], foundIds[j]];
      }
    }
  }
  return best;
}

// Calibrates a scale+offset transform from whichever 2 anchors were
// actually found on this document, then applies it to every field's
// template position — so box3's dot is placed by geometry, not by
// re-searching for its label text (which is what caused it to get
// mismatched onto box5 in an earlier version of this logic).
function buildFieldPositions(anchors) {
  const foundIds = Object.keys(anchors).filter((id) => FIELD_TEMPLATE[id]);
  if (foundIds.length < 2) return {};

  const pair = bestAnchorPair(foundIds);
  if (!pair) return {};

  const [idA, idB] = pair;
  const realA = anchors[idA];
  const realB = anchors[idB];
  const refA = FIELD_TEMPLATE[idA].anchor;
  const refB = FIELD_TEMPLATE[idB].anchor;

  const scaleX = (realB.x - realA.x) / (refB.x - refA.x);
  const scaleY = (realB.y - realA.y) / (refB.y - refA.y);
  const dx = realA.x - refA.x * scaleX;
  const dy = realA.y - refA.y * scaleY;

  const positions = {};
  for (const fieldId of DISPLAYABLE_FIELD_IDS) {
    const { anchor, dotOffset } = FIELD_TEMPLATE[fieldId];
    const digit = transformPoint(anchor, scaleX, scaleY, dx, dy);
    positions[fieldId] = {
      x: digit.x + dotOffset.x * scaleX,
      y: digit.y + dotOffset.y * scaleY,
    };
  }
  return { positions, calibratedFrom: pair };
}

async function analyzeCanvas(canvas, pageNumber) {
  const worker = await createWorker("eng");
  try {
    const { data } = await worker.recognize(canvas, {}, { blocks: true });
    const text = data.text ?? "";

    // Anchors are the primary signal for "is this page a W-2-family form
    // grid at all" — more reliable than text-matching a title or OMB
    // number, and we need them either way to place the dots.
    const words = flattenWords(data);
    const anchors = {};
    for (const [fieldId, keyword] of [
      ["box1", "wages"],
      ["box2", "federal"],
      ["box15", "state"],
    ]) {
      const number = fieldId.replace("box", "");
      const found = findAnchor(words, number, keyword);
      if (found) {
        anchors[fieldId] = { x: found.bbox.x0 / canvas.width, y: found.bbox.y0 / canvas.height };
      }
    }

    const foundAnchorIds = Object.keys(anchors).join(",") || "none";
    console.log(`[analyzeDocument] page ${pageNumber}: anchors=${foundAnchorIds}`);

    const built = buildFieldPositions(anchors);
    if (!built.positions) {
      console.log(`[analyzeDocument] page ${pageNumber}: not enough anchors to calibrate, rejecting page`);
      return null;
    }

    const documentType = isCorrectedForm(text) ? "w2c" : "w2";
    console.log(
      `[analyzeDocument] page ${pageNumber}: classified as ${documentType}, calibrated from ${built.calibratedFrom.join("+")}`,
    );

    const fieldPositions = {};
    for (const [fieldId, point] of Object.entries(built.positions)) {
      fieldPositions[`${documentType}:${fieldId}`] = point;
    }

    return { documentType, pageNumber, fieldPositions };
  } finally {
    await worker.terminate();
  }
}

const NOT_FOUND = { documentType: null, pageNumber: null, fieldPositions: {} };

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
