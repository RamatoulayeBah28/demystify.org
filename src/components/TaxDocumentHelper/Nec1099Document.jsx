import { getAnnotation } from "@/lib/annotations";

const INTERACTIVE_FIELDS_TEMPLATE = [
  { n: 1, fieldId: "1099-nec:box1" },
  { n: 4, fieldId: "1099-nec:box4" },
];

export default function Nec1099Document({ activeN, onBoxClick, fieldValues }) {
  const INTERACTIVE_FIELDS = INTERACTIVE_FIELDS_TEMPLATE.map((field) => ({
    ...field,
    value: fieldValues[field.fieldId] || "—",
  }));
  return (
    <div className="w-[600px] flex-none rounded-md border border-dm-paper-line bg-white p-[18px] text-dm-paper-ink">
      <div className="mb-[10px] flex gap-[10px]">
        <div className="flex flex-1 items-center justify-between rounded border border-dm-paper-line px-[14px] py-2">
          <div>
            <div className="font-serif text-xl font-semibold leading-none">
              Form 1099-NEC
            </div>
            <div className="mt-[3px] text-xs text-dm-paper-muted-2">
              Nonemployee Compensation
            </div>
          </div>
          <div className="text-right">
            <div className="font-serif text-[28px] font-semibold leading-none">
              2025
            </div>
            <div className="mt-0.5 text-[10px] text-dm-paper-muted">
              OMB No. 1545-0116
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-stretch gap-[10px]">
        <div className="flex w-[250px] flex-none flex-col gap-[10px]">
          <div className="flex-1 rounded border border-dm-paper-line px-[10px] py-2">
            <div className="text-[10px] uppercase tracking-[0.05em] text-dm-paper-muted">
              Payer&apos;s name, address &amp; TIN
            </div>
            <div className="mt-[3px] text-[15px] font-semibold leading-[1.4]">
              Sunrise Cleaning Services LLC
              <br />
              88 Maple Street
              <br />
              Minneapolis, MN 55404
              <br />
              <span className="text-dm-paper-muted">TIN: 47-1029384</span>
            </div>
          </div>
          <div className="rounded border border-dm-paper-line px-[10px] py-2">
            <div className="text-[10px] uppercase tracking-[0.05em] text-dm-paper-muted">
              Recipient&apos;s name
            </div>
            <div className="mt-[3px] text-[15px] font-semibold">
              Faisal A. Mohamed
            </div>
          </div>
          <div className="rounded border border-dm-paper-line px-[10px] py-2">
            <div className="text-[10px] uppercase tracking-[0.05em] text-dm-paper-muted">
              Recipient&apos;s TIN
            </div>
            <div className="mt-[3px] text-base font-semibold">***-**-2207</div>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-[10px]">
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
        </div>
      </div>
    </div>
  );
}
