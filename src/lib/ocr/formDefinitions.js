// Each entry describes how to recognize a form and which fields to look
// for. `number`/`keyword` are matched the same way as the W-2 anchors
// always were: a box's leading number, near a distinctive word from its
// label — both fixed by the form's own template regardless of the values
// printed in them. Adding a new form is just a new entry here plus its
// annotation content in src/lib/annotations/<type>.json.
export const FORM_DEFINITIONS = [
  {
    type: "w2",
    fields: [
      { fieldId: "box1", number: "1", keyword: "wages" },
      { fieldId: "box2", number: "2", keyword: "federal" },
      { fieldId: "box3", number: "3", keyword: "social" },
      { fieldId: "box4", number: "4", keyword: "social" },
      { fieldId: "box5", number: "5", keyword: "medicare" },
      { fieldId: "box6", number: "6", keyword: "medicare" },
      { fieldId: "box16", number: "16", keyword: "state" },
      { fieldId: "box17", number: "17", keyword: "state" },
    ],
    // Boxes a–f use a single-letter label instead of a leading number, and
    // hold free-form text (names, addresses, ID numbers) rather than a
    // money amount — so they're matched and extracted differently (see
    // findLetterAnchor/findNearbyText/findNearbyId in analyzeDocument.js).
    // `digits` bounds are deliberately lenient where OCR misreads a digit
    // count (EIN), and strict where a false positive would expose the
    // wrong sensitive value (SSN).
    textFields: [
      { fieldId: "boxA", letter: "a", keyword: "social", kind: "id", digits: [9, 9], mask: "ssn" },
      { fieldId: "boxB", letter: "b", keyword: "identification", kind: "id", digits: [8, 10] },
      { fieldId: "boxC", letter: "c", keyword: "address", kind: "text", lines: 3 },
      { fieldId: "boxD", letter: "d", keyword: "control", kind: "text", lines: 1 },
      { fieldId: "boxE", letter: "e", keyword: "first", kind: "text", lines: 1 },
      // Box f (employee address) doesn't reliably print its own letter
      // right where the address starts — some templates have none at all
      // (it's just the continuation of box e's box, below the name line),
      // others print "f Employee's address and ZIP code" as a trailing
      // caption AFTER the address. So boxF always borrows box e's anchor
      // to read its value, and this entry — if a literal "f" exists on the
      // page — exists purely to get that trailing caption's line claimed,
      // so boxF's own capture below doesn't absorb it as if it were part
      // of the address.
      { fieldId: "boxFLabel", letter: "f", keyword: "address", kind: "text", lines: 0 },
      { fieldId: "boxF", anchorFrom: "boxE", kind: "text", lines: 3, skipLines: 1 },
    ],
    // "Previously reported" / "Correct information" are column headers
    // that exist ONLY on Form W-2c's corrected layout. A regular W-2 has
    // no reason to print them, and they're far more OCR-reliable than the
    // OMB number (1545-0008 vs 1545-0029, a 2-digit difference that's
    // been observed to misread in low-quality scan regions).
    // W-2c uses this exact same field set — same template, just classified
    // differently below — so it doesn't need its own duplicate entry here.
    classify: (normalizedText) =>
      ["previously reported", "correct information"].some((phrase) =>
        normalizedText.includes(phrase),
      )
        ? "w2c"
        : "w2",
  },
  {
    type: "1099-nec",
    fields: [
      { fieldId: "box1", number: "1", keyword: "nonemployee" },
      { fieldId: "box4", number: "4", keyword: "federal" },
    ],
  },
];
