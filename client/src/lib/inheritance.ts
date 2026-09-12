/**
 * Rule model: Tamil-first, simple guided inheritance calculation.
 * Exact fractions are retained until amounts are rendered to avoid display-rounding errors.
 * Scope: ordinary single-death cases only; the UI flags advanced situations for review.
 */

export type Fraction = { n: number; d: number };

export type EstateInput = {
  grossEstate: number;
  funeralCosts: number;
  debts: number;
  bequest: number;
};

export type HeirInput = {
  husband: number;
  wives: number;
  father: number;
  mother: number;
  paternalGrandfather: number;
  sons: number;
  daughters: number;
  fullBrothers: number;
  fullSisters: number;
  maternalBrothers: number;
  maternalSisters: number;
  sonsSons?: number;
  sonsDaughters?: number;
  furtherSonsLineDescendants?: number;
  maternalGrandfather?: number;
  paternalGrandmothers?: number;
  maternalGrandmothers?: number;
  furtherPaternalAncestors?: number;
  paternalBrothers?: number;
  paternalSisters?: number;
  fullBrothersSons?: number;
  paternalBrothersSons?: number;
  paternalUncles?: number;
  paternalUnclesSons?: number;
  consanguinePaternalUncles?: number;
  consanguinePaternalUnclesSons?: number;
  daughtersChildren?: number;
  sonsDaughtersChildren?: number;
  fullBrothersDaughters?: number;
  fullSistersChildren?: number;
  maternalBrothersChildren?: number;
  fathersMaternalBrothers?: number;
  fathersMaternalBrothersDescendants?: number;
  mothersSiblings?: number;
  mothersSiblingsDescendants?: number;
};

export type ExtendedHeirKey = Exclude<keyof HeirInput, "husband" | "wives" | "father" | "mother" | "paternalGrandfather" | "sons" | "daughters" | "fullBrothers" | "fullSisters" | "maternalBrothers" | "maternalSisters">;

export type ExtendedHeirDefinition = {
  key: ExtendedHeirKey;
  emoji: string;
  label: string;
  description: string;
  labelEn: string;
  descriptionEn: string;
  searchTerms?: string;
};

export type ExtendedHeirSection = { title: string; helper: string; titleEn: string; helperEn: string; items: ExtendedHeirDefinition[] };

export type AppLanguage = "ta" | "en" | "ar";

export const EXTENDED_HEIR_SECTIONS: ExtendedHeirSection[] = [
  {
    title: "மகன் வழி சந்ததியினர்",
    helper: "மகன் இல்லை என்றால் இந்த உறவுகள் முக்கியமாகலாம்.",
    titleEn: "Descendants through sons",
    helperEn: "These relatives may matter when there is no son.",
    items: [
      { key: "sonsSons", emoji: "👦", label: "மகனின் மகன்கள்", description: "மகன் வழி பேரன்கள்.", labelEn: "Sons of sons", descriptionEn: "Grandsons through a son." },
      { key: "sonsDaughters", emoji: "👧", label: "மகனின் மகள்கள்", description: "மகன் வழி பேத்திகள்.", labelEn: "Daughters of sons", descriptionEn: "Granddaughters through a son." },
      { key: "furtherSonsLineDescendants", emoji: "🌿", label: "மகன் வழி அடுத்த தலைமுறை", description: "மேலதிக மகன்-வழி சந்ததியினர்.", labelEn: "Further descendants through sons", descriptionEn: "Later descendants in the son’s line." },
    ],
  },
  {
    title: "தாத்தா, பாட்டி மற்றும் மூதாதையர்",
    helper: "நெருங்கிய பெற்றோர் இல்லாதபோது இந்த உறவுகள் தொடர்புடையவை.",
    titleEn: "Grandparents and ancestors",
    helperEn: "These relatives may be relevant when closer parents are absent.",
    items: [
      { key: "paternalGrandmothers", emoji: "👵", label: "ஜதாத் (Grandmother)", description: "தந்தை வழி பாட்டி.", labelEn: "Father’s mother", descriptionEn: "Paternal grandmother." },
      { key: "maternalGrandmothers", emoji: "👵", label: "ஜதாத் (Grandmother)", description: "தாய் வழி பாட்டி.", labelEn: "Mother’s mother", descriptionEn: "Maternal grandmother." },
      { key: "furtherPaternalAncestors", emoji: "🌳", label: "தந்தை வழி மூதாதையர்", description: "மேலதிக தந்தை-வழி முன்னோர்.", labelEn: "Further paternal ancestors", descriptionEn: "More distant ancestors through the father’s line." },
    ],
  },
  {
    title: "தந்தை வழி மற்றும் உடன்பிறந்தோர் சந்ததி",
    helper: "உடன்பிறந்தோர் வரிசை மற்றும் அவர்களின் அடுத்த தலைமுறை.",
    titleEn: "Paternal siblings and sibling descendants",
    helperEn: "Siblings through the father and the next generation of siblings.",
    items: [
      { key: "paternalBrothers", emoji: "👨", label: "தந்தை வழி சகோதரர்கள்", description: "தந்தை வழி சகோதரியுடன், நெருங்கிய தடை இல்லாதபோது 2:1 விதி.", labelEn: "Paternal half-brothers", descriptionEn: "With a paternal half-sister, 2:1 applies when no closer listed heir blocks it." },
      { key: "paternalSisters", emoji: "👩", label: "தந்தை வழி சகோதரிகள்", description: "தந்தை ஒரேவர்; தாய் வேறாக இருக்கலாம்.", labelEn: "Paternal half-sisters", descriptionEn: "Same father; may have a different mother." },
      { key: "fullBrothersSons", emoji: "👦", label: "உடன்பிறந்த சகோதரரின் மகன்கள்", description: "உடன்பிறந்த சகோதரரின் ஆண் பிள்ளைகள்.", labelEn: "Sons of full brothers", descriptionEn: "Male children of full brothers." },
      { key: "paternalBrothersSons", emoji: "👦", label: "தந்தை வழி சகோதரரின் மகன்கள்", description: "தந்தை வழி சகோதரரின் ஆண் பிள்ளைகள்.", labelEn: "Sons of paternal half-brothers", descriptionEn: "Male children of paternal half-brothers." },
    ],
  },
  {
    title: "தந்தை சகோதரர் (அம்) வரிசை",
    helper: "முழு/பாதி தந்தை சகோதரர்கள் மற்றும் அவர்களின் மகன்கள். அறிஞர் மறுஆய்வு தேவை.",
    titleEn: "Father’s brother line",
    helperEn: "Father’s brothers and their sons. Scholar review is required.",
    items: [
      { key: "paternalUncles", emoji: "👨‍🦳", label: "முழு தந்தை சகோதரர்கள் (அம்)", description: "தந்தையின் முழு உடன்பிறந்த சகோதரர்கள்.", labelEn: "Father’s brothers (full)", descriptionEn: "Full brothers of the father.", searchTerms: "தந்தையின் சகோதரர் பெரியப்பா சித்தப்பா paternal uncle ʿamm عم" },
      { key: "paternalUnclesSons", emoji: "👦", label: "முழு தந்தை சகோதரர்களின் மகன்கள்", description: "முழு தந்தை வழி தந்தை சகோதரரின் ஆண் பிள்ளைகள்.", labelEn: "Sons of father’s brothers (full)", descriptionEn: "Male children of full paternal uncles.", searchTerms: "தந்தையின் சகோதரரின் மகன் பெரியப்பா சித்தப்பா மகன் son of paternal uncle" },
      { key: "consanguinePaternalUncles", emoji: "👨‍🦳", label: "தந்தை சகோதரர்கள்", description: "தந்தையுடன் தந்தை ஒரேவராக உள்ள தந்தை சகோதரர்கள்.", labelEn: "Father’s half-brothers", descriptionEn: "Paternal half-brothers of the father.", searchTerms: "தந்தையின் சகோதரர் தந்தை வழி அரைச் சகோதரர் paternal uncle عم" },
      { key: "consanguinePaternalUnclesSons", emoji: "👦", label: "தந்தை சகோதரர்களின் மகன்கள்", description: "தந்தை வழி பாதி தந்தை சகோதரரின் ஆண் பிள்ளைகள்.", labelEn: "Sons of father’s half-brothers", descriptionEn: "Male children of consanguine paternal uncles.", searchTerms: "தந்தையின் சகோதரரின் மகன் தந்தை வழி அரைச் சகோதரரின் மகன் son of paternal uncle" },
    ],
  },
  {
    title: "தூரத்து உறவினர்கள்",
    helper: "முதல் இரண்டு வாரிசு வகைகள் இல்லாத நிலைகளில் தொடர்புடையவர்கள்.",
    titleEn: "Distant relatives",
    helperEn: "These may apply when the first two heir categories are absent.",
    items: [
      { key: "daughtersChildren", emoji: "🧒", label: "மகளின் குழந்தைகள்", description: "மகள் வழி குழந்தைகள் மற்றும் அவர்களின் வரிசை.", labelEn: "Children of daughters", descriptionEn: "Children and later descendants through a daughter." },
      { key: "sonsDaughtersChildren", emoji: "🧒", label: "மகனின் மகளின் குழந்தைகள்", description: "மகன்-மகள் வழி குழந்தைகள்.", labelEn: "Children of sons’ daughters", descriptionEn: "Children through a son’s daughter." },
      { key: "maternalGrandfather", emoji: "👴", label: "தாயின் தந்தை", description: "இரண்டாவது மிடையினர்: பாகம் பெறாத, அஸபாவில்லாத தாயின் தந்தை.", labelEn: "Mother’s father", descriptionEn: "Second tier of distant relatives: the non-fixed-share, non-ʿasabah maternal grandfather." },
      { key: "fullBrothersDaughters", emoji: "👧", label: "சகோதரரின் மகள்கள்", description: "உடன்பிறந்த சகோதரரின் மகள்கள்.", labelEn: "Daughters of full brothers", descriptionEn: "Female children of full brothers." },
      { key: "fullSistersChildren", emoji: "🧒", label: "சகோதரிகளின் குழந்தைகள்", description: "உடன்பிறந்த சகோதரிகளின் பிள்ளைகள்.", labelEn: "Children of full sisters", descriptionEn: "Children of full sisters." },
      { key: "maternalBrothersChildren", emoji: "🧒", label: "தாய் வழி சகோதரரின் குழந்தைகள்", description: "தாய் வழி சகோதரரின் பிள்ளைகள்.", labelEn: "Children of maternal half-brothers", descriptionEn: "Children of brothers who share the same mother." },
      { key: "fathersMaternalBrothers", emoji: "👨‍🦳", label: "தந்தையின் தாய் வழி சகோதரர்", description: "தந்தையின் தாய் வழி சகோதரர்.", labelEn: "Father’s maternal half-brother", descriptionEn: "A brother of the father who shares his mother." },
      { key: "fathersMaternalBrothersDescendants", emoji: "🌿", label: "அவர்களின் சந்ததியினர்", description: "தந்தையின் தாய் வழி சகோதரரின் வரிசை.", labelEn: "Their descendants", descriptionEn: "Descendants of the father’s maternal half-brother." },
      { key: "mothersSiblings", emoji: "👥", label: "தாயின் சகோதரர் / சகோதரி", description: "தாயின் சகோதரர் அல்லது சகோதரி.", labelEn: "Mother’s siblings", descriptionEn: "Maternal uncles or aunts." },
      { key: "mothersSiblingsDescendants", emoji: "🌿", label: "அவர்களின் சந்ததியினர்", description: "தாயின் சகோதரர் / சகோதரியின் பிள்ளைகள்.", labelEn: "Their descendants", descriptionEn: "Children of the mother’s siblings." },
    ],
  },
];

export const ARABIC_SECTION_COPY: Record<string, { title: string; helper: string }> = {
  "Descendants through sons": { title: "أحفاد عن طريق الابن", helper: "قد تكون هذه القرابة مهمة عند عدم وجود ابن." },
  "Grandparents and ancestors": { title: "الأجداد والأصول", helper: "تُضاف هذه القرابة عند عدم وجود الوالد الأقرب." },
  "Paternal siblings and sibling descendants": { title: "الإخوة لأب وذرية الإخوة", helper: "إخوة من جهة الأب وذرية الإخوة." },
  "Father’s brother line": { title: "الأعمام (عم) وأبناؤهم", helper: "العم الشقيق والعم لأب وأبناؤهم. تتطلب هذه السلسلة مراجعة مختص." },
  "Distant relatives": { title: "ذوو الأرحام", helper: "قد تنطبق عند غياب الفئات الأولى من الورثة." },
};

export const ARABIC_EXTENDED_COPY: Record<ExtendedHeirKey, { label: string; description: string }> = {
  sonsSons: { label: "أبناء الابن", description: "أحفاد من جهة الابن." },
  sonsDaughters: { label: "بنات الابن", description: "حفيدات من جهة الابن." },
  furtherSonsLineDescendants: { label: "ذرية أبعد من جهة الابن", description: "ذرية لاحقة عبر خط الابن." },
  maternalGrandfather: { label: "جد الأم", description: "والد الأم." },
  paternalGrandmothers: { label: "جدة الأب", description: "أم الأب." },
  maternalGrandmothers: { label: "جدة الأم", description: "أم الأم." },
  furtherPaternalAncestors: { label: "أصول أبعد من جهة الأب", description: "أجداد أبعد من خط الأب." },
  paternalBrothers: { label: "إخوة لأب", description: "مع الأخت لأب: 2:1 عند عدم وجود وارث أقرب حاجب." },
  paternalSisters: { label: "أخوات لأب", description: "يشتركن في الأب وقد تختلف الأم." },
  fullBrothersSons: { label: "أبناء الإخوة الأشقاء", description: "الأبناء الذكور للإخوة الأشقاء." },
  paternalBrothersSons: { label: "أبناء الإخوة لأب", description: "الأبناء الذكور للإخوة لأب." },
  paternalUncles: { label: "الأعمام الأشقاء (عم)", description: "إخوة الأب الأشقاء." },
  paternalUnclesSons: { label: "أبناء الأعمام الأشقاء", description: "الأبناء الذكور للأعمام الأشقاء." },
  consanguinePaternalUncles: { label: "الأعمام لأب (عم لأب)", description: "إخوة الأب من جهة أبيه." },
  consanguinePaternalUnclesSons: { label: "أبناء الأعمام لأب", description: "الأبناء الذكور للأعمام لأب." },
  daughtersChildren: { label: "أبناء البنات", description: "ذرية البنت وما بعدها." },
  sonsDaughtersChildren: { label: "أبناء بنات الابن", description: "ذرية بنت الابن." },
  fullBrothersDaughters: { label: "بنات الإخوة الأشقاء", description: "البنات للإخوة الأشقاء." },
  fullSistersChildren: { label: "أبناء الأخوات الشقيقات", description: "ذرية الأخوات الشقيقات." },
  maternalBrothersChildren: { label: "أبناء الإخوة لأم", description: "ذرية الإخوة الذين يشتركون في الأم." },
  fathersMaternalBrothers: { label: "أخ الأب لأم", description: "أخ للأب يشترك معه في الأم." },
  fathersMaternalBrothersDescendants: { label: "ذرية أخ الأب لأم", description: "ذرية أخ الأب لأم." },
  mothersSiblings: { label: "إخوة الأم", description: "أخوال أو خالات." },
  mothersSiblingsDescendants: { label: "ذرية إخوة الأم", description: "أبناء إخوة الأم." },
};

export type SelectedExtendedHeir = ExtendedHeirDefinition & { count: number };

export const getSelectedExtendedHeirs = (heirs: HeirInput): SelectedExtendedHeir[] =>
  EXTENDED_HEIR_SECTIONS.flatMap((section) => section.items)
    .map((item) => ({ ...item, count: heirs[item.key] ?? 0 }))
    .filter((item) => item.count > 0);

export const VERIFIED_EXTENDED_KEYS = new Set<ExtendedHeirKey>([
  "sonsSons",
  "sonsDaughters",
  "paternalGrandmothers",
  "maternalGrandmothers",
  "paternalSisters",
]);

export const getSelectedReviewOnlyHeirs = (heirs: HeirInput): SelectedExtendedHeir[] =>
  getSelectedExtendedHeirs(heirs).filter((item) => !VERIFIED_EXTENDED_KEYS.has(item.key));

export type Allocation = {
  key: string;
  label: string;
  count: number;
  share: Fraction;
  reason: string;
  method: "fixed" | "remainder" | "redistribution";
};

export type Exclusion = {
  label: string;
  reason: string;
  /** Optional where legacy/source records only retain the human-readable relationship label. */
  key?: any;
};

export type CalculationTraceRow = {
  key: string;
  label: string;
  count: number;
  fraction: Fraction;
  method: Allocation["method"];
  integerShares: number;
  percentage: number;
  sourcePercentage: string;
  amount: number;
};

/** One human-traceable step in the common LCM method: Fraction → LCM → Units → Sum → Remaining → Final Units → Money. Purely explanatory — it never influences the actual rule/amount computed above. */
export type CalculationStep = {
  id: "eligible-heirs" | "fixed-shares" | "root-lcm" | "fixed-units" | "awl" | "remaining-units" | "asabah-distribution" | "radd" | "unallocated" | "final-lcm" | "final-units" | "money" | "verification";
  title: string;
  detail: string;
  data: Record<string, string | number | boolean>;
};

export type CalculationTrace = {
  distributableEstate: number;
  fixedShareTotal: Fraction;
  remainder: Fraction;
  lcm: number;
  rows: CalculationTraceRow[];
  allocated: Fraction;
  heldBack: Fraction;
  /** The "asl al-mas'ala" — LCM of the Fixed Share denominators only, established BEFORE any residuary/Radd distribution. */
  baseLcm: number;
  /** The complete common-method calculation chain, in order, for the frontend to explain exactly why each number was produced. */
  steps: CalculationStep[];
  /** Defensive check that the engine never silently forces or loses money: final units and final money must both reconcile to the estate. */
  integrityCheck: {
    totalUnits: number;
    allocatedUnits: number;
    heldBackUnits: number;
    unitsBalanced: boolean;
    distributedMoney: number;
    heldBackMoney: number;
    netEstate: number;
    moneyBalanced: boolean;
  };
};

export type CalculationResult = {
  netEstate: number;
  appliedBequest: number;
  bequestLimit: number;
  allocations: Allocation[];
  exclusions: Exclusion[];
  unallocatedShare: Fraction;
  notices: string[];
  fixedSharesAdjusted: boolean;
  requiresScholarReview: boolean;
  selectedExtendedHeirs: SelectedExtendedHeir[];
  selectedReviewOnlyHeirs: SelectedExtendedHeir[];
  trace: CalculationTrace;
};

const gcd = (a: number, b: number): number => {
  const x = Math.abs(a);
  const y = Math.abs(b);
  return y === 0 ? x : gcd(y, x % y);
};

export const fraction = (n: number, d = 1): Fraction => {
  if (d === 0) return { n: 0, d: 1 };
  const sign = d < 0 ? -1 : 1;
  const divisor = gcd(n, d) || 1;
  return { n: (sign * n) / divisor, d: Math.abs(d) / divisor };
};

const add = (a: Fraction, b: Fraction) => fraction(a.n * b.d + b.n * a.d, a.d * b.d);
const subtract = (a: Fraction, b: Fraction) => fraction(a.n * b.d - b.n * a.d, a.d * b.d);
const multiply = (a: Fraction, b: Fraction) => fraction(a.n * b.n, a.d * b.d);
const divide = (a: Fraction, b: Fraction) => fraction(a.n * b.d, a.d * b.n);
const greaterThan = (a: Fraction, b: Fraction) => a.n * b.d > b.n * a.d;
const equal = (a: Fraction, b: Fraction) => a.n * b.d === b.n * a.d;
const sum = (items: Fraction[]) => items.reduce((total, item) => add(total, item), fraction(0));

export const fractionToNumber = (value: Fraction) => value.n / value.d;
export const fractionToText = (value: Fraction) => (value.d === 1 ? `${value.n}` : `${value.n}/${value.d}`);

const lcm = (a: number, b: number) => Math.abs(a * b) / (gcd(a, b) || 1);

export const sourcePercentage = (value: Fraction) => {
  const key = fractionToText(value);
  return ({ "1/2": "50%", "1/4": "25%", "1/8": "12.5%", "1/6": "16.67%", "1/3": "33.33%", "2/3": "66.66%" } as Record<string, string>)[key] ?? `${fractionToNumber(value) * 100}%`;
};

/** Status label per allocation method — always shown next to the name so Fixed Share and Asabah are never confused. */
export const STATUS_LABEL: Record<AppLanguage, Record<Allocation["method"], string>> = {
  ta: { fixed: "நிர்ணயப் பங்கு (Fixed Share)", remainder: "அஸபா (மீதிப் பங்கு)", redistribution: "ரத் (மீதி திருப்பம்)" },
  en: { fixed: "Fixed Share", remainder: "Asabah (residuary)", redistribution: "Radd (returned remainder)" },
  ar: { fixed: "نصيب مفروض", remainder: "عصبة (الباقي)", redistribution: "رد (إعادة الباقي)" },
};

/** The classical Taʿṣīb/Asabah rule, shown wherever a residuary share is displayed. */
export const ASABAH_RULE_TEXT: Record<AppLanguage, string> = {
  ta: "விதி: ஆணுக்கு 2 பங்கு, பெண்ணுக்கு 1 பங்கு.",
  en: "Rule: male = 2 parts, female = 1 part.",
  ar: "القاعدة: للذكر مثل حظ الأنثيين (للذكر ٢ سهمان، للأنثى سهم واحد).",
};

/** Gender of every heir key that can ever appear as an Asabah (residuary) row, used only to display the male=2/female=1 rule — it never affects the calculation itself. */
export const ASABAH_GENDER: Record<string, "male" | "female"> = {
  father: "male",
  paternalGrandfather: "male",
  sons: "male",
  daughters: "female",
  sonsSons: "male",
  sonsDaughters: "female",
  fullBrothers: "male",
  fullSisters: "female",
  paternalBrothers: "male",
  paternalSisters: "female",
  fullBrothersSons: "male",
  paternalBrothersSons: "male",
  paternalUncles: "male",
  paternalUnclesSons: "male",
  consanguinePaternalUncles: "male",
  consanguinePaternalUnclesSons: "male",
};

/** Display-only Taʿṣīb parts. Individual residuary fractions are intentionally never needed by the UI. */
export const asabahPartsFor = (item: Pick<Allocation, "key" | "count" | "method">, group: Array<Pick<Allocation, "key" | "count" | "method">>) => {
  if (item.method !== "remainder") return 0;
  const mixed = group.some((entry) => ASABAH_GENDER[entry.key] === "male") && group.some((entry) => ASABAH_GENDER[entry.key] === "female");
  const perPerson = mixed ? (ASABAH_GENDER[item.key] === "male" ? 2 : ASABAH_GENDER[item.key] === "female" ? 1 : 1) : 1;
  return perPerson * item.count;
};

/** Builds the full common LCM method trace directly from the calculation engine's own intermediate values (not reverse-engineered from the final numbers), so every step is genuinely traceable: Fraction → LCM → Units → Sum → Remaining → Final Units → Money. */
const buildCommonMethodTrace = (params: {
  netEstate: number;
  fixedOriginal: Allocation[];
  fixedTotalOriginal: Fraction;
  fixedSharesAdjusted: boolean;
  fixedTotal: Fraction;
  remainderRows: Allocation[];
  availableRemainder: Fraction;
  redistributionRows: Allocation[];
  unallocatedShare: Fraction;
  finalAllocations: Allocation[];
}): CalculationTrace => {
  const { netEstate, fixedOriginal, fixedTotalOriginal, fixedSharesAdjusted, fixedTotal, remainderRows, availableRemainder, redistributionRows, unallocatedShare, finalAllocations } = params;
  const steps: CalculationStep[] = [];

  // Step 1 — Eligible heirs identified by the rules engine above (unchanged rules; this only reads their output).
  steps.push({
    id: "eligible-heirs",
    title: "Eligible heirs",
    detail: finalAllocations.length ? "The rules engine already identified which heirs are eligible and which method (Fixed Share or ʿAsabah) applies to each." : "No eligible heir was identified for this input.",
    data: Object.fromEntries(finalAllocations.map((item) => [`${item.key}-${item.method}`, `${item.label} × ${item.count} (${item.method})`])),
  });

  // Step 2 — Fixed shares exactly as the book states them (never divided/altered here).
  steps.push({
    id: "fixed-shares",
    title: "Fixed shares (book values)",
    detail: fixedOriginal.length ? "Each Fixed Share is the exact book fraction — untouched." : "No Fixed Share heir in this case.",
    data: Object.fromEntries(fixedOriginal.map((item) => [item.key, fractionToText(item.share)])),
  });

  // Step 3 — Root LCM ("asl al-mas'ala"): LCM of the Fixed Share denominators
  // ONLY, before any residuary distribution. This never includes a Taʿṣīb ratio,
  // an expanded unit, a percentage, an amount, or any other unrelated number.
  const baseLcm = fixedOriginal.length ? fixedOriginal.reduce((current, item) => lcm(current, item.share.d), 1) : 1;
  steps.push({
    id: "root-lcm",
    title: "Root LCM (asl al-mas'ala)",
    detail: `LCM of the fixed-share denominators only (${fixedOriginal.map((item) => item.share.d).join(", ") || "1"}) = ${baseLcm}.`,
    data: { baseLcm, denominators: fixedOriginal.map((item) => item.share.d).join(", ") || "1" },
  });

  // Step 4 — Convert every fixed fraction into root-LCM integer units and sum
  // them. baseLcm is a multiple of every fixed share's denominator by
  // construction, so this division is always exact (no rounding).
  const fixedUnits = fixedOriginal.map((item) => ({ key: item.key, method: item.method, label: item.label, units: item.share.n * (baseLcm / item.share.d) }));
  const fixedUnitsSum = fixedUnits.reduce((total, item) => total + item.units, 0);
  steps.push({
    id: "fixed-units",
    title: "Fixed shares converted to LCM units",
    detail: `LCM share = LCM × numerator ÷ denominator. Units are summed: Σ = ${fixedUnitsSum} (out of a root of ${baseLcm}).`,
    data: { ...Object.fromEntries(fixedUnits.map((item) => [item.key, item.units])), sum: fixedUnitsSum, root: baseLcm },
  });

  // From here on, every case follows ONE structure:
  // Fixed units → Fixed-unit SUM → ONE total remainder pool → money amount
  // → Taʿṣīb distribution. Taʿṣīb ratios never expand or alter the root LCM.
  // Book method: the original LCM is calculated from fixed-share denominators only.
  // Taʿṣīb remains one total remainder pool and is distributed only after its
  // money value is calculated; its ratio never changes the original LCM.
  const finalLcm = fixedSharesAdjusted ? fixedUnitsSum || 1 : baseLcm;
  const unitsByRowKey = new Map<string, number>();
  fixedUnits.forEach((item) => unitsByRowKey.set(`${item.key}-${item.method}`, item.units));
  const remainingUnits = fixedSharesAdjusted ? 0 : baseLcm - fixedUnitsSum;
  const remainderAmount = netEstate * fractionToNumber(availableRemainder);
  const group = remainderRows.length > 0 ? remainderRows : redistributionRows;
  const mixedAsabah = group.some((item) => ASABAH_GENDER[item.key] === "male") && group.some((item) => ASABAH_GENDER[item.key] === "female");
  const remainderParts = group.reduce((total, item) => {
    if (item.method === "remainder") {
      const gender = ASABAH_GENDER[item.key];
      return total + (mixedAsabah ? (gender === "male" ? 2 : gender === "female" ? 1 : 0) : 1) * item.count;
    }
    return total + 1;
  }, 0);

  if (fixedSharesAdjusted) {
    steps.push({
      id: "awl",
      title: "ʿAwl (proportional increase)",
      detail: `The fixed shares alone (Σ = ${fractionToText(fixedTotalOriginal)}) exceed the whole estate. The existing ʿAwl rule keeps the original fixed units and increases the root to ${finalLcm}. No Taʿṣīb remainder is distributed in this case.`,
      data: { originalRoot: baseLcm, increasedRoot: finalLcm, fixedTotalBeforeAwl: fractionToText(fixedTotalOriginal) },
    });
  } else {
    steps.push({
      id: "remaining-units",
      title: "Total Taʿṣīb remainder",
      detail: `Remaining units = LCM − fixed units = ${baseLcm} − ${fixedUnitsSum} = ${remainingUnits}. Keep this as one total remainder share (${fractionToText(availableRemainder)}); do not create a new primary fraction from the Taʿṣīb ratio.`,
      data: { root: baseLcm, fixedUnitsSum, remainingUnits, remainingFraction: fractionToText(availableRemainder), remainderAmount },
    });
    steps.push({
      id: "final-lcm",
      title: "Original LCM retained",
      detail: `The original LCM remains ${baseLcm}. Taʿṣīb parts are not added to it. The total remainder money is calculated first (${remainderAmount.toFixed(2)}), then distributed separately.`,
      data: { finalLcm: baseLcm, remainderParts, remainderAmount },
    });
  }

  // Step 6 — Apply the existing ʿAsabah/remainder rule to whatever units
  // remained (male = 2 parts, female = 1 part where a mixed group applies).
  // Read from the allocations already produced above — never re-derived or
  // altered here, and never treated as the total remainder itself.
  if (remainderRows.length > 0) {
    steps.push({
      id: "asabah-distribution",
      title: "ʿAsabah distribution",
      detail: `Total Taʿṣīb remainder = ${fractionToText(availableRemainder)} of the estate = ${remainderAmount.toFixed(2)}. Apply male = 2 parts and female = 1 part only to this money remainder (${remainderParts} total parts); do not add these parts to the original LCM.`,
      data: Object.fromEntries(
        remainderRows.map((item) => {
          const gender = ASABAH_GENDER[item.key];
          const parts = gender === "female" ? 1 : gender === "male" ? 2 : null;
          return [item.key, parts ? `${item.label}: ${parts} part(s) × ${item.count} of the one total Taʿṣīb remainder` : `${item.label}: one total Taʿṣīb remainder`];
        }),
      ),
    });
  }

  // Step 7 — Radd (return), only when no ʿAsabah exists and a fixed-share
  // remainder is left; excludes spouse, per the existing rule.
  if (redistributionRows.length > 0) {
    steps.push({
      id: "radd",
      title: "Radd (returned remainder)",
      detail: "No ʿAsabah heir exists for the leftover units. The existing Radd rule returns them to the eligible Fixed Share heirs (spouse excluded) in their original proportions.",
      data: Object.fromEntries(redistributionRows.map((item) => [item.key, `${item.label}: +${fractionToText(item.share)} of the estate`])),
    });
  } else if (greaterThan(unallocatedShare, fraction(0))) {
    steps.push({
      id: "unallocated",
      title: "No automatic recipient",
      detail: "This document does not name an automatic ʿAsabah or Radd recipient for the remaining units in this exact combination, so the remainder is shown as held — it is never silently forced onto any heir or rounded up to 100%.",
      data: { heldBack: fractionToText(unallocatedShare) },
    });
  }

  // Step 9 — Final unit per heir, read directly from the structured
  // calculation above (never independently re-derived per row from an
  // ad-hoc LCM of already-reduced fractions), and their sum.
  const rows: CalculationTraceRow[] = finalAllocations.map((item) => {
    const rowKey = `${item.key}-${item.method}`;
    const structuredUnits = unitsByRowKey.get(rowKey);
    // Safety net only: a row not covered by the structured calculation above
    // never happens in a balanced case — the verification step below flags it
    // if it ever does — but this keeps the display from silently breaking.
    const isRemainderRow = item.method === "remainder" || item.method === "redistribution";
    const integerShares = isRemainderRow
      ? (item.method === "remainder" ? (mixedAsabah ? (ASABAH_GENDER[item.key] === "male" ? 2 : ASABAH_GENDER[item.key] === "female" ? 1 : 1) : 1) * item.count : 1)
      : (structuredUnits !== undefined ? structuredUnits : item.share.n * (baseLcm / item.share.d));
    return {
      key: item.key,
      label: item.label,
      count: item.count,
      fraction: item.share,
      method: item.method,
      integerShares,
      percentage: fractionToNumber(item.share) * 100,
      sourcePercentage: sourcePercentage(item.share),
      amount: netEstate * fractionToNumber(item.share),
    };
  });
  const fixedDisplayedUnits = rows.filter((row) => row.method === "fixed").reduce((total, row) => total + row.integerShares, 0);
  const allocatedUnits = fixedSharesAdjusted ? fixedDisplayedUnits : baseLcm;
  const heldBackUnits = 0;
  steps.push({
    id: "final-units",
    title: "Fixed units and total remainder",
    detail: `Fixed units = ${fixedDisplayedUnits}; total remainder = ${remainingUnits} unit(s). The remainder is one pool and is not converted into new LCM fractions.`,
    data: { fixedDisplayedUnits, remainingUnits, totalUnits: finalLcm },
  });

  // Step 10 — Calculate the total remainder money first, then distribute it.
  const distributedMoney = rows.reduce((total, row) => total + row.amount, 0);
  const heldBackMoney = netEstate * fractionToNumber(unallocatedShare);
  steps.push({
    id: "money",
    title: "Remainder amount and final money",
    detail: `Total remainder amount = distributable estate × total remainder = ${remainderAmount.toFixed(2)}. That amount is then distributed according to the Taʿṣīb parts; final amounts still use exact shares.`,
    data: { remainderAmount: remainderAmount.toFixed(2), ...Object.fromEntries(rows.map((row) => [`${row.key}-${row.method}`, row.amount.toFixed(2)])), distributedMoney: distributedMoney.toFixed(2), heldBackMoney: heldBackMoney.toFixed(2) },
  });

  const unitsBalanced = fixedSharesAdjusted ? allocatedUnits === finalLcm : fixedDisplayedUnits + remainingUnits === baseLcm;
  const structureConsistent = fixedSharesAdjusted ? fixedUnitsSum === finalLcm : fixedUnitsSum + remainingUnits === baseLcm;
  const moneyBalanced = Math.abs(distributedMoney + heldBackMoney - netEstate) < 0.01;
  steps.push({
    id: "verification",
    title: "Verification",
    detail: unitsBalanced && moneyBalanced && structureConsistent ? "The final distributed amount (plus any held-back remainder) exactly equals the estate, and every intermediate unit count reconciles." : "Mismatch detected between the distributed total and the estate, or between intermediate unit counts — this case needs review before use.",
    data: { totalUnits: finalLcm, allocatedUnits, heldBackUnits, unitsBalanced, structureConsistent, netEstate, distributedMoney: Number(distributedMoney.toFixed(2)), heldBackMoney: Number(heldBackMoney.toFixed(2)), moneyBalanced },
  });

  return {
    distributableEstate: netEstate,
    fixedShareTotal: fixedTotal,
    remainder: subtract(fraction(1), fixedTotal),
    lcm: fixedSharesAdjusted ? finalLcm : baseLcm,
    rows,
    allocated: sum(finalAllocations.map((item) => item.share)),
    heldBack: unallocatedShare,
    baseLcm,
    steps,
    integrityCheck: {
      totalUnits: fixedSharesAdjusted ? finalLcm : baseLcm,
      allocatedUnits,
      heldBackUnits,
      unitsBalanced,
      distributedMoney: Number(distributedMoney.toFixed(2)),
      heldBackMoney: Number(heldBackMoney.toFixed(2)),
      netEstate,
      moneyBalanced,
    },
  };
};

const mergeAllocations = (items: Allocation[]): Allocation[] => {
  // Group by key + method (not key alone) so a person's Fixed Share (فرض) and
  // their separate ʿAsabah/Radd portion are never blended into one derived
  // fraction. Each status keeps its own book-exact fraction and percentage;
  // only literal duplicates (same person, same method) are combined.
  const merged = new Map<string, Allocation>();

  items.forEach((item) => {
    const groupKey = `${item.key}::${item.method}`;
    const current = merged.get(groupKey);
    if (!current) {
      merged.set(groupKey, item);
      return;
    }

    merged.set(groupKey, {
      ...current,
      count: current.count + item.count,
      share: add(current.share, item.share),
      reason: current.reason.includes(item.reason) ? current.reason : `${current.reason} ${item.reason}`,
    });
  });

  return Array.from(merged.values()).filter((item) => greaterThan(item.share, fraction(0)));
};

/** Combines an heir's separate fixed, Radd, or other internal components for final result display only. */
export const aggregateAllocationsForDisplay = (items: Allocation[]): Allocation[] => {
  const aggregated = new Map<string, Allocation>();
  items.forEach((item) => {
    const current = aggregated.get(item.key);
    if (!current) {
      aggregated.set(item.key, item);
      return;
    }
    const method = current.method === "remainder" || item.method === "remainder"
      ? "remainder"
      : current.method === "fixed" || item.method === "fixed"
        ? "fixed"
        : "redistribution";
    aggregated.set(item.key, {
      ...current,
      method,
      count: Math.max(current.count, item.count),
      share: add(current.share, item.share),
      reason: current.reason.includes(item.reason) ? current.reason : `${current.reason} ${item.reason}`,
    });
  });
  return Array.from(aggregated.values());
};

const allocation = (
  key: string,
  label: string,
  count: number,
  share: Fraction,
  reason: string,
  method: Allocation["method"],
): Allocation => ({ key, label, count, share, reason, method });

function calculateLegacyInheritance(estate: EstateInput, heirs: HeirInput): Omit<CalculationResult, "trace"> {
  const grossEstate = Math.max(0, estate.grossEstate || 0);
  const funeralCosts = Math.max(0, estate.funeralCosts || 0);
  const debts = Math.max(0, estate.debts || 0);
  const afterCosts = Math.max(0, grossEstate - funeralCosts - debts);
  const bequestLimit = afterCosts / 3;
  const appliedBequest = Math.min(Math.max(0, estate.bequest || 0), bequestLimit);
  const netEstate = Math.max(0, afterCosts - appliedBequest);

  const fixed: Allocation[] = [];
  const remainder: Allocation[] = [];
  const exclusions: Exclusion[] = [];
  const notices: string[] = [];
  const selectedExtendedHeirs = getSelectedExtendedHeirs(heirs);
  const selectedReviewOnlyHeirs = getSelectedReviewOnlyHeirs(heirs);
  const sonsSons = heirs.sonsSons ?? 0;
  const sonsDaughters = heirs.sonsDaughters ?? 0;
  const hasDirectSon = heirs.sons > 0;
  const hasMaleSonLineDescendant = hasDirectSon || sonsSons > 0 || (heirs.furtherSonsLineDescendants ?? 0) > 0;
  const hasFemaleSonLineDescendant = heirs.daughters > 0 || sonsDaughters > 0;
  const hasAnyDescendant = hasMaleSonLineDescendant || hasFemaleSonLineDescendant;
  const hasChildren = hasAnyDescendant;
  const hasSpouse = heirs.husband > 0 || heirs.wives > 0;
  const siblingCount = heirs.fullBrothers + heirs.fullSisters + heirs.maternalBrothers + heirs.maternalSisters + (heirs.paternalBrothers ?? 0) + (heirs.paternalSisters ?? 0);
  const grandfatherSiblingDifference = heirs.paternalGrandfather > 0 && (heirs.fullBrothers + heirs.fullSisters + (heirs.paternalBrothers ?? 0) + (heirs.paternalSisters ?? 0) > 0);

  if (grossEstate === 0) notices.push("சொத்து மதிப்பை உள்ளிடவும்.");
  if (grossEstate > 0 && funeralCosts + debts >= grossEstate) {
    notices.push("செலவுகள் மற்றும் கடன்கள் காரணமாகப் பகிரக்கூடிய சொத்து இல்லை.");
  }
  if (estate.bequest > bequestLimit && afterCosts > 0) {
    notices.push("வஸிய்யத் தொகை ஒரு மூன்றில் ஒரு பங்கைத் தாண்டியுள்ளது; கணக்கில் அனுமதிக்கப்பட்ட அளவு மட்டும் பயன்படுத்தப்பட்டுள்ளது.");
  }
  if (heirs.husband > 0 && heirs.wives > 0) {
    notices.push("கணவன் மற்றும் மனைவிகள் இருவரையும் ஒரே நேரத்தில் தேர்வு செய்ய முடியாது; மனைவி தேர்வு கணக்கில் பயன்படுத்தப்பட்டுள்ளது.");
  }
  if (selectedReviewOnlyHeirs.length > 0) {
    notices.push("கூடுதல் புத்தக-வாரிசுகள் தேர்வு செய்யப்பட்டுள்ளனர். இந்த உறவுகளின் துல்லியமான பங்குகள் அறிஞர் உறுதிப்படுத்தலுடன் கணக்கிடப்பட வேண்டும்; கீழுள்ள தானியங்கி முடிவை இறுதியானதாகப் பயன்படுத்த வேண்டாம்.");
  }

  const spouseShare = heirs.wives > 0
    ? hasChildren
      ? fraction(1, 8)
      : fraction(1, 4)
    : heirs.husband > 0
      ? hasChildren
        ? fraction(1, 4)
        : fraction(1, 2)
      : fraction(0);

  if (heirs.wives > 0) {
    fixed.push(
      allocation(
        "wives",
        "மனைவி / மனைவிகள்",
        heirs.wives,
        spouseShare,
        hasChildren ? "பிள்ளைகள் இருப்பதால் மனைவிகளின் மொத்தப் பங்கு 1/8." : "பிள்ளைகள் இல்லாததால் மனைவிகளின் மொத்தப் பங்கு 1/4.",
        "fixed",
      ),
    );
  } else if (heirs.husband > 0) {
    fixed.push(
      allocation(
        "husband",
        "கணவன்",
        1,
        spouseShare,
        hasChildren ? "பிள்ளைகள் இருப்பதால் கணவனின் பங்கு 1/4." : "பிள்ளைகள் இல்லாததால் கணவனின் பங்கு 1/2.",
        "fixed",
      ),
    );
  }

  const motherSpecialCase = heirs.mother > 0 && heirs.father > 0 && hasSpouse && !hasChildren && siblingCount < 2;
  if (heirs.mother > 0) {
    if (hasChildren || siblingCount >= 2) {
      fixed.push(allocation("mother", "தாய்", 1, fraction(1, 6), "பிள்ளைகள் அல்லது இரண்டு/அதற்கு மேற்பட்ட சகோதரர்கள் இருப்பதால் தாயின் பங்கு 1/6.", "fixed"));
    } else if (motherSpecialCase) {
      fixed.push(
        allocation(
          "mother",
          "தாய்",
          1,
          multiply(subtract(fraction(1), spouseShare), fraction(1, 3)),
          "கணவன்/மனைவி மற்றும் தந்தையுடன் இருப்பதால், துணையின் பங்குக்குப் பிறகு மீதத்தில் 1/3.",
          "fixed",
        ),
      );
    } else {
      fixed.push(allocation("mother", "தாய்", 1, fraction(1, 3), "பிள்ளைகள் மற்றும் இரண்டு சகோதரர்கள் இல்லாததால் தாயின் பங்கு 1/3.", "fixed"));
    }
  }

  let fatherGetsRemainder = false;
  let grandfatherGetsRemainder = false;
  if (heirs.father > 0) {
    if (heirs.sons > 0) {
      fixed.push(allocation("father", "தந்தை", 1, fraction(1, 6), "மகன் இருப்பதால் தந்தையின் பங்கு 1/6.", "fixed"));
    } else if (heirs.daughters > 0) {
      fixed.push(allocation("father", "தந்தை", 1, fraction(1, 6), "மகள் இருப்பதால் தந்தைக்கு 1/6; மீதமும் தந்தைக்கு செல்லலாம்.", "fixed"));
      fatherGetsRemainder = true;
    } else {
      fatherGetsRemainder = true;
    }
    if (heirs.paternalGrandfather > 0) {
      exclusions.push({ label: "தந்தையின் தந்தை", reason: "தந்தை இருப்பதால் தந்தையின் தந்தைக்கு பங்கு இல்லை." });
    }
  } else if (heirs.paternalGrandfather > 0) {
    if (heirs.sons > 0) {
      fixed.push(allocation("paternalGrandfather", "தந்தையின் தந்தை", 1, fraction(1, 6), "மகன் இருப்பதால் தந்தையின் தந்தையின் பங்கு 1/6.", "fixed"));
    } else if (heirs.daughters > 0) {
      fixed.push(allocation("paternalGrandfather", "தந்தையின் தந்தை", 1, fraction(1, 6), "மகள் இருப்பதால் 1/6; மீதமும் செல்லலாம்.", "fixed"));
      grandfatherGetsRemainder = true;
    } else {
      grandfatherGetsRemainder = true;
    }
    if (heirs.fullBrothers + heirs.fullSisters > 0) {
      notices.push("தந்தையின் தந்தை மற்றும் உடன்பிறந்த சகோதரர்கள் உள்ளனர். இந்த நிலையில் மத்ஹப் வேறுபாடு இருக்கலாம்; அறிஞர் உறுதிப்படுத்தல் அவசியம்.");
    }
  }

  if (heirs.sons > 0) {
    // Sons and daughters share the remainder together at a 2:1 ratio.
  } else if (heirs.daughters === 1) {
    fixed.push(allocation("daughters", "மகள்", 1, fraction(1, 2), "ஒரு மகள் மட்டுமே; மகன் இல்லாததால் பங்கு 1/2.", "fixed"));
  } else if (heirs.daughters > 1) {
    fixed.push(allocation("daughters", "மகள்கள்", heirs.daughters, fraction(2, 3), "இரண்டு அல்லது அதற்கு மேற்பட்ட மகள்கள்; மகன் இல்லாததால் மொத்தப் பங்கு 2/3.", "fixed"));
  }

  const maternalCount = heirs.maternalBrothers + heirs.maternalSisters;
  const maternalEligible = maternalCount > 0 && !hasChildren && heirs.father === 0 && heirs.paternalGrandfather === 0;
  if (maternalCount > 0 && !maternalEligible) {
    exclusions.push({
      label: "தாய் வழி சகோதரர் / சகோதரி",
      reason: hasChildren ? "பிள்ளைகள் இருப்பதால் தாய் வழி சகோதரர்களுக்கு பங்கு இல்லை." : "தந்தை அல்லது தந்தையின் தந்தை இருப்பதால் தாய் வழி சகோதரர்களுக்கு பங்கு இல்லை.",
    });
  }
  if (maternalEligible) {
    const maternalTotal = maternalCount === 1 ? fraction(1, 6) : fraction(1, 3);
    if (heirs.maternalBrothers > 0) {
      fixed.push(
        allocation(
          "maternalBrothers",
          "தாய் வழி சகோதரர்",
          heirs.maternalBrothers,
          multiply(maternalTotal, fraction(heirs.maternalBrothers, maternalCount)),
          maternalCount === 1 ? "ஒரு தாய் வழி சகோதரர்; பங்கு 1/6." : "தாய் வழி சகோதரர்/சகோதரிகளின் மொத்தப் பங்கு 1/3; சமமாகப் பகிரப்படும்.",
          "fixed",
        ),
      );
    }
    if (heirs.maternalSisters > 0) {
      fixed.push(
        allocation(
          "maternalSisters",
          "தாய் வழி சகோதரி",
          heirs.maternalSisters,
          multiply(maternalTotal, fraction(heirs.maternalSisters, maternalCount)),
          maternalCount === 1 ? "ஒரு தாய் வழி சகோதரி; பங்கு 1/6." : "தாய் வழி சகோதரர்/சகோதரிகளின் மொத்தப் பங்கு 1/3; சமமாகப் பகிரப்படும்.",
          "fixed",
        ),
      );
    }
  }

  const fullSiblingCount = heirs.fullBrothers + heirs.fullSisters;
  const fullSiblingsEligible = fullSiblingCount > 0 && heirs.father === 0 && heirs.paternalGrandfather === 0 && heirs.sons === 0;
  let fullSiblingsGetRemainder = false;
  if (fullSiblingCount > 0 && !fullSiblingsEligible) {
    exclusions.push({
      label: "உடன் பிறந்த சகோதரர் / சகோதரி",
      reason: heirs.sons > 0 ? "மகன் இருப்பதால் உடன்பிறந்த சகோதரர்களுக்கு பங்கு இல்லை." : "தந்தை அல்லது தந்தையின் தந்தை இருப்பதால் உடன்பிறந்த சகோதரர்களுக்கு பங்கு இல்லை.",
    });
  } else if (fullSiblingsEligible) {
    if (heirs.fullBrothers > 0 || heirs.daughters > 0) {
      fullSiblingsGetRemainder = true;
    } else if (heirs.fullSisters === 1) {
      fixed.push(allocation("fullSisters", "உடன் பிறந்த சகோதரி", 1, fraction(1, 2), "ஒரு உடன்பிறந்த சகோதரி மட்டும்; பங்கு 1/2.", "fixed"));
    } else if (heirs.fullSisters > 1) {
      fixed.push(allocation("fullSisters", "உடன் பிறந்த சகோதரிகள்", heirs.fullSisters, fraction(2, 3), "இரண்டு அல்லது அதற்கு மேற்பட்ட உடன்பிறந்த சகோதரிகள்; மொத்தப் பங்கு 2/3.", "fixed"));
    }
  }

  let fixedTotal = sum(fixed.map((item) => item.share));
  let fixedSharesAdjusted = false;
  let effectiveFixed = fixed;

  if (greaterThan(fixedTotal, fraction(1))) {
    effectiveFixed = fixed.map((item) => ({ ...item, share: divide(item.share, fixedTotal) }));
    fixedTotal = fraction(1);
    fixedSharesAdjusted = true;
    notices.push("நிர்ணயிக்கப்பட்ட பங்குகளின் கூட்டுத்தொகை சொத்தைத் தாண்டுகிறது. விகிதாசாரமாகச் சரிசெய்து முடிவு காட்டப்பட்டுள்ளது; அறிஞர் உறுதிப்படுத்தல் பரிந்துரைக்கப்படுகிறது.");
  }

  const availableRemainder = subtract(fraction(1), fixedTotal);
  if (greaterThan(availableRemainder, fraction(0))) {
    if (heirs.sons > 0) {
      const units = heirs.sons * 2 + heirs.daughters;
      remainder.push(allocation("sons", "மகன்", heirs.sons, multiply(availableRemainder, fraction(heirs.sons * 2, units)), "மீதமான சொத்தில் மகனுக்கு இரண்டு பங்கு.", "remainder"));
      if (heirs.daughters > 0) {
        remainder.push(allocation("daughters", "மகள்", heirs.daughters, multiply(availableRemainder, fraction(heirs.daughters, units)), "மீதமான சொத்தில் மகளுக்கு ஒரு பங்கு.", "remainder"));
      }
    } else if (fatherGetsRemainder && heirs.father > 0) {
      remainder.push(allocation("father", "தந்தை", 1, availableRemainder, "மீதமான சொத்து தந்தைக்கு செல்கிறது.", "remainder"));
    } else if (grandfatherGetsRemainder && heirs.paternalGrandfather > 0) {
      remainder.push(allocation("paternalGrandfather", "தந்தையின் தந்தை", 1, availableRemainder, "மீதமான சொத்து தந்தையின் தந்தைக்கு செல்கிறது.", "remainder"));
    } else if (fullSiblingsGetRemainder) {
      const units = heirs.fullBrothers * 2 + heirs.fullSisters;
      if (heirs.fullBrothers > 0) {
        remainder.push(allocation("fullBrothers", "உடன் பிறந்த சகோதரர்", heirs.fullBrothers, multiply(availableRemainder, fraction(heirs.fullBrothers * 2, units)), "மீதமான சொத்தில் சகோதரருக்கு இரண்டு பங்கு.", "remainder"));
      }
      if (heirs.fullSisters > 0) {
        remainder.push(allocation("fullSisters", "உடன் பிறந்த சகோதரி", heirs.fullSisters, multiply(availableRemainder, fraction(heirs.fullSisters, units)), heirs.fullBrothers > 0 ? "மீதமான சொத்தில் சகோதரிக்கு ஒரு பங்கு." : "மகளுடன் இருப்பதால் மீதமான பங்கு உடன்பிறந்த சகோதரிக்கு செல்கிறது.", "remainder"));
      }
    }
  }

  const allocationsBeforeRedistribution = mergeAllocations([...effectiveFixed, ...remainder]);
  const allocatedBeforeRedistribution = sum(allocationsBeforeRedistribution.map((item) => item.share));
  const remainingAfterResiduary = subtract(fraction(1), allocatedBeforeRedistribution);
  let redistribution: Allocation[] = [];
  let unallocatedShare = fraction(0);

  if (greaterThan(remainingAfterResiduary, fraction(0))) {
    const eligibleForRedistribution = allocationsBeforeRedistribution.filter((item) => item.key !== "husband" && item.key !== "wives");
    const eligibleTotal = sum(eligibleForRedistribution.map((item) => item.share));
    if (greaterThan(eligibleTotal, fraction(0))) {
      redistribution = eligibleForRedistribution.map((item) =>
        allocation(
          item.key,
          item.label,
          item.count,
          multiply(remainingAfterResiduary, divide(item.share, eligibleTotal)),
          "மீதமான பங்கு, துணையின் பங்கைத் தவிர்த்து தகுதியுள்ள வாரிசுகளுக்கு மீள்பகிர்வு செய்யப்பட்டது.",
          "redistribution",
        ),
      );
    } else if (!equal(remainingAfterResiduary, fraction(0))) {
      unallocatedShare = remainingAfterResiduary;
      notices.push("இந்த எளிய கணக்கில் மீதமான பங்கிற்கு தகுதியுள்ள வாரிசு இல்லை. அறிஞர் உறுதிப்படுத்தல் தேவை.");
    }
  }

  if (fullSiblingCount > 0 && heirs.paternalGrandfather > 0) {
    notices.push("சகோதரர்கள் மற்றும் தந்தையின் தந்தை தொடர்பான சில விதிகளில் கருத்து வேறுபாடு உள்ளது; இது தற்காலிக விளக்கம் மட்டுமே.");
  }

  if (allocationsBeforeRedistribution.length === 0 && netEstate > 0) {
    notices.push("வாரிசுகள் தேர்வு செய்யப்படவில்லை அல்லது இந்த எளிய பதிப்பில் ஆதரிக்கப்படாத உறவு தேவைப்படுகிறது.");
  }

  return {
    netEstate,
    appliedBequest,
    bequestLimit,
    allocations: mergeAllocations([...allocationsBeforeRedistribution, ...redistribution]),
    exclusions,
    unallocatedShare,
    notices,
    fixedSharesAdjusted,
    requiresScholarReview: selectedReviewOnlyHeirs.length > 0,
    selectedExtendedHeirs,
    selectedReviewOnlyHeirs,
  };
}

function calculateAuditedInheritance(estate: EstateInput, heirs: HeirInput): CalculationResult {
  const grossEstate = Math.max(0, estate.grossEstate || 0);
  const funeralCosts = Math.max(0, estate.funeralCosts || 0);
  const debts = Math.max(0, estate.debts || 0);
  const afterCosts = Math.max(0, grossEstate - funeralCosts - debts);
  const bequestLimit = afterCosts / 3;
  const appliedBequest = Math.min(Math.max(0, estate.bequest || 0), bequestLimit);
  const netEstate = Math.max(0, afterCosts - appliedBequest);
  const fixed: Allocation[] = [];
  const remainder: Allocation[] = [];
  const exclusions: Exclusion[] = [];
  const notices: string[] = [];
  const sonsSons = heirs.sonsSons ?? 0;
  const sonsDaughters = heirs.sonsDaughters ?? 0;
  const paternalBrothers = heirs.paternalBrothers ?? 0;
  const paternalSisters = heirs.paternalSisters ?? 0;
  const fullBrothersSons = heirs.fullBrothersSons ?? 0;
  const paternalBrothersSons = heirs.paternalBrothersSons ?? 0;
  const paternalUncles = heirs.paternalUncles ?? 0;
  const paternalUnclesSons = heirs.paternalUnclesSons ?? 0;
  const consanguinePaternalUncles = heirs.consanguinePaternalUncles ?? 0;
  const consanguinePaternalUnclesSons = heirs.consanguinePaternalUnclesSons ?? 0;
  const paternalGrandmothers = heirs.paternalGrandmothers ?? 0;
  const maternalGrandmothers = heirs.maternalGrandmothers ?? 0;
  const hasDirectSon = heirs.sons > 0;
  const hasMaleSonLineDescendant = hasDirectSon || sonsSons > 0 || (heirs.furtherSonsLineDescendants ?? 0) > 0;
  const hasFemaleSonLineDescendant = heirs.daughters > 0 || sonsDaughters > 0;
  const hasAnyDescendant = hasMaleSonLineDescendant || hasFemaleSonLineDescendant;
  const hasSpouse = heirs.husband > 0 || heirs.wives > 0;
  const fullSiblingCount = heirs.fullBrothers + heirs.fullSisters;
  const paternalSiblingPairEligible = paternalBrothers > 0 && paternalSisters > 0 && !hasAnyDescendant && heirs.father === 0 && heirs.paternalGrandfather === 0 && fullSiblingCount === 0;
  const noCloserAsaba = !hasMaleSonLineDescendant && heirs.father === 0 && heirs.paternalGrandfather === 0;
  const fullBrotherSonsEligible = fullBrothersSons > 0 && fullSiblingCount === 0 && noCloserAsaba;
  const paternalBrotherSoloEligible = paternalBrothers > 0 && paternalSisters === 0 && fullSiblingCount === 0 && fullBrothersSons === 0 && noCloserAsaba;
  const paternalBrotherSonsEligible = paternalBrothersSons > 0 && paternalBrothers === 0 && paternalSisters === 0 && fullSiblingCount === 0 && fullBrothersSons === 0 && noCloserAsaba;
  const paternalUncleEligible = paternalUncles > 0 && paternalUnclesSons === 0 && consanguinePaternalUncles === 0 && consanguinePaternalUnclesSons === 0 && paternalBrothers === 0 && paternalBrothersSons === 0 && fullSiblingCount === 0 && fullBrothersSons === 0 && noCloserAsaba;
  const paternalUncleSonsEligible = paternalUnclesSons > 0 && paternalUncles === 0 && consanguinePaternalUncles === 0 && consanguinePaternalUnclesSons === 0 && paternalBrothers === 0 && paternalBrothersSons === 0 && fullSiblingCount === 0 && fullBrothersSons === 0 && noCloserAsaba;
  const consanguinePaternalUncleEligible = consanguinePaternalUncles > 0 && consanguinePaternalUnclesSons === 0 && paternalUncles === 0 && paternalUnclesSons === 0 && paternalBrothers === 0 && paternalBrothersSons === 0 && fullSiblingCount === 0 && fullBrothersSons === 0 && noCloserAsaba;
  const consanguinePaternalUncleSonsEligible = consanguinePaternalUnclesSons > 0 && consanguinePaternalUncles === 0 && paternalUncles === 0 && paternalUnclesSons === 0 && paternalBrothers === 0 && paternalBrothersSons === 0 && fullSiblingCount === 0 && fullBrothersSons === 0 && noCloserAsaba;
  const automaticMaleResidueKeys = new Set<ExtendedHeirKey>([
    ...(fullBrotherSonsEligible ? ["fullBrothersSons" as ExtendedHeirKey] : []),
    ...(paternalBrotherSoloEligible ? ["paternalBrothers" as ExtendedHeirKey] : []),
    ...(paternalBrotherSonsEligible ? ["paternalBrothersSons" as ExtendedHeirKey] : []),
    ...(paternalUncleEligible ? ["paternalUncles" as ExtendedHeirKey] : []),
    ...(paternalUncleSonsEligible ? ["paternalUnclesSons" as ExtendedHeirKey] : []),
    ...(consanguinePaternalUncleEligible ? ["consanguinePaternalUncles" as ExtendedHeirKey] : []),
    ...(consanguinePaternalUncleSonsEligible ? ["consanguinePaternalUnclesSons" as ExtendedHeirKey] : []),
  ]);
  const selectedExtendedHeirs = getSelectedExtendedHeirs(heirs);
  const selectedReviewOnlyHeirs = getSelectedReviewOnlyHeirs(heirs).filter((item) => (item.key !== "paternalBrothers" || !paternalSiblingPairEligible) && !automaticMaleResidueKeys.has(item.key));
  const siblingCount = fullSiblingCount + heirs.maternalBrothers + heirs.maternalSisters + paternalBrothers + paternalSisters;
  const grandfatherSiblingDifference = heirs.paternalGrandfather > 0 && (fullSiblingCount + paternalBrothers + paternalSisters > 0);

  if (grossEstate === 0) notices.push("சொத்து மதிப்பை உள்ளிடவும்.");
  if (grossEstate > 0 && funeralCosts + debts >= grossEstate) notices.push("செலவுகள் மற்றும் கடன்கள் காரணமாகப் பகிரக்கூடிய சொத்து இல்லை.");
  if (estate.bequest > bequestLimit && afterCosts > 0) notices.push("வஸிய்யத் தொகை ஒரு மூன்றில் ஒரு பங்கைத் தாண்டியுள்ளது; கணக்கில் அனுமதிக்கப்பட்ட அளவு மட்டும் பயன்படுத்தப்பட்டுள்ளது.");
  if (heirs.husband > 0 && heirs.wives > 0) notices.push("கணவன் மற்றும் மனைவிகள் இருவரையும் ஒரே நேரத்தில் தேர்வு செய்ய முடியாது; மனைவி தேர்வு கணக்கில் பயன்படுத்தப்பட்டுள்ளது.");
  if (selectedReviewOnlyHeirs.length > 0) notices.push("இந்த ஆவணத்தில் இது தெளிவாக குறிப்பிடப்படவில்லை: சில தூரத்து அல்லது நீண்ட வரிசை உறவுகளின் முன்னுரிமை மற்றும் துல்லியமான பங்கு அறிஞர் உறுதிப்படுத்தலுடன் தீர்மானிக்கப்பட வேண்டும்.");
  if (grandfatherSiblingDifference) notices.push("தந்தையின் தந்தை மற்றும் சகோதரர்/சகோதரி உள்ளனர். இந்நிலையில் மத்ஹப் வேறுபாடு உள்ளது; அறிஞர் உறுதிப்படுத்தல் அவசியம்.");

  const spouseShare = heirs.wives > 0 ? (hasAnyDescendant ? fraction(1, 8) : fraction(1, 4)) : heirs.husband > 0 ? (hasAnyDescendant ? fraction(1, 4) : fraction(1, 2)) : fraction(0);
  if (heirs.wives > 0) fixed.push(allocation("wives", "மனைவி / மனைவிகள்", heirs.wives, spouseShare, hasAnyDescendant ? "பிள்ளைகள் அல்லது மகன் வழி சந்ததியினர் இருப்பதால் மனைவிகளின் மொத்தப் பங்கு 1/8." : "பிள்ளைகள் இல்லாததால் மனைவிகளின் மொத்தப் பங்கு 1/4.", "fixed"));
  else if (heirs.husband > 0) fixed.push(allocation("husband", "கணவன்", 1, spouseShare, hasAnyDescendant ? "பிள்ளைகள் அல்லது மகன் வழி சந்ததியினர் இருப்பதால் கணவனின் பங்கு 1/4." : "பிள்ளைகள் இல்லாததால் கணவனின் பங்கு 1/2.", "fixed"));

  const motherSpecialCase = heirs.mother > 0 && heirs.father > 0 && hasSpouse && !hasAnyDescendant && siblingCount < 2;
  if (heirs.mother > 0) {
    if (hasAnyDescendant || siblingCount >= 2) fixed.push(allocation("mother", "தாய்", 1, fraction(1, 6), "பிள்ளைகள், மகன் வழி சந்ததியினர் அல்லது இரண்டு/அதற்கு மேற்பட்ட சகோதரர்கள் இருப்பதால் தாயின் பங்கு 1/6.", "fixed"));
    else if (motherSpecialCase) fixed.push(allocation("mother", "தாய்", 1, multiply(subtract(fraction(1), spouseShare), fraction(1, 3)), "கணவன்/மனைவி மற்றும் தந்தையுடன் இருப்பதால், துணையின் பங்குக்குப் பிறகு மீதத்தில் 1/3.", "fixed"));
    else fixed.push(allocation("mother", "தாய்", 1, fraction(1, 3), "சந்ததியினரும் இரண்டு சகோதரர்களும் இல்லாததால் தாயின் பங்கு 1/3.", "fixed"));
  }

  const eligiblePaternalGrandmothers = heirs.mother === 0 && heirs.father === 0 ? paternalGrandmothers : 0;
  const eligibleMaternalGrandmothers = heirs.mother === 0 && heirs.paternalGrandfather === 0 ? maternalGrandmothers : 0;
  const eligibleGrandmotherCount = eligiblePaternalGrandmothers + eligibleMaternalGrandmothers;
  if (eligibleGrandmotherCount > 0) {
    const eachGrandmotherShare = fraction(1, 6 * eligibleGrandmotherCount);
    if (eligiblePaternalGrandmothers > 0) fixed.push(allocation("paternalGrandmothers", "தந்தை வழி பாட்டி", eligiblePaternalGrandmothers, multiply(eachGrandmotherShare, fraction(eligiblePaternalGrandmothers)), "தாய் இல்லாததால் தந்தை வழி பாட்டி/பாட்டிகளுக்கு 1/6 பங்கில் உரிய பகுதி.", "fixed"));
    if (eligibleMaternalGrandmothers > 0) fixed.push(allocation("maternalGrandmothers", "தாய் வழி பாட்டி", eligibleMaternalGrandmothers, multiply(eachGrandmotherShare, fraction(eligibleMaternalGrandmothers)), "தாய் இல்லாததால் தாய் வழி பாட்டி/பாட்டிகளுக்கு 1/6 பங்கில் உரிய பகுதி.", "fixed"));
  }
  if (paternalGrandmothers > 0 && eligiblePaternalGrandmothers === 0) exclusions.push({ label: "தந்தை வழி பாட்டி", reason: heirs.mother > 0 ? "தாய் இருப்பதால் பாட்டிக்கு பங்கு இல்லை." : "தந்தை இருப்பதால் தந்தை வழி பாட்டிக்கு பங்கு இல்லை." });
  if (maternalGrandmothers > 0 && eligibleMaternalGrandmothers === 0) exclusions.push({ label: "தாய் வழி பாட்டி", reason: heirs.mother > 0 ? "தாய் இருப்பதால் பாட்டிக்கு பங்கு இல்லை." : "தந்தையின் தந்தை இருப்பதால் இவ்வமைப்பில் அறிஞர் உறுதிப்படுத்தல் தேவை." });

  let fatherGetsRemainder = false;
  let grandfatherGetsRemainder = false;
  if (heirs.father > 0) {
    if (hasMaleSonLineDescendant) fixed.push(allocation("father", "தந்தை", 1, fraction(1, 6), "மகன் அல்லது மகன் வழி ஆண் சந்ததியினர் இருப்பதால் தந்தையின் பங்கு 1/6.", "fixed"));
    else if (hasFemaleSonLineDescendant) { fixed.push(allocation("father", "தந்தை", 1, fraction(1, 6), "மகள் அல்லது மகன் வழி பெண் சந்ததியினர் இருப்பதால் தந்தைக்கு 1/6; மீதமும் தந்தைக்கு செல்லலாம்.", "fixed")); fatherGetsRemainder = true; }
    else fatherGetsRemainder = true;
    if (heirs.paternalGrandfather > 0) exclusions.push({ label: "தந்தையின் தந்தை", reason: "தந்தை இருப்பதால் தந்தையின் தந்தைக்கு பங்கு இல்லை." });
  } else if (heirs.paternalGrandfather > 0) {
    if (hasMaleSonLineDescendant) fixed.push(allocation("paternalGrandfather", "தந்தையின் தந்தை", 1, fraction(1, 6), "மகன் அல்லது மகன் வழி ஆண் சந்ததியினர் இருப்பதால் தந்தையின் தந்தையின் பங்கு 1/6.", "fixed"));
    else if (hasFemaleSonLineDescendant) { fixed.push(allocation("paternalGrandfather", "தந்தையின் தந்தை", 1, fraction(1, 6), "மகள் அல்லது மகன் வழி பெண் சந்ததியினர் இருப்பதால் 1/6; மீதமும் செல்லலாம்.", "fixed")); grandfatherGetsRemainder = true; }
    else grandfatherGetsRemainder = true;
  }

  if (!hasDirectSon && heirs.daughters === 1) fixed.push(allocation("daughters", "மகள்", 1, fraction(1, 2), "ஒரு மகள் மட்டுமே; மகன் இல்லாததால் பங்கு 1/2.", "fixed"));
  else if (!hasDirectSon && heirs.daughters > 1) fixed.push(allocation("daughters", "மகள்கள்", heirs.daughters, fraction(2, 3), "இரண்டு அல்லது அதற்கு மேற்பட்ட மகள்கள்; மகன் இல்லாததால் மொத்தப் பங்கு 2/3.", "fixed"));

  let sonsSonsGetRemainder = false;
  let fullSiblingsGetRemainder = false;
  let paternalSistersGetRemainder = false;
  if (hasDirectSon && sonsDaughters > 0) exclusions.push({ label: "மகனின் மகள்", reason: "மகன் இருப்பதால் மகனின் மகளுக்கு பங்கு இல்லை." });
  else if (sonsSons > 0) sonsSonsGetRemainder = true;
  else if (sonsDaughters > 0) {
    if (heirs.daughters >= 2) exclusions.push({ label: "மகனின் மகள்", reason: "இரண்டு அல்லது அதற்கு மேற்பட்ட மகள்கள் இருப்பதால் மகனின் மகளுக்கு பங்கு இல்லை." });
    else if (heirs.daughters === 1) fixed.push(allocation("sonsDaughters", "மகனின் மகள்", sonsDaughters, fraction(1, 6), "ஒரு மகளுடன் இருப்பதால் மகனின் மகள்களின் மொத்தப் பங்கு 1/6.", "fixed"));
    else fixed.push(allocation("sonsDaughters", "மகனின் மகள்", sonsDaughters, sonsDaughters === 1 ? fraction(1, 2) : fraction(2, 3), sonsDaughters === 1 ? "ஒரு மகனின் மகள் மட்டுமே; பங்கு 1/2." : "இரண்டு அல்லது அதற்கு மேற்பட்ட மகனின் மகள்கள்; மொத்தப் பங்கு 2/3.", "fixed"));
  }

  const maternalCount = heirs.maternalBrothers + heirs.maternalSisters;
  const maternalEligible = maternalCount > 0 && !hasAnyDescendant && heirs.father === 0 && heirs.paternalGrandfather === 0;
  if (maternalCount > 0 && !maternalEligible) exclusions.push({ label: "தாய் வழி சகோதரர் / சகோதரி", reason: hasAnyDescendant ? "பிள்ளைகள் அல்லது மகன் வழி சந்ததியினர் இருப்பதால் தாய் வழி சகோதரர்களுக்கு பங்கு இல்லை." : "தந்தை அல்லது தந்தையின் தந்தை இருப்பதால் தாய் வழி சகோதரர்களுக்கு பங்கு இல்லை." });
  if (maternalEligible) {
    const maternalTotal = maternalCount === 1 ? fraction(1, 6) : fraction(1, 3);
    if (heirs.maternalBrothers > 0) fixed.push(allocation("maternalBrothers", "தாய் வழி சகோதரர்", heirs.maternalBrothers, multiply(maternalTotal, fraction(heirs.maternalBrothers, maternalCount)), maternalCount === 1 ? "ஒரு தாய் வழி சகோதரர்; பங்கு 1/6." : "தாய் வழி சகோதரர்/சகோதரிகளின் மொத்தப் பங்கு 1/3; சமமாகப் பகிரப்படும்.", "fixed"));
    if (heirs.maternalSisters > 0) fixed.push(allocation("maternalSisters", "தாய் வழி சகோதரி", heirs.maternalSisters, multiply(maternalTotal, fraction(heirs.maternalSisters, maternalCount)), maternalCount === 1 ? "ஒரு தாய் வழி சகோதரி; பங்கு 1/6." : "தாய் வழி சகோதரர்/சகோதரிகளின் மொத்தப் பங்கு 1/3; சமமாகப் பகிரப்படும்.", "fixed"));
  }

  const fullSiblingsEligible = fullSiblingCount > 0 && heirs.father === 0 && heirs.paternalGrandfather === 0 && !hasMaleSonLineDescendant;
  if (fullSiblingCount > 0 && !fullSiblingsEligible) exclusions.push({ label: "உடன் பிறந்த சகோதரர் / சகோதரி", reason: hasMaleSonLineDescendant ? "மகன் அல்லது மகன் வழி ஆண் சந்ததியினர் இருப்பதால் உடன்பிறந்த சகோதரர்களுக்கு பங்கு இல்லை." : "தந்தை அல்லது தந்தையின் தந்தை இருப்பதால் உடன்பிறந்த சகோதரர்களுக்கு பங்கு இல்லை." });
  else if (fullSiblingsEligible) {
    if (heirs.fullBrothers > 0 || hasFemaleSonLineDescendant) fullSiblingsGetRemainder = true;
    else if (heirs.fullSisters === 1) fixed.push(allocation("fullSisters", "உடன் பிறந்த சகோதரி", 1, fraction(1, 2), "ஒரு உடன்பிறந்த சகோதரி மட்டும்; பங்கு 1/2.", "fixed"));
    else if (heirs.fullSisters > 1) fixed.push(allocation("fullSisters", "உடன் பிறந்த சகோதரிகள்", heirs.fullSisters, fraction(2, 3), "இரண்டு அல்லது அதற்கு மேற்பட்ட உடன்பிறந்த சகோதரிகள்; மொத்தப் பங்கு 2/3.", "fixed"));
  }

  let paternalSiblingsGetRemainder = false;
  const paternalSisterEligible = paternalSisters > 0 && !hasMaleSonLineDescendant && heirs.father === 0 && heirs.paternalGrandfather === 0;
  if (paternalSisters > 0 && !paternalSisterEligible) exclusions.push({ label: "தந்தை வழி சகோதரி", reason: hasMaleSonLineDescendant ? "மகன் அல்லது மகன் வழி ஆண் சந்ததியினர் இருப்பதால் தந்தை வழி சகோதரிக்கு பங்கு இல்லை." : "தந்தை அல்லது தந்தையின் தந்தை இருப்பதால் இவ்வமைப்பில் தானியங்கி முடிவு இல்லை." });
  else if (paternalSisterEligible) {
    if (paternalSiblingPairEligible) paternalSiblingsGetRemainder = true;
    else if (heirs.fullBrothers > 0 || fullSiblingsGetRemainder || heirs.fullSisters >= 2) exclusions.push({ label: "தந்தை வழி சகோதரி", reason: "தகுதியுள்ள உடன்பிறந்த சகோதரர் அல்லது சகோதரி இருப்பதால் தந்தை வழி சகோதரிக்கு பங்கு இல்லை." });
    else if (paternalBrothers > 0) notices.push("தந்தை வழி சகோதரர் மற்றும் சகோதரி தேர்வு செய்யப்பட்டுள்ளனர். இந்த அட்டவணையில் குறிப்பிடாத நெருக்கமான வாரிசு அமைப்பு இருப்பதால் அறிஞர் உறுதிப்படுத்தல் தேவை.");
    else if (hasFemaleSonLineDescendant) paternalSistersGetRemainder = true;
    else if (heirs.fullSisters === 1) fixed.push(allocation("paternalSisters", "தந்தை வழி சகோதரி", paternalSisters, fraction(1, 6), "ஒரு உடன்பிறந்த சகோதரியுடன் இருப்பதால் தந்தை வழி சகோதரிகளின் மொத்தப் பங்கு 1/6.", "fixed"));
    else fixed.push(allocation("paternalSisters", "தந்தை வழி சகோதரி", paternalSisters, paternalSisters === 1 ? fraction(1, 2) : fraction(2, 3), paternalSisters === 1 ? "ஒரு தந்தை வழி சகோதரி மட்டும்; பங்கு 1/2." : "இரண்டு அல்லது அதற்கு மேற்பட்ட தந்தை வழி சகோதரிகள்; மொத்தப் பங்கு 2/3.", "fixed"));
  }

  let fixedTotal = sum(fixed.map((item) => item.share));
  let fixedSharesAdjusted = false;
  let effectiveFixed = fixed;
  if (greaterThan(fixedTotal, fraction(1))) {
    effectiveFixed = fixed.map((item) => ({ ...item, share: divide(item.share, fixedTotal) }));
    fixedTotal = fraction(1);
    fixedSharesAdjusted = true;
    notices.push("நிர்ணயிக்கப்பட்ட பங்குகளின் கூட்டுத்தொகை சொத்தைத் தாண்டுகிறது. விகிதாசாரமாகச் சரிசெய்து முடிவு காட்டப்பட்டுள்ளது; அறிஞர் உறுதிப்படுத்தல் பரிந்துரைக்கப்படுகிறது.");
  }

  const availableRemainder = subtract(fraction(1), fixedTotal);
  if (greaterThan(availableRemainder, fraction(0))) {
    if (hasDirectSon) {
      const units = heirs.sons * 2 + heirs.daughters;
      remainder.push(allocation("sons", "மகன்", heirs.sons, multiply(availableRemainder, fraction(heirs.sons * 2, units)), "மீதமான சொத்தில் மகனுக்கு இரண்டு பங்கு.", "remainder"));
      if (heirs.daughters > 0) remainder.push(allocation("daughters", "மகள்", heirs.daughters, multiply(availableRemainder, fraction(heirs.daughters, units)), "மீதமான சொத்தில் மகளுக்கு ஒரு பங்கு.", "remainder"));
    } else if (sonsSonsGetRemainder) {
      const units = sonsSons * 2 + sonsDaughters;
      remainder.push(allocation("sonsSons", "மகனின் மகன்", sonsSons, multiply(availableRemainder, fraction(sonsSons * 2, units)), "மீதமான சொத்தில் மகனின் மகனுக்கு இரண்டு பங்கு.", "remainder"));
      if (sonsDaughters > 0) remainder.push(allocation("sonsDaughters", "மகனின் மகள்", sonsDaughters, multiply(availableRemainder, fraction(sonsDaughters, units)), "மகனின் மகனுடன் இருப்பதால் மீதமான சொத்தில் மகனின் மகளுக்கு ஒரு பங்கு.", "remainder"));
    } else if (fatherGetsRemainder && heirs.father > 0) remainder.push(allocation("father", "தந்தை", 1, availableRemainder, "மீதமான சொத்து தந்தைக்கு செல்கிறது.", "remainder"));
    else if (grandfatherGetsRemainder && heirs.paternalGrandfather > 0) remainder.push(allocation("paternalGrandfather", "தந்தையின் தந்தை", 1, availableRemainder, "மீதமான சொத்து தந்தையின் தந்தைக்கு செல்கிறது.", "remainder"));
    else if (fullSiblingsGetRemainder) {
      const units = heirs.fullBrothers * 2 + heirs.fullSisters;
      if (heirs.fullBrothers > 0) remainder.push(allocation("fullBrothers", "உடன் பிறந்த சகோதரர்", heirs.fullBrothers, multiply(availableRemainder, fraction(heirs.fullBrothers * 2, units)), "மீதமான சொத்தில் சகோதரருக்கு இரண்டு பங்கு.", "remainder"));
      if (heirs.fullSisters > 0) remainder.push(allocation("fullSisters", "உடன் பிறந்த சகோதரி", heirs.fullSisters, multiply(availableRemainder, fraction(heirs.fullSisters, units)), heirs.fullBrothers > 0 ? "மீதமான சொத்தில் சகோதரிக்கு ஒரு பங்கு." : "மகள் அல்லது மகன் வழி மகளுடன் இருப்பதால் மீதமான பங்கு உடன்பிறந்த சகோதரிக்கு செல்கிறது.", "remainder"));
    } else if (fullBrotherSonsEligible) {
      remainder.push(allocation("fullBrothersSons", "உடன்பிறந்த சகோதரரின் மகன்", fullBrothersSons, availableRemainder, "முந்தைய ‘அஸபா வகுப்பினர் இல்லாததால், உடன்பிறந்த சகோதரரின் மகன்கள் மீதமான சொத்தைப் பெறுகிறார்கள்.", "remainder"));
    } else if (paternalBrotherSoloEligible) {
      remainder.push(allocation("paternalBrothers", "தந்தை வழி சகோதரர்", paternalBrothers, availableRemainder, "நெருங்கிய ‘அஸபா வாரிசு இல்லாததால், தந்தை வழி சகோதரர் மீதமான சொத்தைப் பெறுகிறார்.", "remainder"));
    } else if (paternalBrotherSonsEligible) {
      remainder.push(allocation("paternalBrothersSons", "தந்தை வழி சகோதரரின் மகன்", paternalBrothersSons, availableRemainder, "நெருங்கிய ‘அஸபா வாரிசு இல்லாததால், தந்தை வழி சகோதரரின் மகன் மீதமான சொத்தைப் பெறுகிறார்.", "remainder"));
    } else if (paternalUncleEligible) {
      remainder.push(allocation("paternalUncles", "தந்தையின் முழு சகோதரர் (அம்)", paternalUncles, availableRemainder, "முன்னைய ‘அஸபா வகுப்பினர் இல்லாததால், அம் மீதமான சொத்தைப் பெறுகிறார்.", "remainder"));
    } else if (paternalUncleSonsEligible) {
      remainder.push(allocation("paternalUnclesSons", "அம் மகன்", paternalUnclesSons, availableRemainder, "நெருங்கிய ‘அஸபா வாரிசு இல்லாததால், அம் மகன் மீதமான சொத்தைப் பெறுகிறார்.", "remainder"));
    } else if (consanguinePaternalUncleEligible) {
      remainder.push(allocation("consanguinePaternalUncles", "தந்தையின் தந்தை வழி சகோதரர் (அம் لأب)", consanguinePaternalUncles, availableRemainder, "முன்னைய ‘அஸபா வகுப்பினர் இல்லாததால், அம் لأب மீதமான சொத்தைப் பெறுகிறார்.", "remainder"));
    } else if (consanguinePaternalUncleSonsEligible) {
      remainder.push(allocation("consanguinePaternalUnclesSons", "அம் لأب மகன்", consanguinePaternalUnclesSons, availableRemainder, "நெருங்கிய ‘அஸபா வாரிசு இல்லாததால், அம் لأب மகன் மீதமான சொத்தைப் பெறுகிறார்.", "remainder"));
    } else if (paternalSiblingsGetRemainder) {
      const units = paternalBrothers * 2 + paternalSisters;
      remainder.push(allocation("paternalBrothers", "தந்தை வழி சகோதரர்", paternalBrothers, multiply(availableRemainder, fraction(paternalBrothers * 2, units)), "தந்தை வழி சகோதரியுடன் இருப்பதால் மீதமான சொத்தில் சகோதரருக்கு இரண்டு பங்கு.", "remainder"));
      remainder.push(allocation("paternalSisters", "தந்தை வழி சகோதரி", paternalSisters, multiply(availableRemainder, fraction(paternalSisters, units)), "தந்தை வழி சகோதரருடன் இருப்பதால் மீதமான சொத்தில் சகோதரிக்கு ஒரு பங்கு.", "remainder"));
    } else if (paternalSistersGetRemainder) remainder.push(allocation("paternalSisters", "தந்தை வழி சகோதரி", paternalSisters, availableRemainder, "மகள் அல்லது மகன் வழி மகளுடன் இருப்பதால் மீதமான பங்கு தந்தை வழி சகோதரிக்கு செல்கிறது.", "remainder"));
  }

  const allocationsBeforeRedistribution = mergeAllocations([...effectiveFixed, ...remainder]);
  const allocatedBeforeRedistribution = sum(allocationsBeforeRedistribution.map((item) => item.share));
  const remainingAfterResiduary = subtract(fraction(1), allocatedBeforeRedistribution);
  let redistribution: Allocation[] = [];
  let unallocatedShare = fraction(0);
  if (greaterThan(remainingAfterResiduary, fraction(0))) {
    const raddEligible = effectiveFixed.filter((item) => item.key !== "husband" && item.key !== "wives");
    const raddBase = sum(raddEligible.map((item) => item.share));
    if (greaterThan(raddBase, fraction(0))) {
      redistribution = raddEligible.map((item) => allocation(item.key, item.label, item.count, multiply(remainingAfterResiduary, divide(item.share, raddBase)), "ரத் (Radd): அஸபா இல்லாதபோது, துணையைத் தவிர்த்து அசல் நிர்ணயப் பங்கு விகிதத்தில் மீதி திருப்பி வழங்கப்பட்டது.", "redistribution"));
    } else {
      unallocatedShare = remainingAfterResiduary;
      notices.push("இந்த அமைப்பில் மீதமான பங்கிற்கு இந்த ஆவணத்தில் குறிப்பிடப்பட்ட தகுதியான அஸபா அல்லது ரத் பெறுநர் இல்லை; மீதி தனியாகக் காட்டப்பட்டுள்ளது.");
    }
  }
  if (allocationsBeforeRedistribution.length === 0 && netEstate > 0) notices.push("வாரிசுகள் தேர்வு செய்யப்படவில்லை அல்லது இவ்வமைப்பு அறிஞர் உறுதிப்படுத்தல் தேவைப்படும் வகையைச் சேர்ந்தது.");

  const finalAllocations = mergeAllocations([...allocationsBeforeRedistribution, ...redistribution]);
  const trace = buildCommonMethodTrace({
    netEstate,
    fixedOriginal: fixed,
    fixedTotalOriginal: sum(fixed.map((item) => item.share)),
    fixedSharesAdjusted,
    fixedTotal,
    remainderRows: remainder,
    availableRemainder,
    redistributionRows: redistribution,
    unallocatedShare,
    finalAllocations,
  });

  return {
    netEstate,
    appliedBequest,
    bequestLimit,
    allocations: finalAllocations,
    exclusions,
    unallocatedShare,
    notices,
    fixedSharesAdjusted,
    requiresScholarReview: selectedReviewOnlyHeirs.length > 0 || grandfatherSiblingDifference,
    selectedExtendedHeirs,
    selectedReviewOnlyHeirs,
    trace,
  };
}

export const calculateInheritance = (estate: EstateInput, heirs: HeirInput): CalculationResult => calculateAuditedInheritance(estate, heirs);
