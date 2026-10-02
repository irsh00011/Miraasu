/** Design: Miraasu Scholarly Ledger — teacher-review audit: metric strip, schedule, fixed/remainder work, reconciliation, notes, trace. */
import { fractionToNumber, fractionToText, type AppLanguage, type CalculationResult } from "@/lib/inheritance";

type Props = { result: CalculationResult; language?: AppLanguage | "ur"; heirLabels?: Record<string, string> };

const copy = {
  en: {
    title: "Teacher review · Calculation audit",
    subtitle: "Follow the shares, unit conversion, remainder, and final reconciliation.",
    netEstate: "Distributable estate",
    fixedTotal: "Fixed-share total",
    remainder: "Remainder",
    root: "Root LCM",
    schedule: "Allocation schedule",
    scheduleNote: "Group amount is for the listed relatives together; per-person amount is shown separately.",
    heir: "Heir",
    count: "People",
    method: "Method",
    groupShare: "Group share",
    sharePercent: "Estate %",
    basis: "Units / parts",
    groupAmount: "Group amount",
    perPerson: "Per person",
    perPart: "Per part",
    fixedUnits: "fixed units",
    parts: "parts",
    noRows: "No allocated heirs in this case.",
    fixedWork: "Fixed-share calculation",
    fixedUnitsSum: "Fixed units total",
    fixedAmount: "Fixed-share amount",
    remainderWork: "Remainder calculation",
    rule: "Allocation rule",
    asabahRule: "Where applicable: male = 2 parts, female = 1 part.",
    raddRule: "No Asabah recipient: the remainder is returned to eligible fixed-share heirs.",
    returned: "Returned remainder",
    heldBackNote: "No automatic recipient is shown; this amount remains held for review.",
    noRemainder: "No remainder is available in this case.",
    reconciliation: "Final reconciliation",
    unitCheck: "Units",
    amountCheck: "Money",
    distributed: "Distributed",
    heldBack: "Held back",
    net: "Estate total",
    pass: "Balances",
    fail: "Needs review",
    caseNotes: "Case notes",
    excluded: "Excluded / not receiving a share",
    noExcluded: "None",
    reviewRequired: "Scholar review required for this case.",
    trace: "Full calculation trace",
    traceNote: "Engine-generated working notes · source text in English",
    step: "Step",
  },
  ta: {
    title: "ஆசிரியர் சரிபார்ப்பு · கணக்குத் தணிக்கை",
    subtitle: "பங்குகள், அலகு மாற்றம், மீதி, இறுதிச் சரிபார்ப்பு ஆகியவற்றைப் பார்க்கவும்.",
    netEstate: "பகிரக்கூடிய சொத்து",
    fixedTotal: "நிர்ணயப் பங்குகளின் மொத்தம்",
    remainder: "மீதிப் பங்கு",
    root: "அடிப்படை LCM",
    schedule: "பங்கீட்டு அட்டவணை",
    scheduleNote: "குழுத் தொகை என்பது அந்த உறவினர் குழுவின் மொத்தம்; ஒருவருக்கான தொகை தனியாகக் காட்டப்பட்டுள்ளது.",
    heir: "வாரிசு",
    count: "நபர்கள்",
    method: "முறை",
    groupShare: "குழுப் பங்கு",
    sharePercent: "சொத்து %",
    basis: "அலகுகள் / பங்குகள்",
    groupAmount: "குழுத் தொகை",
    perPerson: "ஒருவருக்கு",
    perPart: "ஒரு பங்குக்கு",
    fixedUnits: "நிர்ணய அலகுகள்",
    parts: "பங்குகள்",
    noRows: "இந்த நிலையில் பங்கு பெறும் வாரிசுகள் இல்லை.",
    fixedWork: "நிர்ணயப் பங்குக் கணக்கு",
    fixedUnitsSum: "நிர்ணய அலகுகளின் மொத்தம்",
    fixedAmount: "நிர்ணயப் பங்குத் தொகை",
    remainderWork: "மீதிக் கணக்கு",
    rule: "பங்கீட்டு விதி",
    asabahRule: "பொருந்தும் இடத்தில்: ஆண் = 2 பங்குகள்; பெண் = 1 பங்கு.",
    raddRule: "அஸபா பெறுநர் இல்லை: மீதி தகுதியான நிர்ணயப் பங்கு வாரிசுகளுக்குத் திருப்பப்படுகிறது.",
    returned: "திருப்பிய மீதித் தொகை",
    heldBackNote: "தானியங்கி பெறுநர் காட்டப்படவில்லை; இந்தத் தொகை மறுஆய்வுக்காக நிறுத்தப்பட்டுள்ளது.",
    noRemainder: "இந்த நிலையில் மீதி இல்லை.",
    reconciliation: "இறுதிச் சரிபார்ப்பு",
    unitCheck: "அலகுகள்",
    amountCheck: "தொகை",
    distributed: "பகிரப்பட்டது",
    heldBack: "நிறுத்தி வைக்கப்பட்டது",
    net: "சொத்து மொத்தம்",
    pass: "சரியாகப் பொருந்துகிறது",
    fail: "மறுஆய்வு தேவை",
    caseNotes: "வழக்கு குறிப்புகள்",
    excluded: "பங்கு பெறாதவர்கள் / விலக்கப்பட்டவர்கள்",
    noExcluded: "யாரும் இல்லை",
    reviewRequired: "இந்த நிலைக்கு அறிஞர் மறுஆய்வு தேவை.",
    trace: "முழுக் கணக்கீட்டுத் தடம்",
    traceNote: "கணக்கீட்டு இயந்திரம் உருவாக்கிய படிப்படியான குறிப்புகள் · மூல உரை ஆங்கிலத்தில்",
    step: "படி",
  },
  ar: {
    title: "مراجعة المعلم · تدقيق الحساب",    subtitle: "راجع الأنصبة وتحويل الوحدات والباقي ومطابقة المجموع النهائي.",
    netEstate: "التركة القابلة للقسمة",
    fixedTotal: "مجموع الأنصبة المفروضة",
    remainder: "الباقي",
    root: "أصل المسألة (LCM)",
    schedule: "جدول التوزيع",
    scheduleNote: "مبلغ المجموعة هو مجموع نصيب أفراد القرابة؛ ويُعرض نصيب الفرد منفصلاً.",
    heir: "الوارث",
    count: "الأشخاص",
    method: "الطريقة",
    groupShare: "نصيب المجموعة",
    sharePercent: "٪ من التركة",
    basis: "الوحدات / الأسهم",
    groupAmount: "مبلغ المجموعة",
    perPerson: "لكل شخص",
    perPart: "لكل سهم",
    fixedUnits: "وحدات مفروضة",
    parts: "أسهم",
    noRows: "لا يوجد ورثة مستحقون في هذه الحالة.",
    fixedWork: "حساب الأنصبة المفروضة",
    fixedUnitsSum: "مجموع الوحدات المفروضة",
    fixedAmount: "مبلغ الأنصبة المفروضة",
    remainderWork: "حساب الباقي",
    rule: "قاعدة التوزيع",
    asabahRule: "عند انطباقها: للذكر سهمان وللأنثى سهم واحد.",
    raddRule: "لا يوجد مستحق للعصبة: يُرد الباقي إلى أصحاب الأنصبة المفروضة المؤهلين.",
    returned: "الباقي المردود",
    heldBackNote: "لا يُعرض مستحق تلقائي؛ يبقى هذا المبلغ موقوفاً للمراجعة.",
    noRemainder: "لا يوجد باقي في هذه الحالة.",
    reconciliation: "المطابقة النهائية",
    unitCheck: "الوحدات",
    amountCheck: "المبالغ",
    distributed: "الموزع",
    heldBack: "المحتفظ به",
    net: "مجموع التركة",
    pass: "متطابق",
    fail: "يحتاج إلى مراجعة",
    caseNotes: "ملاحظات الحالة",
    excluded: "المحجوبون / غير المستحقين لنصيب",
    noExcluded: "لا أحد",
    reviewRequired: "تتطلب هذه الحالة مراجعة مختص في المواريث.",
    trace: "سجل الحساب الكامل",
    traceNote: "خطوات أنشأها محرك الحساب · النص الأصلي باللغة الإنجليزية",
    step: "الخطوة",
  },
  ur: {
    title: "استاد کا جائزہ · حساب کی تدقیق",
    subtitle: "حصے، یونٹ کی تبدیلی، باقی اور حتمی ملاپ دیکھیں۔",
    netEstate: "قابلِ تقسیم ترکہ",
    fixedTotal: "مقررہ حصوں کا مجموعہ",
    remainder: "باقی حصہ",
    root: "اصل مسئلہ (LCM)",
    schedule: "تقسیم کا شیڈول",
    scheduleNote: "گروپ کی رقم درج رشتہ داروں کا مجموعہ ہے؛ فی فرد رقم الگ دکھائی گئی ہے۔",
    heir: "وارث",
    count: "افراد",
    method: "طریقہ",
    groupShare: "گروپ کا حصہ",
    sharePercent: "ترکہ کا ٪",
    basis: "یونٹ / حصے",
    groupAmount: "گروپ کی رقم",
    perPerson: "فی فرد",
    perPart: "فی حصہ",
    fixedUnits: "مقررہ یونٹ",
    parts: "حصے",
    noRows: "اس صورت میں حصہ پانے والا کوئی وارث نہیں۔",
    fixedWork: "مقررہ حصوں کا حساب",
    fixedUnitsSum: "مقررہ یونٹوں کا مجموعہ",
    fixedAmount: "مقررہ حصوں کی رقم",
    remainderWork: "باقی کا حساب",
    rule: "تقسیم کا قاعدہ",
    asabahRule: "جہاں لاگو ہو: مرد = 2 حصے، عورت = 1 حصہ۔",
    raddRule: "عصبہ کا کوئی مستحق نہیں: باقی اہل مقررہ حصہ وارثوں کو لوٹا دیا جاتا ہے۔",
    returned: "لوٹائی گئی باقی رقم",
    heldBackNote: "کوئی خودکار مستحق نہیں دکھایا گیا؛ یہ رقم جائزے کے لیے روکی گئی ہے۔",
    noRemainder: "اس صورت میں کوئی باقی نہیں۔",
    reconciliation: "حتمی ملاپ",
    unitCheck: "یونٹ",
    amountCheck: "رقم",
    distributed: "تقسیم شدہ",
    heldBack: "روکی گئی",
    net: "ترکہ کا مجموعہ",
    pass: "مطابق",
    fail: "جائزہ درکار",
    caseNotes: "کیس کے نوٹس",
    excluded: "محجوب / بے حصہ افراد",
    noExcluded: "کوئی نہیں",
    reviewRequired: "اس کیس کے لیے میراث کے مستند عالم کا جائزہ ضروری ہے۔",
    trace: "مکمل حساب کا ریکارڈ",
    traceNote: "حساب کے انجن کے بنائے ہوئے مراحل · اصل متن انگریزی میں",
    step: "مرحلہ",
  },
} as const;

const money = (value: number) => (Number.isFinite(value) ? value : 0).toFixed(2);
const nameFor = (key: string, fallback: string, labels?: Record<string, string>) => labels?.[key] ?? fallback;

export function CalculationTrace({ result, language = "en", heirLabels }: Props) {
  const t = copy[language];
  const { trace } = result;
  const fixedRows = trace.rows.filter((row) => row.method === "fixed");
  const remainderRows = trace.rows.filter((row) => row.method === "remainder");
  const redistributionRows = trace.rows.filter((row) => row.method === "redistribution");
  const fixedUnits = fixedRows.reduce((total, row) => total + row.integerShares, 0);
  const totalRemainderParts = remainderRows.reduce((total, row) => total + row.integerShares, 0);
  const fixedAmount = result.netEstate * fractionToNumber(trace.fixedShareTotal);
  const remainderAmount = result.netEstate * fractionToNumber(trace.remainder);
  const check = trace.integrityCheck;
  const finalUnits = trace.steps.find((item) => item.id === "final-units")?.data;
  const fixedUnitsReported = Number(finalUnits?.fixedDisplayedUnits ?? fixedUnits);
  const remainderUnitsReported = Number(finalUnits?.remainingUnits ?? 0);
  const totalUnitsReported = Number(finalUnits?.totalUnits ?? check.totalUnits);
  const unitsPass = check.unitsBalanced && check.totalUnits === fixedUnitsReported + remainderUnitsReported;
  const moneyPass = check.moneyBalanced && Math.abs(check.distributedMoney + check.heldBackMoney - check.netEstate) < 0.01;

  return (
    <div className="ms-trace" dir={language === "ar" || language === "ur" ? "rtl" : "ltr"}>
      <header className="ms-card p-4 sm:p-5">
        <p className="ms-kicker">{t.title}</p>
        {result.requiresScholarReview ? <p className="ms-notice mt-3 font-extrabold!">{t.reviewRequired}</p> : null}
      </header>

      <section aria-label={t.title} className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Metric label={t.netEstate} value={money(trace.distributableEstate)} strong />
        <Metric label={t.fixedTotal} value={`${fractionToText(trace.fixedShareTotal)} · ${money(fixedAmount)}`} />
        <Metric label={t.remainder} value={`${fractionToText(trace.remainder)} · ${money(remainderAmount)}`} />
        <Metric label={t.root} value={String(trace.baseLcm)} />
      </section>

      <section className="ms-trace-card" aria-labelledby="audit-schedule-heading">
        <div className="ms-trace-head">
          <h3 id="audit-schedule-heading">{t.schedule}</h3>
        </div>
        <div className="ms-trace-body">
          <div className="grid gap-2 pt-2 sm:grid-cols-2" role="list">
            {trace.rows.length ? trace.rows.map((row) => (
              <article key={`${row.key}-${row.method}`} role="listitem" className="ms-audit-row premium-pop">
                <div className="min-w-0">
                  <h4 className="ms-audit-name break-words">{nameFor(row.key, row.label, heirLabels)}</h4>
                  <p className="ms-audit-share">
                    <span className="ms-hl-yellow num">{fractionToText(row.fraction)}</span>
                    <span className="ms-hl-yellow num">{row.percentage.toFixed(2)}%</span>
                    <span className="num">×{row.count}</span>
                  </p>
                </div>
                <div className="ms-audit-amount">
                  <p className="ms-hl-green num">{money(row.amount)}</p>
                  <p className="ms-audit-each">{t.perPerson} <span className="num">{money(row.amount / Math.max(1, row.count))}</span></p>
                </div>
              </article>
            )) : <p className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">{t.noRows}</p>}
          </div>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2">
        <section className="ms-trace-card">
          <div className="ms-trace-head"><h3>{t.fixedWork}</h3></div>
          <div className="ms-trace-body">
            <p className="ms-trace-formula num mt-2">
              {fractionToText(trace.fixedShareTotal)} × {money(result.netEstate)} = {money(fixedAmount)}
            </p>
            <p className="mt-2 text-xs text-slate-600">{t.fixedUnitsSum}: <strong className="num text-slate-900">{fixedUnits}</strong> / <strong className="num text-slate-900">{trace.baseLcm}</strong> · {t.fixedAmount}: <strong className="num text-slate-900">{money(fixedAmount)}</strong></p>
          </div>
        </section>

        <section className="ms-trace-card border-[rgba(184,137,45,0.4)]">
          <div className="ms-trace-head bg-[#fdf6e3]!"><h3 className="text-[#7c5a1c]!">{t.remainderWork}</h3></div>
          <div className="ms-trace-body">
            <p className="ms-trace-formula ms-trace-formula-gold num mt-2">
              {money(result.netEstate)} × {fractionToText(trace.remainder)} = {money(remainderAmount)}
            </p>
            {remainderRows.length ? (
              <div className="mt-3 space-y-2">
                <p className="text-xs font-extrabold text-[#7c5a1c]">{t.rule}: {totalRemainderParts} {t.parts}</p>
                {remainderRows.map((row) => (
                  <p key={`remainder-${row.key}`} className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-t border-[rgba(184,137,45,0.3)] pt-2 text-xs text-[#7c5a1c]">
                    <span className="font-bold">{nameFor(row.key, row.label, heirLabels)} × {row.count} · {row.integerShares} {t.parts}</span>
                    <strong className="num">{t.perPart}: {money(row.amount / Math.max(1, totalRemainderParts))} · {t.groupAmount}: {money(row.amount)}</strong>
                  </p>
                ))}
              </div>
            ) : redistributionRows.length ? (
              <div className="mt-3 space-y-2">
                {redistributionRows.map((row) => (
                  <p key={`returned-${row.key}`} className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-t border-[rgba(184,137,45,0.3)] pt-2 text-xs text-[#7c5a1c]">
                    <span className="font-bold">{nameFor(row.key, row.label, heirLabels)} × {row.count} · {t.returned}</span>
                    <strong className="num">{t.perPerson}: {money(row.amount / Math.max(1, row.count))} · {t.returned}: {money(row.amount)}</strong>
                  </p>
                ))}
              </div>
            ) : check.heldBackMoney > 0.005 ? (
              <p className="ms-notice mt-3 font-bold!">{t.heldBackNote} · {money(check.heldBackMoney)}</p>
            ) : <p className="mt-3 text-xs text-[#7c5a1c]">{t.noRemainder}</p>}
          </div>
        </section>
      </div>

      <section className="ms-trace-card border-[rgba(22,120,80,0.3)]" aria-labelledby="reconciliation-heading">
        <div className="ms-trace-head bg-[#f0faf4]!">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 id="reconciliation-heading" className="text-[#14532d]!">{t.reconciliation}</h3>
            <span className={`rounded-full px-2.5 py-1 text-xs font-extrabold ${unitsPass && moneyPass ? "bg-white text-emerald-800 ring-1 ring-emerald-200" : "bg-rose-100 text-rose-800 ring-1 ring-rose-200"}`}>
              {unitsPass && moneyPass ? t.pass : t.fail}
            </span>
          </div>
        </div>
        <div className="ms-trace-body">
          <div className="grid gap-2 pt-2 sm:grid-cols-2">
            <div className="ms-trace-check">
              <p className="text-xs font-bold text-emerald-800">{t.unitCheck}</p>
              <p className="num mt-1 break-words text-sm font-extrabold text-emerald-950">{fixedUnitsReported} + {remainderUnitsReported} = {totalUnitsReported}</p>
              <p className="mt-1 text-xs text-emerald-800">{unitsPass ? t.pass : t.fail}</p>
            </div>
            <div className="ms-trace-check">
              <p className="text-xs font-bold text-emerald-800">{t.amountCheck}</p>
              <p className="num mt-1 break-words text-sm font-extrabold text-emerald-950">{money(check.distributedMoney)} + {money(check.heldBackMoney)} = {money(check.netEstate)}</p>
              <p className="mt-1 text-xs text-emerald-800">{t.distributed}: {money(check.distributedMoney)} · {t.heldBack}: {money(check.heldBackMoney)}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="ms-trace-card" aria-labelledby="case-notes-heading">
        <div className="ms-trace-head"><h3 id="case-notes-heading">{t.caseNotes}</h3></div>
        <div className="ms-trace-body">
          <p className="mt-2.5 text-xs font-extrabold text-rose-800">{t.excluded}</p>
          {result.exclusions.length ? (
            <div className="mt-2 grid gap-2 sm:grid-cols-2">{result.exclusions.map((item) => (
              <article key={`${item.key ?? item.label}-${item.label}`} className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs">
                <p className="font-extrabold text-rose-900">{nameFor(item.key ?? "", item.label, heirLabels)}</p>
                <p className="mt-1 leading-5 text-rose-800">{item.reason}</p>
              </article>
            ))}</div>
          ) : <p className="mt-1 text-xs text-slate-500">{t.noExcluded}</p>}
        </div>
      </section>

      <details className="ms-trace-card">
        <summary className="ms-trace-head cursor-pointer list-inside">
          <span className="text-sm font-extrabold text-slate-950">{t.trace}</span> <span className="text-xs font-semibold text-slate-500">· {trace.steps.length} {t.step}</span>
        </summary>
        <div className="ms-trace-body">
          <ol className="grid gap-2.5 pt-2.5">
            {trace.steps.map((step, index) => (
              <li key={`${step.id}-${index}`} className="rounded-xl border border-[rgba(22,79,134,0.12)] bg-slate-50 p-3">
                <p className="text-xs font-extrabold text-[#164f86]">{t.step} {index + 1} · {step.title}</p>
                <p className="mt-1.5 break-words text-xs leading-5 text-slate-700">{step.detail}</p>
              </li>
            ))}
          </ol>
        </div>
      </details>
    </div>
  );
}

function Metric({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`min-w-0 rounded-2xl border p-3 ${strong ? "border-[rgba(22,79,134,0.3)] bg-[#eaf2fb]" : "border-[rgba(22,79,134,0.12)] bg-white"}`}>
      <p className="text-[11px] font-bold leading-4 text-slate-500">{label}</p>
      <p className="num mt-1 break-words text-sm font-extrabold leading-5 text-[#164f86]">{value}</p>
    </div>
  );
}

function Value({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="min-w-0 rounded-lg bg-slate-50 px-2.5 py-2">
      <p className="text-[10px] font-bold leading-4 text-slate-500">{label}</p>
      <p className={`num mt-0.5 break-words text-xs ${strong ? "font-extrabold text-[#164f86]" : "font-bold text-slate-900"}`}>{value}</p>
    </div>
  );
}

export default CalculationTrace;
