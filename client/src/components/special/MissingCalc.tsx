/**
 * 7. Missing person / prisoner (book §4.7, p. 308; cases 274–277).
 * v4 rebuild (redesign spec §8): Step 3 "Who is missing?" is a
 * single-select list of the chosen heirs — tap one name, and the row
 * carries a "Missing" badge (required). Result: swipeable "If alive" /
 * "If dead" cards (each with its own one-line total check), then a large
 * "Pay now" card and a large "Held" box, then a waiting-period flag card:
 * "70 years — the book gives no start date." NO date input, NO countdown,
 * NO calculated deadline. A prisoner known to be alive in jail has no
 * separate rule — one-line flag where it applies. Book case 275's
 * misprint (23,333.33 printed once as 233,333.33) is flagged; the
 * calculator uses 23,333.33.
 * Calculation unchanged: calculateMissingPerson (existing, tested).
 */
import { useState } from "react";
import { calculateMissingPerson } from "@/lib/specialMethods";
import type { HeirInput } from "@/lib/inheritance";
import { errEstate, errHeirs, fmt, ss, tx3, type TopicCalcProps } from "./types";
import { enteredHeirKeys, hasAnyHeir, heirCount, heirLabel, preloadHeirs } from "./heirMeta";
import {
  CalcButton,
  CalcError,
  FlagLine,
  HeirPickerSheet,
  HeldBox,
  LoadExampleButton,
  MoneyField,
  ResetButton,
  ResultTable,
  StepShell,
  SwipeCards,
  TotalCheckLine,
} from "./shared";

const HEIR_KEYS: (keyof HeirInput)[] = [
  "husband", "wives", "father", "mother", "paternalGrandfather",
  "sons", "daughters", "fullBrothers", "fullSisters",
  "maternalBrothers", "maternalSisters",
];

const PRISONER_NO_RULE =
  "The book gives the prisoner no separate rule despite the chapter heading naming him, and is silent on a prisoner known to be alive in jail.";

export default function MissingCalc({ topic, lang }: TopicCalcProps) {
  const [estate, setEstate] = useState(topic.preload.estate);
  const [heirs, setHeirs] = useState<HeirInput>(() => preloadHeirs(topic.preload.heirs));
  const [missingKey, setMissingKey] = useState<keyof HeirInput | null>("sons");
  const [kind, setKind] = useState<"missing" | "prisoner">("missing");
  const [openStep, setOpenStep] = useState(1);
  const [result, setResult] = useState<ReturnType<typeof calculateMissingPerson> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const clearResult = () => setResult(null);

  const compute = (e: number, h: HeirInput, k: keyof HeirInput | null, kd: "missing" | "prisoner") => {
    if (!(e > 0)) { setResult(null); setError(errEstate(lang)); return; }
    if (!hasAnyHeir(h)) { setResult(null); setError(errHeirs(lang)); return; }
    if (!k || heirCount(h, k) === 0) {
      setResult(null);
      setError(tx3(lang, "காணாமல் போனவர் யார் என்பதைத் தேர்ந்தெடுக்கவும்.", "Choose who is missing.", "اختر من هو المفقود."));
      return;
    }
    try {
      setResult(calculateMissingPerson({ estate: e, heirs: h, missingKey: k, missingCount: 1, kind: kd }));
      setError(null);
      setOpenStep(0);
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
    setKind("missing");
    compute(e, h, "sons", "missing");
  };

  const reset = () => {
    setEstate(topic.preload.estate);
    setHeirs(preloadHeirs(topic.preload.heirs));
    setMissingKey("sons");
    setKind("missing");
    setResult(null);
    setError(null);
    setOpenStep(1);
  };

  const heirCountTotal = Object.values(heirs).reduce((s, v) => s + (v ?? 0), 0);
  const entered = enteredHeirKeys(heirs);
  const missingSelected = missingKey !== null && heirCount(heirs, missingKey) > 0;
  // Case 275 erratum flag: the book misprints the missing sister's share
  // as 233,333.33 in one line; the correct figure is 23,333.33.
  const showCase275Flag =
    !!result && estate === 120000 && Math.abs(result.heldAmount - 23333.33) < 0.01;

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
          id="missing-estate"
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
        title={ss("missingWho", lang)}
        summary={missingSelected && missingKey ? heirLabel(missingKey, lang) : null}
        open={openStep === 3}
        onOpen={() => setOpenStep(3)}
        lang={lang}
      >
        <div className="ms-special-seg" role="group" aria-label={tx3(lang, "நிலை", "Situation", "الحالة")}>
          <button
            type="button"
            aria-pressed={kind === "missing"}
            onClick={() => { setKind("missing"); clearResult(); }}
            className={`ms-special-seg-btn ${kind === "missing" ? "is-on" : ""}`}
          >
            {tx3(lang, "காணாமல் போனவர்", "Missing person", "المفقود")}
          </button>
          <button
            type="button"
            aria-pressed={kind === "prisoner"}
            onClick={() => { setKind("prisoner"); clearResult(); }}
            className={`ms-special-seg-btn ${kind === "prisoner" ? "is-on" : ""}`}
          >
            {ss("missingPrisoner", lang)}
          </button>
        </div>
        {entered.length === 0 ? (
          <p className="ms4-muted">
            {tx3(lang, "முதலில் வாரிசுகளைச் சேர்க்கவும்.", "Add heirs first.", "أضف الورثة أولًا.")}
          </p>
        ) : (
          <div className="ms4-branch-cards">
            {entered.map((m) => {
              const selected = missingKey === m.key;
              const count = heirCount(heirs, m.key);
              return (
                <button
                  key={m.key}
                  type="button"
                  className={`ms4-branch-card ${selected ? "is-selected" : ""}`}
                  aria-pressed={selected}
                  onClick={() => { setMissingKey(m.key); clearResult(); }}
                >
                  <span className="ms4-branch-card-title">
                    {tx3(lang, m.ta, m.en, m.ar)}
                    {count > 1 ? ` × ${count}` : ""}
                  </span>
                  {selected ? (
                    <span className="ms4-pill">{tx3(lang, "காணாமல் போனவர்", "Missing", "المفقود")}</span>
                  ) : null}
                </button>
              );
            })}
          </div>
        )}
      </StepShell>

      <div className="ms-special-actions">
        <LoadExampleButton onLoad={load} lang={lang} />
        <CalcButton onClick={() => compute(estate, heirs, missingKey, kind)} lang={lang} />
        <ResetButton onReset={reset} lang={lang} />
      </div>
      <CalcError message={error} lang={lang} />

      {result ? (
        <div className="ms-special-results">
          <SwipeCards
            lang={lang}
            cards={[
              {
                title: ss("missingIfAlive", lang),
                content: (
                  <ResultTable
                    rows={result.ifAlive.rows}
                    lang={lang}
                    estate={estate}
                    verifyTotal={estate}
                    total={result.ifAlive.totalDistributed}
                  />
                ),
              },
              {
                title: ss("missingIfDead", lang),
                content: (
                  <ResultTable
                    rows={result.ifDead.rows}
                    lang={lang}
                    estate={estate}
                    verifyTotal={estate}
                    total={result.ifDead.totalDistributed}
                  />
                ),
              },
            ]}
          />
          <ResultTable
            rows={result.payNow}
            lang={lang}
            estate={estate}
            title={ss("payNow", lang)}
            total={result.payNowTotal}
          />
          <HeldBox label={ss("held", lang)} amount={result.heldAmount} lang={lang} />
          <TotalCheckLine total={estate} lang={lang} />
          <p className="ms4-flag" role="note">
            <strong>{ss("missingWaitingPeriod", lang)}</strong> — {ss("missingSeventyYears", lang)}
          </p>
          {kind === "prisoner" ? <FlagLine text={PRISONER_NO_RULE} lang={lang} /> : null}
          {showCase275Flag ? (
            <p className="ms4-flag" role="note">
              {tx3(
                lang,
                "கணக்கு 275: நூலில் இந்தப் பங்கு ஒரு இடத்தில் 233,333.33 என்று அச்சாகியுள்ளது; சரியான தொகை 23,333.33.",
                "Case 275: the book prints this share as 233,333.33 in one line; the correct figure is 23,333.33.",
                "المسألة 275: يطبع الكتاب هذه الحصة 233,333.33 في موضع واحد؛ والرقم الصحيح 23,333.33.",
              )}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
