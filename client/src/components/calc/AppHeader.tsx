/** Design: Miraasu Scholarly Ledger — slim premium header, navy serif wordmark, single history action. */
import { BookOpen, Calculator, History } from "lucide-react";

type Props = {
  title: string;
  subtitle?: string;
  homeLabel: string;
  historyLabel: string;
  calculatorLabel: string;
  historyActive: boolean;
  onToggleHistory: () => void;
  /** Label for the Special Inheritance Methods link (page language); omitted = no link. */
  specialLabel?: string;
};

export function AppHeader({ title, subtitle, homeLabel, historyLabel, calculatorLabel, historyActive, onToggleHistory, specialLabel }: Props) {
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
        <span className="ms-header-actions">
          {specialLabel ? (
            <a href="/special" className="ms-special-link">
              <BookOpen size={15} aria-hidden="true" />
              <span>{specialLabel}</span>
            </a>
          ) : null}
          <button type="button" onClick={onToggleHistory} aria-label={toggleLabel} title={toggleLabel} className="ms-icon-btn">
            {historyActive ? <Calculator size={18} /> : <History size={18} />}
          </button>
        </span>
      </div>
    </header>
  );
}
