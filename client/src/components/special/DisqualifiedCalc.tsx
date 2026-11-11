/**
 * 4. Disqualified heirs (book p. 38).
 * v4 rebuild (redesign spec §5): Step 1 estate → Step 2 heirs
 * (bottom-sheet picker) → Step 3 each chosen heir row gets a
 * "Cannot inherit" switch; when on, reason chips appear (Killer,
 * Different religion, Slave greyed "not applied now"); one reason chip
 * per switched-off heir (required). Result: eligible heirs' amounts
 * large; excluded heirs in the red no-share card with reason; one line
 * "Shares re-divided among N heirs". "Demo input" text link loads
 * wife + son + daughter (no book case for this topic — the user marks
 * one). Calculation unchanged: calculateDisqualifiedHeirs (existing,
 * tested).
 */
import { useState } from "react";
import { calculateDisqualifiedHeirs, type DisqualificationReason } from "@/lib/specialMethods";
import type { HeirInput } from "@/lib/inheritance";
import { errEstate, errHeirs, fmt, ss, tx3, type TopicCalcProps } from "./types";
import { enteredHeirKeys, hasAnyHeir, heirLabel, preloadHeirs } from "./heirMeta";
import {
  CalcButton,
  CalcError,
  HeirPickerSheet,
  MoneyField,
  ResetButton,
  ResultNotes,
  ResultTable,
  StepShell,
  translateEngineText,
} from "./shared";

type DisqReason = DisqualificationReason;
type Mark = { reason?: DisqReason };

const HEIR_KEYS: (keyof HeirInput)[] = [
  "husband", "wives", "father", "mother", "paternalGrandfather", "sons", "daughters",
  "fullBrothers", "fullSisters", "maternalBrothers", "maternalSisters",
  "paternalBrothers", "paternalSisters",
];

const reasonLabel = (r: DisqReason, lang: TopicCalcProps["lang"]) =>
  r === "murderer" ? ss("disqReasonKiller", lang) : ss("disqReasonReligion", lang);

export default function DisqualifiedCalc({ topic, lang }: TopicCalcProps) {
  const [estate, setEstate] = useState(topic.preload.estate);
  const [heirs, setHeirs] = useState<HeirInput>(() => preloadHeirs(topic.preload.heirs));
  const [marks, setMarks] = useState<Partial<Record<string, Mark>>>({});
  const [openStep, setOpenStep] = useState(1);
  const [result, setResult] = useState<ReturnType<typeof calculateDisqualifiedHeirs> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const clearResult = () => setResult(null);

  const compute = (e: number, h: HeirInput, m: Partial<Record<string, Mark>>) => {
    if (!(e > 0)) { setResult(null); setError(errEstate(lang)); return; }
    if (!hasAnyHeir(h)) { setResult(null); setError(errHeirs(lang)); return; }
    const missingReason = Object.entries(m).some(([, mark]) => !mark?.reason);
    if (missingReason) {
      setResult(null);
      setError(
        tx3(
          lang,
          "நீக்கப்பட்ட ஒவ்வொரு வாரிசுக்கும் ஒரு காரணத்தைத் தேர்ந்தெடுக்கவும்.",
          "Choose a reason for each switched-off heir.",
          "اختر سببًا لكل وارث مُستبعد.",
        ),
      );
      return;
    }
    try {
      const disqualified = Object.entries(m).map(([key, mark]) => ({
        key: key as keyof HeirInput,
        label: heirLabel(key, lang),
        reason: (mark?.reason ?? "murderer") as DisqReason,
      }));
      setResult(calculateDisqualifiedHeirs({ estate: e, heirs: h, disqualified }));
      setError(null);
      setOpenStep(0);
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const loadDemo = () => {
    const e = 12000;
    const h = preloadHeirs({ wives: 1, sons: 1, daughters: 1 });
    setEstate(e);
    setHeirs(h);
    setMarks({});
    setResult(null);
    setError(null);
    setOpenStep(3);
  };

  const reset = () => {
    setEstate(topic.preload.estate);
    setHeirs(preloadHeirs(topic.preload.heirs));
    setMarks({});
    setResult(null);
    setError(null);
    setOpenStep(1);
  };

  const entered = enteredHeirKeys(heirs);
  const heirCount = Object.values(heirs).reduce((s, v) => s + (v ?? 0), 0);
  const markedCount = Object.keys(marks).length;

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
          id="disq-estate"
          label={ss("stepEstate", lang)}
          value={estate}
          onChange={(v) => { setEstate(v); clearResult(); }}
        />
      </StepShell>

      <StepShell
        n={2}
        title={ss("stepHeirs", lang)}
        summary={heirCount > 0 ? tx3(lang, `${heirCount} வாரிசு(கள்)`, `${heirCount} heir(s)`, `${heirCount} من الورثة`) : null}
        open={openStep === 2}
        onOpen={() => setOpenStep(2)}
        lang={lang}
      >
        <HeirPickerSheet
          heirs={heirs}
          onChange={(h) => {
            setHeirs(h);
            // Drop marks for heirs no longer entered.
            setMarks((cur) => {
              const next: Partial<Record<string, Mark>> = {};
              for (const [k, v] of Object.entries(cur)) {
                if (((h as Record<string, number | undefined>)[k] ?? 0) > 0) next[k] = v;
              }
              return next;
            });
            clearResult();
          }}
          keys={HEIR_KEYS}
          lang={lang}
        />
      </StepShell>

      <StepShell
        n={3}
        title={tx3(lang, "தகுதியின்மையைக் குறிக்கவும்", "Mark disqualified heirs", "حدّد الورثة غير المستحقين")}
        summary={markedCount > 0 ? tx3(lang, `${markedCount} வாரிசு(கள்) நீக்கப்பட்டனர்`, `${markedCount} heir(s) marked`, `${markedCount} من الورثة مُعلَّمون`) : null}
        open={openStep === 3}
        onOpen={() => setOpenStep(3)}
        lang={lang}
      >
        {entered.length === 0 ? (
          <p className="ms4-muted">{tx3(lang, "முதலில் வாரிசுகளை உள்ளிடவும்.", "Enter heirs first.", "أدخل الورثة أولًا.")}</p>
        ) : null}
        <div className="ms4-chosen-list">
          {entered.map((m) => {
            const mark = marks[m.key];
            const on = !!mark;
            return (
              <div key={m.key} className="ms4-disq-row">
                <div className="ms4-disq-row-head">
                  <span className="ms4-disq-row-name">{tx3(lang, m.ta, m.en, m.ar)}</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={on}
                    aria-label={`${ss("disqCannotInherit", lang)} — ${tx3(lang, m.ta, m.en, m.ar)}`}
                    className={`ms4-switch ${on ? "is-on" : ""}`}
                    onClick={() => {
                      setMarks((cur) => {
                        const next = { ...cur };
                        if (on) delete next[m.key];
                        else next[m.key] = {};
                        return next;
                      });
                      clearResult();
                    }}
                  >
                    {ss("disqCannotInherit", lang)}
                  </button>
                </div>
                {on ? (
                  <div className="ms4-chips" role="group" aria-label={tx3(lang, "காரணம்", "Reason", "السبب")}>
                    {(["murderer", "different-religion"] as const).map((r) => (
                      <button
                        key={r}
                        type="button"
                        aria-pressed={mark.reason === r}
                        className={`ms4-chip ${mark.reason === r ? "is-on" : ""}`}
                        onClick={() => {
                          setMarks((cur) => ({ ...cur, [m.key]: { reason: r } }));
                          clearResult();
                        }}
                      >
                        {reasonLabel(r, lang)}
                      </button>
                    ))}
                    <button type="button" className="ms4-chip" disabled title={ss("disqReasonSlave", lang)}>
                      {ss("disqReasonSlave", lang)}
                    </button>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </StepShell>

      <div className="ms-special-actions">
        <button type="button" onClick={loadDemo} className="ms4-load-link">
          {ss("disqDemoInput", lang)}
        </button>
        <CalcButton onClick={() => compute(estate, heirs, marks)} lang={lang} />
        <ResetButton onReset={reset} lang={lang} />
      </div>
      <CalcError message={error} lang={lang} />

      {result ? (
        <div className="ms-special-results">
          <ResultTable
            rows={result.rows}
            lang={lang}
            estate={estate}
            verifyTotal={estate}
            title={tx3(lang, "தகுதியான வாரிசுகளின் பங்குகள்", "Shares of the eligible heirs", "حصص الورثة المستحقين")}
          />
          {result.excluded.length > 0 ? (
            <div className="ms4-result-list">
              {result.excluded.map((x) => {
                const rule = translateEngineText(x.rule, lang);
                return (
                  <div key={x.key} className="ms4-noshare-card">
                    <div className="ms4-noshare-card-name">
                      {x.label}
                      <span className="ms4-noshare-tag">{ss("noShare", lang)}</span>
                    </div>
                    <p className="ms4-noshare-card-reason">{reasonLabel(x.reason, lang)}</p>
                    {rule ? <p className="ms4-noshare-card-reason">{rule}</p> : null}
                  </div>
                );
              })}
            </div>
          ) : null}
          <p className="ms4-muted">{ss("disqRedivided", lang, { n: result.rows.length })}</p>
          <ResultNotes notes={[result.slaveNote]} scholarReasons={result.scholarReasons} lang={lang} />
        </div>
      ) : null}
    </div>
  );
}
