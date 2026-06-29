import GenericTaxDocument from "./GenericTaxDocument";

const STATIC_FIELDS = [
  { key: "payerInfo", label: "Payer's name & address", multiline: true },
  { key: "recipientName", label: "Recipient's name" },
  { key: "recipientTin", label: "Recipient's TIN" },
];

const INTERACTIVE_FIELDS = [
  { key: "box1" },
  { key: "box2" },
  { key: "box4" },
  { key: "box5" },
  { key: "box6" },
  { key: "box7" },
  { key: "box9" },
  { key: "box10" },
  { key: "box11" },
];

export default function G1099Document(props) {
  return (
    <GenericTaxDocument
      {...props}
      documentType="1099-g"
      formTitle="Form 1099-G"
      formSubtitle="Certain Government Payments"
      ombNumber="OMB No. 1545-0120"
      staticFields={STATIC_FIELDS}
      interactiveFields={INTERACTIVE_FIELDS}
    />
  );
}
