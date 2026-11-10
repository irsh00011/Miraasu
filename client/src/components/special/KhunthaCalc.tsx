/**
 * 8. Khuntha — intersex heir (book §4.8, p. 323; cases 280–281).
 * Scholarly-opinion comparison: all three views side by side (Shafi'i,
 * Abu Hanifa, prevailing), labelled — none preselected as "the answer".
 * Male/female scenario tables sit above the three views.
 */
import { useState } from "react";
import { calculateKhuntha, type KhunthaRole } from "@/lib/specialMethods";
import type { HeirInput } from "@/lib/inheritance";
import { errEstate, errHeirs, fmt, tHint, tx3, type TopicCalcProps } from "./types";
import { hasAnyHeir, preloadHeirs } from "./heirMeta";
import {
  CalcButton,
  CalcError,
  FinalAnswer,
  HeirPicker,
  HeldLine,
  LoadExampleButton,
  MoneyField,
  ResetButton,
  ResultNotes,
  ResultTable,
  StepHeading,
} from "./shared";

export default function KhunthaCalc({ topic, lang }: TopicCalcProps) {
  const [estate, setEstate] = useState(topic.preload.estate);
  const [heirs, setHeirs] = useState<HeirInput>(() => preloadHeirs(topic.preload.heirs));
  const [role, setRole] = useState<KhunthaRole>("child");
  const [result, setResult] = useState<ReturnType<typeof calculateKhuntha> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const compute = (e: number, h: HeirInput, r: KhunthaRole) => {
    if (!(e > 0)) { setResult(null); setError(errEstate(lang)); return; }
    if (!hasAnyHeir(h)) { setResult(null); setError(errHeirs(lang)); return; }
    try {
      setResult(calculateKhuntha({ estate: e, heirs: h, role: r }));
      setError(null);
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const load = () => {
    const e = 3000;
    const h = preloadHeirs({ sons: 1, daughters: 1 });
    setEstate(e);
    setHeirs(h);
    setRole("child");
    compute(e, h, "child");
  };

  const reset = () => {
    setEstate(topic.preload.estate);
    setHeirs(preloadHeirs(topic.preload.heirs));
    setRole("child");
    setResult(null);
    setError(null);
  };

  return (
    <div className="ms-special-calc-body">
      <p className="ms-special-hint">{tHint(topic, lang)}</p>

      <StepHeading n={1} title={tx3(lang, "சொத்து", "Estate", "التركة")} />
      <MoneyField id="khuntha-estate" label={tx3(lang, "சொத்து", "Estate", "التركة")} value={estate} onChange={setEstate} />

      <StepHeading
        n={2}
        title={tx3(lang, "குஃன்ஃதாவும் மற்ற வாரிசுகளும்", "The khuntha and the other heirs", "الخنثى وبقية الورثة")}
        help={tx3(
          lang,
          "குஃன்ஃதாவுக்குத் தனி விசை இல்லை — கணக்கீட்டாளர் அவரை ஆணாகவும் பெண்ணாகவும் இரு முறை கணக்கிடும். பருவ வயதுவரை காத்திருக்க முடிந்தால் அதுவே சிறந்தது.",
          "There is no separate key for the khuntha — the calculator computes them twice, as male and as female. Waiting until puberty, if division can wait, is best.",
          "لا يوجد مفتاح مستقل للخنثى، فالحاسبة تحسبه مرتين: ذكرًا وأنثى. والأفضل الانتظار حتى البلوغ إن أمكن تأجيل القسمة.",
        )}
      />
      <HeirPicker
        heirs={heirs}
        onChange={setHeirs}
        keys={["husband", "wives", "father", "mother", "paternalGrandfather", "sons", "daughters", "fullBrothers", "fullSisters", "maternalBrothers", "maternalSisters", "paternalBrothers", "paternalSisters"]}
        lang={lang}
      />

      <StepHeading
        n={3}
        title={tx3(lang, "குஃன்ஃதா யார்?", "Who is the khuntha?", "من هو الخنثى؟")}
      />
      <div className="ms-special-seg" role="group" aria-label={tx3(lang, "குஃன்ஃதா யார்?", "Who is the khuntha?", "من هو الخنثى؟")}>
        {(["child", "paternalSibling"] as const).map((r) => (
          <button
            key={r}
            type="button"
            aria-pressed={role === r}
            onClick={() => setRole(r)}
            className={`ms-special-seg-btn ${role === r ? "is-on" : ""}`}
          >
            {r === "child"
              ? tx3(lang, "குழந்தை (மகன் / மகள்)", "A child (son / daughter)", "ولد (ابن / بنت)")
              : tx3(lang, "தந்தை வழி சகோதரர் / சகோதரி", "A paternal half-sibling", "أخ / أخت لأب")}
          </button>
        ))}
      </div>

      <div className="ms-special-actions">
        <LoadExampleButton onLoad={load} lang={lang} />
        <CalcButton onClick={() => compute(estate, heirs, role)} lang={lang} />
        <ResetButton onReset={reset} lang={lang} />
      </div>
      <CalcError message={error} lang={lang} />

      {result ? (
        <div className="ms-special-results">
          <FinalAnswer>{result.summary}</FinalAnswer>
          <p className="ms-special-muted">
            {tx3(
              lang,
              "மூன்று கருத்துகளும் கீழே ஒன்றாகக் காட்டப்பட்டுள்ளன; நூல் ஒன்றை மட்டும் முடிவாக ஏற்கவில்லை. சராசரி எடுக்கக்கூடாது.",
              "All three views are shown together below; the book adopts none of them as the single answer. Never average.",
              "الآراء الثلاثة معروضة معًا أدناه، والكتاب لم يعتمد واحدًا منها جوابًا وحيدًا. ولا يُؤخذ المتوسط أبدًا.",
            )}
          </p>
          <div className="ms-special-opinions">
            <ResultTable
              rows={result.asMale.rows}
              lang={lang}
              estate={estate}
              verifyTotal={estate}
              title={tx3(lang, "குஃன்ஃதா ஆணாக இருந்தால்", "If the khuntha is male", "إن كان الخنثى ذكرًا")}
              total={result.asMale.totalDistributed}
            />
            <ResultTable
              rows={result.asFemale.rows}
              lang={lang}
              estate={estate}
              verifyTotal={estate}
              title={tx3(lang, "குஃன்ஃதா பெண்ணாக இருந்தால்", "If the khuntha is female", "إن كان الخنثى أنثى")}
              total={result.asFemale.totalDistributed}
            />
          </div>
          <div className="ms-special-opinions ms-special-opinions-3">
            <div className="ms-special-opinion-card">
              <ResultTable
                rows={result.shafii.payNow}
                lang={lang}
                estate={estate}
                title={tx3(lang, "அஷ்-ஷாஃபிஈ: ஒவ்வொருவருக்கும் குறைந்த தொகை", "al-Shafi'i: pay each person the lesser", "الشافعي: ادفع لكل شخص الأقل")}
                total={result.shafii.payNowTotal}
              />
              <HeldLine label={tx3(lang, "நிறுத்தி வைக்க: ", "Held: ", "المحجوز: ")} amount={result.shafii.heldAmount} lang={lang} />
            </div>
            <div className="ms-special-opinion-card">
              <ResultTable
                rows={result.abuHanifa.rows}
                lang={lang}
                estate={estate}
                verifyTotal={estate}
                title={tx3(lang, "அபூ ஹனீஃபா: குஃன்ஃதாவுக்குக் குறைந்த தொகை, மீதம் மற்றவர்களுக்கு", "Abu Hanifa: khuntha gets the lesser, the rest is distributed", "أبو حنيفة: الخنثى يأخذ الأقل، والباقي يُوزَّع")}
              />
              <p className="ms-special-muted">
                {tx3(lang, "குஃன்ஃதா பெறுவது: ", "Khuntha receives: ", "ما يأخذه الخنثى: ")}₹{fmt(result.abuHanifa.khunthaAmount)}
                {" · "}
                {tx3(lang, "எதுவும் நிறுத்தி வைக்கப்படவில்லை.", "Nothing is held.", "لا شيء محجوز.")}
              </p>
            </div>
            <div className="ms-special-opinion-card">
              <ResultTable
                rows={result.prevailing.rows}
                lang={lang}
                estate={estate}
                title={tx3(lang, "மேலோங்கும் கருத்து: குஃன்ஃதாவுக்குப் பெரிய தொகை ஒதுக்கப்படுகிறது", "Prevailing view: the larger amount is reserved for the khuntha", "الرأي الراجح: يُحجز المبلغ الأكبر للخنثى")}
              />
              <HeldLine label={tx3(lang, "நிறுத்தி வைக்க: ", "Held: ", "المحجوز: ")} amount={result.prevailing.heldAmount} lang={lang} />
            </div>
          </div>
          <ResultNotes notes={result.notes} scholarReasons={result.scholarReasons} lang={lang} />
        </div>
      ) : null}
    </div>
  );
}
