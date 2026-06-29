import LineItemTaxDocument from "./LineItemTaxDocument";

const STATIC_FIELDS = [
  { key: "employeeName", label: "Employee's name" },
  { key: "ssn", label: "Employee's SSN" },
];

const INTERACTIVE_FIELDS = [
  { key: "filingStatus", lineLabel: "Step 1(c)" },
  { key: "multipleJobs", lineLabel: "Step 2" },
  { key: "dependentsAmount", lineLabel: "Step 3" },
  { key: "otherIncome", lineLabel: "Step 4(a)" },
  { key: "deductions", lineLabel: "Step 4(b)" },
  { key: "extraWithholding", lineLabel: "Step 4(c)" },
];

export default function W4Document(props) {
  return (
    <LineItemTaxDocument
      {...props}
      documentType="w4"
      formTitle="Form W-4"
      formSubtitle="Employee's Withholding Certificate"
      ombNumber="OMB No. 1545-0074"
      showYear
      staticFields={STATIC_FIELDS}
      interactiveFields={INTERACTIVE_FIELDS}
    />
  );
}
