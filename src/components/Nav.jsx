"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/resources", label: "Resources" },
  { href: "/collaborators", label: "Our Collaborators" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
];

const DONATE_LINK = { href: "/donate", label: "Donate" };

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
          {LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-base font-medium no-underline ${
                pathname === href ? "text-dm-accent" : "text-dm-muted"
              }`}
            >
              {label}
            </Link>
          ))}
          <Link
            href={DONATE_LINK.href}
            className={`rounded-full px-4 py-[8px] text-sm font-semibold no-underline ${
              pathname === DONATE_LINK.href ? "bg-dm-ink text-white" : "bg-dm-accent text-white"
            }`}
          >
            {DONATE_LINK.label}
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
          {LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-base font-medium no-underline ${
                pathname === href ? "text-dm-accent" : "text-dm-muted"
              }`}
            >
              {label}
            </Link>
          ))}
          <Link
            href={DONATE_LINK.href}
            className={`rounded-full px-4 py-[10px] text-center text-sm font-semibold no-underline ${
              pathname === DONATE_LINK.href ? "bg-dm-ink text-white" : "bg-dm-accent text-white"
            }`}
          >
            {DONATE_LINK.label}
          </Link>
        </div>
      )}
    </nav>
  );
}
