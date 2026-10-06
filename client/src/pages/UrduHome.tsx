/**
 * Design: Miraasu Scholarly Ledger — Urdu (RTL) calculator: Amount → Family → Result.
 * UI only: state, handlers and every call into @/lib/inheritance are unchanged.
 * Mirrors the Tamil, English and Arabic screens with Urdu copy throughout.
 */
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Calculator, History, Printer, UsersRound } from "lucide-react";
import { FamilyList } from "@/components/FamilyList";
import { BookSourceCard } from "@/components/BookSourceCard";
import {
  EXTENDED_HEIR_SECTIONS,
  aggregateAllocationsForDisplay,
  asabahPartsFor,
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
import { readCalculationHistory, writeCalculationHistory, type SavedCalculation } from "@/lib/localHistory";

type View = "calculator" | "history";

const initialEstate: EstateInput = { grossEstate: 0, funeralCosts: 0, debts: 0, bequest: 0 };
const initialHeirs: HeirInput = {
  husband: 0, wives: 0, father: 0, mother: 0, paternalGrandfather: 0, sons: 0, daughters: 0, fullBrothers: 0, fullSisters: 0, maternalBrothers: 0, maternalSisters: 0,
  sonsSons: 0, sonsDaughters: 0, furtherSonsLineDescendants: 0, maternalGrandfather: 0, paternalGrandmothers: 0, maternalGrandmothers: 0, furtherPaternalAncestors: 0,
  paternalBrothers: 0, paternalSisters: 0, fullBrothersSons: 0, paternalBrothersSons: 0, paternalUncles: 0, paternalUnclesSons: 0, consanguinePaternalUncles: 0, consanguinePaternalUnclesSons: 0, daughtersChildren: 0, sonsDaughtersChildren: 0,
  fullBrothersDaughters: 0, fullSistersChildren: 0, maternalBrothersChildren: 0, fathersMaternalBrothers: 0, fathersMaternalBrothersDescendants: 0, mothersSiblings: 0, mothersSiblingsDescendants: 0,
};

const stepLabels = ["رقم", "خاندان", "نتیجہ"] as const;
const urLabels: Record<string, string> = {
  husband: "شوہر", wives: "بیوی / بیویاں", mother: "ماں", father: "باپ", paternalGrandfather: "دادا", sons: "بیٹے", daughters: "بیٹیاں",
  sonsSons: "پوتے", sonsDaughters: "پوتیاں", paternalGrandmothers: "دادی", maternalGrandmothers: "نانی",
  fullBrothers: "سگے بھائی", fullSisters: "سگی بہنیں", paternalBrothers: "باپ کی طرف کے بھائی", paternalSisters: "باپ کی طرف کی بہنیں",
  maternalBrothers: "ماں کی طرف کے بھائی", maternalSisters: "ماں کی طرف کی بہنیں",
};
const urExclusionLabels: Record<string, string> = {
  "தந்தையின் தந்தை": "دادا", "தந்தை வழி பாட்டி": "دادی", "தாய் வழி பாட்டி": "نانی", "மகனின் மகள்": "پوتی",
  "தாய் வழி சகோதரர் / சகோதரி": "ماں کی طرف کے بہن بھائی", "உடன் பிறந்த சகோதரர் / சகோதரி": "سگے بہن بھائی", "தந்தை வழி சகோதரி": "باپ کی طرف کی بہنیں",
};
const urExtendedLabels: Record<string, string> = {
  sonsSons: "پوتے", sonsDaughters: "پوتیاں", furtherSonsLineDescendants: "بیٹے کی طرف سے مزید نسل",
  maternalGrandfather: "نانا", paternalGrandmothers: "دادی", maternalGrandmothers: "نانی", furtherPaternalAncestors: "باپ کی طرف سے مزید آباؤ اجداد",
  paternalBrothers: "باپ کی طرف کے بھائی", paternalSisters: "باپ کی طرف کی بہنیں",
  fullBrothersSons: "سگے بھائیوں کے بیٹے", paternalBrothersSons: "باپ کی طرف کے بھائیوں کے بیٹے",
  paternalUncles: "سگے چچا (عم)", paternalUnclesSons: "سگے چچاؤں کے بیٹے",
  consanguinePaternalUncles: "باپ کی طرف کے چچا", consanguinePaternalUnclesSons: "باپ کی طرف کے چچاؤں کے بیٹے",
  daughtersChildren: "بیٹی کے بچے", sonsDaughtersChildren: "پوتی کے بچے",
  fullBrothersDaughters: "سگے بھائیوں کی بیٹیاں", fullSistersChildren: "سگی بہنوں کے بچے",
  maternalBrothersChildren: "ماں کی طرف کے بھائیوں کے بچے", fathersMaternalBrothers: "باپ کا مادری بھائی",
  fathersMaternalBrothersDescendants: "ان کی اولاد", mothersSiblings: "ماں کے بہن بھائی", mothersSiblingsDescendants: "ان کی اولاد",
};
const labels: Record<string, string> = {
  ...urLabels,
  ...Object.fromEntries(EXTENDED_HEIR_SECTIONS.flatMap((section) => section.items).map((item) => [item.key, urExtendedLabels[item.key] ?? item.labelEn])),
};
const money = (value: number) => new Intl.NumberFormat("ur", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(Number.isFinite(value) ? value : 0);
const heirCount = (heirs: HeirInput) => Object.values(heirs).reduce((total, item) => total + item, 0);
const formatDate = (value: string) => new Intl.DateTimeFormat("ur", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(value));

function noticeInUrdu(notice: string) {
  if (notice.includes("சொத்து மதிப்பை")) return "جاری رکھنے کے لیے ترکہ کی مالیت درج کریں۔";
  if (notice.includes("பகிரக்கூடிய சொத்து இல்லை")) return "اخراجات اور قرضوں کے بعد کوئی قابلِ تقسیم ترکہ باقی نہیں۔";
  if (notice.includes("வஸிய்யத்")) return "وصیت اخراجات اور قرضوں کے بعد ایک تہائی تک محدود ہے؛ صرف جائز رقم استعمال کی گئی ہے۔";
  if (notice.includes("கணவன் மற்றும் மனைவிகள்")) return "شوہر اور بیوی/بیویاں ایک ساتھ منتخب نہیں ہو سکتے؛ بیوی/بیویوں کا انتخاب استعمال کیا گیا ہے۔";
  if (notice.includes("இந்த ஆவணத்தில் இது தெளிவாக குறிப்பிடப்படவில்லை")) return "یہ صورت حوالہ دستاویز میں واضح طور پر بیان نہیں؛ ترجیح اور صحیح حصے کی تصدیق مستند عالم سے کرائیں؛ نیچے دیا خودکار نتیجہ حتمی نہ سمجھیں۔";
  if (notice.includes("கூடுதல் புத்தக")) return "کتاب سے اضافی رشتہ دار منتخب کیے گئے ہیں۔ ان کے صحیح حصوں کے لیے مستند علمی جائزہ ضروری ہے؛ خودکار نتیجہ حتمی نہ سمجھیں۔";
  if (notice.includes("சில தூரத்து")) return "کچھ منتخب دور کے رشتہ داروں کی ترجیح اور صحیح حصے کی تصدیق کے لیے مستند جائزہ ضروری ہے۔";
  if (notice.includes("தந்தையின் தந்தை மற்றும்")) return "دادا اور بہن بھائی ایک ساتھ منتخب ہیں۔ اس صورت میں تفسیری اختلافات تسلیم شدہ ہیں اور علمی تصدیق ضروری ہے۔";
  if (notice.includes("நிர்ணயிக்கப்பட்ட பங்குகள்")) return "مقررہ حصے ترکہ سے بڑھ گئے ہیں اور متناسب طور پر ایڈجسٹ کیے گئے ہیں۔ علمی جائزہ تجویز کیا جاتا ہے۔";
  if (notice.includes("கருத்து வேறுபாடு")) return "اس صورت میں تفسیری اختلافات تسلیم شدہ ہیں اور علمی تصدیق ضروری ہے۔";
  if (notice.includes("மீதமான பங்கிற்கு")) return "اس آسان حساب میں باقی حصے کا کوئی مستحق وارث دستیاب نہیں۔ علمی جائزہ ضروری ہے۔";
  if (notice.includes("இவ்வமைப்பில் மீதமான")) return "اس صورت میں باقی حصے کا کوئی خودکار وارث دستیاب نہیں۔ علمی جائزہ ضروری ہے۔";
  if (notice.includes("வாரிசுகள் தேர்வு")) return "کوئی وارث منتخب نہیں کیا گیا، یا معاون رشتہ درکار ہے۔";
  return "کسی بھی حقیقی تقسیم سے پہلے اس کیس کا مستند جائزہ ضروری ہے۔";
}

export default function UrduHome() {
  const [view, setView] = useState<View>("calculator");
  const [step, setStep] = useState<Step>(1);
  const [estate, setEstate] = useState<EstateInput>(initialEstate);
  const [heirs, setHeirs] = useState<HeirInput>(initialHeirs);
  const [history, setHistory] = useState<SavedCalculation[]>([]);
  const [query, setQuery] = useState("");
  const [justSaved, setJustSaved] = useState(false);
  const [resultMode, setResultMode] = useState<"simple" | "explicit">("simple");

  const result = useMemo(() => {
    const raw = calculateInheritance(estate, heirs);
    return { ...raw, exclusions: raw.exclusions.map((item) => ({ ...item, label: urExclusionLabels[item.label] ?? item.label })) };
  }, [estate, heirs]);
  const fingerprint = useMemo(() => JSON.stringify({ estate, heirs }), [estate, heirs]);
  const distributedTotal = useMemo(() => result.allocations.reduce((total, item) => total + result.netEstate * fractionToNumber(item.share), 0), [result]);
  const remainingAmount = Math.max(0, result.netEstate - distributedTotal);

  useEffect(() => {
    document.documentElement.lang = "ur";
    document.documentElement.dir = "rtl";
    document.title = "میراث کیلکولیٹر | اردو";
    setHistory(readCalculationHistory());
    return () => { document.documentElement.dir = "ltr"; };
  }, []);
  /* Result page must always open at the top: reset any scroll position kept from the Family step. */
  useEffect(() => {
    if (step === 3) window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  }, [step]);

  const updateEstate = (key: keyof EstateInput, value: number) => setEstate((current) => ({ ...current, [key]: Math.max(0, value) }));
  const updateHeir = (key: keyof HeirInput, value: number) => setHeirs((current) => ({ ...current, [key]: Math.max(0, value) }));
  const resetKeys = (keys: (keyof HeirInput)[]) => setHeirs((current) => Object.fromEntries(Object.entries(current).map(([key, value]) => [key, keys.includes(key as keyof HeirInput) ? 0 : value])) as HeirInput);
  const openCalculator = () => { setJustSaved(false); setView("calculator"); setStep(1); };
  const startNew = () => { setEstate(initialEstate); setHeirs(initialHeirs); setQuery(""); openCalculator(); };
  const saveCalculation = () => {
    if (result.netEstate <= 0 || result.allocations.length === 0) return;
    const record: SavedCalculation = { id: crypto.randomUUID(), fingerprint, createdAt: new Date().toISOString(), estate, heirs, netEstate: result.netEstate, totalHeirs: heirCount(heirs) };
    setHistory((current) => { const next = [record, ...current.filter((item) => item.fingerprint !== record.fingerprint)].slice(0, 12); writeCalculationHistory(next); return next; });
    setJustSaved(true);
  };
  const finishCalculation = () => { setJustSaved(false); setStep(3); saveCalculation(); };
  const reopen = (record: SavedCalculation) => { setEstate(record.estate); setHeirs(record.heirs); setJustSaved(false); setView("calculator"); setStep(3); };
  const deleteRecord = (id: string) => setHistory((current) => { const next = current.filter((item) => item.id !== id); writeCalculationHistory(next); return next; });
  const clearHistory = () => {
    if (!window.confirm("کیا تمام محفوظ شدہ حسابات حذف کر دیں؟")) return;
    setHistory([]);
    writeCalculationHistory([]);
  };

  const displayAllocations = aggregateAllocationsForDisplay(result.allocations);
  const asabahGroup = displayAllocations.filter((entry) => entry.method === "remainder");

  return (
    <div className="ms-page ms-watermark">
      <AppHeader
        title="میراث کیلکولیٹر"
        subtitle="حصوں کی وجہ جاننے کا رجسٹر"
        homeLabel="ہوم"
        historyLabel="ہسٹری"
        calculatorLabel="کیلکولیٹر"
        historyActive={view === "history"}
        onToggleHistory={() => setView(view === "history" ? "calculator" : "history")}
      />

      <main className="ms-container pb-28 pt-6 sm:pb-14 sm:pt-9">
        {view === "history" ? (
          <HistoryView
            kicker="صرف اس ڈیوائس پر"
            title="محفوظ شدہ حسابات"
            records={history}
            formatMoney={money}
            formatDate={formatDate}
            countText={(count) => `${count} رشتہ دار`}
            onOpen={reopen}
            onDelete={deleteRecord}
            onClear={clearHistory}
            onNew={startNew}
            text={{ clear: "سب صاف کریں", deleteLabel: "حساب حذف کریں", emptyTitle: "ابھی کوئی محفوظ حساب نہیں", emptyBody: "حساب مکمل ہوتے ہی یہاں خودکار محفوظ ہو جائے گا۔", newLabel: "نیا حساب" }}
          />
        ) : null}

        {view === "calculator" ? (
          <section className="page-enter">
            <StepBar step={step} labels={stepLabels} ariaLabel="مراحل" resetLabel="نیا حساب" onGo={setStep} onReset={startNew} />

            {step === 1 ? (
              <EstateStep
                estate={estate}
                onChange={updateEstate}
                netEstateText={money(result.netEstate)}
                onNext={() => setStep(2)}
                notices={result.notices
                  .filter((notice) => notice.includes("வஸிய்யத்") || notice.includes("பகிரக்கூடிய"))
                  .map((notice) => <p key={notice} className="ms-notice">{noticeInUrdu(notice)}</p>)}
                text={{
                  kicker: "مرحلہ 1 از 3",
                  title: "ترکہ کی رقم",
                  gross: "ترکہ کی مالیت",
                  optional: "اختیاری",
                  addExtras: "کٹوتیاں",
                  costs: "تجہیز و تکفین کے اخراجات",
                  debts: "قرضے",
                  bequest: "وصیت",
                  distributable: "تقسیم کے قابل رقم",
                  next: "جاری رکھیں",
                }}
              />
            ) : null}

            {step === 2 ? (
              <div className="ms-card p-4 sm:p-7">
                <p className="ms-kicker">مرحلہ 2 از 3</p>
                <h1 className="ms-h1">خاندان کے کون زندہ ہیں؟</h1>
                <p className="ms-lead">صرف زندہ رشتہ داروں کو چنیں / تعداد بدلیں۔</p>
                <div className="mt-5">
                  <FamilyList heirs={heirs} onChange={updateHeir} onResetAll={() => resetKeys(Object.keys(initialHeirs) as (keyof HeirInput)[])} query={query} onQueryChange={setQuery} onSearchEnter={finishCalculation} language="ur" />
                </div>
                <div className="mt-7 flex items-center justify-between border-t border-[rgba(22,79,134,0.12)] pt-5">
                  <button type="button" onClick={() => setStep(1)} className="ms-btn ms-btn-ghost min-h-11! px-3! text-sm!"><ArrowLeft size={17} className="rtl:rotate-180" /> پیچھے</button>
                  <button type="button" onClick={finishCalculation} className="ms-btn ms-btn-primary"><Calculator size={18} /> نتیجہ دیکھیں</button>
                </div>
              </div>
            ) : null}

            {step === 3 ? (
              <div className="space-y-4">
                <ResultHero title="تقسیم کا نتیجہ" savedNote={justSaved ? "ہسٹری میں محفوظ ہو گیا" : undefined} />
                <div className="ms-estate-panel premium-pop">
                  <span className="ms-estate-label">کل جائیداد</span>
                  <strong className="ms-estate-amount num">{money(result.netEstate)}</strong>
                </div>

                {result.notices.length > 0 ? <div className="space-y-2">{result.notices.map((notice) => <p key={notice} className="ms-notice">{noticeInUrdu(notice)}</p>)}</div> : null}
                {result.requiresScholarReview ? <p className="ms-notice font-extrabold!">مستند عالم سے تصدیق ضروری ہے — یہ نتیجہ حتمی نہیں۔</p> : null}

                <SegmentedTabs value={resultMode} onChange={setResultMode} options={[{ value: "simple", label: "خلاصہ" }, { value: "explicit", label: "تفصیل" }]} />

                {resultMode === "simple" ? (
                  <div className="result-card-list space-y-2.5">
                    {result.allocations.length > 0 ? (
                      <>
                        <p className="ms-dist-label">تقسیم</p>                        {displayAllocations.map((item) => {
                          const amount = result.netEstate * fractionToNumber(item.share);
                          const isAsabah = item.method === "remainder";
                          const parts = asabahPartsFor(item, asabahGroup);
                          return (
                            <ShareCard
                              key={`${item.key}-${item.method}`}
                              name={labels[item.key] ?? item.label}
                              count={item.count}
                              tag={isAsabah ? "عصبہ" : undefined}
                              fraction={isAsabah ? `${parts} ${parts === 1 ? "حصہ" : "حصے"}` : fractionToText(item.share)}
                              percent={isAsabah ? undefined : sourcePercentage(item.share)}
                              amount={money(amount)}
                              perPersonLabel="فی فرد"
                              perPerson={isAsabah && item.count > 1 ? money(amount / item.count) : undefined}
                            />
                          );
                        })}
                        <div className="ms-total-strip">
                          <span>کل</span>
                          <strong className="num">{money(distributedTotal)}</strong>
                        </div>
                        {remainingAmount > 0.005 ? (
                          <div className="ms-total-strip bg-[#7c5a1c]!">
                            <span>باقی رقم</span>
                            <strong className="num">{money(remainingAmount)}</strong>
                          </div>
                        ) : null}
                        {result.exclusions.length > 0 ? (
                          <details className="ms-zero-box">
                            <summary className="cursor-pointer text-sm font-extrabold text-rose-800">اس صورت میں بے حصہ رشتہ دار (<span className="num">{result.exclusions.length}</span>)</summary>
                            <div className="mt-2 space-y-1.5 text-sm text-rose-700">{result.exclusions.map((item) => <p key={`${item.key}-${item.label}`}><strong>{labels[item.key as string] ?? item.label}:</strong> اس صورت میں قرابت کی ترتیب کے مطابق محجوب۔</p>)}</div>
                          </details>
                        ) : null}
                      </>
                    ) : (
                      <div className="ms-empty">
                        <UsersRound className="mx-auto text-slate-300" size={30} />
                        <p className="mt-3 font-bold text-slate-700">نتیجہ دیکھنے کے لیے خاندان شامل کریں۔</p>
                        <button type="button" onClick={() => setStep(2)} className="mt-2 text-sm font-bold text-[#164f86] hover:underline">خاندان بدلیں</button>
                      </div>
                    )}
                  </div>
                ) : (
                  <CalculationTrace result={result} language="ur" heirLabels={labels} />
                )}

                <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
                  <button type="button" onClick={() => setStep(2)} className="ms-btn ms-btn-ghost min-h-11! justify-center text-sm!"><ArrowLeft size={17} className="rtl:rotate-180" /> خاندان بدلیں</button>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => window.print()} className="ms-btn ms-btn-soft min-h-11! text-sm!"><Printer size={16} /> پرنٹ</button>
                    <button type="button" onClick={() => setView("history")} className="ms-btn ms-btn-primary min-h-11! text-sm!"><History size={16} /> ہسٹری</button>
                  </div>
                </div>
                <BookSourceCard language="ur" />
                <p className="text-center text-xs leading-5 text-slate-500">صرف تعلیمی مدد کے لیے۔ کسی حقیقی تقسیم کی تصدیق مستند اسلامی اور قانونی ماہرین سے کرائیں۔</p>
              </div>
            ) : null}
          </section>
        ) : null}
      </main>
      {view === "calculator" ? <StepNav step={step} labels={stepLabels} ariaLabel="مراحل کے درمیان جائیں" onGo={setStep} /> : null}
    </div>
  );
}
