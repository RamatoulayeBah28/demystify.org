import Form1040Base from "./Form1040Base";

export default function Form1040SrDocument(props) {
  return (
    <Form1040Base
      {...props}
      documentType="1040-sr"
      formTitle="Form 1040-SR"
      formSubtitle="U.S. Tax Return for Seniors"
    />
  );
}
