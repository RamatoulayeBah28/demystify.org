const CONTACT_EMAIL = "contact@demystifytax.org";

const ALLOCATIONS = [
  {
    icon: "fa-solid fa-language",
    title: "Somali language review",
    description:
      "Paying fluent Somali speakers to verify and refine every translation so explanations are accurate, natural, and trustworthy.",
  },
  {
    icon: "fa-solid fa-microphone",
    title: "Audio narration",
    description:
      "Recording professional Somali audio for each tax field explanation, so users can hear what their documents mean.",
  },
  {
    icon: "fa-solid fa-server",
    title: "API & hosting",
    description:
      "Claude AI, Vercel, and Supabase are software tools that keep the app running. Every upload and conversation with the chatbot cost a small amount in API fees.",
  },
  {
    icon: "fa-solid fa-people-group",
    title: "Community outreach",
    description:
      "Reaching more Somali-speaking families who need this through community organizations, mosques, and resettlement programs.",
  },
];

export default function Donate() {
  return (
    <div className="mx-auto max-w-[680px] px-8 py-[70px] pb-24">
      <div className="mb-[14px] text-[13px] font-bold uppercase tracking-[0.18em] text-dm-muted">
        Naga taageer · Support us
      </div>
      <h1 className="mb-4 font-serif text-[40px] font-semibold leading-[1.15] tracking-[-0.015em] text-dm-ink">
        Looking to donate?
      </h1>
      <p className="mb-2 text-lg leading-[1.6] text-dm-muted">
        demystify.org is free for everyone. Donations help us keep it that way
        and expand to more documents, more audio, and more families.
      </p>
      <p className="mb-10 text-base leading-[1.6] text-dm-muted">
        demystify.org waa bilaash qof kasta. Deeqaha ayaa naga caawiya inaan sii
        wadano oo aan u fidino qoysas badan oo baahan.
      </p>

      <a
        href="/contact"
        className="mb-12 flex items-center gap-4 rounded-[20px] border border-dm-accent bg-dm-accent-soft px-6 py-5 no-underline transition-colors"
      >
        <span className="flex h-11 w-11 flex-none items-center justify-center rounded-[12px] bg-dm-accent text-lg text-white">
          <i className="fa-solid fa-envelope" />
        </span>
        <div>
          <div className="text-[15px] font-semibold text-dm-ink">
            Email us to get started
          </div>
          <div className="mt-0.5 text-sm text-dm-muted">{CONTACT_EMAIL}</div>
        </div>
        <i className="fa-solid fa-arrow-right ml-auto text-dm-accent" />
      </a>

      <div className="mb-6 text-xs font-bold uppercase tracking-[0.08em] text-dm-accent">
        Lacagtu waxay u tagtaa · Where your money goes
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {ALLOCATIONS.map((item) => (
          <div
            key={item.title}
            className="flex items-start gap-3 rounded-2xl border border-dm-line bg-dm-surface px-5 py-4"
          >
            <span className="flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-dm-accent text-sm text-white">
              <i className={item.icon} />
            </span>
            <div>
              <div className="mb-1 text-[15px] font-semibold text-dm-ink">
                {item.title}
              </div>
              <div className="text-sm leading-[1.5] text-dm-muted">
                {item.description}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
