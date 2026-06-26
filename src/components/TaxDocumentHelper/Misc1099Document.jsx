import GenericTaxDocument from "./GenericTaxDocument";

const STATIC_FIELDS = [
  { key: "payerInfo", label: "Payer's name & address", multiline: true },
  { key: "payerTin", label: "Payer's TIN" },
  { key: "recipientName", label: "Recipient's name" },
  { key: "recipientTin", label: "Recipient's TIN" },
];

const INTERACTIVE_FIELDS = [{ key: "box1" }, { key: "box3" }, { key: "box4" }];

export default function Misc1099Document(props) {
  return (
    <GenericTaxDocument
      {...props}
      documentType="1099-misc"
      formTitle="Form 1099-MISC"
      formSubtitle="Miscellaneous Information"
      ombNumber="OMB No. 1545-0115"
      staticFields={STATIC_FIELDS}
      interactiveFields={INTERACTIVE_FIELDS}
    />
  );
}
