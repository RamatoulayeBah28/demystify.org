import LineItemTaxDocument from "./LineItemTaxDocument";

const STATIC_FIELDS = [{ key: "name", label: "Applicant's legal name" }];

const INTERACTIVE_FIELDS = [
  { key: "reasonForApplying", lineLabel: "Boxes a–h" },
  { key: "dateOfBirth", lineLabel: "Line 4" },
  { key: "countryOfCitizenship", lineLabel: "Line 6a" },
  { key: "idDocumentType", lineLabel: "Line 6c/6d" },
];

export default function W7Document(props) {
  return (
    <LineItemTaxDocument
      {...props}
      documentType="w7"
      formTitle="Form W-7"
      formSubtitle="Application for IRS Individual Taxpayer Identification Number"
      ombNumber="OMB No. 1545-0074"
      staticFields={STATIC_FIELDS}
      interactiveFields={INTERACTIVE_FIELDS}
    />
  );
}
