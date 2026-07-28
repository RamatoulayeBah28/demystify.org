"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const HOME_LABEL = { labelSo: "Guriga", labelEn: "Home" };

// Somali labels are drafts — unreviewed by a native speaker. Same caveat as
// the annotation library's "draft" flag: verify before treating as final copy.
const LINKS = [
  { href: "/resources", labelSo: "Kheyraadka", labelEn: "Resources" },
  { href: "/collaborators", labelSo: "La-shaqeeyayaasheena", labelEn: "Our Collaborators" },
  { href: "/about", labelSo: "Nagu Saabsan", labelEn: "About Us" },
  { href: "/contact", labelSo: "Nala Soo Xiriir", labelEn: "Contact" },
];

const DONATE_LINK = { href: "/donate", labelSo: "Deeq Bixi", labelEn: "Donate" };

// Somali shows by default; hovering crossfades to English. Both strings sit
// in the same grid cell (via [grid-area:1/1]) so the track sizes to the
// longer of the two and the swap never shifts surrounding layout.
function NavLabel({ so, en }) {
  return (
    <span className="grid">
      <span className="col-start-1 row-start-1 opacity-100 transition-opacity duration-150 group-hover:opacity-0">
        {so}
      </span>
      <span className="col-start-1 row-start-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
        {en}
      </span>
    </span>
  );
}

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Closes the mobile menu automatically after navigating, instead of
  // leaving it open over the next page — adjusted during render rather
  // than an effect, per React's guidance for resetting state when a
  // prop/derived value changes.
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setOpen(false);
  }

  return (
    <nav className="sticky top-0 z-40 border-b border-dm-line bg-dm-surface px-6 py-4 md:px-10">
      <div className="flex items-center justify-between">
        <Link href="/" className="flex items-center gap-[11px]">
          <Image
            src="/demystify-wordmark.png"
            alt="demystify.org"
            width={2000}
            height={460}
            className="h-12 w-auto"
          />
        </Link>

        <div className="hidden items-center gap-[30px] md:flex">
          {/* Plain <a>, not <Link>: forces a full reload so TaxDocumentHelper's
              internal screen state resets to "upload" even when already on "/". */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a
            href="/"
            className={`group inline-flex items-center gap-[7px] text-base font-medium no-underline ${
              pathname === "/" ? "text-dm-accent" : "text-dm-muted"
            }`}
          >
            <i className="fa-solid fa-house" /> <NavLabel so={HOME_LABEL.labelSo} en={HOME_LABEL.labelEn} />
          </a>
          {LINKS.map(({ href, labelSo, labelEn }) => (
            <Link
              key={href}
              href={href}
              className={`group text-base font-medium no-underline ${
                pathname === href ? "text-dm-accent" : "text-dm-muted"
              }`}
            >
              <NavLabel so={labelSo} en={labelEn} />
            </Link>
          ))}
          <Link
            href={DONATE_LINK.href}
            className={`group rounded-full px-4 py-[8px] text-sm font-semibold no-underline ${
              pathname === DONATE_LINK.href ? "bg-dm-ink text-white" : "bg-dm-accent text-white"
            }`}
          >
            <NavLabel so={DONATE_LINK.labelSo} en={DONATE_LINK.labelEn} />
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-xl text-dm-ink md:hidden"
        >
          <i className={open ? "fa-solid fa-xmark" : "fa-solid fa-bars"} />
        </button>
      </div>

      {open && (
        <div className="mt-4 flex flex-col gap-[18px] border-t border-dm-line pt-4 md:hidden">
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- see desktop Home link above */}
          <a
            href="/"
            className={`group inline-flex items-center gap-[7px] text-base font-medium no-underline ${
              pathname === "/" ? "text-dm-accent" : "text-dm-muted"
            }`}
          >
            <i className="fa-solid fa-house" /> <NavLabel so={HOME_LABEL.labelSo} en={HOME_LABEL.labelEn} />
          </a>
          {LINKS.map(({ href, labelSo, labelEn }) => (
            <Link
              key={href}
              href={href}
              className={`group text-base font-medium no-underline ${
                pathname === href ? "text-dm-accent" : "text-dm-muted"
              }`}
            >
              <NavLabel so={labelSo} en={labelEn} />
            </Link>
          ))}
          <Link
            href={DONATE_LINK.href}
            className={`group rounded-full px-4 py-[10px] text-center text-sm font-semibold no-underline ${
              pathname === DONATE_LINK.href ? "bg-dm-ink text-white" : "bg-dm-accent text-white"
            }`}
          >
            <NavLabel so={DONATE_LINK.labelSo} en={DONATE_LINK.labelEn} />
          </Link>
        </div>
      )}
    </nav>
  );
}
