/**
 * Premium entrance flow:
 *   1. Splash        → الميراث reveal on deep navy.
 *   2. Welcome       → logo-free animated welcome page (skipped for returning users).
 *   3. Collaboration → About Our Collaboration, both institution logos (skipped for returning users).
 *   4. Language      → four premium cards (Tamil · English · Arabic · Urdu).
 *   5. Gender        → two premium cards, shown in the chosen language.
 * Frontend only: no calculation or routing logic is changed. Language cards still open /ta, /en, /ar, /ur.
 */
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, ChevronRight, Download } from "lucide-react";
import { useLocation } from "wouter";
import { Splash } from "@/premium/Splash";
import { Welcome } from "@/premium/Welcome";
import { Collaboration } from "@/premium/Collaboration";

type Lang = "ta" | "en" | "ar" | "ur";
type Phase = "splash" | "welcome" | "collaboration" | "language" | "gender";
type Gender = "male" | "female";

const ONBOARDED_KEY = "miraasu-onboarded";

const LANGUAGES: { code: Lang; href: string; native: string; label: string; mark: string }[] = [
  { code: "ta", href: "/ta", native: "தமிழ்", label: "Tamil", mark: "த" },
  { code: "en", href: "/en", native: "English", label: "English", mark: "En" },
  { code: "ar", href: "/ar", native: "العربية", label: "Arabic", mark: "ع" },
  { code: "ur", href: "/ur", native: "اردو", label: "Urdu", mark: "ا" },
];

const COPY: Record<Lang, { back: string; title: string; hint: string; male: string; maleDesc: string; female: string; femaleDesc: string; continue: string }> = {
  ta: { back: "பின்செல்", title: "யார் காலமானார்?", hint: "கணக்கீட்டைத் தொடங்க காலமானவரைத் தேர்ந்தெடுக்கவும்", male: "ஓர் ஆண்", maleDesc: "காலமானவர் ஆண்", female: "ஒரு பெண்", femaleDesc: "காலமானவர் பெண்", continue: "தொடர்க" },
  en: { back: "Back", title: "Who has passed away?", hint: "Select the deceased person to begin calculation", male: "A Man", maleDesc: "The deceased person is male", female: "A Woman", femaleDesc: "The deceased person is female", continue: "Continue" },
  ar: { back: "رجوع", title: "من المتوفى؟", hint: "اختر المتوفى لبدء الحساب", male: "رجل", maleDesc: "المتوفى ذكر", female: "امرأة", femaleDesc: "المتوفاة أنثى", continue: "التالي" },
  ur: { back: "واپس", title: "متوفی کون ہے؟", hint: "حساب شروع کرنے کے لیے متوفی کو منتخب کریں", male: "ایک مرد", maleDesc: "متوفی مرد ہے", female: "ایک عورت", femaleDesc: "متوفیہ عورت ہے", continue: "جاری رکھیں" },
};

/** Simple line symbols (♂ / ♀), drawn locally so they stay crisp at any size. */
/** Simple blue-and-white person icon, drawn locally so it stays crisp at any size. */
function PersonIcon() {
  return (
    <svg viewBox="0 0 24 24" width="34" height="34" fill="currentColor" aria-hidden="true">
      <circle cx="12" cy="8" r="4.2" />
      <path d="M3.5 20.5c.8-4.3 4.2-6.8 8.5-6.8s7.7 2.5 8.5 6.8c.1.8-.5 1.5-1.3 1.5H4.8c-.8 0-1.4-.7-1.3-1.5Z" />
    </svg>
  );
}

export default function Entrance() {
  const [, navigate] = useLocation();
  const [installEvent, setInstallEvent] = useState<Event | null>(null);
  const [phase, setPhase] = useState<Phase>("splash");
  const [lang, setLang] = useState<Lang>("en");
  const [picked, setPicked] = useState<Gender | null>(null);
  const timer = useRef<number | undefined>(undefined);

  // PWA: capture the install prompt so we can offer an in-app Install button.
  useEffect(() => {
    const handler = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const installApp = async () => {
    const promptEvent = installEvent as (Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> }) | null;
    if (!promptEvent) return;
    await promptEvent.prompt();
    await promptEvent.userChoice;
    setInstallEvent(null);
  };

  const afterSplash = () => {
    try {
      if (localStorage.getItem(ONBOARDED_KEY) === "1") setPhase("language");
      else setPhase("welcome");
    } catch {
      setPhase("welcome");
    }
  };

  const markOnboarded = () => {
    try { localStorage.setItem(ONBOARDED_KEY, "1"); } catch { /* private mode */ }
  };

  const afterCollaboration = () => {
    markOnboarded();
    setPhase("language");
  };

  const copy = COPY[lang];
  const rtl = phase === "gender" && (lang === "ar" || lang === "ur");

  const selectLanguage = (code: Lang) => setLang(code);

  const confirmLanguage = () => {
    setPicked(null);
    setPhase("gender");
  };

  const selectGender = (gender: Gender) => setPicked(gender);

  const confirmGender = () => {
    if (!picked) return;
    const target = LANGUAGES.find((item) => item.code === lang)?.href ?? "/en";
    timer.current = window.setTimeout(() => navigate(target), 220);
  };

  const goBack = () => {
    window.clearTimeout(timer.current);
    setPicked(null);
    setPhase("language");
  };

  if (phase === "splash") return <Splash onDone={afterSplash} />;
  if (phase === "welcome") return <Welcome onStart={() => setPhase("collaboration")} />;
  if (phase === "collaboration") return <Collaboration onBack={() => setPhase("welcome")} onContinue={afterCollaboration} />;

  return (
    <main className="pb-entrance" dir={rtl ? "rtl" : "ltr"}>
      <div className="pb-entrance-top">
        <div className="pb-brand-row">
          <img src="/book-cover-icon-192.png" alt="" />
          <div className="text-start">
            <p className="text-lg font-extrabold leading-tight">Miraasu</p>
            <p className="text-[11px] uppercase tracking-[0.22em] opacity-80">Islamic Inheritance Calculator</p>
          </div>
        </div>
      </div>

      <div className="pb-entrance-sheet">
        <div className="mx-auto max-w-xl">
          <div className="mb-5 flex items-center justify-between">
            {phase === "gender" ? (
              <button type="button" onClick={goBack} className="pb-btn pb-btn-ghost px-2 text-sm">
                <ArrowLeft size={17} className="rtl:rotate-180" /> {copy.back}
              </button>
            ) : <span />}
            <div className="pb-dots" aria-hidden="true">
              <span className={phase === "language" ? "is-on" : ""} />
              <span className={phase === "gender" ? "is-on" : ""} />
            </div>
          </div>

          {phase === "language" ? (
            <section className="pb-rise">
              <p className="pb-kicker">Miraasu</p>
              <h1 className="pb-h1 mt-1">Choose Your Language</h1>
              <p className="pb-lead mt-2">Select your preferred language to continue</p>
              <div className="pb-lang-grid mt-5">
                {LANGUAGES.map((item) => {
                  const selected = lang === item.code;
                  return (
                    <button
                      key={item.code}
                      type="button"
                      lang={item.code}
                      aria-pressed={selected}
                      onClick={() => selectLanguage(item.code)}
                      className={`pb-lang-card${selected ? " is-selected" : ""}`}
                    >
                      <span className="pb-lang-mark" aria-hidden="true">{item.mark}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[15px] font-extrabold text-[#0b2a4f]" lang={item.code}>{item.native}</span>
                        <span className="block text-xs font-medium text-slate-500">{item.label}</span>
                      </span>
                      {selected ? (
                        <span className="pb-lang-check" aria-hidden="true"><Check size={17} strokeWidth={3} /></span>
                      ) : (
                        <ChevronRight size={18} className="flex-none text-[#1559a6] rtl:rotate-180" />
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="mt-6 flex items-center justify-between gap-3">
                <button type="button" onClick={() => setPhase("collaboration")} className="pb-btn pb-btn-ghost px-3 text-sm">
                  <ArrowLeft size={17} /> Back
                </button>
                <button type="button" onClick={confirmLanguage} className="pb-btn pb-btn-primary flex-1">
                  Continue <ArrowRight size={17} />
                </button>
              </div>
              {installEvent ? (
                <button type="button" onClick={installApp} className="pb-btn pb-btn-outline mt-6 block w-full text-sm">
                  <Download size={15} /> Install app
                </button>
              ) : null}
            </section>
          ) : null}

          {phase === "gender" ? (
            <section className="pb-rise" lang={lang}>
              <p className="pb-kicker">Miraasu</p>
              <h1 className="pb-h1 mt-1">{copy.title}</h1>
              <p className="pb-lead mt-2">{copy.hint}</p>
              <div className="pb-gender-grid mt-6">
                {([
                  { id: "male" as const, label: copy.male, desc: copy.maleDesc },
                  { id: "female" as const, label: copy.female, desc: copy.femaleDesc },
                ]).map(({ id, label, desc }) => {
                  const selected = picked === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => selectGender(id)}
                      className={`pb-gender-card${selected ? " is-on" : ""}`}
                    >
                      <span className="pb-avatar" aria-hidden="true"><PersonIcon /></span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[15px] font-extrabold text-[#0b2a4f]">{label}</span>
                        <span className="block text-xs font-medium text-slate-500">{desc}</span>
                      </span>
                      {selected ? (
                        <span className="pb-lang-check" aria-hidden="true"><Check size={17} strokeWidth={3} /></span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
              <div className="mt-6">
                <button
                  type="button"
                  onClick={confirmGender}
                  disabled={!picked}
                  className="pb-btn pb-btn-primary w-full disabled:opacity-40"
                >
                  {copy.continue} <ArrowRight size={17} className="rtl:rotate-180" />
                </button>
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </main>
  );
}
