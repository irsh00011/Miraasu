/**
 * Design: Entrance flow — three quiet screens.
 *   1. Welcome  → only "Welcome" and one Start button.
 *   2. Language → four premium cards (Tamil · English · Arabic · Urdu).
 *   3. Gender   → two premium cards with a single symbol each, shown in the chosen language.
 * Frontend only: no calculation or routing logic is changed. Language cards still open /ta, /en, /ar, /ur.
 */
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ChevronRight } from "lucide-react";
import { useLocation } from "wouter";
import { Onboarding, type OnboardingScreen } from "@/components/Onboarding";

type Lang = "ta" | "en" | "ar" | "ur";
type Step = "welcome" | "onboard1" | "onboard2" | "onboard3" | "language" | "gender";
type Gender = "male" | "female";

const LANGUAGES: { code: Lang; href: string; native: string; label: string; mark: string }[] = [
  { code: "ta", href: "/ta", native: "தமிழ்", label: "Tamil", mark: "த" },
  { code: "en", href: "/en", native: "English", label: "English", mark: "En" },
  { code: "ar", href: "/ar", native: "العربية", label: "Arabic", mark: "ع" },
  { code: "ur", href: "/ur", native: "اردو", label: "Urdu", mark: "ا" },
];

const COPY: Record<Lang, { back: string; title: string; hint: string; male: string; female: string }> = {
  ta: { back: "பின்செல்", title: "யார் காலமானார்?", hint: "தொடர ஒன்றைத் தேர்ந்தெடுக்கவும்", male: "ஆண்", female: "பெண்" },
  en: { back: "Back", title: "Who has passed away?", hint: "Choose one to continue", male: "Male", female: "Female" },
  ar: { back: "رجوع", title: "من المتوفى؟", hint: "اختر للمتابعة", male: "رجل", female: "امرأة" },
  ur: { back: "واپس", title: "متوفی کون ہے؟", hint: "جاری رکھنے کے لیے منتخب کریں", male: "مرد", female: "عورت" },
};

/** Simple line symbols (♂ / ♀), drawn locally so they stay crisp at any size. */
function GenderSymbol({ kind }: { kind: Gender }) {
  return (
    <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {kind === "male" ? (
        <>
          <circle cx="10" cy="14" r="5.5" />
          <path d="M14 10 20 4M15 4h5v5" />
        </>
      ) : (
        <>
          <circle cx="12" cy="9" r="5.5" />
          <path d="M12 14.5V21M9 18h6" />
        </>
      )}
    </svg>
  );
}

export default function Entrance() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState<Step>("welcome");
  const [lang, setLang] = useState<Lang>("en");
  const [picked, setPicked] = useState<Gender | null>(null);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = COPY[lang];
  const rtl = step === "gender" && (lang === "ar" || lang === "ur");

  const chooseLanguage = (code: Lang) => {
    setLang(code);
    setPicked(null);
    setStep("gender");
  };

  const chooseGender = (gender: Gender) => {
    setPicked(gender);
    const target = LANGUAGES.find((item) => item.code === lang)?.href ?? "/en";
    timer.current = window.setTimeout(() => navigate(target), 220);
  };

  const goBack = () => {
    window.clearTimeout(timer.current);
    setPicked(null);
    setStep(
      step === "gender" ? "language"
      : step === "language" ? "onboard3"
      : step === "onboard3" ? "onboard2"
      : step === "onboard2" ? "onboard1"
      : "welcome"
    );
  };

  const onboardScreen: OnboardingScreen | null =
    step === "onboard1" ? 1 : step === "onboard2" ? 2 : step === "onboard3" ? 3 : null;
  const goNextOnboard = () => setStep(step === "onboard1" ? "onboard2" : step === "onboard2" ? "onboard3" : "language");

  return (
    <main className="ent-shell" dir={rtl ? "rtl" : "ltr"}>
      <div className="ent-frame">
        {step !== "welcome" ? (
          <header className="ent-top">
            <button type="button" onClick={goBack} className="ent-back">
              <ArrowLeft size={18} className="rtl:rotate-180" />
              <span>{step === "gender" ? copy.back : "Back"}</span>
            </button>
            <img src="/book-cover-icon-192.png" alt="Miraasu" className="ent-top-logo" />
          </header>
        ) : null}

        <div className="ent-stage">
          {step === "welcome" ? (
            <section key="welcome" className="ent-welcome">
              <img src="/book-cover-icon-192.png" alt="" className="ent-logo ent-rise" style={{ animationDelay: "0ms" }} />
              <h1 className="ent-welcome-title" aria-label="Welcome">
                <span className="sr-only">Welcome</span>
                <span aria-hidden="true" className="ent-letter-row">
                  {"Welcome".split("").map((letter, index) => (
                    <span key={`${letter}-${index}`} className="ent-welcome-letter ent-rise" style={{ animationDelay: `${90 + index * 55}ms` }}>{letter}</span>
                  ))}
                </span>
              </h1>
              <span className="ent-rule ent-rise" style={{ animationDelay: "170ms" }} aria-hidden="true" />
              <p className="ent-welcome-sub ent-rise" style={{ animationDelay: "200ms" }}>to the Islamic Inheritance Calculator</p>
              <p className="ent-brand ent-rise" style={{ animationDelay: "230ms" }}>Miraasu</p>
              <article className="ent-hadith ent-rise" lang="en" style={{ animationDelay: "280ms" }}>
                <p className="ent-hadith-kicker">A teaching on inheritance</p>
                <blockquote className="ent-hadith-quote">“O Abu Hurairah. Learn about the inheritance and teach it, for it is half of knowledge, but it will be forgotten. This is the first thing that will be taken away from my nation.”</blockquote>
                <p className="ent-hadith-source">Narrated by Abu Hurairah · <a href="https://sunnah.com/ibnmajah:2719" target="_blank" rel="noreferrer">Sunan Ibn Majah 2719</a></p>
                <p className="ent-hadith-grade">Grade: Daʿif (weak) · Darussalam</p>
              </article>
              <button type="button" onClick={() => setStep("onboard1")} className="ent-start ent-rise" style={{ animationDelay: "320ms" }}>
                Start <ArrowRight size={18} />
              </button>
            </section>
          ) : null}

          {onboardScreen ? (
            <Onboarding
              key={`onboard-${onboardScreen}`}
              screen={onboardScreen}
              onNext={goNextOnboard}
              onSkip={() => setStep("language")}
            />
          ) : null}

          {step === "language" ? (
            <section key="language" className="ent-section">
              <div className="ent-head ent-rise">
                <h1 className="ent-title">Choose your language</h1>
              </div>
              <div className="ent-lang-grid">
                {LANGUAGES.map((item, index) => (
                  <button
                    key={item.code}
                    type="button"
                    lang={item.code}
                    onClick={() => chooseLanguage(item.code)}
                    className="ent-card ent-lang-card ent-rise"
                    style={{ animationDelay: `${80 + index * 70}ms` }}
                  >
                    <span className="ent-mark" aria-hidden="true">{item.mark}</span>
                    <span className="ent-lang-text">
                      <span className="ent-lang-native">{item.native}</span>
                      <span className="ent-lang-label">{item.label}</span>
                    </span>
                    <span className="ent-go" aria-hidden="true"><ChevronRight size={18} className="rtl:rotate-180" /></span>
                  </button>
                ))}
              </div>
            </section>
          ) : null}

          {step === "gender" ? (
            <section key="gender" className="ent-section" lang={lang}>
              <div className="ent-head ent-rise">
                <h1 className="ent-title">{copy.title}</h1>
                <p className="ent-sub">{copy.hint}</p>
              </div>
              <div className="ent-gender-grid">
                {([
                  { id: "male" as const, label: copy.male },
                  { id: "female" as const, label: copy.female },
                ]).map(({ id, label }, index) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => chooseGender(id)}
                    aria-pressed={picked === id}
                    data-tone={id}
                    className={`ent-card ent-gender-card ent-rise ${picked === id ? "is-picked" : ""}`}
                    style={{ animationDelay: `${80 + index * 80}ms` }}
                  >
                    <span className="ent-symbol" aria-hidden="true"><GenderSymbol kind={id} /></span>
                    <span className="ent-gender-label">{label}</span>
                  </button>
                ))}
              </div>
            </section>
          ) : null}
        </div>

        {step === "language" || step === "gender" ? (
          <div className="ent-dots" aria-hidden="true">
            <span className={step === "language" ? "is-on" : ""} />
            <span className={step === "gender" ? "is-on" : ""} />
          </div>
        ) : null}
      </div>
    </main>
  );
}
