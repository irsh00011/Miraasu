/** Premium redesign: search + spouse selector + compact square card grid with section titles. Props unchanged. */
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
  { key: "paternalGrandfather", ta: "தாத்தா (தந்தை வழி)", en: "Father’s father", ar: "جد الأب", ur: "دادا (باپ کی طرف)", max: 1 },
  { key: "fullBrothers", ta: "உடன்பிறந்த சகோதரர்", en: "Full brothers", ar: "الإخوة الأشقاء", ur: "سگے بھائی" },
  { key: "fullSisters", ta: "உடன்பிறந்த சகோதரி", en: "Full sisters", ar: "الأخوات الشقيقات", ur: "سگی بہنیں" },
  { key: "maternalBrothers", ta: "தாய் வழி சகோதரர்", en: "Maternal half-brothers", ar: "الإخوة لأم", ur: "ماں کی طرف کے بھائی" },
  { key: "maternalSisters", ta: "தாய் வழி சகோதரி", en: "Maternal half-sisters", ar: "الأخوات لأم", ur: "ماں کی طرف کی بہنیں" },
];

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

const SECTION_TITLES: Record<string, Record<string, string>> = {
  "Descendants through sons": { ta: "மகன் வழி சந்ததியினர்", en: "Descendants through sons", ar: "أحفاد عن طريق الابن", ur: "بیٹے کی طرف سے نسل" },
  "Grandparents and ancestors": { ta: "தாத்தா, பாட்டி மற்றும் மூதாதையர்", en: "Grandparents and ancestors", ar: "الأجداد والأصول", ur: "دادا دادی اور آباؤ اجداد" },
  "Paternal siblings and sibling descendants": { ta: "தந்தை வழி சகோதரர்கள்", en: "Paternal siblings and their children", ar: "الإخوة لأب وذريتهم", ur: "باپ کی طرف کے بہن بھائی اور ان کی اولاد" },
  "Father’s brother line": { ta: "தந்தை சகோதரர் (அம்) வரிசை", en: "Father’s brother line", ar: "الأعمام (عم) وأبناؤهم", ur: "چچا (عم) کی لائن" },
  "Distant relatives": { ta: "தூரத்து உறவினர்கள்", en: "Distant relatives", ar: "ذوو الأرحام", ur: "دور کے رشتہ دار" },
};

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
      ? { search: "Search a family member…", clear: "Clear all", none: "No match. Clear the search to see everyone.", spouseNone: "None", husband: "Husband", wife: "Wife", wivesLabel: "Wives", selected: "Selected relatives" }
      : language === "ar"
        ? { search: "ابحث عن قريب…", clear: "مسح الكل", none: "لا توجد نتيجة. امسح البحث لرؤية الجميع.", spouseNone: "لا أحد", husband: "الزوج", wife: "الزوجة", wivesLabel: "الزوجات", selected: "الأقارب المحددون" }
        : language === "ur"
          ? { search: "رشتہ دار تلاش کریں…", clear: "سب صاف کریں", none: "کوئی نتیجہ نہیں۔ سب دیکھنے کے لیے تلاش صاف کریں۔", spouseNone: "کوئی نہیں", husband: "شوہر", wife: "بیوی", wivesLabel: "بیویاں", selected: "منتخب رشتہ دار" }
          : { search: "உறவைத் தேடுக…", clear: "அனைத்தையும் அழி", none: "பொருத்தம் இல்லை. தேடலை அழிக்கவும்.", spouseNone: "யாருமில்லை", husband: "கணவன்", wife: "மனைவி", wivesLabel: "மனைவிகள்", selected: "தேர்ந்த உறவினர்கள்" };

  const rows = useMemo(() => {
    const primaryRows: { key: keyof HeirInput; icon: LucideIcon; label: string; max: number | undefined }[] = PRIMARY.map((item) => ({
      key: item.key,
      icon: heirIconForKey(item.key),
      label: language === "en" ? item.en : language === "ar" ? item.ar : language === "ur" ? item.ur : item.ta,
      max: item.max,
    }));
    const extendedRows = EXTENDED_HEIR_SECTIONS.flatMap((section) => section.items).map((item) => ({
      key: item.key as keyof HeirInput,
      icon: heirIconForEmoji(item.emoji),
      label: language === "en" ? item.labelEn : language === "ar" ? ARABIC_EXTENDED_COPY[item.key].label : language === "ur" ? URDU_EXTENDED_LABELS[item.key] : item.label,
      max: undefined as number | undefined,
    }));
    return [...primaryRows, ...extendedRows];
  }, [language]);

  const sections = useMemo(() => {
    const primaryKeys = new Set(PRIMARY.map((p) => p.key as string));
    const primary = rows.filter((r) => primaryKeys.has(r.key as string));
    const rest = EXTENDED_HEIR_SECTIONS.map((section) => ({
      title: SECTION_TITLES[section.titleEn]?.[language] ?? section.titleEn,
      rows: rows.filter((r) => section.items.some((it) => it.key === r.key)),
    })).filter((s) => s.rows.length > 0);
    return [{ title: null as string | null, rows: primary }, ...rest];
  }, [rows, language]);

  const normalizedQuery = query.trim().toLocaleLowerCase();
  const searching = normalizedQuery.length > 0;

  /** Live selection summary — purely reflects current selection state; eligibility is decided by the engine. */
  const selectedSummary = useMemo(() => {
    const items: { key: string; label: string; count: number }[] = [];
    if (heirs.husband > 0) items.push({ key: "husband", label: copy.husband, count: heirs.husband });
    if (heirs.wives > 0) items.push({ key: "wives", label: copy.wivesLabel, count: heirs.wives });
    for (const row of rows) {
      const count = heirs[row.key] ?? 0;
      if (count > 0) items.push({ key: row.key as string, label: row.label, count });
    }
    return items;
  }, [rows, heirs, copy]);

  const chooseSpouse = (choice: "none" | "husband" | "wives") => {
    onChange("husband", choice === "husband" ? 1 : 0);
    onChange("wives", choice === "wives" ? Math.max(1, heirs.wives || 1) : 0);
  };

  const visibleSections = searching
    ? [{ title: null as string | null, rows: rows.filter((row) => row.label.toLocaleLowerCase().includes(normalizedQuery)) }]
    : sections;

  return (
    <div className="space-y-5" dir={language === "ar" || language === "ur" ? "rtl" : "ltr"}>
      <div className="flex flex-col gap-2 sm:flex-row">
        <label className="pb-search block flex-1">
          <span className="sr-only">{copy.search}</span>
          <span className="pb-search-icon"><Search size={18} /></span>
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
          className="pb-btn pb-btn-outline min-h-11! py-2! text-sm"
        >
          <RotateCcw size={16} /> {copy.clear}
        </button>
      </div>

      {!searching ? (
        <div>
          <div className="pb-spouse-row">
            {([["none", copy.spouseNone], ["husband", copy.husband], ["wives", copy.wife]] as const).map(([value, label]) => {
              const active = (value === "none" && heirs.husband === 0 && heirs.wives === 0) || (value === "husband" && heirs.husband > 0) || (value === "wives" && heirs.wives > 0);
              return (
                <button key={value} type="button" onClick={() => chooseSpouse(value)} aria-pressed={active} className={`pb-spouse ${active ? "is-on" : ""}`}>
                  {label}
                </button>
              );
            })}
          </div>
          {heirs.wives > 0 ? (
            <div className="mt-3 grid" style={{ gridTemplateColumns: "minmax(0,11rem)" }}>
              <HeirRow icon={heirIconForKey("wives")} label={copy.wivesLabel} value={heirs.wives} onChange={(value) => onChange("wives", Math.max(1, Math.min(4, value)))} max={4} language={language} />
            </div>
          ) : null}
        </div>
      ) : null}

      {visibleSections.every((s) => s.rows.length === 0) ? (
        <p className="rounded-2xl border border-dashed border-[#d8e6f7] bg-white/70 px-4 py-6 text-center text-sm text-slate-500">{copy.none}</p>
      ) : (
        visibleSections.map((section, si) => section.rows.length > 0 ? (
          <section key={section.title ?? `primary-${si}`}>
            {section.title ? <h3 className="mb-2 text-[13px] font-extrabold uppercase tracking-wide text-[#1559a6]">{section.title}</h3> : null}
            <div className="pb-fam-grid">
              {section.rows.map((row) => (
                <HeirRow key={row.key} icon={row.icon} label={row.label} value={heirs[row.key] ?? 0} onChange={(value) => onChange(row.key, value)} max={row.max} language={language} />
              ))}
            </div>
          </section>
        ) : null)
      )}
      {selectedSummary.length > 0 ? (
        <div className="pb-fam-summary" aria-live="polite">
          <p className="pb-fam-summary-title">{copy.selected}</p>
          <ul className="pb-fam-summary-list">
            {selectedSummary.map((item) => (
              <li key={item.key}>
                <span>{item.label}</span>
                <span className="num">×{item.count}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
