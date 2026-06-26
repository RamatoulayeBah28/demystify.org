import { getAnnotation } from "@/lib/annotations";

const INTERACTIVE_FIELDS_TEMPLATE = [
  { n: 1, fieldId: "w2c:box1" },
  { n: 2, fieldId: "w2c:box2" },
  { n: 3, fieldId: "w2c:box3" },
  { n: 4, fieldId: "w2c:box4" },
  { n: 5, fieldId: "w2c:box5" },
  { n: 6, fieldId: "w2c:box6" },
];

export default function W2cDocument({ activeFieldId, onBoxClick, fieldValues }) {
  const INTERACTIVE_FIELDS = INTERACTIVE_FIELDS_TEMPLATE.map((field) => ({
    ...field,
    previouslyReported: fieldValues[`${field.fieldId}:previous`] || "—",
    corrected: fieldValues[`${field.fieldId}:corrected`] || "—",
  }));

  const ssn = fieldValues["w2c:boxA"] || "—";
  const ein = fieldValues["w2c:boxB"] || "—";
  const employerNameAddress = fieldValues["w2c:boxC"] || "—";
  const employeeName = fieldValues["w2c:boxE"] || "—";

  return (
    <div className="w-[600px] flex-none rounded-md border border-dm-paper-line bg-white p-[18px] text-dm-paper-ink">
      <div className="mb-[10px] flex gap-[10px]">
        <div className="w-32 flex-none rounded border border-dm-paper-line px-[10px] py-2">
          <div className="text-[10px] uppercase tracking-[0.06em] text-dm-paper-muted">
            d&nbsp;&nbsp;Employee&apos;s SSN
          </div>
          <div className="mt-[3px] text-[17px] font-bold tracking-[0.04em]">
            {ssn}
          </div>
        </div>
        <div className="flex flex-1 items-center justify-between rounded border border-dm-paper-line px-[14px] py-2">
          <div>
            <div className="font-serif text-xl font-semibold leading-none">
              Form W-2c
            </div>
            <div className="mt-[3px] text-xs text-dm-paper-muted-2">
              Corrected Wage and Tax Statement
            </div>
          </div>
          <div className="text-right">
            <div className="font-serif text-[28px] font-semibold leading-none">
              2025
            </div>
            <div className="mt-0.5 text-[10px] text-dm-paper-muted">
              OMB No. 1545-0029
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-stretch gap-[10px]">
        <div className="flex w-[250px] flex-none flex-col gap-[10px]">
          <div className="rounded border border-dm-paper-line px-[10px] py-2">
            <div className="text-[10px] uppercase tracking-[0.05em] text-dm-paper-muted">
              b&nbsp;&nbsp;Employer ID number (EIN)
            </div>
            <div className="mt-[3px] text-base font-semibold">{ein}</div>
          </div>
          <div className="flex-1 rounded border border-dm-paper-line px-[10px] py-2">
            <div className="text-[10px] uppercase tracking-[0.05em] text-dm-paper-muted">
              c&nbsp;&nbsp;Employer name &amp; address
            </div>
            <div className="mt-[3px] text-[15px] font-semibold leading-[1.4]">
              {employerNameAddress.split("\n").map((line, i) => (
                <span key={i}>
                  {i > 0 && <br />}
                  {line}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded border border-dm-paper-line px-[10px] py-2">
            <div className="text-[10px] uppercase tracking-[0.05em] text-dm-paper-muted">
              e&nbsp;&nbsp;Employee&apos;s name
            </div>
            <div className="mt-[3px] text-[15px] font-semibold">
              {employeeName}
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-[10px]">
          {INTERACTIVE_FIELDS.map((field) => {
            const annotation = getAnnotation(field.fieldId);
            const isActive = activeFieldId === field.fieldId;
            return (
              <div
                key={field.n}
                onClick={(e) => onBoxClick(e, field.fieldId)}
                className={`relative cursor-pointer rounded-lg border border-dm-paper-line border-l-4 border-l-dm-accent bg-dm-accent-soft pt-[9px] px-[11px] pb-[11px] outline-2 outline-offset-2 transition-[transform,box-shadow] duration-150 hover:-translate-y-px hover:shadow-[0_6px_18px_rgba(31,61,92,0.16)] ${
                  isActive ? "outline-dm-accent" : "outline-transparent"
                }`}
              >
                <div className="flex items-start justify-between gap-[6px]">
                  <div className="text-[11px] leading-[1.25] tracking-[0.03em] text-dm-paper-label">
                    <b className="text-[13px] text-dm-accent">{field.n}</b>
                    &nbsp; {annotation?.label}
                  </div>
                  <span className="flex h-[26px] w-[26px] flex-none items-center justify-center rounded-full bg-dm-accent text-[11px] text-white">
                    <i className="fa-solid fa-volume-high" />
                  </span>
                </div>
                <div className="mt-[8px] grid grid-cols-2 gap-[10px]">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.04em] text-dm-paper-muted">
                      Previously reported
                    </div>
                    <div className="mt-[2px] text-base font-bold tracking-[0.02em] text-dm-paper-disabled">
                      {field.previouslyReported}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.04em] text-dm-accent">
                      Correct information
                    </div>
                    <div className="mt-[2px] text-base font-bold tracking-[0.02em] text-dm-paper-ink-strong">
                      {field.corrected}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
