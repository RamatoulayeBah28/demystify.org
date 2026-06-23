"use client";

import { useState } from "react";
import { Document, Page } from "react-pdf";
import "@/lib/pdf/pdfWorker";
import { resolveFieldPositions, useAnnotationOverlay } from "./useAnnotationOverlay";
import FieldDot from "./FieldDot";
import AnnotationPopover from "./AnnotationPopover";

const PAGE_WIDTH = 944;

export default function PdfPreview({ fileUrl, documentType, pageNumber = 1, fieldPositions = {} }) {
  const [numPages, setNumPages] = useState(0);
  const { containerRef, ...overlay } = useAnnotationOverlay();
  const fields = resolveFieldPositions(documentType, fieldPositions);

  return (
    <div className="rounded-md border border-dm-line bg-white p-4">
      <Document
        file={fileUrl}
        onLoadSuccess={({ numPages: count }) => setNumPages(count)}
        loading={<div className="py-20 text-center text-dm-muted">Loading…</div>}
      >
        {numPages > 0 && (
          <>
            {Array.from({ length: pageNumber - 1 }, (_, i) => (
              <div key={i + 1} className="relative mt-4 first:mt-0">
                <Page
                  pageNumber={i + 1}
                  width={PAGE_WIDTH}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />
              </div>
            ))}

            <div ref={containerRef} className="relative mt-4 first:mt-0">
              <Page
                pageNumber={pageNumber}
                width={PAGE_WIDTH}
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />

              {fields.map(({ fieldId, position, label }) => (
                <FieldDot
                  key={fieldId}
                  position={position}
                  onClick={(e) => overlay.openField(e, fieldId)}
                  label={label}
                />
              ))}

              {overlay.active && (
                <AnnotationPopover
                  active={overlay.active}
                  top={overlay.popTop}
                  left={overlay.popLeft}
                  side={overlay.popSide}
                  playLang={overlay.playLang}
                  progress={overlay.progress}
                  onClose={overlay.closePopover}
                  onPlaySomali={() => overlay.toggle("so")}
                  onPlayEnglish={() => overlay.toggle("en")}
                />
              )}
            </div>

            {Array.from({ length: Math.max(numPages - pageNumber, 0) }, (_, i) => (
              <div key={pageNumber + i + 1} className="relative mt-4">
                <Page
                  pageNumber={pageNumber + i + 1}
                  width={PAGE_WIDTH}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />
              </div>
            ))}
          </>
        )}
      </Document>
    </div>
  );
}
