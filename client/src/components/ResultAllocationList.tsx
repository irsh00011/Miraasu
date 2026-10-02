/** Design: Miraasu Scholarly Ledger — compact allocation ledger: name, share tags, amounts. */
import type { CalculationResult } from "@/lib/inheritance";
import { fractionToNumber, fractionToText } from "@/lib/inheritance";
import { UsersRound } from "lucide-react";

type ResultAllocationListProps = {
  result: CalculationResult;
  money: (value: number) => string;
  title: string;
  subtitle: string;
  empty: string;
  labels: Record<string, string>;
  reason: (method: "fixed" | "remainder" | "redistribution") => string;
};

export function ResultAllocationList({ result, money, title, subtitle, empty, labels, reason }: ResultAllocationListProps) {
  return (
    <section className="ms-card p-4 sm:p-6">
      <div className="border-b border-[rgba(22,79,134,0.1)] pb-3">
        <h2 className="ms-h2">{title}</h2>
        <p className="mt-1 text-xs leading-5 text-slate-500">{subtitle}</p>
      </div>
      {result.allocations.length === 0 ? (
        <div className="py-8 text-center">
          <UsersRound className="mx-auto text-slate-300" size={30} />
          <p className="mt-3 font-bold text-slate-700">{empty}</p>
        </div>
      ) : (
        <div className="mt-3 space-y-2">
          {result.allocations.map((item) => {
            const share = fractionToNumber(item.share);
            const amount = result.netEstate * share;
            const perPerson = item.count > 1 ? amount / item.count : null;
            return (
              <article key={item.key} className="rounded-2xl border border-[rgba(22,79,134,0.1)] bg-slate-50/70 p-3">
                <div className="grid grid-cols-[minmax(0,1fr)_auto_auto_auto] items-center gap-2 sm:gap-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-extrabold text-slate-950">{labels[item.key] ?? item.label}{item.count > 1 ? ` (${item.count})` : ""}</p>
                    <p className="mt-0.5 truncate text-[11px] text-slate-500">{reason(item.method)}</p>
                  </div>
                  <span className="ms-tag ms-tag-fraction num">{fractionToText(item.share)}</span>
                  <span className="ms-tag ms-tag-fraction num bg-[#dbe7f5]!">{(share * 100).toLocaleString("en-IN", { maximumFractionDigits: 2 })}%</span>
                  <div className="text-right">
                    <p className="num text-sm font-extrabold text-slate-950">{money(amount)}</p>
                    {perPerson !== null ? <p className="mt-0.5 text-[11px] text-slate-500">{money(perPerson)} each</p> : null}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
