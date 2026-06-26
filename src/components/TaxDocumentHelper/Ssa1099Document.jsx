import GenericTaxDocument from "./GenericTaxDocument";

const STATIC_FIELDS = [
  { key: "recipientName", label: "Beneficiary's name" },
  { key: "recipientTin", label: "Beneficiary's SSN" },
];

const INTERACTIVE_FIELDS = [{ key: "box3" }, { key: "box4" }, { key: "box5" }, { key: "box6" }];

export default function Ssa1099Document(props) {
  return (
    <GenericTaxDocument
      {...props}
      documentType="ssa-1099"
      formTitle="Form SSA-1099"
      formSubtitle="Social Security Benefit Statement"
      ombNumber="Social Security Administration"
      staticFields={STATIC_FIELDS}
      interactiveFields={INTERACTIVE_FIELDS}
    />
  );
}
