"use client";

import { useRef } from "react";

const FILE_TYPE_CHIPS = [{ icon: "fa-regular fa-file-pdf", label: "PDF" }];

export default function UploadScreen({ dragOver, onFileSelected, onDragOver, onDragLeave, onDrop }) {
  const inputRef = useRef(null);

  const openPicker = () => inputRef.current?.click();

  return (
    <div className="mx-auto max-w-[860px] px-8 pt-[74px] pb-24 text-center">
      <div className="mb-5 text-[13px] font-bold uppercase tracking-[0.18em] text-dm-muted">
        Your language. Your taxes.
      </div>
      <h1 className="mb-[18px] font-serif text-[54px] font-semibold leading-[1.12] tracking-[-0.015em] text-dm-ink">
        Faham warqadahaaga canshuurta
      </h1>
      <p className="mx-auto mb-[46px] max-w-[560px] text-xl leading-relaxed text-dm-muted">
        Understand your tax documents, explained simply, with audio in Somali. Soo geli foomkaaga, qayb walbana
        waan kuu sharxi doonaa.
      </p>

      <div
        onClick={openPicker}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`cursor-pointer rounded-3xl border-2 border-dashed px-10 py-14 transition-colors duration-200 ${
          dragOver ? "border-dm-accent bg-dm-accent-soft" : "border-dm-line bg-dm-surface"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => onFileSelected(e.target.files?.[0])}
        />
        <div className="mx-auto mb-6 flex h-[84px] w-[84px] items-center justify-center rounded-full bg-dm-accent text-[34px] text-white shadow-[0_0_0_12px_var(--color-dm-glow)]">
          <i className="fa-solid fa-cloud-arrow-up" />
        </div>
        <div className="mb-2 font-serif text-[27px] font-medium text-dm-ink">Halkan ku soo rid faylkaaga</div>
        <div className="mb-[26px] text-[17px] text-dm-muted">Drop your file here, or click to browse</div>
        <button
          type="button"
          className="inline-flex items-center gap-[10px] rounded-[13px] bg-dm-accent px-7 py-[14px] text-[17px] font-semibold text-white"
        >
          <i className="fa-solid fa-folder-open" /> Dooro fayl
        </button>
      </div>

      <div className="mt-[26px] flex items-center justify-center gap-3">
        {FILE_TYPE_CHIPS.map((chip) => (
          <span
            key={chip.label}
            className="inline-flex items-center gap-[7px] rounded-full border border-dm-line bg-dm-surface px-[14px] py-[7px] text-sm font-semibold text-dm-muted"
          >
            <i className={chip.icon} /> {chip.label}
          </span>
        ))}
      </div>

      <div className="mt-10 inline-flex items-center gap-[9px] text-[15px] text-dm-muted">
        <i className="fa-solid fa-lock text-dm-accent" /> Gudaha aaminada ah — faylkaagu wuu ku sii jiraa
        qarsoodi. Your file stays private.
      </div>
    </div>
  );
}
