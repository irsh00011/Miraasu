/**
 * Design: Miraasu Scholarly Ledger — Amount → Family → Result, one focus per screen.
 * UI only: state, handlers and every call into @/lib/inheritance are unchanged.
 */
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Calculator, History, Printer, UsersRound } from "lucide-react";
import { FamilyList } from "@/components/FamilyList";
import { BookSourceCard } from "@/components/BookSourceCard";
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
import { AppHeader } from "@/components/calc/AppHeader";
import { EstateStep } from "@/components/calc/EstateStep";
import { HistoryView } from "@/components/calc/HistoryView";
import { ResultHero } from "@/components/calc/ResultHero";
import { SegmentedTabs } from "@/components/calc/SegmentedTabs";
import { ShareCard } from "@/components/calc/ShareCard";
import { StepBar, StepNav, type Step } from "@/components/calc/StepBar";
import {
  readCalculationHistory,
  writeCalculationHistory,
  type SavedCalculation,
} from "@/lib/localHistory";

type View = "calculator" | "history";

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

const stepLabels = ["தொகை", "உறவுகள்", "முடிவு"] as const;
const money = (value: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(Number.isFinite(value) ? value : 0);
const heirCount = (heirs: HeirInput) => Object.values(heirs).reduce((total, item) => total + item, 0);
const formatDate = (value: string) => new Intl.DateTimeFormat("ta-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(value));

export default function Home() {
  const [view, setView] = useState<View>("calculator");
  const [step, setStep] = useState<Step>(1);
  const [estate, setEstate] = useState<EstateInput>(initialEstate);
  const [heirs, setHeirs] = useState<HeirInput>(initialHeirs);
  const [history, setHistory] = useState<SavedCalculation[]>([]);
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
    document.documentElement.lang = "ta";
    document.title = "மீராஸ் கணக்கீடு";
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
    setFamilyQuery("");
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

  const shareRows = resultRows.filter((row) => !row.zero);
  const zeroRows = resultRows.filter((row) => row.zero);

  return (
    <div className="ms-page ms-watermark">
      <AppHeader
        title="மீராஸ் கணக்கீடு"
        subtitle="பங்கு காரணம் அறியும் பதிவு"
        homeLabel="முகப்பு"
        historyLabel="வரலாறு"
        calculatorLabel="கணக்கீடு"
        historyActive={view === "history"}
        onToggleHistory={() => setView(view === "history" ? "calculator" : "history")}
      />

      <main className="ms-container pb-28 pt-6 sm:pb-14 sm:pt-9">
        {view === "history" ? (
          <HistoryView
            kicker="இந்தச் சாதனத்தில் மட்டும்"
            title="சேமித்த கணக்குகள்"
            records={history}
            formatMoney={money}
            formatDate={formatDate}
            countText={(count) => `${count} உறவுகள்`}
            onOpen={reopenCalculation}
            onDelete={deleteHistoryItem}
            onClear={clearHistory}
            onNew={startNewCalculation}
            text={{ clear: "அனைத்தையும் அழி", deleteLabel: "கணக்கை அழிக்க", emptyTitle: "இன்னும் சேமித்த கணக்கு இல்லை", emptyBody: "ஒரு கணக்கை முடித்ததும் அது இங்கே தானாக சேமிக்கப்படும்.", newLabel: "புதிய கணக்கு" }}
          />
        ) : null}

        {view === "calculator" ? (
          <section className="page-enter">
            <StepBar step={step} labels={stepLabels} ariaLabel="படிகள்" resetLabel="புதிய கணக்கு" onGo={setStep} onReset={startNewCalculation} />

            {step === 1 ? (
              <EstateStep
                estate={estate}
                onChange={updateEstate}
                netEstateText={money(result.netEstate)}
                onNext={() => setStep(2)}
                notices={result.notices
                  .filter((notice) => notice.includes("வஸிய்யத்") || notice.includes("பகிரக்கூடிய"))
                  .map((notice) => <p key={notice} className="ms-notice">{notice}</p>)}
                text={{
                  kicker: "படி 1 / 3",
                  title: "மொத்த சொத்து",
                  gross: "சொத்தின் மதிப்பு",
                  optional: "விருப்பம்",
                  addExtras: "கழிவுகள்",
                  costs: "அடக்கச் செலவு",
                  debts: "கடன்",
                  bequest: "வஸிய்யத்",
                  distributable: "பகிரக்கூடிய தொகை",
                  next: "தொடர்க",
                }}
              />
            ) : null}

            {step === 2 ? (
              <div className="ms-card p-4 sm:p-7">
                <p className="ms-kicker">படி 2 / 3</p>
                <h1 className="ms-h1">குடும்பத்தில் யார் உள்ளனர்?</h1>
                <p className="ms-lead">உயிருடன் இருப்பவர்களை மட்டும் தட்டவும் / எண்ணிக்கை மாற்றவும்.</p>
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
                <div className="mt-7 flex items-center justify-between border-t border-[rgba(22,79,134,0.12)] pt-5">
                  <button type="button" onClick={() => setStep(1)} className="ms-btn ms-btn-ghost min-h-11! px-3! text-sm!"><ArrowLeft size={17} /> பின்செல்</button>
                  <button type="button" onClick={finishCalculation} className="ms-btn ms-btn-primary"><Calculator size={18} /> முடிவைப் பார்க்கவும்</button>
                </div>
              </div>
            ) : null}

            {step === 3 ? (
              <div className="space-y-4">
                <ResultHero title="பங்கீட்டு முடிவு" savedNote={justSaved ? "வரலாற்றில் சேமிக்கப்பட்டது" : undefined} />
                <SegmentedTabs
                  value={resultMode}
                  onChange={setResultMode}
                  options={[{ value: "simple", label: "சுருக்கம்" }, { value: "explicit", label: "விவரம்" }]}
                />

                {resultMode === "simple" ? (
                  <div className="result-card-list space-y-2.5">
                    {resultRows.length > 0 ? (
                      <>
                        {shareRows.map((row) => (
                          <ShareCard
                            key={row.key}
                            name={row.label}
                            count={row.count}
                            tag={row.isAsabah ? "அஸபா" : undefined}
                            fraction={row.fractionText}
                            percent={row.percentText}
                            amount={money(row.amount)}
                            perPersonLabel="ஒருவருக்கு"
                            perPerson={row.isAsabah && row.perPerson !== null ? money(row.perPerson) : undefined}
                          />
                        ))}
                        <div className="ms-total-strip">
                          <span>மொத்தம் பகிரப்பட்டது</span>
                          <strong className="num">{money(distributedTotal)}</strong>
                        </div>
                        {remainingAmount > 0.005 ? (
                          <div className="ms-total-strip bg-[#7c5a1c]!">
                            <span>மீதமுள்ள தொகை</span>
                            <strong className="num">{money(remainingAmount)}</strong>
                          </div>
                        ) : null}
                        {zeroRows.length > 0 ? (
                          <details className="ms-zero-box">
                            <summary>பங்கு இல்லாதவர்கள் (<span className="num">{zeroRows.length}</span>)</summary>
                            <ul>{zeroRows.map((row) => <li key={`zero-${row.key}`}>{row.label}<span className="ms-zero-reason"> — {row.reason}</span></li>)}</ul>
                          </details>
                        ) : null}
                      </>
                    ) : (
                      <div className="ms-empty">
                        <UsersRound className="mx-auto text-slate-300" size={30} />
                        <p className="mt-3 font-bold text-slate-700">வாரிசுகளைச் சேர்க்கவும்.</p>
                        <button type="button" onClick={() => setStep(2)} className="mt-2 text-sm font-bold text-[#164f86] hover:underline">உறவுகளை மாற்றுக</button>
                      </div>
                    )}
                  </div>
                ) : (
                  <CalculationTrace result={result} language="ta" />
                )}

                <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
                  <button type="button" onClick={() => setStep(2)} className="ms-btn ms-btn-ghost min-h-11! justify-center text-sm!"><ArrowLeft size={17} /> மாற்றுக</button>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => window.print()} className="ms-btn ms-btn-soft min-h-11! text-sm!"><Printer size={16} /> அச்சிடுக</button>
                    <button type="button" onClick={() => setView("history")} className="ms-btn ms-btn-primary min-h-11! text-sm!"><History size={16} /> வரலாறு</button>
                  </div>
                </div>
                <BookSourceCard language="ta" />
              </div>
            ) : null}
          </section>
        ) : null}
      </main>
      {view === "calculator" ? <StepNav step={step} labels={stepLabels} ariaLabel="படிகளுக்கு இடையே செல்ல" onGo={setStep} /> : null}
    </div>
  );
}
