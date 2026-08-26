/** Design: A calm, live selection ledger that lets a user verify or remove a chosen relationship without losing their place. */
import { BookOpenCheck, X } from "lucide-react";
import { getSelectedExtendedHeirs, type HeirInput } from "@/lib/inheritance";

type FamilySelectionSummaryProps = {
  heirs: HeirInput;
  onClear: (key: keyof HeirInput) => void;
};

const coreFamily = [
  { key: "husband", emoji: "👨", label: "கணவன்" },
  { key: "wives", emoji: "💑", label: "மனைவி / மனைவிகள்" },
  { key: "father", emoji: "👨", label: "அப்பா" },
  { key: "mother", emoji: "👩", label: "அம்மா" },
  { key: "paternalGrandfather", emoji: "👴", label: "அப்பாவின் அப்பா" },
  { key: "sons", emoji: "👦", label: "மகன்கள்" },
  { key: "daughters", emoji: "👧", label: "மகள்கள்" },
  { key: "fullBrothers", emoji: "👨‍🦱", label: "உடன்பிறந்த சகோதரர்கள்" },
  { key: "fullSisters", emoji: "👩‍🦰", label: "உடன்பிறந்த சகோதரிகள்" },
  { key: "maternalBrothers", emoji: "🧑", label: "தாய் வழி சகோதரர்கள்" },
  { key: "maternalSisters", emoji: "👩", label: "தாய் வழி சகோதரிகள்" },
] as const;

export function FamilySelectionSummary({ heirs, onClear }: FamilySelectionSummaryProps) {
  const selectedCore = coreFamily
    .map((item) => ({ ...item, count: heirs[item.key] }))
    .filter((item) => item.count > 0);
  const selected = [...selectedCore, ...getSelectedExtendedHeirs(heirs)];

  return (
    <aside className="family-guide mt-5 rounded-2xl border border-blue-200 bg-white p-4 shadow-sm lg:sticky lg:top-6 lg:mt-0" aria-label="தேர்ந்தெடுத்த குடும்ப உறுப்பினர்கள்">
      <div className="flex items-start gap-2"><span className="grid size-8 shrink-0 place-items-center rounded-lg bg-blue-100 text-[#133D76]"><BookOpenCheck size={17} /></span><div><p className="font-extrabold text-[#133D76]">நீங்கள் தேர்வு செய்தவர்கள்</p><p className="mt-0.5 text-xs leading-5 text-slate-500">தவறு இருந்தால் அருகிலுள்ள × அழுத்தி அகற்றலாம்.</p></div></div>
      {selected.length === 0 ? <p className="mt-4 rounded-xl bg-slate-50 px-3 py-3 text-sm leading-6 text-slate-500">இன்னும் யாரும் தேர்வு செய்யப்படவில்லை.</p> : <div className="mt-4 max-h-[52vh] space-y-2 overflow-y-auto pr-1">{selected.map((item) => <div key={item.key} className="flex items-center gap-2 rounded-xl bg-blue-50 px-2.5 py-2"><span aria-hidden="true">{item.emoji}</span><p className="min-w-0 flex-1 text-xs font-bold leading-5 text-slate-800">{item.label} <span className="text-[#133D76]">· {item.count}</span></p><button type="button" onClick={() => onClear(item.key)} className="grid size-8 place-items-center rounded-lg text-slate-400 hover:bg-white hover:text-rose-700" aria-label={`${item.label} அகற்ற`}><X size={15} /></button></div>)}</div>}
      <div className="mt-4 border-t border-slate-100 pt-3"><p className="text-xs leading-5 text-slate-500"><strong className="text-slate-700">குறிப்பு:</strong> தேர்வு செய்த உறவுகள் இருந்தால்தான் கணக்கில் சேர்க்கப்படும்.</p></div>
    </aside>
  );
}
