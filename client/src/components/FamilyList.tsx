/** Design: Miraasu Scholarly Ledger — family selection in two sections,
 *  ஆண் வாரிசுகள் (male heirs) and பெண் வாரிசுகள் (female heirs).
 *  Every relationship is its own single connected card: icon + name on top,
 *  the toggle or stepper controls connected below it in the same card.
 *  Tamil names for the listed relationships are exactly as provided,
 *  including the bracketed explanations; unlisted members keep the app's
 *  existing labels. No member added, removed, or duplicated; keys,
 *  calculations and eligibility are untouched. Spouse exclusivity is
 *  preserved on the cards themselves: choosing the husband card clears
 *  wives, and any wives count clears the husband — the old spouse
 *  selector row is replaced, not the rule. */
import { useMemo } from "react";
import { RotateCcw, Search, type LucideIcon } from "lucide-react";
import { HeirRow } from "@/components/HeirRow";
import { heirIconForEmoji, heirIconForKey } from "@/components/heirIcons";
import { ARABIC_EXTENDED_COPY, EXTENDED_HEIR_SECTIONS, type AppLanguage, type ExtendedHeirKey, type HeirInput } from "@/lib/inheritance";

type PrimaryDef = { key: keyof HeirInput; ta: string; en: string; ar: string; ur: string; max?: number };

const PRIMARY: PrimaryDef[] = [
  { key: "father", ta: "அப்பா", en: "Father", ar: "الأب", ur: "باپ", max: 1 },
  { key: "mother", ta: "அம்மா", en: "Mother", ar: "الأم", ur: "ماں", max: 1 },
  { key: "sons", ta: "மகன்கள்", en: "Sons", ar: "الأبناء", ur: "بیٹے" },
  { key: "daughters", ta: "மகள்கள்", en: "Daughters", ar: "البنات", ur: "بیٹیاں" },
  { key: "paternalGrandfather", ta: "தாத்தா (தந்தை வழி)", en: "Father's father", ar: "جد الأب", ur: "دادا (باپ کی طرف)", max: 1 },
  { key: "fullBrothers", ta: "உடன்பிறந்த சகோதரர்", en: "Full brothers", ar: "الإخوة الأشقاء", ur: "سگے بھائی" },
  { key: "fullSisters", ta: "உடன்பிறந்த சகோதரி", en: "Full sisters", ar: "الأخوات الشقيقات", ur: "سگی بہنیں" },
  { key: "maternalBrothers", ta: "தாய் வழி சகோதரர்", en: "Maternal half-brothers", ar: "الإخوة لأم", ur: "ماں کی طرف کے بھائی" },
  { key: "maternalSisters", ta: "தாய் வழி சகோதரி", en: "Maternal half-sisters", ar: "الأخوات لأم", ur: "ماں کی طرف کی بہنیں" },
];

/** Tamil display overrides for engine labels that contain English text (engine file is protected). */
const TA_LABEL_OVERRIDES: Partial<Record<ExtendedHeirKey, string>> = {
  paternalGrandmothers: "தந்தை வழி பாட்டி",
  maternalGrandmothers: "தாய் வழி பாட்டி",
};

/** Urdu labels for the extended relatives (engine copy stays Tamil; shown to the user in Urdu). */
const URDU_EXTENDED_LABELS: Record<ExtendedHeirKey, string> = {
  sonsSons: "پوتے",
  sonsDaughters: "پوتیاں",
  furtherSonsLineDescendants: "بیٹے کی طرف سے مزید نسل",
  maternalGrandfather: "نانا",
  paternalGrandmothers: "دادی",
  maternalGrandmothers: "نانی",
  furtherPaternalAncestors: "باپ کی طرف سے مزید آباؤ اجداد",
  paternalBrothers: "باپ کی طرف کے بھائی",
  paternalSisters: "باپ کی طرف کی بہنیں",
  fullBrothersSons: "سگے بھائیوں کے بیٹے",
  paternalBrothersSons: "باپ کی طرف کے بھائیوں کے بیٹے",
  paternalUncles: "سگے چچا (عم)",
  paternalUnclesSons: "سگے چچاؤں کے بیٹے",
  consanguinePaternalUncles: "باپ کی طرف کے چچا",
  consanguinePaternalUnclesSons: "باپ کی طرف کے چچاؤں کے بیٹے",
  daughtersChildren: "بیٹی کے بچے",
  sonsDaughtersChildren: "پوتی کے بچے",
  fullBrothersDaughters: "سگے بھائیوں کی بیٹیاں",
  fullSistersChildren: "سگی بہنوں کے بچے",
  maternalBrothersChildren: "ماں کی طرف کے بھائیوں کے بچے",
  fathersMaternalBrothers: "باپ کا مادری بھائی",
  fathersMaternalBrothersDescendants: "ان کی اولاد",
  mothersSiblings: "ماں کے بہن بھائی",
  mothersSiblingsDescendants: "ان کی اولاد",
};

/** Tamil names exactly as provided, including the bracketed explanations. */
const TA_PROVIDED_LABELS: Partial<Record<keyof HeirInput, string>> = {
  sons: "மகன்",
  sonsSons: "மகனுடைய மகன் (பேரன்)",
  furtherSonsLineDescendants: "மகனுடைய மகனுடைய மகன் (கொள்ளுப் பேரன்)",
  father: "தந்தை",
  paternalGrandfather: "தந்தையுடைய தந்தை (தாத்தா)",
  furtherPaternalAncestors: "தந்தையுடைய தந்தையுடைய தந்தை (முப்பாட்டன்)",
  fullBrothers: "உடன்பிறந்த சகோதரர் (அண்ணன் / தம்பி)",
  fullBrothersSons: "அவருடைய மகன் (சகோதரரின் மகன்)",
  paternalBrothers: "தந்தை வழிச் சகோதரர் (தந்தை ஒன்று, தாய் வேறு)",
  paternalBrothersSons: "அவருடைய மகன் (தந்தை வழிச் சகோதரரின் மகன்)",
  maternalBrothers: "தாய் வழிச் சகோதரர் (தாய் ஒன்று, தந்தை வேறு)",
  paternalUncles: "தந்தையுடன் பிறந்த சகோதரர்கள் (பெரியாத்தா / சின்னாத்தா)",
  paternalUnclesSons: "அவர்களுடைய பிள்ளைகள் (பெரியாத்தா / சின்னாத்தாவின் மகன்கள்)",
  husband: "கணவர்",
  daughters: "மகள்",
  mother: "தாய்",
  wives: "மனைவி",
  sonsDaughters: "மகனின் மகள்கள் (பேத்திகள்)",
  paternalGrandmothers: "தந்தையின் தாய் (பாட்டி)",
  maternalGrandmothers: "தாயின் தாய் (பாட்டி)",
  fullSisters: "உடன்பிறந்த சகோதரி (அக்கா / தங்கை)",
  paternalSisters: "தந்தை வழிச் சகோதரி (தந்தை ஒன்று, தாய் வேறு)",
  maternalSisters: "தாய் வழிச் சகோதரி (தாய் ஒன்று, தந்தை வேறு)",
};

/** Section order follows the provided lists; unlisted members follow by gender. */
const MALE_KEYS: (keyof HeirInput)[] = [
  "sons", "sonsSons", "furtherSonsLineDescendants", "father", "paternalGrandfather",
  "furtherPaternalAncestors", "fullBrothers", "fullBrothersSons", "paternalBrothers",
  "paternalBrothersSons", "maternalBrothers", "paternalUncles", "paternalUnclesSons",
  "husband", "maternalGrandfather", "consanguinePaternalUncles",
  "consanguinePaternalUnclesSons", "fathersMaternalBrothers",
  "fathersMaternalBrothersDescendants", "maternalBrothersChildren",
];
const FEMALE_KEYS: (keyof HeirInput)[] = [
  "daughters", "mother", "wives", "sonsDaughters", "paternalGrandmothers",
  "maternalGrandmothers", "fullSisters", "paternalSisters", "maternalSisters",
  "fullBrothersDaughters", "daughtersChildren", "sonsDaughtersChildren",
  "fullSistersChildren", "mothersSiblings", "mothersSiblingsDescendants",
];

const EXTENDED_BY_KEY = new Map(EXTENDED_HEIR_SECTIONS.flatMap((section) => section.items).map((item) => [item.key, item]));

function labelFor(key: keyof HeirInput, language: AppLanguage | "ur"): string {
  if (language === "ta") {
    const provided = TA_PROVIDED_LABELS[key];
    if (provided) return provided;
  }
  if (key === "husband") return language === "en" ? "Husband" : language === "ar" ? "الزوج" : language === "ur" ? "شوہر" : "கணவர்";
  if (key === "wives") return language === "en" ? "Wives" : language === "ar" ? "الزوجات" : language === "ur" ? "بیویاں" : "மனைவி";
  const primary = PRIMARY.find((item) => item.key === key);
  if (primary) return language === "en" ? primary.en : language === "ar" ? primary.ar : language === "ur" ? primary.ur : primary.ta;
  const item = EXTENDED_BY_KEY.get(key as ExtendedHeirKey);
  if (!item) return key;
  return language === "en"
    ? item.labelEn
    : language === "ar"
      ? ARABIC_EXTENDED_COPY[item.key].label
      : language === "ur"
        ? URDU_EXTENDED_LABELS[item.key]
        : (TA_LABEL_OVERRIDES[item.key] ?? item.label);
}

function iconFor(key: keyof HeirInput): LucideIcon {
  const item = EXTENDED_BY_KEY.get(key as ExtendedHeirKey);
  return item ? heirIconForEmoji(item.emoji) : heirIconForKey(key);
}

function maxFor(key: keyof HeirInput): number | undefined {
  if (key === "husband") return 1;
  if (key === "wives") return 4;
  return PRIMARY.find((item) => item.key === key)?.max;
}

type FamilyListProps = {
  heirs: HeirInput;
  onChange: (key: keyof HeirInput, value: number) => void;
  onResetAll: () => void;
  query: string;
  onQueryChange: (value: string) => void;
  onSearchEnter?: () => void;
  language?: AppLanguage | "ur";
};

export function FamilyList({ heirs, onChange, onResetAll, query, onQueryChange, onSearchEnter, language = "ta" }: FamilyListProps) {
  const copy =
    language === "en"
      ? { search: "Search a family member…", clear: "Clear all", none: "No match. Clear the search to see everyone.", male: "Male heirs", female: "Female heirs" }
      : language === "ar"
        ? { search: "ابحث عن قريب…", clear: "مسح الكل", none: "لا توجد نتيجة. امسح البحث لرؤية الجميع.", male: "الورثة الذكور", female: "الورثة الإناث" }
        : language === "ur"
          ? { search: "رشتہ دار تلاش کریں…", clear: "سب صاف کریں", none: "کوئی نتیجہ نہیں۔ سب دیکھنے کے لیے تلاش صاف کریں۔", male: "مرد ورثاء", female: "خواتین ورثاء" }
          : { search: "உறவைத் தேடுக…", clear: "அனைத்தையும் அழி", none: "பொருத்தம் இல்லை. தேடலை அழிக்கவும்.", male: "ஆண் வாரிசுகள்", female: "பெண் வாரிசுகள்" };

  const rows = useMemo(() => {
    const build = (keys: (keyof HeirInput)[]) =>
      keys.map((key) => ({ key, icon: iconFor(key), label: labelFor(key, language), max: maxFor(key) }));
    return { male: build(MALE_KEYS), female: build(FEMALE_KEYS) };
  }, [language]);
  const allRows = [...rows.male, ...rows.female];

  const normalizedQuery = query.trim().toLocaleLowerCase();
  const filteredRows = normalizedQuery ? allRows.filter((row) => row.label.toLocaleLowerCase().includes(normalizedQuery)) : allRows;

  const changeFor = (key: keyof HeirInput) => (value: number) => {
    onChange(key, value);
    // Spouse exclusivity lives on the cards now: husband clears wives,
    // any wives count clears the husband — the old selector row is gone.
    if (key === "husband" && value === 1) onChange("wives", 0);
    if (key === "wives" && value > 0) onChange("husband", 0);
  };

  const renderRows = (list: typeof allRows) => (
    <div className="ms-chips">
      {list.map((row, index) => (
        <HeirRow key={row.key} index={index} icon={row.icon} label={row.label} value={heirs[row.key] ?? 0} onChange={changeFor(row.key)} max={row.max} language={language} />
      ))}
    </div>
  );

  return (
    <div className="ms-family-list space-y-4" dir={language === "ar" || language === "ur" ? "rtl" : "ltr"}>
      <div className="flex flex-col gap-2 sm:flex-row">
        <label className="ms-search block flex-1">
          <span className="sr-only">{copy.search}</span>
          <span className="ms-search-icon"><Search size={18} /></span>
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            aria-keyshortcuts="Enter"
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                onSearchEnter?.();
              }
            }}
            placeholder={copy.search}
          />
        </label>
        <button
          type="button"
          onClick={onResetAll}
          className="ms-btn ms-btn-soft min-h-11! py-2! text-sm"
        >
          <RotateCcw size={16} /> {copy.clear}
        </button>
      </div>

      {filteredRows.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[rgba(22,79,134,0.3)] bg-white/70 px-4 py-6 text-center text-sm text-slate-600">{copy.none}</p>
      ) : normalizedQuery ? (
        renderRows(filteredRows)
      ) : (
        <>
          <section>
            <h2 className="ms-gender-title">{copy.male}</h2>
            {renderRows(rows.male)}
          </section>
          <section>
            <h2 className="ms-gender-title">{copy.female}</h2>
            {renderRows(rows.female)}
          </section>
        </>
      )}
    </div>
  );
}
