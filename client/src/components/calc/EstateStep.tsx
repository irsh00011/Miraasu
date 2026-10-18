/** Design: Miraasu — Quiet Ledger. One focal point (the amount), optional deductions disclosed on demand,
 *  the net figure as a quiet line that only appears when it differs from the gross. UI only. */
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import type { EstateInput } from "@/lib/inheritance";
import { MoneyField, advanceOnEnter } from "@/components/calc/MoneyField";

type Props = {
  estate: EstateInput;
  onChange: (key: keyof EstateInput, value: number) => void;
  netEstateText: string;
  onNext: () => void;
  notices?: ReactNode;
  text: {
    kicker: string;
    title: string;
    gross: string;
    optional: string;
    addExtras: string;
    costs: string;
    debts: string;
    bequest: string;
    bequestHelp?: string;
    distributable: string;
    next: string;
  };
};

export function EstateStep({ estate, onChange, netEstateText, onNext, notices, text }: Props) {
  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => advanceOnEnter(event, onNext);
  // Presentation only: deductions open themselves when they already hold a value (e.g. re-opened history).
  const hasDeductions = estate.funeralCosts > 0 || estate.debts > 0 || estate.bequest > 0;

  return (
    <div className="ms-card p-4 sm:p-7" data-step-fields>
      <p className="ms-kicker">{text.kicker}</p>
      <h1 className="ms-h1">{text.title}</h1>

      <div className="ms-amount-hero premium-pop mt-5">
        <MoneyField
          size="xl"
          label={text.gross}
          value={estate.grossEstate}
          onValueChange={(value) => onChange("grossEstate", value)}
          onKeyDown={onKeyDown}
        />
      </div>

      <details className="ms-disclose" open={hasDeductions || undefined}>
        <summary>
          <span>{text.addExtras}</span>
          <span className="ms-disclose-opt">{text.optional}</span>
        </summary>
        <div className="ms-disclose-body">
          <div className="ms-deduct-row">
            <MoneyField label={text.costs} value={estate.funeralCosts} onValueChange={(value) => onChange("funeralCosts", value)} onKeyDown={onKeyDown} />
          </div>
          <div className="ms-deduct-row">
            <MoneyField label={text.debts} value={estate.debts} onValueChange={(value) => onChange("debts", value)} onKeyDown={onKeyDown} />
          </div>
          <div className="ms-deduct-row">
            <MoneyField label={text.bequest} help={text.bequestHelp} value={estate.bequest} onValueChange={(value) => onChange("bequest", value)} onKeyDown={onKeyDown} />
          </div>
        </div>
      </details>

      {notices ? <div className="mt-3 grid gap-2">{notices}</div> : null}

      {hasDeductions ? (
        <footer className="ms-total-row" aria-live="polite">
          <p className="ms-total-label">{text.distributable}</p>
          <p className="ms-total-value num">{netEstateText}</p>
        </footer>
      ) : null}

      <div className="ms-next-row">
        <button type="button" onClick={onNext} aria-keyshortcuts="Enter" className="ms-btn ms-btn-primary ms-btn-block">
          {text.next}<ArrowRight size={16} className="rtl:rotate-180" />
        </button>
      </div>
    </div>
  );
}
