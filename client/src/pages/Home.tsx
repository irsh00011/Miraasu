/**
 * Design: Simple white-and-blue Tamil-first guided worksheet.
 * One decision area at a time, large controls, and short reason-led calculation results.
 */
import { useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Calculator,
  Check,
  ChevronRight,
  CircleHelp,
  FileText,
  Printer,
  RotateCcw,
  UsersRound,
  WalletCards,
} from "lucide-react";
import { HeirCounter } from "@/components/HeirCounter";
import {
  calculateInheritance,
  fractionToNumber,
  fractionToText,
  type EstateInput,
  type HeirInput,
} from "@/lib/inheritance";

type Step = 1 | 2 | 3;
type DisplayMode = "fraction" | "percent";

const initialEstate: EstateInput = {
  grossEstate: 0,
  funeralCosts: 0,
  debts: 0,
  bequest: 0,
};

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
};

const steps = [
  { id: 1 as Step, label: "சொத்து", icon: WalletCards },
  { id: 2 as Step, label: "வாரிசுகள்", icon: UsersRound },
  { id: 3 as Step, label: "முடிவு", icon: FileText },
];

const money = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);

const percentage = (share: number) => `${(share * 100).toLocaleString("en-IN", { maximumFractionDigits: 2 })}%`;

export default function Home() {
  const [step, setStep] = useState<Step>(1);
  const [estate, setEstate] = useState<EstateInput>(initialEstate);
  const [heirs, setHeirs] = useState<HeirInput>(initialHeirs);
  const [displayMode, setDisplayMode] = useState<DisplayMode>("fraction");

  const result = useMemo(() => calculateInheritance(estate, heirs), [estate, heirs]);
  const allocatedAmount = result.allocations.reduce(
    (total, item) => total + result.netEstate * fractionToNumber(item.share),
    0,
  );
  const heldAmount = result.netEstate * fractionToNumber(result.unallocatedShare);
  const estateInput = (key: keyof EstateInput, label: string, helper?: string) => (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-800">{label}</span>
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 font-semibold text-blue-700">₹</span>
        <input
          type="number"
          inputMode="decimal"
          min="0"
          value={estate[key] || ""}
          onChange={(event) => setEstate((current) => ({ ...current, [key]: Math.max(0, Number(event.target.value)) }))}
          className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-9 pr-4 text-lg font-semibold text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
          placeholder="0"
        />
      </div>
      {helper ? <span className="mt-2 block text-xs leading-5 text-slate-500">{helper}</span> : null}
    </label>
  );

  const updateHeir = (key: keyof HeirInput, value: number) => setHeirs((current) => ({ ...current, [key]: value }));
  const chooseSpouse = (kind: "none" | "husband" | "wives") => {
    setHeirs((current) => ({
      ...current,
      husband: kind === "husband" ? 1 : 0,
      wives: kind === "wives" ? Math.max(1, current.wives) : 0,
    }));
  };

  const reset = () => {
    setEstate(initialEstate);
    setHeirs(initialHeirs);
    setDisplayMode("fraction");
    setStep(1);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-blue-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <a href="/" className="flex min-w-0 items-center gap-3" aria-label="முகப்பு">
            <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#133D76] text-white shadow-lg shadow-blue-200">
              <svg viewBox="0 0 48 48" aria-hidden="true" className="size-7 fill-none" stroke="currentColor" strokeWidth="2.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 14c5-3 10-2.8 18 2v20c-8-4.8-13-5-18-2V14Z" />
                <path d="M42 14c-5-3-10-2.8-18 2v20c8-4.8 13-5 18-2V14Z" />
                <path d="M11 17.5c3-1.1 6.1-.5 9.5 1.3M37 17.5c-3-1.1-6.1-.5-9.5 1.3" opacity=".7" />
                <path d="M13 10c2-2 4.7-3 7.6-3M35 10c-2-2-4.7-3-7.6-3" stroke="#B9D5FF" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="truncate text-base font-extrabold tracking-tight text-slate-950 sm:text-lg">மீராஸ் கணக்கீடு</p>
              <p className="truncate text-xs text-slate-500">எளிய வாரிசுரிமை வழிகாட்டி</p>
            </div>
          </a>
          <div className="hidden items-center gap-2 rounded-full bg-blue-50 px-3 py-2 text-xs font-semibold text-[#133D76] sm:flex">
            <Check size={15} />
            <span>தகவல் இந்த சாதனத்திலேயே கணக்கிடப்படுகிறது</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
        <div className="mb-8 max-w-3xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1.5 text-xs font-bold text-[#133D76]">
            <Calculator size={14} />
            3 எளிய படிகள்
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">உங்களுக்கான எளிய சொத்துப் பங்கு கணக்கீடு</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">முதலில் பகிரக்கூடிய சொத்தை எழுதுங்கள். பின்னர் வாரிசுகளைத் தேர்வு செய்யுங்கள். முடிவில் ஒவ்வொருவருக்கும் ஏன் அந்தப் பங்கு கிடைக்கிறது என்பதைப் பாருங்கள்.</p>
          <div className="mt-5 flex max-w-3xl gap-3 border-l-4 border-[#133D76] bg-blue-50/80 px-4 py-3 text-sm leading-6 text-slate-700">
            <Check className="mt-0.5 shrink-0 text-[#133D76]" size={18} />
            <p><strong className="text-slate-900">கற்றல் உதவி மட்டும்.</strong> உண்மையான சொத்து பங்கீட்டுக்கு முன் தகுதியான இஸ்லாமிய வாரிசுரிமை அறிஞரிடமும் பொருந்தும் சட்ட நிபுணரிடமும் உறுதி செய்யுங்கள்.</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[250px_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <nav className="ledger-panel rounded-3xl border border-slate-200 bg-white p-3 shadow-sm" aria-label="கணக்கீட்டு படிகள்">
              <p className="px-3 pb-2 pt-1 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">கணக்கீடு</p>
              <div className="space-y-1">
                {steps.map(({ id, label, icon: Icon }) => {
                  const active = step === id;
                  const completed = step > id;
                  return (
                    <button
                      type="button"
                      key={id}
                      onClick={() => (id < step ? setStep(id) : undefined)}
                      disabled={id > step}
                      className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${active ? "bg-[#133D76] text-white shadow-md shadow-blue-200" : completed ? "text-[#133D76] hover:bg-blue-50" : "cursor-not-allowed text-slate-400"}`}
                    >
                      <span className={`grid size-8 place-items-center rounded-xl ${active ? "bg-white/15" : completed ? "bg-blue-100" : "bg-slate-100"}`}>
                        {completed ? <Check size={17} /> : <Icon size={17} />}
                      </span>
                      <span className="font-bold">{id}. {label}</span>
                      {active ? <ChevronRight className="ml-auto" size={17} /> : null}
                    </button>
                  );
                })}
              </div>
            </nav>

            <div className="mt-4 rounded-3xl border border-blue-100 bg-blue-50 p-4">
              <div className="flex gap-2 text-[#133D76]">
                <CircleHelp className="mt-0.5 shrink-0" size={18} />
                <p className="text-sm font-bold">எளிய வழக்கு மட்டும்</p>
              </div>
              <p className="mt-2 text-xs leading-5 text-blue-900/75">காணாமல் போனவர், கர்ப்பக் குழந்தை, பல மரணங்கள், அல்லது மத்ஹப் வேறுபாடு உள்ள வழக்குகள் அறிஞர் உறுதிப்படுத்தலுடன் பார்க்கப்பட வேண்டும்.</p>
            </div>
          </aside>

          <section className="min-w-0">
            {step === 1 ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
                <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-6 sm:flex-row sm:items-start">
                  <div>
                  <p className="text-sm font-bold text-[#133D76]">படி 1</p>
                    <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-950">பகிரக்கூடிய சொத்து</h2>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">கடன்கள் மற்றும் அவசியச் செலவுகளுக்குப் பிறகு மீதமுள்ள தொகை மட்டுமே வாரிசுகளுக்குப் பகிரப்படும்.</p>
                  </div>
                  <div className="rounded-2xl bg-blue-50 px-4 py-3 text-right">
                    <p className="text-xs font-semibold text-[#133D76]">பகிரக்கூடிய தொகை</p>
                    <p className="mt-1 text-xl font-extrabold tabular-nums text-[#102B52]">{money(result.netEstate)}</p>
                  </div>
                </div>

                <div className="mt-7 grid gap-5 sm:grid-cols-2">
                  {estateInput("grossEstate", "மொத்தச் சொத்து மதிப்பு", "வீடு, பணம், நகை போன்ற அனைத்துச் சொத்துகளின் மொத்த மதிப்பு.")}
                  {estateInput("funeralCosts", "அடக்கம் மற்றும் அவசியச் செலவு", "இருந்தால் மட்டும் எழுதுங்கள்.")}
                  {estateInput("debts", "மொத்தக் கடன்", "கடன் தொகை முதலில் தீர்க்கப்படும்.")}
                  {estateInput("bequest", "வஸிய்யத் தொகை", "கடன் மற்றும் செலவுக்குப் பிறகான தொகையில் 1/3 வரை மட்டும் பயன்படுத்தப்படும்.")}
                </div>

                {result.notices.length > 0 ? (
                  <div className="mt-6 space-y-2">
                    {result.notices.map((notice) => (
                      <div key={notice} className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
                        <AlertCircle className="mt-0.5 shrink-0" size={18} />
                        {notice}
                      </div>
                    ))}
                  </div>
                ) : null}

                <div className="mt-8 flex justify-end">
                  <button type="button" onClick={() => setStep(2)} className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-[#133D76] px-5 py-3 font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-[#102F5E] active:scale-[0.98]">
                    வாரிசுகளைத் தேர்வு செய்து தொடர்க <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            ) : null}

            {step === 2 ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
                <div className="border-b border-slate-100 pb-6">
                  <p className="text-sm font-bold text-[#133D76]">படி 2</p>
                  <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-950">வாரிசுகள் யார்?</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">உள்ளவர்களை மட்டும் தேர்வு செய்யுங்கள். எத்தனை பேர் இருக்கிறார்கள் என்பதை + மற்றும் − அழுத்தி மாற்றலாம்.</p>
                </div>

                <div className="mt-7 grid gap-7 xl:grid-cols-2">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2"><span className="grid size-8 place-items-center rounded-xl bg-blue-100 text-[#133D76]"><UsersRound size={17} /></span><h3 className="font-extrabold text-slate-950">கணவன் அல்லது மனைவி</h3></div>
                    <div className="grid grid-cols-3 gap-2 rounded-2xl bg-slate-50 p-2">
                      {[
                        ["none", "யாருமில்லை"],
                        ["husband", "கணவன்"],
                        ["wives", "மனைவி"],
                      ].map(([value, label]) => {
                        const active = (value === "none" && heirs.husband === 0 && heirs.wives === 0) || (value === "husband" && heirs.husband > 0) || (value === "wives" && heirs.wives > 0);
                        return <button key={value} type="button" onClick={() => chooseSpouse(value as "none" | "husband" | "wives")} className={`min-h-11 rounded-xl px-2 text-sm font-bold transition ${active ? "bg-[#133D76] text-white shadow-sm" : "text-slate-600 hover:bg-white"}`}>{label}</button>;
                      })}
                    </div>
                    {heirs.wives > 0 ? <HeirCounter label="மனைவிகள்" value={heirs.wives} onChange={(value) => updateHeir("wives", value)} max={4} /> : null}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2"><span className="grid size-8 place-items-center rounded-xl bg-blue-100 text-[#133D76]"><UsersRound size={17} /></span><h3 className="font-extrabold text-slate-950">பெற்றோர்</h3></div>
                    <HeirCounter label="தந்தை" value={heirs.father} onChange={(value) => updateHeir("father", Math.min(value, 1))} max={1} />
                    <HeirCounter label="தாய்" value={heirs.mother} onChange={(value) => updateHeir("mother", Math.min(value, 1))} max={1} />
                    <HeirCounter label="தந்தையின் தந்தை" description="தந்தை இல்லாதபோது மட்டும் சேர்க்கவும்." value={heirs.paternalGrandfather} onChange={(value) => updateHeir("paternalGrandfather", Math.min(value, 1))} max={1} />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2"><span className="grid size-8 place-items-center rounded-xl bg-blue-100 text-[#133D76]"><UsersRound size={17} /></span><h3 className="font-extrabold text-slate-950">பிள்ளைகள்</h3></div>
                    <HeirCounter label="மகன்கள்" value={heirs.sons} onChange={(value) => updateHeir("sons", value)} />
                    <HeirCounter label="மகள்கள்" value={heirs.daughters} onChange={(value) => updateHeir("daughters", value)} />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2"><span className="grid size-8 place-items-center rounded-xl bg-blue-100 text-[#133D76]"><UsersRound size={17} /></span><h3 className="font-extrabold text-slate-950">சகோதரர் / சகோதரி</h3></div>
                    <HeirCounter label="உடன் பிறந்த சகோதரர்கள்" value={heirs.fullBrothers} onChange={(value) => updateHeir("fullBrothers", value)} />
                    <HeirCounter label="உடன் பிறந்த சகோதரிகள்" value={heirs.fullSisters} onChange={(value) => updateHeir("fullSisters", value)} />
                    <HeirCounter label="தாய் வழி சகோதரர்கள்" value={heirs.maternalBrothers} onChange={(value) => updateHeir("maternalBrothers", value)} />
                    <HeirCounter label="தாய் வழி சகோதரிகள்" value={heirs.maternalSisters} onChange={(value) => updateHeir("maternalSisters", value)} />
                  </div>
                </div>

                <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <button type="button" onClick={() => setStep(1)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl px-4 py-2.5 font-bold text-slate-600 transition hover:bg-slate-100"><ArrowLeft size={17} /> பின்செல்</button>
                  <button type="button" onClick={() => setStep(3)} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#133D76] px-5 py-3 font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-[#102F5E] active:scale-[0.98]"><Calculator size={18} /> பங்கீட்டு விளக்கத்தைக் காண்க</button>
                </div>
              </div>
            ) : null}

            {step === 3 ? (
              <div className="space-y-5">
                <div className="ledger-summary rounded-3xl bg-[#133D76] p-6 text-white shadow-xl shadow-blue-200 sm:p-8">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-sm font-bold text-blue-100">படி 3</p>
                      <h2 className="mt-1 text-2xl font-extrabold tracking-tight">பங்கீட்டு முடிவு</h2>
                      <p className="mt-2 max-w-xl text-sm leading-6 text-blue-100">ஒவ்வொரு வாரிசின் பங்கும், காரணமும் கீழே உள்ளது.</p>
                    </div>
                    <div className="rounded-2xl bg-white/12 px-5 py-4 backdrop-blur-sm">
                      <p className="text-xs font-bold text-blue-100">பகிரக்கூடிய சொத்து</p>
                      <p className="mt-1 text-2xl font-extrabold tabular-nums">{money(result.netEstate)}</p>
                    </div>
                  </div>
                </div>

                {result.notices.length > 0 ? <div className="space-y-2">{result.notices.map((notice) => <div key={notice} className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900"><AlertCircle className="mt-0.5 shrink-0" size={18} />{notice}</div>)}</div> : null}

                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                  <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-xl font-extrabold tracking-tight text-slate-950">யாருக்கு எவ்வளவு?</h3>
                      <p className="mt-1 text-sm text-slate-600">பங்கு மற்றும் பணம் இரண்டையும் பார்க்கலாம்.</p>
                    </div>
                    <div className="inline-flex rounded-xl bg-slate-100 p-1">
                      <button type="button" onClick={() => setDisplayMode("fraction")} className={`rounded-lg px-3 py-2 text-xs font-bold ${displayMode === "fraction" ? "bg-white text-[#133D76] shadow-sm" : "text-slate-500"}`}>பின்னம்</button>
                      <button type="button" onClick={() => setDisplayMode("percent")} className={`rounded-lg px-3 py-2 text-xs font-bold ${displayMode === "percent" ? "bg-white text-[#133D76] shadow-sm" : "text-slate-500"}`}>சதவீதம்</button>
                    </div>
                  </div>

                  {result.allocations.length > 0 ? (
                    <div className="mt-5 overflow-x-auto">
                      <table className="w-full min-w-[650px] border-separate border-spacing-0 text-left">
                        <thead>
                          <tr className="text-xs font-bold uppercase tracking-wide text-slate-400">
                            <th className="border-b border-slate-100 px-3 py-3">வாரிசு</th>
                            <th className="border-b border-slate-100 px-3 py-3">பங்கு</th>
                            <th className="border-b border-slate-100 px-3 py-3">தொகை</th>
                            <th className="border-b border-slate-100 px-3 py-3">ஏன்?</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.allocations.map((item) => {
                            const totalAmount = result.netEstate * fractionToNumber(item.share);
                            const perPerson = item.count > 1 ? totalAmount / item.count : null;
                            const shownShare = displayMode === "fraction" ? fractionToText(item.share) : percentage(fractionToNumber(item.share));
                            return (
                              <tr key={item.key} className="align-top hover:bg-blue-50/40">
                                <td className="border-b border-slate-100 px-3 py-4"><p className="font-bold text-slate-900">{item.label}{item.count > 1 ? ` (${item.count})` : ""}</p>{perPerson !== null ? <p className="mt-1 text-xs text-slate-500">ஒருவருக்கு {money(perPerson)}</p> : null}</td>
                                <td className="border-b border-slate-100 px-3 py-4"><span className="inline-flex rounded-lg bg-blue-50 px-2.5 py-1.5 font-bold tabular-nums text-[#133D76]">{shownShare}</span></td>
                                <td className="border-b border-slate-100 px-3 py-4 font-extrabold tabular-nums text-slate-950">{money(totalAmount)}</td>
                                <td className="max-w-sm border-b border-slate-100 px-3 py-4 text-sm leading-6 text-slate-600">{item.reason}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : <div className="mt-5 rounded-2xl bg-slate-50 px-5 py-8 text-center"><p className="font-bold text-slate-800">முடிவைக் காண வாரிசுகளைச் சேர்க்கவும்.</p><button type="button" onClick={() => setStep(2)} className="mt-3 text-sm font-bold text-blue-700 hover:underline">வாரிசுகளைத் தேர்வு செய்க</button></div>}
                </div>

                {result.exclusions.length > 0 ? (
                  <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                    <h3 className="text-lg font-extrabold text-slate-950">பங்கு கிடைக்காத உறவுகள்</h3>
                    <p className="mt-1 text-sm text-slate-600">இவர்கள் ஏன் கணக்கில் சேரவில்லை என்பதைத் தெளிவாகக் காட்டுகிறோம்.</p>
                    <div className="mt-4 divide-y divide-slate-100">{result.exclusions.map((item) => <div key={item.label} className="flex gap-3 py-3"><span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-500">−</span><div><p className="font-bold text-slate-800">{item.label}</p><p className="mt-1 text-sm leading-6 text-slate-600">{item.reason}</p></div></div>)}</div>
                  </div>
                ) : null}

                <div className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
                  <div className="rounded-3xl border border-blue-100 bg-blue-50 p-5 sm:p-7">
                    <div className="ledger-total flex items-center gap-2 text-[#102B52]"><Check size={20} /><h3 className="text-lg font-extrabold">கணக்கு சரிபார்ப்பு</h3></div>
                    <div className="mt-5 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl bg-white p-4"><p className="text-xs font-bold text-slate-500">பகிரக்கூடிய சொத்து</p><p className="mt-1 font-extrabold tabular-nums text-slate-950">{money(result.netEstate)}</p></div>
                      <div className="rounded-2xl bg-white p-4"><p className="text-xs font-bold text-slate-500">பகிரப்பட்ட தொகை</p><p className="mt-1 font-extrabold tabular-nums text-slate-950">{money(allocatedAmount)}</p></div>
                      <div className="rounded-2xl bg-white p-4"><p className="text-xs font-bold text-slate-500">நிறுத்தி வைத்தது</p><p className="mt-1 font-extrabold tabular-nums text-slate-950">{money(heldAmount)}</p></div>
                    </div>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm font-bold text-slate-900">அடுத்த செயல்</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">இது கற்றல் உதவி மட்டுமே. உண்மையான பகிர்விற்கு முன் தகுதியான அறிஞர் மற்றும் சட்ட நிபுணர் முடிவை உறுதி செய்ய வேண்டும்.</p>
                    <div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={() => window.print()} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#133D76] px-3 py-2 text-sm font-bold text-white hover:bg-[#102F5E]"><Printer size={16} /> உறுதி செய்து அச்சிடுக</button><button type="button" onClick={reset} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"><RotateCcw size={16} /> புதிய கணக்கு</button></div>
                  </div>
                </div>

                <button type="button" onClick={() => setStep(2)} className="inline-flex min-h-11 items-center gap-2 rounded-2xl px-4 py-2.5 font-bold text-slate-600 transition hover:bg-slate-100"><ArrowLeft size={17} /> வாரிசுகளை மாற்றுக</button>
              </div>
            ) : null}
          </section>
        </div>
      </main>
    </div>
  );
}
