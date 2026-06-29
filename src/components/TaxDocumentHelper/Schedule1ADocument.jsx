import LineItemTaxDocument from "./LineItemTaxDocument";

const STATIC_FIELDS = [
  { key: "name", label: "Name" },
  { key: "ssn", label: "SSN" },
];

const INTERACTIVE_FIELDS = [
  { key: "tipsDeduction", lineLabel: "Part II" },
  { key: "overtimeDeduction", lineLabel: "Part III" },
  { key: "carLoanInterestDeduction", lineLabel: "Part IV" },
  { key: "seniorDeduction", lineLabel: "Part V" },
  { key: "totalDeduction", lineLabel: "Part VI" },
];

export default function Schedule1ADocument(props) {
  return (
    <LineItemTaxDocument
      {...props}
      documentType="schedule-1-a"
      formTitle="Schedule 1-A (Form 1040)"
      formSubtitle="Additional Deductions"
      ombNumber="OMB No. 1545-0074"
      staticFields={STATIC_FIELDS}
      interactiveFields={INTERACTIVE_FIELDS}
    />
  );
}
