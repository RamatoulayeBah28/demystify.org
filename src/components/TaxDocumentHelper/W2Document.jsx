import { getAnnotation } from "@/lib/annotations";

const INTERACTIVE_FIELDS_TEMPLATE = [
  { n: 1, fieldId: "w2:box1" },
  { n: 2, fieldId: "w2:box2" },
  { n: 3, fieldId: "w2:box3" },
  { n: 4, fieldId: "w2:box4" },
  { n: 5, fieldId: "w2:box5" },
  { n: 6, fieldId: "w2:box6" },
];

const STATIC_FIELDS = [
  { n: 16, label: "State wages, tips, etc." },
  { n: 17, label: "State income tax" },
];

export default function W2Document({ activeN, onBoxClick, fieldValues }) {
  const INTERACTIVE_FIELDS = INTERACTIVE_FIELDS_TEMPLATE.map((field) => ({
    ...field,
    value: fieldValues[field.fieldId] || "—",
  }));

  const STATIC_FIELDS_WITH_VALUES = STATIC_FIELDS.map((field) => ({
    ...field,
    value: fieldValues[`w2:box${field.n}`] || "—",
  }));
  return (
    <div className="w-[600px] flex-none rounded-md border border-dm-paper-line bg-white p-[18px] text-dm-paper-ink">
      <div className="mb-[10px] flex gap-[10px]">
        <div className="w-32 flex-none rounded border border-dm-paper-line px-[10px] py-2">
          <div className="text-[10px] uppercase tracking-[0.06em] text-dm-paper-muted">
            a&nbsp;&nbsp;Employee SSN
          </div>
          <div className="mt-[3px] text-[17px] font-bold tracking-[0.04em]">
            ***-**-4471
          </div>
        </div>
        <div className="flex flex-1 items-center justify-between rounded border border-dm-paper-line px-[14px] py-2">
          <div>
            <div className="font-serif text-xl font-semibold leading-none">
              Form W-2
            </div>
            <div className="mt-[3px] text-xs text-dm-paper-muted-2">
              Wage and Tax Statement
            </div>
          </div>
          <div className="text-right">
            <div className="font-serif text-[28px] font-semibold leading-none">
              2025
            </div>
            <div className="mt-0.5 text-[10px] text-dm-paper-muted">
              Dept. of the Treasury — IRS
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
            <div className="mt-[3px] text-base font-semibold">12-3456789</div>
          </div>
          <div className="flex-1 rounded border border-dm-paper-line px-[10px] py-2">
            <div className="text-[10px] uppercase tracking-[0.05em] text-dm-paper-muted">
              c&nbsp;&nbsp;Employer name &amp; address
            </div>
            <div className="mt-[3px] text-[15px] font-semibold leading-[1.4]">
              Greenline Logistics LLC
              <br />
              1420 Harbor Ave
              <br />
              Columbus, OH 43215
            </div>
          </div>
          <div className="rounded border border-dm-paper-line px-[10px] py-2">
            <div className="text-[10px] uppercase tracking-[0.05em] text-dm-paper-muted">
              e&nbsp;&nbsp;Employee name
            </div>
            <div className="mt-[3px] text-[15px] font-semibold">
              Amina H. Warsame
            </div>
          </div>
        </div>

        <div className="grid flex-1 grid-cols-2 content-start gap-[10px]">
          {INTERACTIVE_FIELDS.map((field) => {
            const annotation = getAnnotation(field.fieldId);
            const isActive = activeN === field.n;
            return (
              <div
                key={field.n}
                onClick={(e) => onBoxClick(e, field.n)}
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
                <div className="mt-[6px] text-xl font-bold tracking-[0.02em] text-dm-paper-ink-strong">
                  {field.value}
                </div>
              </div>
            );
          })}

          {STATIC_FIELDS_WITH_VALUES.map((field) => (
            <div
              key={field.n}
              className="rounded-lg border border-dm-paper-line pt-[9px] px-[11px] pb-[11px]"
            >
              <div className="text-[11px] leading-[1.25] text-dm-paper-disabled">
                <b className="text-[13px] text-dm-paper-disabled">{field.n}</b>
                &nbsp; {field.label}
              </div>
              <div className="mt-[6px] text-lg font-semibold text-dm-paper-disabled">
                {field.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
