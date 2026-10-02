/** Design: Miraasu Scholarly Ledger — the total first: deep-navy hero with watermark and premium numerals. */
import { Check } from "lucide-react";

export function ResultHero({ kicker, title, subtitle, amount, savedNote }: { kicker: string; title: string; subtitle: string; amount: string; savedNote?: string }) {
  return (
    <section className="ms-hero premium-pop">
      <p className="ms-hero-kicker">{kicker}</p>
      <h1 className="ms-hero-title">{title}</h1>
      <p className="relative z-[1] mt-1 text-sm text-blue-100/90">{subtitle}</p>
      <p className="ms-hero-amount num">{amount}</p>
      {savedNote ? <p className="ms-hero-note"><Check size={14} /> {savedNote}</p> : null}
    </section>
  );
}
