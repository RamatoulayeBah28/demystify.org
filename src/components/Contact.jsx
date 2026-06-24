"use client";

import { useState } from "react";

export default function Contact() {
  const [sent, setSent] = useState(false);

  const submitContact = (e) => {
    e.preventDefault();
    const f = e.currentTarget;
    const name = (f.elements.name?.value || "").trim();
    const email = (f.elements.email?.value || "").trim();
    const topic = (f.elements.topic?.value || "").trim();
    const message = (f.elements.message?.value || "").trim();
    const subject = encodeURIComponent(`Demystify.org — ${topic || "Contact"}${name ? ` (${name})` : ""}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\nTopic: ${topic}\n\n${message}`);
    window.location.href = `mailto:contact@demystify.org?subject=${subject}&body=${body}`;
    setSent(true);
  };

  return (
    <div className="mx-auto max-w-[600px] px-8 py-[70px] pb-24">
      <div className="mb-9 text-center">
        <div className="mb-[14px] text-[13px] font-bold uppercase tracking-[0.18em] text-dm-muted">
          Nala soo xidhiidh · Contact
        </div>
        <h1 className="mb-3 font-serif text-[40px] font-semibold leading-[1.15] tracking-[-0.015em] text-dm-ink">
          Su’aal ma qabtaa?
        </h1>
        <p className="text-lg leading-[1.55] text-dm-muted">
          Fariin noo dir oo waxaan kaala soo xidhiidhi doonaa. Send us a message and we’ll get back to you.
        </p>
      </div>

      {sent ? (
        <div className="rounded-[20px] border border-dm-line bg-dm-surface px-8 py-[46px] text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-dm-accent text-2xl text-white">
            <i className="fa-solid fa-check" />
          </div>
          <div className="mb-2 font-serif text-2xl font-semibold text-dm-ink">Mahadsanid!</div>
          <p className="mb-[22px] text-base leading-[1.55] text-dm-muted">
            Your message is on its way to contact@demystify.org. We’ll reply soon.
          </p>
          <button
            type="button"
            onClick={() => setSent(false)}
            className="rounded-[11px] border border-dm-line px-5 py-[11px] text-[15px] font-semibold text-dm-ink"
          >
            Send another message
          </button>
        </div>
      ) : (
        <form onSubmit={submitContact} className="flex flex-col gap-[18px] rounded-[20px] border border-dm-line bg-dm-surface p-[30px]">
          <label className="flex flex-col gap-[7px]">
            <span className="text-sm font-semibold text-dm-ink">Magaca · Name</span>
            <input
              name="name"
              type="text"
              required
              placeholder="Amina Warsame"
              className="rounded-[11px] border border-dm-line bg-dm-bg px-[15px] py-[13px] text-base text-dm-ink outline-none"
            />
          </label>
          <label className="flex flex-col gap-[7px]">
            <span className="text-sm font-semibold text-dm-ink">Iimaylka · Email</span>
            <input
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              className="rounded-[11px] border border-dm-line bg-dm-bg px-[15px] py-[13px] text-base text-dm-ink outline-none"
            />
          </label>
          <label className="flex flex-col gap-[7px]">
            <span className="text-sm font-semibold text-dm-ink">Mawduuca · Topic</span>
            <input
              name="topic"
              type="text"
              placeholder="W-2, lacag-celin, su’aal guud…"
              className="rounded-[11px] border border-dm-line bg-dm-bg px-[15px] py-[13px] text-base text-dm-ink outline-none"
            />
          </label>
          <label className="flex flex-col gap-[7px]">
            <span className="text-sm font-semibold text-dm-ink">Fariinta · Message</span>
            <textarea
              name="message"
              required
              rows={5}
              placeholder="Qor fariintaada halkan…"
              className="resize-y rounded-[11px] border border-dm-line bg-dm-bg px-[15px] py-[13px] text-base text-dm-ink outline-none"
            />
          </label>
          <button
            type="submit"
            className="flex items-center justify-center gap-[10px] rounded-[13px] bg-dm-accent px-4 py-[15px] text-[17px] font-semibold text-white"
          >
            <i className="fa-solid fa-paper-plane" /> Dir fariinta · Send
          </button>
          <div className="text-center text-sm text-dm-muted">
            Waxaa lagugu xidhi doonaa <span className="font-semibold text-dm-accent">contact@demystify.org</span>
          </div>
        </form>
      )}
    </div>
  );
}
