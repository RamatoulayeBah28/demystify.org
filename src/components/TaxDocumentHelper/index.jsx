"use client";

import { useEffect, useRef, useState } from "react";
import { getAnnotation } from "@/lib/annotations";
import Nav from "./Nav";
import UploadScreen from "./UploadScreen";
import ViewerScreen from "./ViewerScreen";
import AnnotationPopover from "./AnnotationPopover";

const DEFAULT_FILE_NAME = "W-2_2025_Warsame.pdf";
const POPOVER_WIDTH = 344;
const POPOVER_HEIGHT = 480;
const POPOVER_GAP = 16;

export default function TaxDocumentHelper() {
  const [screen, setScreen] = useState("upload");
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
    setActiveN(null);
    setPlayLang(null);
  };

  const closePop = () => {
    stopTimer();
    setActiveN(null);
    setPlayLang(null);
    setProgress(0);
  };

  const onBrowse = () => {
    setScreen("viewer");
    setActiveN(null);
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
    setScreen("viewer");
    setActiveN(null);
  };

  const active = activeN
    ? { n: activeN, ...getAnnotation("w2", `box${activeN}`) }
    : null;

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen bg-dm-bg text-dm-ink"
    >
      <Nav />

      {screen === "upload" && (
        <UploadScreen
          dragOver={dragOver}
          onBrowse={onBrowse}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        />
      )}

      {screen === "viewer" && (
        <ViewerScreen
          fileName={DEFAULT_FILE_NAME}
          onBack={goUpload}
          activeN={activeN}
          onBoxClick={openBox}
        />
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
