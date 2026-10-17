/** Premium redesign: slim header — navy wordmark, learn + history actions. Props unchanged. */
import { BookOpenText, Calculator, History } from "lucide-react";

type Props = {
  title: string;
  subtitle?: string;
  homeLabel: string;
  historyLabel: string;
  calculatorLabel: string;
  historyActive: boolean;
  onToggleHistory: () => void;
  learnLabel?: string;
  onLearn?: () => void;
};

export function AppHeader({ title, subtitle, homeLabel, historyLabel, calculatorLabel, historyActive, onToggleHistory, learnLabel, onLearn }: Props) {
  const toggleLabel = historyActive ? calculatorLabel : historyLabel;
  return (
    <header className="sticky top-0 z-40 border-b border-[#d8e6f7] bg-white/90 backdrop-blur-md">
      <div className="pb-container flex items-center justify-between gap-3 py-2.5">
        <a href="/" aria-label={homeLabel} className="flex min-w-0 items-center gap-2.5">
          <img src="/book-cover-icon-192.png" alt="" className="h-9 w-9 rounded-lg object-cover" />
          <span className="min-w-0">
            <span className="block truncate text-[15px] font-extrabold text-[#0b2a4f]">{title}</span>
            {subtitle ? <span className="block truncate text-[11px] font-medium text-slate-500">{subtitle}</span> : null}
          </span>
        </a>
        <div className="flex items-center gap-2">
          {onLearn ? (
            <button type="button" onClick={onLearn} aria-label={learnLabel} title={learnLabel} className="pb-icon-btn">
              <BookOpenText size={18} />
            </button>
          ) : null}
          <button type="button" onClick={onToggleHistory} aria-label={toggleLabel} title={toggleLabel} className="pb-icon-btn">
            {historyActive ? <Calculator size={18} /> : <History size={18} />}
          </button>
        </div>
      </div>
    </header>
  );
}
