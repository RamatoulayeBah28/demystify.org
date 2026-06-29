import LineItemTaxDocument from "./LineItemTaxDocument";

const STATIC_FIELDS = [
  { key: "name", label: "Name" },
  { key: "ssn", label: "SSN" },
];

const INTERACTIVE_FIELDS = [
  { key: "line1", lineLabel: "Line 1" },
  { key: "line3", lineLabel: "Line 3" },
  { key: "line7", lineLabel: "Line 7" },
  { key: "line9", lineLabel: "Line 9" },
  { key: "line10", lineLabel: "Line 10" },
  { key: "line11", lineLabel: "Line 11" },
  { key: "line13", lineLabel: "Line 13" },
  { key: "line15", lineLabel: "Line 15" },
  { key: "line20", lineLabel: "Line 20" },
  { key: "line21", lineLabel: "Line 21" },
  { key: "line25", lineLabel: "Line 25" },
];

export default function Schedule1Document(props) {
  return (
    <LineItemTaxDocument
      {...props}
      documentType="schedule-1"
      formTitle="Schedule 1 (Form 1040)"
      formSubtitle="Additional Income and Adjustments to Income"
      ombNumber="OMB No. 1545-0074"
      staticFields={STATIC_FIELDS}
      interactiveFields={INTERACTIVE_FIELDS}
    />
  );
}
