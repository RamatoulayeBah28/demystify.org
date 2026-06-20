import Image from "next/image";

export default function Nav() {
  return (
    <nav className="sticky top-0 z-40 flex items-center justify-between border-b border-dm-line bg-dm-surface px-10 py-4">
      <div className="flex items-center gap-[11px]">
        <Image
          src="/demystify-favicon.png"
          alt="demystify.org"
          width={40}
          height={40}
          className="h-10 w-auto"
        />
        <span className="font-serif text-[26px] font-semibold tracking-[-0.01em] text-dm-ink">
          demystify<span className="text-dm-org-tint">.org</span>
        </span>
      </div>
      <div className="flex items-center gap-[30px]">
        <a href="#" className="text-base font-medium text-dm-muted no-underline">
          Resources
        </a>
        <a href="#" className="text-base font-medium text-dm-muted no-underline">
          About Us
        </a>
        <a href="#" className="text-base font-medium text-dm-muted no-underline">
          Contact
        </a>
      </div>
    </nav>
  );
}
