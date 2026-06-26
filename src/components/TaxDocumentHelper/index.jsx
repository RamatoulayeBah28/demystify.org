"use client";

import { useEffect, useRef, useState } from "react";
import { getAnnotation } from "@/lib/annotations";
import { SUPPORTED_TYPES } from "@/lib/documentTypes";
import UploadScreen from "./UploadScreen";
import DetectingScreen from "./DetectingScreen";
import UnmatchedScreen from "./UnmatchedScreen";
import ViewerScreen from "./ViewerScreen";
import AnnotationPopover from "./AnnotationPopover";

const ACCEPTED_TYPES = ["application/pdf", "image/jpeg", "image/png"];
const POPOVER_WIDTH = 344;
const POPOVER_HEIGHT = 480;
const POPOVER_GAP = 16;

// Fire-and-forget anonymous aggregate counter only — no file content, no
// filename, no identity ever leaves the browser. Consistent with the
// project's ephemeral-processing rule for everything else in this flow.
function recordFileUploaded() {
  fetch("/api/stats/increment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key: "files_uploaded" }),
  }).catch(() => {});
}

export default function TaxDocumentHelper() {
  const [screen, setScreen] = useState("upload");
  const [fileName, setFileName] = useState(null);
  const [documentType, setDocumentType] = useState(null);
  const [fieldValues, setFieldValues] = useState({});
  const [activeN, setActiveN] = useState(null);
  const [popTop, setPopTop] = useState(0);
  const [popLeft, setPopLeft] = useState(0);
  const [popSide, setPopSide] = useState("right");
  const [playLang, setPlayLang] = useState(null);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);

  const containerRef = useRef(null);
  const timerRef = useRef(null);

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => stopTimer, []);

  const openBox = (e, n) => {
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
    top = Math.max(80, Math.min(top, c.height - POPOVER_HEIGHT - 20));
    stopTimer();
    setActiveN(n);
    setPopLeft(left);
    setPopTop(top);
    setPopSide(side);
    setPlayLang(null);
    setProgress(0);
  };

  // Simulated playback only — there's no audio file or TTS call here, just
  // a progress bar that fills over ~4.5s. Real audio for the annotation
  // library is a separate, not-yet-built piece of work.
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

  const goUpload = () => {
    stopTimer();
    setScreen("upload");
    setDocumentType(null);
    setFieldValues({});
    setActiveN(null);
    setPlayLang(null);
  };

  const closePop = () => {
    stopTimer();
    setActiveN(null);
    setPlayLang(null);
    setProgress(0);
  };

  const acceptFile = async (candidate) => {
    if (!candidate || !ACCEPTED_TYPES.includes(candidate.type)) return;
    recordFileUploaded();
    setFileName(candidate.name);
    setScreen("detecting");

    let detected = null;
    let extracted = {};
    try {
      const formData = new FormData();
      formData.append("file", candidate);
      const res = await fetch("/api/extract", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) {
        detected = data.documentType;
        extracted = data.fieldValues || {};
      }
    } catch {
      // Treated the same as an unrecognized document below.
    }

    const supported =
      detected && SUPPORTED_TYPES.has(detected) ? detected : null;
    setDocumentType(supported);
    setFieldValues(extracted);
    setActiveN(null);
    setScreen(supported ? "viewer" : "unmatched");
  };

  const onDragOver = (e) => {
    e.preventDefault();
    if (!dragOver) setDragOver(true);
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    acceptFile(e.dataTransfer.files?.[0]);
  };

  const active = activeN
    ? { n: activeN, ...getAnnotation(`${documentType}:box${activeN}`) }
    : null;

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen bg-dm-bg text-dm-ink"
    >
      {screen === "upload" && (
        <UploadScreen
          dragOver={dragOver}
          onFileSelected={acceptFile}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        />
      )}

      {screen === "detecting" && <DetectingScreen />}

      {screen === "viewer" && (
        <ViewerScreen
          documentType={documentType}
          fileName={fileName}
          fieldValues={fieldValues}
          onBack={goUpload}
          activeN={activeN}
          onBoxClick={openBox}
        />
      )}

      {screen === "unmatched" && (
        <UnmatchedScreen onBack={goUpload} fileName={fileName} />
      )}

      {active && (
        <AnnotationPopover
          active={active}
          top={popTop}
          left={popLeft}
          side={popSide}
          playLang={playLang}
          progress={progress}
          onClose={closePop}
          onPlaySomali={() => toggle("so")}
          onPlayEnglish={() => toggle("en")}
        />
      )}
    </div>
  );
}
