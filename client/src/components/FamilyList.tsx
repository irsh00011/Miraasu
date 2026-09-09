/** Design: Ledger of Justice — every family member in one plain flat list, full names always visible, no category text. */
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
        <label className="relative block flex-1">
          <span className="sr-only">{copy.search}</span>
          <Search className={`pointer-events-none absolute inset-y-0 my-auto text-[#133D76] ${language === "ar" ? "right-4" : "left-4"}`} size={18} />
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                onSearchEnter?.();
              }
            }}
            placeholder={copy.search}
            className={`w-full rounded-2xl border border-blue-200 bg-blue-50/60 py-3 text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#133D76] focus:bg-white focus:ring-4 focus:ring-blue-100 ${
              language === "ar" ? "pr-11 pl-4" : "pl-11 pr-4"
            }`}
          />
        </label>
        <button
          type="button"
          onClick={onResetAll}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-[#133D76]"
        >
          <RotateCcw size={16} /> {copy.clear}
        </button>
      </div>

      {!normalizedQuery ? (
        <div>
          <div className="grid grid-cols-3 gap-2 rounded-2xl bg-slate-100 p-2">
            {([["none", copy.spouseNone], ["husband", copy.husband], ["wives", copy.wife]] as const).map(([value, label]) => {
              const active = (value === "none" && heirs.husband === 0 && heirs.wives === 0) || (value === "husband" && heirs.husband > 0) || (value === "wives" && heirs.wives > 0);
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => chooseSpouse(value)}
                  className={`min-h-11 rounded-xl px-2 text-sm font-bold ${active ? "bg-[#133D76] text-white shadow-sm" : "text-slate-600 hover:bg-white"}`}
                >
                  {label}
                </button>
              );
            })}
          </div>
          {heirs.wives > 0 ? (
            <div className="mt-2">
              <HeirRow emoji="💑" label={copy.wivesLabel} value={heirs.wives} onChange={(value) => onChange("wives", Math.max(1, Math.min(4, value)))} max={4} language={language} />
            </div>
          ) : null}
        </div>
      ) : null}

      {filteredRows.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">{copy.none}</p>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          {filteredRows.map((row) => (
            <HeirRow key={row.key} emoji={row.emoji} label={row.label} value={heirs[row.key] ?? 0} onChange={(value) => onChange(row.key, value)} max={row.max} language={language} />
          ))}
        </div>
      )}
    </div>
  );
}
