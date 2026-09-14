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
  ta: { back: "பின்", next: "தொடர்க", continue: "தொடர்க", chooseLanguage: "மொழியைத் தேர்ந்தெடுக்கவும்", chooseGender: "இறந்தவரின் பாலினத்தைத் தேர்ந்தெடுக்கவும்", male: "ஆண்", female: "பெண்", maleHint: "ஆண் இறந்தவர்", femaleHint: "பெண் இறந்தவர்", title: "மீராஸுக்கு வரவேற்கிறோம்", subtitle: "தெளிவான வழிகாட்டியுடன் தொடங்குங்கள்.", start: "தொடங்கலாம்", hadith: "கடமையான பங்குகளை உரியவர்களுக்கு வழங்குங்கள்; மீதம் நெருங்கிய ஆண் உறவினருக்குரியது.", source: "ஸஹீஹ் புகாரி 6732; முஸ்லிம் 1615" },
  en: { back: "Back", next: "Continue", continue: "Continue", chooseLanguage: "Choose your language", chooseGender: "Who has passed away?", male: "Male", female: "Female", maleHint: "Male deceased", femaleHint: "Female deceased", title: "Welcome to Miraasu", subtitle: "Begin with a clear and trusted guide.", start: "Get started", hadith: "Give the prescribed shares to those entitled, and what remains goes to the nearest male relative.", source: "Sahih al-Bukhari 6732; Sahih Muslim 1615" },
  ar: { back: "رجوع", next: "متابعة", continue: "متابعة", chooseLanguage: "اختر لغتك", chooseGender: "من المتوفى؟", male: "رجل", female: "امرأة", maleHint: "المتوفى رجل", femaleHint: "المتوفاة امرأة", title: "مرحباً بك في ميراث", subtitle: "ابدأ بدليل واضح وموثوق.", start: "ابدأ الآن", hadith: "أعطوا الفرائض أهلها، فما بقي فلأولى رجل ذكر.", source: "صحيح البخاري 6732؛ صحيح مسلم 1615", },
} as const;

function saveAndOpen(language: AppLanguage, gender: Gender, setLocation: (path: string) => void) {
  localStorage.setItem("miraasu_onboarding", JSON.stringify({ language, deceasedGender: gender, completedAt: new Date().toISOString() }));
  setLocation(`${language === "ta" ? "/ta" : language === "ar" ? "/ar" : "/en"}?start=1`);
}

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const [stage, setStage] = useState<Stage>("welcome");
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
        {stage === "welcome" ? <div className="page-enter overflow-hidden rounded-[2rem] border border-[#d8c7a0] bg-white text-center shadow-[0_24px_70px_rgba(19,61,118,0.14)]">
          <div className="relative h-52 overflow-hidden bg-[#17265f] sm:h-64"><img src="/miraasu-book-cover.jpg" alt="Miraasu inheritance book cover" className="h-full w-full object-cover object-center opacity-90" /><div className="absolute inset-0 bg-gradient-to-t from-[#101b4b]/80 via-transparent to-transparent" /><div className="absolute bottom-4 left-5 text-left text-white"><p className="text-xs font-extrabold uppercase tracking-[0.25em] text-amber-200">Miraasu</p><p className="mt-1 text-sm font-semibold text-white/90">Islamic inheritance guide</p></div></div>
          <div className="px-6 py-8 sm:px-10 sm:py-10"><p className="text-sm font-extrabold uppercase tracking-[0.2em] text-[#133D76]">Miraasu</p><h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">{t.title}</h1><p className="mx-auto mt-4 max-w-md text-base leading-7 text-slate-600">{t.subtitle}</p><blockquote className="mx-auto mt-7 max-w-md border-y border-amber-200 bg-amber-50/60 px-4 py-4 text-sm font-semibold leading-6 text-slate-700">“{t.hadith}”<cite className="mt-2 block text-xs font-bold not-italic text-amber-800">— {t.source}</cite></blockquote><button type="button" onClick={() => setStage("language")} className="mt-8 inline-flex min-h-14 w-full max-w-sm items-center justify-center gap-3 rounded-2xl bg-[#133D76] px-6 text-base font-extrabold text-white shadow-lg shadow-blue-200 transition hover:bg-[#102f5e] focus:outline-none focus:ring-4 focus:ring-blue-200 active:scale-[0.99]">{t.start}<ArrowRight size={19} /></button></div>
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
          <div className="mt-8 grid gap-4 sm:grid-cols-2">{(["male", "female"] as Gender[]).map((value) => { const selected = gender === value; const isMale = value === "male"; return <button key={value} type="button" onClick={() => setGender(value)} className={`rounded-3xl border bg-white p-6 text-center shadow-sm transition ${selected ? "border-[#133D76] ring-4 ring-blue-100" : "border-slate-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"}`}><span className={`mx-auto grid size-24 place-items-center rounded-[2rem] ${isMale ? "bg-blue-50 text-[#133D76]" : "bg-rose-50 text-rose-700"}`}><UserRound size={44} strokeWidth={1.7} /></span><span className="mt-5 block text-xl font-black">{isMale ? t.male : t.female}</span><span className="mt-1 block text-xs font-semibold text-slate-500">{isMale ? t.maleHint : t.femaleHint}</span>{selected ? <span className="mx-auto mt-4 grid size-8 place-items-center rounded-full bg-[#133D76] text-white"><Check size={16} /></span> : null}</button>; })}</div>
          <div className="mt-8 flex gap-3"><button type="button" onClick={() => setStage("language")} className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600"><ArrowLeft size={17} />{t.back}</button><button type="button" disabled={!gender} onClick={() => gender && saveAndOpen(language, gender, setLocation)} className="inline-flex min-h-12 flex-[1.5] items-center justify-center gap-2 rounded-xl bg-[#133D76] px-4 text-sm font-extrabold text-white shadow-sm enabled:hover:bg-[#102f5e] disabled:cursor-not-allowed disabled:opacity-40">{t.continue}<ArrowRight size={17} /></button></div>
        </div> : null}
      </section>
      <footer className="pb-2 text-center text-xs text-slate-400">© Miraasu · Clear shares, careful decisions</footer>
    </div>
  </main>;
}
