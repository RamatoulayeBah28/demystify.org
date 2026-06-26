import GenericTaxDocument from "./GenericTaxDocument";

const STATIC_FIELDS = [
  { key: "payerInfo", label: "Payer's name & address", multiline: true },
  { key: "payerTin", label: "Payer's TIN" },
  { key: "recipientName", label: "Recipient's name" },
  { key: "recipientTin", label: "Recipient's TIN" },
];

const INTERACTIVE_FIELDS = [{ key: "box1" }, { key: "box2" }, { key: "box4" }, { key: "box8" }];

export default function Int1099Document(props) {
  return (
    <GenericTaxDocument
      {...props}
      documentType="1099-int"
      formTitle="Form 1099-INT"
      formSubtitle="Interest Income"
      ombNumber="OMB No. 1545-0112"
      staticFields={STATIC_FIELDS}
      interactiveFields={INTERACTIVE_FIELDS}
    />
  );
}
