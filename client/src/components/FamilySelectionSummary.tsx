/** Design: A calm, live selection ledger that lets a user verify or remove a chosen relationship without losing their place. */
import { BookOpenCheck, X } from "lucide-react";
import { getSelectedExtendedHeirs, type HeirInput } from "@/lib/inheritance";

type FamilySelectionSummaryProps = {
  heirs: HeirInput;
  onClear: (key: keyof HeirInput) => void;
  language?: "ta" | "en";
};

const coreFamily = [
  { key: "husband", emoji: "👨", label: "கணவன்", labelEn: "Husband" },
  { key: "wives", emoji: "💑", label: "மனைவி / மனைவிகள்", labelEn: "Wife / wives" },
  { key: "father", emoji: "👨", label: "அப்பா", labelEn: "Father" },
  { key: "mother", emoji: "👩", label: "அம்மா", labelEn: "Mother" },
  { key: "paternalGrandfather", emoji: "👴", label: "அப்பாவின் அப்பா", labelEn: "Father’s father" },
  { key: "sons", emoji: "👦", label: "மகன்கள்", labelEn: "Sons" },
  { key: "daughters", emoji: "👧", label: "மகள்கள்", labelEn: "Daughters" },
  { key: "fullBrothers", emoji: "👨‍🦱", label: "உடன்பிறந்த சகோதரர்கள்", labelEn: "Full brothers" },
  { key: "fullSisters", emoji: "👩‍🦰", label: "உடன்பிறந்த சகோதரிகள்", labelEn: "Full sisters" },
  { key: "maternalBrothers", emoji: "🧑", label: "தாய் வழி சகோதரர்கள்", labelEn: "Maternal half-brothers" },
  { key: "maternalSisters", emoji: "👩", label: "தாய் வழி சகோதரிகள்", labelEn: "Maternal half-sisters" },
] as const;

export function FamilySelectionSummary({ heirs, onClear, language = "ta" }: FamilySelectionSummaryProps) {
  const selectedCore = coreFamily
    .map((item) => ({ ...item, count: heirs[item.key], displayLabel: language === "en" ? item.labelEn : item.label }))
    .filter((item) => item.count > 0);
  const selectedExtended = getSelectedExtendedHeirs(heirs).map((item) => ({ ...item, displayLabel: language === "en" ? item.labelEn : item.label }));
  const selected = [...selectedCore, ...selectedExtended];

  return (
    <aside className="family-guide mt-5 rounded-2xl border border-blue-200 bg-white p-4 shadow-sm lg:sticky lg:top-6 lg:mt-0" aria-label={language === "en" ? "Selected family members" : "தேர்ந்தெடுத்த குடும்ப உறுப்பினர்கள்"}>
      <div className="flex items-start gap-2"><span className="grid size-8 shrink-0 place-items-center rounded-lg bg-blue-100 text-[#133D76]"><BookOpenCheck size={17} /></span><div><p className="font-extrabold text-[#133D76]">{language === "en" ? "Your selected family" : "நீங்கள் தேர்வு செய்தவர்கள்"}</p><p className="mt-0.5 text-xs leading-5 text-slate-500">{language === "en" ? "Use × beside a name to remove it." : "தவறு இருந்தால் அருகிலுள்ள × அழுத்தி அகற்றலாம்."}</p></div></div>
      {selected.length === 0 ? <p className="mt-4 rounded-xl bg-slate-50 px-3 py-3 text-sm leading-6 text-slate-500">{language === "en" ? "No family member has been selected yet." : "இன்னும் யாரும் தேர்வு செய்யப்படவில்லை."}</p> : <div className="mt-4 max-h-[52vh] space-y-2 overflow-y-auto pr-1">{selected.map((item) => <div key={item.key} className="flex items-center gap-2 rounded-xl bg-blue-50 px-2.5 py-2"><span aria-hidden="true">{item.emoji}</span><p className="min-w-0 flex-1 text-xs font-bold leading-5 text-slate-800">{item.displayLabel} <span className="text-[#133D76]">· {item.count}</span></p><button type="button" onClick={() => onClear(item.key)} className="grid size-8 place-items-center rounded-lg text-slate-400 hover:bg-white hover:text-rose-700" aria-label={language === "en" ? `Remove ${item.displayLabel}` : `${item.displayLabel} அகற்ற`}><X size={15} /></button></div>)}</div>}
      <div className="mt-4 border-t border-slate-100 pt-3"><p className="text-xs leading-5 text-slate-500"><strong className="text-slate-700">{language === "en" ? "Review note:" : "மறுஆய்வு குறிப்பு:"}</strong> {language === "en" ? "Only selected relationships are included. Confirm real distributions with qualified Islamic and legal guidance." : "தேர்வு செய்த உறவுகள் மட்டுமே கணக்கில் சேர்க்கப்படும். உண்மையான பங்கீட்டிற்கு அறிஞர் மற்றும் சட்ட வழிகாட்டலுடன் உறுதி செய்யுங்கள்."}</p></div>
    </aside>
  );
}
