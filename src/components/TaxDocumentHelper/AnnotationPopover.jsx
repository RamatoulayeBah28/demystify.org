export default function AnnotationPopover({
  active,
  top,
  left,
  side,
  playLang,
  progress,
  onClose,
  onPlaySomali,
  onPlayEnglish,
}) {
  const soIcon = playLang === "so" ? "fa-solid fa-pause" : "fa-solid fa-volume-high";
  const enIcon = playLang === "en" ? "fa-solid fa-pause" : "fa-solid fa-volume-low";
  const soFill = playLang === "so" ? progress : 0;
  const enFill = playLang === "en" ? progress : 0;

  return (
    <div
      style={{ top, left }}
      className="absolute z-30 w-[344px] animate-[dm-pop_0.18s_ease] rounded-[20px] border border-dm-line bg-dm-panel pt-[22px] px-[22px] pb-5 shadow-[0_22px_60px_rgba(31,61,92,0.22)]"
    >
      <span
        className={`absolute top-[26px] h-[14px] w-[14px] border-l border-b border-dm-line bg-dm-panel ${
          side === "right" ? "left-[-8px] rotate-45" : "right-[-8px] -rotate-[135deg]"
        }`}
      />

      <button
        type="button"
        onClick={onClose}
        className="absolute top-[14px] right-[14px] flex h-[30px] w-[30px] items-center justify-center rounded-full bg-dm-bg text-sm text-dm-muted"
      >
        <i className="fa-solid fa-xmark" />
      </button>

      <div className="mb-[10px] text-xs font-bold uppercase tracking-[0.07em] text-dm-accent">
        <i className="fa-solid fa-circle-info" />
        &nbsp; {active.label}
      </div>

      <div className="mb-2 font-serif text-xl font-semibold leading-[1.25] text-dm-ink">{active.soTitle}</div>
      <div className="mb-4 text-[17px] leading-[1.55] text-dm-ink">{active.so}</div>
      <button
        type="button"
        onClick={onPlaySomali}
        className="flex w-full items-center justify-center gap-[10px] rounded-xl bg-dm-accent px-4 py-3 text-base font-semibold text-white"
      >
        <i className={soIcon} /> Dhageyso codka Soomaaliga
      </button>
      <div className="mt-[9px] h-[5px] overflow-hidden rounded-full bg-dm-line">
        <div
          className="h-full rounded-full bg-dm-accent transition-[width] duration-100"
          style={{ width: `${soFill}%` }}
        />
      </div>

      <div className="mt-[18px] border-t border-dm-line pt-4">
        <div className="mb-[6px] text-xs font-bold uppercase tracking-[0.06em] text-dm-muted">In English</div>
        <div className="mb-3 text-[15px] leading-relaxed text-dm-muted">{active.en}</div>
        <button
          type="button"
          onClick={onPlayEnglish}
          className="inline-flex items-center gap-2 rounded-[10px] border border-dm-line px-[14px] py-[9px] text-sm font-semibold text-dm-ink"
        >
          <i className={enIcon} /> Listen in English
        </button>
        <div className="mt-[9px] h-1 overflow-hidden rounded-full bg-dm-line">
          <div
            className="h-full rounded-full bg-dm-muted transition-[width] duration-100"
            style={{ width: `${enFill}%` }}
          />
        </div>
      </div>
    </div>
  );
}
