/** Design: Miraasu Scholarly Ledger — result success header: one green check seal, title and subtitle. The top amount card was removed. */
import { Check } from "lucide-react";

export function ResultHero({ kicker, title, subtitle, savedNote }: { kicker: string; title: string; subtitle: string; savedNote?: string }) {
  return (
    <section className="ms-result-head premium-pop" aria-label={title}>
      <span className="ms-result-seal" aria-hidden="true">
        <Check size={30} strokeWidth={3} />
      </span>
      <div className="min-w-0">
        <p className="ms-kicker">{kicker}</p>
        <h1 className="ms-result-title">{title}</h1>
        <p className="ms-result-sub">{subtitle}</p>
        {savedNote ? <p className="ms-result-note"><Check size={14} /> {savedNote}</p> : null}
      </div>
    </section>
  );
}
