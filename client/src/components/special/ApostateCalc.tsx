/**
 * 12. Apostate (book §4.12, p. 330; cases 282–285).
 * Three-opinion comparison + Bayt al-Mal outcomes side by side, labelled.
 * Two situations: the apostate's own estate (split by when the property
 * was earned) and an heir who left Islam (excluded, no share).
 */
import { useState } from "react";
import { calculateApostateEstate, calculateApostateHeir } from "@/lib/specialMethods";
import type { HeirInput } from "@/lib/inheritance";
import { errEstate, errHeirs, fmt, tHint, tx3, type TopicCalcProps } from "./types";
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

export default function ApostateCalc({ topic, lang }: TopicCalcProps) {
  const [mode, setMode] = useState<"estate" | "heir">("estate");
  const [whileMuslim, setWhileMuslim] = useState(0);
  const [afterLeaving, setAfterLeaving] = useState(0);
  const [estate, setEstate] = useState(0);
  const [heirs, setHeirs] = useState<HeirInput>(() => preloadHeirs({}));
  const [apostateKeys, setApostateKeys] = useState<string[]>([]);
  const [estateResult, setEstateResult] = useState<ReturnType<typeof calculateApostateEstate> | null>(null);
  const [heirResult, setHeirResult] = useState<ReturnType<typeof calculateApostateHeir> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const computeEstate = (w: number, a: number, h: HeirInput) => {
    if (!(w + a > 0)) { setEstateResult(null); setError(errEstate(lang)); return; }
    if (!hasAnyHeir(h)) { setEstateResult(null); setError(errHeirs(lang)); return; }
    try {
      setEstateResult(calculateApostateEstate({ whileMuslim: w, afterLeaving: a, heirs: h }));
      setHeirResult(null);
      setError(null);
    } catch (err) {
      setEstateResult(null);
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const computeHeir = (e: number, h: HeirInput, keys: string[]) => {
    if (!(e > 0)) { setHeirResult(null); setError(errEstate(lang)); return; }
    if (!hasAnyHeir(h)) { setHeirResult(null); setError(errHeirs(lang)); return; }
    try {
      setHeirResult(calculateApostateHeir({ estate: e, heirs: h, apostateKeys: keys as (keyof HeirInput)[] }));
      setEstateResult(null);
      setError(null);
    } catch (err) {
      setHeirResult(null);
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const load = () => {
    if (mode === "estate") {
      const h = preloadHeirs({ wives: 1, mother: 1, sons: 1 });
      setWhileMuslim(24000);
      setAfterLeaving(30000);
      setHeirs(h);
      computeEstate(24000, 30000, h);
    } else {
      const h = preloadHeirs({ wives: 1, fullSisters: 1, paternalSisters: 1, paternalUncles: 1 });
      setEstate(400000);
      setHeirs(h);
      setApostateKeys(["wives"]);
      computeHeir(400000, h, ["wives"]);
    }
  };

  const reset = () => {
    setWhileMuslim(0);
    setAfterLeaving(0);
    setEstate(0);
    setHeirs(preloadHeirs({}));
    setApostateKeys([]);
    setEstateResult(null);
    setHeirResult(null);
    setError(null);
  };

  const entered = enteredHeirKeys(heirs);
  const baytLine = (amount: number) => (
    <p className="ms-special-bayt">
      {tx3(lang, "பைத்துல் மால் (பொதுக் கருவூலம்): ", "Bayt al-Mal (public treasury): ", "بيت المال: ")}₹{fmt(amount)}
    </p>
  );

  return (
    <div className="ms-special-calc-body">
      <p className="ms-special-hint">{tHint(topic, lang)}</p>

      <StepHeading
        n={1}
        title={tx3(lang, "நிலை எது?", "Which situation?", "أي حالة؟")}
      />
      <div className="ms-special-seg" role="group" aria-label={tx3(lang, "நிலை", "Situation", "الحالة")}>
        <button
          type="button"
          aria-pressed={mode === "estate"}
          onClick={() => setMode("estate")}
          className={`ms-special-seg-btn ${mode === "estate" ? "is-on" : ""}`}
        >
          {tx3(lang, "இஸ்லாத்தை விட்டு வெளியேறியவரின் சொத்து", "The apostate's own estate", "تركة المرتد نفسه")}
        </button>
        <button
          type="button"
          aria-pressed={mode === "heir"}
          onClick={() => setMode("heir")}
          className={`ms-special-seg-btn ${mode === "heir" ? "is-on" : ""}`}
        >
          {tx3(lang, "இஸ்லாத்தை விட்டு வெளியேறிய வாரிசு", "An heir who left Islam", "وارث ارتد عن الإسلام")}
        </button>
      </div>

      {mode === "estate" ? (
        <>
          <StepHeading
            n={2}
            title={tx3(lang, "சொத்து எப்போது சம்பாதிக்கப்பட்டது?", "When was the property earned?", "متى كُسب المال؟")}
            help={tx3(
              lang,
              "இரண்டு தொகைகளையும் தனித்தனியே உள்ளிடவும் — முஸ்லிமாக இருந்தபோது சம்பாதித்தது, இஸ்லாத்தை விட்ட பிறகு சம்பாதித்தது.",
              "Enter the two amounts separately — earned while Muslim, and earned after leaving Islam.",
              // AR-REVIEW: wording for the two earned-when amounts.
              "أدخل المبلغين منفصلين: ما كُسب وهو مسلم، وما كُسب بعد الردة.",
            )}
          />
          <MoneyField
            id="apos-while"
            label={tx3(lang, "முஸ்லிமாக இருந்தபோது சம்பாதித்தது", "Earned while Muslim", "ما كسبه وهو مسلم")}
            value={whileMuslim}
            onChange={setWhileMuslim}
          />
          <MoneyField
            id="apos-after"
            label={tx3(lang, "இஸ்லாத்தை விட்ட பிறகு சம்பாதித்தது", "Earned after leaving Islam", "ما كسبه بعد الردة")}
            value={afterLeaving}
            onChange={setAfterLeaving}
          />
          <StepHeading n={3} title={tx3(lang, "முஸ்லிம் வாரிசுகள்", "Muslim heirs", "الورثة المسلمون")} />
          <HeirPicker
            heirs={heirs}
            onChange={setHeirs}
            keys={["husband", "wives", "father", "mother", "paternalGrandfather", "sons", "daughters", "fullBrothers", "fullSisters", "maternalBrothers", "maternalSisters"]}
            lang={lang}
          />
          <div className="ms-special-actions">
            <LoadExampleButton onLoad={load} lang={lang} />
            <CalcButton onClick={() => computeEstate(whileMuslim, afterLeaving, heirs)} lang={lang} />
            <ResetButton onReset={reset} lang={lang} />
          </div>
        </>
      ) : (
        <>
          <StepHeading n={2} title={tx3(lang, "சொத்தும் வாரிசுகளும்", "Estate and heirs", "التركة والورثة")} />
          <MoneyField id="apos-estate" label={tx3(lang, "சொத்து", "Estate", "التركة")} value={estate} onChange={setEstate} />
          <HeirPicker
            heirs={heirs}
            onChange={setHeirs}
            keys={["husband", "wives", "father", "mother", "paternalGrandfather", "sons", "daughters", "fullBrothers", "fullSisters", "maternalBrothers", "maternalSisters", "paternalBrothers", "paternalSisters", "paternalUncles"]}
            lang={lang}
          />
          <StepHeading
            n={3}
            title={tx3(lang, "இஸ்லாத்தை விட்டு வெளியேறிய வாரிசுகளைக் குறிக்கவும்", "Mark the heirs who left Islam", "حدّد الورثة الذين ارتدوا عن الإسلام")}
            help={tx3(
              lang,
              "மதம் மாறிய வாரிசுக்கு எதுவும் கிடைக்காது — “வாரிசாக மாட்டார்”.",
              "An heir who left Islam gets nothing.",
              "الوارث المرتد لا يأخذ شيئًا.",
            )}
          />
          <fieldset className="ms-special-heirs">
            <legend className="ms-special-field-label">
              {tx3(lang, "மதம் மாறியவர்கள்", "Those who left Islam", "المرتدون")}
            </legend>
            {entered.length === 0 ? (
              <p className="ms-special-muted">{tx3(lang, "முதலில் வாரிசுகளை உள்ளிடவும்.", "Enter heirs first.", "أدخل الورثة أولًا.")}</p>
            ) : null}
            {entered.map((m) => (
              <label key={m.key} className="ms-special-check-row">
                <input
                  type="checkbox"
                  checked={apostateKeys.includes(m.key)}
                  onChange={(e) =>
                    setApostateKeys((ks) => (e.target.checked ? [...ks, m.key] : ks.filter((k) => k !== m.key)))
                  }
                />
                <span>{tx3(lang, m.ta, m.en, m.ar)}</span>
              </label>
            ))}
          </fieldset>
          <div className="ms-special-actions">
            <LoadExampleButton onLoad={load} lang={lang} />
            <CalcButton onClick={() => computeHeir(estate, heirs, apostateKeys)} lang={lang} />
            <ResetButton onReset={reset} lang={lang} />
          </div>
        </>
      )}

      <CalcError message={error} lang={lang} />

      {estateResult ? (
        <div className="ms-special-results">
          <FinalAnswer>{estateResult.summary}</FinalAnswer>
          <p className="ms-special-muted">
            {tx3(lang, "மொத்தச் சொத்து: ", "Total estate: ", "مجموع التركة: ")}₹{fmt(estateResult.total)}
            {" · "}
            {tx3(lang, "முஸ்லிமாக இருந்தபோது: ", "While Muslim: ", "وهو مسلم: ")}₹{fmt(estateResult.whileMuslim)}
            {" · "}
            {tx3(lang, "பிறகு: ", "After leaving: ", "بعد الردة: ")}₹{fmt(estateResult.afterLeaving)}
          </p>
          <p className="ms-special-muted">
            {tx3(
              lang,
              "மூன்று கருத்துகளும் கீழே ஒன்றாகக் காட்டப்பட்டுள்ளன; நூல் ஒன்றை மட்டும் முடிவாக ஏற்கவில்லை.",
              "All three opinions are shown together below; the book adopts none of them as the single answer.",
              "الآراء الثلاثة معروضة معًا أدناه، والكتاب لم يعتمد واحدًا منها جوابًا وحيدًا.",
            )}
          </p>
          <div className="ms-special-opinions ms-special-opinions-3">
            <div className="ms-special-opinion-card">
              <ResultTable
                rows={estateResult.abuHanifa.rows}
                lang={lang}
                estate={estateResult.total}
                verifyTotal={estateResult.total}
                title={tx3(lang, "அபூ ஹனீஃபா: முஸ்லிமாக இருந்தபோது சம்பாதித்தது மட்டும் பிரிக்கப்படும்", "Abu Hanifa: only while-Muslim property is divided", "أبو حنيفة: يُقسَّم فقط ما كُسب وهو مسلم")}
              />
              {baytLine(estateResult.abuHanifa.baytAlMal)}
            </div>
            <div className="ms-special-opinion-card">
              <ResultTable
                rows={estateResult.shafii.rows}
                lang={lang}
                estate={estateResult.total}
                verifyTotal={estateResult.total}
                title={tx3(lang, "அஷ்-ஷாஃபிஈ: அனைத்தும் பைத்துல் மாலுக்கு", "al-Shafi'i: everything to Bayt al-Mal", "الشافعي: كل شيء لبيت المال")}
              />
              {baytLine(estateResult.shafii.baytAlMal)}
            </div>
            <div className="ms-special-opinion-card">
              <ResultTable
                rows={estateResult.abuYusufMuhammad.rows}
                lang={lang}
                estate={estateResult.total}
                verifyTotal={estateResult.total}
                title={tx3(lang, "அபூ யூசுஃப், முஹம்மது: அனைத்தும் வாரிசுகளுக்குப் பிரிக்கப்படும்", "Abu Yusuf & Muhammad: everything is divided among the heirs", "أبو يوسف ومحمد: كل شيء يُقسَّم على الورثة")}
              />
              {baytLine(estateResult.abuYusufMuhammad.baytAlMal)}
            </div>
          </div>
          <ResultNotes notes={estateResult.notes} scholarReasons={estateResult.scholarReasons} lang={lang} />
        </div>
      ) : null}

      {heirResult ? (
        <div className="ms-special-results">
          <FinalAnswer>{heirResult.summary}</FinalAnswer>
          <ResultTable
            rows={heirResult.rows}
            lang={lang}
            estate={estate}
            verifyTotal={estate}
            title={tx3(lang, "மீதமுள்ள வாரிசுகளின் பங்குகள்", "Shares of the remaining heirs", "حصص الورثة الباقين")}
          />
          <ExcludedList
            title={tx3(lang, "இஸ்லாத்தை விட்டு வெளியேறியவர்கள் — பங்கு இல்லை", "Left Islam — no share", "المرتدون — لا حصة لهم")}
            items={heirResult.excluded.map((x) => ({ label: heirLabel(x.key, lang), rule: x.rule }))}
            lang={lang}
          />
          <ResultNotes notes={heirResult.notes} scholarReasons={heirResult.scholarReasons} lang={lang} />
        </div>
      ) : null}
    </div>
  );
}
