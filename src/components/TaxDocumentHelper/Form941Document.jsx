import LineItemTaxDocument from "./LineItemTaxDocument";

const STATIC_FIELDS = [
  { key: "employerName", label: "Employer's name" },
  { key: "employerEin", label: "Employer ID number (EIN)" },
];

const INTERACTIVE_FIELDS = [
  { key: "quarter", lineLabel: "Quarter" },
  { key: "line1", lineLabel: "Line 1" },
  { key: "line2", lineLabel: "Line 2" },
  { key: "line3", lineLabel: "Line 3" },
  { key: "line5a", lineLabel: "Line 5a" },
  { key: "line5c", lineLabel: "Line 5c" },
  { key: "line6", lineLabel: "Line 6" },
  { key: "line12", lineLabel: "Line 12" },
  { key: "line13", lineLabel: "Line 13" },
  { key: "line14", lineLabel: "Line 14" },
  { key: "line15", lineLabel: "Line 15" },
];

export default function Form941Document(props) {
  return (
    <LineItemTaxDocument
      {...props}
      documentType="941"
      formTitle="Form 941"
      formSubtitle="Employer's Quarterly Federal Tax Return"
      ombNumber="OMB No. 1545-0029"
      showYear
      staticFields={STATIC_FIELDS}
      interactiveFields={INTERACTIVE_FIELDS}
    />
  );
}
