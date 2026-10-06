/** Design: Miraasu Scholarly Ledger — estate worksheet: hero amount, tidy deductions, strong total footer. */
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

      <section className="ms-deduct-simple premium-pop mt-4" style={{ animationDelay: "70ms" }} aria-label={text.addExtras}>
        <div className="ms-deduct-simple-head">
          <h2>{text.addExtras}</h2>
          <span className="ms-deduct-simple-opt">{text.optional}</span>
        </div>
        <div className="ms-deduct-simple-list">
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
      </section>

      {notices ? <div className="mt-3 grid gap-2">{notices}</div> : null}

      <footer className="ms-total-row">
        <div className="min-w-0">
          <p className="ms-total-label">{text.distributable}</p>
          <p className="ms-total-value num">{netEstateText}</p>
        </div>
        <button type="button" onClick={onNext} aria-keyshortcuts="Enter" className="ms-btn ms-btn-primary">
          {text.next}<ArrowRight size={18} className="rtl:rotate-180" />
        </button>
      </footer>
    </div>
  );
}
