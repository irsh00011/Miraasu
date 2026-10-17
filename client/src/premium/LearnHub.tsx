/** Learn & Explore hub: topic cards → articles (Asabah reuses the existing AsabaGuide) → quiz. */
import { useState } from "react";
import { ArrowLeft, ArrowRight, Award, BookOpenText, ChevronRight, Percent, PieChart, RotateCcw, Scale, Sigma, Users } from "lucide-react";
import { PbButton } from "@/premium/ui";
import { learnArticles, premiumCopy, type PremiumLang } from "@/premium/copy";
import { AsabaGuide } from "@/components/AsabaGuide";

const cardIcons = [Percent, Sigma, Scale, PieChart, Users, Award] as const;

function Quiz({ lang, onBack }: { lang: PremiumLang; onBack: () => void }) {
  const t = premiumCopy[lang];
  const rtl = lang === "ar" || lang === "ur";
  const [picked, setPicked] = useState<(number | null)[]>(() => t.quiz.map(() => null));
  const [done, setDone] = useState(false);
  const score = t.quiz.filter((q, i) => picked[i] === q.answer).length;

  const reset = () => { setPicked(t.quiz.map(() => null)); setDone(false); };

  return (
    <div dir={rtl ? "rtl" : "ltr"}>
      <button type="button" onClick={onBack} className="pb-btn pb-btn-ghost px-2 text-sm">
        {rtl ? <ArrowRight size={16} /> : <ArrowLeft size={16} />} {t.articleBack}
      </button>
      <h2 className="pb-h2 mt-3">{t.quizTitle}</h2>
      <p className="pb-lead mt-1">{t.quizSub}</p>
      <div className="mt-4 grid gap-4">
        {t.quiz.map((q, qi) => (
          <div key={qi} className="pb-card pb-card-pad">
            <p className="font-bold text-[#0b2a4f]">{qi + 1}. {q.q}</p>
            <div className="mt-3 grid gap-2">
              {q.opts.map((opt, oi) => {
                const chosen = picked[qi] === oi;
                const reveal = done || picked[qi] !== null;
                const right = oi === q.answer;
                return (
                  <button
                    key={oi}
                    type="button"
                    disabled={picked[qi] !== null}
                    onClick={() => setPicked((p) => p.map((v, i) => (i === qi ? oi : v)))}
                    className={`pb-quiz-opt ${reveal && right ? "is-right" : ""} ${chosen && !right ? "is-wrong" : ""}`}
                  >
                    <span className="num">{opt}</span>
                  </button>
                );
              })}
            </div>
            {picked[qi] !== null ? <p className="mt-2 text-[13px] leading-6 text-slate-500">{q.why}</p> : null}
          </div>
        ))}
      </div>
      <div className="pb-card pb-card-pad mt-4 text-center">
        {!done ? (
          <PbButton block onClick={() => setDone(true)} disabled={picked.some((p) => p === null)}>
            {t.quizDone}
          </PbButton>
        ) : (
          <div className="pb-rise">
            <p className="pb-kicker">{t.quizScore}</p>
            <p className="num mt-1 text-4xl font-extrabold text-[#0b2a4f]">{score} / {t.quiz.length}</p>
            <PbButton variant="outline" className="mt-4" onClick={reset}>
              <RotateCcw size={16} /> {t.quizRetry}
            </PbButton>
          </div>
        )}
      </div>
    </div>
  );
}

export function LearnHub({ lang }: { lang: PremiumLang }) {
  const t = premiumCopy[lang];
  const rtl = lang === "ar" || lang === "ur";
  const [open, setOpen] = useState<number | null>(null);
  const articles = learnArticles[lang];

  if (open !== null) {
    if (open === 5) return <Quiz lang={lang} onBack={() => setOpen(null)} />;
    const article = articles[open];
    return (
      <div dir={rtl ? "rtl" : "ltr"} className="pb-rise">
        <button type="button" onClick={() => setOpen(null)} className="pb-btn pb-btn-ghost px-2 text-sm">
          {rtl ? <ArrowRight size={16} /> : <ArrowLeft size={16} />} {t.articleBack}
        </button>
        <h2 className="pb-h2 mt-3">{article.title}</h2>
        {open === 2 && lang !== "ur" ? (
          <div className="mt-4"><AsabaGuide language={lang} /></div>
        ) : open === 2 ? (
          <>
            <p className="pb-lead mt-2">مقررہ حصوں کے بعد باقی ترکہ اس ترجیحی ترتیب سے جاتا ہے۔</p>
            <ul className="mt-4 grid gap-2">
              {[
                "پہلا: بیٹا ← پوتا ← نچلی مذکر اولاد",
                "دوسرا: باپ ← دادا ← اوپر کے مذکر اصول",
                "تیسرا: سگا بھائی ← باپ کی طرف کا بھائی ← ان کے بیٹے",
                "چوتھا: سگا چچا (عم) ← باپ کی طرف کا چچا ← ان کے بیٹے",
                "مخلوط گروہ میں: مرد = 2 حصے، عورت = 1 حصہ",
              ].map((b) => (
                <li key={b} className="pb-card flex gap-3 px-4 py-3 text-[14px] leading-6 text-slate-700">
                  <span aria-hidden="true" className="mt-1.5 h-2 w-2 flex-none rounded-full bg-[#1559a6]" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <>
            <p className="pb-lead mt-2">{article.intro}</p>
            <ul className="mt-4 grid gap-2">
              {article.bullets.map((b) => (
                <li key={b} className="pb-card flex gap-3 px-4 py-3 text-[14px] leading-6 text-slate-700">
                  <span aria-hidden="true" className="mt-1.5 h-2 w-2 flex-none rounded-full bg-[#1559a6]" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    );
  }

  return (
    <div dir={rtl ? "rtl" : "ltr"}>
      <p className="pb-kicker">{t.learnTitle}</p>
      <h1 className="pb-h1 mt-1">{t.learnTitle}</h1>
      <p className="pb-lead mt-2">{t.learnSub}</p>
      <div className="pb-learn-grid mt-5">
        {t.learnCards.map((card, i) => {
          const Icon = cardIcons[i % cardIcons.length];
          return (
            <button key={card.title} type="button" className="pb-learn-card" onClick={() => setOpen(i)}>
              <span className="pb-feat-icon"><Icon size={19} /></span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-extrabold text-[#0b2a4f]">{card.title}</span>
                <span className="mt-0.5 block truncate text-[12px] text-slate-500">{card.sub}</span>
              </span>
              <ChevronRight size={18} className="flex-none text-[#1559a6] rtl:rotate-180" />
            </button>
          );
        })}
      </div>
      <p className="mt-6 flex items-start gap-2 text-[12px] leading-5 text-slate-400">
        <BookOpenText size={14} className="mt-0.5 flex-none" />
        {lang === "ta" ? "இவை கல்வி நோக்கத்திற்கான எளிய விளக்கங்கள்; உண்மையான பங்கீட்டிற்கு அறிஞரை அணுகவும்."
          : lang === "ar" ? "هذه شروح مبسطة لأغراض تعليمية؛ للقسمة الفعلية راجع مختصًا."
          : lang === "ur" ? "یہ تعلیمی مقصد کے لیے آسان وضاحتیں ہیں؛ اصل تقسیم کے لیے عالم سے رجوع کریں۔"
          : "Simplified explanations for learning; consult a scholar for real distributions."}
      </p>
    </div>
  );
}
