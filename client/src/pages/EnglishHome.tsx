/**
 * Design: Miraasu Scholarly Ledger — Amount → Family → Result, mirroring the Tamil and Arabic screens.
 * UI only: state, handlers and every call into @/lib/inheritance are unchanged.
 */
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Calculator, Download, Printer, UsersRound } from "lucide-react";
import { FamilyList } from "@/components/FamilyList";
import { BookSourceCard } from "@/components/BookSourceCard";
import { aggregateAllocationsForDisplay, asabahPartsFor, calculateInheritance, fractionToNumber, fractionToText, sourcePercentage, EXTENDED_HEIR_SECTIONS, type EstateInput, type HeirInput } from "@/lib/inheritance";
import { CalculationTrace } from "@/components/CalculationTrace";
import { AppHeader } from "@/components/calc/AppHeader";
import { EstateStep } from "@/components/calc/EstateStep";
import { HistoryView } from "@/components/calc/HistoryView";
import { ResultHero } from "@/components/calc/ResultHero";
import { LcmMethodPanel, methodCopy } from "@/components/calc/MethodPanels";
import { ShareCard } from "@/components/calc/ShareCard";
import { StepBar, StepNav, type Step } from "@/components/calc/StepBar";
import { readCalculationHistory, writeCalculationHistory, type SavedCalculation } from "@/lib/localHistory";
import { printSummaryAsPdf } from "@/components/calc/download";
import { PrintSheet, type PrintRow } from "@/components/calc/PrintSheet";

type View = "calculator" | "history";

const initialEstate: EstateInput = { grossEstate: 0, funeralCosts: 0, debts: 0, bequest: 0 };
const initialHeirs: HeirInput = {
  husband: 0, wives: 0, father: 0, mother: 0, paternalGrandfather: 0, sons: 0, daughters: 0, fullBrothers: 0, fullSisters: 0, maternalBrothers: 0, maternalSisters: 0,
  sonsSons: 0, sonsDaughters: 0, furtherSonsLineDescendants: 0, maternalGrandfather: 0, paternalGrandmothers: 0, maternalGrandmothers: 0, furtherPaternalAncestors: 0,
  paternalBrothers: 0, paternalSisters: 0, fullBrothersSons: 0, paternalBrothersSons: 0, paternalUncles: 0, paternalUnclesSons: 0, consanguinePaternalUncles: 0, consanguinePaternalUnclesSons: 0, daughtersChildren: 0, sonsDaughtersChildren: 0,
  fullBrothersDaughters: 0, fullSistersChildren: 0, maternalBrothersChildren: 0, fathersMaternalBrothers: 0, fathersMaternalBrothersDescendants: 0, mothersSiblings: 0, mothersSiblingsDescendants: 0,
};

const stepLabels = ["Amount", "Family", "Result"] as const;
const money = (value: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(Number.isFinite(value) ? value : 0);
const heirCount = (heirs: HeirInput) => Object.values(heirs).reduce((total, item) => total + item, 0);
const formatDate = (value: string) => new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(value));
const labels: Record<string, string> = {
  husband: "Husband", wives: "Wife / wives", mother: "Mother", father: "Father", paternalGrandfather: "Father’s father", sons: "Sons", daughters: "Daughters",
  sonsSons: "Sons of sons", sonsDaughters: "Daughters of sons", paternalGrandmothers: "Father’s mother", maternalGrandmothers: "Mother’s mother",
  fullBrothers: "Full brothers", fullSisters: "Full sisters", paternalBrothers: "Paternal half-brothers", paternalSisters: "Paternal half-sisters",
  maternalBrothers: "Maternal half-brothers", maternalSisters: "Maternal half-sisters",
  // Extended relatives: use the engine's English labels so no Tamil text leaks into the English screen.
  ...Object.fromEntries(EXTENDED_HEIR_SECTIONS.flatMap((section) => section.items).map((item) => [item.key, item.labelEn])),
};

function noticeInEnglish(notice: string) {
  if (notice.includes("சொத்து மதிப்பை")) return "Enter the estate value to continue.";
  if (notice.includes("பகிரக்கூடிய சொத்து இல்லை")) return "There is no estate remaining after costs and debts.";
  if (notice.includes("வஸிய்யத்")) return "The bequest is limited to one third after costs and debts; only the permitted amount is used.";
  if (notice.includes("கணவன் மற்றும் மனைவிகள்")) return "Husband and wife/wives cannot both be selected; the wife/wives selection is used.";
  if (notice.includes("இந்த ஆவணத்தில் இது தெளிவாக குறிப்பிடப்படவில்லை")) return "This combination is not clearly specified in the supplied reference. Confirm the priority and exact share with a qualified scholar; do not treat the automatic result below as final.";
  if (notice.includes("கூடுதல் புத்தக")) return "Additional relatives from the book have been selected. Their exact shares require qualified scholarly review; do not treat the automatic result below as final.";
  if (notice.includes("சில தூரத்து")) return "Some selected extended relatives require qualified review to confirm their priority and exact share.";
  if (notice.includes("தந்தையின் தந்தை மற்றும்")) return "A paternal grandfather and siblings are selected together. This combination has recognised interpretation differences and needs scholarly confirmation.";
  if (notice.includes("நிர்ணயிக்கப்பட்ட பங்குகள்")) return "The fixed shares exceed the estate and have been proportionately adjusted. Scholarly review is recommended.";
  if (notice.includes("கருத்து வேறுபாடு")) return "This combination has recognised differences of interpretation and needs scholarly confirmation.";
  if (notice.includes("மீதமான பங்கிற்கு")) return "No eligible heir for the remaining share is available in this simplified calculation. Scholarly review is needed.";
  if (notice.includes("இவ்வமைப்பில் மீதமான")) return "No automatic heir is available for the remaining share in this combination. Scholarly review is needed.";
  if (notice.includes("வாரிசுகள் தேர்வு")) return "No heir has been selected, or a supported relationship is needed.";
  return "This case needs qualified review before any real distribution.";
}

export default function EnglishHome() {
  const [view, setView] = useState<View>("calculator");
  const [step, setStep] = useState<Step>(1);
  const [estate, setEstate] = useState<EstateInput>(initialEstate);
  const [heirs, setHeirs] = useState<HeirInput>(initialHeirs);
  const [history, setHistory] = useState<SavedCalculation[]>([]);
  const [familyQuery, setFamilyQuery] = useState("");
  const [justSaved, setJustSaved] = useState(false);
  const result = useMemo(() => calculateInheritance(estate, heirs), [estate, heirs]);
  const fingerprint = useMemo(() => JSON.stringify({ estate, heirs }), [estate, heirs]);
  const distributedTotal = useMemo(() => result.allocations.reduce((total, item) => total + result.netEstate * fractionToNumber(item.share), 0), [result]);
  const remainingAmount = Math.max(0, result.netEstate - distributedTotal);

  useEffect(() => {
    document.documentElement.lang = "en";
    document.title = "Mīrāth Calculator | English";
    setHistory(readCalculationHistory());
  }, []);
  /* The Result page must always open at the top: discard any scroll position kept from the Family step. */
  useEffect(() => {
    if (step === 3) window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  }, [step]);
  const updateEstate = (key: keyof EstateInput, value: number) => setEstate((current) => ({ ...current, [key]: Math.max(0, value) }));
  const updateHeir = (key: keyof HeirInput, value: number) => setHeirs((current) => ({ ...current, [key]: Math.max(0, value) }));
  const resetHeirKeys = (keys: (keyof HeirInput)[]) => setHeirs((current) => Object.fromEntries(Object.entries(current).map(([key, value]) => [key, keys.includes(key as keyof HeirInput) ? 0 : value])) as HeirInput);
  const openCalculator = () => { setJustSaved(false); setView("calculator"); setStep(1); };
  const startNew = () => { setEstate(initialEstate); setHeirs(initialHeirs); setFamilyQuery(""); openCalculator(); };
  const saveCalculation = () => {
    if (result.netEstate <= 0 || result.allocations.length === 0) return;
    const record: SavedCalculation = { id: crypto.randomUUID(), fingerprint, createdAt: new Date().toISOString(), estate, heirs, netEstate: result.netEstate, totalHeirs: heirCount(heirs) };
    setHistory((current) => { const next = [record, ...current.filter((item) => item.fingerprint !== record.fingerprint)].slice(0, 12); writeCalculationHistory(next); return next; });
    setJustSaved(true);
  };
  const finishCalculation = () => { setJustSaved(false); setStep(3); saveCalculation(); };
  const reopen = (record: SavedCalculation) => { setEstate(record.estate); setHeirs(record.heirs); setView("calculator"); setStep(3); };
  const deleteRecord = (id: string) => setHistory((current) => { const next = current.filter((item) => item.id !== id); writeCalculationHistory(next); return next; });

  const displayAllocations = aggregateAllocationsForDisplay(result.allocations);
  const asabahGroup = displayAllocations.filter((entry) => entry.method === "remainder");
  const printRows: PrintRow[] = displayAllocations.map((item) => {
    const amount = result.netEstate * fractionToNumber(item.share);
    const isAsabah = item.method === "remainder";
    const parts = asabahPartsFor(item, asabahGroup);
    return {
      name: `${labels[item.key] ?? item.label}${item.count > 1 ? ` × ${item.count}` : ""}`,
      share: isAsabah ? `Residuary (${parts} ${parts === 1 ? "part" : "parts"})` : fractionToText(item.share),
      amount: money(amount),
    };
  });
  const noShareNames = result.exclusions.map((item) => labels[item.key as string] ?? item.label);

  return (
    <>
    <div className="ms-page ms-watermark">
      <AppHeader
        title="Islamic Inheritance Calculator"
        subtitle="Reason-led inheritance worksheet"
        homeLabel="Home"
        historyLabel="History"
        calculatorLabel="Calculator"
        historyActive={view === "history"}
        onToggleHistory={() => setView(view === "history" ? "calculator" : "history")}
      />

      <main className="ms-container pb-28 pt-6 sm:pb-14 sm:pt-9">
        {view === "history" ? (
          <HistoryView
            kicker="Only on this device"
            title="Saved calculations"
            records={history}
            formatMoney={money}
            formatDate={formatDate}
            countText={(count) => `${count} selected relatives`}
            onOpen={reopen}
            onDelete={deleteRecord}
            onNew={startNew}
            text={{ clear: "Clear all", deleteLabel: "Delete calculation", emptyTitle: "No saved calculation yet", emptyBody: "A completed calculation is automatically saved here.", newLabel: "New calculation" }}
          />
        ) : null}

        {view === "calculator" ? (
          <section className="page-enter">
            <StepBar step={step} labels={stepLabels} ariaLabel="Steps" resetLabel="New calculation" onGo={setStep} onReset={startNew} />

            {step === 1 ? (
              <EstateStep
                estate={estate}
                onChange={updateEstate}
                netEstateText={money(result.netEstate)}
                onNext={() => setStep(2)}
                notices={result.notices
                  .filter((notice) => notice.includes("வஸிய்யத்") || notice.includes("பகிரக்கூடிய"))
                  .map((notice) => <p key={notice} className="ms-notice">{noticeInEnglish(notice)}</p>)}
                text={{
                  kicker: "STEP 1 OF 3",
                  title: "Estate amount",
                  gross: "Estate value",
                  optional: "Optional",
                  addExtras: "Deductions",
                  costs: "Funeral costs",
                  debts: "Debts",
                  bequest: "Bequest",
                  distributable: "TO DISTRIBUTE",
                  next: "Continue",
                }}
              />
            ) : null}

            {step === 2 ? (
              <div className="ms-card p-4 sm:p-7">
                <p className="ms-kicker">STEP 2 OF 3</p>
                <h1 className="ms-h1 ms-h1-compact">Choose your family</h1>
                <p className="ms-lead">Select only those who are alive.</p>
                <div className="mt-4">
                  <FamilyList heirs={heirs} onChange={updateHeir} onResetAll={() => resetHeirKeys(Object.keys(initialHeirs) as (keyof HeirInput)[])} query={familyQuery} onQueryChange={setFamilyQuery} onSearchEnter={finishCalculation} language="en" />
                </div>
                <div className="mt-6 border-t border-[rgba(22,79,134,0.12)] pt-4 flex items-center justify-between gap-3">
                  <button type="button" onClick={() => setStep(1)} className="ms-btn ms-btn-ghost min-h-11! px-3! text-sm!"><ArrowLeft size={17} /> Back</button>
                  <button type="button" onClick={finishCalculation} className="ms-btn ms-btn-primary"><Calculator size={16} /> See result</button>
                </div>
              </div>
            ) : null}

            {step === 3 ? (
              <div className="space-y-4">
                <ResultHero title="Distribution result" savedNote={justSaved ? "Saved to history" : undefined} />

                {result.notices.length > 0 ? <div className="space-y-2">{result.notices.map((notice) => <p key={notice} className="ms-notice">{noticeInEnglish(notice)}</p>)}</div> : null}
                {result.requiresScholarReview ? <p className="ms-notice font-extrabold!">Scholar review required — this result is not final.</p> : null}

                <div className="ms-method-row">
                  <section className="ms-method-panel" aria-label={methodCopy.en.percentageTitle}>
                    <div className="ms-method-head"><h3>{methodCopy.en.percentageTitle}</h3></div>
                    <div className="result-card-list space-y-2.5">
                      {result.allocations.length > 0 ? (
                        displayAllocations.map((item) => {
                          const amount = result.netEstate * fractionToNumber(item.share);
                          const isAsabah = item.method === "remainder";
                          const parts = asabahPartsFor(item, asabahGroup);
                          return (
                            <ShareCard
                              key={`${item.key}-${item.method}`}
                              name={labels[item.key] ?? item.label}
                              count={item.count}
                              tag={isAsabah ? "Taʿṣīb" : undefined}
                              fraction={isAsabah ? `${parts} ${parts === 1 ? "part" : "parts"}` : fractionToText(item.share)}
                              percent={isAsabah ? undefined : sourcePercentage(item.share)}
                              amount={money(amount)}
                              perPersonLabel="Per person"
                              perPerson={isAsabah && item.count > 1 ? money(amount / item.count) : undefined}
                            />
                          );
                        })
                      ) : (
                        <div className="ms-empty">
                          <UsersRound className="mx-auto text-slate-300" size={30} />
                          <p className="mt-3 font-bold text-slate-700">Add family members to see a result.</p>
                          <button type="button" onClick={() => setStep(2)} className="mt-2 text-sm font-bold text-[#164f86] hover:underline">Edit family</button>
                        </div>
                      )}
                    </div>
                  </section>
                  <section className="ms-method-panel" aria-label={methodCopy.en.lcmTitle}>
                    <LcmMethodPanel language="en" result={result} heirLabels={labels} money={money} />
                  </section>
                </div>

                {result.allocations.length > 0 ? (
                  <>
                    {remainingAmount > 0.005 ? (
                      <div className="ms-total-strip bg-[#7c5a1c]!">
                        <span>Remaining amount</span>
                        <strong className="num">{money(remainingAmount)}</strong>
                      </div>
                    ) : null}
                    {result.exclusions.length > 0 ? (
                      <details className="ms-zero-box">
                        <summary>No share (<span className="num">{result.exclusions.length}</span>)</summary>
                        <ul>{result.exclusions.map((item, index) => <li key={`exclusion-${item.key ?? index}`}>{labels[item.key as string] ?? item.label}<span className="ms-zero-reason"> — blocked by a nearer relative.</span></li>)}</ul>
                      </details>
                    ) : null}
                  </>
                ) : null}

                <details className="ms-audit-details">
                  <summary>{methodCopy.en.auditTitle}</summary>
                  <CalculationTrace result={result} language="en" heirLabels={labels} />
                </details>

                <div className="ms-actions-packet">
                  <button type="button" onClick={() => window.print()} className="ms-btn-outline"><Printer size={16} /> Print</button>
                  <button type="button" onClick={() => printSummaryAsPdf("Miraasu-Result")} className="ms-btn-outline"><Download size={16} /> Download</button>
                </div>
                <BookSourceCard language="en" />
              </div>
            ) : null}
          </section>
        ) : null}
      </main>
      {view === "calculator" ? <StepNav step={step} labels={stepLabels} ariaLabel="Move between steps" onGo={setStep} /> : null}
      </div>
      <PrintSheet
        brand="MIRAASU"
        title="Distribution result"
        dateText={new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
        estateLabel="Total estate"
        estate={money(result.netEstate)}
        heirLabel="Heir"
        shareLabel="Share"
        amountLabel="Amount"
        rows={printRows}
        totalLabel="Total distributed"
        total={money(distributedTotal)}
        remainingLabel="Remaining amount"
        remaining={remainingAmount > 0.005 ? money(remainingAmount) : undefined}
        noShareLabel="No share"
        noShareText={noShareNames.length > 0 ? noShareNames.join(", ") : undefined}
      />
    </>
  );
}
