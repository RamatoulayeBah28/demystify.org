import LineItemTaxDocument from "./LineItemTaxDocument";

const STATIC_FIELDS = [
  { key: "name", label: "Name" },
  { key: "businessName", label: "Business name (if different)" },
  { key: "address", label: "Address", multiline: true },
  { key: "taxpayerId", label: "Taxpayer ID (SSN or EIN)" },
];

const INTERACTIVE_FIELDS = [{ key: "taxClassification", lineLabel: "Line 3a" }];

export default function W9Document(props) {
  return (
    <LineItemTaxDocument
      {...props}
      documentType="w9"
      formTitle="Form W-9"
      formSubtitle="Request for Taxpayer Identification Number and Certification"
      ombNumber="OMB No. 1545-0074"
      staticFields={STATIC_FIELDS}
      interactiveFields={INTERACTIVE_FIELDS}
    />
  );
}
