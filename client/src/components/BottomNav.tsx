/** Design: Miraasu Scholarly Ledger — thumb-reachable mobile navigation. */
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
  return (
    <nav className="ms-bottomnav sm:hidden" aria-label="Primary navigation">
      <div className="ms-bottomnav-inner">
        {items.map(({ key, label, icon: Icon }) => (
          <button key={key} type="button" onClick={() => onNavigate(key)} className={view === key ? "is-current" : ""} aria-current={view === key ? "page" : undefined}>
            <Icon size={18} strokeWidth={2.2} />
            <span>{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
