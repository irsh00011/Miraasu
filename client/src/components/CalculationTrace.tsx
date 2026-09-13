import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { ASABAH_GENDER, asabahPartsFor, fractionToNumber, fractionToText, type AppLanguage, type CalculationResult } from "@/lib/inheritance";

type Props = { result: CalculationResult; language?: AppLanguage };
type Method = "lcm" | "percentage";

const copy = {
  en: {
    explicit: "Explicit calculation",
    show: "Show explicit calculation",
    hide: "Hide explicit calculation",
    lcm: "LCM method",
    percentage: "Percentage method",
    estate: "Estate",
    fixed: "Fixed shares",
    fixedUnits: "Fixed-share units",
    fixedTotal: "Sum of fixed units",
    lcmValue: "LCM",
    remainder: "Remaining Taʿṣīb",
    ratio: "Taʿṣīb default ratio",
    parts: "Taʿṣīb members' parts",
    amount: "Amount",
    check: "Final total / check",
    distributed: "Total distributed",
    remaining: "Remaining amount",
    noRemainder: "No remainder",
    caseTitle: "Case summary",
    awl: "ʿAwl applied",
    radd: "Radd applied",
    asabah: "Taʿṣīb remainder",
    excluded: "Heirs not receiving a share",
    noExcluded: "No excluded heirs",
    male: "male",
    female: "female",
    equal: "one equal part per member",
  },
  ta: {
    explicit: "விரிவான கணக்கு",
    show: "கணக்கீட்டு முறைகளைக் காட்டு",
    hide: "கணக்கீட்டு முறைகளை மறை",
    lcm: "LCM முறை",
    percentage: "சதவீத முறை",
    estate: "சொத்து",
    fixed: "நிர்ணயப் பங்குகள்",
    fixedUnits: "நிர்ணயப் பங்கு அலகுகள்",
    fixedTotal: "நிர்ணய அலகுகளின் கூட்டுத்தொகை",
    lcmValue: "LCM",
    remainder: "மீதமுள்ள அஸபா",
    ratio: "அஸபா இயல்பான விகிதம்",
    parts: "அஸபா வாரிசுகளின் பங்குகள்",
    amount: "தொகை",
    check: "இறுதி மொத்தம் / சரிபார்ப்பு",
    distributed: "மொத்தம் பகிரப்பட்டது",
    remaining: "மீதமுள்ள தொகை",
    noRemainder: "மீதி இல்லை",
    caseTitle: "வழக்கு சுருக்கம்",
    awl: "அவுல் நடைமுறைப்படுத்தப்பட்டது",
    radd: "ரத் நடைமுறைப்படுத்தப்பட்டது",
    asabah: "அஸபா மீதி",
    excluded: "பங்கு பெறாதவர்கள்",
    noExcluded: "பங்கு இழந்தவர்கள் இல்லை",
    male: "ஆண்",
    female: "பெண்",
    equal: "ஒவ்வொரு உறுப்பினருக்கும் ஒரு சம பங்கு",
  },
  ar: {
    explicit: "الحساب التفصيلي / المجموع الصريح",
    show: "إظهار طرق الحساب",
    hide: "إخفاء طرق الحساب",
    lcm: "طريقة LCM",
    percentage: "طريقة النسبة المئوية",
    estate: "التركة",
    fixed: "الأنصبة المفروضة",
    fixedUnits: "وحدات الأنصبة المفروضة",
    fixedTotal: "مجموع الوحدات المفروضة",
    lcmValue: "LCM",
    remainder: "باقي العصبة",
    ratio: "النسبة الافتراضية للعصبة",
    parts: "أسهم أفراد العصبة",
    amount: "المبلغ",
    check: "المجموع النهائي / التحقق",
    distributed: "إجمالي الموزع",
    remaining: "المبلغ المتبقي",
    noRemainder: "لا يوجد باقي",
    caseTitle: "ملخص الحالة",
    awl: "تم تطبيق العول",
    radd: "تم تطبيق الرد",
    asabah: "باقي العصبة",
    excluded: "الورثة الذين لا يأخذون نصيباً",
    noExcluded: "لا يوجد ورثة محجوبون",
    male: "ذكر",
    female: "أنثى",
    equal: "سهم متساوٍ لكل فرد",
  },
} as const;

const money = (value: number) => value.toFixed(2);

export function CalculationTrace({ result, language = "en" }: Props) {
  const [open, setOpen] = useState(true);
  const [method, setMethod] = useState<Method>("lcm");
  const t = copy[language];
  const fixedRows = result.trace.rows.filter((row) => row.method === "fixed");
  const asabahRows = result.trace.rows.filter((row) => row.method === "remainder");
  const hasMixed = asabahRows.some((row) => ASABAH_GENDER[row.key] === "male") && asabahRows.some((row) => ASABAH_GENDER[row.key] === "female");
  const remainderAmount = Math.max(0, result.netEstate * fractionToNumber(result.trace.remainder));
  const distributedAmount = result.trace.rows.reduce((total, row) => total + row.amount, 0);
  const remainingAmount = Math.max(0, result.netEstate - distributedAmount);
  const fixedUnitTotal = fixedRows.reduce((total, row) => total + row.integerShares, 0);
  const totalParts = asabahRows.reduce((total, row) => total + asabahPartsFor(row, asabahRows), 0);
  const ratioText = hasMixed ? `${t.male} = 2 : ${t.female} = 1` : t.equal;
  const fixedShareAmount = result.netEstate * fractionToNumber(result.trace.fixedShareTotal);

  const panel = method === "lcm" ? (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Info label={t.estate} value={money(result.netEstate)} />
        <Info label={t.lcmValue} value={String(result.trace.baseLcm)} prominent />
      </div>
      <section className="rounded-2xl border border-slate-200 p-4">
        <h3 className="font-extrabold text-slate-900">{t.fixed}</h3>
        <div className="mt-3 space-y-2 text-sm">
          {fixedRows.length ? fixedRows.map((row) => <div className="grid grid-cols-1 items-start gap-1.5 border-b border-slate-100 pb-3 last:border-0 last:pb-0 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-3" key={`${row.key}-lcm`}><span className="min-w-0 break-words font-semibold">{row.label} × {row.count}</span><strong className="break-words leading-5 sm:text-right">{fractionToText(row.fraction)} → {row.integerShares} {t.fixedUnits.toLowerCase()}</strong></div>) : <span className="text-slate-500">—</span>}
        </div>
        <p className="mt-3 border-t border-slate-100 pt-3 text-sm font-bold">{t.fixedTotal}: {fixedUnitTotal} units = {money(fixedShareAmount)}</p>
      </section>
      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <h3 className="font-extrabold text-amber-950">{t.remainder}</h3>
        <p className="mt-1 break-words text-sm font-bold leading-6">{money(result.netEstate)} − {money(fixedShareAmount)} = {money(remainderAmount)}</p>
        <p className="mt-3 text-sm font-bold">{t.ratio}: {ratioText}</p>
        {asabahRows.length ? <Parts rows={asabahRows} totalParts={totalParts} remainderAmount={remainderAmount} language={language} /> : <p className="mt-2 text-sm text-amber-900">{t.noRemainder}</p>}
      </section>
      <CaseSummary result={result} t={t} />
      <CheckBlock distributed={distributedAmount} remaining={remainingAmount} estate={result.netEstate} label={t.check} t={t} />
    </div>
  ) : (
    <div className="space-y-4">
      <Info label={t.estate} value={money(result.netEstate)} />
      <section className="rounded-2xl border border-slate-200 p-4">
        <h3 className="font-extrabold text-slate-900">{t.fixed}</h3>
        <div className="mt-3 space-y-2 text-sm">
          {fixedRows.length ? fixedRows.map((row) => <div className="grid grid-cols-1 items-start gap-1.5 border-b border-slate-100 pb-3 last:border-0 last:pb-0 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-3" key={`${row.key}-percentage`}><span className="min-w-0 break-words font-semibold">{row.label} × {row.count}</span><strong className="sm:text-right">{(fractionToNumber(row.fraction) * 100).toFixed(2)}%</strong></div>) : <span className="text-slate-500">—</span>}
        </div>
        <p className="mt-3 border-t border-slate-100 pt-3 text-sm font-bold">{t.fixedTotal}: {(fractionToNumber(result.trace.fixedShareTotal) * 100).toFixed(2)}% = {money(fixedShareAmount)}</p>
      </section>
      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <h3 className="font-extrabold text-amber-950">{t.remainder}</h3>
        <p className="mt-1 break-words text-sm font-bold leading-6">100% − {(fractionToNumber(result.trace.fixedShareTotal) * 100).toFixed(2)}% = {(fractionToNumber(result.trace.remainder) * 100).toFixed(2)}% = {money(remainderAmount)}</p>
        <p className="mt-3 text-sm font-bold">{t.ratio}: {ratioText}</p>
        {asabahRows.length ? <Parts rows={asabahRows} totalParts={totalParts} remainderAmount={remainderAmount} language={language} /> : <p className="mt-2 text-sm text-amber-900">{t.noRemainder}</p>}
      </section>
      <CaseSummary result={result} t={t} />
      <CheckBlock distributed={distributedAmount} remaining={remainingAmount} estate={result.netEstate} label={t.check} t={t} />
    </div>
  );

  return (
    <section className="mt-5 rounded-3xl border border-blue-100 bg-white p-5 shadow-sm sm:p-7" dir={language === "ar" ? "rtl" : "ltr"}>
      <button type="button" onClick={() => setOpen((value) => !value)} className="flex min-h-12 w-full items-center justify-between gap-3 text-start">
        <span className="text-lg font-extrabold text-slate-950">{t.explicit}</span>
        <ChevronDown size={20} className={`shrink-0 text-[#133D76] transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open ? <div className="mt-4 border-t border-slate-100 pt-4">
        <div className="mb-4 grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
          <button type="button" onClick={() => setMethod("lcm")} className={`rounded-lg px-3 py-2 text-sm font-extrabold ${method === "lcm" ? "bg-white text-[#133D76] shadow-sm" : "text-slate-500"}`}>{t.lcm}</button>
          <button type="button" onClick={() => setMethod("percentage")} className={`rounded-lg px-3 py-2 text-sm font-extrabold ${method === "percentage" ? "bg-white text-[#133D76] shadow-sm" : "text-slate-500"}`}>{t.percentage}</button>
        </div>
        {panel}
      </div> : <p className="mt-2 text-xs font-bold text-[#133D76]">{open ? t.hide : t.show}</p>}
    </section>
  );
}

function Info({ label, value, prominent = false }: { label: string; value: string; prominent?: boolean }) {
  return <div className={`min-w-0 rounded-2xl p-4 ${prominent ? "bg-blue-50" : "bg-slate-50"}`}><p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p><p className={`mt-1 break-words font-extrabold tabular-nums ${prominent ? "text-2xl text-[#133D76] sm:text-3xl" : "text-lg text-slate-950"}`}>{value}</p></div>;
}

function Parts({ rows, totalParts, remainderAmount, language }: { rows: CalculationResult["trace"]["rows"]; totalParts: number; remainderAmount: number; language: AppLanguage }) {
  const labels = { en: "parts", ta: "பங்குகள்", ar: "أسهم" }[language];
  return <div className="mt-3 space-y-3 border-t border-amber-200 pt-3"><p className="break-words text-xs font-bold leading-5 text-amber-900">{money(remainderAmount)} ÷ {totalParts} {labels} = {money(remainderAmount / Math.max(1, totalParts))} per part</p>{rows.map((row) => <div className="grid grid-cols-1 items-start gap-1.5 border-b border-amber-200/70 pb-3 text-sm last:border-0 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-3" key={`${row.key}-parts`}><span className="min-w-0 break-words font-semibold">{row.label} × {row.count}</span><strong className="break-words leading-5 sm:max-w-[62%] sm:text-right">{asabahPartsFor(row, rows)} {labels} × {money(remainderAmount / Math.max(1, totalParts))} = {money(row.amount)}</strong></div>)}<p className="border-t border-amber-200 pt-2 text-xs font-extrabold text-amber-950">{totalParts} {labels} = {money(remainderAmount)}</p></div>;
}

function CaseSummary({ result, t }: { result: CalculationResult; t: { caseTitle: string; awl: string; radd: string; asabah: string; excluded: string; noExcluded: string } }) {
  const hasRadd = result.allocations.some((allocation) => allocation.method === "redistribution");
  const hasAsabah = result.allocations.some((allocation) => allocation.method === "remainder");
  const status = result.fixedSharesAdjusted ? t.awl : hasRadd ? t.radd : hasAsabah ? t.asabah : null;
  return <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
    <h3 className="font-extrabold text-slate-900">{t.caseTitle}</h3>
    {status ? <p className="mt-3 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-extrabold text-[#133D76]">{status}</p> : null}
    <div className="mt-3 border-t border-slate-200 pt-3">
      <p className="text-sm font-extrabold text-rose-800">{t.excluded}</p>
      {result.exclusions.length ? <div className="mt-2 space-y-2">{result.exclusions.map((item) => <div key={`${item.key ?? item.label}-${item.label}`} className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm"><p className="font-extrabold text-rose-900">{item.label}</p><p className="mt-1 leading-5 text-rose-800">{item.reason}</p></div>)}</div> : <p className="mt-2 text-sm text-slate-500">{t.noExcluded}</p>}
    </div>
  </section>;
}

function CheckBlock({ distributed, remaining, estate, label, t }: { distributed: number; remaining: number; estate: number; label: string; t: { distributed: string; remaining: string } }) {
  return <section className="rounded-2xl bg-emerald-50 p-4"><h3 className="font-extrabold text-emerald-950">{label}</h3><div className="mt-2 space-y-1 text-sm"><p>{t.distributed}: <strong>{money(distributed)}</strong></p>{remaining > 0.005 ? <p>{t.remaining}: <strong>{money(remaining)}</strong></p> : null}<p className="border-t border-emerald-200 pt-2 font-extrabold">{money(distributed + remaining)} = {money(estate)}</p></div></section>;
}

export default CalculationTrace;
