// Single source of truth for which document types this app has a built
// template for, and which fields to ask the extraction model for on each.
// Adding a new document type is: add an entry here, add its annotation
// JSON in src/lib/annotations/, and build its viewer template — no anchor
// matching, no per-template OCR tuning.
//
// Field lists aim to cover every box that commonly carries a value for an
// ordinary individual filer, not literally every box the IRS has ever
// defined — a few genuinely rare/niche boxes (fishing boat proceeds,
// foreign tax paid, bond CUSIP numbers, etc.) are skipped per-form, noted
// inline. Pure identifier fields (not a dollar amount or status) are
// skipped too since there's nothing to "explain" about a reference number.
export const DOCUMENT_TYPES = {
  w2: {
    title: "Form W-2, Wage and Tax Statement",
    fields: {
      taxYear: "The tax year printed on the form, e.g. \"2025\" — usually large, next to the form title",
      box1: "Box 1: Wages, tips, other compensation — dollar amount",
      box2: "Box 2: Federal income tax withheld — dollar amount",
      box3: "Box 3: Social security wages — dollar amount",
      box4: "Box 4: Social security tax withheld — dollar amount",
      box5: "Box 5: Medicare wages and tips — dollar amount",
      box6: "Box 6: Medicare tax withheld — dollar amount",
      box7: "Box 7: Social security tips — dollar amount",
      box8: "Box 8: Allocated tips — dollar amount",
      // Box 9 is unused on current W-2s (a historical pilot box) — skipped.
      box10: "Box 10: Dependent care benefits — dollar amount",
      box11: "Box 11: Nonqualified plans — dollar amount",
      // Box 12 has up to 4 letter-code + amount lines; code and amount are
      // extracted separately per slot since the code changes the meaning —
      // see src/lib/box12Codes.js for the explanation lookup.
      box12a_code: "Box 12a: the letter code only (e.g. \"D\", \"DD\"), or omit if blank",
      box12a_amount: "Box 12a: the dollar amount next to that code, or omit if blank",
      box12b_code: "Box 12b: the letter code only, or omit if blank",
      box12b_amount: "Box 12b: the dollar amount next to that code, or omit if blank",
      box12c_code: "Box 12c: the letter code only, or omit if blank",
      box12c_amount: "Box 12c: the dollar amount next to that code, or omit if blank",
      box12d_code: "Box 12d: the letter code only, or omit if blank",
      box12d_amount: "Box 12d: the dollar amount next to that code, or omit if blank",
      // Box 13 is three checkboxes, not a value — return which ones (if
      // any) are checked, comma-separated, e.g. "Retirement plan".
      box13: "Box 13: which of \"Statutory employee\", \"Retirement plan\", \"Third-party sick pay\" are checked — comma-separated, or omit if none are checked",
      box14: "Box 14: Other — the description and amount as printed, e.g. \"Union dues 250.00\"",
      box15: "Box 15: State and Employer's state ID number together, e.g. \"MN 8339844\"",
      box16: "Box 16: State wages, tips, etc. — dollar amount",
      box17: "Box 17: State income tax — dollar amount",
      box18: "Box 18: Local wages, tips, etc. — dollar amount",
      box19: "Box 19: Local income tax — dollar amount",
      box20: "Box 20: Locality name",
      boxA: "Box a: Employee's SSN — return ONLY the last 4 digits, formatted exactly as ***-**-1234",
      boxB: "Box b: Employer identification number (EIN)",
      boxC: "Box c: Employer's name, address, and ZIP code — multiple lines joined with \\n",
      boxD: "Box d: Control number",
      boxE: "Box e: Employee's first and last name",
      boxF: "Box f: Employee's address and ZIP code — multiple lines joined with \\n",
    },
  },
  w2c: {
    title: "Form W-2c, Corrected Wage and Tax Statement",
    // These boxes print twice on this form — once under "Previously
    // reported", once under "Correct information" — so each gets a
    // _previous and _corrected key instead of one value. Boxes 12/13
    // (codes/checkboxes) are excluded from corrections here — combining
    // the box-12 code lookup with previous/corrected pairs is a lot of
    // added complexity for a box that's rarely the one being corrected.
    correctedFields: [
      "box1", "box2", "box3", "box4", "box5", "box6", "box7", "box8",
      "box10", "box11", "box14", "box15", "box16", "box17", "box18", "box19", "box20",
    ],
    correctedFieldLabels: {
      box1: "Box 1: Wages, tips, other compensation",
      box2: "Box 2: Federal income tax withheld",
      box3: "Box 3: Social security wages",
      box4: "Box 4: Social security tax withheld",
      box5: "Box 5: Medicare wages and tips",
      box6: "Box 6: Medicare tax withheld",
      box7: "Box 7: Social security tips",
      box8: "Box 8: Allocated tips",
      box10: "Box 10: Dependent care benefits",
      box11: "Box 11: Nonqualified plans",
      box14: "Box 14: Other",
      box15: "Box 15: State and Employer's state ID number",
      box16: "Box 16: State wages, tips, etc.",
      box17: "Box 17: State income tax",
      box18: "Box 18: Local wages, tips, etc.",
      box19: "Box 19: Local income tax",
      box20: "Box 20: Locality name",
    },
    fields: {
      taxYear: "The tax year printed on the form, e.g. \"2025\" — usually large, next to the form title",
      boxA: "Box a: Employee's SSN — return ONLY the last 4 digits, formatted exactly as ***-**-1234",
      boxB: "Box b: Employer identification number (EIN)",
      boxC: "Box c: Employer's name, address, and ZIP code — multiple lines joined with \\n",
      boxE: "Box e: Employee's first and last name",
    },
  },
  "1099-nec": {
    title: "Form 1099-NEC, Nonemployee Compensation",
    fields: {
      taxYear: "The tax year printed on the form, e.g. \"2025\" — usually large, next to the form title",
      box1: "Box 1: Nonemployee compensation — dollar amount",
      box2: "Box 2: \"Yes\" if the payer made direct sales of $5,000+ to you for resale, otherwise omit",
      box4: "Box 4: Federal income tax withheld — dollar amount",
      box5: "Box 5: State tax withheld — dollar amount",
      box6: "Box 6: State and payer's state number together, e.g. \"MN 12345\"",
      box7: "Box 7: State income — dollar amount",
      payerInfo: "Payer's name and address ONLY (not the TIN) — multiple lines joined with \\n",
      payerTin: "Payer's TIN",
      recipientName: "Recipient's full name",
      recipientTin: "Recipient's TIN — return ONLY the last 4 digits, formatted as ***-**-1234",
    },
  },
  "1099-int": {
    title: "Form 1099-INT, Interest Income",
    // Skips boxes 6/7 (foreign tax/country) and 12/14 (bond premium on
    // Treasury obligations; CUSIP number) as too niche for this audience.
    fields: {
      taxYear: "The tax year printed on the form, e.g. \"2025\" — usually large, next to the form title",
      box1: "Box 1: Interest income — dollar amount",
      box2: "Box 2: Early withdrawal penalty — dollar amount",
      box3: "Box 3: Interest on U.S. Savings Bonds and Treasury obligations — dollar amount",
      box4: "Box 4: Federal income tax withheld — dollar amount",
      box5: "Box 5: Investment expenses — dollar amount",
      box8: "Box 8: Tax-exempt interest — dollar amount",
      box9: "Box 9: Specified private activity bond interest — dollar amount",
      box10: "Box 10: Market discount — dollar amount",
      box11: "Box 11: Bond premium — dollar amount",
      box13: "Box 13: Bond premium on tax-exempt bond — dollar amount",
      box15: "Box 15: State and state identification number together, e.g. \"MN 12345\"",
      box17: "Box 17: State tax withheld — dollar amount",
      payerInfo: "Payer's name and address ONLY (not the TIN) — multiple lines joined with \\n",
      payerTin: "Payer's TIN",
      recipientName: "Recipient's full name",
      recipientTin: "Recipient's TIN — return ONLY the last 4 digits, formatted as ***-**-1234",
    },
  },
  "1099-g": {
    title: "Form 1099-G, Certain Government Payments",
    // Skips box 3 (just states which tax year box 2 applies to, not a
    // value) and box 8 (a checkbox, rarely relevant for this audience).
    fields: {
      taxYear: "The tax year printed on the form, e.g. \"2025\" — usually large, next to the form title",
      box1: "Box 1: Unemployment compensation — dollar amount",
      box2: "Box 2: State or local income tax refunds, credits, or offsets — dollar amount",
      box4: "Box 4: Federal income tax withheld — dollar amount",
      box5: "Box 5: RTAA payments — dollar amount",
      box6: "Box 6: Taxable grants — dollar amount",
      box7: "Box 7: Agriculture payments — dollar amount",
      box9: "Box 9: Market gain — dollar amount",
      box10: "Box 10a/10b: State and state identification number together, e.g. \"MN 12345\"",
      box11: "Box 11: State income tax withheld — dollar amount",
      payerInfo: "Payer's name and address (the government agency) — multiple lines joined with \\n",
      recipientName: "Recipient's full name",
      recipientTin: "Recipient's TIN — return ONLY the last 4 digits, formatted as ***-**-1234",
    },
  },
  "1099-r": {
    title: "Form 1099-R, Distributions From Pensions, Annuities, Retirement, etc.",
    // Skips boxes 6/8-13/15/17-19 (net unrealized appreciation, IRR
    // allocation, Roth first-year, FATCA, date of payment, local tax
    // info) as too niche for this audience's typical filings.
    fields: {
      taxYear: "The tax year printed on the form, e.g. \"2025\" — usually large, next to the form title",
      box1: "Box 1: Gross distribution — dollar amount",
      box2a: "Box 2a: Taxable amount — dollar amount",
      box2b: "Box 2b: which of \"Taxable amount not determined\", \"Total distribution\" are checked — comma-separated, or omit if neither",
      box3: "Box 3: Capital gain — dollar amount",
      box4: "Box 4: Federal income tax withheld — dollar amount",
      box5: "Box 5: Employee contributions/Designated Roth contributions or insurance premiums — dollar amount",
      box7: "Box 7: Distribution code(s) — as printed, e.g. \"7\" or \"1\"",
      box14: "Box 14: State tax withheld — dollar amount",
      box16: "Box 16: State distribution — dollar amount",
      payerInfo: "Payer's name and address ONLY (not the TIN) — multiple lines joined with \\n",
      payerTin: "Payer's TIN",
      recipientName: "Recipient's full name",
      recipientTin: "Recipient's TIN — return ONLY the last 4 digits, formatted as ***-**-1234",
    },
  },
  "ssa-1099": {
    title: "Form SSA-1099, Social Security Benefit Statement",
    fields: {
      taxYear: "The tax year printed on the form, e.g. \"2025\" — usually large, next to the form title",
      box3: "Box 3: Total benefits paid in the tax year — dollar amount",
      box4: "Box 4: Benefits repaid to the SSA in the tax year — dollar amount",
      box5: "Box 5: Net benefits (box 3 minus box 4) — dollar amount",
      box6: "Box 6: Voluntary federal income tax withheld — dollar amount",
      recipientName: "Box 1: Beneficiary's full name",
      recipientTin: "Box 2: Beneficiary's Social Security number — return ONLY the last 4 digits, formatted as ***-**-1234",
    },
  },
  "1098-t": {
    title: "Form 1098-T, Tuition Statement",
    // Boxes 2 and 3 are reserved/unused per current IRS instructions —
    // skipped.
    fields: {
      taxYear: "The tax year printed on the form, e.g. \"2025\" — usually large, next to the form title",
      box1: "Box 1: Payments received for qualified tuition and related expenses — dollar amount",
      box4: "Box 4: Adjustments made for a prior year — dollar amount",
      box5: "Box 5: Scholarships or grants — dollar amount",
      box6: "Box 6: Adjustments to scholarships or grants for a prior year — dollar amount",
      box789: "Boxes 7/8/9: which of \"At least half-time student\", \"Graduate student\" are checked — comma-separated, or omit if neither",
      box10: "Box 10: Insurance contract reimbursement or refund — dollar amount",
      payerInfo: "Filer's name and address (the school) — multiple lines joined with \\n",
      recipientName: "Student's full name",
      recipientTin: "Student's TIN — return ONLY the last 4 digits, formatted as ***-**-1234",
    },
  },
  "1099-misc": {
    title: "Form 1099-MISC, Miscellaneous Information",
    // Skips boxes 5/9/13/14/15 (fishing boat proceeds, crop insurance,
    // FATCA, golden parachute payments, nonqualified deferred comp) as
    // too niche for this audience.
    fields: {
      taxYear: "The tax year printed on the form, e.g. \"2025\" — usually large, next to the form title",
      box1: "Box 1: Rents — dollar amount",
      box2: "Box 2: Royalties — dollar amount",
      box3: "Box 3: Other income — dollar amount",
      box4: "Box 4: Federal income tax withheld — dollar amount",
      box6: "Box 6: Medical and health care payments — dollar amount",
      box8: "Box 8: Substitute payments in lieu of dividends or interest — dollar amount",
      box10: "Box 10: Gross proceeds paid to an attorney — dollar amount",
      box16: "Box 16: State tax withheld — dollar amount",
      box17: "Box 17: State and payer's state number together, e.g. \"MN 12345\"",
      box18: "Box 18: State income — dollar amount",
      payerInfo: "Payer's name and address ONLY (not the TIN) — multiple lines joined with \\n",
      payerTin: "Payer's TIN",
      recipientName: "Recipient's full name",
      recipientTin: "Recipient's TIN — return ONLY the last 4 digits, formatted as ***-**-1234",
    },
  },
};

export const SUPPORTED_TYPES = new Set(Object.keys(DOCUMENT_TYPES));
