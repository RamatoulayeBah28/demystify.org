"use client";

import Image from "next/image";
import { useState } from "react";

// Static video walkthrough catalog — independent of the OCR/annotation
// pipeline. Real Somali-language tax explainer videos, embedded via
// YouTube's standard embed iframe.
const VIDEOS = [
  { id: "bP6SplioHw4", title: "Minnesota K-12 Education Credit and Subtraction" },
  { id: "N4h4_C4YllI", title: "A Day in the Life of a Tax Return" },
  { id: "kvXVuoH_XJA", title: "File Your Homeowners Property Tax Refund Online" },
  { id: "2yWwTdEMRwQ", title: "Where's My Refund?" },
  { id: "IHzm_2kvN-0", title: "Renters Filing a Property Tax Refund" },
  { id: "dusHTs6TrXY", title: "What to Do If You Owe State Income Taxes" },
];

export default function Resources() {
  const [activeVideoId, setActiveVideoId] = useState(null);

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
            onClick={() => setActiveVideoId(v.id)}
            className="cursor-pointer overflow-hidden rounded-[18px] border border-dm-line bg-dm-surface transition-[transform,box-shadow] duration-150 hover:-translate-y-[3px] hover:shadow-[0_16px_40px_rgba(31,61,92,0.14)]"
          >
            <div className="relative aspect-video border-b border-dm-line bg-dm-accent-soft">
              <Image
                src={`https://img.youtube.com/vi/${v.id}/hqdefault.jpg`}
                alt={v.title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover"
              />
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="flex h-[58px] w-[58px] items-center justify-center rounded-full bg-dm-accent pl-1 text-xl text-white shadow-[0_6px_20px_rgba(31,61,92,0.22)]">
                  <i className="fa-solid fa-play" />
                </span>
              </span>
              <span className="absolute top-[10px] left-[10px] inline-flex items-center gap-[6px] rounded-full bg-[rgba(31,42,54,0.78)] px-[10px] py-[5px] text-[11px] font-bold tracking-[0.02em] text-white">
                <i className="fa-solid fa-language" /> Cod Soomaali
              </span>
            </div>
            <div className="px-[18px] py-4 pb-[18px]">
              <div className="font-serif text-xl font-semibold leading-[1.25] text-dm-ink">{v.title}</div>
            </div>
          </div>
        ))}
      </div>

      {video && (
        <div
          onClick={() => setActiveVideoId(null)}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-[rgba(20,30,42,0.55)] p-8 backdrop-blur-[3px] animate-[dm-pop_0.18s_ease]"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-[760px] max-w-full overflow-hidden rounded-[22px] bg-dm-panel shadow-[0_30px_80px_rgba(20,30,42,0.4)]"
          >
            <div className="relative aspect-video bg-[#1f2a36]">
              <iframe
                key={video.id}
                src={`https://www.youtube.com/embed/${video.id}?autoplay=1&cc_load_policy=1&cc_lang_pref=so`}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
              />
              <button
                type="button"
                onClick={() => setActiveVideoId(null)}
                className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.16] text-[15px] text-white"
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>
            <div className="px-[26px] py-[22px] pb-[26px]">
              <div className="mb-1 inline-flex items-center gap-[7px] rounded-full bg-dm-accent-soft px-3 py-[6px] text-xs font-bold text-dm-accent">
                <i className="fa-solid fa-language" /> Cod-celin Soomaali · Somali voiceover
              </div>
              <div className="mt-2 font-serif text-[27px] font-semibold leading-[1.2] text-dm-ink">{video.title}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
