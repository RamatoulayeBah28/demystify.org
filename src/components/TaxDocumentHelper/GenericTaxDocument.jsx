import { getAnnotation } from "@/lib/annotations";

// Shared layout for the simpler 1099-style forms: a header (title,
// subtitle, OMB number), a left column of static (non-interactive)
// fields, and a grid of clickable annotated boxes. W2 and W2c have more
// bespoke layouts (lettered boxes, previous/corrected columns) and keep
// their own components instead of using this — but every other
// "payer/recipient info + a handful of numbered boxes" form should reuse
// this rather than duplicate the markup per document type.
export default function GenericTaxDocument({
  documentType,
  formTitle,
  formSubtitle,
  ombNumber,
  staticFields,
  interactiveFields,
  activeFieldId,
  onBoxClick,
  fieldValues,
}) {
  const taxYear = fieldValues[`${documentType}:taxYear`] || "—";

  return (
    <div className="w-[600px] flex-none rounded-md border border-dm-paper-line bg-white p-[18px] text-dm-paper-ink">
      <div className="mb-[10px] flex gap-[10px]">
        <div className="flex flex-1 items-center justify-between rounded border border-dm-paper-line px-[14px] py-2">
          <div>
            <div className="font-serif text-xl font-semibold leading-none">{formTitle}</div>
            <div className="mt-[3px] text-xs text-dm-paper-muted-2">{formSubtitle}</div>
          </div>
          <div className="text-right">
            <div className="font-serif text-[28px] font-semibold leading-none">{taxYear}</div>
            <div className="mt-0.5 text-[10px] text-dm-paper-muted">{ombNumber}</div>
          </div>
        </div>
      </div>

      <div className="flex items-stretch gap-[10px]">
        <div className="flex w-[250px] flex-none flex-col gap-[10px]">
          {staticFields.map((field) => {
            const fieldId = `${documentType}:${field.key}`;
            const value = fieldValues[fieldId] || "—";
            return (
              <div key={field.key} className="rounded border border-dm-paper-line px-[10px] py-2">
                <div className="text-[10px] uppercase tracking-[0.05em] text-dm-paper-muted">{field.label}</div>
                <div className="mt-[3px] text-[15px] font-semibold leading-[1.4]">
                  {field.multiline
                    ? value.split("\n").map((line, i) => (
                        <span key={i}>
                          {i > 0 && <br />}
                          {line}
                        </span>
                      ))
                    : value}
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid flex-1 grid-cols-2 content-start gap-[10px]">
          {interactiveFields.map((field) => {
            const fieldId = `${documentType}:${field.key}`;
            const annotation = getAnnotation(fieldId);
            const value = fieldValues[fieldId] || "—";
            const displayNumber = field.display ?? field.key.replace(/^box/, "");

            if (value === "—") {
              return (
                <div key={field.key} className="rounded-lg border border-dm-paper-line pt-[9px] px-[11px] pb-[11px]">
                  <div className="text-[11px] leading-[1.25] text-dm-paper-disabled">
                    <b className="text-[13px] text-dm-paper-disabled">{displayNumber}</b>
                    &nbsp; {annotation?.label}
                  </div>
                  <div className="mt-[6px] text-lg font-semibold text-dm-paper-disabled">{value}</div>
                </div>
              );
            }

            const isActive = activeFieldId === fieldId;
            return (
              <div
                key={field.key}
                onClick={(e) => onBoxClick(e, fieldId)}
                className={`relative cursor-pointer rounded-lg border border-dm-paper-line border-l-4 border-l-dm-accent bg-dm-accent-soft pt-[9px] px-[11px] pb-[11px] outline-2 outline-offset-2 transition-[transform,box-shadow] duration-150 hover:-translate-y-px hover:shadow-[0_6px_18px_rgba(31,61,92,0.16)] ${
                  isActive ? "outline-dm-accent" : "outline-transparent"
                }`}
              >
                <div className="flex items-start justify-between gap-[6px]">
                  <div className="text-[11px] leading-[1.25] tracking-[0.03em] text-dm-paper-label">
                    <b className="text-[13px] text-dm-accent">{displayNumber}</b>
                    &nbsp; {annotation?.label}
                  </div>
                  <span className="flex h-[26px] w-[26px] flex-none items-center justify-center rounded-full bg-dm-accent text-[11px] text-white">
                    <i className="fa-solid fa-volume-high" />
                  </span>
                </div>
                <div className="mt-[6px] text-xl font-bold tracking-[0.02em] text-dm-paper-ink-strong">{value}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
