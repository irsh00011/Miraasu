/**
 * Design: A very short Tamil-first journey—welcome, calculate, history.
 * The interface uses one focus area per step, calm legal blue, and large touch controls.
 */
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Calculator,
  Check,
  ChevronDown,
  Clock3,
  FileText,
  History,
  Plus,
  Printer,
  RotateCcw,
  Trash2,
  UsersRound,
  WalletCards,
} from "lucide-react";
import { HeirCounter } from "@/components/HeirCounter";
import { BookFamilySections } from "@/components/BookFamilySections";
import {
  calculateInheritance,
  fractionToNumber,
  fractionToText,
  type ExtendedHeirKey,
  type EstateInput,
  type HeirInput,
} from "@/lib/inheritance";
import {
  readCalculationHistory,
  writeCalculationHistory,
  type SavedCalculation,
} from "@/lib/localHistory";

type Step = 1 | 2 | 3;
type View = "welcome" | "calculator" | "history";
type DisplayMode = "fraction" | "percent";

const initialEstate: EstateInput = { grossEstate: 0, funeralCosts: 0, debts: 0, bequest: 0 };
const initialHeirs: HeirInput = {
  husband: 0,
  wives: 0,
  father: 0,
  mother: 0,
  paternalGrandfather: 0,
  sons: 0,
  daughters: 0,
  fullBrothers: 0,
  fullSisters: 0,
  maternalBrothers: 0,
  maternalSisters: 0,
  sonsSons: 0,
  sonsDaughters: 0,
  furtherSonsLineDescendants: 0,
  maternalGrandfather: 0,
  paternalGrandmothers: 0,
  maternalGrandmothers: 0,
  furtherPaternalAncestors: 0,
  paternalBrothers: 0,
  paternalSisters: 0,
  fullBrothersSons: 0,
  paternalBrothersSons: 0,
  paternalUncles: 0,
  paternalUnclesSons: 0,
  daughtersChildren: 0,
  sonsDaughtersChildren: 0,
  fullBrothersDaughters: 0,
  fullSistersChildren: 0,
  maternalBrothersChildren: 0,
  fathersMaternalBrothers: 0,
  fathersMaternalBrothersDescendants: 0,
  mothersSiblings: 0,
  mothersSiblingsDescendants: 0,
};

const stepLabels = ["தொகை", "உறவுகள்", "முடிவு"];
const money = (value: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(Number.isFinite(value) ? value : 0);
const percentage = (value: number) => `${(value * 100).toLocaleString("en-IN", { maximumFractionDigits: 2 })}%`;
const heirCount = (heirs: HeirInput) => Object.values(heirs).reduce((total, item) => total + item, 0);
const formatDate = (value: string) => new Intl.DateTimeFormat("ta-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(value));

function BrandMark() {
  return (
    <div className="grid size-10 shrink-0 place-items-center rounded-2xl bg-[#133D76] text-white shadow-lg shadow-blue-200">
      <svg viewBox="0 0 48 48" aria-hidden="true" className="size-6 fill-none" stroke="currentColor" strokeWidth="2.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 14c5-3 10-2.8 18 2v20c-8-4.8-13-5-18-2V14Z" />
        <path d="M42 14c-5-3-10-2.8-18 2v20c8-4.8 13-5 18-2V14Z" />
        <path d="M13 10c2-2 4.7-3 7.6-3M35 10c-2-2-4.7-3-7.6-3" stroke="#B9D5FF" />
      </svg>
    </div>
  );
}

function StepProgress({ step, onBack }: { step: Step; onBack: (target: Step) => void }) {
  return (
    <div className="flex items-center gap-2" aria-label={`படி ${step} / 3`}>
      {stepLabels.map((label, index) => {
        const id = (index + 1) as Step;
        const isCurrent = id === step;
        const complete = id < step;
        return (
          <button
            key={label}
            type="button"
            onClick={() => complete && onBack(id)}
            disabled={!complete}
            className={`flex min-h-9 items-center gap-2 rounded-full px-3 text-xs font-bold transition ${isCurrent ? "bg-[#133D76] text-white" : complete ? "bg-blue-100 text-[#133D76] hover:bg-blue-200" : "bg-slate-100 text-slate-400"}`}
          >
            <span className="grid size-5 place-items-center rounded-full bg-white/20 text-[11px]">{complete ? <Check size={12} /> : id}</span>
            <span className="hidden sm:inline">{label}</span>
          </button>
        );
      })}
    </div>
  );
}

function FamilyGuide() {
  const groups = [
    { title: "முதன்மை குடும்பம்", items: [{ emoji: "💑", label: "கணவன் / மனைவி", detail: "இறந்தவரின் துணைவர்" }, { emoji: "👨‍👩‍👧‍👦", label: "அப்பா, அம்மா, பிள்ளைகள்", detail: "முதலில் இவர்களைச் சேர்க்கவும்" }] },
    { title: "மற்ற குடும்பம்", items: [{ emoji: "👴", label: "அப்பாவின் அப்பா", detail: "அப்பா இல்லை என்றால் மட்டும்" }, { emoji: "🧑‍🤝‍🧑", label: "சகோதரர் / சகோதரி", detail: "மேலே உள்ள உறவுகளைச் சேர்த்த பிறகு பார்க்கவும்" }, { emoji: "📚", label: "புத்தகத்தில் உள்ள அனைத்து உறவுகள்", detail: "கீழே ஒவ்வொரு குழுவாகவும் சேர்க்கப்பட்டுள்ளன" }] },
  ];

  return (
    <aside className="family-guide mt-5 rounded-2xl border border-blue-200 bg-white p-4 shadow-sm lg:sticky lg:top-6 lg:mt-0" aria-label="யாரைச் சேர்க்க வேண்டும் என்ற உதவி">
      <div className="flex items-start gap-2"><span className="grid size-7 shrink-0 place-items-center rounded-lg bg-blue-100 text-sm" aria-hidden="true">💡</span><div><p className="font-extrabold text-[#133D76]">யாரைச் சேர்க்க வேண்டும்?</p><p className="mt-0.5 text-xs leading-5 text-slate-500">இறந்தவருக்கு உயிருடன் இருப்பவர்களை மட்டும் தேர்வு செய்யுங்கள்.</p></div></div>
      <div className="mt-3 space-y-3">{groups.map((group) => <div key={group.title}><p className="mb-1 text-[11px] font-extrabold text-slate-400">{group.title}</p>{group.items.map((item) => <div key={item.label} className="flex gap-2 py-1 text-xs"><span className="grid size-7 shrink-0 place-items-center rounded-lg bg-slate-50" aria-hidden="true">{item.emoji}</span><p className="leading-5 text-slate-600"><strong className="text-slate-800">{item.label}</strong> · {item.detail}</p></div>)}</div>)}</div>
    </aside>
  );
}

export default function Home() {
  const [view, setView] = useState<View>("welcome");
  const [step, setStep] = useState<Step>(1);
  const [estate, setEstate] = useState<EstateInput>(initialEstate);
  const [heirs, setHeirs] = useState<HeirInput>(initialHeirs);
  const [history, setHistory] = useState<SavedCalculation[]>([]);
  const [showOptionalEstate, setShowOptionalEstate] = useState(false);
  const [displayMode, setDisplayMode] = useState<DisplayMode>("fraction");
  const [justSaved, setJustSaved] = useState(false);

  const result = useMemo(() => calculateInheritance(estate, heirs), [estate, heirs]);
  const historyFingerprint = useMemo(() => JSON.stringify({ estate, heirs }), [estate, heirs]);
  const allocatedAmount = result.allocations.reduce((total, item) => total + result.netEstate * fractionToNumber(item.share), 0);
  const heldAmount = result.netEstate * fractionToNumber(result.unallocatedShare);

  useEffect(() => {
    setHistory(readCalculationHistory());
  }, []);

  const updateEstate = (key: keyof EstateInput, value: number) => setEstate((current) => ({ ...current, [key]: Math.max(0, value) }));
  const updateHeir = (key: keyof HeirInput, value: number) => setHeirs((current) => ({ ...current, [key]: value }));
  const updateExtendedHeir = (key: ExtendedHeirKey, value: number) => setHeirs((current) => ({ ...current, [key]: Math.max(0, value) }));
  const chooseSpouse = (choice: "none" | "husband" | "wives") => setHeirs((current) => ({ ...current, husband: choice === "husband" ? 1 : 0, wives: choice === "wives" ? Math.max(1, current.wives) : 0 }));

  const saveCalculation = () => {
    if (result.netEstate <= 0 || result.allocations.length === 0) return;
    const record: SavedCalculation = {
      id: crypto.randomUUID(),
      fingerprint: historyFingerprint,
      createdAt: new Date().toISOString(),
      estate,
      heirs,
      netEstate: result.netEstate,
      totalHeirs: heirCount(heirs),
    };
    setHistory((current) => {
      const next = [record, ...current.filter((item) => item.fingerprint !== record.fingerprint)].slice(0, 12);
      writeCalculationHistory(next);
      return next;
    });
    setJustSaved(true);
  };

  const openCalculator = () => {
    setJustSaved(false);
    setView("calculator");
    setStep(1);
  };

  const finishCalculation = () => {
    setJustSaved(false);
    setStep(3);
    saveCalculation();
  };

  const startNewCalculation = () => {
    setEstate(initialEstate);
    setHeirs(initialHeirs);
    setShowOptionalEstate(false);
    setDisplayMode("fraction");
    openCalculator();
  };

  const reopenCalculation = (record: SavedCalculation) => {
    setEstate(record.estate);
    setHeirs(record.heirs);
    setJustSaved(false);
    setView("calculator");
    setStep(3);
  };

  const deleteHistoryItem = (id: string) => {
    setHistory((current) => {
      const next = current.filter((item) => item.id !== id);
      writeCalculationHistory(next);
      return next;
    });
  };

  const clearHistory = () => {
    if (!window.confirm("சேமித்த கணக்குகள் அனைத்தையும் அழிக்கவா?")) return;
    setHistory([]);
    writeCalculationHistory([]);
  };

  const moneyInput = (key: keyof EstateInput, label: string, help?: string) => (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-800">{label}</span>
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 font-bold text-[#133D76]">₹</span>
        <input
          type="number"
          inputMode="decimal"
          min="0"
          value={estate[key] || ""}
          onChange={(event) => updateEstate(key, Number(event.target.value))}
          className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-9 pr-4 text-lg font-bold tabular-nums text-slate-950 outline-none transition focus:border-[#133D76] focus:ring-4 focus:ring-blue-100"
          placeholder="0"
        />
      </div>
      {help ? <span className="mt-1.5 block text-xs leading-5 text-slate-500">{help}</span> : null}
    </label>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-blue-100 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
          <button type="button" onClick={() => setView("welcome")} className="flex min-w-0 items-center gap-2.5 text-left" aria-label="முகப்பு">
            <BrandMark />
            <div className="min-w-0">
              <p className="truncate text-base font-extrabold tracking-tight text-slate-950">மீராஸ் கணக்கீடு</p>
              <p className="truncate text-[11px] text-slate-500">எளிய வாரிசுரிமை வழிகாட்டி</p>
            </div>
          </button>
          {view !== "history" ? (
            <button type="button" onClick={() => setView("history")} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 text-sm font-bold text-[#133D76] transition hover:bg-blue-100">
              <History size={17} /> <span className="hidden sm:inline">வரலாறு</span>
            </button>
          ) : (
            <button type="button" onClick={() => setView("welcome")} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 text-sm font-bold text-[#133D76] transition hover:bg-blue-100"><ArrowLeft size={17} /> முகப்பு</button>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-7 sm:px-6 sm:py-10">
        {view === "welcome" ? (
          <section className="page-enter mx-auto max-w-3xl py-4 sm:py-10">
            <div className="worksheet-frame overflow-hidden bg-white">
              <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
                <div className="worksheet-spine px-6 py-8 sm:px-10 sm:py-11">
                  <div className="flex items-center gap-3 text-[#133D76]"><span className="grid size-11 place-items-center rounded-xl border border-blue-200 bg-blue-50"><BookOpen size={21} /></span><p className="text-sm font-extrabold tracking-wide">மீராஸ் பங்கீட்டு பதிவு</p></div>
                  <p className="mt-8 text-sm font-bold text-[#133D76]">முதலில் தகவலைத் தயாரிக்கவும்</p>
                  <h1 className="mt-2 font-serif text-3xl font-bold leading-tight tracking-tight text-slate-950 sm:text-4xl">சொத்துப் பங்கீட்டின் காரணத்தைத் தெளிவாகப் பாருங்கள்</h1>
                  <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">சொத்து தொகை மற்றும் உறவுகளை பதிவு செய்த பின், ஒவ்வொருவருக்கும் ஏன் அந்தப் பங்கு வருகிறது என்பதைக் காட்டுகிறோம்.</p>
                  <button type="button" onClick={openCalculator} className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#133D76] px-5 py-3 font-extrabold text-white shadow-sm transition hover:bg-[#102F5E] active:scale-[0.98]">
                    பங்கீட்டைத் தயாரிக்கவும் <ArrowRight size={18} />
                  </button>
                  <div className="mt-7 flex gap-2 border-l-2 border-[#133D76] bg-blue-50/80 px-3 py-2.5 text-sm leading-6 text-slate-600"><Check className="mt-1 shrink-0 text-[#133D76]" size={16} /><p><strong className="text-slate-900">கற்றல் உதவி மட்டும்.</strong> உண்மையான பங்கீட்டிற்கு முன் தகுதியான அறிஞர் மற்றும் சட்ட நிபுணரிடம் உறுதி செய்யுங்கள்.</p></div>
                </div>
                <div className="worksheet-stages border-t border-slate-200 bg-slate-50/70 px-6 py-7 sm:px-10 lg:border-l lg:border-t-0">
                  <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-400">பதிவு ஒழுங்கு</p>
                  <ol className="mt-4 divide-y divide-slate-200">{[["01", "சொத்து", "பகிரக்கூடிய தொகையைத் தயாரிக்கவும்"], ["02", "வாரிசுகள்", "உள்ள உறவுகளை மட்டும் பதிவு செய்யவும்"], ["03", "சரிபார்ப்பு", "பங்கு, காரணம், தொகை ஆகியவற்றைப் பார்க்கவும்"]].map(([number, title, detail]) => <li key={number} className="flex gap-3 py-4 first:pt-0"><span className="font-serif text-lg font-bold text-[#133D76]">{number}</span><div><p className="font-extrabold text-slate-900">{title}</p><p className="mt-1 text-xs leading-5 text-slate-500">{detail}</p></div></li>)}</ol>
                  <div className="mt-5 border-t border-slate-200 pt-4"><p className="text-xs leading-5 text-slate-500">இந்தச் சாதனத்தில் மட்டுமே கணக்குகள் சேமிக்கப்படும்.</p>{history.length > 0 ? <button type="button" onClick={() => setView("history")} className="mt-2 text-sm font-bold text-[#133D76] hover:underline">சேமித்த {history.length} பதிவுகள்</button> : null}</div>
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {view === "history" ? (
          <section className="page-enter mx-auto max-w-3xl">
            <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
              <div><p className="text-sm font-bold text-[#133D76]">இந்தச் சாதனத்தில் மட்டும்</p><h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-950">சேமித்த கணக்குகள்</h1></div>
              {history.length > 0 ? <button type="button" onClick={clearHistory} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-3 text-sm font-bold text-slate-500 hover:bg-rose-50 hover:text-rose-700"><Trash2 size={16} /> அனைத்தையும் அழி</button> : null}
            </div>
            {history.length === 0 ? (
              <div className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center"><div className="mx-auto grid size-12 place-items-center rounded-2xl bg-blue-50 text-[#133D76]"><Clock3 size={22} /></div><h2 className="mt-4 text-lg font-extrabold text-slate-900">இன்னும் சேமித்த கணக்கு இல்லை</h2><p className="mt-2 text-sm leading-6 text-slate-600">ஒரு கணக்கை முடித்ததும் அது இங்கே தானாக சேமிக்கப்படும்.</p><button type="button" onClick={startNewCalculation} className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#133D76] px-4 py-2.5 text-sm font-bold text-white"><Plus size={17} /> புதிய கணக்கு</button></div>
            ) : (
              <div className="mt-5 space-y-3">{history.map((record) => <article key={record.id} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-200"><div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-blue-50 text-[#133D76]"><FileText size={20} /></div><button type="button" onClick={() => reopenCalculation(record)} className="min-w-0 flex-1 text-left"><p className="font-extrabold text-slate-900">{money(record.netEstate)}</p><p className="mt-1 truncate text-xs text-slate-500">{formatDate(record.createdAt)} · {record.totalHeirs} உறவுகள்</p></button><button type="button" onClick={() => deleteHistoryItem(record.id)} className="grid size-10 place-items-center rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-700" aria-label="கணக்கை அழிக்க"><Trash2 size={17} /></button></article>)}</div>
            )}
          </section>
        ) : null}

        {view === "calculator" ? (
          <section className="page-enter mx-auto max-w-3xl">
            <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <StepProgress step={step} onBack={setStep} />
              <button type="button" onClick={() => setView("welcome")} className="inline-flex min-h-10 items-center gap-2 self-start rounded-xl px-3 text-sm font-bold text-slate-500 hover:bg-white hover:text-slate-700"><ArrowLeft size={16} /> பிறகு தொடர்க</button>
            </div>

            {step === 1 ? (
              <div className="ledger-panel rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
                <p className="text-sm font-bold text-[#133D76]">படி 1 / 3</p>
                <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-950">மொத்தச் சொத்து எவ்வளவு?</h1>
                <p className="mt-2 text-sm leading-6 text-slate-600">மதிப்பை மட்டும் எழுதுங்கள். மற்ற விவரங்கள் இருந்தால் கீழே சேர்க்கலாம்.</p>
                <div className="mt-7">{moneyInput("grossEstate", "மொத்தச் சொத்து மதிப்பு")}</div>
                <button type="button" onClick={() => setShowOptionalEstate((current) => !current)} className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-xl px-2 text-sm font-bold text-[#133D76] hover:bg-blue-50"><ChevronDown className={`transition ${showOptionalEstate ? "rotate-180" : ""}`} size={17} /> கடன் அல்லது செலவு உள்ளது</button>
                {showOptionalEstate ? <div className="mt-3 grid gap-4 rounded-2xl bg-slate-50 p-4 sm:grid-cols-3">{moneyInput("funeralCosts", "அவசியச் செலவு")}{moneyInput("debts", "மொத்தக் கடன்")}{moneyInput("bequest", "வஸிய்யத்")}</div> : null}
                {result.notices.filter((notice) => notice.includes("வஸிய்யத்") || notice.includes("பகிரக்கூடிய")).map((notice) => <p key={notice} className="mt-4 rounded-xl bg-amber-50 px-3 py-2 text-sm leading-6 text-amber-900">{notice}</p>)}
                <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-5"><div><p className="text-xs font-bold text-slate-400">பகிரக்கூடிய தொகை</p><p className="mt-1 text-lg font-extrabold tabular-nums text-[#102B52]">{money(result.netEstate)}</p></div><button type="button" onClick={() => setStep(2)} className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-[#133D76] px-5 py-3 font-extrabold text-white shadow-lg shadow-blue-200 transition hover:bg-[#102F5E] active:scale-[0.98]">தொடர்க <ArrowRight size={18} /></button></div>
              </div>
            ) : null}

            {step === 2 ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
                <p className="text-sm font-bold text-[#133D76]">படி 2 / 3</p>
                <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-950">குடும்பத்தில் யார் உள்ளனர்?</h1>
                <p className="mt-2 text-sm leading-6 text-slate-600">இறந்தவருக்கு உயிருடன் இருப்பவர்களை மட்டும் சேர்க்கவும். எண்ணிக்கையை + மற்றும் − அழுத்தி மாற்றலாம்.</p>
                <div className="mt-7 lg:grid lg:grid-cols-[minmax(0,1fr)_235px] lg:gap-6">
                  <div className="space-y-7 pb-24 lg:pb-0">
                    <div><div className="mb-4 flex items-center gap-2 border-b border-blue-100 pb-3"><span aria-hidden="true" className="text-lg">👪</span><div><p className="text-sm font-extrabold text-[#133D76]">முதன்மை குடும்பம்</p><p className="text-xs text-slate-500">முதலில் இவர்கள் அனைவரையும் பாருங்கள்.</p></div></div><div className="space-y-5"><div><p className="mb-3 flex items-center gap-2 text-sm font-extrabold text-slate-900"><span aria-hidden="true">💑</span> துணைவர்</p><div className="grid grid-cols-3 gap-2 rounded-2xl bg-slate-100 p-2">{[["none", "யாருமில்லை"], ["husband", "கணவன்"], ["wives", "மனைவி"]].map(([value, label]) => { const active = (value === "none" && heirs.husband === 0 && heirs.wives === 0) || (value === "husband" && heirs.husband > 0) || (value === "wives" && heirs.wives > 0); return <button key={value} type="button" onClick={() => chooseSpouse(value as "none" | "husband" | "wives")} className={`min-h-11 rounded-xl px-2 text-sm font-bold ${active ? "bg-[#133D76] text-white shadow-sm" : "text-slate-600 hover:bg-white"}`}>{label}</button>; })}</div>{heirs.wives > 0 ? <div className="mt-3"><HeirCounter emoji="💑" label="மனைவிகள்" value={heirs.wives} onChange={(value) => updateHeir("wives", value)} max={4} /></div> : null}</div><div><p className="mb-3 flex items-center gap-2 text-sm font-extrabold text-slate-900"><span aria-hidden="true">👨‍👩‍👧‍👦</span> அப்பா, அம்மா, பிள்ளைகள்</p><div className="grid gap-3"><HeirCounter emoji="👨" label="அப்பா" value={heirs.father} onChange={(value) => updateHeir("father", Math.min(value, 1))} max={1} /><HeirCounter emoji="👩" label="அம்மா" value={heirs.mother} onChange={(value) => updateHeir("mother", Math.min(value, 1))} max={1} /><HeirCounter emoji="👦" label="மகன்கள்" value={heirs.sons} onChange={(value) => updateHeir("sons", value)} /><HeirCounter emoji="👧" label="மகள்கள்" value={heirs.daughters} onChange={(value) => updateHeir("daughters", value)} /></div></div></div></div>
                    <div><div className="mb-4 flex items-center gap-2 border-b border-slate-200 pb-3"><span aria-hidden="true" className="text-lg">👥</span><div><p className="text-sm font-extrabold text-[#133D76]">மற்ற குடும்பம்</p><p className="text-xs text-slate-500">இவர்களும் இருந்தால் எண்ணிக்கையைச் சேர்க்கவும்.</p></div></div><div className="grid gap-3 rounded-2xl bg-slate-50 p-3"><HeirCounter emoji="👴" label="அப்பாவின் அப்பா" description="அப்பா இல்லாதபோது மட்டும்." value={heirs.paternalGrandfather} onChange={(value) => updateHeir("paternalGrandfather", Math.min(value, 1))} max={1} /><HeirCounter emoji="👨‍🦱" label="உடன்பிறந்த சகோதரர்கள்" value={heirs.fullBrothers} onChange={(value) => updateHeir("fullBrothers", value)} /><HeirCounter emoji="👩‍🦰" label="உடன்பிறந்த சகோதரிகள்" value={heirs.fullSisters} onChange={(value) => updateHeir("fullSisters", value)} /><HeirCounter emoji="🧑" label="தாய் வழி சகோதரர்கள்" description="தாய் ஒரேவர்; அப்பா வேறாக இருக்கலாம்." value={heirs.maternalBrothers} onChange={(value) => updateHeir("maternalBrothers", value)} /><HeirCounter emoji="👩" label="தாய் வழி சகோதரிகள்" description="தாய் ஒரேவர்; அப்பா வேறாக இருக்கலாம்." value={heirs.maternalSisters} onChange={(value) => updateHeir("maternalSisters", value)} /></div></div>
                    <div><div className="mb-4 flex items-center gap-2 border-b border-slate-200 pb-3"><span aria-hidden="true" className="text-lg">👥</span><div><p className="text-sm font-extrabold text-[#133D76]">மற்ற குடும்பம்</p><p className="text-xs text-slate-500">இவர்களும் இருந்தால் எண்ணிக்கையைச் சேர்க்கவும்.</p></div></div><div className="grid gap-3 rounded-2xl bg-slate-50 p-3"><HeirCounter emoji="👴" label="அப்பாவின் அப்பா" description="அப்பா இல்லாதபோது மட்டும்." value={heirs.paternalGrandfather} onChange={(value) => updateHeir("paternalGrandfather", Math.min(value, 1))} max={1} /><HeirCounter emoji="👨‍🦱" label="உடன்பிறந்த சகோதரர்கள்" value={heirs.fullBrothers} onChange={(value) => updateHeir("fullBrothers", value)} /><HeirCounter emoji="👩‍🦰" label="உடன்பிறந்த சகோதரிகள்" value={heirs.fullSisters} onChange={(value) => updateHeir("fullSisters", value)} /><HeirCounter emoji="🧑" label="தாய் வழி சகோதரர்கள்" description="தாய் ஒரேவர்; அப்பா வேறாக இருக்கலாம்." value={heirs.maternalBrothers} onChange={(value) => updateHeir("maternalBrothers", value)} /><HeirCounter emoji="👩" label="தாய் வழி சகோதரிகள்" description="தாய் ஒரேவர்; அப்பா வேறாக இருக்கலாம்." value={heirs.maternalSisters} onChange={(value) => updateHeir("maternalSisters", value)} /></div></div>
                    <div><div className="mb-4 flex items-center gap-2 border-b border-blue-100 pb-3"><span aria-hidden="true" className="text-lg">📚</span><div><p className="text-sm font-extrabold text-[#133D76]">புத்தகத்தில் உள்ள மற்ற உறவுகள்</p><p className="text-xs text-slate-500">ஒவ்வொரு புத்தக-குழுவும் கீழே உள்ளது. தேர்வு செய்தால் அறிஞர் உறுதிப்படுத்தல் தேவைப்படும்.</p></div></div><BookFamilySections heirs={heirs} onChange={updateExtendedHeir} /></div>
                  </div>
                  <FamilyGuide />
                </div>
                <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-5"><button type="button" onClick={() => setStep(1)} className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-bold text-slate-500 hover:bg-slate-100"><ArrowLeft size={17} /> பின்செல்</button><button type="button" onClick={finishCalculation} className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-[#133D76] px-5 py-3 font-extrabold text-white shadow-lg shadow-blue-200 transition hover:bg-[#102F5E] active:scale-[0.98]"><Calculator size={18} /> முடிவைப் பார்க்கவும்</button></div>
              </div>
            ) : null}

            {step === 3 ? (
              <div className="space-y-4">
                <div className="ledger-summary rounded-3xl bg-[#133D76] p-5 text-white shadow-xl shadow-blue-200 sm:p-7"><p className="text-sm font-bold text-blue-100">படி 3 / 3</p><div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-2xl font-extrabold tracking-tight">பங்கீட்டு முடிவு</h1><p className="mt-1 text-sm text-blue-100">ஒவ்வொருவரின் பங்கும் கீழே உள்ளது.</p></div><p className="rounded-2xl bg-white/10 px-4 py-3 text-xl font-extrabold tabular-nums">{money(result.netEstate)}</p></div>{justSaved ? <p className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-xs font-bold"><Check size={14} /> இந்தக் கணக்கு வரலாற்றில் சேமிக்கப்பட்டது</p> : null}</div>
                {result.notices.length > 0 ? <div className="space-y-2">{result.notices.map((notice) => <p key={notice} className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">{notice}</p>)}</div> : null}
                {result.requiresScholarReview ? <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5"><p className="text-sm font-extrabold text-amber-950">அறிஞர் உறுதிப்படுத்தல் தேவை</p><p className="mt-2 text-sm leading-6 text-amber-900">புத்தகத்தில் உள்ள கூடுதல் உறவுகள் தேர்வு செய்யப்பட்டுள்ளன. அவர்களின் முன்னுரிமை மற்றும் துல்லியமான பங்கை உறுதிப்படுத்தாமல் இம்முடிவை இறுதியானதாகப் பயன்படுத்த வேண்டாம்.</p><div className="mt-4 flex flex-wrap gap-2">{result.selectedExtendedHeirs.map((item) => <span key={item.key} className="rounded-lg border border-amber-200 bg-white px-2.5 py-1.5 text-xs font-bold text-amber-900">{item.emoji} {item.label} · {item.count}</span>)}</div></div> : null}
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"><div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4"><h2 className="text-lg font-extrabold text-slate-950">யாருக்கு எவ்வளவு?</h2><div className="inline-flex rounded-xl bg-slate-100 p-1"><button type="button" onClick={() => setDisplayMode("fraction")} className={`rounded-lg px-3 py-2 text-xs font-bold ${displayMode === "fraction" ? "bg-white text-[#133D76] shadow-sm" : "text-slate-500"}`}>பின்னம்</button><button type="button" onClick={() => setDisplayMode("percent")} className={`rounded-lg px-3 py-2 text-xs font-bold ${displayMode === "percent" ? "bg-white text-[#133D76] shadow-sm" : "text-slate-500"}`}>%</button></div></div>{result.allocations.length > 0 ? <div className="mt-4 space-y-3">{result.allocations.map((item) => { const amount = result.netEstate * fractionToNumber(item.share); const perPerson = item.count > 1 ? amount / item.count : null; return <article key={item.key} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-extrabold text-slate-950">{item.label}{item.count > 1 ? ` (${item.count})` : ""}</p><p className="mt-1 text-xs leading-5 text-slate-500">{item.reason}</p></div><div className="text-right"><p className="rounded-lg bg-blue-100 px-2.5 py-1 text-sm font-extrabold text-[#133D76]">{displayMode === "fraction" ? fractionToText(item.share) : percentage(fractionToNumber(item.share))}</p><p className="mt-2 font-extrabold tabular-nums text-slate-950">{money(amount)}</p>{perPerson !== null ? <p className="mt-1 text-xs text-slate-500">ஒருவருக்கு {money(perPerson)}</p> : null}</div></div></article>; })}</div> : <div className="py-8 text-center"><UsersRound className="mx-auto text-slate-300" size={30} /><p className="mt-3 font-bold text-slate-700">வாரிசுகளைச் சேர்க்கவும்.</p><button type="button" onClick={() => setStep(2)} className="mt-2 text-sm font-bold text-[#133D76] hover:underline">உறவுகளை மாற்றுக</button></div>}</div>
                {result.exclusions.length > 0 ? <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-extrabold text-slate-950">பங்கு கிடைக்காதவர்கள்</h2><div className="mt-3 space-y-2">{result.exclusions.map((item) => <div key={item.label} className="rounded-xl bg-slate-50 px-3 py-3"><p className="text-sm font-bold text-slate-800">{item.label}</p><p className="mt-1 text-xs leading-5 text-slate-500">{item.reason}</p></div>)}</div></div> : null}
                <div className="rounded-3xl border border-blue-100 bg-blue-50 p-5"><div className="flex items-center gap-2 border-b-2 border-blue-200 pb-3 text-[#102B52]"><Check size={19} /><h2 className="font-extrabold">கணக்கு சரிபார்ப்பு</h2></div><div className="mt-4 grid grid-cols-3 gap-2 text-center"><div><p className="text-[11px] font-bold text-slate-500">சொத்து</p><p className="mt-1 text-sm font-extrabold tabular-nums text-slate-950">{money(result.netEstate)}</p></div><div><p className="text-[11px] font-bold text-slate-500">பகிர்வு</p><p className="mt-1 text-sm font-extrabold tabular-nums text-slate-950">{money(allocatedAmount)}</p></div><div><p className="text-[11px] font-bold text-slate-500">நிறுத்தி வைப்பு</p><p className="mt-1 text-sm font-extrabold tabular-nums text-slate-950">{money(heldAmount)}</p></div></div></div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><button type="button" onClick={() => setStep(2)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 text-sm font-bold text-slate-600 hover:bg-white"><ArrowLeft size={17} /> மாற்றுக</button><div className="flex flex-wrap gap-2"><button type="button" onClick={() => window.print()} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 hover:bg-slate-50"><Printer size={16} /> அச்சிடுக</button><button type="button" onClick={() => setView("history")} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#133D76] px-4 text-sm font-bold text-white hover:bg-[#102F5E]"><History size={16} /> வரலாறு</button></div></div>
                <p className="text-center text-xs leading-5 text-slate-500">கற்றல் உதவி மட்டும். உண்மையான பங்கீட்டிற்கு முன் தகுதியான அறிஞர் மற்றும் சட்ட நிபுணரிடம் உறுதி செய்யுங்கள்.</p>
              </div>
            ) : null}
          </section>
        ) : null}
      </main>
    </div>
  );
}
