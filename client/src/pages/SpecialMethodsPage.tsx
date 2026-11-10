/**
 * Special Inheritance Methods — /special (v2).
 *
 * Calculator-first: every one of the 12 topics from the Tamil book
 * (இஸ்லாமிய வாரிசுரிமைச் சட்டம்: நவீன கணக்கீடு, cases 1–285) gets a fully
 * functional interactive calculator with its OWN layout for that method's
 * workflow (components in client/src/components/special/, wired here via
 * SPECIAL_CALCULATORS). Explanations, formulas and the book's worked
 * examples support the calculator — they never replace it.
 * Source of truth: ~/workspace/miraasu/reports/meerath-book-study.md.
 * The general calculator is untouched; this page only calls the new
 * client/src/lib/specialMethods.ts module (which reuses the engine).
 * Blue and white only. Tamil + English + Arabic (full RTL layout).
 */
import { useEffect, useState } from "react";
import { ArrowLeft, Calculator, ChevronLeft, ChevronRight, Languages } from "lucide-react";
import { SPECIAL_METHODS_PAGE_COPY, SPECIAL_TOPICS, type SpecialTopic, type WorkedExample } from "@/lib/specialMethodsContent";
import { SPECIAL_CALCULATORS } from "@/components/special";
import { ScholarBanner } from "@/components/special/shared";
import {
  fmt,
  tExampleAnswer,
  tExampleLabel,
  tExampleVariant,
  tExplanation,
  tFormula,
  tTitle,
  tx3,
  type Lang,
} from "@/components/special/types";

/** Page-copy string in the current language (Arabic falls back to English). */
const copy = SPECIAL_METHODS_PAGE_COPY;
function cp(lang: Lang, key: "pageTitle" | "pageIntro" | "topicGridHeading" | "prevLabel" | "nextLabel" | "backToCalculator" | "roundingRule" | "languageToggleLabel"): string {
  const ta = copy[`${key}Ta` as const];
  const en = copy[`${key}En` as const];
  const ar = copy[`${key}Ar` as const];
  return lang === "ta" ? ta : lang === "ar" ? (ar ?? en) : en;
}

function WorkedExamples({ examples, lang }: { examples: WorkedExample[]; lang: Lang }) {
  if (examples.length === 0) {
    return <p className="ms-special-muted">{tx3(lang, "இந்தப் பகுதிக்கு நூல் எடுத்துக்காட்டுக் கணக்கு எதையும் தரவில்லை.", "The book gives no worked example for this topic.", "لا يعطي الكتاب مثالًا عمليًا لهذا الموضوع.")}</p>;
  }
  return (
    <div className="ms-special-examples">
      {examples.map((ex) => {
        const variant = tExampleVariant(ex, lang);
        return (
          <article key={`${ex.caseNo}-${ex.variantEn ?? ""}`} className="ms-special-example">
            <h4 className="ms-special-example-title">
              {tx3(lang, "கணக்கு", "Case", "الحالة")} {ex.caseNo}
              {variant ? ` — ${variant}` : ""} — {tx3(lang, "சொத்து", "Estate", "التركة")} ₹{fmt(ex.estate)}
            </h4>
            <table className="ms-special-result-table">
              <thead>
                <tr>
                  <th scope="col">{tx3(lang, "வாரிசு", "Heir", "الوارث")}</th>
                  <th scope="col">{tx3(lang, "பங்கு", "Share", "الحصة")}</th>
                  <th scope="col" className="ms-num">{tx3(lang, "தொகை", "Amount", "المبلغ")}</th>
                </tr>
              </thead>
              <tbody>
                {ex.steps.map((s, i) => (
                  <tr key={i}>
                    <td>{tExampleLabel(s, lang)}</td>
                    <td>{s.fraction}</td>
                    <td className="ms-num">₹{fmt(s.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="ms-special-example-answer">{tExampleAnswer(ex, lang)}</p>
          </article>
        );
      })}
    </div>
  );
}

function SupportBlock({ topic, lang }: { topic: SpecialTopic; lang: Lang }) {
  return (
    <details className="ms-collapsible ms-special-support">
      <summary className="ms-collapse-title">
        {tx3(lang, "விளக்கம், சூத்திரம், நூலின் எடுத்துக்காட்டுகள்", "Explanation, formula & book examples", "الشرح والصيغة وأمثلة الكتاب")}
      </summary>
      <div className="ms-special-support-body">
        <h4 className="ms-special-support-title">{tx3(lang, "சூத்திரம்", "Formula", "الصيغة")}</h4>
        <p className="ms-special-formula">{tFormula(topic, lang)}</p>
        <h4 className="ms-special-support-title">{tx3(lang, "விளக்கம்", "Explanation", "الشرح")}</h4>
        {tExplanation(topic, lang).map((p, i) => (
          <p key={i} className="ms-special-para">{p}</p>
        ))}
        <h4 className="ms-special-support-title">{tx3(lang, "நூலின் எடுத்துக்காட்டுகள்", "Worked examples from the book", "أمثلة عملية من الكتاب")}</h4>
        <WorkedExamples examples={topic.workedExamples} lang={lang} />
      </div>
    </details>
  );
}

export default function SpecialMethodsPage() {
  const [lang, setLang] = useState<Lang>("ta");
  const rtl = lang === "ar";
  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = cp(lang, "pageTitle");
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  }, [lang]);
  return (
    <div className="ms-special-page" dir={rtl ? "rtl" : "ltr"}>
      <header className="ms-special-header">
        <div className="ms-special-header-inner">
          <a href="/" className="ms-special-back">
            <ArrowLeft size={17} /> {cp(lang, "backToCalculator")}
          </a>
          <div className="ms-special-lang" role="group" aria-label={cp(lang, "languageToggleLabel")}>
            <Languages size={15} aria-hidden="true" />
            {(["ta", "en", "ar"] as const).map((l) => (
              <button key={l} type="button" aria-pressed={lang === l} onClick={() => setLang(l)} className={`ms-special-lang-btn ${lang === l ? "is-on" : ""}`}>
                {l === "ta" ? "தமிழ்" : l === "en" ? "English" : "العربية"}
              </button>
            ))}
          </div>
        </div>
      </header>
      <main className="ms-special-main">
        <section className="ms-special-hero">
          <p className="ms-special-eyebrow">{tx3(lang, "மீராஸ் · சிறப்பு முறைகள்", "Miraasu · Special methods", "ميراث · طرق خاصة")}</p>
          <h1 className="ms-special-title">{cp(lang, "pageTitle")}</h1>
          <p className="ms-special-intro">{cp(lang, "pageIntro")}</p>
          <p className="ms-special-rounding">{cp(lang, "roundingRule")}</p>
        </section>

        <nav className="ms-special-grid" aria-label={cp(lang, "topicGridHeading")}>
          <h2 className="ms-special-grid-heading">{cp(lang, "topicGridHeading")}</h2>
          <div className="ms-special-grid-cards">
            {SPECIAL_TOPICS.map((t, i) => (
              <a key={t.id} href={`#${t.id}`} className="ms-special-grid-card">
                <span className="ms-special-grid-num">{String(i + 1).padStart(2, "0")}</span>
                <span className="ms-special-grid-title">{tTitle(t, lang)}</span>
                <span className="ms-special-grid-ar" lang="ar" dir="rtl">{t.arabicTerm}</span>
                <span className="ms-special-grid-ref">{t.bookRef}</span>
              </a>
            ))}
          </div>
        </nav>

        {SPECIAL_TOPICS.map((topic, i) => {
          const Calc = SPECIAL_CALCULATORS[topic.id];
          const prev = i > 0 ? SPECIAL_TOPICS[i - 1] : null;
          const next = i < SPECIAL_TOPICS.length - 1 ? SPECIAL_TOPICS[i + 1] : null;
          const subTitle = lang === "ta" ? topic.titleEn : lang === "ar" ? topic.titleEn : topic.titleTa;
          return (
            <section key={topic.id} id={topic.id} className="ms-special-topic" aria-labelledby={`h-${topic.id}`}>
              <header className="ms-special-topic-head">
                <p className="ms-special-topic-num">{String(i + 1).padStart(2, "0")}</p>
                <div>
                  <h2 id={`h-${topic.id}`} className="ms-special-topic-title">
                    {tTitle(topic, lang)}
                    <span className="ms-special-topic-ar" lang="ar" dir="rtl"> {topic.arabicTerm}</span>
                  </h2>
                  <p className="ms-special-topic-sub">{subTitle}</p>
                </div>
                <span className="ms-special-book-chip">{topic.bookRef}</span>
              </header>
              <ScholarBanner topic={topic} lang={lang} />
              <div className="ms-special-calc">
                <div className="ms-special-calc-head">
                  <Calculator size={18} aria-hidden="true" />
                  <h3>{tx3(lang, "கணக்கீட்டாளர்", "Calculator", "الحاسبة")}</h3>
                </div>
                {Calc ? <Calc topic={topic} lang={lang} /> : null}
              </div>
              <SupportBlock topic={topic} lang={lang} />
              <nav className="ms-special-prevnext" aria-label={tx3(lang, "தலைப்புகள்", "Topics", "المواضيع")}>
                {prev ? (
                  <a href={`#${prev.id}`} className="ms-special-prevnext-link">
                    {rtl ? <ChevronRight size={16} /> : <ChevronLeft size={16} />} {cp(lang, "prevLabel")} — {tTitle(prev, lang)}
                  </a>
                ) : <span />}
                {next ? (
                  <a href={`#${next.id}`} className="ms-special-prevnext-link ms-special-next">
                    {cp(lang, "nextLabel")} — {tTitle(next, lang)} {rtl ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                  </a>
                ) : <span />}
              </nav>
            </section>
          );
        })}

        <footer className="ms-special-footer">
          <p>
            {tx3(lang,
              "ஆதாரம்: இஸ்லாமிய வாரிசுரிமைச் சட்டம்: நவீன கணக்கீடு — மௌலவி டாக்டர் எஸ்.ஏ. உஸ்மான் அலி ஹஸனி (நவம்பர் 2024). இந்தப் பக்கம் கற்றல் உதவி மட்டுமே; உண்மையான பிரிவுக்கு முன் தகுதியான அறிஞரிடம் உறுதி செய்க.",
              "Source: Islamic Inheritance Law: Modern Calculation — Maulvi Dr. S.A. Usman Ali Hasani (November 2024). This page is a learning aid only; confirm any real distribution with a qualified scholar.",
              "المصدر: قانون الميراث الإسلامي: الحساب الحديث — مولوي د. س. أ. عثمان علي حسني (نوفمبر 2024). هذه الصفحة وسيلة تعليمية فقط؛ أكّد أي توزيع حقيقي مع عالم مؤهل.")}
          </p>
          <a href="/" className="ms-special-back">{tx3(lang, "கணக்கீட்டிற்குத் திரும்பு", "Back to the calculator", "العودة إلى الحاسبة")}</a>
        </footer>
      </main>
    </div>
  );
}
