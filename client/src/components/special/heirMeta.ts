/**
 * Special Methods v2 — heir metadata shared by all 12 calculators.
 * Tamil labels follow the main calculator's TA_PROVIDED_LABELS (as in v1);
 * English labels are the plain-language equivalents; Arabic labels use the
 * standard fiqh terms from the study report.
 */
import { emptyHeirs } from "@/lib/specialMethods";
import type { HeirInput } from "@/lib/inheritance";
import type { Lang } from "./types";
import { tx3 } from "./types";

export type HeirMeta = {
  key: keyof HeirInput;
  ta: string;
  en: string;
  ar: string;
  single?: boolean;
};

export const HEIR_META: HeirMeta[] = [
  { key: "husband", ta: "கணவர்", en: "Husband", ar: "الزوج", single: true },
  { key: "wives", ta: "மனைவி", en: "Wife", ar: "الزوجة" },
  { key: "father", ta: "தந்தை", en: "Father", ar: "الأب", single: true },
  { key: "mother", ta: "தாய்", en: "Mother", ar: "الأم", single: true },
  { key: "paternalGrandfather", ta: "தந்தையின் தந்தை (தாத்தா)", en: "Paternal grandfather", ar: "الجدّ (أبو الأب)", single: true },
  { key: "sons", ta: "மகன்", en: "Son", ar: "الابن" },
  { key: "daughters", ta: "மகள்", en: "Daughter", ar: "البنت" },
  { key: "sonsSons", ta: "மகனுடைய மகன் (பேரன்)", en: "Son's son", ar: "ابن الابن" },
  { key: "sonsDaughters", ta: "மகனுடைய மகள் (பேத்தி)", en: "Son's daughter", ar: "بنت الابن" },
  { key: "fullBrothers", ta: "உடன்பிறந்த சகோதரர் (அண்ணன் / தம்பி)", en: "Full brother", ar: "الأخ الشقيق" },
  { key: "fullSisters", ta: "உடன்பிறந்த சகோதரி (அக்கா / தங்கை)", en: "Full sister", ar: "الأخت الشقيقة" },
  { key: "paternalBrothers", ta: "தந்தை வழிச் சகோதரர்", en: "Paternal half-brother", ar: "الأخ لأب" },
  { key: "paternalSisters", ta: "தந்தை வழி சகோதரி", en: "Paternal half-sister", ar: "الأخت لأب" },
  { key: "maternalBrothers", ta: "தாய் வழிச் சகோதரர்", en: "Maternal brother", ar: "الأخ لأم" },
  { key: "maternalSisters", ta: "தாய் வழிச் சகோதரி", en: "Maternal sister", ar: "الأخت لأم" },
  { key: "paternalUncles", ta: "தந்தையின் உடன்பிறந்த சகோதரர் (பெரியப்பா / சித்தப்பா)", en: "Paternal uncle", ar: "العمّ" },
  { key: "paternalUnclesSons", ta: "தந்தையின் உடன்பிறந்த சகோதரரின் மகன்", en: "Paternal uncle's son", ar: "ابن العمّ" },
  // AR-REVIEW: the distant-relative keys below have no fixed-share label in
  // the book; these Arabic names are plain descriptions, not book terms.
  { key: "maternalGrandfather", ta: "தாயின் தந்தை (தாய்வழித் தாத்தா)", en: "Maternal grandfather", ar: "الجدّ لأم", single: true },
  { key: "paternalGrandmothers", ta: "தந்தையின் தாய் (பாட்டி)", en: "Paternal grandmother", ar: "الجدة لأب" },
  { key: "maternalGrandmothers", ta: "தாயின் தாய் (பாட்டி)", en: "Maternal grandmother", ar: "الجدة لأم" },
  { key: "daughtersChildren", ta: "மகளின் மகன் / மகளின் மகள்", en: "Daughter's child", ar: "ولد البنت" },
  { key: "sonsDaughtersChildren", ta: "மகனின் மகளின் மகன் / மகனின் மகளின் மகள்", en: "Son's daughter's child", ar: "ولد بنت الابن" },
  { key: "fullBrothersDaughters", ta: "உடன்பிறந்த சகோதரரின் மகள்", en: "Full brother's daughter", ar: "بنت الأخ الشقيق" },
  { key: "fullSistersChildren", ta: "சகோதரியின் மகன் / சகோதரியின் மகள்", en: "Full sister's child", ar: "ولد الأخت الشقيقة" },
];

export const HEIR_LABEL: Record<string, { ta: string; en: string; ar: string }> =
  Object.fromEntries(HEIR_META.map((m) => [m.key, { ta: m.ta, en: m.en, ar: m.ar }]));

export const heirLabel = (key: string, lang: Lang): string => {
  const known = HEIR_LABEL[key];
  if (!known) return key;
  return tx3(lang, known.ta, known.en, known.ar);
};

/** Full HeirInput with every picker key present (core 11 + extended keys at 0). */
export function blankHeirs(): HeirInput {
  const base = emptyHeirs() as Record<string, number | undefined>;
  for (const m of HEIR_META) if (base[m.key] === undefined) base[m.key] = 0;
  return base as HeirInput;
}

export function preloadHeirs(rec: Record<string, number>): HeirInput {
  const out = blankHeirs() as Record<string, number | undefined>;
  for (const [k, v] of Object.entries(rec)) out[k] = v;
  return out as HeirInput;
}

export function heirCount(heirs: HeirInput, key: keyof HeirInput): number {
  return (heirs as Record<string, number | undefined>)[key] ?? 0;
}

export function hasAnyHeir(heirs: HeirInput): boolean {
  return HEIR_META.some((m) => heirCount(heirs, m.key) > 0);
}

export function enteredHeirKeys(heirs: HeirInput): HeirMeta[] {
  return HEIR_META.filter((m) => heirCount(heirs, m.key) > 0);
}
