import type { CalculationResult } from "@/lib/inheritance";

type CalculationLedgerProps = { result: CalculationResult; money: (value: number) => string; labels?: Partial<Record<"estate" | "lcm" | "distributed" | "remaining" | "final", string>> };

const gcd = (a: number, b: number) => { let x = Math.abs(a); let y = Math.abs(b); while (y) [x, y] = [y, x % y]; return x || 1; };
const lcm = (a: number, b: number) => Math.abs(a * b) / gcd(a, b);

export function CalculationLedger({ result, money, labels }: CalculationLedgerProps) {
  const allocated = result.allocations.reduce((total, item) => total + result.netEstate * (item.share.n / item.share.d), 0);
  const remaining = result.netEstate * (result.unallocatedShare.n / result.unallocatedShare.d);
  const denominators = [...result.allocations.map((item) => item.share.d), result.unallocatedShare.d];
  const commonDenominator = denominators.reduce(lcm, 1);
  const copy = { estate: "Estate total", lcm: "LCM", distributed: "Distributed total", remaining: "Remaining", final: "Final total", ...labels };
  const values: Array<[keyof typeof copy, string]> = [["estate", money(result.netEstate)], ["lcm", String(commonDenominator)], ["distributed", money(allocated)], ["remaining", money(remaining)], ["final", money(allocated + remaining)]];
  return <section className="calculation-ledger rounded-2xl border border-blue-100 bg-blue-50 p-3.5" aria-label="Calculation totals"><div className="grid grid-cols-2 gap-2 sm:grid-cols-5">{values.map(([key, value]) => <div key={key} className="min-w-0 rounded-xl bg-white/75 px-2.5 py-2.5"><p className="truncate text-[10px] font-extrabold uppercase tracking-wide text-slate-500">{copy[key]}</p><p className="mt-1 truncate text-sm font-extrabold tabular-nums text-[#102B52]">{value}</p></div>)}</div></section>;
}
