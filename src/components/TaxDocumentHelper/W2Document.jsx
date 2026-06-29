import { getAnnotation } from "@/lib/annotations";
import { getBox12Annotation } from "@/lib/box12Codes";

// Box 9 is unused on current W-2s — intentionally not listed here.
const INTERACTIVE_FIELDS_TEMPLATE = [
  { n: 1, fieldId: "w2:box1" },
  { n: 2, fieldId: "w2:box2" },
  { n: 3, fieldId: "w2:box3" },
  { n: 4, fieldId: "w2:box4" },
  { n: 5, fieldId: "w2:box5" },
  { n: 6, fieldId: "w2:box6" },
  { n: 7, fieldId: "w2:box7" },
  { n: 8, fieldId: "w2:box8" },
  { n: 10, fieldId: "w2:box10" },
  { n: 11, fieldId: "w2:box11" },
  { n: 13, fieldId: "w2:box13" },
  { n: 14, fieldId: "w2:box14" },
  { n: 15, fieldId: "w2:box15" },
  { n: 16, fieldId: "w2:box16" },
  { n: 17, fieldId: "w2:box17" },
  { n: 18, fieldId: "w2:box18" },
  { n: 19, fieldId: "w2:box19" },
  { n: 20, fieldId: "w2:box20" },
];

// Box 12 holds up to 4 letter-code + amount slots, each clicked as one
// unit — the popover explanation depends on the code, resolved in
// TaxDocumentHelper/index.jsx via getBox12Annotation, not a static lookup.
const BOX_12_SLOTS = ["a", "b", "c", "d"];

// A box with no extracted value isn't clickable — rendered like the
// static (non-interactive) fields instead, with no accent border, no
// hover state, and no audio icon.
function renderInteractiveField(field, activeFieldId, onBoxClick) {
  const annotation = getAnnotation(field.fieldId);
  if (field.value === "—") {
    return (
      <div key={field.n} className="rounded-lg border border-dm-paper-line pt-[9px] px-[11px] pb-[11px]">
        <div className="text-[11px] leading-[1.25] text-dm-paper-disabled">
          <b className="text-[13px] text-dm-paper-disabled">{field.n}</b>
          &nbsp; {annotation?.label}
        </div>
        <div className="mt-[6px] text-lg font-semibold text-dm-paper-disabled">{field.value}</div>
      </div>
    );
  }
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
      <div className="mt-[6px] text-xl font-bold tracking-[0.02em] text-dm-paper-ink-strong">{field.value}</div>
    </div>
  );
}

export default function W2Document({ activeFieldId, onBoxClick, fieldValues }) {
  const INTERACTIVE_FIELDS = INTERACTIVE_FIELDS_TEMPLATE.map((field) => ({
    ...field,
    value: fieldValues[field.fieldId] || "—",
  }));
  const FIELDS_BEFORE_BOX_12 = INTERACTIVE_FIELDS.filter((f) => f.n <= 11);
  const FIELDS_AFTER_BOX_12 = INTERACTIVE_FIELDS.filter((f) => f.n >= 13);

  const BOX_12_FIELDS = BOX_12_SLOTS.map((slot) => {
    const code = fieldValues[`w2:box12${slot}_code`] || "";
    const amount = fieldValues[`w2:box12${slot}_amount`] || "";
    return {
      slot,
      fieldId: `w2:box12${slot}`,
      code,
      amount,
      label: getBox12Annotation(code).label,
    };
  });

  const taxYear = fieldValues["w2:taxYear"] || "—";
  const ssn = fieldValues["w2:boxA"] || "—";
  const ein = fieldValues["w2:boxB"] || "—";
  const employerNameAddress = fieldValues["w2:boxC"] || "—";
  const controlNumber = fieldValues["w2:boxD"] || "—";
  const employeeName = fieldValues["w2:boxE"] || "—";
  const employeeAddress = fieldValues["w2:boxF"] || "—";

  return (
    <div className="w-[600px] flex-none rounded-md border border-dm-paper-line bg-white p-[18px] text-dm-paper-ink">
      <div className="mb-[10px] flex gap-[10px]">
        <div className="w-32 flex-none rounded border border-dm-paper-line px-[10px] py-2">
          <div className="text-[10px] uppercase tracking-[0.06em] text-dm-paper-muted">
            a&nbsp;&nbsp;Employee SSN
          </div>
          <div className="mt-[3px] text-[17px] font-bold tracking-[0.04em]">
            {ssn}
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
              {taxYear}
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
            <div className="mt-[3px] text-base font-semibold">{ein}</div>
          </div>
          <div className="rounded border border-dm-paper-line px-[10px] py-2">
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
              d&nbsp;&nbsp;Control number
            </div>
            <div className="mt-[3px] text-[15px] font-semibold">
              {controlNumber}
            </div>
          </div>
          <div className="rounded border border-dm-paper-line px-[10px] py-2">
            <div className="text-[10px] uppercase tracking-[0.05em] text-dm-paper-muted">
              e&nbsp;&nbsp;Employee name
            </div>
            <div className="mt-[3px] text-[15px] font-semibold">
              {employeeName}
            </div>
          </div>
          <div className="flex-1 rounded border border-dm-paper-line px-[10px] py-2">
            <div className="text-[10px] uppercase tracking-[0.05em] text-dm-paper-muted">
              f&nbsp;&nbsp;Employee address
            </div>
            <div className="mt-[3px] text-[15px] font-semibold leading-[1.4]">
              {employeeAddress.split("\n").map((line, i) => (
                <span key={i}>
                  {i > 0 && <br />}
                  {line}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="grid flex-1 grid-cols-2 content-start gap-[10px]">
          {FIELDS_BEFORE_BOX_12.map((field) => renderInteractiveField(field, activeFieldId, onBoxClick))}

          <div className="col-span-2 rounded-lg border border-dm-paper-line pt-[9px] px-[11px] pb-[11px]">
            <div className="text-[11px] leading-[1.25] tracking-[0.03em] text-dm-paper-label">
              <b className="text-[13px] text-dm-accent">12</b>
              &nbsp; Codes a–d (up to 4 code + amount pairs)
            </div>
            <div className="mt-[8px] grid grid-cols-2 gap-[8px]">
              {BOX_12_FIELDS.map((field) => {
                const isActive = activeFieldId === field.fieldId;
                if (!field.code) {
                  return (
                    <div
                      key={field.slot}
                      className="rounded-lg border border-dm-paper-line px-[10px] py-[8px]"
                    >
                      <div className="text-[11px] leading-[1.25] text-dm-paper-disabled">
                        <b className="text-[13px] text-dm-paper-disabled">12{field.slot}</b>
                      </div>
                      <div className="mt-[5px] text-base font-semibold text-dm-paper-disabled">—</div>
                    </div>
                  );
                }
                return (
                  <div
                    key={field.slot}
                    onClick={(e) => onBoxClick(e, field.fieldId)}
                    className={`relative cursor-pointer rounded-lg border border-dm-paper-line border-l-4 border-l-dm-accent bg-dm-accent-soft px-[10px] py-[8px] outline-2 outline-offset-2 transition-[transform,box-shadow] duration-150 hover:-translate-y-px hover:shadow-[0_6px_18px_rgba(31,61,92,0.16)] ${
                      isActive ? "outline-dm-accent" : "outline-transparent"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-[6px]">
                      <div className="text-[11px] leading-[1.25] tracking-[0.03em] text-dm-paper-label">
                        <b className="text-[13px] text-dm-accent">12{field.slot}</b>
                        &nbsp; {field.label}
                      </div>
                      <span className="flex h-[22px] w-[22px] flex-none items-center justify-center rounded-full bg-dm-accent text-[10px] text-white">
                        <i className="fa-solid fa-volume-high" />
                      </span>
                    </div>
                    <div className="mt-[5px] text-base font-bold tracking-[0.02em] text-dm-paper-ink-strong">
                      {field.code}  {field.amount || "—"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {FIELDS_AFTER_BOX_12.map((field) => renderInteractiveField(field, activeFieldId, onBoxClick))}
        </div>
      </div>
    </div>
  );
}
