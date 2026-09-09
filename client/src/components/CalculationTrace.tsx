import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { ASABAH_RULE_TEXT, asabahPartsFor, fractionToNumber, fractionToText, type AppLanguage, type CalculationResult } from "@/lib/inheritance";

type Props = { result: CalculationResult; language?: AppLanguage };
type Method = "lcm" | "percentage";

const copy = {
  en: {
    teacher: "Teacher / explicit sum view",
    show: "Show calculation methods",
    hide: "Hide calculation methods",
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
    male: "male",
    female: "female",
  },
  ta: {
    teacher: "ஆசிரியர் / விரிவான கணக்கு",
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
    male: "ஆண்",
    female: "பெண்",
  },
  ar: {
    teacher: "عرض المدرّس / المجموع الصريح",
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
    male: "ذكر",
    female: "أنثى",
  },
} as const;

const money = (value: number) => value.toFixed(2);

export function CalculationTrace({ result, language = "en" }: Props) {
  const [open, setOpen] = useState(false);
  const [method, setMethod] = useState<Method>("lcm");
  const t = copy[language];
  const fixedRows = result.trace.rows.filter((row) => row.method === "fixed");
  const asabahRows = result.trace.rows.filter((row) => row.method === "remainder");
  const hasMixed = asabahRows.some((row) => row.key && row.method === "remainder" && row.integerShares > 1 && row.count > 0) && asabahRows.some((row) => row.integerShares === 1);
  const remainderAmount = Math.max(0, result.netEstate * fractionToNumber(result.trace.remainder));
  const distributedAmount = result.trace.rows.reduce((total, row) => total + row.amount, 0);
  const remainingAmount = Math.max(0, result.netEstate - distributedAmount);
  const fixedUnitTotal = fixedRows.reduce((total, row) => total + row.integerShares, 0);
  const totalParts = asabahRows.reduce((total, row) => total + asabahPartsFor(row, asabahRows), 0);
  const ratioText = hasMixed ? "male = 2 : female = 1" : "one equal part per member";

  const panel = method === "lcm" ? (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Info label={t.estate} value={money(result.netEstate)} />
        <Info label={t.lcmValue} value={String(result.trace.baseLcm)} prominent />
      </div>
      <section className="rounded-2xl border border-slate-200 p-4">
        <h3 className="font-extrabold text-slate-900">{t.fixed}</h3>
        <div className="mt-3 space-y-2 text-sm">
          {fixedRows.length ? fixedRows.map((row) => <div className="flex justify-between gap-4" key={`${row.key}-lcm`}><span>{row.label} × {row.count}</span><strong>{fractionToText(row.fraction)} → {row.integerShares} {t.fixedUnits.toLowerCase()}</strong></div>) : <span className="text-slate-500">—</span>}
        </div>
        <p className="mt-3 border-t border-slate-100 pt-3 text-sm font-bold">{t.fixedTotal}: {fixedUnitTotal}</p>
      </section>
      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <h3 className="font-extrabold text-amber-950">{t.remainder}</h3>
        <p className="mt-1 text-sm">{fractionToText(result.trace.remainder)} = {money(remainderAmount)}</p>
        <p className="mt-3 text-sm font-bold">{t.ratio}: {ratioText}</p>
        {asabahRows.length ? <Parts rows={asabahRows} totalParts={totalParts} language={language} /> : <p className="mt-2 text-sm text-amber-900">{t.noRemainder}</p>}
      </section>
      <CheckBlock distributed={distributedAmount} remaining={remainingAmount} estate={result.netEstate} label={t.check} t={t} />
    </div>
  ) : (
    <div className="space-y-4">
      <Info label={t.estate} value={money(result.netEstate)} />
      <section className="rounded-2xl border border-slate-200 p-4">
        <h3 className="font-extrabold text-slate-900">{t.fixed}</h3>
        <div className="mt-3 space-y-2 text-sm">
          {fixedRows.length ? fixedRows.map((row) => <div className="flex justify-between gap-4" key={`${row.key}-percentage`}><span>{row.label} × {row.count}</span><strong>{(fractionToNumber(row.fraction) * 100).toFixed(2)}%</strong></div>) : <span className="text-slate-500">—</span>}
        </div>
        <p className="mt-3 border-t border-slate-100 pt-3 text-sm font-bold">{t.fixedTotal}: {(fractionToNumber(result.trace.fixedShareTotal) * 100).toFixed(2)}%</p>
      </section>
      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <h3 className="font-extrabold text-amber-950">{t.remainder}</h3>
        <p className="mt-1 text-sm">{(fractionToNumber(result.trace.remainder) * 100).toFixed(2)}% = {money(remainderAmount)}</p>
        <p className="mt-3 text-sm font-bold">{t.ratio}: {ratioText}</p>
        {asabahRows.length ? <Parts rows={asabahRows} totalParts={totalParts} language={language} /> : <p className="mt-2 text-sm text-amber-900">{t.noRemainder}</p>}
      </section>
      <CheckBlock distributed={distributedAmount} remaining={remainingAmount} estate={result.netEstate} label={t.check} t={t} />
    </div>
  );

  return (
    <section className="mt-5 rounded-3xl border border-blue-100 bg-white p-5 shadow-sm sm:p-7" dir={language === "ar" ? "rtl" : "ltr"}>
      <button type="button" onClick={() => setOpen((value) => !value)} className="flex min-h-12 w-full items-center justify-between gap-3 text-start">
        <span className="text-lg font-extrabold text-slate-950">{t.teacher}</span>
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
  return <div className={`rounded-2xl p-4 ${prominent ? "bg-blue-50" : "bg-slate-50"}`}><p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p><p className={`mt-1 font-extrabold ${prominent ? "text-3xl text-[#133D76]" : "text-lg text-slate-950"}`}>{value}</p></div>;
}

function Parts({ rows, totalParts, language }: { rows: CalculationResult["trace"]["rows"]; totalParts: number; language: AppLanguage }) {
  const labels = { en: "parts", ta: "பங்குகள்", ar: "أسهم" }[language];
  return <div className="mt-3 space-y-2 border-t border-amber-200 pt-3">{rows.map((row) => <div className="flex items-center justify-between gap-4 text-sm" key={`${row.key}-parts`}><span>{row.label} × {row.count}</span><strong>{asabahPartsFor(row, rows)} {labels} → {money(row.amount)}</strong></div>)}<p className="pt-1 text-xs text-amber-900">Total: {totalParts} {labels}</p></div>;
}

function CheckBlock({ distributed, remaining, estate, label, t }: { distributed: number; remaining: number; estate: number; label: string; t: { distributed: string; remaining: string } }) {
  return <section className="rounded-2xl bg-emerald-50 p-4"><h3 className="font-extrabold text-emerald-950">{label}</h3><div className="mt-2 space-y-1 text-sm"><p>{t.distributed}: <strong>{money(distributed)}</strong></p>{remaining > 0.005 ? <p>{t.remaining}: <strong>{money(remaining)}</strong></p> : null}<p className="border-t border-emerald-200 pt-2 font-extrabold">{money(distributed + remaining)} = {money(estate)}</p></div></section>;
}

export default CalculationTrace;
