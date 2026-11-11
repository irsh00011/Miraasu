/**
 * 11. Renunciation / refusal of a share (book §4.11, p. 301; case 271).
 * v4 rebuild (redesign spec §12): Step 3 "Who refuses?" is a
 * single-select list of the chosen heirs (tap one name); the row gets a
 * "Refuses" tag (required). Result: ONE card with three steps joined by
 * arrows: (1) First division — with the refuser included (amounts
 * small, refuser's row visible); (2) Their share re-divided — the
 * refused amount split in proportion; (3) Final amounts — large.
 * One-line note under step 1: "Do not remove the refuser first — it
 * changes the others' shares." The WRONG method (drop the wife first →
 * father and daughter ₹2,100 each) appears ONCE, small, inside "Show
 * working" only — never as a result.
 *
 * DO NOT "fix" the numbers: book case 271 (estate ₹4,200) final is
 * father ₹1,837.50, daughter ₹2,362.50, wife ₹0.00. An answer key
 * elsewhere shows father 1,800 / daughter 2,400 — that is the key
 * author's own working, NOT the book's. The current implementation is
 * correct (the book's own warning confirms it: dropping the wife first
 * gives the father ₹262.50 too much).
 *
 * Calculation unchanged: calculateRenunciation (existing, tested).
 */
import { useState } from "react";
import { calculateRenunciation, rowPercent, type SpecialRow } from "@/lib/specialMethods";
import type { HeirInput } from "@/lib/inheritance";
import { errEstate, errHeirs, fmt, ss, tx3, type TopicCalcProps } from "./types";
import { enteredHeirKeys, hasAnyHeir, heirCount, heirLabel, preloadHeirs } from "./heirMeta";
import {
  AmountRow,
  CalcButton,
  CalcError,
  FinalAnswer,
  FlagLine,
  HeirPickerSheet,
  LoadExampleButton,
  MoneyField,
  ResetButton,
  ResultNotes,
  ShowWorking,
  StepShell,
  TotalCheckLine,
  rowLabel,
  translateEngineText,
} from "./shared";

const HEIR_KEYS: (keyof HeirInput)[] = [
  "husband", "wives", "father", "mother", "paternalGrandfather",
  "sons", "daughters", "fullBrothers", "fullSisters",
  "maternalBrothers", "maternalSisters",
];

/** Small amount row for steps 1–2 (final amounts use the large AmountRow). */
function CompactRow({
  row,
  lang,
  tag,
}: {
  row: SpecialRow;
  lang: "ta" | "en" | "ar";
  tag?: string | null;
}) {
  return (
    <div className="ms4-compact-row">
      <span className="ms4-compact-row-name">
        {rowLabel(row, lang)}
        {tag ? <span className="ms4-pill"> {tag}</span> : null}
      </span>
      <span className="ms4-compact-row-frac">{row.fraction}</span>
      <span className="ms4-compact-row-amount">₹{fmt(row.amount)}</span>
    </div>
  );
}

const WRONG_METHOD_NOTE =
  "Removing the refuser first gives a wrong answer (the book: 'இது தவறானது' — this is wrong); the first division must include them.";

export default function RenunciationCalc({ topic, lang }: TopicCalcProps) {
  const [estate, setEstate] = useState(topic.preload.estate);
  const [heirs, setHeirs] = useState<HeirInput>(() => preloadHeirs(topic.preload.heirs));
  const [refuserKey, setRefuserKey] = useState<keyof HeirInput | null>(null);
  const [openStep, setOpenStep] = useState(1);
  const [result, setResult] = useState<ReturnType<typeof calculateRenunciation> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const clearResult = () => setResult(null);

  const compute = (e: number, h: HeirInput, r: keyof HeirInput | null) => {
    if (!(e > 0)) { setResult(null); setError(errEstate(lang)); return; }
    if (!hasAnyHeir(h)) { setResult(null); setError(errHeirs(lang)); return; }
    if (!r || heirCount(h, r) === 0) {
      setResult(null);
      setError(tx3(lang, "மறுப்பவர் யார் என்பதைத் தேர்ந்தெடுக்கவும்.", "Choose who refuses.", "اختر من يتنازل."));
      return;
    }
    try {
      setResult(calculateRenunciation({ estate: e, heirs: h, refuserKey: r }));
      setError(null);
      setOpenStep(0);
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const load = () => {
    const e = 4200;
    const h = preloadHeirs({ wives: 1, daughters: 1, father: 1 });
    setEstate(e);
    setHeirs(h);
    setRefuserKey("wives");
    compute(e, h, "wives");
  };

  const reset = () => {
    setEstate(topic.preload.estate);
    setHeirs(preloadHeirs(topic.preload.heirs));
    setRefuserKey(null);
    setResult(null);
    setError(null);
    setOpenStep(1);
  };

  const entered = enteredHeirKeys(heirs);
  const heirCountTotal = Object.values(heirs).reduce((s, v) => s + (v ?? 0), 0);
  const refuserSelected = refuserKey !== null && heirCount(heirs, refuserKey) > 0;

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
          id="renun-estate"
          label={ss("stepEstate", lang)}
          value={estate}
          onChange={(v) => { setEstate(v); clearResult(); }}
        />
      </StepShell>

      <StepShell
        n={2}
        title={ss("stepHeirs", lang)}
        summary={heirCountTotal > 0 ? tx3(lang, `${heirCountTotal} வாரிசு(கள்)`, `${heirCountTotal} heir(s)`, `${heirCountTotal} من الورثة`) : null}
        open={openStep === 2}
        onOpen={() => setOpenStep(2)}
        lang={lang}
      >
        <HeirPickerSheet
          heirs={heirs}
          onChange={(h) => { setHeirs(h); clearResult(); }}
          keys={HEIR_KEYS}
          lang={lang}
        />
      </StepShell>

      <StepShell
        n={3}
        title={ss("renunWhoRefuses", lang)}
        summary={refuserSelected && refuserKey ? `${heirLabel(refuserKey, lang)} — ${ss("renunRefuses", lang)}` : null}
        open={openStep === 3}
        onOpen={() => setOpenStep(3)}
        lang={lang}
      >
        {entered.length === 0 ? (
          <p className="ms4-muted">
            {tx3(lang, "முதலில் வாரிசுகளைச் சேர்க்கவும்.", "Add heirs first.", "أضف الورثة أولًا.")}
          </p>
        ) : (
          <div className="ms4-branch-cards">
            {entered.map((m) => {
              const selected = refuserKey === m.key;
              const count = heirCount(heirs, m.key);
              return (
                <button
                  key={m.key}
                  type="button"
                  className={`ms4-branch-card ${selected ? "is-selected" : ""}`}
                  aria-pressed={selected}
                  onClick={() => { setRefuserKey(m.key); clearResult(); }}
                >
                  <span className="ms4-branch-card-title">
                    {tx3(lang, m.ta, m.en, m.ar)}
                    {count > 1 ? ` × ${count}` : ""}
                  </span>
                  {selected ? <span className="ms4-pill">{ss("renunRefuses", lang)}</span> : null}
                </button>
              );
            })}
          </div>
        )}
      </StepShell>

      <div className="ms-special-actions">
        <LoadExampleButton onLoad={load} lang={lang} />
        <CalcButton onClick={() => compute(estate, heirs, refuserKey)} lang={lang} />
        <ResetButton onReset={reset} lang={lang} />
      </div>
      <CalcError message={error} lang={lang} />

      {result ? (
        <div className="ms-special-results">
          <FinalAnswer lang={lang}>{result.summary}</FinalAnswer>
          <div className="ms4-results">
            <h4 className="ms4-results-title">{ss("renunFirstDivision", lang)}</h4>
            {result.firstDivision.map((row) => (
              <CompactRow
                key={row.key}
                row={row}
                lang={lang}
                tag={row.key === String(refuserKey) ? ss("renunRefuses", lang) : null}
              />
            ))}
            <p className="ms4-muted">{ss("renunDoNotRemove", lang)}</p>
            <div className="ms4-step-arrow" aria-hidden="true">↓</div>
            <h4 className="ms4-results-title">{ss("renunShareRedivided", lang)}</h4>
            <p className="ms4-muted">
              {tx3(lang, "மறுக்கப்பட்ட பங்கு: ", "Refused share: ", "الحصة المتنازَل عنها: ")}₹{fmt(result.refusedAmount)}
            </p>
            {result.redistribution.map((row) => (
              <CompactRow key={row.key} row={row} lang={lang} />
            ))}
            <div className="ms4-step-arrow" aria-hidden="true">↓</div>
            <h4 className="ms4-results-title">{ss("munasakhaFinalAmounts", lang)}</h4>
            <div className="ms4-result-list">
              {result.finalRows
                .filter((r) => r.amount > 0)
                .map((row) => (
                  <AmountRow
                    key={row.key}
                    label={rowLabel(row, lang)}
                    amount={row.amount}
                    fraction={row.fraction}
                    percent={rowPercent(row)}
                    note={row.note}
                    lang={lang}
                  />
                ))}
              {result.finalRows
                .filter((r) => r.amount === 0)
                .map((row) => (
                  <div key={row.key} className="ms4-noshare-card">
                    <div className="ms4-noshare-card-name">
                      {rowLabel(row, lang)}
                      <span className="ms4-noshare-tag">{ss("noShare", lang)}</span>
                    </div>
                    <p className="ms4-noshare-card-reason">
                      {translateEngineText(row.note ?? "", lang) ?? ss("renunRefuses", lang)}
                    </p>
                  </div>
                ))}
            </div>
            <TotalCheckLine total={estate} lang={lang} />
            <ShowWorking lang={lang}>
              <FlagLine text={WRONG_METHOD_NOTE} lang={lang} />
              {result.wrongMethod.map((row) => (
                <CompactRow key={row.key} row={row} lang={lang} />
              ))}
            </ShowWorking>
          </div>
          <ResultNotes
            notes={result.notes.filter((n) => !n.startsWith("Removing the refuser first"))}
            scholarReasons={result.scholarReasons}
            lang={lang}
          />
        </div>
      ) : null}
    </div>
  );
}
