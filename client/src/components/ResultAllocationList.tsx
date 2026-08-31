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
  return <section className="result-allocation-list rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"><div className="border-b border-slate-100 pb-3"><h2 className="text-lg font-extrabold text-slate-950">{title}</h2><p className="mt-1 text-xs leading-5 text-slate-500">{subtitle}</p></div>{result.allocations.length === 0 ? <div className="py-8 text-center"><UsersRound className="mx-auto text-slate-300" size={30} /><p className="mt-3 font-bold text-slate-700">{empty}</p></div> : <div className="mt-3 space-y-2">{result.allocations.map((item) => { const share = fractionToNumber(item.share); const amount = result.netEstate * share; const perPerson = item.count > 1 ? amount / item.count : null; return <article key={item.key} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3"><div className="grid grid-cols-[minmax(0,1fr)_auto_auto_auto] items-center gap-2 sm:gap-4"><div className="min-w-0"><p className="truncate text-sm font-extrabold text-slate-950">{labels[item.key] ?? item.label}{item.count > 1 ? ` (${item.count})` : ""}</p><p className="mt-0.5 truncate text-[11px] text-slate-500">{reason(item.method)}</p></div><span className="rounded-lg bg-blue-50 px-2 py-1 text-xs font-extrabold tabular-nums text-[#133D76]">{fractionToText(item.share)}</span><span className="rounded-lg bg-blue-100 px-2 py-1 text-xs font-extrabold tabular-nums text-[#133D76]">{(share * 100).toLocaleString("en-IN", { maximumFractionDigits: 2 })}%</span><div className="text-right"><p className="text-sm font-extrabold tabular-nums text-slate-950">{money(amount)}</p>{perPerson !== null ? <p className="mt-0.5 text-[11px] text-slate-500">{money(perPerson)} each</p> : null}</div></div></article>; })}</div>}</section>;
}
