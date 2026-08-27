/** Design: A calm, live selection ledger that lets a user verify or remove a chosen relationship without losing their place. */
/** Design: Ledger of Justice — compact audit sidebar grouping every selected relationship with a direct removal control. */
import { BookOpenCheck, X } from "lucide-react";
import { ARABIC_EXTENDED_COPY, getSelectedExtendedHeirs, type AppLanguage, type HeirInput } from "@/lib/inheritance";

type FamilySelectionSummaryProps = {
  heirs: HeirInput;
  onClear: (key: keyof HeirInput) => void;
  language?: AppLanguage;
};

const coreFamily = [
  { key: "husband", emoji: "👨", label: "கணவன்", labelEn: "Husband", labelAr: "الزوج" },
  { key: "wives", emoji: "💑", label: "மனைவி / மனைவிகள்", labelEn: "Wife / wives", labelAr: "الزوجة / الزوجات" },
  { key: "father", emoji: "👨", label: "அப்பா", labelEn: "Father", labelAr: "الأب" },
  { key: "mother", emoji: "👩", label: "அம்மா", labelEn: "Mother", labelAr: "الأم" },
  { key: "paternalGrandfather", emoji: "👴", label: "அப்பாவின் அப்பா", labelEn: "Father’s father", labelAr: "جد الأب" },
  { key: "sons", emoji: "👦", label: "மகன்கள்", labelEn: "Sons", labelAr: "الأبناء" },
  { key: "daughters", emoji: "👧", label: "மகள்கள்", labelEn: "Daughters", labelAr: "البنات" },
  { key: "fullBrothers", emoji: "👨‍🦱", label: "உடன்பிறந்த சகோதரர்கள்", labelEn: "Full brothers", labelAr: "الإخوة الأشقاء" },
  { key: "fullSisters", emoji: "👩‍🦰", label: "உடன்பிறந்த சகோதரிகள்", labelEn: "Full sisters", labelAr: "الأخوات الشقيقات" },
  { key: "maternalBrothers", emoji: "🧑", label: "தாய் வழி சகோதரர்கள்", labelEn: "Maternal half-brothers", labelAr: "الإخوة لأم" },
  { key: "maternalSisters", emoji: "👩", label: "தாய் வழி சகோதரிகள்", labelEn: "Maternal half-sisters", labelAr: "الأخوات لأم" },
] as const;

export function FamilySelectionSummary({ heirs, onClear, language = "ta" }: FamilySelectionSummaryProps) {
  const copy = language === "en" ? { title: "Your selected family", remove: "Use × beside a name to remove it.", empty: "No family member has been selected yet.", close: "Close family", other: "Other book relatives", review: "Review note:", note: "Only selected relationships are included. Confirm real distributions with qualified Islamic and legal guidance.", removeVerb: "Remove", aria: "Selected family members" } : language === "ar" ? { title: "العائلة المختارة", remove: "استخدم × بجانب الاسم لحذفه.", empty: "لم تتم إضافة أي فرد من العائلة بعد.", close: "العائلة القريبة", other: "أقارب آخرون في الكتاب", review: "ملاحظة مراجعة:", note: "تُدرج العلاقات المختارة فقط. أكّد القسمة الفعلية مع مختص مؤهل في المواريث الإسلامية والقانون.", removeVerb: "حذف", aria: "أفراد العائلة المختارون" } : { title: "நீங்கள் தேர்வு செய்தவர்கள்", remove: "தவறு இருந்தால் அருகிலுள்ள × அழுத்தி அகற்றலாம்.", empty: "இன்னும் யாரும் தேர்வு செய்யப்படவில்லை.", close: "நெருங்கிய குடும்பம்", other: "புத்தகத்தில் உள்ள மற்ற உறவுகள்", review: "மறுஆய்வு குறிப்பு:", note: "தேர்வு செய்த உறவுகள் மட்டுமே கணக்கில் சேர்க்கப்படும். உண்மையான பங்கீட்டிற்கு அறிஞர் மற்றும் சட்ட வழிகாட்டலுடன் உறுதி செய்யுங்கள்.", removeVerb: "அகற்ற", aria: "தேர்ந்தெடுத்த குடும்ப உறுப்பினர்கள்" };
  const selectedCore = coreFamily
    .map((item) => ({ ...item, count: heirs[item.key], displayLabel: language === "en" ? item.labelEn : language === "ar" ? item.labelAr : item.label }))
    .filter((item) => item.count > 0);
  const selectedExtended = getSelectedExtendedHeirs(heirs).map((item) => ({ ...item, displayLabel: language === "en" ? item.labelEn : language === "ar" ? ARABIC_EXTENDED_COPY[item.key].label : item.label }));
  const selected = [...selectedCore, ...selectedExtended];

  return (
    <aside className="family-guide mt-5 rounded-2xl border border-blue-200 bg-white p-4 shadow-sm lg:sticky lg:top-6 lg:mt-0" aria-label={copy.aria}>
      <div className="flex items-start gap-2"><span className="grid size-8 shrink-0 place-items-center rounded-lg bg-blue-100 text-[#133D76]"><BookOpenCheck size={17} /></span><div><p className="font-extrabold text-[#133D76]">{copy.title}</p><p className="mt-0.5 text-xs leading-5 text-slate-500">{copy.remove}</p></div></div>
      {selected.length === 0 ? <p className="mt-4 rounded-xl bg-slate-50 px-3 py-3 text-sm leading-6 text-slate-500">{copy.empty}</p> : <div className="mt-4 max-h-[52vh] space-y-4 overflow-y-auto pr-1">{selectedCore.length > 0 ? <section><p className="mb-2 text-[11px] font-extrabold uppercase tracking-wide text-slate-400">{copy.close}</p><div className="space-y-2">{selectedCore.map((item) => <div key={item.key} className="flex items-center gap-2 rounded-xl bg-blue-50 px-2.5 py-2"><span aria-hidden="true">{item.emoji}</span><p className="min-w-0 flex-1 text-xs font-bold leading-5 text-slate-800">{item.displayLabel} <span className="text-[#133D76]">· {item.count}</span></p><button type="button" onClick={() => onClear(item.key)} className="grid size-8 place-items-center rounded-lg text-slate-400 hover:bg-white hover:text-rose-700" aria-label={`${copy.removeVerb} ${item.displayLabel}`}><X size={15} /></button></div>)}</div></section> : null}{selectedExtended.length > 0 ? <section><p className="mb-2 text-[11px] font-extrabold uppercase tracking-wide text-slate-400">{copy.other}</p><div className="space-y-2">{selectedExtended.map((item) => <div key={item.key} className="flex items-center gap-2 rounded-xl bg-blue-50 px-2.5 py-2"><span aria-hidden="true">{item.emoji}</span><p className="min-w-0 flex-1 text-xs font-bold leading-5 text-slate-800">{item.displayLabel} <span className="text-[#133D76]">· {item.count}</span></p><button type="button" onClick={() => onClear(item.key)} className="grid size-8 place-items-center rounded-lg text-slate-400 hover:bg-white hover:text-rose-700" aria-label={`${copy.removeVerb} ${item.displayLabel}`}><X size={15} /></button></div>)}</div></section> : null}</div>}
      <div className="mt-4 border-t border-slate-100 pt-3"><p className="text-xs leading-5 text-slate-500"><strong className="text-slate-700">{copy.review}</strong> {copy.note}</p></div>
    </aside>
  );
}
