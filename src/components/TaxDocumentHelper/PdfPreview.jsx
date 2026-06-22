"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Document, Page } from "react-pdf";
import "@/lib/pdf/pdfWorker";
import { getAnnotation, getFieldIds, getLayout } from "@/lib/annotations";
import AnnotationPopover from "./AnnotationPopover";

const PAGE_WIDTH = 944;
const POPOVER_WIDTH = 344;
const POPOVER_HEIGHT = 480;
const POPOVER_GAP = 16;

export default function PdfPreview({ fileUrl, documentType, pageNumber = 1, fieldPositions = {} }) {
  const [numPages, setNumPages] = useState(0);
  const [activeFieldId, setActiveFieldId] = useState(null);
  const [popTop, setPopTop] = useState(0);
  const [popLeft, setPopLeft] = useState(0);
  const [popSide, setPopSide] = useState("right");
  const [playLang, setPlayLang] = useState(null);
  const [progress, setProgress] = useState(0);

  const pageContainerRef = useRef(null);
  const timerRef = useRef(null);

  const fieldIds = getFieldIds(documentType);
  const fallbackLayout = getLayout(documentType) ?? {};
  const active = activeFieldId ? getAnnotation(activeFieldId) : null;

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => stopTimer, []);

  const openField = useCallback((e, fieldId) => {
    const container = pageContainerRef.current;
    if (!container) return;
    const c = container.getBoundingClientRect();
    const b = e.currentTarget.getBoundingClientRect();
    let side = "right";
    let left = b.right - c.left + POPOVER_GAP;
    if (left + POPOVER_WIDTH > c.width - 14) {
      left = b.left - c.left - POPOVER_WIDTH - POPOVER_GAP;
      side = "left";
    }
    if (left < 14) left = 14;
    let top = b.top - c.top - 10;
    top = Math.max(0, Math.min(top, c.height - POPOVER_HEIGHT - 20));
    stopTimer();
    setActiveFieldId(fieldId);
    setPopLeft(left);
    setPopTop(top);
    setPopSide(side);
    setPlayLang(null);
    setProgress(0);
  }, []);

  const closePopover = () => {
    stopTimer();
    setActiveFieldId(null);
    setPlayLang(null);
    setProgress(0);
  };

  const toggle = (lang) => {
    if (playLang === lang) {
      stopTimer();
      setPlayLang(null);
      return;
    }
    stopTimer();
    setPlayLang(lang);
    setProgress(0);
    timerRef.current = setInterval(() => {
      setProgress((p) => {
        const next = p + 2.4;
        if (next >= 100) {
          stopTimer();
          setPlayLang(null);
          return 100;
        }
        return next;
      });
    }, 110);
  };

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

            <div ref={pageContainerRef} className="relative mt-4 first:mt-0">
              <Page
                pageNumber={pageNumber}
                width={PAGE_WIDTH}
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />

              {fieldIds.map((fieldId) => {
                const bareId = fieldId.split(":")[1];
                const position = fieldPositions[fieldId] ?? fallbackLayout[bareId];
                if (!position) return null;
                return (
                  <button
                    key={fieldId}
                    type="button"
                    onClick={(e) => openField(e, fieldId)}
                    aria-label={getAnnotation(fieldId)?.label}
                    style={{ top: `${position.y * 100}%`, left: `${position.x * 100}%` }}
                    className="absolute flex h-5 w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center"
                  >
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-dm-accent opacity-60" />
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-dm-accent ring-2 ring-white" />
                  </button>
                );
              })}

              {active && (
                <AnnotationPopover
                  active={active}
                  top={popTop}
                  left={popLeft}
                  side={popSide}
                  playLang={playLang}
                  progress={progress}
                  onClose={closePopover}
                  onPlaySomali={() => toggle("so")}
                  onPlayEnglish={() => toggle("en")}
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
