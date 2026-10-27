/**
 * Design: Entrance flow — three quiet screens.
 *   1. Welcome  → only "Welcome" and one Start button.
 *   2. Language → four premium cards (Tamil · English · Arabic · Urdu).
 *   3. Gender   → two premium cards with a single symbol each, shown in the chosen language.
 * Frontend only: no calculation or routing logic is changed. Language cards still open /ta, /en, /ar, /ur.
 */
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ChevronRight, Download } from "lucide-react";
import { useLocation } from "wouter";
import Splash from "../components/Splash";

type Lang = "ta" | "en" | "ar" | "ur";
type Step = "splash" | "welcome" | "language" | "gender";
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
  const [installEvent, setInstallEvent] = useState<Event | null>(null);

  // PWA: capture the install prompt so we can offer an in-app Install button.
  useEffect(() => {
    const handler = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const installApp = async () => {
    const promptEvent = installEvent as (Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> }) | null;
    if (!promptEvent) return;
    await promptEvent.prompt();
    await promptEvent.userChoice;
    setInstallEvent(null);
  };
  // The splash is a brand moment, not a toll booth: once per browser session.
  const [step, setStep] = useState<Step>(() => {
    try { return window.sessionStorage.getItem("miraasu:splash") ? "welcome" : "splash"; } catch { return "splash"; }
  });
  const [lang, setLang] = useState<Lang>("en");
  const [picked, setPicked] = useState<Gender | null>(null);
  const [pickedLang, setPickedLang] = useState<Lang | null>(null);
  const timer = useRef<number | undefined>(undefined);

  // Institution logos (user-supplied) load lazily as a separate chunk on the
  // welcome step, keeping the main bundle lean. SVG fallbacks show first.
  const [collabLogos, setCollabLogos] = useState<{ bukhari: string; crescent: string } | null>(null);
  useEffect(() => {
    if (step === "welcome" && !collabLogos) {
      import("../collabLogos")
        .then((m) => setCollabLogos({ bukhari: m.BUKHARI_LOGO, crescent: m.CRESCENT_LOGO }))
        .catch(() => undefined);
    }
  }, [step, collabLogos]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  // This screen is written in English until a language is chosen: say so, so assistive tech
  // and the :lang() typography rules (tracked caps are Latin-only) behave correctly.
  useEffect(() => {
    document.documentElement.lang = "en";
    document.documentElement.dir = "ltr";
  }, []);

  const copy = COPY[lang];
  const rtl = step === "gender" && (lang === "ar" || lang === "ur");

  const chooseLanguage = (code: Lang) => {
    setLang(code);
    setPicked(null);
    // Let the card flash blue first, then move on (mirrors the gender step).
    setPickedLang(code);
    timer.current = window.setTimeout(() => setStep("gender"), 220);
  };

  const chooseGender = (gender: Gender) => {
    setPicked(gender);
    const target = LANGUAGES.find((item) => item.code === lang)?.href ?? "/en";
    timer.current = window.setTimeout(() => navigate(target), 220);
  };

  const goBack = () => {
    window.clearTimeout(timer.current);
    setPicked(null);
    setPickedLang(null);
    setStep(step === "gender" ? "language" : "welcome");
  };

  return (
    <main className="ent-shell" dir={rtl ? "rtl" : "ltr"}>
      {step === "splash" ? (
        <Splash onComplete={() => { try { window.sessionStorage.setItem("miraasu:splash", "1"); } catch { /* private mode: fine */ } setStep("welcome"); }} />
      ) : (
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
              <div className="ent-timeline">
                <div className="ent-logo-row ent-rise" style={{ animationDelay: "0ms" }}>
                  <img src={collabLogos?.bukhari ?? "/bukhari-logo.svg"} alt="Bukhari Aalim Arabic College" className="ent-side-logo" />
                  <img src="/book-cover-icon-192.png" alt="" className="ent-logo" />
                  <img src={collabLogos?.crescent ?? "/crescent-logo.svg"} alt="B.S. Abdur Rahman Crescent Institute of Science and Technology" className="ent-side-logo" />
                </div>
                <span className="ent-timeline-connector ent-rise" aria-hidden="true" style={{ animationDelay: "60ms" }} />
                <p className="ent-arabic-hero ent-rise" lang="ar" style={{ animationDelay: "120ms" }} aria-label="Mirath">مِيرَاث</p>
                <h1 className="ent-welcome-title ent-rise" style={{ animationDelay: "180ms" }}>Miraasu</h1>
                <span className="ent-timeline-connector ent-rise" aria-hidden="true" style={{ animationDelay: "240ms" }} />
                <p className="ent-usp ent-rise" style={{ animationDelay: "300ms" }}>Every heir&rsquo;s exact share &mdash; the Islamic way.</p>
                <span className="ent-timeline-connector ent-rise" aria-hidden="true" style={{ animationDelay: "360ms" }} />
                <article className="ent-hadith ent-rise" lang="en" style={{ animationDelay: "420ms" }}>
                  <blockquote className="ent-hadith-quote">&ldquo;Learn the Fara&rsquo;id and teach it, for it is half of knowledge.&rdquo;</blockquote>
                  <p className="ent-hadith-source">Sunan Ibn Majah 2719</p>
                </article>
                {installEvent ? (
                  <button type="button" onClick={installApp} className="ent-install ent-rise" style={{ animationDelay: "460ms" }}>
                    <Download size={15} /> Install app
                  </button>
                ) : null}
              </div>
              <div className="ent-start-dock ent-rise" style={{ animationDelay: "520ms" }}>
                <button type="button" onClick={() => setStep("language")} className="ent-start">
                  Start <ArrowRight size={18} />
                </button>
              </div>
            </section>
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
                    aria-pressed={pickedLang === item.code}
                    className={`ent-card ent-lang-card ent-rise ${pickedLang === item.code ? "is-picked" : ""}`}
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
            <section key={step} className="ent-section" lang={lang}>
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

        {step !== "welcome" ? (
          <div className="ent-dots" aria-hidden="true">
            <span className="is-on" />
            <span className={step === "language" || step === "gender" ? "is-on" : ""} />
            <span className={step === "gender" ? "is-on" : ""} />
          </div>
        ) : null}
      </div>
      )}
    </main>
  );
}
