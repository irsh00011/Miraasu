/** Design: Full book-family coverage in short, labeled groups; every extended selection leads to a visible review state. */
/** Design: Ledger of Justice — a numbered family map and short, visibly classified relationship cards for first-time users. */
import { ARABIC_EXTENDED_COPY, ARABIC_SECTION_COPY, EXTENDED_HEIR_SECTIONS, VERIFIED_EXTENDED_KEYS, type AppLanguage, type ExtendedHeirKey, type HeirInput } from "@/lib/inheritance";
import { HeirCounter } from "@/components/HeirCounter";
import { RotateCcw } from "lucide-react";

type BookFamilySectionsProps = {
  heirs: HeirInput;
  onChange: (key: ExtendedHeirKey, value: number) => void;
  query: string;
  onReset: (keys: ExtendedHeirKey[]) => void;
  language?: AppLanguage;
};

export function BookFamilySections({ heirs, onChange, query, onReset, language = "ta" }: BookFamilySectionsProps) {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const familyMap = language === "en" ? [["1", "Spouse", "Choose husband or wife/wives"], ["2", "Children & parents", "Add close family first"], ["3", "Grandparents & siblings", "Add anyone alive"], ["4", "Book relatives", "Automatic rule or review is shown"]] : language === "ar" ? [["1", "الزوج أو الزوجة", "اختر الزوج أو الزوجة"], ["2", "الأبناء والوالدان", "أضف العائلة القريبة أولاً"], ["3", "الأجداد والإخوة", "أضف من هو حي"], ["4", "أقارب الكتاب", "ستظهر القاعدة أو المراجعة"]] : [["1", "துணைவர்", "கணவன் அல்லது மனைவியைத் தேர்வு செய்க"], ["2", "பிள்ளைகள் மற்றும் பெற்றோர்", "நெருங்கிய குடும்பத்தை முதலில் சேர்க்கவும்"], ["3", "தாத்தா, பாட்டி மற்றும் உடன்பிறந்தோர்", "உயிருடன் இருப்பவர்களைச் சேர்க்கவும்"], ["4", "புத்தக உறவுகள்", "விதி அல்லது உறுதிப்படுத்தல் காட்டப்படும்"]];
  const sections = EXTENDED_HEIR_SECTIONS
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => !normalizedQuery || `${section.title} ${section.helper} ${section.titleEn} ${section.helperEn} ${item.label} ${item.description} ${item.labelEn} ${item.descriptionEn} ${ARABIC_EXTENDED_COPY[item.key].label} ${ARABIC_EXTENDED_COPY[item.key].description}`.toLocaleLowerCase().includes(normalizedQuery)),
    }))
    .filter((section) => section.items.length > 0);

  if (sections.length === 0) {
    return <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">{language === "en" ? "No relationship matches this search." : language === "ar" ? "لا توجد قرابة مطابقة لهذا البحث." : "இந்தத் தேடலுக்கு பொருத்தமான உறவு இல்லை."}</p>;
  }

  return (
    <div className="space-y-7">
      <div className="grid gap-2 sm:grid-cols-2" aria-label={language === "en" ? "Simple family entry order" : language === "ar" ? "ترتيب إدخال العائلة السهل" : "எளிய குடும்ப பதிவு ஒழுங்கு"}>
        {familyMap.map(([number, title, helper]) => <div key={number} className="flex min-h-16 items-center gap-3 border border-blue-100 bg-blue-50/60 px-3 py-2"><span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#133D76] text-xs font-bold text-white">{number}</span><div><p className="text-sm font-extrabold text-[#133D76]">{title}</p><p className="mt-0.5 text-[11px] leading-4 text-slate-500">{helper}</p></div></div>)}
      </div>
      {sections.map((section) => {
        const automated = section.items.filter((item) => VERIFIED_EXTENDED_KEYS.has(item.key)).length;
        const reviewOnly = section.items.length - automated;
        const sectionArabic = ARABIC_SECTION_COPY[section.titleEn];
        const status = reviewOnly === 0 ? (language === "en" ? "Automatic rules" : language === "ar" ? "قواعد تلقائية" : "தானியங்கி விதிகள்") : automated === 0 ? (language === "en" ? "Scholar review" : language === "ar" ? "مراجعة مختص" : "அறிஞர் உறுதிப்படுத்தல்") : (language === "en" ? "Rules + review" : language === "ar" ? "قواعد + مراجعة" : "விதிகள் + உறுதிப்படுத்தல்");
        return (
        <section key={section.title} className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
            <div><div className="flex flex-wrap items-center gap-2"><p className="text-sm font-extrabold text-[#133D76]">{language === "en" ? section.titleEn : language === "ar" ? sectionArabic.title : section.title}</p><span className={`rounded-md px-2 py-1 text-[10px] font-extrabold ${reviewOnly === 0 ? "bg-emerald-50 text-emerald-700" : automated === 0 ? "bg-amber-50 text-amber-800" : "bg-blue-50 text-[#133D76]"}`}>{status}</span></div><p className="mt-1 text-xs leading-5 text-slate-500">{language === "en" ? section.helperEn : language === "ar" ? sectionArabic.helper : section.helper}</p></div>
            <button type="button" onClick={() => onReset(section.items.map((item) => item.key))} className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-xl px-2 text-xs font-bold text-slate-500 hover:bg-slate-100 hover:text-[#133D76]" aria-label={language === "en" ? `Clear ${section.titleEn}` : language === "ar" ? `مسح ${sectionArabic.title}` : `${section.title} உறவுகளை அழிக்க`}><RotateCcw size={15} /> {language === "en" ? "Clear" : language === "ar" ? "مسح" : "அழி"}</button>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {section.items.map((item) => (
              <HeirCounter
                key={item.key}
                emoji={item.emoji}
                label={language === "en" ? item.labelEn : language === "ar" ? ARABIC_EXTENDED_COPY[item.key].label : item.label}
                description={language === "en" ? item.descriptionEn : language === "ar" ? ARABIC_EXTENDED_COPY[item.key].description : item.description}
                value={heirs[item.key] ?? 0}
                onChange={(value) => onChange(item.key, value)}
                language={language}
              />
            ))}
          </div>
        </section>
        );
      })}
    </div>
  );
}
