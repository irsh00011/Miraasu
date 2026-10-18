/** Design: Miraasu Scholarly Ledger — slim result header: green check seal only. */
import { Check } from "lucide-react";

export function ResultHero({ title }: { title: string; savedNote?: string }) {
  return (
    <section className="ms-result-head premium-pop" aria-label={title}>
      <span className="ms-result-seal" aria-hidden="true">
        <Check size={24} strokeWidth={3.2} />
      </span>
    </section>
  );
}
