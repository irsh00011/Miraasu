/** Design: Miraasu Scholarly Ledger — numbered step rail with gold-current states + thumb-reachable mobile nav. */
import { Calculator, RotateCcw, UsersRound, WalletCards } from "lucide-react";

export type Step = 1 | 2 | 3;
type Labels = readonly [string, string, string];

const icons = [WalletCards, UsersRound, Calculator] as const;

export function StepBar({ step, labels, ariaLabel, resetLabel, onGo, onReset }: { step: Step; labels: Labels; ariaLabel: string; resetLabel: string; onGo: (step: Step) => void; onReset: () => void }) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <nav aria-label={ariaLabel} className="min-w-0 flex-1">
        <ol className="ms-steps">
          {labels.map((label, index) => {
            const id = (index + 1) as Step;
            const done = id < step;
            const current = id === step;
            return (
              <li key={label}>
                <button
                  type="button"
                  disabled={!done}
                  onClick={() => onGo(id)}
                  aria-current={current ? "step" : undefined}
                  className={`ms-step ${current ? "is-current" : ""} ${done ? "is-done" : ""}`}
                >
                  <span className="ms-step-bar" />
                  <span className="ms-step-label">
                    <span className="ms-step-num num">{id}</span>
                    {label}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>
      <button type="button" onClick={onReset} aria-label={resetLabel} title={resetLabel} className="ms-icon-btn rounded-full">
        <RotateCcw size={16} />
      </button>
    </div>
  );
}

export function StepNav({ step, labels, ariaLabel, onGo }: { step: Step; labels: Labels; ariaLabel: string; onGo: (step: Step) => void }) {
  return (
    <nav className="ms-bottomnav sm:hidden" aria-label={ariaLabel}>
      <div className="ms-bottomnav-inner">
        {labels.map((label, index) => {
          const id = (index + 1) as Step;
          const Icon = icons[index];
          const current = id === step;
          const reachable = id <= step;
          return (
            <button
              key={label}
              type="button"
              onClick={() => reachable && onGo(id)}
              disabled={!reachable}
              aria-current={current ? "step" : undefined}
              className={current ? "is-current" : ""}
            >
              <Icon size={19} />
              {label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
