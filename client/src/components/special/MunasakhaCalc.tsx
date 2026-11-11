/**
 * 9. Munasakha — multi-generation sequential division (book §4.9, p. 292;
 * cases 269–270). Timeline/sequential stages: one collapsible stage per
 * death, each stage's division + running totals; final totals must equal
 * the original estate.
 */
import { useState } from "react";
import { calculateMunasakha, type MunasakhaDeathInput } from "@/lib/specialMethods";
import type { HeirInput } from "@/lib/inheritance";
import { errEstate, fmt, tHint, tx3, type TopicCalcProps } from "./types";
import { blankHeirs, preloadHeirs } from "./heirMeta";
import {
  AddButton,
  CalcButton,
  CalcError,
  cleanNames,
  DeathEditor,
  FinalAnswer,
  LoadExampleButton,
  MoneyField,
  namesForHeirs,
  ResetButton,
  ResultNotes,
  ResultTable,
  StepHeading,
  type DeathForm,
} from "./shared";

export default function MunasakhaCalc({ topic, lang }: TopicCalcProps) {
  const blankDeath = (name: string, heirs: HeirInput): DeathForm => ({
    deceasedName: name,
    estate: 0,
    heirs,
    names: namesForHeirs(heirs, lang),
  });
  const [estate, setEstate] = useState(0);
  const [deaths, setDeaths] = useState<DeathForm[]>(() => [
    blankDeath("", preloadHeirs({})),
  ]);
  const [result, setResult] = useState<ReturnType<typeof calculateMunasakha> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const compute = (e: number, ds: DeathForm[]) => {
    if (!(e > 0)) { setResult(null); setError(errEstate(lang)); return; }
    if (ds.length === 0) {
      setResult(null);
      setError(tx3(lang, "குறைந்தது ஒரு மரணத்தையாவது சேர்க்கவும்.", "Add at least one death.", "أضف وفاة واحدة على الأقل."));
      return;
    }
    try {
      const input: { estate: number; deaths: MunasakhaDeathInput[] } = {
        estate: e,
        deaths: ds.map((d) => ({
          deceasedName: d.deceasedName || tx3(lang, "இறந்தவர்", "Deceased", "المتوفى"),
          heirs: d.heirs,
          names: cleanNames(d.names, d.heirs, lang),
        })),
      };
      setResult(calculateMunasakha(input));
      setError(null);
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const load = () => {
    const e = 2200;
    const d1 = blankDeath("Saleem", preloadHeirs({ wives: 2, sons: 1, daughters: 3 }));
    d1.names = { wives: ["Salma", "Jameela"], sons: ["Aaqil"], daughters: ["Asma", "Samha", "Aaliya"] };
    const d2 = blankDeath("Asma", preloadHeirs({ mother: 1, fullSisters: 2, paternalBrothers: 1 }));
    d2.names = { mother: ["Jameela"], fullSisters: ["Samha", "Aaliya"], paternalBrothers: ["Aaqil"] };
    setEstate(e);
    setDeaths([d1, d2]);
    compute(e, [d1, d2]);
  };

  const reset = () => {
    setEstate(0);
    setDeaths([blankDeath("", preloadHeirs({}))]);
    setResult(null);
    setError(null);
  };

  const earlierNames = (i: number): string[] => {
    const out: string[] = [];
    for (let j = 0; j < i; j++) for (const arr of Object.values(deaths[j].names)) out.push(...(arr ?? []));
    return out;
  };

  // Running totals across the stages shown so far (for the timeline view).
  const runningTotals = (upto: number): { name: string; amount: number }[] => {
    if (!result) return [];
    const totals = new Map<string, number>();
    for (let i = 0; i <= upto && i < result.deaths.length; i++) {
      for (const row of result.deaths[i].rows) {
        if (row.key === "__held__") continue;
        totals.set(row.label, (totals.get(row.label) ?? 0) + row.amount);
      }
    }
    return Array.from(totals.entries()).map(([name, amount]) => ({ name, amount }));
  };

  return (
    <div className="ms-special-calc-body">
      <p className="ms-special-hint">{tHint(topic, lang)}</p>

      <StepHeading
        n={1}
        title={tx3(lang, "முதல் சொத்து (மூலச் சொத்து)", "Original estate (first death)", "التركة الأصلية (الوفاة الأولى)")}
      />
      <MoneyField
        id="munasakha-estate"
        label={tx3(lang, "முதல் சொத்து (மூலச் சொத்து)", "Original estate (first death)", "التركة الأصلية")}
        value={estate}
        onChange={setEstate}
      />

      <StepHeading
        n={2}
        title={tx3(lang, "மரணங்கள் — வரிசையாக", "Deaths — in order", "الوفيات — بالترتيب")}
        help={tx3(
          lang,
          "ஒவ்வொரு மரணத்தையும் தனித்தனியே சேர்க்கவும் — இறந்த வாரிசின் பங்கு அவரது சொத்தாகும். பெயர்கள் முக்கியம்: அதே நபர் பல மரணங்களில் வாரிசாகலாம்.",
          "Add each death separately — a deceased heir's share becomes their estate. Names matter: the same person can inherit in several deaths.",
          "أضف كل وفاة على حدة — فحصة الوارث المتوفى تصبح تركته. الأسماء مهمة: فقد يرث الشخص نفسه في عدة وفيات.",
        )}
      />
      {deaths.map((d, i) => (
        <DeathEditor
          key={i}
          death={d}
          index={i}
          lang={lang}
          earlierNames={earlierNames(i)}
          showEstate={false}
          onChange={(next) => setDeaths((ds) => ds.map((x, j) => (j === i ? next : x)))}
          onRemove={() => setDeaths((ds) => ds.filter((_, j) => j !== i))}
          canRemove={deaths.length > 1}
        />
      ))}
      <AddButton
        onClick={() => setDeaths((ds) => [...ds, blankDeath("", blankHeirs())])}
        disabled={deaths.length >= 3}
      >
        {tx3(lang, "அடுத்த மரணத்தைச் சேர் (அதிகபட்சம் 3)", "Add next death (up to 3)", "أضف الوفاة التالية (حتى ٣)")}
      </AddButton>

      <StepHeading
        n={3}
        title={tx3(lang, "கணக்கிடுக — மரணம் மரணமாக", "Calculate — death by death", "احسب — وفاةً وفاةً")}
      />
      <div className="ms-special-actions">
        <LoadExampleButton onLoad={load} lang={lang} />
        <CalcButton onClick={() => compute(estate, deaths)} lang={lang} />
        <ResetButton onReset={reset} lang={lang} />
      </div>
      <CalcError message={error} lang={lang} />

      {result ? (
        <div className="ms-special-results">
          <FinalAnswer>{result.summary}</FinalAnswer>
          {/* Timeline: one collapsible stage per death, with running totals. */}
          <ol className="ms-special-timeline">
            {result.deaths.map((d, i) => (
              <li key={i} className="ms-special-stage">
                <details className="ms-special-stage-details" open>
                  <summary className="ms-special-stage-summary">
                    {tx3(lang, "மரணம்", "Death", "الوفاة")} {i + 1} — {d.deceasedName} ·{" "}
                    {tx3(lang, "சொத்து", "Estate", "التركة")} ₹{fmt(d.estate)}
                  </summary>
                  <ResultTable rows={d.rows} lang={lang} estate={d.estate} verifyTotal={d.estate} />
                  <p className="ms-special-running">
                    {tx3(lang, "இந்தப் படி வரை ஒவ்வொருவரும் பெற்ற மொத்தம்: ", "Running total per person so far: ", "المجموع الجاري لكل شخص حتى الآن: ")}
                    {runningTotals(i)
                      .map((t) => `${t.name} ₹${fmt(t.amount)}`)
                      .join(" · ")}
                  </p>
                </details>
              </li>
            ))}
          </ol>
          <ResultTable
            rows={result.finalTotals}
            lang={lang}
            estate={estate}
            verifyTotal={estate}
            title={tx3(lang, "இறுதி மொத்தங்கள் (ஒவ்வொருவரும் மொத்தமாகப் பெறுவது)", "Final totals (what each survivor receives in total)", "المجاميع النهائية (ما يأخذه كل باقٍ في المجموع)")}
            total={estate}
          />
          <p className={result.totalsBalance ? "ms-special-ok" : "ms-special-error"} role="status">
            {result.totalsBalance
              ? tx3(lang, "✓ இறுதி மொத்தங்கள் மூலச் சொத்துடன் சரியாகப் பொருந்துகின்றன.", "✓ Final totals reconcile exactly to the original estate.", "✓ المجاميع النهائية تطابق التركة الأصلية تمامًا.")
              : tx3(lang, "⚠ எச்சரிக்கை: இறுதி மொத்தங்கள் மூலச் சொத்துடன் பொருந்தவில்லை.", "⚠ Warning: final totals do not reconcile to the original estate.", "⚠ تحذير: المجاميع النهائية لا تطابق التركة الأصلية.")}
          </p>
          <ResultNotes notes={result.notes} scholarReasons={result.scholarReasons} lang={lang} />
        </div>
      ) : null}
    </div>
  );
}
