import w2 from "./w2.json";
import w2c from "./w2c.json";
import nec1099 from "./1099-nec.json";
import int1099 from "./1099-int.json";
import g1099 from "./1099-g.json";
import r1099 from "./1099-r.json";
import ssa1099 from "./ssa-1099.json";
import t1098 from "./1098-t.json";
import misc1099 from "./1099-misc.json";

const LIBRARIES = {
  w2,
  w2c,
  "1099-nec": nec1099,
  "1099-int": int1099,
  "1099-g": g1099,
  "1099-r": r1099,
  "ssa-1099": ssa1099,
  "1098-t": t1098,
  "1099-misc": misc1099,
};

// key is the full "docType:fieldId" form (e.g. "w2:box1"), matching how
// the annotation JSON itself is keyed.
export function getAnnotation(key) {
  const docType = key.split(":")[0];
  return LIBRARIES[docType]?.[key] ?? null;
}
