/** Premium redesign: estate worksheet — hero amount, tidy deductions, strong total footer. Props unchanged. */
import type { ReactNode } from "react";
import { ArrowLeft, ArrowRight, FileText, HandCoins, Receipt, Wallet } from "lucide-react";
import type { EstateInput } from "@/lib/inheritance";
import { MoneyField, advanceOnEnter } from "@/components/calc/MoneyField";
import { PbButton } from "@/premium/ui";

type Props = {
  estate: EstateInput;
  onChange: (key: keyof EstateInput, value: number) => void;
  netEstateText: string;
  onNext: () => void;
  onBack: () => void;
  notices?: ReactNode;
  rtl?: boolean;
  text: {
    kicker: string;
    title: string;
    subtitle: string;
    gross: string;
    optional: string;
    addExtras: string;
    costs: string;
    debts: string;
    bequest: string;
    bequestHelp?: string;
    distributable: string;
    next: string;
    back: string;
  };
};

export function EstateStep({ estate, onChange, netEstateText, onNext, onBack, notices, rtl, text }: Props) {
  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => advanceOnEnter(event, onNext);
  const NextIcon = rtl ? ArrowLeft : ArrowRight;
  const BackIcon = rtl ? ArrowRight : ArrowLeft;

  const deductions = [
    { key: "funeralCosts" as const, label: text.costs, icon: <Receipt size={18} /> },
    { key: "debts" as const, label: text.debts, icon: <FileText size={18} /> },
    { key: "bequest" as const, label: text.bequest, icon: <HandCoins size={18} />, help: text.bequestHelp },
  ];

  return (
    <div className="pb-card pb-card-pad pb-rise" data-step-fields>
      <p className="pb-kicker">{text.kicker}</p>
      <h1 className="pb-h1 mt-1">{text.title}</h1>
      <p className="pb-lead mt-2">{text.subtitle}</p>

      <div className="pb-estate-hero mt-5">
        <span className="pb-estate-ic" aria-hidden="true"><Wallet size={22} /></span>
        <div className="min-w-0 flex-1">
          <MoneyField
            size="xl"
            label={text.gross}
            value={estate.grossEstate}
            onValueChange={(value) => onChange("grossEstate", value)}
            onKeyDown={onKeyDown}
          />
        </div>
      </div>

      <section className="mt-5" aria-label={text.addExtras}>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="pb-section-title text-[0.95rem]">{text.addExtras}</h2>
          <span className="rounded-full bg-[#eaf3ff] px-2.5 py-1 text-[11px] font-bold text-[#1559a6]">{text.optional}</span>
        </div>
        <div className="grid gap-3">
          {deductions.map(({ key, label, icon, help }) => (
            <div key={key} className="pb-deduct-card">
              <span className="pb-deduct-ic" aria-hidden="true">{icon}</span>
              <MoneyField
                label={label}
                help={help}
                value={estate[key]}
                onValueChange={(value) => onChange(key, value)}
                onKeyDown={onKeyDown}
              />
            </div>
          ))}
        </div>
      </section>

      {notices ? <div className="mt-3 grid gap-2">{notices}</div> : null}

      <div className="pb-distribute mt-4">
        <span className="pb-distribute-ic" aria-hidden="true">₹</span>
        <span className="min-w-0 flex-1">
          <span className="pb-distribute-label">{text.distributable}</span>
        </span>
        <span className="pb-distribute-amount num">{netEstateText}</span>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <button type="button" onClick={onBack} className="pb-btn pb-btn-ghost px-3 text-sm">
          <BackIcon size={17} /> {text.back}
        </button>
        <PbButton onClick={onNext} className="flex-1" aria-keyshortcuts="Enter">
          {text.next} <NextIcon size={17} />
        </PbButton>
      </div>
    </div>
  );
}
