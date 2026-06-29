import LineItemTaxDocument from "./LineItemTaxDocument";

const STATIC_FIELDS = [
  { key: "name", label: "Name" },
  { key: "ssn", label: "SSN" },
];

const INTERACTIVE_FIELDS = [
  { key: "line2", lineLabel: "Line 2" },
  { key: "line3", lineLabel: "Line 3" },
  { key: "line4", lineLabel: "Line 4" },
  { key: "line8", lineLabel: "Line 8" },
  { key: "line15", lineLabel: "Line 15" },
];

export default function Schedule3Document(props) {
  return (
    <LineItemTaxDocument
      {...props}
      documentType="schedule-3"
      formTitle="Schedule 3 (Form 1040)"
      formSubtitle="Additional Credits and Payments"
      ombNumber="OMB No. 1545-0074"
      staticFields={STATIC_FIELDS}
      interactiveFields={INTERACTIVE_FIELDS}
    />
  );
}
