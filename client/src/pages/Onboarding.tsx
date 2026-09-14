import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, Check, Languages, UserRound } from "lucide-react";
import { useLocation } from "wouter";
import { LedgerBrandMark } from "@/components/LedgerBrandMark";
import type { AppLanguage } from "@/lib/inheritance";

type Stage = "welcome" | "language" | "gender";
type Gender = "male" | "female";

const languageOptions: Array<{ value: AppLanguage; native: string; english: string; direction?: "rtl" }> = [
  { value: "ta", native: "தமிழ்", english: "Tamil" },
  { value: "en", native: "English", english: "English" },
  { value: "ar", native: "العربية", english: "Arabic", direction: "rtl" },
];

const copy = {
  ta: { back: "பின்", next: "தொடர்க", continue: "தொடர்க", chooseLanguage: "மொழியைத் தேர்ந்தெடுக்கவும்", chooseGender: "இறந்தவரின் பாலினத்தைத் தேர்ந்தெடுக்கவும்", male: "ஆண்", female: "பெண்", maleHint: "ஆண் இறந்தவர்", femaleHint: "பெண் இறந்தவர்", title: "மீராஸுக்கு வரவேற்கிறோம்", subtitle: "இஸ்லாமிய வாரிசுப் பங்கீட்டை தெளிவாகவும் எளிமையாகவும் கணக்கிடுங்கள்.", start: "தொடங்கலாம்", privacy: "உங்கள் தகவல்கள் இந்த சாதனத்திலேயே இருக்கும்." },
  en: { back: "Back", next: "Continue", continue: "Continue", chooseLanguage: "Choose your language", chooseGender: "Who has passed away?", male: "Male", female: "Female", maleHint: "Male deceased", femaleHint: "Female deceased", title: "Welcome to Miraasu", subtitle: "Calculate Islamic inheritance shares clearly, calmly, and with confidence.", start: "Get started", privacy: "Your information stays on this device." },
  ar: { back: "رجوع", next: "متابعة", continue: "متابعة", chooseLanguage: "اختر لغتك", chooseGender: "من المتوفى؟", male: "رجل", female: "امرأة", maleHint: "المتوفى رجل", femaleHint: "المتوفاة امرأة", title: "مرحباً بك في ميراث", subtitle: "احسب أنصبة الميراث الإسلامي بوضوح وبساطة وثقة.", start: "ابدأ الآن", privacy: "تبقى معلوماتك على هذا الجهاز.", },
} as const;

function saveAndOpen(language: AppLanguage, gender: Gender, setLocation: (path: string) => void) {
  localStorage.setItem("miraasu_onboarding", JSON.stringify({ language, deceasedGender: gender, completedAt: new Date().toISOString() }));
  setLocation(`${language === "ta" ? "/ta" : language === "ar" ? "/ar" : "/en"}?start=1`);
}

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const [stage, setStage] = useState<Stage>(() => {
    try { return localStorage.getItem("miraasu_onboarding") ? "gender" : "welcome"; } catch { return "welcome"; }
  });
  const [language, setLanguage] = useState<AppLanguage>(() => {
    try { return (JSON.parse(localStorage.getItem("miraasu_onboarding") ?? "{}").language as AppLanguage) || "ta"; } catch { return "ta"; }
  });
  const [gender, setGender] = useState<Gender | null>(null);
  const t = copy[language];
  const progress = stage === "welcome" ? 1 : stage === "language" ? 2 : 3;

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.title = language === "ta" ? "மீராஸு" : language === "ar" ? "ميراث" : "Miraasu";
  }, [language]);

  return <main className="min-h-screen bg-[#f7f9fc] px-4 py-5 text-slate-950 sm:px-6 sm:py-8">
    <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] max-w-xl flex-col">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-2xl bg-white shadow-sm ring-1 ring-blue-100"><LedgerBrandMark className="size-7" /></span><div><p className="text-sm font-extrabold tracking-tight">Miraasu</p><p className="text-[11px] text-slate-500">Inheritance calculator</p></div></div>
        <span className="rounded-full bg-white px-3 py-2 text-xs font-bold text-slate-500 shadow-sm ring-1 ring-slate-100">{progress} / 3</span>
      </header>

      <div className="mt-8 flex gap-2" aria-label={`Onboarding step ${progress} of 3`}>{[1, 2, 3].map((item) => <span key={item} className={`h-1.5 flex-1 rounded-full ${item <= progress ? "bg-[#133D76]" : "bg-slate-200"}`} />)}</div>

      <section className="flex flex-1 flex-col justify-center py-10">
        {stage === "welcome" ? <div className="page-enter text-center">
          <div className="mx-auto grid size-24 place-items-center rounded-[2rem] bg-[#133D76] shadow-xl shadow-blue-200"><BookOpen className="text-white" size={42} strokeWidth={1.6} /></div>
          <p className="mt-8 text-sm font-extrabold uppercase tracking-[0.2em] text-[#133D76]">Miraasu</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">{t.title}</h1>
          <p className="mx-auto mt-5 max-w-md text-base leading-7 text-slate-600">{t.subtitle}</p>
          <button type="button" onClick={() => setStage("language")} className="mt-9 inline-flex min-h-14 w-full max-w-sm items-center justify-center gap-3 rounded-2xl bg-[#133D76] px-6 text-base font-extrabold text-white shadow-lg shadow-blue-200 transition hover:bg-[#102f5e] focus:outline-none focus:ring-4 focus:ring-blue-200 active:scale-[0.99]">{t.start}<ArrowRight size={19} /></button>
          <p className="mt-5 text-xs text-slate-400">{t.privacy}</p>
        </div> : null}

        {stage === "language" ? <div className="page-enter">
          <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-blue-50 text-[#133D76]"><Languages size={28} /></div>
          <h1 className="mt-6 text-center text-3xl font-black tracking-tight">{t.chooseLanguage}</h1>
          <div className="mt-8 space-y-3">{languageOptions.map((option) => <button key={option.value} type="button" dir={option.direction ?? "ltr"} onClick={() => setLanguage(option.value)} className={`flex min-h-20 w-full items-center justify-between rounded-2xl border bg-white px-5 text-left shadow-sm transition ${language === option.value ? "border-[#133D76] ring-4 ring-blue-100" : "border-slate-200 hover:border-blue-200 hover:bg-blue-50/30"}`}><span><span className="block text-lg font-extrabold text-slate-950">{option.native}</span><span className="mt-1 block text-xs font-semibold text-slate-500">{option.english}</span></span>{language === option.value ? <span className="grid size-8 place-items-center rounded-full bg-[#133D76] text-white"><Check size={17} /></span> : <span className="size-8 rounded-full border border-slate-200" />}</button>)}</div>
          <div className="mt-8 flex gap-3"><button type="button" onClick={() => setStage("welcome")} className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600"><ArrowLeft size={17} />{t.back}</button><button type="button" onClick={() => setStage("gender")} className="inline-flex min-h-12 flex-[1.5] items-center justify-center gap-2 rounded-xl bg-[#133D76] px-4 text-sm font-extrabold text-white shadow-sm">{t.continue}<ArrowRight size={17} /></button></div>
        </div> : null}

        {stage === "gender" ? <div className="page-enter">
          <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-blue-50 text-[#133D76]"><UserRound size={28} /></div>
          <h1 className="mt-6 text-center text-3xl font-black tracking-tight">{t.chooseGender}</h1>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">{(["male", "female"] as Gender[]).map((value) => { const selected = gender === value; const isMale = value === "male"; return <button key={value} type="button" onClick={() => setGender(value)} className={`min-h-40 rounded-3xl border bg-white p-5 text-center shadow-sm transition ${selected ? "border-[#133D76] ring-4 ring-blue-100" : "border-slate-200 hover:border-blue-200"}`}><span className={`mx-auto grid size-14 place-items-center rounded-2xl ${isMale ? "bg-blue-50 text-[#133D76]" : "bg-rose-50 text-rose-700"}`}><UserRound size={28} /></span><span className="mt-4 block text-xl font-black">{isMale ? t.male : t.female}</span><span className="mt-1 block text-xs font-semibold text-slate-500">{isMale ? t.maleHint : t.femaleHint}</span></button>; })}</div>
          <div className="mt-8 flex gap-3"><button type="button" onClick={() => setStage("language")} className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600"><ArrowLeft size={17} />{t.back}</button><button type="button" disabled={!gender} onClick={() => gender && saveAndOpen(language, gender, setLocation)} className="inline-flex min-h-12 flex-[1.5] items-center justify-center gap-2 rounded-xl bg-[#133D76] px-4 text-sm font-extrabold text-white shadow-sm enabled:hover:bg-[#102f5e] disabled:cursor-not-allowed disabled:opacity-40">{t.continue}<ArrowRight size={17} /></button></div>
        </div> : null}
      </section>
      <footer className="pb-2 text-center text-xs text-slate-400">© Miraasu · Clear shares, careful decisions</footer>
    </div>
  </main>;
}
