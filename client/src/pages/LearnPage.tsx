/** Learn & Explore page — education hub with articles and quiz. Language switchable. */
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { LearnHub } from "@/premium/LearnHub";
import type { PremiumLang } from "@/premium/copy";

const LANGS: { code: PremiumLang; label: string }[] = [
  { code: "ta", label: "தமிழ்" },
  { code: "en", label: "English" },
  { code: "ar", label: "العربية" },
  { code: "ur", label: "اردو" },
];

export default function LearnPage() {
  const [lang, setLang] = useState<PremiumLang>(() => {
    const doc = document.documentElement.lang;
    return doc === "ta" || doc === "en" || doc === "ar" || doc === "ur" ? doc : "en";
  });
  const [backLang] = useState(() => {
    const doc = document.documentElement.lang;
    return doc === "ta" || doc === "en" || doc === "ar" || doc === "ur" ? doc : "en";
  });
  const rtl = lang === "ar" || lang === "ur";

  return (
    <div className="pb-page" dir={rtl ? "rtl" : "ltr"}>
      <header className="sticky top-0 z-40 border-b border-[#d8e6f7] bg-white/90 backdrop-blur-md">
        <div className="pb-container flex items-center justify-between gap-3 py-2.5">
          <Link href={`/${backLang}`} aria-label="Back" className="pb-icon-btn">
            <ArrowLeft size={18} className="rtl:rotate-180" />
          </Link>
          <div className="flex gap-1 rounded-full bg-[#eaf3ff] p-1">
            {LANGS.map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => setLang(l.code)}
                aria-pressed={lang === l.code}
                className={`rounded-full px-3 py-1.5 text-xs font-extrabold transition ${lang === l.code ? "bg-white text-[#1559a6] shadow" : "text-slate-500"}`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
      </header>
      <main className="pb-container py-6">
        <LearnHub key={lang} lang={lang} />
      </main>
    </div>
  );
}
