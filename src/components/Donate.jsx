// Donation link comes from env, not hardcoded — set NEXT_PUBLIC_DONATION_LINK
// once a Stripe Payment Link (or similar hosted "customer chooses price"
// link) exists. Until then this renders a friendly "coming soon" state
// instead of a dead link.
const DONATION_LINK = process.env.NEXT_PUBLIC_DONATION_LINK || null;

export default function Donate() {
  return (
    <div className="mx-auto max-w-[640px] px-8 py-[70px] pb-24 text-center">
      <div className="mb-[14px] text-[13px] font-bold uppercase tracking-[0.18em] text-dm-muted">
        Naga taageer · Support us
      </div>
      <h1 className="mb-3 font-serif text-[40px] font-semibold leading-[1.15] tracking-[-0.015em] text-dm-ink">
        Bixi intaad awoodid
      </h1>
      <p className="mb-2 text-lg leading-[1.55] text-dm-muted">
        Pay what you can! there&apos;s no minimum and no fixed price. Whatever
        you&apos;re able to give helps keep demystify.org free for everyone who
        needs it.
      </p>
      <p className="mb-10 text-base leading-[1.55] text-dm-muted">
        Wax kasta oo aad bixin karto way na caawin doontaa inaan demystify.org
        ka dhigno mid bilaash ah oo loo heli karo qof kasta oo u baahan.
      </p>

      {DONATION_LINK ? (
        <a
          href={DONATION_LINK}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-[10px] rounded-[14px] bg-dm-accent px-8 py-[16px] text-lg font-semibold text-white shadow-[0_14px_36px_rgba(31,61,92,0.32)]"
        >
          <i className="fa-solid fa-heart" /> Bixi hadda · Donate now
        </a>
      ) : (
        <div className="rounded-[16px] border border-dm-line bg-dm-surface px-6 py-5 text-base text-dm-muted">
          Qaabka lacag bixinta weli waa la diyaarinayaa. Fadlan soo noqo
          dhowaan.
          <br />
          Donations aren’t open yet — check back soon.
        </div>
      )}
    </div>
  );
}
