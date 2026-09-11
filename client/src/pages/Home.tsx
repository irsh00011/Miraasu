/**
 * Design: A very short Tamil-first journey—welcome, calculate, history.
 * The interface uses one focus area per step, calm legal blue, and large touch controls.
 */
import { useEffect, useMemo, useState, type KeyboardEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Calculator,
  Check,
  ChevronDown,
  Clock3,
  FileText,
  History,
  LogOut,
  Plus,
  Printer,
  RotateCcw,
  Trash2,
  UsersRound,
  WalletCards,
} from "lucide-react";
import { FamilyList } from "@/components/FamilyList";
import {
  asabahPartsFor,
  aggregateAllocationsForDisplay,
  calculateInheritance,
  fractionToNumber,
  fractionToText,
  sourcePercentage,
  type EstateInput,
  type HeirInput,
} from "@/lib/inheritance";
import { CalculationTrace } from "@/components/CalculationTrace";
import {
  readCalculationHistory,
  writeCalculationHistory,
  type SavedCalculation,
} from "@/lib/localHistory";

type Step = 1 | 2 | 3;
type View = "welcome" | "calculator" | "history";

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
  consanguinePaternalUncles: 0,
  consanguinePaternalUnclesSons: 0,
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
const heirCount = (heirs: HeirInput) => Object.values(heirs).reduce((total, item) => total + item, 0);
const formatDate = (value: string) => new Intl.DateTimeFormat("ta-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(value));

function BrandMark() {
  return (
    <img src="/book-cover-icon-192.png" alt="" className="size-10 shrink-0 rounded-2xl object-cover shadow-lg shadow-blue-200" />
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

const stepIcons = [WalletCards, UsersRound, Calculator];

function MobileStepNav({ step, onNavigate }: { step: Step; onNavigate: (target: Step) => void }) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-blue-100 bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_rgba(19,61,118,0.08)] backdrop-blur sm:hidden"
      aria-label="படிகளுக்கு இடையே செல்ல"
    >
      <div className="mx-auto grid max-w-3xl grid-cols-3 gap-1 py-1.5">
        {stepLabels.map((label, index) => {
          const id = (index + 1) as Step;
          const Icon = stepIcons[index];
          const isCurrent = id === step;
          const reachable = id <= step;
          return (
            <button
              key={label}
              type="button"
              onClick={() => reachable && onNavigate(id)}
              disabled={!reachable}
              aria-current={isCurrent ? "step" : undefined}
              className={`flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-xl text-[11px] font-bold transition ${isCurrent ? "bg-blue-50 text-[#133D76]" : reachable ? "text-slate-500 hover:bg-slate-50" : "text-slate-300"}`}
            >
              <Icon size={19} />
              {label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default function Home() {
  const [view, setView] = useState<View>("calculator");
  const [step, setStep] = useState<Step>(1);
  const [estate, setEstate] = useState<EstateInput>(initialEstate);
  const [heirs, setHeirs] = useState<HeirInput>(initialHeirs);
  const [history, setHistory] = useState<SavedCalculation[]>([]);
  const [showOptionalEstate, setShowOptionalEstate] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [resultMode, setResultMode] = useState<"simple" | "explicit">("simple");
  const [familyQuery, setFamilyQuery] = useState("");

  const result = useMemo(() => calculateInheritance(estate, heirs), [estate, heirs]);
  const distributedTotal = useMemo(() => result.allocations.reduce((total, item) => total + result.netEstate * fractionToNumber(item.share), 0), [result]);
  const remainingAmount = Math.max(0, result.netEstate - distributedTotal);
  const historyFingerprint = useMemo(() => JSON.stringify({ estate, heirs }), [estate, heirs]);
  const resultRows = useMemo(() => {
    const displayAllocations = aggregateAllocationsForDisplay(result.allocations);
    const asabahGroup = displayAllocations.filter((item) => item.method === "remainder");
    const allocationRows = displayAllocations.map((item) => {
      const amount = result.netEstate * fractionToNumber(item.share);
      const isAsabah = item.method === "remainder";
      const parts = asabahPartsFor(item, asabahGroup);
      return {
        key: `${item.key}-${item.method}`,
        label: item.label,
        count: item.count,
        isAsabah,
        fractionText: isAsabah ? `${parts} ${parts === 1 ? "பங்கு" : "பங்குகள்"}` : fractionToText(item.share),
        percentText: isAsabah ? "" : sourcePercentage(item.share),
        amount,
        perPerson: item.count > 1 ? amount / item.count : null,
        reason: item.reason,
        zero: false,
      };
    });
    const exclusionRows = result.exclusions.map((item, index) => ({
      key: (item.key as string | undefined) ?? `exclusion-${index}`,
      label: item.label,
      count: 1,
      isAsabah: false,
      fractionText: "0",
      percentText: "0%",
      amount: 0,
      perPerson: null as number | null,
      reason: item.reason,
      zero: true,
    }));
    return [...allocationRows, ...exclusionRows];
  }, [result]);

  useEffect(() => {
    setHistory(readCalculationHistory());
  }, []);

  const updateEstate = (key: keyof EstateInput, value: number) => setEstate((current) => ({ ...current, [key]: Math.max(0, value) }));
  const updateHeir = (key: keyof HeirInput, value: number) => setHeirs((current) => ({ ...current, [key]: value }));
  const resetHeirKeys = (keys: (keyof HeirInput)[]) => setHeirs((current) => Object.fromEntries(Object.entries(current).map(([key, value]) => [key, keys.includes(key as keyof HeirInput) ? 0 : value])) as HeirInput);

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

  // ENTER moves focus to the next field inside the same [data-step-fields] container; ENTER on the last field advances the step instead of submitting early.
  const handleFieldKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    const container = event.currentTarget.closest("[data-step-fields]");
    const fields = container ? Array.from(container.querySelectorAll<HTMLInputElement>("input[data-field]")) : [];
    const index = fields.indexOf(event.currentTarget);
    const next = fields[index + 1];
    if (next) {
      next.focus();
      next.select();
    } else {
      setStep(2);
    }
  };

  const moneyInput = (key: keyof EstateInput, label: string, help?: string, size: "lg" | "xl" = "lg") => (
    <label className="block">
      <span className={`mb-2 block font-bold text-slate-800 ${size === "xl" ? "text-base" : "text-sm"}`}>{label}</span>
      <div className="relative">
        <span className={`pointer-events-none absolute inset-y-0 left-0 flex items-center font-bold text-[#133D76] ${size === "xl" ? "pl-4 text-2xl" : "pl-4 text-lg"}`}>₹</span>
        <input
          type="number"
          inputMode="decimal"
          min="0"
          data-field
          value={estate[key] || ""}
          onChange={(event) => updateEstate(key, Number(event.target.value))}
          onKeyDown={handleFieldKeyDown}
          className={`w-full rounded-2xl border border-slate-200 bg-white pr-4 font-extrabold tabular-nums text-slate-950 outline-none transition focus:border-[#133D76] focus:ring-4 focus:ring-blue-100 ${size === "xl" ? "py-4 pl-12 text-3xl" : "py-3.5 pl-9 text-lg"}`}
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
          <button type="button" onClick={startNewCalculation} className="flex min-w-0 items-center gap-2.5 text-left" aria-label="முகப்பு">
            <BrandMark />
            <div className="min-w-0">
              <p className="truncate text-base font-extrabold tracking-tight text-slate-950">மீராஸ் கணக்கீடு</p>
              <p className="truncate text-[11px] text-slate-500">பங்கு காரணம் அறியும் பதிவு</p>
            </div>
          </button>
          <div className="flex gap-1">
            <a href="/en" className="inline-flex min-h-10 items-center rounded-lg border border-blue-100 bg-blue-50 px-3 text-sm font-bold text-[#133D76] transition hover:bg-blue-100">EN</a>
            <a href="/ar" className="inline-flex min-h-10 items-center rounded-lg border border-blue-100 bg-blue-50 px-3 text-sm font-bold text-[#133D76] transition hover:bg-blue-100">عربي</a>
            {view !== "history" ? (
              <button type="button" onClick={() => setView("history")} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 text-sm font-bold text-[#133D76] transition hover:bg-blue-100">
                <History size={17} /> <span className="hidden sm:inline">வரலாறு</span>
              </button>
            ) : (
              <button type="button" onClick={() => setView("calculator")} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 text-sm font-bold text-[#133D76] transition hover:bg-blue-100"><ArrowLeft size={17} /> முகப்பு</button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-7 pb-28 sm:px-6 sm:py-10 sm:pb-10">
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
              <div className="flex flex-wrap gap-1"><button type="button" onClick={startNewCalculation} className="inline-flex min-h-10 items-center gap-2 self-start rounded-xl px-3 text-sm font-bold text-slate-500 hover:bg-white hover:text-[#133D76]"><RotateCcw size={16} /> புதிய கணக்கு</button><button type="button" onClick={startNewCalculation} className="inline-flex min-h-10 items-center gap-2 self-start rounded-xl px-3 text-sm font-bold text-slate-500 hover:bg-white hover:text-[#133D76]"><LogOut size={16} /> புதிதாகத் தொடங்கு</button></div>
            </div>

            {step === 1 ? (
              <div className="ledger-panel rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8" data-step-fields>
                <p className="text-sm font-bold text-[#133D76]">படி 1 / 3</p>
                <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-950">மொத்தச் சொத்து எவ்வளவு?</h1>
                <div className="mt-6">{moneyInput("grossEstate", "மொத்தச் சொத்து மதிப்பு", undefined, "xl")}</div>
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
                <p className="mt-1 text-xs leading-5 text-slate-500">உயிருடன் இருப்பவர்களை மட்டும் தட்டவும் / எண்ணிக்கை மாற்றவும்.</p>
                <div className="mt-5">
                  <FamilyList
                    heirs={heirs}
                    onChange={updateHeir}
                    onResetAll={() => resetHeirKeys(Object.keys(initialHeirs) as (keyof HeirInput)[])}
                    query={familyQuery}
                    onQueryChange={setFamilyQuery}
                    onSearchEnter={finishCalculation}
                    language="ta"
                  />
                </div>
                <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-5"><button type="button" onClick={() => setStep(1)} className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-bold text-slate-500 hover:bg-slate-100"><ArrowLeft size={17} /> பின்செல்</button><button type="button" onClick={finishCalculation} className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-[#133D76] px-5 py-3 font-extrabold text-white shadow-lg shadow-blue-200 transition hover:bg-[#102F5E] active:scale-[0.98]"><Calculator size={18} /> முடிவைப் பார்க்கவும்</button></div>
              </div>
            ) : null}

            {step === 3 ? (
              <div className="space-y-4">
                <div className="ledger-summary rounded-3xl bg-[#133D76] p-5 text-white shadow-xl shadow-blue-200 sm:p-7"><p className="text-sm font-bold text-blue-100">படி 3 / 3</p><div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-2xl font-extrabold tracking-tight">பங்கீட்டு முடிவு</h1><p className="mt-1 text-sm text-blue-100">ஒவ்வொரு வாரிசின் இறுதி தொகை</p></div><p className="text-4xl font-extrabold tabular-nums sm:text-5xl">{money(result.netEstate)}</p></div></div>
                <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1"><button type="button" onClick={() => setResultMode("simple")} className={`rounded-xl px-3 py-3 text-sm font-extrabold ${resultMode === "simple" ? "bg-white text-[#133D76] shadow-sm" : "text-slate-500"}`}>எளிய முடிவு</button><button type="button" onClick={() => setResultMode("explicit")} className={`rounded-xl px-3 py-3 text-sm font-extrabold ${resultMode === "explicit" ? "bg-white text-[#133D76] shadow-sm" : "text-slate-500"}`}>விரிவான கணக்கு</button></div>
                {resultMode === "simple" ? <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                  <h2 className="text-lg font-extrabold text-slate-950">யாருக்கு எவ்வளவு?</h2>
                  {resultRows.length > 0 ? (
                    <>
                    <ul className="mt-4 space-y-3">
                      {resultRows.filter((row) => !row.zero).map((row) => (
                        <li key={row.key} className={`grid min-h-28 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border p-4 ${row.zero ? "border-rose-200 bg-rose-50" : "border-slate-100 bg-slate-50/70"}`}>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <span className={`text-base font-extrabold ${row.zero ? "text-rose-800" : "text-slate-950"}`}>{row.label}{row.count > 1 ? ` (${row.count})` : ""}</span>
                            {row.zero ? <span className="rounded-md bg-rose-200 px-1.5 py-0.5 text-[10px] font-extrabold text-rose-800">பங்கு இல்லை</span> : row.isAsabah ? <span className="rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-extrabold text-amber-800">அஸபா</span> : null}
                          </div>
                          <div className="mt-1.5 grid grid-cols-[auto_auto] items-center gap-2">
                            <span className="shrink-0 text-xs font-bold text-[#133D76]">{row.fractionText}</span>
                            {row.percentText ? <span className="shrink-0 text-xs font-semibold text-slate-500">{row.percentText}</span> : null}
                            <span className={`col-span-2 shrink-0 text-right text-2xl font-extrabold tabular-nums sm:text-3xl ${row.zero ? "text-rose-700" : "text-[#133D76]"}`}>{money(row.amount)}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-4 space-y-1 border-t border-slate-100 pt-4 text-sm font-bold"><p>மொத்தம் பகிரப்பட்டது: {money(distributedTotal)}</p>{remainingAmount > 0.005 ? <p className="text-amber-800">மீதமுள்ள தொகை: {money(remainingAmount)}</p> : null}</div>
                    {resultRows.some((row) => row.zero) ? <details className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3"><summary className="cursor-pointer text-sm font-extrabold text-rose-800">பங்கு இல்லாதவர்கள் ({resultRows.filter((row) => row.zero).length})</summary><div className="mt-2 space-y-1 text-sm text-rose-700">{resultRows.filter((row) => row.zero).map((row) => <p key={`zero-${row.key}`}>{row.label}</p>)}</div></details> : null}
                    </>
                  ) : (
                    <div className="py-8 text-center"><UsersRound className="mx-auto text-slate-300" size={30} /><p className="mt-3 font-bold text-slate-700">வாரிசுகளைச் சேர்க்கவும்.</p><button type="button" onClick={() => setStep(2)} className="mt-2 text-sm font-bold text-[#133D76] hover:underline">உறவுகளை மாற்றுக</button></div>
                  )}
                </div> : <CalculationTrace result={result} language="ta" />}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><button type="button" onClick={() => setStep(2)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 text-sm font-bold text-slate-600 hover:bg-white"><ArrowLeft size={17} /> மாற்றுக</button><div className="flex flex-wrap gap-2"><button type="button" onClick={() => window.print()} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 hover:bg-slate-50"><Printer size={16} /> அச்சிடுக</button><button type="button" onClick={() => setView("history")} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#133D76] px-4 text-sm font-bold text-white hover:bg-[#102F5E]"><History size={16} /> வரலாறு</button></div></div>
              </div>
            ) : null}
          </section>
        ) : null}
      </main>
      {view === "calculator" ? <MobileStepNav step={step} onNavigate={setStep} /> : null}
    </div>
  );
}
