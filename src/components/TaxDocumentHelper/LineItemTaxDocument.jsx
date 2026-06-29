import { getAnnotation } from "@/lib/annotations";

// Shared layout for forms shaped like a named-field application/request
// (W-4, W-9, SS-4, W-7, etc.) rather than a payer/recipient + numbered-box
// info return — GenericTaxDocument's box grid doesn't fit these, so this
// renders a single column of full-width rows instead. Each interactive
// field carries its own lineLabel (e.g. "Step 3", "Line 7", "a–h") since
// these forms don't share box-style purely-numeric IDs.
export default function LineItemTaxDocument({
  documentType,
  formTitle,
  formSubtitle,
  ombNumber,
  showYear = false,
  staticFields,
  interactiveFields,
  activeFieldId,
  onBoxClick,
  fieldValues,
}) {
  const taxYear = showYear ? fieldValues[`${documentType}:taxYear`] || "—" : null;

  return (
    <div className="w-[600px] flex-none rounded-md border border-dm-paper-line bg-white p-[18px] text-dm-paper-ink">
      <div className="mb-[10px] flex gap-[10px]">
        <div className="flex flex-1 items-center justify-between rounded border border-dm-paper-line px-[14px] py-2">
          <div>
            <div className="font-serif text-xl font-semibold leading-none">{formTitle}</div>
            <div className="mt-[3px] text-xs text-dm-paper-muted-2">{formSubtitle}</div>
          </div>
          <div className="text-right">
            {showYear && (
              <div className="font-serif text-[28px] font-semibold leading-none">{taxYear}</div>
            )}
            <div className="mt-0.5 text-[10px] text-dm-paper-muted">{ombNumber}</div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-[10px]">
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

        {interactiveFields.map((field) => {
          const fieldId = `${documentType}:${field.key}`;
          const annotation = getAnnotation(fieldId);
          const value = fieldValues[fieldId] || "—";

          if (value === "—") {
            return (
              <div key={field.key} className="rounded-lg border border-dm-paper-line px-[11px] py-[9px]">
                <div className="text-[11px] leading-[1.25] text-dm-paper-disabled">
                  <b className="text-[12px] text-dm-paper-disabled">{field.lineLabel}</b>
                  &nbsp; {annotation?.label}
                </div>
                <div className="mt-[6px] text-base font-semibold text-dm-paper-disabled">{value}</div>
              </div>
            );
          }

          const isActive = activeFieldId === fieldId;
          return (
            <div
              key={field.key}
              onClick={(e) => onBoxClick(e, fieldId)}
              className={`relative cursor-pointer rounded-lg border border-dm-paper-line border-l-4 border-l-dm-accent bg-dm-accent-soft px-[11px] py-[9px] outline-2 outline-offset-2 transition-[transform,box-shadow] duration-150 hover:-translate-y-px hover:shadow-[0_6px_18px_rgba(31,61,92,0.16)] ${
                isActive ? "outline-dm-accent" : "outline-transparent"
              }`}
            >
              <div className="flex items-start justify-between gap-[6px]">
                <div className="text-[11px] leading-[1.25] tracking-[0.03em] text-dm-paper-label">
                  <b className="text-[12px] text-dm-accent">{field.lineLabel}</b>
                  &nbsp; {annotation?.label}
                </div>
                <span className="flex h-[24px] w-[24px] flex-none items-center justify-center rounded-full bg-dm-accent text-[10px] text-white">
                  <i className="fa-solid fa-volume-high" />
                </span>
              </div>
              <div className="mt-[6px] text-lg font-bold tracking-[0.02em] text-dm-paper-ink-strong">{value}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
