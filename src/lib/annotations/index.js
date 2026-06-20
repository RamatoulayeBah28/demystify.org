import w2 from "./w2.json";

const LIBRARIES = {
  w2,
};

export function getAnnotation(docType, fieldId) {
  const key = `${docType}:${fieldId}`;
  return LIBRARIES[docType]?.[key] ?? null;
}
