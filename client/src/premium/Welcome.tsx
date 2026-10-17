/** Premium welcome page: Miraasu identity carried by typography, colour and layout — no logos.
 *  Staggered fade-up entrance, subtle light sweep around the card, one prominent CTA.
 *  Renders in English: language is chosen on the next step (same convention as the old onboarding).
 *  Frontend only. */
import { ArrowRight } from "lucide-react";
import { premiumCopy } from "@/premium/copy";
import { PbButton } from "@/premium/ui";

export function Welcome({ onStart }: { onStart: () => void }) {
  const t = premiumCopy.en;
  return (
    <div className="pb-welcome-page">
      <div className="pb-welcome-card" role="region" aria-label="Miraasu">
        <p className="pb-welcome-kicker">{t.onbWelcomeSub}</p>
        <h1 className="pb-welcome-title">Miraasu</h1>
        <p className="pb-welcome-tag">{t.onbWelcomeTag}</p>
        <p className="pb-welcome-desc">{t.onbWelcomeDesc}</p>
        <div className="pb-welcome-cta">
          <PbButton block onClick={onStart}>
            {t.getStarted} <ArrowRight size={17} />
          </PbButton>
        </div>
      </div>
    </div>
  );
}
