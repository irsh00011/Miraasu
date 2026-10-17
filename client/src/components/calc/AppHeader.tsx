/** Design: Miraasu Scholarly Ledger — slim premium header, navy serif wordmark, single history action. */
import { Calculator, History } from "lucide-react";

type Props = {
  title: string;
  subtitle?: string;
  homeLabel: string;
  historyLabel: string;
  calculatorLabel: string;
  historyActive: boolean;
  onToggleHistory: () => void;
};

export function AppHeader({ title, subtitle, homeLabel, historyLabel, calculatorLabel, historyActive, onToggleHistory }: Props) {
  const toggleLabel = historyActive ? calculatorLabel : historyLabel;
  return (
    <header className="ms-header">
      <div className="ms-container ms-header-inner">
        <a href="/" aria-label={homeLabel} className="ms-brand">
          <img src="/book-cover-icon-192.png" alt="" className="ms-brand-mark" />
          <span className="min-w-0">
            <span className="ms-brand-name">{title}</span>
            {subtitle ? <span className="ms-brand-sub">{subtitle}</span> : null}
          </span>
        </a>
        <button type="button" onClick={onToggleHistory} aria-label={toggleLabel} title={toggleLabel} className="ms-icon-btn">
          {historyActive ? <Calculator size={18} /> : <History size={18} />}
        </button>
      </div>
    </header>
  );
}
