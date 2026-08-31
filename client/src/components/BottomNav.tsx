import { Calculator, History, Home } from "lucide-react";

type BottomNavProps = {
  view: "welcome" | "calculator" | "history";
  onNavigate: (view: BottomNavProps["view"]) => void;
  labels: { home: string; calculator: string; history: string };
};

export function BottomNav({ view, onNavigate, labels }: BottomNavProps) {
  const items = [
    { key: "welcome" as const, label: labels.home, icon: Home },
    { key: "calculator" as const, label: labels.calculator, icon: Calculator },
    { key: "history" as const, label: labels.history, icon: History },
  ];
  return <nav className="mobile-bottom-nav fixed inset-x-0 bottom-0 z-30 border-t border-blue-100 bg-white/95 px-3 pb-[max(0.65rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_24px_rgba(19,61,118,0.08)] backdrop-blur sm:hidden" aria-label="Primary navigation"><div className="mx-auto grid max-w-md grid-cols-3 gap-1">{items.map(({ key, label, icon: Icon }) => <button key={key} type="button" onClick={() => onNavigate(key)} className={`flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-xl text-[11px] font-bold transition ${view === key ? "bg-blue-50 text-[#133D76]" : "text-slate-500 hover:bg-slate-50"}`} aria-current={view === key ? "page" : undefined}><Icon size={18} strokeWidth={2.2} /><span>{label}</span></button>)}</div></nav>;
}
