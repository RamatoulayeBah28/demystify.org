import LineItemTaxDocument from "./LineItemTaxDocument";

const STATIC_FIELDS = [
  { key: "name", label: "Name" },
  { key: "ssn", label: "SSN" },
];

const INTERACTIVE_FIELDS = [
  { key: "quarter", lineLabel: "Voucher" },
  { key: "paymentAmount", lineLabel: "Amount" },
];

export default function Es1040Document(props) {
  return (
    <LineItemTaxDocument
      {...props}
      documentType="1040-es"
      formTitle="Form 1040-ES"
      formSubtitle="Estimated Tax for Individuals"
      ombNumber="OMB No. 1545-0074"
      staticFields={STATIC_FIELDS}
      interactiveFields={INTERACTIVE_FIELDS}
    />
  );
}
