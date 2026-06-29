import Form1040Base from "./Form1040Base";

export default function Form1040Document(props) {
  return (
    <Form1040Base
      {...props}
      documentType="1040"
      formTitle="Form 1040"
      formSubtitle="U.S. Individual Income Tax Return"
    />
  );
}
