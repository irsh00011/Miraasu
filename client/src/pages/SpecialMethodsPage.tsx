/**
 * Special Inheritance Methods — /special hub + /special/:topic detail (v4).
 *
 * Hub-and-spoke: /special shows a grid of 12 topic cards; clicking a card
 * opens /special/:topic with ONLY that topic's calculator. Each topic keeps
 * its own calculator component (components in client/src/components/special/,
 * wired here via SPECIAL_CALCULATORS) and its worked examples, in a
 * collapsible block. Source of truth:
 * ~/workspace/miraasu/reports/meerath-book-study.md.
 * The general calculator is untouched; this page only calls the new
 * client/src/lib/specialMethods.ts module (which reuses the engine).
 * Blue and white only. Tamil + English + Arabic (full RTL layout).
 *
 * v4 (redesign spec §1 + build plan step 4):
 * - Hub cards: number, title, ONE short line, small Arabic term, small
 *   book chip (fix 10) — nothing else on the card.
 * - Detail: one clean top bar (back + title + language toggle, NOT sticky,
 *   fix 9); title + one line only (fix 1); the scholar banner no longer
 *   sits above the inputs — flags live where they apply, at the result
 *   (fix 2). Routes unchanged (/special, /special/:topic).
 * - The 12 per-topic calculators are NOT rebuilt in this batch; they keep
 *   rendering inside the new detail shell.
 */
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { SPECIAL_METHODS_PAGE_COPY, SPECIAL_TOPICS, type SpecialTopic, type WorkedExample } from "@/lib/specialMethodsContent";
import { SPECIAL_CALCULATORS } from "@/components/special";
import { SpecialTopBar } from "@/components/special/shared";
import {
  fmt,
  tCardLine,
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
function cp(lang: Lang, key: "pageTitle" | "pageIntro" | "topicGridHeading" | "backToCalculator" | "roundingRule" | "languageToggleLabel"): string {
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

function HubView({ lang }: { lang: Lang }) {
  return (
    <>
      <section className="ms-special-hero">
        <h1 className="ms-special-title">{cp(lang, "pageTitle")}</h1>
        <p className="ms-special-intro">{cp(lang, "pageIntro")}</p>
      </section>

      <nav className="ms-special-grid" aria-label={cp(lang, "topicGridHeading")}>
        <div className="ms-special-grid-cards">
          {SPECIAL_TOPICS.map((t, i) => (
            <Link key={t.id} href={`/special/${t.id}`} className="ms-special-grid-card">
              <span className="ms-special-grid-num">{String(i + 1).padStart(2, "0")}</span>
              <span className="ms-special-grid-title">{tTitle(t, lang)}</span>
              <span className="ms-special-grid-line">{tCardLine(t, lang)}</span>
              <span className="ms-special-grid-ar" lang="ar" dir="rtl">{t.arabicTerm}</span>
              <span className="ms-special-grid-ref">{t.bookRef}</span>
            </Link>
          ))}
        </div>
      </nav>

      <footer className="ms-special-footer">
        <p>
          {tx3(lang,
            "ஆதாரம்: இஸ்லாமிய வாரிசுரிமைச் சட்டம்: நவீன கணக்கீடு — மௌலவி டாக்டர் எஸ்.ஏ. உஸ்மான் அலி ஹஸனி (நவம்பர் 2024). இந்தப் பக்கம் கற்றல் உதவி மட்டுமே; உண்மையான பிரிவுக்கு முன் தகுதியான அறிஞரிடம் உறுதி செய்க.",
            "Source: Islamic Inheritance Law: Modern Calculation — Maulvi Dr. S.A. Usman Ali Hasani (November 2024). This page is a learning aid only; confirm any real distribution with a qualified scholar.",
            "المصدر: قانون الميراث الإسلامي: الحساب الحديث — مولوي د. س. أ. عثمان علي حسني (نوفمبر 2024). هذه الصفحة وسيلة تعليمية فقط؛ أكّد أي توزيع حقيقي مع عالم مؤهل.")}
        </p>
      </footer>
    </>
  );
}

function DetailView({ topic, index, lang }: { topic: SpecialTopic; index: number; lang: Lang }) {
  const Calc = SPECIAL_CALCULATORS[topic.id];
  return (
    <section className="ms-special-topic ms-special-detail" aria-labelledby="h-detail">
      <header className="ms4-detail-head">
        <p className="ms4-detail-num">{String(index + 1).padStart(2, "0")}</p>
        <h2 id="h-detail">
          {tTitle(topic, lang)}
          <span className="ms-special-topic-ar" lang="ar" dir="rtl"> {topic.arabicTerm}</span>
        </h2>
        <p>{tCardLine(topic, lang)}</p>
        <span className="ms4-book-chip">{topic.bookRef}</span>
      </header>
      <div className="ms-special-calc">
        {Calc ? <Calc topic={topic} lang={lang} /> : null}
      </div>
      <SupportBlock topic={topic} lang={lang} />
      <p className="ms-special-detail-back">
        <Link href="/special" className="ms-special-back">
          <ArrowLeft size={17} /> {tx3(lang, "அனைத்து முறைகள்", "All methods", "كل الطرق")}
        </Link>
      </p>
    </section>
  );
}

export default function SpecialMethodsPage({ params }: { params?: { topic?: string } }) {
  const [lang, setLang] = useState<Lang>("ta");
  const rtl = lang === "ar";
  const topic = params?.topic ? SPECIAL_TOPICS.find((t) => t.id === params.topic) ?? null : null;
  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = cp(lang, "pageTitle");
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  }, [lang, params?.topic]);
  return (
    <div className="ms-special-page" dir={rtl ? "rtl" : "ltr"}>
      <SpecialTopBar
        title={topic ? tTitle(topic, lang) : cp(lang, "pageTitle")}
        lang={lang}
        onLangChange={setLang}
        backHref={topic ? "/special" : "/"}
        backLabel={topic ? undefined : cp(lang, "backToCalculator")}
      />
      <main className="ms-special-main">
        {topic ? <DetailView topic={topic} index={SPECIAL_TOPICS.indexOf(topic)} lang={lang} /> : <HubView lang={lang} />}
      </main>
    </div>
  );
}
