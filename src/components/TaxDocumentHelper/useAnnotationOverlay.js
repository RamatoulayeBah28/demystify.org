"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getAnnotation, getFieldIds, getLayout } from "@/lib/annotations";

const POPOVER_WIDTH = 344;
const POPOVER_HEIGHT = 480;
const POPOVER_GAP = 16;

// Resolves which fields have a usable position to render a dot for —
// preferring the OCR-derived position, falling back to the static
// per-type layout guess when OCR couldn't locate that field.
export function resolveFieldPositions(documentType, fieldPositions) {
  const fallbackLayout = getLayout(documentType) ?? {};
  return getFieldIds(documentType)
    .map((fieldId) => {
      const bareId = fieldId.split(":")[1];
      const position = fieldPositions[fieldId] ?? fallbackLayout[bareId];
      return position ? { fieldId, position, label: getAnnotation(fieldId)?.label } : null;
    })
    .filter(Boolean);
}

// Shared popover/simulated-audio state behind the field-dot overlay, used
// by both PdfPreview and ImagePreview so the interaction logic only lives
// once. `containerRef` must be attached to the position:relative element
// the dots' percentage coordinates (and the popover's pixel position) are
// measured against.
export function useAnnotationOverlay() {
  const [activeFieldId, setActiveFieldId] = useState(null);
  const [popTop, setPopTop] = useState(0);
  const [popLeft, setPopLeft] = useState(0);
  const [popSide, setPopSide] = useState("right");
  const [playLang, setPlayLang] = useState(null);
  const [progress, setProgress] = useState(0);

  const containerRef = useRef(null);
  const timerRef = useRef(null);

  const active = activeFieldId ? getAnnotation(activeFieldId) : null;

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => stopTimer, []);

  const openField = useCallback((e, fieldId) => {
    const container = containerRef.current;
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

  return {
    containerRef,
    activeFieldId,
    active,
    popTop,
    popLeft,
    popSide,
    playLang,
    progress,
    openField,
    closePopover,
    toggle,
  };
}
