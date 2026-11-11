/**
 * 10. Simultaneous death (book §4.10, p. 318; cases 278–279).
 * v4 rebuild (redesign spec §11): the gate comes FIRST — two big
 * buttons, "Is the order of death known?" Known / Unknown (required,
 * single-select).
 * - Known → runs the Munasakha flow (Topic 9): "Who died first?" →
 *   stages one at a time, collapsed to summary lines; final amounts per
 *   living heir tagged by stage.
 * - Unknown → "Add a deceased" (name text + estate number per
 *   deceased); one card per deceased, each with its own "Add heir"
 *   bottom sheet (grandmothers ARE offered — case 278 needs one; the
 *   v2 F1 fix, not regressed). One line under the title: "No one
 *   inherits from the others." One result card per estate + a combined
 *   card per person.
 * Case 278 flag: the book prints the grandmother as 375 AND the
 * paternal uncle as 1,125; the rule gives 500 and 1,000 — the
 * calculator follows the rule and flags BOTH misprints, never the
 * printed numbers as results.
 *
 * Calculation unchanged: calculateSimultaneousDeath (existing, tested).
 */
import { useRef, useState } from "react";
import { calculateSimultaneousDeath, rowPercent, type SimultaneousDeathResult } from "@/lib/specialMethods";
import type { HeirInput } from "@/lib/inheritance";
import { errEstate, errHeirs, fmt, ss, tx3, type TopicCalcProps } from "./types";
import { blankHeirs, hasAnyHeir, preloadHeirs } from "./heirMeta";
import {
  AddButton,
  CalcButton,
  CalcError,
  cleanNames,
  FinalAnswer,
  HeirPickerSheet,
  LoadExampleButton,
  MoneyField,
  ResetButton,
  ResultNotes,
  ResultTable,
  StepShell,
  Timeline,
  TotalCheckLine,
  type DeathForm,
  type NamesMap,
} from "./shared";
import {
  STAGE_HEIR_KEYS,
  StageEditor,
  personRows,
  stageContributions,
  stageSummaryLine,
  type StageForm,
} from "./MunasakhaCalc";

const HEIR_KEYS = STAGE_HEIR_KEYS;

export default function SimultaneousCalc({ topic, lang }: TopicCalcProps) {
  const [gate, setGate] = useState<"known" | "unknown" | null>(null);

  // Known-order state: the Munasakha stage flow (estate = first death's).
  const [estate, setEstate] = useState(24000);
  const [stages, setStages] = useState<StageForm[]>(() => [
    {
      deceasedName: "Nasar",
      heirs: preloadHeirs({ wives: 1, daughters: 1, paternalUncles: 1 }),
      names: { wives: ["Fathima"], daughters: ["Salma"], paternalUncles: ["Umar"] },
      done: false,
    },
  ]);
  const [openStage, setOpenStage] = useState<number | null>(0);
  const [addingDeath, setAddingDeath] = useState(false);

  // Unknown-order state: one card per deceased.
  const [deaths, setDeaths] = useState<DeathForm[]>(() => [
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
  ]);

  const [result, setResult] = useState<SimultaneousDeathResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const clearResult = () => setResult(null);

  // --- known-order (Munasakha) helpers, mirroring MunasakhaCalc ---
  const updateStage = (i: number, next: StageForm) => {
    setStages((ds) =>
      ds.map((s, j) => (j === i ? { ...next, done: false } : j > i ? { ...s, done: false } : s)),
    );
    setResult(null);
    setError(null);
  };

  const computeKnownStage = (i: number) => {
    const st = stages[i];
    if (!(estate > 0)) { setResult(null); setError(errEstate(lang)); return; }
    if (!st.deceasedName.trim()) {
      setResult(null);
      setError(tx3(lang, "இறந்தவர் பெயரை உள்ளிடவும்.", "Enter who died.", "أدخل اسم المتوفى."));
      return;
    }
    if (!hasAnyHeir(st.heirs)) { setResult(null); setError(errHeirs(lang)); return; }
    try {
      const res = calculateSimultaneousDeath({
        orderKnown: true,
        deaths: stages.slice(0, i + 1).map((s, j) => ({
          deceasedName: s.deceasedName || tx3(lang, "இறந்தவர்", "Deceased", "المتوفى"),
          estate: j === 0 ? estate : 0,
          heirs: s.heirs,
          names: cleanNames(s.names, s.heirs, lang),
        })),
      });
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

  const loadKnown = () => {
    const d1: StageForm = {
      deceasedName: "Nasar",
      heirs: preloadHeirs({ wives: 1, daughters: 1, paternalUncles: 1 }),
      names: { wives: ["Fathima"], daughters: ["Salma"], paternalUncles: ["Umar"] },
      done: true,
    };
    const d2: StageForm = {
      deceasedName: "Fathima",
      heirs: preloadHeirs({ daughters: 1, maternalGrandmothers: 1, paternalUncles: 1 }),
      names: { daughters: ["Salma"], maternalGrandmothers: ["Amina"], paternalUncles: ["Ali"] },
      done: true,
      estateAmount: 3000,
      estateFromStage: 1,
    };
    setEstate(24000);
    setStages([d1, d2]);
    setOpenStage(null);
    setAddingDeath(false);
    try {
      setResult(
        calculateSimultaneousDeath({
          orderKnown: true,
          deaths: [
            { deceasedName: "Nasar", estate: 24000, heirs: d1.heirs, names: d1.names },
            { deceasedName: "Fathima", estate: 0, heirs: d2.heirs, names: d2.names },
          ],
        }),
      );
      setError(null);
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const resetKnown = () => {
    setEstate(24000);
    setStages([
      {
        deceasedName: "Nasar",
        heirs: preloadHeirs({ wives: 1, daughters: 1, paternalUncles: 1 }),
        names: { wives: ["Fathima"], daughters: ["Salma"], paternalUncles: ["Umar"] },
        done: false,
      },
    ]);
    setOpenStage(0);
    setAddingDeath(false);
    setResult(null);
    setError(null);
  };

  // --- unknown-order helpers ---
  const updateDeath = (i: number, next: DeathForm) => {
    setDeaths((ds) => ds.map((d, j) => (j === i ? next : d)));
    setResult(null);
    setError(null);
  };

  const computeUnknown = () => {
    if (deaths.length === 0) {
      setResult(null);
      setError(tx3(lang, "குறைந்தது ஒரு இறந்தவரையாவது சேர்க்கவும்.", "Add at least one deceased.", "أضف متوفًى واحدًا على الأقل."));
      return;
    }
    for (const d of deaths) {
      if (!(d.estate > 0)) { setResult(null); setError(errEstate(lang)); return; }
      if (!hasAnyHeir(d.heirs)) { setResult(null); setError(errHeirs(lang)); return; }
    }
    try {
      setResult(
        calculateSimultaneousDeath({
          orderKnown: false,
          deaths: deaths.map((d) => ({
            deceasedName: d.deceasedName || tx3(lang, "இறந்தவர்", "Deceased", "المتوفى"),
            estate: d.estate,
            heirs: d.heirs,
            names: cleanNames(d.names, d.heirs, lang),
          })),
        }),
      );
      setError(null);
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const loadUnknown = () => {
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
    setDeaths(ds);
    try {
      setResult(
        calculateSimultaneousDeath({
          orderKnown: false,
          deaths: ds.map((d) => ({ deceasedName: d.deceasedName, estate: d.estate, heirs: d.heirs, names: d.names })),
        }),
      );
      setError(null);
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const resetUnknown = () => {
    setDeaths([
      {
        deceasedName: "Hasan",
        estate: 16000,
        heirs: preloadHeirs({ wives: 1, daughters: 1, paternalUnclesSons: 1 }),
        names: { wives: ["Munira"], daughters: ["Hameeda"], paternalUnclesSons: ["Hameed"] },
      },
    ]);
    setResult(null);
    setError(null);
  };

  const load = () => {
    if (gate === "known") loadKnown();
    else if (gate === "unknown") loadUnknown();
    else {
      setResult(null);
      setError(tx3(lang, "முதலில் மரண வரிசை தெரியுமா என்பதைத் தேர்ந்தெடுக்கவும்.", "First choose whether the order of death is known.", "اختر أولًا ما إذا كان ترتيب الوفاة معروفًا."));
    }
  };

  const reset = () => {
    if (gate === "known") resetKnown();
    else resetUnknown();
    setError(null);
  };

  const pickGate = (g: "known" | "unknown") => {
    setGate(g);
    setResult(null);
    setError(null);
  };

  // Known-order derived values.
  const munasakha = result?.munasakha ?? null;
  const deceasedNames = new Set(stages.map((s) => s.deceasedName));
  const livingHeirs: { name: string; amount: number }[] = munasakha
    ? munasakha.finalTotals
        .filter((r) => r.key !== "__held__" && !deceasedNames.has(r.label))
        .map((r) => ({ name: r.label, amount: r.amount }))
    : [];
  const contributions = munasakha ? stageContributions(munasakha, stages) : null;
  const estateLineFor = (i: number): string | null => {
    if (i === 0) return null;
    const stage = stages[i];
    if (stage.estateAmount === undefined) return null;
    const from = stage.estateFromStage ?? 1;
    return `${ss("munasakhaEstateOfDeath", lang)}: ₹${fmt(stage.estateAmount)} (${stage.deceasedName} — ${ss("munasakhaFromStage", lang, { n: from })})`;
  };
  const laterDeceasedFor = (i: number): Set<string> =>
    new Set(stages.slice(i + 1).map((s) => s.deceasedName));
  // Case 278 flag: the known-order book example (Nasar ₹24,000, then
  // Fathima ₹3,000) — the book prints Amina 375 AND Ali 1,125.
  const showCase278Flag =
    gate === "known" &&
    !!munasakha &&
    estate === 24000 &&
    munasakha.deaths.length >= 2 &&
    Math.abs(munasakha.deaths[1].estate - 3000) < 0.01;

  // Unknown-order combined breakdown: person → [{ estate name, amount }].
  const combinedBreakdown = (): Map<string, { from: string; amount: number }[]> => {
    const out = new Map<string, { from: string; amount: number }[]>();
    if (!result?.divisions) return out;
    result.divisions.forEach((div, di) => {
      const names = deaths[di]?.names ?? {};
      for (const row of div.rows) {
        if (row.key === "__held__") continue;
        const persons = names[row.key] ?? [row.label];
        const per = row.amount / Math.max(1, row.count);
        for (const name of persons) {
          const list = out.get(name) ?? [];
          list.push({ from: div.deceasedName, amount: per });
          out.set(name, list);
        }
      }
    });
    return out;
  };

  return (
    <div className="ms-special-calc-body">
      <StepShell
        n={1}
        title={ss("simulOrderKnown", lang)}
        summary={
          gate === "known"
            ? tx3(lang, "தெரியும்", "Known", "معروف")
            : gate === "unknown"
              ? tx3(lang, "தெரியாது", "Unknown", "غير معروف")
              : null
        }
        open={gate === null}
        onOpen={() => setGate(null)}
        lang={lang}
      >
        <div className="ms4-branch-cards">
          <button
            type="button"
            className={`ms4-branch-card ${gate === "known" ? "is-selected" : ""}`}
            aria-pressed={gate === "known"}
            onClick={() => pickGate("known")}
          >
            <span className="ms4-branch-card-title">{tx3(lang, "தெரியும்", "Known", "معروف")}</span>
          </button>
          <button
            type="button"
            className={`ms4-branch-card ${gate === "unknown" ? "is-selected" : ""}`}
            aria-pressed={gate === "unknown"}
            onClick={() => pickGate("unknown")}
          >
            <span className="ms4-branch-card-title">{tx3(lang, "தெரியாது", "Unknown", "غير معروف")}</span>
          </button>
        </div>
      </StepShell>

      {gate === "known" ? (
        <>
          <StepShell
            n={2}
            title={ss("stepEstate", lang)}
            summary={`₹${fmt(estate)}`}
            open={openStage === -1}
            onOpen={() => setOpenStage(-1)}
            lang={lang}
          >
            <MoneyField
              id="simul-estate"
              label={tx3(lang, "முதலில் இறந்தவரின் சொத்து", "Estate of the first deceased", "تركة أول المتوفين")}
              value={estate}
              onChange={(v) => { setEstate(v); clearResult(); }}
            />
          </StepShell>

          {stages.map((stage, i) => {
            const outcome = munasakha?.deaths[i];
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
                n={i + 3}
                title={i === 0 ? tx3(lang, "முதலில் இறந்தவர் யார்?", "Who died first?", "من مات أولًا؟") : title}
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
                  onCalculateStage={() => computeKnownStage(i)}
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

          {munasakha && stages[stages.length - 1].done && stages.length < 3 && !addingDeath ? (
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
                        const contrib = (munasakha ? stageContributions(munasakha, stages) : new Map()).get(h.name) ?? [];
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
        </>
      ) : null}

      {gate === "unknown" ? (
        <>
          <p className="ms4-muted">{ss("simulNoOneInherits", lang)}</p>
          {deaths.map((d, i) => (
            <DeceasedCard
              key={i}
              death={d}
              index={i}
              lang={lang}
              canRemove={deaths.length > 1}
              onChange={(next) => updateDeath(i, next)}
              onRemove={() => {
                setDeaths((ds) => ds.filter((_, j) => j !== i));
                setResult(null);
              }}
            />
          ))}
          <AddButton
            onClick={() =>
              setDeaths((ds) => [
                ...ds,
                { deceasedName: "", estate: 0, heirs: blankHeirs(), names: {} },
              ])
            }
            disabled={deaths.length >= 3}
          >
            {ss("simulAddDeceased", lang)}
          </AddButton>
          <div className="ms-special-actions">
            <LoadExampleButton onLoad={load} lang={lang} />
            <CalcButton onClick={computeUnknown} lang={lang} />
            <ResetButton onReset={reset} lang={lang} />
          </div>
        </>
      ) : null}

      {gate === "known" ? (
        <div className="ms-special-actions">
          <LoadExampleButton onLoad={load} lang={lang} />
          <ResetButton onReset={reset} lang={lang} />
        </div>
      ) : null}

      <CalcError message={error} lang={lang} />

      {gate === "known" && munasakha ? (
        <div className="ms-special-results">
          <FinalAnswer lang={lang}>{result!.summary}</FinalAnswer>
          <Timeline
            items={munasakha.deaths.map((d, i) => ({
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
              {munasakha.finalTotals
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
            </div>
            <TotalCheckLine total={estate} lang={lang} ok={munasakha.totalsBalance} />
          </div>
          {showCase278Flag ? (
            <p className="ms4-flag" role="note">
              {ss("simulCase278Flag", lang)}
            </p>
          ) : null}
          <ResultNotes notes={result!.notes} scholarReasons={result!.scholarReasons} lang={lang} />
        </div>
      ) : null}

      {gate === "unknown" && result?.divisions ? (
        <div className="ms-special-results">
          <FinalAnswer lang={lang}>{result.summary}</FinalAnswer>
          {result.divisions.map((d, i) => (
            <ResultTable
              key={i}
              rows={personRows(d.rows, deaths[i]?.names ?? {})}
              lang={lang}
              estate={d.estate}
              verifyTotal={d.estate}
              title={`${d.deceasedName} · ${tx3(lang, "சொத்து", "Estate", "التركة")} ₹${fmt(d.estate)}`}
              showDetails={false}
            />
          ))}
          {result.combinedTotals ? (
            <div className="ms4-results">
              <h4 className="ms4-results-title">{ss("simulCombinedTotal", lang)}</h4>
              <div className="ms4-result-list">
                {result.combinedTotals
                  .filter((r) => r.key !== "__held__")
                  .map((row) => {
                    const parts = (combinedBreakdown().get(row.label) ?? [])
                      .map((p) => `${p.from} ₹${fmt(p.amount)}`)
                      .join(" + ");
                    return (
                      <div key={row.key} className="ms4-amount-row">
                        <div className="ms4-amount-row-name">{row.label}</div>
                        <div className="ms4-amount-row-amount">₹{fmt(row.amount)}</div>
                        <div className="ms4-amount-row-sub">
                          {row.fraction} · {rowPercent(row).toFixed(2)}%
                        </div>
                        {parts ? <div className="ms4-amount-row-sub">{parts}</div> : null}
                      </div>
                    );
                  })}
              </div>
              <TotalCheckLine total={result.estate} lang={lang} />
            </div>
          ) : null}
          <ResultNotes notes={result.notes} scholarReasons={result.scholarReasons} lang={lang} />
        </div>
      ) : null}
    </div>
  );
}

/**
 * One deceased card (unknown order): name text + estate number + its
 * own "Add heir" bottom sheet (grandmothers included in the list).
 */
function DeceasedCard({
  death,
  index,
  lang,
  canRemove,
  onChange,
  onRemove,
}: {
  death: DeathForm;
  index: number;
  lang: "ta" | "en" | "ar";
  canRemove: boolean;
  onChange: (next: DeathForm) => void;
  onRemove: () => void;
}) {
  // Same back-to-back onChange/onNamesChange merge as StageEditor.
  const latestRef = useRef(death);
  latestRef.current = death;
  const update = (next: DeathForm) => {
    latestRef.current = next;
    onChange(next);
  };
  return (
    <section className="ms4-step is-open" aria-label={`${tx3(lang, "இறந்தவர்", "Deceased", "المتوفى")} ${index + 1}`}>
      <div className="ms4-step-head">
        <span className="ms4-step-num" aria-hidden="true">{index + 1}</span>
        <h3 className="ms4-step-title">
          {death.deceasedName || tx3(lang, "இறந்தவர்", "Deceased", "المتوفى")}
        </h3>
        {canRemove ? (
          <button
            type="button"
            className="ms4-step-edit"
            onClick={onRemove}
            aria-label={tx3(lang, "இந்த இறந்தவரை நீக்குக", "Remove this deceased", "احذف هذا المتوفى")}
          >
            {tx3(lang, "நீக்குக", "Remove", "احذف")}
          </button>
        ) : null}
      </div>
      <div className="ms4-step-body">
        <label className="ms-special-field">
          <span className="ms-special-field-label">{tx3(lang, "இறந்தவர் பெயர்", "Name of the deceased", "اسم المتوفى")}</span>
          <input
            type="text"
            value={death.deceasedName}
            onChange={(e) => update({ ...latestRef.current, deceasedName: e.target.value })}
            className="ms-special-input"
            placeholder={tx3(lang, "எ.கா. ஹஸன்", "e.g. Hasan", "مثال: حسن")}
          />
        </label>
        <MoneyField
          id={`simul-estate-${index}`}
          label={tx3(lang, "இந்தச் சொத்து", "This estate", "هذه التركة")}
          value={death.estate}
          onChange={(v) => update({ ...latestRef.current, estate: v })}
        />
        <HeirPickerSheet
          heirs={death.heirs}
          onChange={(h) => update({ ...latestRef.current, heirs: h, names: cleanNames(latestRef.current.names, h, lang) })}
          keys={HEIR_KEYS}
          lang={lang}
          names={death.names}
          onNamesChange={(n: NamesMap) => update({ ...latestRef.current, names: n })}
        />
      </div>
    </section>
  );
}
