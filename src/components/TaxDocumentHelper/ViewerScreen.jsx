import W2Document from "./W2Document";
import W2cDocument from "./W2cDocument";
import Nec1099Document from "./Nec1099Document";
import Int1099Document from "./Int1099Document";
import G1099Document from "./G1099Document";
import R1099Document from "./R1099Document";
import Ssa1099Document from "./Ssa1099Document";
import T1098Document from "./T1098Document";
import Misc1099Document from "./Misc1099Document";
import ChatPanel from "./ChatPanel";

const DOCUMENTS = {
  w2: W2Document,
  w2c: W2cDocument,
  "1099-nec": Nec1099Document,
  "1099-int": Int1099Document,
  "1099-g": G1099Document,
  "1099-r": R1099Document,
  "ssa-1099": Ssa1099Document,
  "1098-t": T1098Document,
  "1099-misc": Misc1099Document,
};

export default function ViewerScreen({
  documentType,
  fileName,
  fieldValues,
  onBack,
  activeFieldId,
  onBoxClick,
}) {
  const DocumentComponent = DOCUMENTS[documentType] ?? W2Document;

  return (
    <div className="mx-auto max-w-[1040px] px-8 pt-[26px] pb-[90px]">
      <div className="mb-[18px] flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-[9px] rounded-[11px] border border-dm-line bg-dm-surface px-4 py-[10px] text-base font-semibold text-dm-ink"
        >
          <i className="fa-solid fa-arrow-left" /> Dib u noqo
        </button>
        <span className="inline-flex items-center gap-[9px] text-[15px] font-medium text-dm-muted">
          <i className="fa-regular fa-file-pdf text-dm-accent" /> {fileName}
        </span>
      </div>

      <div className="mx-auto mb-[26px] flex max-w-[608px] items-center gap-[14px] rounded-2xl border border-dm-line bg-dm-accent-soft px-[18px] py-[15px]">
        <span className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-[10px] bg-dm-accent text-base text-white">
          <i className="fa-solid fa-hand-pointer" />
        </span>
        <div>
          <div className="text-[17px] font-semibold leading-[1.35]">
            Riix sanduuq kasta oo la calaamadeeyay si aad u maqasho sharaxaad
            fudud.
          </div>
          <div className="mt-0.5 text-sm text-dm-muted">
            Tap any highlighted box to hear a simple explanation.
          </div>
        </div>
      </div>

      <div className="flex items-start justify-center">
        <DocumentComponent
          activeFieldId={activeFieldId}
          onBoxClick={onBoxClick}
          fieldValues={fieldValues}
        />
      </div>

      <ChatPanel documentType={documentType} fieldValues={fieldValues} />
    </div>
  );
}
