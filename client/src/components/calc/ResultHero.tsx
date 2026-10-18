/** Design: Miraasu — Quiet Ledger. The result screen's single focal point: the estate being divided.
 *  Kicker (h1, for screen readers and hierarchy) → label → big count-up amount → saved confirmation.
 *  Frontend only: receives an already-computed number; never calculates. */
import { Check } from "lucide-react";
import { AnimatedMoney } from "@/components/calc/AnimatedMoney";

type Props = {
  title: string;
  savedNote?: string;
  amount?: { label: string; value: number; money: (value: number) => string };
};

export function ResultHero({ title, savedNote, amount }: Props) {
  return (
    <section className="ms-hero premium-pop" aria-label={title}>
      <h1 className="ms-hero-kicker">{title}</h1>
      {amount ? (
        <>
          <p className="ms-hero-label">{amount.label}</p>
          <p className="ms-hero-amount num"><AnimatedMoney value={amount.value} money={amount.money} /></p>
        </>
      ) : null}
      {savedNote ? <p className="ms-hero-note"><Check size={16} strokeWidth={2.6} aria-hidden="true" /> {savedNote}</p> : null}
    </section>
  );
}
