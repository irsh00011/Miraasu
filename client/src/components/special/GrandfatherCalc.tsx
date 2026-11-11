/**
 * 2. Grandfather + siblings (book rules 5.4.7 / 5.5.11; cases 113/114, 138/139).
 * v4 rebuild (redesign spec §3): the grandfather is pre-added and locked
 * (he is the subject of the topic — he cannot be removed from the picker).
 * NO opinion toggle: the result ALWAYS shows two full cards, Hanafi and
 * Shafi'i, stacked on phone and side by side on desktop, equal weight,
 * with the thin line "Different views. Not averaged." If a male brother is
 * added, the book has no case — the result shows ONLY the one-line flag
 * and NO numbers. Calculation unchanged:
 * calculateGrandfatherWithSiblings (existing, tested).
 */
import { useState } from "react";
import { calculateGrandfatherWithSiblings } from "@/lib/specialMethods";
import type { HeirInput } from "@/lib/inheritance";
import { errEstate, errHeirs, fmt, ss, tx3, type TopicCalcProps } from "./types";
import { hasAnyHeir, heirLabel, preloadHeirs } from "./heirMeta";
import {
  CalcButton,
  CalcError,
  HeirPickerSheet,
  LoadExampleButton,
  MoneyField,
  OpinionCard,
  ResetButton,
  ResultNotes,
  ResultTable,
  RoundingRow,
  StepShell,
} from "./shared";

const HEIR_KEYS: (keyof HeirInput)[] = [
  "husband", "wives", "mother",
  "fullSisters", "paternalSisters", "fullBrothers", "paternalBrothers",
];

export default function GrandfatherCalc({ topic, lang }: TopicCalcProps) {
  const [estate, setEstate] = useState(topic.preload.estate);
  const [heirs, setHeirs] = useState<HeirInput>(() => preloadHeirs(topic.preload.heirs));
  const [openStep, setOpenStep] = useState(1);
  const [result, setResult] = useState<ReturnType<typeof calculateGrandfatherWithSiblings> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const clearResult = () => setResult(null);
  const hasMaleBrothers = (heirs.fullBrothers ?? 0) > 0 || (heirs.paternalBrothers ?? 0) > 0;

  const compute = (e: number, h: HeirInput) => {
    if (!(e > 0)) { setResult(null); setError(errEstate(lang)); return; }
    if (!hasAnyHeir(h)) { setResult(null); setError(errHeirs(lang)); return; }
    try {
      setResult(calculateGrandfatherWithSiblings({ estate: e, heirs: h, school: "hanafi" }));
      setError(null);
      setOpenStep(0);
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
    compute(e, h);
  };

  const reset = () => {
    setEstate(topic.preload.estate);
    setHeirs(preloadHeirs(topic.preload.heirs));
    setResult(null);
    setError(null);
    setOpenStep(1);
  };

  const heirCount = Object.values(heirs).reduce((s, v) => s + (v ?? 0), 0);
  // Case 114 errata flag: the book misprints the Shafi'i grandfather
  // residue as 975 (copied from case 113); the correct figure is 108.33.
  // Show the rounding row only when the book-case numbers are the ones
  // on screen (sisters 866.67, grandfather 108.33).
  const shafiiGf = result?.shafii.rows.find((r) => r.key === "paternalGrandfather");
  const shafiiSisters = result?.shafii.rows.find((r) => r.key === "fullSisters" || r.key === "paternalSisters");
  const showCase114Flag =
    !!result &&
    !hasMaleBrothers &&
    !!shafiiGf &&
    Math.abs(shafiiGf.amount - 108.33) < 0.01 &&
    !!shafiiSisters &&
    Math.abs(shafiiSisters.amount - 866.67) < 0.01;

  return (
    <div className="ms-special-calc-body">
      <StepShell
        n={1}
        title={ss("stepEstate", lang)}
        summary={`₹${fmt(estate)}`}
        open={openStep === 1}
        onOpen={() => setOpenStep(1)}
        lang={lang}
      >
        <MoneyField
          id="gf-estate"
          label={ss("stepEstate", lang)}
          value={estate}
          onChange={(v) => { setEstate(v); clearResult(); }}
        />
      </StepShell>

      <StepShell
        n={2}
        title={tx3(lang, "பாட்டனும் சகோதர/சகோதரிகளும்", "Grandfather and siblings", "الجد مع الإخوة والأخوات")}
        summary={heirCount > 0 ? tx3(lang, `${heirCount} வாரிசு(கள்)`, `${heirCount} heir(s)`, `${heirCount} من الورثة`) : null}
        open={openStep === 2}
        onOpen={() => setOpenStep(2)}
        lang={lang}
      >
        <div className="ms4-locked-row">
          <span>{heirLabel("paternalGrandfather", lang)}</span>
          <span>{tx3(lang, "எப்போதும் சேர்க்கப்படுகிறார்", "Always included", "مضمَّن دائمًا")}</span>
        </div>
        <HeirPickerSheet
          heirs={heirs}
          onChange={(h) => { setHeirs({ ...h, paternalGrandfather: 1 }); clearResult(); }}
          keys={HEIR_KEYS}
          lang={lang}
        />
        <p className="ms4-muted">
          {tx3(
            lang,
            "சகோதரிகளையும், இருந்தால் மற்ற வாரிசுகளையும் சேர்க்கவும்.",
            "Add the sisters, and any other heirs who are present.",
            "أضف الأخوات، وأي ورثة آخرين موجودين.",
          )}
        </p>
      </StepShell>

      <div className="ms-special-actions">
        <LoadExampleButton onLoad={load} lang={lang} />
        <CalcButton onClick={() => compute(estate, heirs)} lang={lang} />
        <ResetButton onReset={reset} lang={lang} />
      </div>
      <CalcError message={error} lang={lang} />

      {result ? (
        <div className="ms-special-results">
          {hasMaleBrothers ? (
            <p className="ms4-flag" role="note">{ss("grandfatherBrotherAdded", lang)}</p>
          ) : (
            <>
              <div className="ms4-opinions">
                <OpinionCard title={ss("grandfatherHanafi", lang)}>
                  <ResultTable
                    rows={result.hanafi.rows}
                    lang={lang}
                    estate={estate}
                    verifyTotal={estate}
                    total={result.hanafi.totalDistributed}
                  />
                </OpinionCard>
                <OpinionCard title={ss("grandfatherShafii", lang)}>
                  <ResultTable
                    rows={result.shafii.rows}
                    lang={lang}
                    estate={estate}
                    verifyTotal={estate}
                    total={result.shafii.totalDistributed}
                  />
                  {showCase114Flag && shafiiGf ? (
                    <RoundingRow
                      label={heirLabel("paternalGrandfather", lang)}
                      amount={shafiiGf.amount}
                      bookAmount={975}
                      lang={lang}
                    />
                  ) : null}
                </OpinionCard>
              </div>
              <p className="ms4-muted">{ss("grandfatherDifferentViews", lang)}</p>
              <ResultNotes
                notes={[...result.hanafi.notes, ...result.shafii.notes]}
                scholarReasons={result.scholarReasons}
                lang={lang}
              />
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
