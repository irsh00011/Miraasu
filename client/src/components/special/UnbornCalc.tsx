/**
 * 6. Unborn child (book §4.6, p. 284; cases 267–268).
 * Side-by-side male/female scenario comparison (two columns) + pay-now
 * (the lesser per person) + held amount.
 */
import { useState } from "react";
import { calculateUnbornChild } from "@/lib/specialMethods";
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

export default function UnbornCalc({ topic, lang }: TopicCalcProps) {
  const [estate, setEstate] = useState(topic.preload.estate);
  const [heirs, setHeirs] = useState<HeirInput>(() => preloadHeirs(topic.preload.heirs));
  const [result, setResult] = useState<ReturnType<typeof calculateUnbornChild> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const compute = (e: number, h: HeirInput) => {
    if (!(e > 0)) { setResult(null); setError(errEstate(lang)); return; }
    if (!hasAnyHeir(h)) { setResult(null); setError(errHeirs(lang)); return; }
    try {
      setResult(calculateUnbornChild({ estate: e, heirs: h }));
      setError(null);
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const load = () => {
    const e = 8000;
    const h = preloadHeirs({ wives: 1, daughters: 1, mother: 1, paternalUncles: 1 });
    setEstate(e);
    setHeirs(h);
    compute(e, h);
  };

  const reset = () => {
    setEstate(topic.preload.estate);
    setHeirs(preloadHeirs(topic.preload.heirs));
    setResult(null);
    setError(null);
  };

  return (
    <div className="ms-special-calc-body">
      <p className="ms-special-hint">{tHint(topic, lang)}</p>

      <StepHeading n={1} title={tx3(lang, "சொத்து", "Estate", "التركة")} />
      <MoneyField id="unborn-estate" label={tx3(lang, "சொத்து", "Estate", "التركة")} value={estate} onChange={setEstate} />

      <StepHeading
        n={2}
        title={tx3(lang, "கர்ப்பமாக உள்ள மனைவியும் மற்ற வாரிசுகளும்", "Pregnant wife and other heirs", "الزوجة الحامل وبقية الورثة")}
        help={tx3(
          lang,
          "பிறக்காத குழந்தைக்குத் தனி விசை இல்லை — கணக்கீட்டாளர் அதை ஆணாகவும் பெண்ணாகவும் இரு முறை கணக்கிடும்.",
          "There is no separate key for the unborn child — the calculator computes it twice, as male and as female.",
          "لا يوجد مفتاح مستقل للحمل، فالحاسبة تحسبه مرتين: ذكرًا وأنثى.",
        )}
      />
      <HeirPicker
        heirs={heirs}
        onChange={setHeirs}
        keys={["husband", "wives", "father", "mother", "paternalGrandfather", "sons", "daughters", "fullBrothers", "fullSisters", "maternalBrothers", "maternalSisters", "paternalUncles"]}
        lang={lang}
      />

      <StepHeading
        n={3}
        title={tx3(lang, "இரு கணக்குகள் — குறைவானதைக் கொடு, மீதத்தை நிறுத்து", "Two scenarios — pay the lesser, hold the rest", "حسابان — ادفع الأقل واحجز الباقي")}
        help={tx3(
          lang,
          "குழந்தை பிறக்கும்வரை பிரிக்காமல் இருப்பதே சிறந்தது; வாரிசுகள் வற்புறுத்தினால் இந்த முறை பயன்படுத்தப்படும்.",
          "Best course is not to divide until the child is born; this is the method when the heirs insist.",
          "الأفضل عدم القسمة حتى الولادة، وهذه هي الطريقة عند إصرار الورثة.",
        )}
      />

      <div className="ms-special-actions">
        <LoadExampleButton onLoad={load} lang={lang} />
        <CalcButton onClick={() => compute(estate, heirs)} lang={lang} />
        <ResetButton onReset={reset} lang={lang} />
      </div>
      <CalcError message={error} lang={lang} />

      {result ? (
        <div className="ms-special-results">
          <FinalAnswer>{result.summary}</FinalAnswer>
          <div className="ms-special-opinions">
            <ResultTable
              rows={result.asSon.rows}
              lang={lang}
              estate={estate}
              verifyTotal={estate}
              title={tx3(lang, "பிறக்காத குழந்தை ஆணாக இருந்தால்", "If the unborn child is male", "إن كان الحمل ذكرًا")}
              total={result.asSon.totalDistributed}
            />
            <ResultTable
              rows={result.asDaughter.rows}
              lang={lang}
              estate={estate}
              verifyTotal={estate}
              title={tx3(lang, "பிறக்காத குழந்தை பெண்ணாக இருந்தால்", "If the unborn child is female", "إن كان الحمل أنثى")}
              total={result.asDaughter.totalDistributed}
            />
          </div>
          <ResultTable
            rows={result.payNow}
            lang={lang}
            estate={estate}
            title={tx3(lang, "இப்போது கொடுக்க (ஒவ்வொருவருக்கும் குறைந்த தொகை)", "Pay now (the lesser amount for each person)", "ادفع الآن (الأقل لكل شخص)")}
            total={result.payNowTotal}
          />
          <HeldLine
            label={tx3(lang, "பிறக்கும்வரை நிறுத்தி வைக்க: ", "Held until birth: ", "محجوز حتى الولادة: ")}
            amount={result.heldAmount}
            lang={lang}
          />
          <p className="ms-special-muted">
            {tx3(lang, "இப்போது கொடுக்க மொத்தம்: ", "Pay-now total: ", "مجموع ما يُدفع الآن: ")}₹{fmt(result.payNowTotal)}
            {" · "}
            {tx3(lang, "நிறுத்தி வைக்க: ", "Held: ", "المحجوز: ")}₹{fmt(result.heldAmount)}
            {" · "}
            {tx3(lang, "இரண்டும் சேர்ந்து சொத்துக்குச் சமம்.", "Together they equal the estate.", "ومجموعهما يساوي التركة.")}
          </p>
          <ResultNotes notes={result.notes} scholarReasons={result.scholarReasons} lang={lang} />
        </div>
      ) : null}
    </div>
  );
}
