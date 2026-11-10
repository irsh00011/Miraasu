/**
 * 2. Grandfather + siblings — school toggle (book §4.2).
 * Hanafi default (the book's default, labelled as such); the selected
 * school's result is primary and the other school's result is shown as a
 * labelled alternative below.
 */
import { useState } from "react";
import { calculateGrandfatherWithSiblings, type GrandfatherSchool } from "@/lib/specialMethods";
import type { HeirInput } from "@/lib/inheritance";
import { errEstate, errHeirs, tHint, tx3, type TopicCalcProps } from "./types";
import { hasAnyHeir, preloadHeirs } from "./heirMeta";
import {
  CalcButton,
  CalcError,
  FinalAnswer,
  HeirPicker,
  LoadExampleButton,
  MoneyField,
  ResetButton,
  ResultNotes,
  ResultTable,
  StepHeading,
} from "./shared";

const schoolLabel = (s: GrandfatherSchool, lang: TopicCalcProps["lang"]) =>
  s === "hanafi"
    ? tx3(lang, "அபூ ஹனீஃபா (ஹனஃபி) — நூலின் முன்னிருப்பு", "Abu Hanifa (Hanafi) — the book's default", "أبو حنيفة (الحنفي) — الافتراضي في الكتاب")
    : tx3(lang, "அஷ்-ஷாஃபிஈ (ஷாஃபிஈ)", "al-Shafi'i (Shafi'i)", "الشافعي");

export default function GrandfatherCalc({ topic, lang }: TopicCalcProps) {
  const [estate, setEstate] = useState(topic.preload.estate);
  const [heirs, setHeirs] = useState<HeirInput>(() => preloadHeirs(topic.preload.heirs));
  const [school, setSchool] = useState<GrandfatherSchool>("hanafi");
  const [result, setResult] = useState<ReturnType<typeof calculateGrandfatherWithSiblings> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const compute = (e: number, h: HeirInput, s: GrandfatherSchool) => {
    if (!(e > 0)) { setResult(null); setError(errEstate(lang)); return; }
    if (!hasAnyHeir(h)) { setResult(null); setError(errHeirs(lang)); return; }
    try {
      setResult(calculateGrandfatherWithSiblings({ estate: e, heirs: h, school: s }));
      setError(null);
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const load = () => {
    const e = 1300;
    const h = preloadHeirs({ wives: 1, fullSisters: 2, paternalGrandfather: 1 });
    setEstate(e);
    setHeirs(h);
    setSchool("hanafi");
    compute(e, h, "hanafi");
  };

  const reset = () => {
    setEstate(topic.preload.estate);
    setHeirs(preloadHeirs(topic.preload.heirs));
    setSchool("hanafi");
    setResult(null);
    setError(null);
  };

  const other: GrandfatherSchool = school === "hanafi" ? "shafii" : "hanafi";

  return (
    <div className="ms-special-calc-body">
      <p className="ms-special-hint">{tHint(topic, lang)}</p>

      <StepHeading n={1} title={tx3(lang, "சொத்து", "Estate", "التركة")} />
      <MoneyField id="gf-estate" label={tx3(lang, "சொத்து", "Estate", "التركة")} value={estate} onChange={setEstate} />

      <StepHeading
        n={2}
        title={tx3(lang, "பாட்டனும் சகோதர/சகோதரிகளும்", "Grandfather and siblings", "الجد مع الإخوة والأخوات")}
        help={tx3(
          lang,
          "பாட்டனையும் சகோதரிகளையும் உள்ளிடவும் — மற்ற வாரிசுகள் இருந்தால் அவர்களையும் சேர்க்கவும்.",
          "Enter the grandfather and the sisters — and any other heirs who are present.",
          "أدخل الجد والأخوات، وأي ورثة آخرين موجودين.",
        )}
      />
      <HeirPicker
        heirs={heirs}
        onChange={setHeirs}
        keys={["husband", "wives", "father", "mother", "paternalGrandfather", "sons", "daughters", "fullBrothers", "fullSisters", "paternalBrothers", "paternalSisters"]}
        lang={lang}
      />

      <StepHeading
        n={3}
        title={tx3(lang, "எந்த இமாமின் கருத்து?", "Which imam's opinion?", "رأي أي إمام؟")}
        help={tx3(
          lang,
          "ஹனஃபி முறையே நூலின் முன்னிருப்பு; ஷாஃபிஈ முறை இணை எடுத்துக்காட்டாகக் காட்டப்படுகிறது.",
          "The Hanafi view is the book's default; the Shafi'i view is shown as a parallel example.",
          "الرأي الحنفي هو الافتراضي في الكتاب، والرأي الشافعي يُعرض كمثال موازٍ.",
        )}
      />
      <div className="ms-special-seg" role="group" aria-label={tx3(lang, "கருத்து", "School", "المذهب")}>
        {(["hanafi", "shafii"] as const).map((s) => (
          <button
            key={s}
            type="button"
            aria-pressed={school === s}
            onClick={() => setSchool(s)}
            className={`ms-special-seg-btn ${school === s ? "is-on" : ""}`}
          >
            {schoolLabel(s, lang)}
          </button>
        ))}
      </div>

      <div className="ms-special-actions">
        <LoadExampleButton onLoad={load} lang={lang} />
        <CalcButton onClick={() => compute(estate, heirs, school)} lang={lang} />
        <ResetButton onReset={reset} lang={lang} />
      </div>
      <CalcError message={error} lang={lang} />

      {result ? (
        <div className="ms-special-results">
          <FinalAnswer>{result.summary}</FinalAnswer>
          <ResultTable
            rows={result[school].rows}
            lang={lang}
            estate={estate}
            verifyTotal={estate}
            title={`${tx3(lang, "தேர்ந்த கருத்து: ", "Chosen opinion: ", "الرأي المختار: ")}${schoolLabel(school, lang)}`}
            total={result[school].totalDistributed}
          />
          <div className="ms-special-alt">
            <ResultTable
              rows={result[other].rows}
              lang={lang}
              estate={estate}
              title={`${tx3(lang, "மற்ற கருத்து (ஒப்பிடுவதற்காக): ", "Other opinion (for comparison): ", "الرأي الآخر (للمقارنة): ")}${schoolLabel(other, lang)}`}
              total={result[other].totalDistributed}
            />
          </div>
          <ResultNotes notes={[...result.hanafi.notes, ...result.shafii.notes]} scholarReasons={result.scholarReasons} lang={lang} />
        </div>
      ) : null}
    </div>
  );
}
