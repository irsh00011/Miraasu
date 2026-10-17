/** About Our Collaboration page — follows the supplied reference: the two institution
 *  logos side by side with "In Collaboration With" between them. Bordered cards, subtle
 *  shadows, Continue into the calculation flow and Back to the welcome page.
 *  Renders in English: language is chosen on the next step (same convention as the old onboarding).
 *  Institution names stay in English (proper nouns); Tamil/Arabic names come from the reference.
 *  Frontend only. */
import { ArrowLeft, ArrowRight } from "lucide-react";
import { premiumCopy } from "@/premium/copy";
import { PbButton } from "@/premium/ui";
import { BUKHARI_LOGO_SRC, CRESCENT_LOGO_SRC } from "@/premium/collabImages";

export function Collaboration({ onBack, onContinue }: { onBack: () => void; onContinue: () => void }) {
  const t = premiumCopy.en;
  return (
    <div className="pb-collab-page">
      <div className="pb-collab-card" role="region" aria-label={t.collabTitle}>
        <p className="pb-kicker">{t.onbCollabKicker}</p>
        <h1 className="pb-h1 mt-2">{t.collabTitle}</h1>
        <p className="pb-collab-desc">{t.collabLead}</p>

        <div className="pb-collab-logos">
          <figure className="pb-logo-card">
            <img src={BUKHARI_LOGO_SRC} alt={t.collabBukhariName} />
            <figcaption>
              <span className="pb-logo-name">{t.collabBukhariName}</span>
              <span className="pb-logo-tamil" lang="ta">{t.collabBukhariTamil}</span>
              <span className="pb-logo-ar" lang="ar" dir="rtl">{t.collabBukhariAr}</span>
              <span className="pb-logo-motto">{t.collabBukhariMotto}</span>
            </figcaption>
          </figure>

          <div className="pb-collab-with" aria-hidden="true">
            <span className="pb-collab-with-line" />
            <span className="pb-collab-with-text">{t.collabWith}</span>
            <span className="pb-collab-with-line" />
          </div>

          <figure className="pb-logo-card">
            <img src={CRESCENT_LOGO_SRC} alt={t.collabCrescentName} />
            <figcaption>
              <span className="pb-logo-name">{t.collabCrescentName}</span>
              <span className="pb-logo-tamil" lang="ta">{t.collabCrescentTamil}</span>
              <span className="pb-logo-motto">{t.collabCrescentMotto}</span>
            </figcaption>
          </figure>
        </div>

        <div className="pb-collab-nav">
          <button type="button" onClick={onBack} className="pb-btn pb-btn-ghost px-3">
            <ArrowLeft size={17} /> {t.back}
          </button>
          <PbButton onClick={onContinue} className="flex-1">
            {t.continue} <ArrowRight size={17} />
          </PbButton>
        </div>
      </div>
    </div>
  );
}
