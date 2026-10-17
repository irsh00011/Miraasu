/**
 * Simple result — one bordered heir card per shareholder.
 * Fixed-share heirs show name, share chips (percent + LCM units) and amount.
 * Taʿṣīb (remainder) heirs show name and amount only — no parts, units or
 * generated fractions in the simple result (those live in the detailed view).
 * Frontend only: reads the already-computed result, never recalculates.
 */
import {
  aggregateAllocationsForDisplay,
  fractionToNumber,
  sourcePercentage,
  type CalculationResult,
} from "@/lib/inheritance";
import { AnimatedMoney } from "@/components/calc/AnimatedMoney";
import type { ReactNode } from "react";

export type ShareTableLang = "ta" | "en" | "ar" | "ur";

export type ShareTableRow = {
  key: string;
  name: string;
  count: number;
  percent: string;
  lcm: string;
  amount: number;
  /** True for Taʿṣīb (remainder-method) heirs — simple result shows name + amount only. */
  isAsabah: boolean;
};

/** Display-only: trims runaway decimals (e.g. 14.583333333333334%) to 2 places. Values unchanged. */
const formatPercent = (text: string): string => {
  const match = text.match(/^([\d.]+)%$/);
  if (!match) return text;
  const value = parseFloat(match[1]);
  if (!Number.isFinite(value)) return text;
  return `${parseFloat(value.toFixed(2))}%`;
};

/** Builds one table row per heir: name, percent share, LCM units and amount. */
export function buildShareTableRows(
  result: CalculationResult,
  nameFor: (itemKey: string, fallbackLabel: string) => string,
  partsWord: (count: number) => string,
): ShareTableRow[] {
  const display = aggregateAllocationsForDisplay(result.allocations);
  const lcmByKey = new Map(result.trace.rows.map((row) => [row.key, row]));
  const baseLcm = result.trace.baseLcm;
  return display.map((item) => {
    const traceRow = lcmByKey.get(item.key);
    let lcm = "—";
    if (traceRow) {
      lcm =
        traceRow.method === "remainder"
          ? `${traceRow.integerShares} ${partsWord(traceRow.integerShares)}`
          : `${traceRow.integerShares}/${baseLcm}`;
    }
    return {
      key: `${item.key}-${item.method}`,
      name: nameFor(item.key, item.label),
      count: item.count,
      percent: formatPercent(sourcePercentage(item.share)),
      lcm,
      amount: result.netEstate * fractionToNumber(item.share),
      isAsabah: item.method === "remainder",
    };
  });
}

const listLabel: Record<ShareTableLang, string> = {
  en: "Share distribution",
  ta: "பங்கு விநியோகம்",
  ar: "توزيع الحصص",
  ur: "حصوں کی تقسیم",
};

type Props = {
  language: ShareTableLang;
  rows: ShareTableRow[];
  money: (value: number) => string;
  empty?: ReactNode;
};

export function ShareTable({ language, rows, money, empty }: Props) {
  if (rows.length === 0) return <>{empty ?? null}</>;
  return (
    <section dir={language === "ar" || language === "ur" ? "rtl" : "ltr"} aria-label={listLabel[language]}>
      <ul className="pb-heir-list">
        {rows.map((row, index) => (
          <li key={row.key} className="pb-heir-card">
            <div className="pb-heir-main">
              <p className="pb-heir-name">
                {row.name}
                {row.count > 1 ? <span className="pb-count-chip num">×{row.count}</span> : null}
              </p>
              {row.isAsabah ? null : (
                <p className="pb-heir-share">
                  <span className="pb-mini-chip num">{row.percent}</span>
                  <span className="pb-mini-chip num">{row.lcm}</span>
                </p>
              )}
            </div>
            <p className="pb-heir-amount num">
              <AnimatedMoney value={row.amount} money={money} delay={index * 70} />
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
