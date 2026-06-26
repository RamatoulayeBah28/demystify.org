// Single source of truth for which document types this app has a built
// template for, and which fields to ask the extraction model for on each.
// Adding a new document type is: add an entry here, add its annotation
// JSON in src/lib/annotations/, and build its viewer template — no anchor
// matching, no per-template OCR tuning.
export const DOCUMENT_TYPES = {
  w2: {
    title: "Form W-2, Wage and Tax Statement",
    fields: {
      box1: "Box 1: Wages, tips, other compensation — dollar amount",
      box2: "Box 2: Federal income tax withheld — dollar amount",
      box3: "Box 3: Social security wages — dollar amount",
      box4: "Box 4: Social security tax withheld — dollar amount",
      box5: "Box 5: Medicare wages and tips — dollar amount",
      box6: "Box 6: Medicare tax withheld — dollar amount",
      box16: "Box 16: State wages, tips, etc. — dollar amount",
      box17: "Box 17: State income tax — dollar amount",
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
    // Boxes 1-6 print twice on this form — once under "Previously
    // reported", once under "Correct information" — so each gets a
    // _previous and _corrected key instead of one value.
    correctedFields: ["box1", "box2", "box3", "box4", "box5", "box6"],
    correctedFieldLabels: {
      box1: "Box 1: Wages, tips, other compensation",
      box2: "Box 2: Federal income tax withheld",
      box3: "Box 3: Social security wages",
      box4: "Box 4: Social security tax withheld",
      box5: "Box 5: Medicare wages and tips",
      box6: "Box 6: Medicare tax withheld",
    },
    fields: {
      boxA: "Box a: Employee's SSN — return ONLY the last 4 digits, formatted exactly as ***-**-1234",
      boxB: "Box b: Employer identification number (EIN)",
      boxC: "Box c: Employer's name, address, and ZIP code — multiple lines joined with \\n",
      boxE: "Box e: Employee's first and last name",
    },
  },
  "1099-nec": {
    title: "Form 1099-NEC, Nonemployee Compensation",
    fields: {
      box1: "Box 1: Nonemployee compensation — dollar amount",
      box4: "Box 4: Federal income tax withheld — dollar amount",
      payerInfo: "Payer's name and address ONLY (not the TIN) — multiple lines joined with \\n",
      payerTin: "Payer's TIN",
      recipientName: "Recipient's full name",
      recipientTin: "Recipient's TIN — return ONLY the last 4 digits, formatted as ***-**-1234",
    },
  },
  "1099-int": {
    title: "Form 1099-INT, Interest Income",
    fields: {
      box1: "Box 1: Interest income — dollar amount",
      box2: "Box 2: Early withdrawal penalty — dollar amount",
      box4: "Box 4: Federal income tax withheld — dollar amount",
      box8: "Box 8: Tax-exempt interest — dollar amount",
      payerInfo: "Payer's name and address ONLY (not the TIN) — multiple lines joined with \\n",
      payerTin: "Payer's TIN",
      recipientName: "Recipient's full name",
      recipientTin: "Recipient's TIN — return ONLY the last 4 digits, formatted as ***-**-1234",
    },
  },
  "1099-g": {
    title: "Form 1099-G, Certain Government Payments",
    fields: {
      box1: "Box 1: Unemployment compensation — dollar amount",
      box2: "Box 2: State or local income tax refunds, credits, or offsets — dollar amount",
      box4: "Box 4: Federal income tax withheld — dollar amount",
      box11: "Box 11: State income tax withheld — dollar amount",
      payerInfo: "Payer's name and address (the government agency) — multiple lines joined with \\n",
      recipientName: "Recipient's full name",
      recipientTin: "Recipient's TIN — return ONLY the last 4 digits, formatted as ***-**-1234",
    },
  },
  "1099-r": {
    title: "Form 1099-R, Distributions From Pensions, Annuities, Retirement, etc.",
    fields: {
      box1: "Box 1: Gross distribution — dollar amount",
      box2a: "Box 2a: Taxable amount — dollar amount",
      box4: "Box 4: Federal income tax withheld — dollar amount",
      box7: "Box 7: Distribution code(s) — as printed, e.g. \"7\" or \"1\"",
      payerInfo: "Payer's name and address ONLY (not the TIN) — multiple lines joined with \\n",
      payerTin: "Payer's TIN",
      recipientName: "Recipient's full name",
      recipientTin: "Recipient's TIN — return ONLY the last 4 digits, formatted as ***-**-1234",
    },
  },
  "ssa-1099": {
    title: "Form SSA-1099, Social Security Benefit Statement",
    fields: {
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
    fields: {
      box1: "Box 1: Payments received for qualified tuition and related expenses — dollar amount",
      box5: "Box 5: Scholarships or grants — dollar amount",
      payerInfo: "Filer's name and address (the school) — multiple lines joined with \\n",
      recipientName: "Student's full name",
      recipientTin: "Student's TIN — return ONLY the last 4 digits, formatted as ***-**-1234",
    },
  },
  "1099-misc": {
    title: "Form 1099-MISC, Miscellaneous Information",
    fields: {
      box1: "Box 1: Rents — dollar amount",
      box3: "Box 3: Other income — dollar amount",
      box4: "Box 4: Federal income tax withheld — dollar amount",
      payerInfo: "Payer's name and address ONLY (not the TIN) — multiple lines joined with \\n",
      payerTin: "Payer's TIN",
      recipientName: "Recipient's full name",
      recipientTin: "Recipient's TIN — return ONLY the last 4 digits, formatted as ***-**-1234",
    },
  },
};

export const SUPPORTED_TYPES = new Set(Object.keys(DOCUMENT_TYPES));
