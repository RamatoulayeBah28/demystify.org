import GenericTaxDocument from "./GenericTaxDocument";

const STATIC_FIELDS = [
  { key: "payerInfo", label: "Filer's name & address (school)", multiline: true },
  { key: "recipientName", label: "Student's name" },
  { key: "recipientTin", label: "Student's TIN" },
];

const INTERACTIVE_FIELDS = [
  { key: "box1" },
  { key: "box4" },
  { key: "box5" },
  { key: "box6" },
  { key: "box789", display: "7/8/9" },
  { key: "box10" },
];

export default function T1098Document(props) {
  return (
    <GenericTaxDocument
      {...props}
      documentType="1098-t"
      formTitle="Form 1098-T"
      formSubtitle="Tuition Statement"
      ombNumber="OMB No. 1545-1574"
      staticFields={STATIC_FIELDS}
      interactiveFields={INTERACTIVE_FIELDS}
    />
  );
}
