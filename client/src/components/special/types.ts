/**
 * Special Methods v2 — shared types + trilingual text helpers.
 *
 * The content file carries Arabic as OPTIONAL `*Ar` fields (added by a
 * parallel worker: titleAr, explanationAr, formulaAr, hintAr, labelAr,
 * finalAnswerAr, variantAr, noteAr, textAr, itemsAr, nameAr, resultAr,
 * pageTitleAr, …). These readers use `topic.titleAr ?? topic.titleEn`
 * semantics through a safe cast, so they compile and behave correctly
 * whether or not those optional fields have landed yet.
 */
import {
  SPECIAL_STRINGS,
  type DhawulArhamBranch,
  type SahihFasidCategory,
  type SpecialStringKey,
  type SpecialTopic,
  type WorkedExample,
} from "@/lib/specialMethodsContent";

export type Lang = "ta" | "en" | "ar";

export const tx3 = (lang: Lang, ta: string, en: string, ar: string) =>
  lang === "ta" ? ta : lang === "ar" ? ar : en;

/**
 * Read one v4 shared/per-topic string (SPECIAL_STRINGS in the content
 * file) in the current language, filling `{x}` / `{n}` placeholders.
 */
export const ss = (
  key: SpecialStringKey,
  lang: Lang,
  vars?: Record<string, string | number>,
): string => {
  const entry = SPECIAL_STRINGS[key];
  let out: string = lang === "ta" ? entry.ta : lang === "ar" ? entry.ar : entry.en;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) out = out.replaceAll(`{${k}}`, String(v));
  }
  return out;
};

export const fmt = (n: number) =>
  n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export type TopicCalcProps = { topic: SpecialTopic; lang: Lang };

/** Read an optional Arabic string field off any content object. */
const arOf = (obj: unknown, key: string): string | undefined => {
  const v = (obj as Record<string, unknown> | null)?.[key];
  return typeof v === "string" && v.length > 0 ? v : undefined;
};

/** Read an optional Arabic string-array field off any content object. */
const arArrOf = (obj: unknown, key: string): string[] | undefined => {
  const v = (obj as Record<string, unknown> | null)?.[key];
  return Array.isArray(v) && v.every((x) => typeof x === "string") ? (v as string[]) : undefined;
};

/** One trilingual string: Tamil / English / optional-Arabic-with-English-fallback. */
export const tri = (
  lang: Lang,
  ta: string,
  en: string,
  arKey: string,
  obj: unknown,
): string => (lang === "ta" ? ta : lang === "ar" ? (arOf(obj, arKey) ?? en) : en);

export const tTitle = (topic: SpecialTopic, lang: Lang): string =>
  tri(lang, topic.titleTa, topic.titleEn, "titleAr", topic);

/** One short plain line for the hub card (max ~12 words, factual). */
export const tCardLine = (topic: SpecialTopic, lang: Lang): string =>
  tri(lang, topic.cardLineTa, topic.cardLineEn, "cardLineAr", topic);

export const tFormula = (topic: SpecialTopic, lang: Lang): string =>
  tri(lang, topic.formulaTa, topic.formulaEn, "formulaAr", topic);

export const tHint = (topic: SpecialTopic, lang: Lang): string =>
  tri(lang, topic.hintTa, topic.hintEn, "hintAr", topic);

export const tScholar = (topic: SpecialTopic, lang: Lang): string =>
  tri(lang, topic.scholarFlag.textTa, topic.scholarFlag.textEn, "textAr", topic.scholarFlag);

export const tExplanation = (topic: SpecialTopic, lang: Lang): string[] =>
  lang === "ta"
    ? topic.explanationTa
    : lang === "ar"
      ? (arArrOf(topic, "explanationAr") ?? topic.explanationEn)
      : topic.explanationEn;

export const tBranchTitle = (branch: DhawulArhamBranch, lang: Lang): string =>
  tri(lang, branch.titleTa, branch.titleEn, "titleAr", branch);

export const tBranchItems = (branch: DhawulArhamBranch, lang: Lang): string[] =>
  lang === "ta"
    ? branch.itemsTa
    : lang === "ar"
      ? (arArrOf(branch, "itemsAr") ?? branch.itemsEn)
      : branch.itemsEn;

export const tCategoryName = (cat: SahihFasidCategory, lang: Lang): string =>
  tri(lang, cat.nameTa, cat.nameEn, "nameAr", cat);

export const tCategoryResult = (cat: SahihFasidCategory, lang: Lang): string =>
  tri(lang, cat.resultTa, cat.resultEn, "resultAr", cat);

export const tExampleVariant = (ex: WorkedExample, lang: Lang): string =>
  lang === "ta"
    ? (ex.variantTa ?? "")
    : lang === "ar"
      ? (arOf(ex, "variantAr") ?? ex.variantEn ?? "")
      : (ex.variantEn ?? "");

export const tExampleLabel = (
  step: { labelTa: string; labelEn: string },
  lang: Lang,
): string => tri(lang, step.labelTa, step.labelEn, "labelAr", step);

export const tExampleAnswer = (ex: WorkedExample, lang: Lang): string =>
  tri(lang, ex.finalAnswerTa, ex.finalAnswerEn, "finalAnswerAr", ex);

export const tPreloadNote = (topic: SpecialTopic, lang: Lang): string =>
  tri(lang, topic.preload.noteTa, topic.preload.noteEn, "noteAr", topic.preload);

/** Shared validation messages (trilingual). */
export const errEstate = (lang: Lang): string =>
  tx3(
    lang,
    "சொத்துத் தொகை 0-ஐ விட அதிகமாக இருக்க வேண்டும்.",
    "Enter an estate greater than zero.",
    "أدخل تركة أكبر من صفر.",
  );

export const errHeirs = (lang: Lang): string =>
  tx3(lang, "குறைந்தது ஒரு வாரிசையாவது உள்ளிடவும்.", "Enter at least one heir.", "أدخل وارثًا واحدًا على الأقل.");

export const errHeirsOrClaimants = (lang: Lang): string =>
  tx3(
    lang,
    "குறைந்தது ஒரு வாரிசையாவது அல்லது ஒரு தூரத்து உறவினரையாவது உள்ளிடவும்.",
    "Enter at least one heir or one distant relative.",
    "أدخل وارثًا واحدًا أو قريبًا بعيدًا واحدًا على الأقل.",
  );
