import LineItemTaxDocument from "./LineItemTaxDocument";

// Shared by Form1040Document and Form1040SrDocument — 1040 and 1040-SR
// are the same return with the same line numbers, just different print
// size, so they share this field list instead of risking drift between
// two hand-maintained copies.
const STATIC_FIELDS = [
  { key: "name", label: "Name" },
  { key: "ssn", label: "SSN" },
];

const INTERACTIVE_FIELDS = [
  { key: "filingStatus", lineLabel: "Status" },
  { key: "line1z", lineLabel: "Line 1z" },
  { key: "line2b", lineLabel: "Line 2b" },
  { key: "line3b", lineLabel: "Line 3b" },
  { key: "line6b", lineLabel: "Line 6b" },
  { key: "line9", lineLabel: "Line 9" },
  { key: "line10", lineLabel: "Line 10" },
  { key: "line11", lineLabel: "Line 11" },
  { key: "line12", lineLabel: "Line 12" },
  { key: "line13b", lineLabel: "Line 13b" },
  { key: "line15", lineLabel: "Line 15" },
  { key: "line16", lineLabel: "Line 16" },
  { key: "line19", lineLabel: "Line 19" },
  { key: "line22", lineLabel: "Line 22" },
  { key: "line24", lineLabel: "Line 24" },
  { key: "line25d", lineLabel: "Line 25d" },
  { key: "line27", lineLabel: "Line 27" },
  { key: "line28", lineLabel: "Line 28" },
  { key: "line33", lineLabel: "Line 33" },
  { key: "line34", lineLabel: "Line 34" },
  { key: "line37", lineLabel: "Line 37" },
];

export default function Form1040Base({ documentType, formTitle, formSubtitle, ...props }) {
  return (
    <LineItemTaxDocument
      {...props}
      documentType={documentType}
      formTitle={formTitle}
      formSubtitle={formSubtitle}
      ombNumber="OMB No. 1545-0074"
      showYear
      staticFields={STATIC_FIELDS}
      interactiveFields={INTERACTIVE_FIELDS}
    />
  );
}
