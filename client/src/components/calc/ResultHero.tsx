/** Design: Miraasu Scholarly Ledger — slim result header: one green check seal + title only.
 * The shares come first on the screen; kicker/subtitle were removed so the result is seen immediately. */
import { Check } from "lucide-react";

export function ResultHero({ title, savedNote }: { title: string; savedNote?: string }) {
  return (
    <section className="ms-result-head premium-pop" aria-label={title}>
      <span className="ms-result-seal" aria-hidden="true">
        <Check size={24} strokeWidth={3.2} />
      </span>
      <div className="min-w-0">
        <h1 className="ms-result-title">{title}</h1>
        {savedNote ? <p className="ms-result-note"><Check size={14} /> {savedNote}</p> : null}
      </div>
    </section>
  );
}
