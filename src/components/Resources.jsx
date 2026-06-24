"use client";

import { useEffect, useRef, useState } from "react";

// Static video walkthrough catalog — independent of the OCR/annotation
// pipeline. Real video assets/scripts come later; for now this is the
// browsing + playback UI with simulated progress.
const VIDEOS = [
  {
    id: "w2",
    soTitle: "W-2-ga oo si fudud loo sharxay",
    enTitle: "W-2 explained simply",
    len: "4:12",
    cat: "Aasaaska · Basics",
    sub: "Warqaddan waxay tusinaysaa waxí aad sannadkii kasbatay iyo canshuurta la jaray.",
  },
  {
    id: "file",
    soTitle: "Sidee canshuurta loo gudbiyaa",
    enTitle: "How do you file taxes",
    len: "6:08",
    cat: "Gudbinta · Filing",
    sub: "Tallaabo tallaabo: ka bilow warqadahaaga ilaa aad u gudbiso canshuurtaada.",
  },
  {
    id: "1040",
    soTitle: "Foomka 1040 — waa maxay?",
    enTitle: "Understanding Form 1040",
    len: "5:21",
    cat: "Foomamka · Forms",
    sub: "Foomka 1040 waa warqadda ugu weyn ee aad dawladda u gudbiso sannad kasta.",
  },
  {
    id: "deduct",
    soTitle: "Waa maxay standard deduction?",
    enTitle: "What is a standard deduction",
    len: "3:45",
    cat: "Jarista · Deductions",
    sub: "Qaddar la go’aamiyay oo dakhligaaga laga jaro ka hor xisaabinta canshuurta.",
  },
  {
    id: "refund",
    soTitle: "Sida lacag-celintu u shaqeyso",
    enTitle: "How tax refunds work",
    len: "4:30",
    cat: "Lacag-celin · Refunds",
    sub: "Haddii aad bixisay canshuur ka badan intii loo baahnaa, dawladdu way ku celinaysaa.",
  },
  {
    id: "1099",
    soTitle: "1099 iyo W-2 — faraqooda",
    enTitle: "1099 vs W-2 — the difference",
    len: "5:02",
    cat: "Foomamka · Forms",
    sub: "W-2 waxaa bixiya loo-shaqeeyahaaga; 1099 waxay khusaysaa shaqada madax-banaan.",
  },
];

export default function Resources() {
  const [activeVideoId, setActiveVideoId] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef(null);

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => stopTimer, []);

  const openVideo = (id) => {
    stopTimer();
    setActiveVideoId(id);
    setPlaying(false);
    setProgress(0);
  };

  const closeVideo = () => {
    stopTimer();
    setActiveVideoId(null);
    setPlaying(false);
    setProgress(0);
  };

  const toggleVideo = () => {
    if (playing) {
      stopTimer();
      setPlaying(false);
      return;
    }
    stopTimer();
    setPlaying(true);
    timerRef.current = setInterval(() => {
      setProgress((p) => {
        const next = p + 0.6;
        if (next >= 100) {
          stopTimer();
          setPlaying(false);
          return 100;
        }
        return next;
      });
    }, 120);
  };

  const video = VIDEOS.find((v) => v.id === activeVideoId) || null;

  return (
    <div className="mx-auto max-w-[1080px] px-8 py-[60px] pb-24">
      <div className="mb-[14px] text-[13px] font-bold uppercase tracking-[0.18em] text-dm-muted">
        Maktabadda Muqaalka · Video library
      </div>
      <h1 className="mb-3 font-serif text-[44px] font-semibold leading-[1.12] tracking-[-0.015em] text-dm-ink">
        Baro canshuurta — cod Soomaali ah
      </h1>
      <p className="mb-10 max-w-[600px] text-lg leading-[1.5] text-dm-muted">
        Muqaallo kooban oo sharxaya hannaanka canshuurta, oo dhammaantood leh cod-celin Soomaali ah. Short tax
        explainers, each re-voiced in Somali.
      </p>

      <div className="grid grid-cols-3 gap-6">
        {VIDEOS.map((v) => (
          <div
            key={v.id}
            onClick={() => openVideo(v.id)}
            className="cursor-pointer overflow-hidden rounded-[18px] border border-dm-line bg-dm-surface transition-[transform,box-shadow] duration-150 hover:-translate-y-[3px] hover:shadow-[0_16px_40px_rgba(31,61,92,0.14)]"
          >
            <div className="relative flex aspect-video items-center justify-center border-b border-dm-line bg-dm-accent-soft">
              <span className="flex h-[58px] w-[58px] items-center justify-center rounded-full bg-dm-accent pl-1 text-xl text-white shadow-[0_6px_20px_rgba(31,61,92,0.22)]">
                <i className="fa-solid fa-play" />
              </span>
              <span className="absolute top-[10px] left-[10px] inline-flex items-center gap-[6px] rounded-full bg-[rgba(31,42,54,0.78)] px-[10px] py-[5px] text-[11px] font-bold tracking-[0.02em] text-white">
                <i className="fa-solid fa-language" /> Cod Soomaali
              </span>
              <span className="absolute bottom-[10px] right-[10px] rounded-md bg-[rgba(31,42,54,0.78)] px-2 py-[3px] text-xs font-semibold text-white">
                {v.len}
              </span>
            </div>
            <div className="px-[18px] py-4 pb-[18px]">
              <div className="mb-[7px] text-xs font-semibold uppercase tracking-[0.04em] text-dm-accent">{v.cat}</div>
              <div className="mb-1 font-serif text-xl font-semibold leading-[1.25] text-dm-ink">{v.soTitle}</div>
              <div className="text-sm text-dm-muted">{v.enTitle}</div>
            </div>
          </div>
        ))}
      </div>

      {video && (
        <div
          onClick={closeVideo}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-[rgba(20,30,42,0.55)] p-8 backdrop-blur-[3px] animate-[dm-pop_0.18s_ease]"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-[760px] max-w-full overflow-hidden rounded-[22px] bg-dm-panel shadow-[0_30px_80px_rgba(20,30,42,0.4)]"
          >
            <div className="relative flex aspect-video items-center justify-center bg-[#1f2a36]">
              <button
                type="button"
                onClick={toggleVideo}
                className="flex h-[74px] w-[74px] items-center justify-center rounded-full bg-dm-accent pl-1 text-[26px] text-white shadow-[0_8px_26px_rgba(0,0,0,0.35)]"
              >
                <i className={playing ? "fa-solid fa-pause" : "fa-solid fa-play"} />
              </button>
              <span className="absolute top-[14px] left-[14px] inline-flex items-center gap-[7px] rounded-full bg-white/[0.16] px-3 py-[6px] text-xs font-bold text-white">
                <i className="fa-solid fa-language" /> Cod-celin Soomaali · Somali voiceover
              </span>
              <button
                type="button"
                onClick={closeVideo}
                className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.16] text-[15px] text-white"
              >
                <i className="fa-solid fa-xmark" />
              </button>
              <div className="absolute inset-x-0 bottom-0 h-[5px] bg-white/[0.18]">
                <div className="h-full bg-dm-accent transition-[width] duration-100" style={{ width: `${progress}%` }} />
              </div>
            </div>
            <div className="px-[26px] py-[22px] pb-[26px]">
              <div className="mb-2 text-xs font-semibold uppercase tracking-[0.04em] text-dm-accent">{video.cat}</div>
              <div className="mb-1 font-serif text-[27px] font-semibold leading-[1.2] text-dm-ink">{video.soTitle}</div>
              <div className="mb-4 text-[15px] text-dm-muted">
                {video.enTitle} · {video.len}
              </div>
              <div className="flex items-start gap-3 rounded-[13px] border border-dm-line bg-dm-accent-soft px-4 py-[14px]">
                <span className="flex h-[30px] w-[30px] flex-none items-center justify-center rounded-lg bg-dm-accent text-[13px] text-white">
                  <i className="fa-solid fa-closed-captioning" />
                </span>
                <div className="text-base leading-[1.5] text-dm-ink">{video.sub}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
