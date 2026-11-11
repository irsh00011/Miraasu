/**
 * 9. Munasakha — multi-generation sequential division (book §4.9, p. 292;
 * cases 269–270).
 * v4 rebuild (redesign spec §10): ONE stage at a time, never the full
 * picker repeated on one page. Step 1 is the original estate. Each stage:
 * "Who died?" (name text field, required) + "Add heir" bottom sheet for
 * that person's heirs (names editable — the same person can inherit in
 * several deaths) + a "Calculate stage" button. A finished stage
 * collapses to ONE summary line ("Stage 1 — Saleem: Wives ₹275.00,
 * Aaqil ₹770.00, Samha ₹385.00, Aaliya ₹385.00" — the later-deceased
 * Asma's share is left out of the line because it became the next
 * estate). "Add a death" picks which heir from a previous stage died
 * (single-select from the living heirs); their share becomes the new
 * estate, shown as one line ("Estate of this death: ₹385.00 (Asma's
 * share from Stage 1)"). Result: a vertical timeline, each stage a card
 * with the amount being divided in large text, then a "Final amounts"
 * card with each living heir's total tagged "From Stage 1 / Stage 2".
 * NO combined-LCM shortcut (the book gives none). The Radd correction
 * in case 269 (death 2: the paternal half-brother takes the residue)
 * carries a flag chip — it needs a scholar's confirmation.
 *
 * Calculation unchanged: calculateMunasakha (existing, tested). The
 * stage editor + summary helpers are exported for Topic 10
 * (SimultaneousCalc), whose known-order flow IS this flow.
 */
import { useRef, useState } from "react";
import { calculateMunasakha, rowPercent, type MunasakhaDeathOutcome, type MunasakhaResult, type SpecialRow } from "@/lib/specialMethods";
import type { HeirInput } from "@/lib/inheritance";
import { errEstate, errHeirs, fmt, ss, tx3, type TopicCalcProps } from "./types";
import { blankHeirs, heirLabel, preloadHeirs } from "./heirMeta";
import {
  AddButton,
  CalcError,
  cleanNames,
  FinalAnswer,
  HeirPickerSheet,
  HeldBox,
  LoadExampleButton,
  MoneyField,
  namesForHeirs,
  ResetButton,
  ResultNotes,
  ResultTable,
  StepShell,
  Timeline,
  TotalCheckLine,
  type NamesMap,
} from "./shared";

/** One death in the sequence. `done` = calculated and collapsed. */
export type StageForm = {
  deceasedName: string;
  heirs: HeirInput;
  names: NamesMap;
  done: boolean;
  /** Display-only: this death's estate, fixed when the stage is added
   * (the picked heir's share from the earlier stages). The engine
   * recomputes it from the shares on Calculate; storing it here keeps
   * the "Estate of this death" line visible while the user edits the
   * stage's heirs (which clears the live result). */
  estateAmount?: number;
  /** Display-only: the stage the estate came from (1-based). */
  estateFromStage?: number;
};

export const STAGE_HEIR_KEYS: (keyof HeirInput)[] = [
  "husband",
  "wives",
  "father",
  "mother",
  "paternalGrandfather",
  "paternalGrandmothers",
  "maternalGrandmothers",
  "sons",
  "daughters",
  "fullBrothers",
  "fullSisters",
  "maternalBrothers",
  "maternalSisters",
  "paternalBrothers",
  "paternalSisters",
  "paternalUncles",
  "paternalUnclesSons",
  "sonsSons",
  "sonsDaughters",
];

/**
 * Per-person amounts per stage: name → [{ stage (0-based), amount }].
 * A stage row's amount is split equally among its named persons
 * (row.amount / row.count); the names map is kept in step by the sheet.
 */
export function stageContributions(
  result: MunasakhaResult,
  stages: StageForm[],
): Map<string, { stage: number; amount: number }[]> {
  const out = new Map<string, { stage: number; amount: number }[]>();
  result.deaths.forEach((death, i) => {
    const stage = stages[i];
    for (const row of death.rows) {
      if (row.key === "__held__") continue;
      const names = stage?.names[row.key] ?? [row.label];
      const per = row.amount / Math.max(1, row.count);
      for (const name of names) {
        const list = out.get(name) ?? [];
        list.push({ stage: i, amount: per });
        out.set(name, list);
      }
    }
  });
  return out;
}

/**
 * One-line summary of a finished stage, e.g.
 * "Stage 1 — Saleem: Wives ₹275.00, Aaqil ₹770.00, Samha ₹385.00,
 * Aaliya ₹385.00". Wives share one fixed share, so they are grouped;
 * everyone else is listed per person. People who died in a later stage
 * are left out — their share became the next estate.
 */
export function stageSummaryLine(
  stage: StageForm,
  outcome: MunasakhaDeathOutcome,
  stageIndex: number,
  laterDeceased: Set<string>,
  lang: "ta" | "en" | "ar",
): string {
  const parts: string[] = [];
  for (const row of outcome.rows) {
    if (row.key === "__held__") continue;
    if (row.key === "wives" && row.count > 1) {
      parts.push(
        `${tx3(lang, "மனைவிகள்", "Wives", "الزوجات")} ₹${fmt(row.amount)}`,
      );
      continue;
    }
    const names = stage.names[row.key] ?? [row.label];
    const per = row.amount / Math.max(1, row.count);
    for (const name of names) {
      if (laterDeceased.has(name)) continue;
      parts.push(`${name} ₹${fmt(per)}`);
    }
  }
  if (parts.length === 0) {
    for (const row of outcome.rows) {
      if (row.key === "__held__") continue;
      parts.push(`${heirLabel(row.key, lang)} ₹${fmt(row.amount)}`);
    }
  }
  return `${ss("munasakhaStage", lang, { n: stageIndex + 1 })} — ${stage.deceasedName}: ${parts.join(", ")}`;
}

/**
 * One stage's editor: "Who died?" + "Add heir" bottom sheet + the
 * "Estate of this death" line (stages after the first) + a
 * "Calculate stage" button. For stages after the first the deceased was
 * picked when the stage was added, so the name is shown fixed.
 */
export function StageEditor({
  stage,
  index,
  lang,
  estateLine,
  onChange,
  onCalculateStage,
}: {
  stage: StageForm;
  index: number;
  lang: "ta" | "en" | "ar";
  /** "Estate of this death: ₹X (Name's share from Stage N)" — stages 2+. */
  estateLine: string | null;
  onChange: (next: StageForm) => void;
  onCalculateStage: () => void;
}) {
  // HeirPickerSheet fires onChange (heirs) and onNamesChange (names)
  // back-to-back inside one stepper click, both spreading the same
  // `stage` prop — so the second call would clobber the first. Keep the
  // latest form in a ref, updated synchronously, so the two merge.
  const latestRef = useRef(stage);
  latestRef.current = stage;
  const update = (next: StageForm) => {
    latestRef.current = next;
    onChange(next);
  };
  return (
    <div>
      {index === 0 ? (
        <label className="ms-special-field">
          <span className="ms-special-field-label">{ss("munasakhaWhoDied", lang)}</span>
          <input
            type="text"
            value={stage.deceasedName}
            onChange={(e) => update({ ...latestRef.current, deceasedName: e.target.value })}
            className="ms-special-input"
            placeholder={tx3(lang, "எ.கா. ஸலீம்", "e.g. Saleem", "مثال: سالم")}
          />
        </label>
      ) : (
        <p className="ms4-stage-estate">
          {ss("munasakhaWhoDied", lang)} — <strong>{stage.deceasedName}</strong>
        </p>
      )}
      {estateLine ? <p className="ms4-stage-estate">{estateLine}</p> : null}
      <HeirPickerSheet
        heirs={stage.heirs}
        onChange={(h) => update({ ...latestRef.current, heirs: h, names: cleanNames(latestRef.current.names, h, lang) })}
        keys={STAGE_HEIR_KEYS}
        lang={lang}
        names={stage.names}
        onNamesChange={(n) => update({ ...latestRef.current, names: n })}
      />
      <div className="ms-special-actions">
        <button type="button" onClick={onCalculateStage} className="ms4-calc-btn">
          {tx3(lang, "நிலையைக் கணக்கிடுக", "Calculate stage", "احسب المرحلة")}
        </button>
      </div>
    </div>
  );
}

/** Relabel single-person rows with the person's name (display only). */
export function personRows(rows: SpecialRow[], names: NamesMap): SpecialRow[] {
  return rows.map((row) => {
    if (row.count === 1 && names[row.key]?.[0]) {
      const name = names[row.key]![0];
      return { ...row, key: name, label: name };
    }
    return row;
  });
}

export default function MunasakhaCalc({ topic, lang }: TopicCalcProps) {
  const initialStage = (): StageForm => ({
    deceasedName: "Saleem",
    heirs: preloadHeirs(topic.preload.heirs),
    names: namesForHeirs(preloadHeirs(topic.preload.heirs), lang),
    done: false,
  });
  const [estate, setEstate] = useState(topic.preload.estate);
  const [stages, setStages] = useState<StageForm[]>(() => [initialStage()]);
  const [openStage, setOpenStage] = useState<number | null>(0);
  const [addingDeath, setAddingDeath] = useState(false);
  const [result, setResult] = useState<MunasakhaResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const clearResult = () => setResult(null);

  /** Edit stage i: it (and every later stage) stops being done. */
  const updateStage = (i: number, next: StageForm) => {
    setStages((ds) =>
      ds.map((s, j) => (j === i ? { ...next, done: false } : j > i ? { ...s, done: false } : s)),
    );
    setResult(null);
    setError(null);
  };

  const toInput = (s: StageForm) => ({
    deceasedName: s.deceasedName || tx3(lang, "இறந்தவர்", "Deceased", "المتوفى"),
    heirs: s.heirs,
    names: cleanNames(s.names, s.heirs, lang),
  });

  const computeStage = (i: number) => {
    const st = stages[i];
    if (!(estate > 0)) { setResult(null); setError(errEstate(lang)); return; }
    if (!st.deceasedName.trim()) {
      setResult(null);
      setError(tx3(lang, "இறந்தவர் பெயரை உள்ளிடவும்.", "Enter who died.", "أدخل اسم المتوفى."));
      return;
    }
    if (!Object.values(st.heirs).some((v) => (v ?? 0) > 0)) {
      setResult(null);
      setError(errHeirs(lang));
      return;
    }
    try {
      const res = calculateMunasakha({ estate, deaths: stages.slice(0, i + 1).map(toInput) });
      setResult(res);
      setStages((ds) => ds.map((s, j) => (j <= i ? { ...s, done: true } : s)));
      setOpenStage(null);
      setAddingDeath(false);
      setError(null);
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const load = () => {
    const e = 2200;
    const d1: StageForm = {
      deceasedName: "Saleem",
      heirs: preloadHeirs({ wives: 2, sons: 1, daughters: 3 }),
      names: { wives: ["Salma", "Jameela"], sons: ["Aaqil"], daughters: ["Asma", "Samha", "Aaliya"] },
      done: true,
    };
    const d2: StageForm = {
      deceasedName: "Asma",
      heirs: preloadHeirs({ mother: 1, fullSisters: 2, paternalBrothers: 1 }),
      names: { mother: ["Jameela"], fullSisters: ["Samha", "Aaliya"], paternalBrothers: ["Aaqil"] },
      done: true,
      estateAmount: 385,
      estateFromStage: 1,
    };
    setEstate(e);
    setStages([d1, d2]);
    setOpenStage(null);
    setAddingDeath(false);
    try {
      setResult(calculateMunasakha({ estate: e, deaths: [d1, d2].map(toInput) }));
      setError(null);
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const reset = () => {
    setEstate(topic.preload.estate);
    setStages([initialStage()]);
    setOpenStage(0);
    setAddingDeath(false);
    setResult(null);
    setError(null);
  };

  // Living heirs (for "Add a death"): everyone in the final totals so
  // far, except people who already died in a later stage.
  const deceasedNames = new Set(stages.map((s) => s.deceasedName));
  const livingHeirs: { name: string; amount: number }[] = result
    ? result.finalTotals
        .filter((r) => r.key !== "__held__" && !deceasedNames.has(r.label))
        .map((r) => ({ name: r.label, amount: r.amount }))
    : [];

  // "Estate of this death" line for an open stage after the first —
  // stored on the stage when it was added, so it survives editing the
  // stage's heirs (which clears the live result).
  const estateLineFor = (i: number): string | null => {
    if (i === 0) return null;
    const stage = stages[i];
    if (stage.estateAmount === undefined) return null;
    const from = stage.estateFromStage ?? 1;
    return `${ss("munasakhaEstateOfDeath", lang)}: ₹${fmt(stage.estateAmount)} (${stage.deceasedName} — ${ss("munasakhaFromStage", lang, { n: from })})`;
  };

  const laterDeceasedFor = (i: number): Set<string> =>
    new Set(stages.slice(i + 1).map((s) => s.deceasedName));

  const contributions = result ? stageContributions(result, stages) : null;
  const showRaddFlag =
    !!result &&
    (result.notes.some((n) => n.includes("269")) ||
      result.scholarReasons.some((n) => n.includes("269")));

  return (
    <div className="ms-special-calc-body">
      <StepShell
        n={1}
        title={ss("stepEstate", lang)}
        summary={`₹${fmt(estate)}`}
        open={openStage === -1}
        onOpen={() => setOpenStage(-1)}
        lang={lang}
      >
        <MoneyField
          id="munasakha-estate"
          label={ss("stepEstate", lang)}
          value={estate}
          onChange={(v) => { setEstate(v); clearResult(); }}
        />
      </StepShell>

      {stages.map((stage, i) => {
        const outcome = result?.deaths[i];
        const summary =
          stage.done && outcome
            ? stageSummaryLine(stage, outcome, i, laterDeceasedFor(i), lang)
            : null;
        const title = stage.deceasedName
          ? `${ss("munasakhaStage", lang, { n: i + 1 })} — ${stage.deceasedName}`
          : ss("munasakhaStage", lang, { n: i + 1 });
        return (
          <StepShell
            key={i}
            n={i + 2}
            title={title}
            summary={summary}
            open={openStage === i}
            onOpen={() => setOpenStage(i)}
            lang={lang}
          >
            <StageEditor
              stage={stage}
              index={i}
              lang={lang}
              estateLine={estateLineFor(i)}
              onChange={(next) => updateStage(i, next)}
              onCalculateStage={() => computeStage(i)}
            />
            {i > 0 ? (
              <button
                type="button"
                className="ms4-load-link"
                onClick={() => {
                  setStages((ds) => ds.filter((_, j) => j !== i));
                  setResult(null);
                  setOpenStage(null);
                }}
              >
                {tx3(lang, "இந்த மரணத்தை நீக்குக", "Remove this death", "احذف هذه الوفاة")}
              </button>
            ) : null}
          </StepShell>
        );
      })}

      {result && stages[stages.length - 1].done && stages.length < 3 && !addingDeath ? (
        <AddButton onClick={() => setAddingDeath(true)}>
          {ss("munasakhaAddDeath", lang)}
        </AddButton>
      ) : null}

      {addingDeath ? (
        <div className="ms4-step is-open">
          <div className="ms4-step-head">
            <span className="ms4-step-num" aria-hidden="true">{stages.length + 1}</span>
            <h3 className="ms4-step-title">{ss("munasakhaWhoDied", lang)}</h3>
          </div>
          <div className="ms4-step-body">
            <div className="ms4-branch-cards">
              {livingHeirs.map((h) => (
                <button
                  key={h.name}
                  type="button"
                  className="ms4-branch-card"
                  onClick={() => {
                    const contrib = (result ? stageContributions(result, stages) : new Map()).get(h.name) ?? [];
                    const fromStage = contrib.length > 0 ? contrib[contrib.length - 1].stage + 1 : 1;
                    const next: StageForm = {
                      deceasedName: h.name,
                      heirs: blankHeirs(),
                      names: {},
                      done: false,
                      estateAmount: h.amount,
                      estateFromStage: fromStage,
                    };
                    setStages((ds) => [...ds, next]);
                    setOpenStage(stages.length);
                    setAddingDeath(false);
                  }}
                >
                  <span className="ms4-branch-card-title">{h.name}</span>
                  <span className="ms4-branch-card-sub">₹{fmt(h.amount)}</span>
                </button>
              ))}
            </div>
            <button type="button" className="ms4-load-link" onClick={() => setAddingDeath(false)}>
              {tx3(lang, "ரத்து செய்க", "Cancel", "إلغاء")}
            </button>
          </div>
        </div>
      ) : null}

      <div className="ms-special-actions">
        <LoadExampleButton onLoad={load} lang={lang} />
        <ResetButton onReset={reset} lang={lang} />
      </div>
      <CalcError message={error} lang={lang} />

      {result ? (
        <div className="ms-special-results">
          <FinalAnswer lang={lang}>{result.summary}</FinalAnswer>
          <Timeline
            items={result.deaths.map((d, i) => ({
              summary: (
                <div>
                  <p className="ms4-results-title">
                    {ss("munasakhaStage", lang, { n: i + 1 })} — {d.deceasedName}
                  </p>
                  <p className="ms4-big-amount">₹{fmt(d.estate)}</p>
                  {i > 0 ? (
                    <p className="ms4-stage-estate">
                      {ss("munasakhaEstateOfDeath", lang)}: ₹{fmt(d.estate)} ({d.deceasedName} —{" "}
                      {(() => {
                        const contrib = contributions?.get(d.deceasedName) ?? [];
                        const fromStage = contrib.length > 0 ? contrib[contrib.length - 1].stage + 1 : i;
                        return ss("munasakhaFromStage", lang, { n: fromStage });
                      })()}
                      )
                    </p>
                  ) : null}
                  <ResultTable
                    rows={personRows(d.rows, stages[i]?.names ?? {})}
                    lang={lang}
                    estate={d.estate}
                    verifyTotal={d.estate}
                    showDetails={false}
                  />
                </div>
              ),
            }))}
          />
          <div className="ms4-results">
            <h4 className="ms4-results-title">{ss("munasakhaFinalAmounts", lang)}</h4>
            <div className="ms4-result-list">
              {result.finalTotals
                .filter((r) => r.key !== "__held__")
                .map((row) => {
                  const sources = (contributions?.get(row.label) ?? [])
                    .map((c) => `₹${fmt(c.amount)} ${ss("munasakhaFromStage", lang, { n: c.stage + 1 })}`)
                    .join(" · ");
                  return (
                    <div key={row.key} className="ms4-amount-row">
                      <div className="ms4-amount-row-name">{row.label}</div>
                      <div className="ms4-amount-row-amount">₹{fmt(row.amount)}</div>
                      <div className="ms4-amount-row-sub">
                        {row.fraction} · {rowPercent(row).toFixed(2)}%
                      </div>
                      {sources ? <div className="ms4-amount-row-sub">{sources}</div> : null}
                    </div>
                  );
                })}
              {result.finalTotals
                .filter((r) => r.key === "__held__")
                .map((row) => (
                  <HeldBox key={row.key} label={row.label} amount={row.amount} lang={lang} />
                ))}
            </div>
            <TotalCheckLine total={estate} lang={lang} ok={result.totalsBalance} />
          </div>
          {showRaddFlag ? (
            <p className="ms4-flag" role="note">
              {ss("raddCorrectionFlag", lang)}
            </p>
          ) : null}
          <ResultNotes notes={result.notes} scholarReasons={result.scholarReasons} lang={lang} />
        </div>
      ) : null}
    </div>
  );
}
