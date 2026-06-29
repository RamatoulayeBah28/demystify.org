import LineItemTaxDocument from "./LineItemTaxDocument";

const STATIC_FIELDS = [
  { key: "entityName", label: "Legal name of entity" },
  { key: "responsiblePartyName", label: "Responsible party" },
];

const INTERACTIVE_FIELDS = [
  { key: "entityType", lineLabel: "Line 9a" },
  { key: "businessStartDate", lineLabel: "Line 11" },
  { key: "reasonForApplying", lineLabel: "Line 10" },
  { key: "principalActivity", lineLabel: "Line 16" },
];

export default function Ss4Document(props) {
  return (
    <LineItemTaxDocument
      {...props}
      documentType="ss-4"
      formTitle="Form SS-4"
      formSubtitle="Application for Employer Identification Number"
      ombNumber="OMB No. 1545-0003"
      staticFields={STATIC_FIELDS}
      interactiveFields={INTERACTIVE_FIELDS}
    />
  );
}
