export default function UnmatchedScreen({ onBack }) {
  return (
    <div className="mx-auto max-w-[640px] px-8 pt-[100px] pb-24 text-center">
      <h2 className="mb-3 font-serif text-3xl font-semibold text-dm-ink">
        Ma aanu si sax ah u aqoonsan karin dukumentigan
      </h2>
      <p className="mb-8 text-base text-dm-muted">We couldn&apos;t identify this document type yet.</p>
      <button
        onClick={onBack}
        className="rounded-[13px] border border-dm-line px-7 py-[14px] text-[17px] font-semibold text-dm-ink"
      >
        Dib u noqo / Go back
      </button>
    </div>
  );
}
