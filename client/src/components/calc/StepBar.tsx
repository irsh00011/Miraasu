/** Premium redesign: numbered step rail with animated progress + mobile thumb nav. Props unchanged. */
import { Calculator, Check, RotateCcw, UsersRound, WalletCards } from "lucide-react";

export type Step = 1 | 2 | 3;
type Labels = readonly [string, string, string];

const icons = [WalletCards, UsersRound, Calculator] as const;

export function StepBar({ step, labels, ariaLabel, resetLabel, onGo, onReset }: { step: Step; labels: Labels; ariaLabel: string; resetLabel: string; onGo: (step: Step) => void; onReset: () => void }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <nav aria-label={ariaLabel} className="min-w-0 flex-1">
        <ol className="pb-steps">
          {labels.map((label, index) => {
            const id = (index + 1) as Step;
            const done = id < step;
            const current = id === step;
            return (
              <li key={label} className={`pb-step ${current ? "is-current" : ""} ${done ? "is-done" : ""}`}>
                <button
                  type="button"
                  disabled={!done}
                  onClick={() => onGo(id)}
                  aria-current={current ? "step" : undefined}
                  className="pb-step-btn"
                >
                  <span className="pb-step-dot" aria-hidden="true">
                    {done ? <Check size={15} strokeWidth={3.5} /> : <span className="num">{id}</span>}
                  </span>
                  <span className="pb-step-name">{label}</span>
                </button>
                {index < labels.length - 1 ? (
                  <span aria-hidden="true" className={`pb-step-link ${id < step ? "is-fill" : ""}`} />
                ) : null}
              </li>
            );
          })}
        </ol>
      </nav>
      <button type="button" onClick={onReset} aria-label={resetLabel} title={resetLabel} className="pb-icon-btn">
        <RotateCcw size={16} />
      </button>
    </div>
  );
}

export function StepNav({ step, labels, ariaLabel, onGo }: { step: Step; labels: Labels; ariaLabel: string; onGo: (step: Step) => void }) {
  return (
    <nav className="pb-bottomnav sm:hidden" aria-label={ariaLabel}>
      <div className="pb-bottomnav-inner">
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
