import LineItemTaxDocument from "./LineItemTaxDocument";

const STATIC_FIELDS = [
  { key: "name", label: "Name" },
  { key: "ssn", label: "SSN" },
];

// Bank routing/account numbers (lines 13a/13b) are never extracted for
// this form — see the comment in documentTypes.js.
const INTERACTIVE_FIELDS = [
  { key: "totalOwed", lineLabel: "Line 7" },
  { key: "downPayment", lineLabel: "Line 8" },
  { key: "monthlyPayment", lineLabel: "Line 11" },
  { key: "paymentDate", lineLabel: "Line 12" },
];

export default function InstallmentAgreementDocument(props) {
  return (
    <LineItemTaxDocument
      {...props}
      documentType="9465"
      formTitle="Form 9465"
      formSubtitle="Installment Agreement Request"
      ombNumber="OMB No. 1545-0074"
      staticFields={STATIC_FIELDS}
      interactiveFields={INTERACTIVE_FIELDS}
    />
  );
}
