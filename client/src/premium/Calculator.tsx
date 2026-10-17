/** Premium Miraasu calculator shell — shared by all four language pages.
 *  All state and calculation logic preserved; only the presentation is new.
 *  Flow: estate → family → (calculation loader) → results (summary / chart / detailed) + save&share overlay + history.
 */
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, ArrowRight, Calculator as CalcIcon, ChevronDown, Download, Printer, Share2, UsersRound } from "lucide-react";
import {
  aggregateAllocationsForDisplay,
  calculateInheritance,
  fractionToNumber,
  type EstateInput,
  type HeirInput,
} from "@/lib/inheritance";
import { readCalculationHistory, writeCalculationHistory, type SavedCalculation } from "@/lib/localHistory";
import { AppHeader } from "@/components/calc/AppHeader";
import { StepBar, StepNav, type Step } from "@/components/calc/StepBar";
import { EstateStep } from "@/components/calc/EstateStep";
import { FamilyList } from "@/components/FamilyList";
import { ShareTable, buildShareTableRows } from "@/components/calc/ShareTable";
import { ResultHero } from "@/components/calc/ResultHero";
import { HistoryView } from "@/components/calc/HistoryView";
import { BookSourceCard } from "@/components/BookSourceCard";
import { CalculationTrace } from "@/components/CalculationTrace";
import { PrintSheet, type PrintRow } from "@/components/calc/PrintSheet";
import { printSummaryAsPdf } from "@/components/calc/download";
import { AnimatedMoney } from "@/components/calc/AnimatedMoney";
import { CalcLoader } from "@/premium/CalcLoader";
import { SaveShare } from "@/premium/SaveShare";
import { ShareDonut } from "@/premium/ShareDonut";
import { PbButton } from "@/premium/ui";
import { premiumCopy } from "@/premium/copy";
import type { CalcCopy } from "@/premium/copies";

type View = "calculator" | "history";

const heirCount = (heirs: HeirInput) => Object.values(heirs).reduce((total, item) => total + item, 0);

const initialEstate: EstateInput = { grossEstate: 0, funeralCosts: 0, debts: 0, bequest: 0 };
const initialHeirs: HeirInput = {
  husband: 0, wives: 0, father: 0, mother: 0, paternalGrandfather: 0,
  sons: 0, daughters: 0, fullBrothers: 0, fullSisters: 0, maternalBrothers: 0, maternalSisters: 0,
  sonsSons: 0, sonsDaughters: 0, furtherSonsLineDescendants: 0, maternalGrandfather: 0,
  paternalGrandmothers: 0, maternalGrandmothers: 0, furtherPaternalAncestors: 0,
  paternalBrothers: 0, paternalSisters: 0, fullBrothersSons: 0, paternalBrothersSons: 0,
  paternalUncles: 0, paternalUnclesSons: 0, consanguinePaternalUncles: 0, consanguinePaternalUnclesSons: 0,
  daughtersChildren: 0, sonsDaughtersChildren: 0, fullBrothersDaughters: 0, fullSistersChildren: 0,
  maternalBrothersChildren: 0, fathersMaternalBrothers: 0, fathersMaternalBrothersDescendants: 0,
  mothersSiblings: 0, mothersSiblingsDescendants: 0,
};

export function Calculator({ copy }: { copy: CalcCopy }) {
  const [, navigate] = useLocation();
  const t = premiumCopy[copy.lang];
  const rtl = copy.rtl;
  const BackIcon = rtl ? ArrowRight : ArrowLeft;
  const NextIcon = rtl ? ArrowLeft : ArrowRight;

  const [view, setView] = useState<View>("calculator");
  const [step, setStep] = useState<Step>(1);
  const [estate, setEstate] = useState<EstateInput>(initialEstate);
  const [heirs, setHeirs] = useState<HeirInput>(initialHeirs);
  const [history, setHistory] = useState<SavedCalculation[]>([]);
  const [justSaved, setJustSaved] = useState(false);
  const [familyQuery, setFamilyQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [resultTab, setResultTab] = useState<"table" | "chart">("table");
  const [detailed, setDetailed] = useState(false);

  const money = useMemo(() => {
    const fmt = new Intl.NumberFormat(copy.moneyLocale, { style: "currency", currency: "INR", maximumFractionDigits: 2 });
    return (value: number) => fmt.format(Number.isFinite(value) ? value : 0);
  }, [copy.moneyLocale]);
  const formatDate = useMemo(
    () => (value: string) => new Intl.DateTimeFormat(copy.dateLocale, { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(value)),
    [copy.dateLocale],
  );

  const result = useMemo(() => {
    const raw = calculateInheritance(estate, heirs);
    if (Object.keys(copy.exclusionLabels).length === 0) return raw;
    return { ...raw, exclusions: raw.exclusions.map((item) => ({ ...item, label: copy.exclusionLabels[item.label] ?? item.label })) };
  }, [estate, heirs, copy.exclusionLabels]);

  const distributedTotal = useMemo(
    () => result.allocations.reduce((total, item) => total + result.netEstate * fractionToNumber(item.share), 0),
    [result],
  );
  const remainingAmount = Math.max(0, result.netEstate - distributedTotal);
  const historyFingerprint = useMemo(() => JSON.stringify({ estate, heirs }), [estate, heirs]);

  const nameFor = useMemo(
    () => (copy.labels ? (key: string, fallback: string) => copy.labels![key] ?? fallback : (_key: string, fallback: string) => fallback),
    [copy.labels],
  );
  const tableRows = useMemo(() => buildShareTableRows(result, nameFor, copy.partsWord), [result, nameFor, copy.partsWord]);
  const totalHeirs = useMemo(() => aggregateAllocationsForDisplay(result.allocations).reduce((n, item) => n + item.count, 0), [result]);

  const printRows: PrintRow[] = tableRows.map((row) => ({
    name: `${row.name}${row.count > 1 ? ` × ${row.count}` : ""}`,
    share: `${row.percent} · ${row.lcm}`,
    amount: money(row.amount),
  }));
  const noShareNames = result.exclusions.map((item) => item.label);

  useEffect(() => {
    document.documentElement.lang = copy.lang;
    if (rtl) document.documentElement.dir = "rtl";
    document.title = copy.docTitle;
    setHistory(readCalculationHistory());
    return () => { if (rtl) document.documentElement.dir = "ltr"; };
  }, [copy.lang, copy.docTitle, rtl]);

  /* Result page always opens at the top: reset scroll kept from the Family step. */
  useEffect(() => {
    if (step === 3) window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  }, [step]);

  const updateEstate = (key: keyof EstateInput, value: number) => setEstate((current) => ({ ...current, [key]: Math.max(0, value) }));
  const updateHeir = (key: keyof HeirInput, value: number) => setHeirs((current) => ({ ...current, [key]: Math.max(0, value) }));
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

  const startNewCalculation = () => {
    setEstate(initialEstate);
    setHeirs(initialHeirs);
    setFamilyQuery("");
    setDetailed(false);
    setResultTab("table");
    setSaveOpen(false);
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
    if (copy.history.clearConfirm && !window.confirm(copy.history.clearConfirm)) return;
    setHistory([]);
    writeCalculationHistory([]);
  };

  const seeResult = () => {
    setJustSaved(false);
    setLoading(true);
  };

  const finishLoading = () => {
    setLoading(false);
    setDetailed(false);
    setResultTab("table");
    setStep(3);
    saveCalculation();
  };

  const estateNotices = copy.estate.showNotices
    ? result.notices.filter((notice) => notice.includes("வஸிய்யத்") || notice.includes("பகிரக்கூடிய"))
    : [];
  const resultNotices = copy.translateNotice ? result.notices.map(copy.translateNotice) : [];

  const donutSlices = tableRows.map((row) => ({
    label: row.name,
    percent: parseFloat(row.percent.replace("%", "")) || 0,
    amount: money(row.amount),
  }));

  return (
    <>
      <div className="pb-page" dir={rtl ? "rtl" : "ltr"}>
        <AppHeader
          title={copy.header.title}
          subtitle={copy.header.subtitle}
          homeLabel={copy.header.home}
          historyLabel={copy.header.history}
          calculatorLabel={copy.header.calculator}
          historyActive={view === "history"}
          onToggleHistory={() => setView(view === "history" ? "calculator" : "history")}
          learnLabel={copy.header.learn}
          onLearn={() => navigate("/learn")}
        />

        <main className="pb-container pb-28 pt-5 sm:pb-14 sm:pt-8">
          {view === "history" ? (
            <HistoryView
              kicker={copy.history.kicker}
              title={copy.history.title}
              records={history}
              formatMoney={money}
              formatDate={formatDate}
              countText={copy.history.countText}
              onOpen={reopenCalculation}
              onDelete={deleteHistoryItem}
              onClear={copy.history.clearConfirm === null ? undefined : clearHistory}
              onNew={startNewCalculation}
              text={{ clear: copy.history.clear, deleteLabel: copy.history.deleteLabel, emptyTitle: copy.history.emptyTitle, emptyBody: copy.history.emptyBody, newLabel: copy.history.newLabel }}
            />
          ) : null}

          {view === "calculator" ? (
            <section className="pb-rise">
              <StepBar step={step} labels={copy.stepLabels} ariaLabel={copy.stepsAria} resetLabel={copy.resetLabel} onGo={setStep} onReset={startNewCalculation} />

              {step === 1 ? (
                <EstateStep
                  estate={estate}
                  onChange={updateEstate}
                  netEstateText={money(result.netEstate)}
                  onNext={() => setStep(2)}
                  onBack={() => navigate("/")}
                  rtl={rtl}
                  notices={estateNotices.map((notice) => <p key={notice} className="pb-notice">{notice}</p>)}
                  text={copy.estate}
                />
              ) : null}

              {step === 2 ? (
                <div className="pb-card pb-card-pad">
                  <p className="pb-kicker">{copy.family.kicker}</p>
                  <h1 className="pb-h1 mt-1">{copy.family.title}</h1>
                  <p className="pb-lead mt-2">{copy.family.lead}</p>
                  <div className="mt-4">
                    <FamilyList
                      heirs={heirs}
                      onChange={updateHeir}
                      onResetAll={() => resetHeirKeys(Object.keys(initialHeirs) as (keyof HeirInput)[])}
                      query={familyQuery}
                      onQueryChange={setFamilyQuery}
                      onSearchEnter={seeResult}
                      language={copy.lang}
                    />
                  </div>
                  <div className="mt-6 flex items-center justify-between gap-3 border-t border-[#d8e6f7] pt-4">
                    <button type="button" onClick={() => setStep(1)} className="pb-btn pb-btn-ghost px-3 text-sm"><BackIcon size={17} /> {copy.family.back}</button>
                    <PbButton onClick={seeResult}><CalcIcon size={16} /> {copy.family.seeResult}</PbButton>
                  </div>
                </div>
              ) : null}

              {step === 3 ? (
                <div className="grid gap-4">
                  <ResultHero kicker={copy.resultKicker} title={copy.resultHero.title} subtitle={copy.resultHero.subtitle} savedNote={justSaved ? copy.resultHero.savedNote : undefined} />

                  {resultNotices.map((notice) => <p key={notice} className="pb-notice">{notice}</p>)}
                  {result.requiresScholarReview && copy.scholarBanner ? <p className="pb-notice pb-notice-strong">{copy.scholarBanner}</p> : null}

                  <div className="pb-estate-card">
                    <p className="pb-estate-card-label">{copy.totalEstateLabel}</p>
                    <p className="pb-estate-card-amount num"><AnimatedMoney value={result.netEstate} money={money} /></p>
                  </div>

                  <div className="pb-stat-row">
                    <div className="pb-stat"><b className="num">{totalHeirs}</b><span>{t.statHeirs}</span></div>
                    <div className="pb-stat"><b className="num">{result.trace.lcm}</b><span>{t.statShares}</span></div>
                    <div className="pb-stat"><b className="num">{result.trace.baseLcm}</b><span>{t.statLcm}</span></div>
                  </div>

                  <div className="mt-1">
                    <h2 className="pb-section-title">{copy.sharesTitle}</h2>
                    <p className="mt-1 text-sm text-slate-500">{copy.sharesDesc}</p>
                  </div>

                  <div className="pb-seg" role="tablist" aria-label={copy.resultHero.title}>
                    <button type="button" role="tab" aria-selected={resultTab === "table"} className={resultTab === "table" ? "is-on" : ""} onClick={() => setResultTab("table")}>{t.tabTable}</button>
                    <button type="button" role="tab" aria-selected={resultTab === "chart"} className={resultTab === "chart" ? "is-on" : ""} onClick={() => setResultTab("chart")}>{t.tabChart}</button>
                  </div>

                  {resultTab === "table" ? (
                    <div className="pb-card pb-card-pad">
                      <ShareTable
                        language={copy.lang}
                        rows={tableRows}
                        money={money}
                        empty={(
                          <div className="py-8 text-center">
                            <UsersRound className="mx-auto text-slate-300" size={30} />
                            <p className="mt-3 font-bold text-slate-700">{copy.emptyResult}</p>
                            <button type="button" onClick={() => setStep(2)} className="mt-2 text-sm font-bold text-[#1559a6] hover:underline">{copy.editFamily}</button>
                          </div>
                        )}
                      />
                    </div>
                  ) : tableRows.length > 0 ? (
                    <div className="pb-dist">
                      <div className="pb-dist-head">
                        <div className="min-w-0">
                          <h2 className="pb-section-title">{t.distTitle}</h2>
                          <p className="mt-1 text-sm text-slate-500">{t.distDesc}</p>
                        </div>
                        <button type="button" onClick={() => setResultTab("table")} className="pb-btn pb-btn-ghost flex-none px-3 text-sm">
                          <BackIcon size={16} /> {t.backToSummary}
                        </button>
                      </div>
                      <div className="pb-dist-card">
                        <p className="pb-dist-label">{copy.totalEstateLabel}</p>
                        <p className="pb-dist-value num">{money(result.netEstate)}</p>
                      </div>
                      <div className="pb-card pb-card-pad">
                        <ShareDonut slices={donutSlices} centerLabel={copy.totalEstateLabel} centerValue={money(result.netEstate)} />
                      </div>
                    </div>
                  ) : (
                    <div className="pb-card pb-card-pad">
                      <div className="py-8 text-center">
                        <UsersRound className="mx-auto text-slate-300" size={30} />
                        <p className="mt-3 font-bold text-slate-700">{copy.emptyResult}</p>
                        <button type="button" onClick={() => setStep(2)} className="mt-2 text-sm font-bold text-[#1559a6] hover:underline">{copy.editFamily}</button>
                      </div>
                    </div>
                  )}

                  {tableRows.length > 0 ? (
                    <>
                      {remainingAmount > 0.005 ? (
                        <div className="flex items-center justify-between rounded-2xl border border-[#d8e6f7] bg-white px-4 py-3.5">
                          <span className="text-sm font-bold text-slate-600">{copy.remainingLabel}</span>
                          <strong className="pb-amount num"><AnimatedMoney value={remainingAmount} money={money} delay={250 + tableRows.length * 70} /></strong>
                        </div>
                      ) : null}
                      {result.exclusions.length > 0 ? (
                        <section className="pb-noshare" aria-label={copy.noShareTitle(result.exclusions.length)}>
                          <h2 className="pb-noshare-title">{copy.noShareTitle(result.exclusions.length)}</h2>
                          <ul className="pb-noshare-list">
                            {result.exclusions.map((item) => {
                              const reason = copy.noShareFixedReason || item.reason;
                              return (
                                <li key={`${item.key}-${item.label}`} className="pb-noshare-card">
                                  <div className="pb-noshare-top">
                                    <p className="pb-noshare-name">{item.label}</p>
                                    <span className="pb-noshare-status">{t.noShareStatus}</span>
                                  </div>
                                  {reason ? <p className="pb-noshare-reason">{reason}</p> : null}
                                </li>
                              );
                            })}
                          </ul>
                        </section>
                      ) : null}
                    </>
                  ) : null}

                  {detailed ? (
                    <div className="pb-rise grid gap-3">
                      <PbButton variant="outline" onClick={() => setDetailed(false)}>
                        <BackIcon size={16} /> {t.backToSummary}
                      </PbButton>
                      <details className="pb-details" open>
                        <summary>
                          <span>{copy.auditTitle}</span>
                          <span className="pb-caret"><ChevronDown size={18} /></span>
                        </summary>
                        <div className="pb-details-body pt-3">
                          <CalculationTrace result={result} language={copy.lang} heirLabels={copy.labels ?? undefined} />
                        </div>
                      </details>
                    </div>
                  ) : (
                    <PbButton variant="outline" block onClick={() => setDetailed(true)}>
                      {t.viewDetailed} <NextIcon size={16} />
                    </PbButton>
                  )}

                  <div className="flex items-center gap-2.5">
                    <button type="button" onClick={() => setStep(2)} className="pb-btn pb-btn-ghost flex-none px-3 text-sm" aria-label={copy.family.back}>
                      <BackIcon size={16} /><span className="hidden sm:inline">{copy.family.back}</span>
                    </button>
                    <div className="grid flex-1 grid-cols-3 gap-2.5">
                      <button type="button" onClick={() => window.print()} className="pb-btn pb-btn-outline px-2 text-sm"><Printer size={16} /> {copy.printLabel}</button>
                      <button type="button" onClick={() => printSummaryAsPdf("Miraasu-Result")} className="pb-btn pb-btn-outline px-2 text-sm"><Download size={16} /> {copy.downloadLabel}</button>
                      <button type="button" onClick={() => setSaveOpen(true)} className="pb-btn pb-btn-primary px-2 text-sm"><Share2 size={16} /> {t.share}</button>
                    </div>
                  </div>

                  <BookSourceCard language={copy.lang} />
                </div>
              ) : null}
            </section>
          ) : null}
        </main>
        {view === "calculator" ? <StepNav step={step} labels={copy.stepLabels} ariaLabel={copy.stepNavAria} onGo={setStep} /> : null}
      </div>

      {loading ? <CalcLoader lang={copy.lang} onDone={finishLoading} /> : null}
      {saveOpen ? (
        <SaveShare
          lang={copy.lang}
          estateLabel={copy.totalEstateLabel}
          estateText={money(result.netEstate)}
          rows={tableRows.map((row) => ({ name: row.name, percent: row.percent, amount: money(row.amount) }))}
          saved={justSaved}
          onSave={saveCalculation}
          onDownload={() => printSummaryAsPdf("Miraasu-Result")}
          onPrint={() => window.print()}
          onDetailed={() => { setSaveOpen(false); setDetailed(true); }}
          onNew={startNewCalculation}
          onClose={() => setSaveOpen(false)}
        />
      ) : null}

      <PrintSheet
        dir={rtl ? "rtl" : "ltr"}
        brand={copy.print.brand}
        title={copy.print.title}
        dateText={new Date().toLocaleDateString(copy.print.dateLocale, { day: "numeric", month: "long", year: "numeric" })}
        estateLabel={copy.print.estateLabel}
        estate={money(result.netEstate)}
        heirLabel={copy.print.heirLabel}
        shareLabel={copy.print.shareLabel}
        amountLabel={copy.print.amountLabel}
        rows={printRows}
        totalLabel={copy.print.totalLabel}
        total={money(distributedTotal)}
        remainingLabel={copy.print.remainingLabel}
        remaining={remainingAmount > 0.005 ? money(remainingAmount) : undefined}
        noShareLabel={copy.print.noShareLabel}
        noShareText={noShareNames.length > 0 ? noShareNames.join(copy.lang === "ar" ? "، " : ", ") : undefined}
      />
    </>
  );
}
