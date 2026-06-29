import LineItemTaxDocument from "./LineItemTaxDocument";

const STATIC_FIELDS = [
  { key: "name", label: "Name" },
  { key: "ssn", label: "SSN" },
];

const INTERACTIVE_FIELDS = [
  { key: "line4", lineLabel: "Line 4" },
  { key: "line21", lineLabel: "Line 21" },
];

export default function Schedule2Document(props) {
  return (
    <LineItemTaxDocument
      {...props}
      documentType="schedule-2"
      formTitle="Schedule 2 (Form 1040)"
      formSubtitle="Additional Taxes"
      ombNumber="OMB No. 1545-0074"
      staticFields={STATIC_FIELDS}
      interactiveFields={INTERACTIVE_FIELDS}
    />
  );
}
