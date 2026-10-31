/** Design: Miraasu Scholarly Ledger — family selection as one flat list in
 *  the provided order, with no side headings or group headings. Every
 *  relationship is its own single card: name on one side, the toggle or
 *  stepper controls in the side corner of the same card. Tamil names are
 *  exactly as provided for the listed relationships; members the list
 *  does not name keep the app's existing labels and follow after them, so
 *  no member is added, removed, or duplicated. Keys, calculations,
 *  eligibility and blocking are untouched. Four pairs the list names
 *  separately (mother's brother/sister, sister's son/daughter, daughter's
 *  son/daughter, son's daughter's son/daughter) share one calculator
 *  member each, so each pair shows as one card carrying both names;
 *  three listed relationships (son's son's daughter, grandfather's
 *  brothers and their sons) have no matching member and do not appear
 *  as cards. Spouse exclusivity is preserved on the cards themselves:
 *  choosing the husband card clears wives, and any wives count clears
 *  the husband. */
import { useMemo } from "react";
import { RotateCcw, Search } from "lucide-react";
import { HeirRow } from "@/components/HeirRow";
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

/** Tamil names exactly as provided in the ordered list. Pairs that share
 *  one calculator member carry both provided names on the one card. */
const TA_PROVIDED_LABELS: Partial<Record<keyof HeirInput, string>> = {
  husband: "கணவர்",
  wives: "மனைவி",
  father: "தந்தை",
  mother: "தாய்",
  sons: "மகன்",
  daughters: "மகள்",
  paternalGrandfather: "தந்தையின் தந்தை (தாத்தா)",
  paternalGrandmothers: "தந்தையின் தாய் (பாட்டி)",
  maternalGrandmothers: "தாயின் தாய் (பாட்டி)",
  maternalGrandfather: "தாயின் தந்தை (தாய்வழித் தாத்தா)",
  sonsSons: "மகனுடைய மகன் (பேரன்)",
  sonsDaughters: "மகனுடைய மகள் (பேத்தி)",
  furtherSonsLineDescendants: "மகனுடைய மகனுடைய மகன் (கொள்ளுப் பேரன்)",
  fullBrothers: "உடன்பிறந்த சகோதரர் (அண்ணன் / தம்பி)",
  fullSisters: "உடன்பிறந்த சகோதரி (அக்கா / தங்கை)",
  paternalBrothers: "தந்தை வழிச் சகோதரர்",
  paternalSisters: "தந்தை வழிச் சகோதரி",
  maternalBrothers: "தாய் வழிச் சகோதரர்",
  maternalSisters: "தாய் வழிச் சகோதரி",
  fullBrothersSons: "உடன்பிறந்த சகோதரரின் மகன்",
  paternalBrothersSons: "தந்தை வழிச் சகோதரரின் மகன்",
  paternalUncles: "தந்தையின் உடன்பிறந்த சகோதரர் (பெரியப்பா / சித்தப்பா)",
  paternalUnclesSons: "தந்தையின் உடன்பிறந்த சகோதரரின் மகன்",
  fathersMaternalBrothers: "தந்தையின் தாய் வழிச் சகோதரர்",
  mothersSiblings: "தாயின் சகோதரர் (மாமா) / தாயின் சகோதரி (சித்தி / பெரியம்மா)",
  fullBrothersDaughters: "உடன்பிறந்த சகோதரரின் மகள்",
  fullSistersChildren: "சகோதரியின் மகன் / சகோதரியின் மகள்",
  daughtersChildren: "மகளின் மகன் / மகளின் மகள்",
  sonsDaughtersChildren: "மகனின் மகளின் மகன் / மகனின் மகளின் மகள்",
};

/** The provided order. The list's son's son's daughter, grandfather's
 *  brothers and their sons have no matching member in the calculator,
 *  so they do not appear as cards; members the list does not name
 *  follow after, in the app's existing order, so nothing is lost. */
const ORDERED_KEYS: (keyof HeirInput)[] = [
  "husband", "wives", "father", "mother", "sons", "daughters",
  "paternalGrandfather", "paternalGrandmothers", "maternalGrandmothers",
  "maternalGrandfather", "sonsSons", "sonsDaughters",
  "furtherSonsLineDescendants", "fullBrothers", "fullSisters",
  "paternalBrothers", "paternalSisters", "maternalBrothers",
  "maternalSisters", "fullBrothersSons", "paternalBrothersSons",
  "paternalUncles", "paternalUnclesSons", "fathersMaternalBrothers",
  "mothersSiblings", "fullBrothersDaughters", "fullSistersChildren",
  "daughtersChildren", "sonsDaughtersChildren",
];
const UNLISTED_KEYS: (keyof HeirInput)[] = [
  "furtherPaternalAncestors", "consanguinePaternalUncles",
  "consanguinePaternalUnclesSons", "maternalBrothersChildren",
  "fathersMaternalBrothersDescendants", "mothersSiblingsDescendants",
];
const ALL_KEYS: (keyof HeirInput)[] = [...ORDERED_KEYS, ...UNLISTED_KEYS];

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
      ? { search: "Search a family member…", clear: "Clear all", none: "No match. Clear the search to see everyone." }
      : language === "ar"
        ? { search: "ابحث عن قريب…", clear: "مسح الكل", none: "لا توجد نتيجة. امسح البحث لرؤية الجميع." }
        : language === "ur"
          ? { search: "رشتہ دار تلاش کریں…", clear: "سب صاف کریں", none: "کوئی نتیجہ نہیں۔ سب دیکھنے کے لیے تلاش صاف کریں۔" }
          : { search: "உறவைத் தேடுக…", clear: "அனைத்தையும் அழி", none: "பொருத்தம் இல்லை. தேடலை அழிக்கவும்." };

  const allRows = useMemo(
    () => ALL_KEYS.map((key) => ({ key, label: labelFor(key, language), max: maxFor(key) })),
    [language],
  );

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
        <HeirRow key={row.key} index={index} label={row.label} value={heirs[row.key] ?? 0} onChange={changeFor(row.key)} max={row.max} language={language} />
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
      ) : (
        renderRows(filteredRows)
      )}
    </div>
  );
}
