/**
 * Design: Miraasu educational onboarding — three quiet screens between
 * Welcome and Language selection. One idea + one visual + one short
 * explanation + one CTA per screen. English only (language is chosen after).
 * Frontend only: no calculation, routing or language logic is touched.
 */
import { ArrowRight } from "lucide-react";

export type OnboardingScreen = 1 | 2 | 3;

type Props = {
  screen: OnboardingScreen;
  onNext: () => void;
  onSkip: () => void;
};

/** Small person glyph used in the family illustration. */
function Person({ tone = "blue" }: { tone?: "blue" | "gold" }) {
  return (
    <svg viewBox="0 0 40 56" width="44" height="62" fill="none" aria-hidden="true">
      <circle cx="20" cy="13" r="8.5" fill={tone === "gold" ? "#e9d9ae" : "#dbe7f5"} stroke={tone === "gold" ? "#b8892d" : "#164f86"} strokeWidth="2.4" />
      <path
        d="M6 52c1.5-9.5 7-14.5 14-14.5S32.5 42.5 34 52"
        fill={tone === "gold" ? "#f6ecd4" : "#eaf2fb"}
        stroke={tone === "gold" ? "#b8892d" : "#164f86"}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function EstateIllustration() {
  const rows = ["Total Estate", "Funeral expenses", "Debts", "Wasiyyah / Will"];
  return (
    <div className="ent-flow" aria-hidden="true">
      {rows.map((row) => (
        <div key={row} className="ent-flow-row">
          <span className="ent-flow-pill">{row}</span>
          <span className="ent-flow-arrow">↓</span>
        </div>
      ))}
      <span className="ent-flow-pill is-final">Inheritance</span>
    </div>
  );
}

function FamilyIllustration() {
  const people = [
    { label: "Father", tone: "blue" as const },
    { label: "Mother", tone: "blue" as const },
    { label: "Spouse", tone: "gold" as const },
    { label: "Son", tone: "blue" as const },
    { label: "Daughter", tone: "blue" as const },
  ];
  return (
    <div className="ent-fam" aria-hidden="true">
      {people.map((person) => (
        <span key={person.label} className="ent-fam-person">
          <Person tone={person.tone} />
          <span className="ent-fam-label">{person.label}</span>
        </span>
      ))}
    </div>
  );
}

function ResultIllustration() {
  const rows = [
    { name: "Mother", share: "1/6" },
    { name: "Father", share: "1/6" },
    { name: "Spouse", share: "1/8" },
    { name: "Children", share: "Rest" },
  ];
  return (
    <div className="ent-demo" aria-hidden="true">
      <div className="ent-demo-head">
        <div>
          <p className="ent-demo-kicker">Estate</p>
          <p className="ent-demo-estate num">₹10,00,000</p>
        </div>
        <span className="ent-demo-badge">Example</span>
      </div>
      <ul className="ent-demo-rows">
        {rows.map((row) => (
          <li key={row.name}>
            <span className="ent-demo-name">{row.name}</span>
            <span className="ent-demo-share num">{row.share}</span>
            <span className="ent-demo-amt num">₹—</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const COPY: Record<OnboardingScreen, { title: string; sub: string; extra?: string; cta: string }> = {
  1: {
    title: "Start with the Estate",
    sub: "Begin with what the deceased left behind.",
    cta: "Next",
  },
  2: {
    title: "Who Is Still Alive?",
    sub: "Select the relatives who survived the deceased.",
    extra: "The surviving relatives determine who is eligible for inheritance.",
    cta: "Next",
  },
  3: {
    title: "See the Distribution",
    sub: "Miraasu presents each eligible heir's share clearly.",
    cta: "Continue",
  },
};

export function Onboarding({ screen, onNext, onSkip }: Props) {
  const copy = COPY[screen];
  return (
    <section key={`onboard-${screen}`} className="ent-section ent-onboard">
      <p className="ent-brandmark ent-rise">Miraasu</p>

      <div className="ent-dots-sm ent-rise" style={{ animationDelay: "60ms" }} aria-hidden="true">
        {[1, 2, 3].map((dot) => (
          <span key={dot} className={dot === screen ? "is-on" : ""} />
        ))}
      </div>

      <div className="ent-illo ent-rise" style={{ animationDelay: "120ms" }}>
        {screen === 1 ? <EstateIllustration /> : null}
        {screen === 2 ? <FamilyIllustration /> : null}
        {screen === 3 ? <ResultIllustration /> : null}
      </div>

      <div className="ent-head ent-rise" style={{ animationDelay: "180ms" }}>
        <h1 className="ent-title">{copy.title}</h1>
        <p className="ent-sub">{copy.sub}</p>
        {copy.extra ? <p className="ent-sub ent-extra">{copy.extra}</p> : null}
      </div>

      <div className="ent-onboard-cta ent-rise" style={{ animationDelay: "240ms" }}>
        <button type="button" onClick={onNext} className="ent-start ent-cta-big">
          {copy.cta} <ArrowRight size={18} />
        </button>
        <button type="button" onClick={onSkip} className="ent-skip">
          Skip
        </button>
      </div>
    </section>
  );
}
