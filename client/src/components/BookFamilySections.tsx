/** Design: Full book-family coverage in short, labeled groups; every extended selection leads to a visible review state. */
/** Design: Ledger of Justice — a numbered family map and short, visibly classified relationship cards for first-time users. */
import { useEffect, useState } from "react";
import { ARABIC_EXTENDED_COPY, ARABIC_SECTION_COPY, EXTENDED_HEIR_SECTIONS, VERIFIED_EXTENDED_KEYS, type AppLanguage, type ExtendedHeirKey, type HeirInput } from "@/lib/inheritance";
import { AsabaGuide } from "@/components/AsabaGuide";
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
  const [activeSection, setActiveSection] = useState<string>("all");
  useEffect(() => {
    // A cleared search must always restore the complete book-family list, not leave a previous category hiding it.
    if (!normalizedQuery) setActiveSection("all");
  }, [normalizedQuery]);
  const familyMap = language === "en" ? [["1", "Spouse", "Choose husband or wife/wives"], ["2", "Children & parents", "Add close family first"], ["3", "Grandparents & siblings", "Add anyone alive"], ["4", "Book relatives", "Automatic rule or review is shown"]] : language === "ar" ? [["1", "الزوج أو الزوجة", "اختر الزوج أو الزوجة"], ["2", "الأبناء والوالدان", "أضف العائلة القريبة أولاً"], ["3", "الأجداد والإخوة", "أضف من هو حي"], ["4", "أقارب الكتاب", "ستظهر القاعدة أو المراجعة"]] : [["1", "துணைவர்", "கணவன் அல்லது மனைவியைத் தேர்வு செய்க"], ["2", "பிள்ளைகள் மற்றும் பெற்றோர்", "நெருங்கிய குடும்பத்தை முதலில் சேர்க்கவும்"], ["3", "தாத்தா, பாட்டி மற்றும் உடன்பிறந்தோர்", "உயிருடன் இருப்பவர்களைச் சேர்க்கவும்"], ["4", "புத்தக உறவுகள்", "விதி அல்லது உறுதிப்படுத்தல் காட்டப்படும்"]];
  const sections = EXTENDED_HEIR_SECTIONS
    .map((section) => ({
      ...section,
      allKeys: section.items.map((item) => item.key),
      items: section.items.filter((item) => !normalizedQuery || `${section.title} ${section.helper} ${section.titleEn} ${section.helperEn} ${item.label} ${item.description} ${item.labelEn} ${item.descriptionEn} ${ARABIC_EXTENDED_COPY[item.key].label} ${ARABIC_EXTENDED_COPY[item.key].description}`.toLocaleLowerCase().includes(normalizedQuery)),
    }))
    .filter((section) => section.items.length > 0 && (normalizedQuery.length > 0 || activeSection === "all" || section.titleEn === activeSection));
  const clearSearch = () => {
    const input = Array.from(document.querySelectorAll("input")).find((candidate) => {
      const placeholder = candidate.placeholder;
      return placeholder.includes("தேடுக") || placeholder.includes("Search:") || placeholder.includes("ابحث:");
    });
    if (!input) return;
    const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
    setValue?.call(input, "");
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.focus();
    setActiveSection("all");
  };

  return (
    <div className="space-y-7">
      <div className="grid gap-2" aria-label={language === "en" ? "Simple family entry order" : language === "ar" ? "ترتيب إدخال العائلة السهل" : "எளிய குடும்ப பதிவு ஒழுங்கு"}>
        {familyMap.map(([number, title, helper]) => <div key={number} className="flex min-h-16 items-center gap-3 border border-blue-100 bg-blue-50/60 px-3 py-2"><span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#133D76] text-xs font-bold text-white">{number}</span><div><p className="text-sm font-extrabold text-[#133D76]">{title}</p><p className="mt-0.5 text-[11px] leading-4 text-slate-500">{helper}</p></div></div>)}
      </div>
      <div className="rounded-2xl border border-blue-100 bg-blue-50/70 px-4 py-3" aria-label={language === "en" ? "Why the earlier result could differ" : language === "ar" ? "لماذا قد تختلف النتيجة السابقة؟" : "முந்தைய முடிவு ஏன் மாறியிருக்கலாம்?"}>
        <p className="text-sm font-extrabold text-[#133D76]">{language === "en" ? "Why an earlier result could differ" : language === "ar" ? "لماذا قد تختلف النتيجة السابقة؟" : "முந்தைய முடிவு ஏன் மாறியிருக்கலாம்?"}</p>
        <p className="mt-1.5 text-xs leading-5 text-slate-600">{language === "en" ? "A later family degree must not be used before a nearer eligible residuary. The corrected order now gives fixed shares first, then sends the remainder to the nearest eligible class; a clear source rule is required before anything is calculated automatically." : language === "ar" ? "لا تُستخدم درجة عائلية متأخرة قبل العصبة الأقرب المستحقة. الترتيب المصحح يعطي أصحاب الفروض أولاً ثم يوزع الباقي على أقرب فئة مستحقة، وتحتاج الحالات غير الواضحة إلى مراجعة مختص." : "அருகிலுள்ள தகுதியான அஸபா வாரிசுக்கு முன் தூரமான வரிசையைப் பயன்படுத்தக் கூடாது. இப்போது நிர்ணயிக்கப்பட்ட பங்குகள் முதலில் வழங்கப்பட்டு, மீதி அருகிலுள்ள தகுதியான வரிசைக்கு செல்கிறது; தெளிவான விதி இல்லையெனில் அறிஞர் உறுதிப்படுத்தல் தேவை."}</p>
      </div>
      <AsabaGuide language={language} />
      <p className="border-s-2 border-[#B8892D] bg-amber-50/60 px-3 py-2 text-xs leading-5 text-slate-600">{language === "en" ? "Each selected relationship is checked against its stated condition. The result will say whether this exact case is calculated automatically or needs a qualified review." : language === "ar" ? "تُفحص كل قرابة مختارة بحسب شرطها المذكور. توضح النتيجة هل تُحسب هذه الحالة تلقائياً أم تحتاج إلى مراجعة مختص." : "தேர்வு செய்யும் ஒவ்வொரு உறவும் அதன் விதிப்படி சரிபார்க்கப்படும். இந்த அமைப்பு தானாகக் கணக்கிடப்படுமா அல்லது அறிஞர் உறுதிப்படுத்தல் வேண்டுமா என்பதை முடிவு தெளிவாகக் காட்டும்."}</p>
      <div className="border-y border-slate-100 py-3"><div className="flex flex-wrap items-center justify-between gap-2"><p className="text-xs font-bold text-slate-500">{language === "en" ? "Choose a book-family group" : language === "ar" ? "اختر مجموعة من أقارب الكتاب" : "புத்தக உறவுக் குழுவைத் தேர்வு செய்க"}</p>{normalizedQuery ? <button type="button" onClick={clearSearch} className="min-h-9 rounded-lg border border-blue-100 bg-white px-2.5 text-xs font-extrabold text-[#133D76] hover:bg-blue-50">{language === "en" ? "Clear search" : language === "ar" ? "مسح البحث" : "தேடலை அழி"}</button> : null}</div><div className="mt-2 flex flex-wrap gap-2"><button type="button" onClick={() => setActiveSection("all")} className={`min-h-10 rounded-xl border px-3 text-xs font-bold ${activeSection === "all" ? "border-[#133D76] bg-[#133D76] text-white" : "border-blue-100 bg-white text-[#133D76] hover:bg-blue-50"}`}>{language === "en" ? "All groups" : language === "ar" ? "كل المجموعات" : "அனைத்துக் குழுக்கள்"}</button>{EXTENDED_HEIR_SECTIONS.map((section) => { const title = language === "en" ? section.titleEn : language === "ar" ? ARABIC_SECTION_COPY[section.titleEn].title : section.title; const active = activeSection === section.titleEn; return <button key={section.titleEn} type="button" onClick={() => setActiveSection(section.titleEn)} className={`min-h-10 rounded-xl border px-3 text-xs font-bold ${active ? "border-[#133D76] bg-[#133D76] text-white" : "border-blue-100 bg-white text-[#133D76] hover:bg-blue-50"}`}>{title}</button>; })}</div></div>
      {sections.length === 0 ? <p role="status" className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">{language === "en" ? "No book-family relationship matches this search. Clear the search to see every group again." : language === "ar" ? "لا توجد قرابة من أقارب الكتاب مطابقة للبحث. امسح البحث لرؤية كل المجموعات مرة أخرى." : "புத்தக உறவுகளில் இந்தத் தேடலுக்கு பொருத்தம் இல்லை. தேடலை அழித்தால் எல்லாக் குழுக்களும் மீண்டும் தெரியும்."}</p> : sections.map((section) => {
        const automated = section.items.filter((item) => VERIFIED_EXTENDED_KEYS.has(item.key)).length;
        const reviewOnly = section.items.length - automated;
        const sectionArabic = ARABIC_SECTION_COPY[section.titleEn];
        const status = reviewOnly === 0 ? (language === "en" ? "Automatic rules" : language === "ar" ? "قواعد تلقائية" : "தானியங்கி விதிகள்") : automated === 0 ? (language === "en" ? "Scholar review" : language === "ar" ? "مراجعة مختص" : "அறிஞர் உறுதிப்படுத்தல்") : (language === "en" ? "Rules + review" : language === "ar" ? "قواعد + مراجعة" : "விதிகள் + உறுதிப்படுத்தல்");
        return (
        <section key={section.title} className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
            <div><div className="flex flex-wrap items-center gap-2"><p className="text-sm font-extrabold text-[#133D76]">{language === "en" ? section.titleEn : language === "ar" ? sectionArabic.title : section.title}</p><span className={`rounded-md px-2 py-1 text-[10px] font-extrabold ${reviewOnly === 0 ? "bg-emerald-50 text-emerald-700" : automated === 0 ? "bg-amber-50 text-amber-800" : "bg-blue-50 text-[#133D76]"}`}>{status}</span></div><p className="mt-1 text-xs leading-5 text-slate-500">{language === "en" ? section.helperEn : language === "ar" ? sectionArabic.helper : section.helper}</p></div>
            <button type="button" onClick={() => onReset(section.allKeys)} className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-xl px-2 text-xs font-bold text-slate-500 hover:bg-slate-100 hover:text-[#133D76]" aria-label={language === "en" ? `Clear ${section.titleEn}` : language === "ar" ? `مسح ${sectionArabic.title}` : `${section.title} உறவுகளை அழிக்க`}><RotateCcw size={15} /> {language === "en" ? "Clear" : language === "ar" ? "مسح" : "அழி"}</button>
          </div>
          <div className="mt-3 grid gap-3">
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
