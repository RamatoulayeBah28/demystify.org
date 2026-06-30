import Image from "next/image";

const FEATURES = [
  {
    icon: "fa-solid fa-comment-dots",
    title: "Plain-language explanations",
    description:
      "Every field on your document gets a short, clear explanation with no tax jargon.",
  },
  {
    icon: "fa-solid fa-language",
    title: "Somali translation & audio",
    description:
      "Read or listen to each explanation in Somali, with English available alongside it.",
  },
  {
    icon: "fa-solid fa-magnifying-glass",
    title: "Automatic form detection",
    description:
      "Recognizes 23 IRS tax forms automatically — including multi-page PDFs with several different forms in one file. No manual selection needed.",
  },
  {
    icon: "fa-solid fa-lock",
    title: "Privacy by design",
    description:
      "Your document is processed in the moment and never stored on our servers or in a database.",
  },
  {
    icon: "fa-solid fa-cloud-arrow-up",
    title: "Works with PDF, JPG, PNG or HEIC",
    description:
      "Upload a scan or a photo of your document, however you have it.",
  },
  {
    icon: "fa-solid fa-robot",
    title: "Follow-up chatbot",
    description:
      "Ask Mist any question about your document or a tax term — in Somali or English — and get a plain-language answer.",
  },
  {
    icon: "fa-solid fa-clapperboard",
    title: "Video resources in Somali",
    description:
      "Short walkthroughs covering the basics of U.S. taxes, re-voiced in Somali.",
  },
];

export default function About() {
  return (
    <div className="mx-auto max-w-[760px] px-8 py-[70px] pb-24">
      <div className="mb-[46px] text-center">
        <Image
          src="/demystify-no-bg.png"
          alt="demystify.org"
          width={853}
          height={721}
          className="mx-auto mb-4 h-64 w-auto"
        />
        <h1 className="mb-[18px] font-serif text-[40px] font-semibold leading-[1.15] tracking-[-0.015em] text-dm-ink">
          Canshuurtaada, luqaddaada
        </h1>
        <p className="mx-auto max-w-[600px] text-lg leading-[1.6] text-dm-muted">
          demystify.org wuxuu u sharxaa warqadaha canshuurta si fudud, cod
          Soomaali ah. Soo geli foom W-2 ah ama dukumeenti kale, riix sanduuq
          kasta, oo dhageyso micnihiisa luqaddaada hooyo.
        </p>
        <p className="mx-auto mt-[18px] max-w-[600px] text-base leading-[1.6] text-dm-muted">
          demystify.org turns confusing tax paperwork into plain, spoken Somali.
          Upload a W-2 or other document, tap any box, and hear what it means in
          your own language. We built it for newcomers and Somali-speaking
          families navigating the U.S. tax system.
        </p>
      </div>

      <div className="mb-12 rounded-[20px] border border-dm-line bg-dm-accent-soft px-[30px] py-7">
        <div className="mb-2 text-xs font-bold uppercase tracking-[0.08em] text-dm-accent">
          Hadafkeenna · Our mission
        </div>
        <p className="text-lg leading-[1.6] text-dm-ink">
          Demystify is an educational platform designed to help Somali speakers
          better understand the U.S. tax system by providing culturally and
          linguistically accessible information.
        </p>
      </div>

      <div className="mb-12">
        <div className="mb-5 text-xs font-bold uppercase tracking-[0.08em] text-dm-accent">
          Astaamaha muhiimka ah · Key features
        </div>
        <div className="grid grid-cols-2 gap-4">
          {FEATURES.map((feature, i) => (
            <div
              key={feature.title}
              className={`flex items-start gap-3 rounded-2xl border border-dm-line bg-dm-surface px-5 py-4 ${
                i === FEATURES.length - 1 && FEATURES.length % 2 !== 0
                  ? "col-span-2 mx-auto w-[calc(50%-8px)]"
                  : ""
              }`}
            >
              <span className="flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-dm-accent text-sm text-white">
                <i className={feature.icon} />
              </span>
              <div>
                <div className="mb-1 text-[15px] font-semibold text-dm-ink">
                  {feature.title}
                </div>
                <div className="text-sm leading-[1.5] text-dm-muted">
                  {feature.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-7 rounded-[20px] border border-dm-line bg-dm-surface px-[30px] py-7">
        <div className="relative h-[120px] w-[120px] flex-none overflow-hidden rounded-full border border-dm-line bg-dm-accent-soft">
          <Image
            src="/profile-pic.jpg"
            alt="Ramatoulaye Bah"
            fill
            sizes="120px"
            className="object-cover"
          />
        </div>
        <div>
          <div className="mb-[6px] text-xs font-bold uppercase tracking-[0.08em] text-dm-accent">
            Aasaasaha · Founder
          </div>
          <div className="mb-2 font-serif text-[26px] font-semibold leading-[1.2] text-dm-ink">
            Ramatoulaye Bah
          </div>
          <p className="text-base leading-[1.6] text-dm-muted">
            As a child of immigrant parents who I had to help navigate taxes in
            a foreign language, I understand firsthand the struggles that come
            with it. Demystify.org aims to solve a global issue by scaling it
            first to one language, one community and one task.
          </p>
        </div>
      </div>
    </div>
  );
}
