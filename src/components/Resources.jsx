"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import QuizModal from "./QuizModal";

// Standard YouTube video IDs are exactly 11 chars of [A-Za-z0-9_-]. Used
// to skip attempting an embed for obviously-invalid ids rather than show
// a broken iframe.
const YOUTUBE_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

function VideoThumbnail({ video, onOpenVideo }) {
  const title = video.titleSo || video.titleEn;

  return (
    <div className="overflow-hidden rounded-[18px] border border-dm-line bg-dm-surface transition-[transform,box-shadow] duration-150 hover:-translate-y-[3px] hover:shadow-[0_16px_40px_rgba(31,61,92,0.14)]">
      <div
        onClick={() => onOpenVideo(video)}
        className="relative aspect-video cursor-pointer border-b border-dm-line bg-dm-accent-soft"
      >
        <Image
          src={`https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`}
          alt={title}
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
        <div className="font-serif text-xl font-semibold leading-[1.25] text-dm-ink">{title}</div>
      </div>
    </div>
  );
}

function VideoModal({ video, onClose, onOpenQuiz }) {
  const [embedFailed, setEmbedFailed] = useState(false);
  const title = video.titleSo || video.titleEn;
  const validId = YOUTUBE_ID_PATTERN.test(video.youtubeId);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-[rgba(20,30,42,0.55)] p-8 backdrop-blur-[3px] animate-[dm-pop_0.18s_ease]"
    >
      <div onClick={(e) => e.stopPropagation()} className="relative w-[760px] max-w-full">
        <div className="overflow-hidden rounded-[22px] bg-dm-panel shadow-[0_30px_80px_rgba(20,30,42,0.4)]">
          <div className="relative aspect-video bg-[#1f2a36]">
            {validId && !embedFailed ? (
              <iframe
                key={video.youtubeId}
                src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1&cc_load_policy=1&cc_lang_pref=so`}
                title={title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                onError={() => setEmbedFailed(true)}
                className="absolute inset-0 h-full w-full"
              />
            ) : (
              <a
                href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
                target="_blank"
                rel="noreferrer"
                className="absolute inset-0 flex flex-col items-center justify-center gap-[10px] text-white"
              >
                <i className="fa-brands fa-youtube text-3xl" />
                <span className="text-[15px] font-semibold">Ka day YouTube · Watch on YouTube</span>
              </a>
            )}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.16] text-[15px] text-white"
            >
              <i className="fa-solid fa-xmark" />
            </button>
          </div>
          <div className="px-[26px] py-[22px] pb-[26px]">
            <div className="mb-1 inline-flex items-center gap-[7px] rounded-full bg-dm-accent-soft px-3 py-[6px] text-xs font-bold text-dm-accent">
              <i className="fa-solid fa-language" /> Cod-celin Soomaali · Somali voiceover
            </div>
            <div className="mt-2 font-serif text-[27px] font-semibold leading-[1.2] text-dm-ink">{title}</div>
          </div>
        </div>

        {video.questions.length > 0 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenQuiz(video);
            }}
            className="absolute top-1/2 left-full ml-[18px] flex w-[150px] -translate-y-1/2 flex-col items-center gap-[10px] rounded-[18px] border border-dm-line bg-dm-panel px-[18px] py-[24px] text-center shadow-[0_22px_60px_rgba(31,61,92,0.22)] transition-[transform,box-shadow] duration-150 hover:-translate-y-[calc(50%+2px)] hover:shadow-[0_26px_70px_rgba(31,61,92,0.3)]"
          >
            <span className="flex h-[44px] w-[44px] items-center justify-center rounded-full bg-dm-accent-soft text-lg text-dm-accent">
              <i className="fa-solid fa-arrow-right" />
            </span>
            <span className="text-[15px] font-semibold leading-[1.3] text-dm-ink">Fahanka hubi</span>
            <span className="text-[11px] font-medium leading-[1.3] text-dm-muted">Check your understanding</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default function Resources() {
  const [videos, setVideos] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [openVideo, setOpenVideo] = useState(null);
  const [quizVideo, setQuizVideo] = useState(null);

  useEffect(() => {
    fetch("/api/resources/videos")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load videos.");
        return res.json();
      })
      .then((data) => {
        setVideos(data);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, []);

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

      {status === "error" && (
        <p className="text-base text-dm-muted">
          Muqaallada lama soo geli karo hadda. Fadlan isku day mar kale. (Couldn’t load videos right now.)
        </p>
      )}

      {status === "ready" && (
        <div className="grid grid-cols-3 gap-6">
          {videos.map((video) => (
            <VideoThumbnail key={video.id} video={video} onOpenVideo={setOpenVideo} />
          ))}
        </div>
      )}

      {openVideo && (
        <VideoModal
          video={openVideo}
          onClose={() => setOpenVideo(null)}
          onOpenQuiz={(video) => {
            setOpenVideo(null);
            setQuizVideo(video);
          }}
        />
      )}
      {quizVideo && <QuizModal video={quizVideo} onClose={() => setQuizVideo(null)} />}
    </div>
  );
}
