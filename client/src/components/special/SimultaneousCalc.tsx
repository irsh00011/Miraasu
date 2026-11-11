/**
 * 10. Simultaneous death (book §4.10, p. 318; cases 278–279).
 * Death-order selection: known order → sequential Munasakha flow;
 * unknown order → separate divisions excluding the co-deceased.
 */
import { useState } from "react";
import { calculateSimultaneousDeath, type SimultaneousDeathDivisionInput } from "@/lib/specialMethods";
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
  ResetButton,
  ResultNotes,
  ResultTable,
  StepHeading,
  type DeathForm,
} from "./shared";

export default function SimultaneousCalc({ topic, lang }: TopicCalcProps) {
  const [orderKnown, setOrderKnown] = useState(false);
  const [deaths, setDeaths] = useState<DeathForm[]>(() => [
    {
      deceasedName: "",
      estate: 0,
      heirs: preloadHeirs({}),
      names: {},
    },
  ]);
  const [result, setResult] = useState<ReturnType<typeof calculateSimultaneousDeath> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const compute = (known: boolean, ds: DeathForm[]) => {
    if (ds.length === 0) {
      setResult(null);
      setError(tx3(lang, "குறைந்தது ஒரு மரணத்தையாவது சேர்க்கவும்.", "Add at least one death.", "أضف وفاة واحدة على الأقل."));
      return;
    }
    if (ds.some((d) => !(d.estate > 0) && (!known || ds.indexOf(d) === 0))) {
      setResult(null);
      setError(errEstate(lang));
      return;
    }
    try {
      const input: { orderKnown: boolean; deaths: SimultaneousDeathDivisionInput[] } = {
        orderKnown: known,
        deaths: ds.map((d) => ({
          deceasedName: d.deceasedName || tx3(lang, "இறந்தவர்", "Deceased", "المتوفى"),
          estate: d.estate,
          heirs: d.heirs,
          names: cleanNames(d.names, d.heirs, lang),
        })),
      };
      setResult(calculateSimultaneousDeath(input));
      setError(null);
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const load = () => {
    const ds: DeathForm[] = [
      {
        deceasedName: "Hasan",
        estate: 16000,
        heirs: preloadHeirs({ wives: 1, daughters: 1, paternalUnclesSons: 1 }),
        names: { wives: ["Munira"], daughters: ["Hameeda"], paternalUnclesSons: ["Hameed"] },
      },
      {
        deceasedName: "Husain",
        estate: 750,
        heirs: preloadHeirs({ daughters: 2, paternalUnclesSons: 1 }),
        names: { daughters: ["Azeezah", "Haleema"], paternalUnclesSons: ["Hameed"] },
      },
    ];
    setOrderKnown(false);
    setDeaths(ds);
    compute(false, ds);
  };

  const reset = () => {
    setOrderKnown(false);
    setDeaths([
      {
        deceasedName: "",
        estate: 0,
        heirs: preloadHeirs({}),
        names: {},
      },
    ]);
    setResult(null);
    setError(null);
  };

  const earlierNames = (i: number): string[] => {
    const out: string[] = [];
    for (let j = 0; j < i; j++) for (const arr of Object.values(deaths[j].names)) out.push(...(arr ?? []));
    return out;
  };

  return (
    <div className="ms-special-calc-body">
      <p className="ms-special-hint">{tHint(topic, lang)}</p>

      <StepHeading
        n={1}
        title={tx3(lang, "மரண வரிசை தெரியுமா?", "Is the order of death known?", "هل ترتيب الوفاة معلوم؟")}
        help={tx3(
          lang,
          "வரிசை தெரிந்தால் முனாஸஹா முறையில் கணக்கிடப்படும்; தெரியாவிட்டால் ஒவ்வொருவரின் சொத்தும் தனித்தனியே பிரிக்கப்படும் — ஒன்றாக இறந்தவர்கள் ஒருவரிடமிருந்து ஒருவர் வாரிசாக மாட்டார்கள்.",
          "If the order is known the Munasakha method applies; if not, each person's estate is divided separately — the co-deceased do not inherit from each other.",
          "إن كان الترتيب معلومًا طُبّقت المناسخة، وإن لم يكن معلومًا قُسّمت تركة كل شخص على حدة، فلا يرث المتوفون معًا بعضهم من بعض.",
        )}
      />
      <div className="ms-special-seg" role="group" aria-label={tx3(lang, "மரண வரிசை", "Order of death", "ترتيب الوفاة")}>
        <button
          type="button"
          aria-pressed={!orderKnown}
          onClick={() => setOrderKnown(false)}
          className={`ms-special-seg-btn ${!orderKnown ? "is-on" : ""}`}
        >
          {tx3(lang, "வரிசை தெரியவில்லை", "Order unknown", "الترتيب مجهول")}
        </button>
        <button
          type="button"
          aria-pressed={orderKnown}
          onClick={() => setOrderKnown(true)}
          className={`ms-special-seg-btn ${orderKnown ? "is-on" : ""}`}
        >
          {tx3(lang, "வரிசை தெரியும்", "Order known", "الترتيب معلوم")}
        </button>
      </div>
      {orderKnown ? (
        <p className="ms-special-muted">
          {tx3(
            lang,
            "வரிசை தெரிந்தால் முனாஸஹா முறையில் கணக்கிடப்படும்: முதல் மரணத்தின் சொத்து மட்டுமே உள்ளிடவும்; அடுத்த மரணங்களின் சொத்து அவர்கள் பெற்ற பங்கிலிருந்து வரும்.",
            "When the order is known the Munasakha method applies: enter only the first death's estate; later deaths' estates come from the share they received.",
            "عند معرفة الترتيب تُطبَّق المناسخة: أدخل تركة الوفاة الأولى فقط، فتركة الوفيات التالية تأتي من الحصة التي نالها أصحابها.",
          )}
        </p>
      ) : null}

      <StepHeading
        n={2}
        title={tx3(lang, "இறந்தவர்களும் அவர்களின் சொத்துகளும்", "The deceased and their estates", "المتوفون وتركاتهم")}
      />
      {deaths.map((d, i) => (
        <DeathEditor
          key={i}
          death={d}
          index={i}
          lang={lang}
          earlierNames={earlierNames(i)}
          showEstate={!orderKnown || i === 0}
          onChange={(next) => setDeaths((ds) => ds.map((x, j) => (j === i ? next : x)))}
          onRemove={() => setDeaths((ds) => ds.filter((_, j) => j !== i))}
          canRemove={deaths.length > 1}
        />
      ))}
      <AddButton
        onClick={() => setDeaths((ds) => [...ds, { deceasedName: "", estate: 0, heirs: blankHeirs(), names: {} }])}
        disabled={deaths.length >= 3}
      >
        {tx3(lang, "மரணத்தைச் சேர் (அதிகபட்சம் 3)", "Add a death (up to 3)", "أضف وفاة (حتى ٣)")}
      </AddButton>

      <StepHeading n={3} title={tx3(lang, "கணக்கிடுக", "Calculate", "احسب")} />
      <div className="ms-special-actions">
        <LoadExampleButton onLoad={load} lang={lang} />
        <CalcButton onClick={() => compute(orderKnown, deaths)} lang={lang} />
        <ResetButton onReset={reset} lang={lang} />
      </div>
      <CalcError message={error} lang={lang} />

      {result ? (
        <div className="ms-special-results">
          <FinalAnswer>{result.summary}</FinalAnswer>
          {result.munasakha ? (
            <>
              {result.munasakha.deaths.map((d, i) => (
                <ResultTable
                  key={i}
                  rows={d.rows}
                  lang={lang}
                  estate={d.estate}
                  verifyTotal={d.estate}
                  title={`${tx3(lang, "மரணம்", "Death", "الوفاة")} ${i + 1} — ${d.deceasedName} · ${tx3(lang, "சொத்து", "Estate", "التركة")} ₹${fmt(d.estate)}`}
                />
              ))}
              <ResultTable
                rows={result.munasakha.finalTotals}
                lang={lang}
                estate={result.munasakha.estate}
                verifyTotal={result.munasakha.estate}
                title={tx3(lang, "இறுதி மொத்தங்கள்", "Final totals", "المجاميع النهائية")}
                total={result.munasakha.estate}
              />
            </>
          ) : null}
          {result.divisions ? (
            <>
              {result.divisions.map((d, i) => (
                <ResultTable
                  key={i}
                  rows={d.rows}
                  lang={lang}
                  estate={d.estate}
                  verifyTotal={d.estate}
                  title={`${d.deceasedName} · ${tx3(lang, "சொத்து", "Estate", "التركة")} ₹${fmt(d.estate)}`}
                />
              ))}
              {result.combinedTotals ? (
                <ResultTable
                  rows={result.combinedTotals}
                  lang={lang}
                  estate={result.estate}
                  verifyTotal={result.estate}
                  title={tx3(
                    lang,
                    "ஒருங்கிணைந்த மொத்தங்கள் (இரு சொத்துகளிலும் வாரிசானவர்கள் இரண்டிலும் பெறுகிறார்கள்)",
                    "Combined totals (a person inheriting from both estates receives from both)",
                    "المجاميع المجمّعة (من يرث من التركتين يأخذ من كليهما)",
                  )}
                />
              ) : null}
            </>
          ) : null}
          <ResultNotes notes={result.notes} scholarReasons={result.scholarReasons} lang={lang} />
        </div>
      ) : null}
    </div>
  );
}
