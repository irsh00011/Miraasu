/**
 * Unified result table — one row per shareholder: name, percent, LCM and amount.
 * Replaces the separate percentage / LCM panels with a single responsive table:
 * a real column grid on PC, compact stacked cards on mobile.
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
    };
  });
}

const headerCopy: Record<
  ShareTableLang,
  { heir: string; share: string; amount: string; tableLabel: string }
> = {
  en: { heir: "Heir", share: "Share", amount: "Amount", tableLabel: "Share distribution" },
  ta: { heir: "வாரிசு", share: "பங்கு", amount: "தொகை", tableLabel: "பங்கு விநியோகம்" },
  ar: { heir: "الوارث", share: "الحصة", amount: "المبلغ", tableLabel: "توزيع الحصص" },
  ur: { heir: "وارث", share: "حصہ", amount: "رقم", tableLabel: "حصوں کی تقسیم" },
};

type Props = {
  language: ShareTableLang;
  rows: ShareTableRow[];
  money: (value: number) => string;
  empty?: ReactNode;
};

export function ShareTable({ language, rows, money, empty }: Props) {
  const t = headerCopy[language];
  if (rows.length === 0) return <>{empty ?? null}</>;
  return (
    <section
      className="ms-share-table"
      dir={language === "ar" || language === "ur" ? "rtl" : "ltr"}
      aria-label={t.tableLabel}
    >
      <div className="ms-share-thead">
        <span>{t.heir}</span>
        <span>{t.share}</span>
        <span className="ms-share-thnum">{t.amount}</span>
      </div>
      <ul className="ms-share-tbody">
        {rows.map((row, index) => (
          <li key={row.key} className="ms-share-trow">
            <span className="ms-share-cname">
              {row.name}
              {row.count > 1 ? <span className="ms-tag ms-tag-count num">×{row.count}</span> : null}
            </span>
            <span className="ms-share-cchips">
              <span className="ms-mini-chip num">{row.percent}</span>
              <span className="ms-mini-chip num">{row.lcm}</span>
            </span>
            <span className="ms-share-camount num">
              <AnimatedMoney value={row.amount} money={money} delay={index * 70} />
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
