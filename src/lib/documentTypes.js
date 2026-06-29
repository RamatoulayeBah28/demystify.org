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
// 1040 and 1040-SR are the same return, line-for-line — 1040-SR just uses
// larger print for older filers — so they share this field list rather
// than risking the two drifting out of sync if edited separately.
// Skips: the dependents table (a list, not a single line — a known gap),
// the digital-assets question, standard-deduction/age/blindness
// checkboxes, line 13a (QBI deduction), and Schedule 2's niche AMT detail
// — all lower-value for this audience than the lines below.
const FORM_1040_FIELDS = {
  taxYear: "The tax year printed on the form, e.g. \"2025\"",
  name: "Your first and last name",
  ssn: "Your SSN — return ONLY the last 4 digits, formatted as ***-**-1234",
  filingStatus: "Filing status checked — \"Single\", \"Married filing jointly\", \"Married filing separately\", \"Head of household\", or \"Qualifying surviving spouse\"",
  line1z: "Line 1z: total wages, salaries, tips, etc. — dollar amount",
  line2b: "Line 2b: taxable interest — dollar amount",
  line3b: "Line 3b: ordinary dividends — dollar amount",
  line6b: "Line 6b: taxable amount of social security benefits — dollar amount",
  line9: "Line 9: total income — dollar amount",
  line10: "Line 10: adjustments to income — dollar amount",
  line11: "Line 11: adjusted gross income (AGI) — dollar amount",
  line12: "Line 12: standard deduction or itemized deductions — dollar amount",
  line13b: "Line 13b: total additional deductions from Schedule 1-A (tips, overtime, car loan interest, senior deduction) — dollar amount",
  line15: "Line 15: taxable income — dollar amount",
  line16: "Line 16: tax — dollar amount",
  line19: "Line 19: child tax credit and credit for other dependents — dollar amount",
  line22: "Line 22: total tax after credits — dollar amount",
  line24: "Line 24: total tax — dollar amount",
  line25d: "Line 25d: total federal income tax withheld — dollar amount",
  line27: "Line 27: earned income credit (EIC) — dollar amount",
  line28: "Line 28: additional child tax credit — dollar amount",
  line33: "Line 33: total payments — dollar amount",
  line34: "Line 34: overpayment — dollar amount, omit if there's a balance due instead",
  line37: "Line 37: amount you owe — dollar amount, omit if there's a refund/overpayment instead",
};

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
  w4: {
    title: "Form W-4, Employee's Withholding Certificate",
    fields: {
      taxYear: "The tax year/revision year printed on the form, e.g. \"2025\"",
      employeeName: "Step 1(a): employee's first and last name",
      ssn: "Step 1(a): employee's SSN — return ONLY the last 4 digits, formatted exactly as ***-**-1234",
      filingStatus: "Step 1(c): filing status checked — \"Single or Married filing separately\", \"Married filing jointly or Qualifying surviving spouse\", or \"Head of household\"",
      multipleJobs: "Step 2: \"Yes\" if the Step 2 checkbox (multiple jobs or spouse works) is checked, otherwise omit",
      dependentsAmount: "Step 3: total dependents/credits amount — dollar amount",
      otherIncome: "Step 4(a): other income (not from jobs) — dollar amount",
      deductions: "Step 4(b): deductions — dollar amount",
      extraWithholding: "Step 4(c): extra withholding per pay period — dollar amount",
    },
  },
  "1040-es": {
    title: "Form 1040-ES, Estimated Tax for Individuals",
    // Most people only ever see the payment voucher portion of this form,
    // not the full worksheet — that's what this focuses on.
    fields: {
      name: "Name as printed on the payment voucher",
      ssn: "SSN on the payment voucher — return ONLY the last 4 digits, formatted as ***-**-1234",
      quarter: "Which quarterly voucher this is, e.g. \"1\", \"2\", \"3\", or \"4\" — read from the voucher number or due date printed on the form",
      paymentAmount: "Amount of estimated tax payment for this voucher — dollar amount",
    },
  },
  w9: {
    title: "Form W-9, Request for Taxpayer Identification Number and Certification",
    // Skips exempt payee code / FATCA exemption code — these are almost
    // always blank for individuals and rarely meaningful to this audience.
    fields: {
      name: "Line 1: name as shown on your income tax return",
      businessName: "Line 2: business name/disregarded entity name, if different from line 1 — omit if blank",
      taxClassification: "Line 3a: federal tax classification checked — e.g. \"Individual/sole proprietor\", \"C Corporation\", \"S Corporation\", \"Partnership\", \"Trust/estate\", \"Limited liability company\", or \"Other\"",
      address: "Address, city, state, and ZIP code together — multiple lines joined with \\n",
      taxpayerId: "Part I: taxpayer identification number (SSN or EIN) — return ONLY the last 4 digits, formatted as ***-**-1234",
    },
  },
  "4506-t": {
    title: "Form 4506-T, Request for Transcript of Tax Return",
    // Skips line 5 (third-party recipient info) for now — lower priority
    // than the request itself.
    fields: {
      name: "Line 1a: name shown on the tax return",
      taxpayerId: "Line 1b: SSN, ITIN, or EIN shown on the tax return — return ONLY the last 4 digits, formatted as ***-**-1234",
      transcriptType: "Lines 6a/6b/6c: which transcript type is checked — \"Return Transcript\", \"Account Transcript\", or \"Record of Account\"",
      yearsRequested: "Line 9: tax year(s) or period(s) requested, as printed, e.g. \"12/31/2023\"",
    },
  },
  "9465": {
    title: "Form 9465, Installment Agreement Request",
    // Intentionally never extracts the bank routing/account number fields
    // (lines 13a/13b) — there's no explanatory value in them, and reading
    // full bank account + routing numbers off a document is a fraud-risk
    // surface this app doesn't need to take on.
    fields: {
      name: "Name shown on the tax return",
      ssn: "SSN shown on the tax return — return ONLY the last 4 digits, formatted as ***-**-1234",
      totalOwed: "Line 7: total amount you owe — dollar amount",
      downPayment: "Line 8: amount you can pay now — dollar amount",
      monthlyPayment: "Line 11: proposed monthly payment amount — dollar amount",
      paymentDate: "Line 12: day of the month you want to make your payment, e.g. \"15\"",
    },
  },
  "ss-4": {
    title: "Form SS-4, Application for Employer Identification Number",
    // Skips the detailed employee-count breakdown and excise/alcohol-tax
    // checkboxes — too niche for this audience's typical small businesses.
    fields: {
      entityName: "Line 1: legal name of entity (or individual) for whom the EIN is being requested",
      responsiblePartyName: "Line 7a: name of responsible party",
      entityType: "Line 9a: type of entity checked — e.g. \"Sole proprietor\", \"Partnership\", \"Corporation\", \"Limited liability company\", or \"Other\"",
      businessStartDate: "Line 11: date business started or acquired",
      reasonForApplying: "Line 10: reason for applying checked — e.g. \"Started new business\", \"Hired employees\", \"Banking purpose\", or \"Other\"",
      principalActivity: "Line 16: principal activity of the business, as described",
    },
  },
  w7: {
    title: "Form W-7, Application for IRS Individual Taxpayer Identification Number",
    // No SSN field exists on this form — applicants don't have one yet,
    // which is the whole reason they're filing it.
    fields: {
      name: "Line 1a: applicant's legal name",
      reasonForApplying: "Boxes a–h: which reason for applying is checked, as printed, e.g. \"b — Nonresident alien filing a U.S. tax return\"",
      dateOfBirth: "Line 4: date of birth",
      countryOfCitizenship: "Line 6a: country of citizenship",
      idDocumentType: "Line 6c/6d: type of identification document submitted, e.g. \"Passport\"",
    },
  },
  "1040": {
    title: "Form 1040, U.S. Individual Income Tax Return",
    fields: FORM_1040_FIELDS,
  },
  "1040-sr": {
    title: "Form 1040-SR, U.S. Tax Return for Seniors",
    fields: FORM_1040_FIELDS,
  },
  "schedule-1": {
    title: "Schedule 1 (Form 1040), Additional Income and Adjustments to Income",
    // Skips alimony, farm income, rental/royalty/partnership income
    // (Schedule E), and the granular "other income" sub-lines — niche or
    // too detailed for this audience.
    fields: {
      name: "Your first and last name",
      ssn: "Your SSN — return ONLY the last 4 digits, formatted as ***-**-1234",
      line1: "Line 1: taxable refunds of state and local income taxes — dollar amount",
      line3: "Line 3: business income or loss (Schedule C) — dollar amount",
      line7: "Line 7: unemployment compensation — dollar amount",
      line9: "Line 9: total other income — dollar amount",
      line10: "Line 10: total additional income, flows to Form 1040 line 8 — dollar amount",
      line11: "Line 11: educator expenses — dollar amount",
      line13: "Line 13: health savings account (HSA) deduction — dollar amount",
      line15: "Line 15: deductible part of self-employment tax — dollar amount",
      line20: "Line 20: IRA deduction — dollar amount",
      line21: "Line 21: student loan interest deduction — dollar amount",
      line25: "Line 25: total adjustments to income, flows to Form 1040 line 10 — dollar amount",
    },
  },
  "schedule-1-a": {
    title: "Schedule 1-A (Form 1040), Additional Deductions",
    // New for tax year 2025. Exact sub-line letters within each Part
    // aren't verified here, so fields are described at the Part level,
    // which is enough for the model to locate the right dollar amount.
    fields: {
      name: "Your first and last name",
      ssn: "Your SSN — return ONLY the last 4 digits, formatted as ***-**-1234",
      tipsDeduction: "Part II: qualified tips deduction — dollar amount (capped at $25,000)",
      overtimeDeduction: "Part III: qualified overtime compensation deduction — dollar amount (capped at $12,500, or $25,000 if married filing jointly)",
      carLoanInterestDeduction: "Part IV: qualified passenger vehicle loan interest deduction — dollar amount (capped at $10,000)",
      seniorDeduction: "Part V: enhanced deduction for seniors age 65+ — dollar amount (capped at $6,000, or $12,000 if both spouses qualify and file jointly)",
      totalDeduction: "Part VI: total additional deductions, flows to Form 1040 line 13b — dollar amount",
    },
  },
  "schedule-2": {
    title: "Schedule 2 (Form 1040), Additional Taxes",
    // Skips Part I (AMT, excess advance premium tax credit repayment) —
    // niche for this audience.
    fields: {
      name: "Your first and last name",
      ssn: "Your SSN — return ONLY the last 4 digits, formatted as ***-**-1234",
      line4: "Line 4: self-employment tax — dollar amount",
      line21: "Line 21: total other taxes, flows to Form 1040 line 23 — dollar amount",
    },
  },
  "schedule-3": {
    title: "Schedule 3 (Form 1040), Additional Credits and Payments",
    // Skips foreign tax credit, residential energy credits, and the
    // granular Part II payment sub-lines — niche for this audience.
    fields: {
      name: "Your first and last name",
      ssn: "Your SSN — return ONLY the last 4 digits, formatted as ***-**-1234",
      line2: "Line 2: credit for child and dependent care expenses — dollar amount",
      line3: "Line 3: education credits — dollar amount",
      line4: "Line 4: retirement savings contributions credit (Saver's Credit) — dollar amount",
      line8: "Line 8: total nonrefundable credits, flows to Form 1040 line 20 — dollar amount",
      line15: "Line 15: total other payments and refundable credits, flows to Form 1040 line 31 — dollar amount",
    },
  },
  "941": {
    title: "Form 941, Employer's Quarterly Federal Tax Return",
    fields: {
      taxYear: "The tax year printed on the form, e.g. \"2025\"",
      quarter: "Which quarter this return covers — \"1\", \"2\", \"3\", or \"4\"",
      employerName: "Employer's name",
      employerEin: "Employer identification number (EIN)",
      line1: "Line 1: number of employees who received wages this quarter",
      line2: "Line 2: total wages, tips, and other compensation paid this quarter — dollar amount",
      line3: "Line 3: federal income tax withheld from wages, tips, and other compensation — dollar amount",
      line5a: "Line 5a: taxable social security wages — dollar amount (the wage column, not the tax column)",
      line5c: "Line 5c: taxable Medicare wages and tips — dollar amount (the wage column, not the tax column)",
      line6: "Line 6: total taxes before adjustments — dollar amount",
      line12: "Line 12: total tax liability for the quarter — dollar amount",
      line13: "Line 13: total deposits for this quarter — dollar amount",
      line14: "Line 14: balance due — dollar amount, omit if there's an overpayment instead",
      line15: "Line 15: overpayment — dollar amount, omit if there's a balance due instead",
    },
  },
};

export const SUPPORTED_TYPES = new Set(Object.keys(DOCUMENT_TYPES));
