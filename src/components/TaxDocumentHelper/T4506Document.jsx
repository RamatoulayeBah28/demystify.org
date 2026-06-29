import LineItemTaxDocument from "./LineItemTaxDocument";

const STATIC_FIELDS = [
  { key: "name", label: "Name on tax return" },
  { key: "taxpayerId", label: "SSN, ITIN, or EIN" },
];

const INTERACTIVE_FIELDS = [
  { key: "transcriptType", lineLabel: "Line 6a/6b/6c" },
  { key: "yearsRequested", lineLabel: "Line 9" },
];

export default function T4506Document(props) {
  return (
    <LineItemTaxDocument
      {...props}
      documentType="4506-t"
      formTitle="Form 4506-T"
      formSubtitle="Request for Transcript of Tax Return"
      ombNumber="OMB No. 1545-1872"
      staticFields={STATIC_FIELDS}
      interactiveFields={INTERACTIVE_FIELDS}
    />
  );
}
