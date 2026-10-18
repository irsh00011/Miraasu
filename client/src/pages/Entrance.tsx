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
type Step = "splash" | "welcome" | "collaboration" | "language" | "gender";
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
  const timer = useRef<number | undefined>(undefined);

  // Institution logos (user-supplied) load lazily as a separate chunk when the
  // collaboration step shows, keeping the main bundle lean. SVG fallbacks show first.
  const [collabLogos, setCollabLogos] = useState<{ bukhari: string; crescent: string } | null>(null);
  useEffect(() => {
    if (step === "collaboration" && !collabLogos) {
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
    setStep(step === "gender" ? "language" : step === "language" ? "collaboration" : "welcome");
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
              <img src="/book-cover-icon-192.png" alt="" className="ent-logo ent-rise" style={{ animationDelay: "0ms" }} />
              <p className="ent-arabic-hero ent-rise" lang="ar" style={{ animationDelay: "70ms" }} aria-label="Mirath">مِيرَاث</p>
              <h1 className="ent-welcome-title ent-rise" style={{ animationDelay: "130ms" }}>Miraasu</h1>
              <p className="ent-usp ent-rise" style={{ animationDelay: "190ms" }}>Every heir&rsquo;s exact share &mdash; the Islamic way.</p>
              <button type="button" onClick={() => setStep("collaboration")} className="ent-start ent-rise" style={{ animationDelay: "250ms" }}>
                Start <ArrowRight size={18} />
              </button>
              <article className="ent-hadith ent-rise" lang="en" style={{ animationDelay: "350ms" }}>
                <blockquote className="ent-hadith-quote">&ldquo;Learn the Fara&rsquo;id and teach it, for it is half of knowledge.&rdquo;</blockquote>
                <p className="ent-hadith-source">Sunan Ibn Majah 2719</p>
              </article>
              {installEvent ? (
                <button type="button" onClick={installApp} className="ent-install ent-rise" style={{ animationDelay: "360ms" }}>
                  <Download size={15} /> Install app
                </button>
              ) : null}
            </section>
          ) : null}

          {step === "collaboration" ? (
            <section key="collaboration" className="ent-section ent-collab">
              <p className="ent-collab-kicker ent-rise" style={{ animationDelay: "0ms" }}>In Collaboration With</p>
              <span className="ent-rule ent-rise" style={{ animationDelay: "80ms" }} aria-hidden="true" />
              <div className="ent-collab-grid">
                <figure className="ent-collab-card ent-rise" style={{ animationDelay: "140ms" }}>
                  <img src={collabLogos?.bukhari ?? "/bukhari-logo.svg"} alt="Bukhari Aalim Arabic College logo" className="ent-collab-logo" />
                  <figcaption className="ent-collab-name">Bukhari Aalim Arabic College</figcaption>
                </figure>
                <figure className="ent-collab-card ent-rise" style={{ animationDelay: "260ms" }}>
                  <img src={collabLogos?.crescent ?? "/crescent-logo.svg"} alt="B.S. Abdur Rahman Crescent Institute of Science and Technology logo" className="ent-collab-logo" />
                  <figcaption className="ent-collab-name">B.S. Abdur Rahman Crescent Institute of Science and Technology</figcaption>
                </figure>
              </div>
              <button type="button" onClick={() => setStep("language")} className="ent-start ent-rise" style={{ animationDelay: "380ms" }}>
                Continue <ArrowRight size={18} />
              </button>
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
            <span className={step === "collaboration" ? "is-on" : ""} />
            <span className={step === "language" ? "is-on" : ""} />
            <span className={step === "gender" ? "is-on" : ""} />
          </div>
        ) : null}
      </div>
      )}
    </main>
  );
}
