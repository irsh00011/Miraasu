/**
 * 7. Missing person / prisoner (book §4.7, p. 308; cases 274–277).
 * Alive/deceased scenario comparison + reserved/held amount.
 * Waiting period as the book states it: 70 years.
 */
import { useState } from "react";
import { calculateMissingPerson } from "@/lib/specialMethods";
import type { HeirInput } from "@/lib/inheritance";
import { errEstate, errHeirs, fmt, tHint, tx3, type TopicCalcProps } from "./types";
import { enteredHeirKeys, hasAnyHeir, heirCount, preloadHeirs } from "./heirMeta";
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
  Stepper,
} from "./shared";

export default function MissingCalc({ topic, lang }: TopicCalcProps) {
  const [estate, setEstate] = useState(topic.preload.estate);
  const [heirs, setHeirs] = useState<HeirInput>(() => preloadHeirs(topic.preload.heirs));
  const [missingKey, setMissingKey] = useState<keyof HeirInput>("sons");
  const [missingCount, setMissingCount] = useState(1);
  const [kind, setKind] = useState<"missing" | "prisoner">("missing");
  const [result, setResult] = useState<ReturnType<typeof calculateMissingPerson> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const compute = (e: number, h: HeirInput, k: keyof HeirInput, c: number, kd: "missing" | "prisoner") => {
    if (!(e > 0)) { setResult(null); setError(errEstate(lang)); return; }
    if (!hasAnyHeir(h)) { setResult(null); setError(errHeirs(lang)); return; }
    try {
      setResult(calculateMissingPerson({ estate: e, heirs: h, missingKey: k, missingCount: c, kind: kd }));
      setError(null);
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const load = () => {
    const e = 5000;
    const h = preloadHeirs({ wives: 1, sons: 1, fullBrothers: 1 });
    setEstate(e);
    setHeirs(h);
    setMissingKey("sons");
    setMissingCount(1);
    setKind("missing");
    compute(e, h, "sons", 1, "missing");
  };

  const reset = () => {
    setEstate(topic.preload.estate);
    setHeirs(preloadHeirs(topic.preload.heirs));
    setMissingKey("sons");
    setMissingCount(1);
    setKind("missing");
    setResult(null);
    setError(null);
  };

  const entered = enteredHeirKeys(heirs);
  const keyCount = heirCount(heirs, missingKey);

  return (
    <div className="ms-special-calc-body">
      <p className="ms-special-hint">{tHint(topic, lang)}</p>

      <StepHeading n={1} title={tx3(lang, "சொத்து", "Estate", "التركة")} />
      <MoneyField id="missing-estate" label={tx3(lang, "சொத்து", "Estate", "التركة")} value={estate} onChange={setEstate} />

      <StepHeading n={2} title={tx3(lang, "வாரிசுகள்", "Heirs", "الورثة")} />
      <HeirPicker
        heirs={heirs}
        onChange={setHeirs}
        keys={["husband", "wives", "father", "mother", "paternalGrandfather", "sons", "daughters", "fullBrothers", "fullSisters", "maternalBrothers", "maternalSisters"]}
        lang={lang}
      />

      <StepHeading
        n={3}
        title={tx3(lang, "காணாமல் போனவர் / கைதி யார்?", "Who is missing / imprisoned?", "من هو المفقود / السجين؟")}
        help={tx3(
          lang,
          "அவர் உயிருடன் இருக்கிறாரா இறந்துவிட்டாரா என்பது தெளிவாகும்வரை பிரிக்காமல் இருப்பதே சிறந்தது.",
          "Best course is to postpone division until it is clear whether the person is alive or dead.",
          "الأفضل تأجيل القسمة حتى يتضح إن كان الشخص حيًّا أو ميتًا.",
        )}
      />
      <div className="ms-special-seg" role="group" aria-label={tx3(lang, "நிலை", "Situation", "الحالة")}>
        {(["missing", "prisoner"] as const).map((k) => (
          <button
            key={k}
            type="button"
            aria-pressed={kind === k}
            onClick={() => setKind(k)}
            className={`ms-special-seg-btn ${kind === k ? "is-on" : ""}`}
          >
            {k === "missing"
              ? tx3(lang, "காணாமல் போனவர்", "Missing person", "المفقود")
              : tx3(lang, "கைதி", "Prisoner", "السجين")}
          </button>
        ))}
      </div>
      <label className="ms-special-field">
        {tx3(lang, "காணாமல் போனவர் / கைதி யார்?", "Who is missing / imprisoned?", "من هو المفقود / السجين؟")}
        <select
          value={String(missingKey)}
          onChange={(e) => {
            const k = e.target.value as keyof HeirInput;
            setMissingKey(k);
            setMissingCount(1);
          }}
          className="ms-special-input"
        >
          {entered.map((m) => (
            <option key={m.key} value={m.key}>{tx3(lang, m.ta, m.en, m.ar)}</option>
          ))}
        </select>
      </label>
      <Stepper
        label={tx3(lang, "காணாமல் போனவர் எண்ணிக்கை", "How many are missing", "كم عدد المفقودين؟")}
        value={missingCount}
        onChange={setMissingCount}
        min={1}
        max={Math.max(1, keyCount)}
      />

      <div className="ms-special-actions">
        <LoadExampleButton onLoad={load} lang={lang} />
        <CalcButton onClick={() => compute(estate, heirs, missingKey, missingCount, kind)} lang={lang} />
        <ResetButton onReset={reset} lang={lang} />
      </div>
      <CalcError message={error} lang={lang} />

      {result ? (
        <div className="ms-special-results">
          <FinalAnswer>{result.summary}</FinalAnswer>
          <div className="ms-special-opinions">
            <ResultTable
              rows={result.ifAlive.rows}
              lang={lang}
              estate={estate}
              verifyTotal={estate}
              title={tx3(lang, "உயிருடன் இருந்தால்", "If alive", "إن كان حيًّا")}
              total={result.ifAlive.totalDistributed}
            />
            <ResultTable
              rows={result.ifDead.rows}
              lang={lang}
              estate={estate}
              verifyTotal={estate}
              title={tx3(lang, "இறந்திருந்தால்", "If dead", "إن كان ميتًا")}
              total={result.ifDead.totalDistributed}
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
            label={tx3(lang, "நிறுத்தி வைக்க: ", "Held: ", "المحجوز: ")}
            amount={result.heldAmount}
            lang={lang}
          />
          <p className="ms-special-muted">
            {tx3(
              lang,
              "நூல் கூறும் காத்திருப்புக் காலம்: 70 ஆண்டுகள் (இமாம்களின் ஏகோபித்த கருத்து என்று நூல் கூறுகிறது).",
              "Waiting period as the book states it: 70 years (stated as the unanimous opinion of the imams).",
              "مدة الانتظار كما يذكرها الكتاب: ٧٠ سنة (يذكر الكتاب أنها رأي الأئمة المتفق عليه).",
            )}
          </p>
          <p className="ms-special-muted">
            {tx3(lang, "இப்போது கொடுக்க மொத்தம்: ", "Pay-now total: ", "مجموع ما يُدفع الآن: ")}₹{fmt(result.payNowTotal)}
            {" · "}
            {tx3(lang, "நிறுத்தி வைக்க: ", "Held: ", "المحجوز: ")}₹{fmt(result.heldAmount)}
          </p>
          <ResultNotes notes={result.notes} scholarReasons={result.scholarReasons} lang={lang} />
        </div>
      ) : null}
    </div>
  );
}
