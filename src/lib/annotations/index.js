import w2 from "./w2.json";
import w2c from "./w2c.json";
import nec1099 from "./1099-nec.json";
import int1099 from "./1099-int.json";
import g1099 from "./1099-g.json";
import r1099 from "./1099-r.json";
import ssa1099 from "./ssa-1099.json";
import t1098 from "./1098-t.json";
import misc1099 from "./1099-misc.json";
import w4 from "./w4.json";
import es1040 from "./1040-es.json";
import w9 from "./w9.json";
import t4506 from "./4506-t.json";
import installmentAgreement from "./9465.json";
import ss4 from "./ss-4.json";
import w7 from "./w7.json";
import form1040 from "./1040.json";
import schedule1 from "./schedule-1.json";
import schedule1A from "./schedule-1-a.json";
import schedule2 from "./schedule-2.json";
import schedule3 from "./schedule-3.json";
import form941 from "./941.json";

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
  w4,
  "1040-es": es1040,
  w9,
  "4506-t": t4506,
  "9465": installmentAgreement,
  "ss-4": ss4,
  w7,
  "1040": form1040,
  "schedule-1": schedule1,
  "schedule-1-a": schedule1A,
  "schedule-2": schedule2,
  "schedule-3": schedule3,
  "941": form941,
};

// 1040-SR is the exact same return as 1040, just printed in larger type
// for older filers — same lines, same meanings — so it reuses 1040's
// annotations rather than maintaining a duplicate translation file that
// could drift out of sync with the original during review.
const DOC_TYPE_ALIASES = { "1040-sr": "1040" };

// key is the full "docType:fieldId" form (e.g. "w2:box1"), matching how
// the annotation JSON itself is keyed.
export function getAnnotation(key) {
  const [rawType, ...rest] = key.split(":");
  const docType = DOC_TYPE_ALIASES[rawType] ?? rawType;
  const lookupKey = docType === rawType ? key : `${docType}:${rest.join(":")}`;
  return LIBRARIES[docType]?.[lookupKey] ?? null;
}
