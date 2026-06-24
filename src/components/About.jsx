import Image from "next/image";

export default function About() {
  return (
    <div className="mx-auto max-w-[760px] px-8 py-[70px] pb-24">
      <div className="mb-[46px] text-center">
        <Image
          src="/demystify-wordmark.png"
          alt="demystify.org"
          width={2000}
          height={460}
          className="mx-auto mb-7 h-16 w-auto"
        />
        <h1 className="mb-[18px] font-serif text-[40px] font-semibold leading-[1.15] tracking-[-0.015em] text-dm-ink">
          Canshuurtaada, luqaddaada
        </h1>
        <p className="mx-auto max-w-[600px] text-lg leading-[1.6] text-dm-muted">
          Demystify.org wuxuu u sharxaa warqadaha canshuurta si fudud, cod Soomaali ah. Soo geli foom W-2 ah ama
          dukumeenti kale, riix sanduuq kasta, oo dhageyso micnihiisa luqaddaada hooyo.
        </p>
        <p className="mx-auto mt-[18px] max-w-[600px] text-base leading-[1.6] text-dm-muted">
          Demystify.org turns confusing tax paperwork into plain, spoken Somali. Upload a W-2 or other document, tap
          any box, and hear what it means — in your own language. We built it for newcomers and Somali-speaking
          families navigating the U.S. tax system for the first time.
        </p>
      </div>

      <div className="flex items-center gap-7 rounded-[20px] border border-dm-line bg-dm-surface px-[30px] py-7">
        <div className="flex h-[120px] w-[120px] flex-none items-center justify-center overflow-hidden rounded-full border border-dm-line bg-dm-accent-soft">
          <div className="text-center font-mono text-[11px] leading-[1.4] text-dm-muted">
            <i className="fa-solid fa-user mb-[6px] block text-[26px]" />
            profile
            <br />
            photo
          </div>
        </div>
        <div>
          <div className="mb-[6px] text-xs font-bold uppercase tracking-[0.08em] text-dm-accent">
            Aasaasaha · Founder
          </div>
          <div className="mb-2 font-serif text-[26px] font-semibold leading-[1.2] text-dm-ink">Ramatoulaye Bah</div>
          <p className="text-base leading-[1.6] text-dm-muted">
            A short introduction goes here — who you are, why you built Demystify.org, and what drives you to make
            taxes clearer for the Somali community.
          </p>
        </div>
      </div>
    </div>
  );
}
