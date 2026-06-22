import w2 from "./w2.json";
import w2Layout from "./layouts/w2.json";

const LIBRARIES = {
  w2,
};

const LAYOUTS = {
  w2: w2Layout,
};

// key is the full "docType:fieldId" form (e.g. "w2:box1"), matching how
// the annotation JSON itself is keyed.
export function getAnnotation(key) {
  const docType = key.split(":")[0];
  return LIBRARIES[docType]?.[key] ?? null;
}

// Returns the full "docType:fieldId" keys (e.g. "w2:box1"), not bare ids.
export function getFieldIds(docType) {
  const lib = LIBRARIES[docType];
  return lib ? Object.keys(lib) : [];
}

// Fallback anchor points (fraction of page, 0-1) for when OCR can't locate
// a field's label on the actual uploaded document — a rough guess based on
// the standard Form W-2 template, not derived from OCR.
export function getLayout(docType) {
  return LAYOUTS[docType] ?? null;
}
