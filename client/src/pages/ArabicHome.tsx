/**
 * Design: Miraasu Scholarly Ledger — Arabic (RTL) calculator: Amount → Family → Result.
 * UI only: state, handlers and every call into @/lib/inheritance are unchanged.
 */
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Calculator, Download, Printer, UsersRound } from "lucide-react";
import { FamilyList } from "@/components/FamilyList";
import { BookSourceCard } from "@/components/BookSourceCard";
import { ARABIC_EXTENDED_COPY, aggregateAllocationsForDisplay, asabahPartsFor, calculateInheritance, fractionToNumber, fractionToText, sourcePercentage, type EstateInput, type HeirInput } from "@/lib/inheritance";
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
const initialHeirs: HeirInput = { husband: 0, wives: 0, father: 0, mother: 0, paternalGrandfather: 0, sons: 0, daughters: 0, fullBrothers: 0, fullSisters: 0, maternalBrothers: 0, maternalSisters: 0, sonsSons: 0, sonsDaughters: 0, furtherSonsLineDescendants: 0, maternalGrandfather: 0, paternalGrandmothers: 0, maternalGrandmothers: 0, furtherPaternalAncestors: 0, paternalBrothers: 0, paternalSisters: 0, fullBrothersSons: 0, paternalBrothersSons: 0, paternalUncles: 0, paternalUnclesSons: 0, consanguinePaternalUncles: 0, consanguinePaternalUnclesSons: 0, daughtersChildren: 0, sonsDaughtersChildren: 0, fullBrothersDaughters: 0, fullSistersChildren: 0, maternalBrothersChildren: 0, fathersMaternalBrothers: 0, fathersMaternalBrothersDescendants: 0, mothersSiblings: 0, mothersSiblingsDescendants: 0 };

const stepLabels = ["المبلغ", "العائلة", "النتيجة"] as const;
const arabicLabels: Record<string, string> = {
  husband: "الزوج", wives: "الزوجة / الزوجات", father: "الأب", mother: "الأم", paternalGrandfather: "جد الأب", sons: "الأبناء", daughters: "البنات",
  fullBrothers: "الإخوة الأشقاء", fullSisters: "الأخوات الشقيقات", maternalBrothers: "الإخوة لأم", maternalSisters: "الأخوات لأم",
  sonsSons: "أبناء الابن", sonsDaughters: "بنات الابن", paternalGrandmothers: "جدة الأب", maternalGrandmothers: "جدة الأم",
  paternalBrothers: "الإخوة لأب", paternalSisters: "الأخوات لأب",
  // Extended relatives: Arabic copy so no Tamil text leaks into the Arabic screen.
  ...Object.fromEntries(Object.entries(ARABIC_EXTENDED_COPY).map(([key, value]) => [key, value.label])),
};
const arabicExclusionLabels: Record<string, string> = { "தந்தையின் தந்தை": "جد الأب", "தந்தை வழி பாட்டி": "جدة الأب", "தாய் வழி பாட்டி": "جدة الأم", "மகனின் மகள்": "بنت الابن", "தாய் வழி சகோதரர் / சகோதரி": "الإخوة لأم", "உடன் பிறந்த சகோதரர் / சகோதரி": "الإخوة الأشقاء", "தந்தை வழி சகோதரி": "الأخوات لأب" };
const money = (value: number) => new Intl.NumberFormat("ar", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(Number.isFinite(value) ? value : 0);
const heirCount = (heirs: HeirInput) => Object.values(heirs).reduce((total, item) => total + item, 0);
const date = (value: string) => new Intl.DateTimeFormat("ar", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(value));
const noticeArabic = (notice: string) => notice.includes("சொத்து மதிப்பை") ? "أدخل قيمة التركة أولاً." : notice.includes("பகிரக்கூடிய சொத்து இல்லை") ? "لا توجد تركة قابلة للقسمة بعد التكاليف والديون." : notice.includes("வஸிய்யத்") ? "استُخدم الحد المسموح للوصية في هذا الحساب." : notice.includes("வாரிசுகள் தேர்வு") ? "لم تُضف علاقة مدعومة بعد." : notice.includes("தூரத்து") || notice.includes("புத்தக") ? "هناك قرابة مختارة تحتاج إلى مراجعة مختص مؤهل قبل القسمة الفعلية." : notice.includes("மீதமான") ? "لا يوجد وارث تلقائي للباقي في هذا المسار المبسط؛ يلزم مراجعة مختص." : "هذه الحالة تحتاج مراجعة مختص مؤهل قبل القسمة الفعلية.";

export default function ArabicHome() {
  const [view, setView] = useState<View>("calculator");
  const [step, setStep] = useState<Step>(1);
  const [estate, setEstate] = useState<EstateInput>(initialEstate);
  const [heirs, setHeirs] = useState<HeirInput>(initialHeirs);
  const [history, setHistory] = useState<SavedCalculation[]>([]);
  const [query, setQuery] = useState("");
  const result = useMemo(() => { const raw = calculateInheritance(estate, heirs); return { ...raw, exclusions: raw.exclusions.map((item) => ({ ...item, label: arabicExclusionLabels[item.label] ?? item.label })) }; }, [estate, heirs]);
  const fingerprint = useMemo(() => JSON.stringify({ estate, heirs }), [estate, heirs]);
  const distributedTotal = useMemo(() => result.allocations.reduce((total, item) => total + result.netEstate * fractionToNumber(item.share), 0), [result]);
  const remainingAmount = Math.max(0, result.netEstate - distributedTotal);

  useEffect(() => { document.documentElement.lang = "ar"; document.documentElement.dir = "rtl"; setHistory(readCalculationHistory()); return () => { document.documentElement.dir = "ltr"; }; }, []);
  /* Result page must always open at the top: reset any scroll position kept from the Family step. */
  useEffect(() => {
    if (step === 3) window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  }, [step]);
  const updateEstate = (key: keyof EstateInput, value: number) => setEstate((current) => ({ ...current, [key]: Math.max(0, value) }));
  const updateHeir = (key: keyof HeirInput, value: number) => setHeirs((current) => ({ ...current, [key]: Math.max(0, value) }));
  const resetKeys = (keys: (keyof HeirInput)[]) => setHeirs((current) => Object.fromEntries(Object.entries(current).map(([key, value]) => [key, keys.includes(key as keyof HeirInput) ? 0 : value])) as HeirInput);
  const start = () => { setView("calculator"); setStep(1); };
  const fresh = () => { setEstate(initialEstate); setHeirs(initialHeirs); setQuery(""); start(); };
  const finish = () => { setStep(3); if (result.netEstate <= 0 || result.allocations.length === 0) return; const record: SavedCalculation = { id: crypto.randomUUID(), fingerprint, createdAt: new Date().toISOString(), estate, heirs, netEstate: result.netEstate, totalHeirs: heirCount(heirs) }; setHistory((current) => { const next = [record, ...current.filter((item) => item.fingerprint !== record.fingerprint)].slice(0, 12); writeCalculationHistory(next); return next; }); };

  const displayAllocations = aggregateAllocationsForDisplay(result.allocations);
  const asabahGroup = displayAllocations.filter((entry) => entry.method === "remainder");
  const printRows: PrintRow[] = displayAllocations.map((item) => {
    const amount = result.netEstate * fractionToNumber(item.share);
    const isAsabah = item.method === "remainder";
    const parts = asabahPartsFor(item, asabahGroup);
    return {
      name: `${arabicLabels[item.key] ?? item.label}${item.count > 1 ? ` ×${item.count}` : ""}`,
      share: isAsabah ? `عصبة (${parts} ${parts === 1 ? "سهم" : "أسهم"})` : fractionToText(item.share),
      amount: money(amount),
    };
  });
  const noShareNames = result.exclusions.map((item) => arabicLabels[item.key as string] ?? item.label);

  return (
    <>
    <div className="ms-page ms-watermark">
      <AppHeader
        title="Islamic Inheritance Calculator"
        subtitle="سجل يوضح سبب كل نصيب"
        homeLabel="الرئيسية"
        historyLabel="السجل"
        calculatorLabel="الحاسبة"
        historyActive={view === "history"}
        onToggleHistory={() => setView(view === "history" ? "calculator" : "history")}
      />

      <main className="ms-container pb-28 pt-6 sm:pb-14 sm:pt-9">
        {view === "history" ? (
          <HistoryView
            kicker="في هذا الجهاز فقط"
            title="الحسابات المحفوظة"
            records={history}
            formatMoney={money}
            formatDate={date}
            countText={(count) => `${count} أقارب`}
            onOpen={(record) => { setEstate(record.estate); setHeirs(record.heirs); setView("calculator"); setStep(3); }}
            onDelete={(id) => setHistory((current) => { const next = current.filter((item) => item.id !== id); writeCalculationHistory(next); return next; })}
            onClear={() => { if (window.confirm("هل تريد حذف كل الحسابات المحفوظة؟")) { setHistory([]); writeCalculationHistory([]); } }}
            onNew={fresh}
            text={{ clear: "حذف الكل", deleteLabel: "حذف الحساب", emptyTitle: "لا توجد حسابات محفوظة", emptyBody: "يُحفظ الحساب تلقائياً عند إكماله.", newLabel: "حساب جديد" }}
          />
        ) : null}

        {view === "calculator" ? (
          <section className="page-enter">
            <StepBar step={step} labels={stepLabels} ariaLabel="الخطوات" resetLabel="حساب جديد" onGo={setStep} onReset={fresh} />

            {step === 1 ? (
              <EstateStep
                estate={estate}
                onChange={updateEstate}
                netEstateText={money(result.netEstate)}
                onNext={() => setStep(2)}
                text={{
                  kicker: "الخطوة 1 من 3",
                  title: "قيمة التركة",
                  gross: "قيمة التركة",
                  optional: "اختياري",
                  addExtras: "الخصومات",
                  costs: "تكاليف الدفن",
                  debts: "الديون",
                  bequest: "الوصية",
                  bequestHelp: "بحسب الضوابط المناسبة",
                  distributable: "صافي التركة",
                  next: "التالي",
                }}
              />
            ) : null}

            {step === 2 ? (
              <div className="ms-card p-4 sm:p-7">
                <p className="ms-kicker">الخطوة 2 من 3</p>
                <h1 className="ms-h1 ms-h1-compact">اختر عائلتك</h1>
                <p className="ms-lead">اختر الأحياء فقط.</p>
                <div className="mt-4">
                  <FamilyList heirs={heirs} onChange={updateHeir} onResetAll={() => resetKeys(Object.keys(initialHeirs) as (keyof HeirInput)[])} query={query} onQueryChange={setQuery} onSearchEnter={finish} language="ar" />
                </div>
                <div className="mt-6 border-t border-[rgba(22,79,134,0.12)] pt-4 flex items-center justify-between gap-3">
                  <button type="button" onClick={() => setStep(1)} className="ms-btn ms-btn-ghost min-h-11! px-3! text-sm!"><ArrowRight size={17} />السابق</button>
                  <button type="button" onClick={finish} className="ms-btn ms-btn-primary"><Calculator size={16} />عرض النتيجة</button>
                </div>
              </div>
            ) : null}

            {step === 3 ? (
              <div className="space-y-4">
                <ResultHero title="نتيجة القسمة" />
                {result.notices.map((notice) => <div key={notice} className="ms-notice">{noticeArabic(notice)}</div>)}
                {result.requiresScholarReview ? <p className="ms-notice font-extrabold!">يلزم تأكيد من مختص — هذه النتيجة غير نهائية.</p> : null}

                <div className="ms-method-row">
                  <section className="ms-method-panel" aria-label={methodCopy.ar.percentageTitle}>
                    <div className="ms-method-head"><h3>{methodCopy.ar.percentageTitle}</h3></div>
                    <div className="result-card-list space-y-2.5">
                      {result.allocations.length > 0 ? (
                        displayAllocations.map((item) => {
                          const isAsabah = item.method === "remainder";
                          const parts = asabahPartsFor(item, asabahGroup);
                          const amount = result.netEstate * fractionToNumber(item.share);
                          return (
                            <ShareCard
                              key={`${item.key}-${item.method}`}
                              name={arabicLabels[item.key] ?? item.label}
                              count={item.count}
                              tag={isAsabah ? "عصبة" : undefined}
                              fraction={isAsabah ? `${parts} ${parts === 1 ? "سهم" : "أسهم"}` : fractionToText(item.share)}
                              percent={isAsabah ? undefined : sourcePercentage(item.share)}
                              amount={money(amount)}
                              perPersonLabel="لكل شخص"
                              perPerson={isAsabah && item.count > 1 ? money(amount / item.count) : undefined}
                            />
                          );
                        })
                      ) : (
                        <div className="ms-empty">
                          <UsersRound className="mx-auto text-slate-300" size={30} />
                          <p className="mt-3 font-bold text-slate-700">أضف الورثة لعرض النتيجة.</p>
                          <button type="button" onClick={() => setStep(2)} className="mt-2 text-sm font-bold text-[#164f86] hover:underline">تعديل العائلة</button>
                        </div>
                      )}
                    </div>
                  </section>
                  <section className="ms-method-panel" aria-label={methodCopy.ar.lcmTitle}>
                    <LcmMethodPanel language="ar" result={result} heirLabels={arabicLabels} money={money} />
                  </section>
                </div>

                {result.allocations.length > 0 ? (
                  <>
                    {remainingAmount > 0.005 ? (
                      <div className="ms-total-strip bg-[#7c5a1c]!">
                        <span>المبلغ المتبقي</span>
                        <strong className="num">{money(remainingAmount)}</strong>
                      </div>
                    ) : null}
                    {result.exclusions.length > 0 ? (
                      <details className="ms-zero-box">
                        <summary className="cursor-pointer text-sm font-extrabold text-rose-800">قرابات لا ترث في هذه الحالة (<span className="num">{result.exclusions.length}</span>)</summary>
                        <div className="mt-2 space-y-1.5 text-sm text-rose-700">{result.exclusions.map((item) => <p key={`${item.key}-${item.label}`}><strong>{arabicLabels[item.key as string] ?? item.label}:</strong> محجوب بقريب أقرب.</p>)}</div>
                      </details>
                    ) : null}
                  </>
                ) : null}

                <details className="ms-audit-details">
                  <summary>{methodCopy.ar.auditTitle}</summary>
                  <CalculationTrace result={result} language="ar" heirLabels={arabicLabels} />
                </details>

                <div className="ms-actions-packet">
                  <button type="button" onClick={() => window.print()} className="ms-btn-outline"><Printer size={16} /> طباعة</button>
                  <button type="button" onClick={() => printSummaryAsPdf("Miraasu-Result")} className="ms-btn-outline"><Download size={16} /> تنزيل</button>
                </div>
                <BookSourceCard language="ar" />
              </div>
            ) : null}
          </section>
        ) : null}
      </main>
      {view === "calculator" ? <StepNav step={step} labels={stepLabels} ariaLabel="التنقل بين الخطوات" onGo={setStep} /> : null}
      </div>
      <PrintSheet
        dir="rtl"
        brand="ميراسو"
        title="نتيجة القسمة"
        dateText={new Date().toLocaleDateString("ar", { day: "numeric", month: "long", year: "numeric" })}
        estateLabel="إجمالي التركة"
        estate={money(result.netEstate)}
        heirLabel="الوارث"
        shareLabel="الحصة"
        amountLabel="المبلغ"
        rows={printRows}
        totalLabel="إجمالي الموزع"
        total={money(distributedTotal)}
        remainingLabel="المبلغ المتبقي"
        remaining={remainingAmount > 0.005 ? money(remainingAmount) : undefined}
        noShareLabel="لا نصيب لهم"
        noShareText={noShareNames.length > 0 ? noShareNames.join("، ") : undefined}
      />
    </>
  );
}
