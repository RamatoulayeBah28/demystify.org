export default function UnmatchedScreen({ onBack, notTaxDocument }) {
  return (
    <div className="mx-auto max-w-[640px] px-8 pt-[100px] pb-24 text-center">
      <h2 className="mb-3 font-serif text-3xl font-semibold text-dm-ink">
        {notTaxDocument
          ? "Tani ma ahan dukumenti canshuur"
          : "Ma aanu si sax ah u aqoonsan karin dukumentigan"}
      </h2>
      <p className="mb-8 text-base text-dm-muted">
        {notTaxDocument
          ? "This doesn't look like a tax document. Please upload a tax form, such as a W-2 or 1099. Kani uma eka dukumenti canshuureed. Fadlan soo geli foom canshuureed, sida W-2 ama 1099."
          : "We couldn't identify this document type yet."}
      </p>
      <button
        onClick={onBack}
        className="rounded-[13px] border border-dm-line px-7 py-[14px] text-[17px] font-semibold text-dm-ink"
      >
        Dib u noqo / Go back
      </button>
    </div>
  );
}
