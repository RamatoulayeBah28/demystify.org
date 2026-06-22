import dynamic from "next/dynamic";
import { getFieldIds } from "@/lib/annotations";

const PdfPreview = dynamic(() => import("./PdfPreview"), { ssr: false });

export default function ViewerScreen({ fileName, fileUrl, documentType, pageNumber, fieldPositions, onBack }) {
  const hasAnnotations = getFieldIds(documentType).length > 0;

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

      <div className="mb-[26px] flex max-w-[608px] items-center gap-[14px] rounded-2xl border border-dm-line bg-dm-accent-soft px-[18px] py-[15px]">
        <span className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-[10px] bg-dm-accent text-base text-white">
          <i className={hasAnnotations ? "fa-solid fa-hand-pointer" : "fa-solid fa-circle-info"} />
        </span>
        <div>
          {hasAnnotations ? (
            <>
              <div className="text-[17px] font-semibold leading-[1.35]">
                Riix sanduuq kasta oo la calaamadeeyay si aad u maqasho sharaxaad fudud.
              </div>
              <div className="mt-0.5 text-sm text-dm-muted">
                Tap any highlighted box to hear a simple explanation.
              </div>
            </>
          ) : (
            <>
              <div className="text-[17px] font-semibold leading-[1.35]">
                Waa kan dukumentigaaga. Sharaxaadda qaybaha way ku soo biiri doontaa dhowaan.
              </div>
              <div className="mt-0.5 text-sm text-dm-muted">
                Here&apos;s your document. Field-by-field explanations are coming soon.
              </div>
            </>
          )}
        </div>
      </div>

      {fileUrl && (
        <PdfPreview
          fileUrl={fileUrl}
          documentType={documentType}
          pageNumber={pageNumber}
          fieldPositions={fieldPositions}
        />
      )}
    </div>
  );
}
