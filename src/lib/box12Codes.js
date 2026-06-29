// Form W-2 box 12 holds up to four letter-code + amount pairs (12a-12d),
// and the code changes what the amount actually means — unlike every
// other annotated field, this one can't be explained by a static, fieldId
// -keyed lookup alone. getBox12Annotation resolves the explanation from
// the code itself, which the caller reads out of the extracted value at
// click time (see resolveActiveAnnotation in TaxDocumentHelper/index.jsx).
// Covers the codes most likely to appear on an individual's W-2; rarer
// codes fall back to a generic explanation rather than a wrong one.
// Drafted by Claude, not yet reviewed by a fluent Somali speaker.
const BOX_12_CODES = {
  D: {
    label: "Code D — 401(k) contributions",
    soTitle: "Koodh D — 401(k)",
    so: "Tani waa lacagta aad gelisay qorshahaaga hawlgabka 401(k), ka hor inta aan canshuur laga jarin.",
    en: "This is money you put into your 401(k) retirement savings plan this year, before tax.",
  },
  DD: {
    label: "Code DD — Cost of employer health coverage",
    soTitle: "Koodh DD — Caymiska caafimaadka",
    so: "Tani waa qiimaha guud ee caymiska caafimaad ee loo-shaqeeyahaagu bixiyay. Ma aha lacag aad bixiso — waa macluumaad kaliya.",
    en: "This is the total cost of your employer-provided health coverage. It's informational only — it's not money you owe or paid.",
  },
  W: {
    label: "Code W — HSA contributions",
    soTitle: "Koodh W — HSA",
    so: "Tani waa lacagta loo geliyay akoonkaaga HSA (Health Savings Account), oo loo isticmaali karo kharashka caafimaad.",
    en: "This is money put into your HSA (Health Savings Account), which can be used for health expenses.",
  },
  C: {
    label: "Code C — Group-term life insurance over $50,000",
    soTitle: "Koodh C — Caymis nolosha",
    so: "Tani waa qiimaha caymiska nolosha ee loo-shaqeeyuhu kuu bixiyay oo ka badan $50,000 — qaybtaas waa la canshuuraa.",
    en: "This is the value of life insurance your employer provided you above $50,000 — that extra amount is taxable.",
  },
  E: {
    label: "Code E — 403(b) contributions",
    soTitle: "Koodh E — 403(b)",
    so: "Tani waa lacagta aad gelisay qorshahaaga hawlgabka 403(b), ka hor inta aan canshuur laga jarin.",
    en: "This is money you put into a 403(b) retirement savings plan this year, before tax.",
  },
  G: {
    label: "Code G — 457(b) contributions",
    soTitle: "Koodh G — 457(b)",
    so: "Tani waa lacagta aad gelisay qorshahaaga hawlgabka 457(b), ka hor inta aan canshuur laga jarin.",
    en: "This is money you put into a 457(b) retirement savings plan this year, before tax.",
  },
  P: {
    label: "Code P — Moving expense reimbursement",
    soTitle: "Koodh P — Kharashka guuritaanka",
    so: "Tani waa lacag loo-shaqeeyuhu kuu celiyay kharashkii guuritaanka, oo askarta militariga ku khuseeya kaliya.",
    en: "This is reimbursement for moving expenses, which only applies to active-duty military.",
  },
  AA: {
    label: "Code AA — Roth 401(k) contributions",
    soTitle: "Koodh AA — Roth 401(k)",
    so: "Tani waa lacagta aad gelisay qorshahaaga Roth 401(k) — lacagtan canshuur horay loo bixiyay, sidaa darteed marka aad qaadato hawlgabka lama canshuuri doono.",
    en: "This is money you put into a Roth 401(k) — already taxed now, so it won't be taxed again when you retire.",
  },
  BB: {
    label: "Code BB — Roth 403(b) contributions",
    soTitle: "Koodh BB — Roth 403(b)",
    so: "Tani waa lacagta aad gelisay qorshahaaga Roth 403(b) — lacagtan canshuur horay loo bixiyay.",
    en: "This is money you put into a Roth 403(b) — already taxed now, so it won't be taxed again later.",
  },
  V: {
    label: "Code V — Stock option income",
    soTitle: "Koodh V — Dakhliga saamiga",
    so: "Tani waa dakhli laga helay xulashada saamiga shaqada (stock options) oo ku jira mushaharkaaga sanduuqa 1.",
    en: "This is income from exercising employee stock options, already included in your box 1 wages.",
  },
};

const GENERIC_FALLBACK = {
  label: "Box 12 code",
  soTitle: "Koodhka sanduuqa 12",
  so: "Sanduuqan wuxuu isticmaalaa koodh xaraf ah si uu u sheego nooca mushahar ama faa'iido gaar ah. Koodhkan gaarka ah ma haysanno sharaxaad u gaar ah weli — booqo qof xirfad u leh canshuurta haddii aad su'aal ka qabto.",
  en: "This box uses a letter code to identify a specific kind of pay or benefit. We don't have a specific explanation for this exact code yet — ask a tax professional if you're unsure.",
};

const EMPTY_SLOT = {
  label: "Box 12",
  soTitle: "Sanduuqa 12",
  so: "Sanduuqankan wuu madhan yahay dukumentigan — looma isticmaalin.",
  en: "This box is blank on this document — it wasn't used.",
};

export function getBox12Annotation(rawValue) {
  if (!rawValue || rawValue === "—") return { ...EMPTY_SLOT, draft: true };
  const code = rawValue.trim().toUpperCase();
  const match = BOX_12_CODES[code] ?? GENERIC_FALLBACK;
  return { ...match, draft: true };
}
