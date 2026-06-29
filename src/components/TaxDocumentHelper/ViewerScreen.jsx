import W2Document from "./W2Document";
import W2cDocument from "./W2cDocument";
import Nec1099Document from "./Nec1099Document";
import Int1099Document from "./Int1099Document";
import G1099Document from "./G1099Document";
import R1099Document from "./R1099Document";
import Ssa1099Document from "./Ssa1099Document";
import T1098Document from "./T1098Document";
import Misc1099Document from "./Misc1099Document";
import W4Document from "./W4Document";
import Es1040Document from "./Es1040Document";
import W9Document from "./W9Document";
import T4506Document from "./T4506Document";
import InstallmentAgreementDocument from "./InstallmentAgreementDocument";
import Ss4Document from "./Ss4Document";
import W7Document from "./W7Document";
import Form1040Document from "./Form1040Document";
import Form1040SrDocument from "./Form1040SrDocument";
import Schedule1Document from "./Schedule1Document";
import Schedule1ADocument from "./Schedule1ADocument";
import Schedule2Document from "./Schedule2Document";
import Schedule3Document from "./Schedule3Document";
import Form941Document from "./Form941Document";
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
  w4: W4Document,
  "1040-es": Es1040Document,
  w9: W9Document,
  "4506-t": T4506Document,
  "9465": InstallmentAgreementDocument,
  "ss-4": Ss4Document,
  w7: W7Document,
  "1040": Form1040Document,
  "1040-sr": Form1040SrDocument,
  "schedule-1": Schedule1Document,
  "schedule-1-a": Schedule1ADocument,
  "schedule-2": Schedule2Document,
  "schedule-3": Schedule3Document,
  "941": Form941Document,
};

export default function ViewerScreen({
  documentType,
  documentCount,
  activeDocIndex,
  onSwitchDocument,
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

      {documentCount > 1 && (
        <div className="mx-auto mb-[18px] flex max-w-[608px] flex-wrap justify-center gap-[8px]">
          {Array.from({ length: documentCount }, (_, i) => (
            <button
              key={i}
              onClick={() => onSwitchDocument(i)}
              className={`rounded-full border px-[14px] py-[7px] text-sm font-semibold transition-colors ${
                i === activeDocIndex
                  ? "border-dm-accent bg-dm-accent text-white"
                  : "border-dm-line bg-dm-surface text-dm-ink"
              }`}
            >
              Document {i + 1} of {documentCount}
            </button>
          ))}
        </div>
      )}

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
