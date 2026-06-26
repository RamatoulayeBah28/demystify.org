import w2 from "./w2.json";
import w2c from "./w2c.json";
import nec1099 from "./1099-nec.json";

const LIBRARIES = {
  w2,
  w2c,
  "1099-nec": nec1099,
};

// key is the full "docType:fieldId" form (e.g. "w2:box1"), matching how
// the annotation JSON itself is keyed.
export function getAnnotation(key) {
  const docType = key.split(":")[0];
  return LIBRARIES[docType]?.[key] ?? null;
}
