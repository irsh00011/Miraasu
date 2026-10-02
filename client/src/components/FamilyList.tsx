/** Design: Miraasu Scholarly Ledger — compact chip grid for the close family; search + spouse selector on top. */
import { useMemo } from "react";
import { RotateCcw, Search } from "lucide-react";
import { HeirRow } from "@/components/HeirRow";
import { ARABIC_EXTENDED_COPY, EXTENDED_HEIR_SECTIONS, type AppLanguage, type HeirInput } from "@/lib/inheritance";

type PrimaryDef = { key: keyof HeirInput; emoji: string; ta: string; en: string; ar: string; max?: number };

const PRIMARY: PrimaryDef[] = [
  { key: "father", emoji: "👨", ta: "அப்பா", en: "Father", ar: "الأب", max: 1 },
  { key: "mother", emoji: "👩", ta: "அம்மா", en: "Mother", ar: "الأم", max: 1 },
  { key: "sons", emoji: "👦", ta: "மகன்கள்", en: "Sons", ar: "الأبناء" },
  { key: "daughters", emoji: "👧", ta: "மகள்கள்", en: "Daughters", ar: "البنات" },
  { key: "paternalGrandfather", emoji: "👴", ta: "தாத்தா (தந்தை வழி)", en: "Father’s father", ar: "جد الأب", max: 1 },
  { key: "fullBrothers", emoji: "👨‍🦱", ta: "உடன்பிறந்த சகோதரர்", en: "Full brothers", ar: "الإخوة الأشقاء" },
  { key: "fullSisters", emoji: "👩‍🦰", ta: "உடன்பிறந்த சகோதரி", en: "Full sisters", ar: "الأخوات الشقيقات" },
  { key: "maternalBrothers", emoji: "🧑", ta: "தாய் வழி சகோதரர்", en: "Maternal half-brothers", ar: "الإخوة لأم" },
  { key: "maternalSisters", emoji: "👩", ta: "தாய் வழி சகோதரி", en: "Maternal half-sisters", ar: "الأخوات لأم" },
];

type FamilyListProps = {
  heirs: HeirInput;
  onChange: (key: keyof HeirInput, value: number) => void;
  onResetAll: () => void;
  query: string;
  onQueryChange: (value: string) => void;
  onSearchEnter?: () => void;
  language?: AppLanguage;
};

export function FamilyList({ heirs, onChange, onResetAll, query, onQueryChange, onSearchEnter, language = "ta" }: FamilyListProps) {
  const copy =
    language === "en"
      ? { search: "Search a family member…", clear: "Clear all", none: "No match. Clear the search to see everyone.", spouseNone: "None", husband: "Husband", wife: "Wife", wivesLabel: "Wives" }
      : language === "ar"
        ? { search: "ابحث عن قريب…", clear: "مسح الكل", none: "لا توجد نتيجة. امسح البحث لرؤية الجميع.", spouseNone: "لا أحد", husband: "الزوج", wife: "الزوجة", wivesLabel: "الزوجات" }
        : { search: "உறவைத் தேடுக…", clear: "அனைத்தையும் அழி", none: "பொருத்தம் இல்லை. தேடலை அழிக்கவும்.", spouseNone: "யாருமில்லை", husband: "கணவன்", wife: "மனைவி", wivesLabel: "மனைவிகள்" };

  const rows = useMemo(() => {
    const primaryRows = PRIMARY.map((item) => ({
      key: item.key,
      emoji: item.emoji,
      label: language === "en" ? item.en : language === "ar" ? item.ar : item.ta,
      max: item.max,
    }));
    const extendedRows = EXTENDED_HEIR_SECTIONS.flatMap((section) => section.items).map((item) => ({
      key: item.key as keyof HeirInput,
      emoji: item.emoji,
      label: language === "en" ? item.labelEn : language === "ar" ? ARABIC_EXTENDED_COPY[item.key].label : item.label,
      max: undefined as number | undefined,
    }));
    return [...primaryRows, ...extendedRows];
  }, [language]);

  const normalizedQuery = query.trim().toLocaleLowerCase();
  const filteredRows = normalizedQuery ? rows.filter((row) => row.label.toLocaleLowerCase().includes(normalizedQuery)) : rows;

  const chooseSpouse = (choice: "none" | "husband" | "wives") => {
    onChange("husband", choice === "husband" ? 1 : 0);
    onChange("wives", choice === "wives" ? Math.max(1, heirs.wives || 1) : 0);
  };

  return (
    <div className="space-y-4" dir={language === "ar" ? "rtl" : "ltr"}>
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

      {!normalizedQuery ? (
        <div>
          <div className="ms-spouse-row">
            {([["none", copy.spouseNone], ["husband", copy.husband], ["wives", copy.wife]] as const).map(([value, label]) => {
              const active = (value === "none" && heirs.husband === 0 && heirs.wives === 0) || (value === "husband" && heirs.husband > 0) || (value === "wives" && heirs.wives > 0);
              return (
                <button key={value} type="button" onClick={() => chooseSpouse(value)} aria-pressed={active} className={`ms-spouse ${active ? "is-on" : ""}`}>
                  {label}
                </button>
              );
            })}
          </div>
          {heirs.wives > 0 ? (
            <div className="mt-2 ms-chips" style={{ gridTemplateColumns: "minmax(0,1fr)" }}>
              <HeirRow emoji="💑" label={copy.wivesLabel} value={heirs.wives} onChange={(value) => onChange("wives", Math.max(1, Math.min(4, value)))} max={4} language={language} />
            </div>
          ) : null}
        </div>
      ) : null}

      {filteredRows.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[rgba(22,79,134,0.3)] bg-white/70 px-4 py-6 text-center text-sm text-slate-500">{copy.none}</p>
      ) : (
        <div className="ms-chips">
          {filteredRows.map((row) => (
            <HeirRow key={row.key} emoji={row.emoji} label={row.label} value={heirs[row.key] ?? 0} onChange={(value) => onChange(row.key, value)} max={row.max} language={language} />
          ))}
        </div>
      )}
    </div>
  );
}
