"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/resources", label: "Resources" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
];

const DONATE_LINK = { href: "/donate", label: "Donate" };

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-40 flex items-center justify-between border-b border-dm-line bg-dm-surface px-10 py-4">
      <Link href="/" className="flex items-center gap-[11px]">
        <Image
          src="/demystify-wordmark.png"
          alt="demystify.org"
          width={2000}
          height={460}
          className="h-12 w-auto"
        />
      </Link>
      <div className="flex items-center gap-[30px]">
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
    </nav>
  );
}
