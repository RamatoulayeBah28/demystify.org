"use client";

import { useEffect, useRef, useState } from "react";
import { getAnnotation } from "@/lib/annotations";
import { getBox12Annotation } from "@/lib/box12Codes";
import UploadScreen from "./UploadScreen";
import DetectingScreen from "./DetectingScreen";
import UnmatchedScreen from "./UnmatchedScreen";
import ViewerScreen from "./ViewerScreen";
import AnnotationPopover from "./AnnotationPopover";

const ACCEPTED_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/heic", "image/heif"];
// Browsers/OSes are inconsistent about reporting a MIME type for HEIC
// files (some leave candidate.type blank) — fall back to the extension.
const HEIC_EXTENSION_PATTERN = /\.(heic|heif)$/i;
// W-2 box 12 slots (e.g. "w2:box12a") aren't real annotation keys — the
// explanation depends on which letter code was extracted into that slot,
// so resolution reads the code back out of fieldValues instead of doing a
// static lookup.
const BOX_12_SLOT_PATTERN = /^w2:box12([a-d])$/;

function resolveActiveAnnotation(fieldId, fieldValues) {
  const slotMatch = fieldId.match(BOX_12_SLOT_PATTERN);
  if (slotMatch) {
    const code = fieldValues[`w2:box12${slotMatch[1]}_code`];
    return getBox12Annotation(code);
  }
  return getAnnotation(fieldId);
}

// A box with nothing extracted isn't interactive at all — w2c stores its
// values under :previous/:corrected suffixes rather than the bare fieldId,
// so it needs its own check; everything else (including box 12 slots) can
// look at fieldValues[fieldId] directly.
function fieldHasValue(fieldId, fieldValues) {
  const slotMatch = fieldId.match(BOX_12_SLOT_PATTERN);
  if (slotMatch) {
    return Boolean(fieldValues[`w2:box12${slotMatch[1]}_code`]);
  }
  if (fieldId.startsWith("w2c:box")) {
    return Boolean(fieldValues[`${fieldId}:previous`]) || Boolean(fieldValues[`${fieldId}:corrected`]);
  }
  return Boolean(fieldValues[fieldId]);
}

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
  // One upload can contain several distinct documents (e.g. a multi-page
  // PDF with a W-2 followed by a 1099-NEC) — each entry is its own
  // {documentType, fieldValues}, and activeDocIndex picks which one the
  // viewer currently shows.
  const [documents, setDocuments] = useState([]);
  const [notTaxDocument, setNotTaxDocument] = useState(false);
  const [activeDocIndex, setActiveDocIndex] = useState(0);
  // Full "doctype:box1"-style key, not a bare number — some forms have
  // non-numeric box labels (e.g. 1099-R's box2a), so the annotation
  // lookup can't assume "box" + a number.
  const [activeFieldId, setActiveFieldId] = useState(null);
  const [popTop, setPopTop] = useState(0);
  const [popLeft, setPopLeft] = useState(0);
  const [popSide, setPopSide] = useState("right");
  const [playLang, setPlayLang] = useState(null);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);

  const containerRef = useRef(null);
  const timerRef = useRef(null);
  const utteranceRef = useRef(null);
  const audioRef = useRef(null);

  const activeDocument = documents[activeDocIndex] ?? null;
  const documentType = activeDocument?.documentType ?? null;
  const fieldValues = activeDocument?.fieldValues ?? {};

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (utteranceRef.current) {
      if (typeof window !== "undefined") window.speechSynthesis?.cancel();
      utteranceRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  };

  useEffect(() => stopTimer, []);

  const openBox = (e, fieldId) => {
    if (!fieldHasValue(fieldId, fieldValues)) return;
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
    setActiveFieldId(fieldId);
    setPopLeft(left);
    setPopTop(top);
    setPopSide(side);
    setPlayLang(null);
    setProgress(0);
  };

  const toggle = (lang, text) => {
    if (playLang === lang) {
      stopTimer();
      setPlayLang(null);
      return;
    }
    stopTimer();
    setPlayLang(lang);
    setProgress(0);

    if (lang === "so" && text && typeof window !== "undefined") {
      const audio = new Audio(encodeURI(text));
      audioRef.current = audio;
      audio.ontimeupdate = () => {
        if (audio.duration) setProgress((audio.currentTime / audio.duration) * 100);
      };
      audio.onended = () => { stopTimer(); setPlayLang(null); setProgress(0); };
      audio.onerror = () => { stopTimer(); setPlayLang(null); setProgress(0); };
      audio.play().catch(() => { stopTimer(); setPlayLang(null); setProgress(0); });
      return;
    }

    const canSpeak =
      lang === "en" &&
      text &&
      typeof window !== "undefined" &&
      window.speechSynthesis;

    if (canSpeak) {
      // Estimate duration at ~12.5 chars/sec (150 wpm × 5 chars/word) so the
      // progress bar stays roughly in sync with the actual speech.
      const estMs = Math.max(3000, text.length * 80);
      const step = 100 / (estMs / 110);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utteranceRef.current = utterance;
      utterance.onend = () => { stopTimer(); setPlayLang(null); setProgress(0); };
      utterance.onerror = () => { stopTimer(); setPlayLang(null); setProgress(0); };
      window.speechSynthesis.speak(utterance);
      timerRef.current = setInterval(() => {
        setProgress((p) => {
          const next = p + step;
          if (next >= 100) { clearInterval(timerRef.current); timerRef.current = null; return 100; }
          return next;
        });
      }, 110);
    } else {
      // Somali (no browser TTS support) or unsupported browser: simulated bar.
      timerRef.current = setInterval(() => {
        setProgress((p) => {
          const next = p + 2.4;
          if (next >= 100) { stopTimer(); setPlayLang(null); return 100; }
          return next;
        });
      }, 110);
    }
  };

  const goUpload = () => {
    stopTimer();
    setScreen("upload");
    setDocuments([]);
    setNotTaxDocument(false);
    setActiveDocIndex(0);
    setActiveFieldId(null);
    setPlayLang(null);
  };

  const closePop = () => {
    stopTimer();
    setActiveFieldId(null);
    setPlayLang(null);
    setProgress(0);
  };

  const switchDocument = (index) => {
    stopTimer();
    setActiveDocIndex(index);
    setActiveFieldId(null);
    setPlayLang(null);
    setProgress(0);
  };

  const acceptFile = async (candidate) => {
    const isAccepted =
      candidate &&
      (ACCEPTED_TYPES.includes(candidate.type) || HEIC_EXTENSION_PATTERN.test(candidate.name ?? ""));
    if (!isAccepted) return;
    recordFileUploaded();
    setFileName(candidate.name);
    setScreen("detecting");

    let found = [];
    let fileWasNotTaxDocument = false;
    try {
      const formData = new FormData();
      formData.append("file", candidate);
      const res = await fetch("/api/extract", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) {
        found = data.documents || [];
        fileWasNotTaxDocument = Boolean(data.notTaxDocument);
      }
    } catch {
      // Treated the same as an unrecognized document below.
    }

    setDocuments(found);
    setNotTaxDocument(fileWasNotTaxDocument);
    setActiveDocIndex(0);
    setActiveFieldId(null);
    setScreen(found.length ? "viewer" : "unmatched");
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

  const active = activeFieldId
    ? resolveActiveAnnotation(activeFieldId, fieldValues)
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
          documentCount={documents.length}
          activeDocIndex={activeDocIndex}
          onSwitchDocument={switchDocument}
          fileName={fileName}
          fieldValues={fieldValues}
          onBack={goUpload}
          activeFieldId={activeFieldId}
          onBoxClick={openBox}
        />
      )}

      {screen === "unmatched" && (
        <UnmatchedScreen onBack={goUpload} fileName={fileName} notTaxDocument={notTaxDocument} />
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
          onPlaySomali={() => toggle("so", active.soAudio)}
          onPlayEnglish={() => toggle("en", active.en)}
        />
      )}
    </div>
  );
}
