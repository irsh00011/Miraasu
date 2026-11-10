/**
 * 4. Disqualified heirs (book §4.4, p. 38).
 * Eligibility checklist: each entered heir with a disqualification-reason
 * selector (murderer / different religion) → excluded heirs listed with
 * the rule, distribution re-run without them.
 */
import { useState } from "react";
import { calculateDisqualifiedHeirs, type DisqualificationReason } from "@/lib/specialMethods";
import type { HeirInput } from "@/lib/inheritance";
import { errEstate, errHeirs, tHint, tx3, type TopicCalcProps } from "./types";
import { enteredHeirKeys, hasAnyHeir, heirLabel, preloadHeirs } from "./heirMeta";
import {
  CalcButton,
  CalcError,
  ExcludedList,
  FinalAnswer,
  HeirPicker,
  LoadExampleButton,
  MoneyField,
  ResetButton,
  ResultNotes,
  ResultTable,
  StepHeading,
} from "./shared";

type DisqReason = DisqualificationReason;

const reasonLabel = (r: DisqReason, lang: TopicCalcProps["lang"]) =>
  r === "murderer"
    ? tx3(lang, "கொலையாளி", "Murderer", "قاتل")
    : tx3(lang, "மதம் வேறுபாடு", "Different religion", "اختلاف الدين");

export default function DisqualifiedCalc({ topic, lang }: TopicCalcProps) {
  const [estate, setEstate] = useState(topic.preload.estate);
  const [heirs, setHeirs] = useState<HeirInput>(() => preloadHeirs(topic.preload.heirs));
  const [marks, setMarks] = useState<Partial<Record<string, DisqReason>>>({});
  const [result, setResult] = useState<ReturnType<typeof calculateDisqualifiedHeirs> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const compute = (e: number, h: HeirInput, m: Partial<Record<string, DisqReason>>) => {
    if (!(e > 0)) { setResult(null); setError(errEstate(lang)); return; }
    if (!hasAnyHeir(h)) { setResult(null); setError(errHeirs(lang)); return; }
    try {
      const disqualified = Object.entries(m).map(([key, reason]) => ({
        key: key as keyof HeirInput,
        label: heirLabel(key, lang),
        reason: reason as DisqReason,
      }));
      setResult(calculateDisqualifiedHeirs({ estate: e, heirs: h, disqualified }));
      setError(null);
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const load = () => {
    const e = 12000;
    const h = preloadHeirs({ wives: 1, sons: 1, daughters: 1 });
    setEstate(e);
    setHeirs(h);
    setMarks({});
    compute(e, h, {});
  };

  const reset = () => {
    setEstate(topic.preload.estate);
    setHeirs(preloadHeirs(topic.preload.heirs));
    setMarks({});
    setResult(null);
    setError(null);
  };

  const entered = enteredHeirKeys(heirs);

  return (
    <div className="ms-special-calc-body">
      <p className="ms-special-hint">{tHint(topic, lang)}</p>

      <StepHeading n={1} title={tx3(lang, "சொத்து", "Estate", "التركة")} />
      <MoneyField id="disq-estate" label={tx3(lang, "சொத்து", "Estate", "التركة")} value={estate} onChange={setEstate} />

      <StepHeading n={2} title={tx3(lang, "வாரிசுகள்", "Heirs", "الورثة")} />
      <HeirPicker
        heirs={heirs}
        onChange={setHeirs}
        keys={["husband", "wives", "father", "mother", "paternalGrandfather", "sons", "daughters", "fullBrothers", "fullSisters", "maternalBrothers", "maternalSisters", "paternalBrothers", "paternalSisters"]}
        lang={lang}
      />

      <StepHeading
        n={3}
        title={tx3(lang, "தகுதியின்மையைக் குறிக்கவும்", "Mark disqualified heirs", "حدّد الورثة غير المستحقين")}
        help={tx3(
          lang,
          "ஒரு வாரிசு சொத்துக்குரியவரைக் கொன்றிருந்தாலோ, மதம் வேறுபட்டிருந்தாலோ அவர் வாரிசாக மாட்டார். குறிக்கப்பட்டவர் பங்கீட்டிலிருந்து முற்றிலும் நீக்கப்படுவார்.",
          "An heir who killed the estate-owner, or whose religion differs, does not inherit. A marked heir is removed from the division entirely.",
          "الوارث الذي قتل صاحب التركة أو اختلف دينه لا يرث، ويُستبعد من القسمة تمامًا.",
        )}
      />
      <fieldset className="ms-special-heirs">
        <legend className="ms-special-field-label">
          {tx3(lang, "தகுதிச் சரிபார்ப்புப் பட்டியல்", "Eligibility checklist", "قائمة التحقق من الأهلية")}
        </legend>
        {entered.length === 0 ? (
          <p className="ms-special-muted">{tx3(lang, "முதலில் வாரிசுகளை உள்ளிடவும்.", "Enter heirs first.", "أدخل الورثة أولًا.")}</p>
        ) : null}
        {entered.map((m) => (
          <label key={m.key} className="ms-special-disq-row">
            <span>{tx3(lang, m.ta, m.en, m.ar)}</span>
            <select
              value={marks[m.key] ?? ""}
              onChange={(e) => {
                const v = e.target.value as "" | DisqReason;
                setMarks((cur) => {
                  const next = { ...cur };
                  if (v === "") delete next[m.key];
                  else next[m.key] = v;
                  return next;
                });
              }}
              className="ms-special-input"
            >
              <option value="">{tx3(lang, "தகுதியானவர்", "Eligible", "مستحق")}</option>
              <option value="murderer">{reasonLabel("murderer", lang)}</option>
              <option value="different-religion">{reasonLabel("different-religion", lang)}</option>
            </select>
          </label>
        ))}
        <p className="ms-special-muted">
          {tx3(
            lang,
            "அடிமை நிலை: நூல் கூறும் மூன்றாவது தகுதியின்மைக் காரணம்; இப்போது பொருந்தாது என்று நூலே கூறுகிறது — தகவலுக்காக மட்டும்.",
            "Slavery: the book's third disqualifier, which the book itself says does not apply now — shown for information only.",
            "الرقّ: المانع الثالث في الكتاب، والكتاب نفسه يقول إنه لا ينطبق الآن — للمعلومة فقط.",
          )}
        </p>
      </fieldset>

      <div className="ms-special-actions">
        <LoadExampleButton onLoad={load} lang={lang} />
        <CalcButton onClick={() => compute(estate, heirs, marks)} lang={lang} />
        <ResetButton onReset={reset} lang={lang} />
      </div>
      <CalcError message={error} lang={lang} />

      {result ? (
        <div className="ms-special-results">
          <FinalAnswer>{result.summary}</FinalAnswer>
          <ResultTable
            rows={result.rows}
            lang={lang}
            estate={estate}
            verifyTotal={estate}
            title={tx3(lang, "தகுதியான வாரிசுகளின் பங்குகள்", "Shares of the eligible heirs", "حصص الورثة المستحقين")}
          />
          <ExcludedList
            title={tx3(lang, "தகுதியற்றவர்கள் — பங்கு இல்லை", "Disqualified — no share", "غير المستحقين — لا حصة لهم")}
            items={result.excluded.map((x) => ({ label: heirLabel(x.key, lang), rule: x.rule }))}
            lang={lang}
          />
          <p className="ms-special-muted">{result.slaveNote}</p>
          <ResultNotes notes={result.notes} scholarReasons={result.scholarReasons} lang={lang} />
        </div>
      ) : null}
    </div>
  );
}
