/** Design: Miraasu Scholarly Ledger — compact chip grid for the close family; search + spouse selector on top. */
import { useMemo, useState } from "react";
import { ChevronDown, RotateCcw, Search, type LucideIcon } from "lucide-react";
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
      ? { search: "Search a family member…", clear: "Clear all", none: "No match. Clear the search to see everyone.", spouseNone: "None", husband: "Husband", wife: "Wife", wivesLabel: "Wives", more: "More relatives" }
      : language === "ar"
        ? { search: "ابحث عن قريب…", clear: "مسح الكل", none: "لا توجد نتيجة. امسح البحث لرؤية الجميع.", spouseNone: "لا أحد", husband: "الزوج", wife: "الزوجة", wivesLabel: "الزوجات", more: "أقارب آخرون" }
        : language === "ur"
          ? { search: "رشتہ دار تلاش کریں…", clear: "سب صاف کریں", none: "کوئی نتیجہ نہیں۔ سب دیکھنے کے لیے تلاش صاف کریں۔", spouseNone: "کوئی نہیں", husband: "شوہر", wife: "بیوی", wivesLabel: "بیویاں", more: "مزید رشتہ دار" }
          : { search: "உறவைத் தேடுக…", clear: "அனைத்தையும் அழி", none: "பொருத்தம் இல்லை. தேடலை அழிக்கவும்.", spouseNone: "யாருமில்லை", husband: "கணவன்", wife: "மனைவி", wivesLabel: "மனைவிகள்", more: "மேலும் உறவுகள்" };

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
      label: language === "en" ? item.labelEn : language === "ar" ? ARABIC_EXTENDED_COPY[item.key].label : language === "ur" ? URDU_EXTENDED_LABELS[item.key] : (TA_LABEL_OVERRIDES[item.key] ?? item.label),
      max: undefined as number | undefined,
    }));
    return { primaryRows, extendedRows, all: [...primaryRows, ...extendedRows] };
  }, [language]);

  const normalizedQuery = query.trim().toLocaleLowerCase();
  const filteredRows = normalizedQuery ? rows.all.filter((row) => row.label.toLocaleLowerCase().includes(normalizedQuery)) : rows.all;
  // Progressive disclosure: close family first; the 24 extended relatives open on demand,
  // and stay open by themselves when any of them is already selected.
  const [moreOpen, setMoreOpen] = useState(false);
  const extendedSelected = rows.extendedRows.reduce((total, row) => total + (heirs[row.key] ?? 0), 0);
  const showExtended = moreOpen || extendedSelected > 0;

  const chooseSpouse = (choice: "none" | "husband" | "wives") => {
    onChange("husband", choice === "husband" ? 1 : 0);
    onChange("wives", choice === "wives" ? Math.max(1, heirs.wives || 1) : 0);
  };

  return (
    <div className="space-y-4" dir={language === "ar" || language === "ur" ? "rtl" : "ltr"}>
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
              <HeirRow icon={heirIconForKey("wives")} label={copy.wivesLabel} value={heirs.wives} onChange={(value) => onChange("wives", Math.max(1, Math.min(4, value)))} max={4} language={language} />
            </div>
          ) : null}
        </div>
      ) : null}

      {filteredRows.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[rgba(22,79,134,0.3)] bg-white/70 px-4 py-6 text-center text-sm text-slate-600">{copy.none}</p>
      ) : normalizedQuery ? (
        <div className="ms-chips">
          {filteredRows.map((row, index) => (
            <HeirRow key={row.key} index={index} icon={row.icon} label={row.label} value={heirs[row.key] ?? 0} onChange={(value) => onChange(row.key, value)} max={row.max} language={language} />
          ))}
        </div>
      ) : (
        <>
          <div className="ms-chips">
            {rows.primaryRows.map((row, index) => (
              <HeirRow key={row.key} index={index} icon={row.icon} label={row.label} value={heirs[row.key] ?? 0} onChange={(value) => onChange(row.key, value)} max={row.max} language={language} />
            ))}
          </div>
          <button type="button" className="ms-more" aria-expanded={showExtended} aria-controls="ms-more-relatives" onClick={() => setMoreOpen((open) => !open)}>
            <span>{copy.more}</span>
            {extendedSelected > 0 ? <span className="ms-more-count num">{extendedSelected}</span> : null}
            <ChevronDown size={18} className="ms-more-chev" aria-hidden="true" />
          </button>
          {showExtended ? (
            <div id="ms-more-relatives" className="ms-chips">
              {rows.extendedRows.map((row, index) => (
                <HeirRow key={row.key} index={index} icon={row.icon} label={row.label} value={heirs[row.key] ?? 0} onChange={(value) => onChange(row.key, value)} max={row.max} language={language} />
              ))}
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
