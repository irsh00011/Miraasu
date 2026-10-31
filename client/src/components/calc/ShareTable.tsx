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
import { Minus, Plus } from "lucide-react";
import type { ReactNode } from "react";

export type ShareTableLang = "ta" | "en" | "ar" | "ur";

export type ShareTableRow = {
  key: string;
  baseKey: string;
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
      baseKey: item.key,
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

/** Count cap for a result card, mirroring the family screen: single heirs
 *  (max 1) get a direct tap only, countable heirs get a stepper. Wives cap
 *  at 4; every other countable heir caps at 20, as on the family screen. */
export function resultCardMaxFor(baseKey: string): number {
  if (baseKey === "husband" || baseKey === "father" || baseKey === "mother" || baseKey === "paternalGrandfather") return 1;
  if (baseKey === "wives") return 4;
  return 20;
}

type Props = {
  language: ShareTableLang;
  rows: ShareTableRow[];
  money: (value: number) => string;
  empty?: ReactNode;
  /** Blue-highlighted cards, by heir key. Tapping a card toggles it. */
  selected?: ReadonlySet<string>;
  onSelect?: (baseKey: string) => void;
  /** Count change from a card's stepper; the page recomputes the result. */
  onStep?: (baseKey: string, delta: number) => void;
};

export function ShareTable({ language, rows, money, empty, selected, onSelect, onStep }: Props) {
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
        {rows.map((row, index) => {
          const isSelected = selected?.has(row.baseKey) ?? false;
          const max = resultCardMaxFor(row.baseKey);
          return (
            <li
              key={row.key}
              className={`ms-share-trow${isSelected ? " is-selected" : ""}`}
              onClick={() => onSelect?.(row.baseKey)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelect?.(row.baseKey);
                }
              }}
              tabIndex={0}
              role="button"
              aria-pressed={isSelected}
            >
              <span className="ms-share-cname">
                {row.name}
                {row.count > 1 ? <span className="ms-tag ms-tag-count num">×{row.count}</span> : null}
              </span>
              <span className="ms-share-cchips">
                <span className="ms-mini-chip num">{row.percent}</span>
                <span className="ms-mini-chip num">{row.lcm}</span>
                {max !== 1 ? (
                  <span className="ms-share-stepper" onClick={(event) => event.stopPropagation()} onKeyDown={(event) => event.stopPropagation()}>
                    <button type="button" className="ms-share-stepbtn" disabled={row.count <= 0} onClick={() => onStep?.(row.baseKey, -1)} aria-label={`${row.name} decrease`}><Minus size={14} /></button>
                    <output className="ms-share-stepval num">{row.count}</output>
                    <button type="button" className="ms-share-stepbtn" disabled={row.count >= max} onClick={() => onStep?.(row.baseKey, 1)} aria-label={`${row.name} increase`}><Plus size={14} /></button>
                  </span>
                ) : null}
              </span>
              <span className="ms-share-camount num">
                <AnimatedMoney value={row.amount} money={money} delay={index * 70} />
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
