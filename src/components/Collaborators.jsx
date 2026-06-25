"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

function CollaboratorCard({ collaborator }) {
  const name = `${collaborator.firstName} ${collaborator.lastName}`;

  return (
    <div className="flex flex-col items-center rounded-[18px] border border-dm-line bg-dm-surface px-[22px] py-[28px] text-center">
      <div className="relative mb-[14px] h-[96px] w-[96px] overflow-hidden rounded-full border-2 border-dm-accent-soft bg-dm-accent-soft">
        {collaborator.photoUrl ? (
          <Image src={collaborator.photoUrl} alt={name} fill sizes="96px" className="object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-3xl text-dm-accent">
            <i className="fa-solid fa-user" />
          </span>
        )}
      </div>
      <div className="font-serif text-xl font-semibold leading-[1.25] text-dm-ink">{name}</div>
      {collaborator.title && <div className="mt-1 text-sm text-dm-muted">{collaborator.title}</div>}

      {collaborator.quotes.length > 0 && (
        <div className="mt-[18px] flex flex-col gap-[14px] border-t border-dm-line pt-[18px]">
          {collaborator.quotes.map((q) => (
            <figure key={q.id}>
              <blockquote className="text-[15px] leading-[1.5] text-dm-ink">“{q.quoteText}”</blockquote>
              {q.authorName && (
                <figcaption className="mt-[6px] text-[13px] font-medium text-dm-muted">— {q.authorName}</figcaption>
              )}
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Collaborators() {
  const [collaborators, setCollaborators] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error

  useEffect(() => {
    fetch("/api/collaborators")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load collaborators.");
        return res.json();
      })
      .then((data) => {
        setCollaborators(data);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, []);

  return (
    <div className="mx-auto max-w-[1080px] px-8 py-[60px] pb-24">
      <div className="mb-[14px] text-[13px] font-bold uppercase tracking-[0.18em] text-dm-muted">
        La-shaqeeyayaasheena · Our Collaborators
      </div>
      <h1 className="mb-3 font-serif text-[44px] font-semibold leading-[1.12] tracking-[-0.015em] text-dm-ink">
        Khubarada canshuurta ee Soomaalida
      </h1>
      <p className="mb-10 max-w-[600px] text-lg leading-[1.5] text-dm-muted">
        Somali tax experts who volunteer their time and knowledge, and what the people they&apos;ve helped have to
        say.
      </p>

      {status === "error" && (
        <p className="text-base text-dm-muted">
          Lama soo geli karo hadda. Fadlan isku day mar kale. (Couldn’t load this right now.)
        </p>
      )}

      {status === "ready" && (
        <div className="grid grid-cols-3 gap-6">
          {collaborators.map((c) => (
            <CollaboratorCard key={c.id} collaborator={c} />
          ))}
        </div>
      )}
    </div>
  );
}
