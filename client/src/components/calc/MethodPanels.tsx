/**
 * Result method panels — the two calculation views side by side:
 *   1. "Percentage method" — per-heir share cards with %, fraction and amount.
 *   2. "LCM method"        — compact per-heir unit breakdown against the root LCM.
 * Frontend only: reads the already-computed result, never recalculates.
 */
import { fractionToText, type CalculationResult } from "@/lib/inheritance";
import { AnimatedMoney } from "@/components/calc/AnimatedMoney";

export type MethodLang = "ta" | "en" | "ar" | "ur";

export const methodCopy: Record<
  MethodLang,
  { percentageTitle: string; lcmTitle: string; rootLcm: string; units: string; parts: string; noRows: string; auditTitle: string }
> = {
  en: {
    percentageTitle: "Percentage method",
    lcmTitle: "LCM method",
    rootLcm: "Root LCM",
    units: "units",
    parts: "parts",
    noRows: "No allocated heirs in this case.",
    auditTitle: "Full calculation audit",
  },
  ta: {
    percentageTitle: "சதவீத முறை",
    lcmTitle: "LCM முறை",
    rootLcm: "அடிப்படை LCM",
    units: "அலகுகள்",
    parts: "பங்குகள்",
    noRows: "பங்கு பெறும் வாரிசுகள் இல்லை.",
    auditTitle: "முழு கணக்குத் தணிக்கை",
  },
  ar: {
    percentageTitle: "طريقة النسبة المئوية",
    lcmTitle: "طريقة المضاعف المشترك",
    rootLcm: "أصل المسألة",
    units: "وحدات",
    parts: "أسهم",
    noRows: "لا يوجد ورثة مستحقون في هذه الحالة.",
    auditTitle: "التدقيق الكامل للحساب",
  },
  ur: {
    percentageTitle: "فیصدی طریقہ",
    lcmTitle: "LCM طریقہ",
    rootLcm: "اصل مسئلہ",
    units: "یونٹ",
    parts: "حصے",
    noRows: "اس صورت میں کوئی حقدار وارث نہیں۔",
    auditTitle: "مکمل حساب کی تدقیق",
  },
};

type LcmPanelProps = {
  language: MethodLang;
  result: CalculationResult;
  heirLabels?: Record<string, string>;
  money: (value: number) => string;
};

/** Compact LCM view: each heir's integer units against the root LCM, with fraction and amount. */
export function LcmMethodPanel({ language, result, heirLabels, money }: LcmPanelProps) {
  const t = methodCopy[language];
  const rows = result.trace.rows;
  const baseLcm = result.trace.baseLcm;
  return (
    <>
      <div className="ms-method-head">
        <h3>{t.lcmTitle}</h3>
        <span className="ms-lcm-badge num">
          {t.rootLcm}: {baseLcm}
        </span>
      </div>
      {rows.length > 0 ? (
        <ul className="space-y-2">
          {rows.map((row, index) => {
            const name = heirLabels?.[row.key] ?? row.label;
            const basis =
              row.method === "remainder"
                ? `${row.integerShares} ${t.parts}`
                : `${row.integerShares} / ${baseLcm} ${t.units}`;
            return (
              <li key={`${row.key}-${row.method}`} className="ms-lcm-row">
                <div className="min-w-0">
                  <p className="ms-lcm-name">
                    {name}
                    {row.count > 1 ? <span className="num"> ×{row.count}</span> : null}
                  </p>
                  <p className="ms-lcm-basis num">{basis}</p>
                </div>
                <div className="ms-lcm-amount">
                  <p className="ms-lcm-fraction num">{fractionToText(row.fraction)}</p>
                  <p className="num"><AnimatedMoney value={row.amount} money={money} delay={200 + index * 70} /></p>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">{t.noRows}</p>
      )}
    </>
  );
}
