/**
 * 12. The Apostate (book §4.12, p. 330; cases 282–285).
 * v4 rebuild (redesign spec §13): two modes as two big cards
 * (single-select, required): "The deceased left Islam" / "An heir left
 * Islam".
 * - Estate mode, Step 1: TWO money fields — "Earned while Muslim" and
 *   "Earned after leaving" — plus a "Not sure" link on the first
 *   (leaves both fields editable, shows a one-line note). Step 2:
 *   "Add heir" bottom sheet, normal family list.
 * - Heir mode: single estate number input + heirs; Step 3 "Who left
 *   Islam?" single-select from the chosen heirs (required).
 * - Result, estate mode: THREE swipeable cards with page dots, equal
 *   weight, no "recommended" tag — Hanafi, Shafi'i, Abu Yusuf &
 *   Muhammad. Each card: its own table (amounts large) + a SEPARATE
 *   "Bayt al-Mal" row + its own one-line total check. If "Not sure"
 *   was tapped: the Hanafi card shows ONLY the flag ("While-Muslim
 *   value unknown — Hanafi split cannot be calculated") and NO Hanafi
 *   numbers; the other two cards show normally.
 * - Result, heir mode: normal division; the apostate heir in the red
 *   no-share card.
 * Flags: case 282 — the book prints 170,000 for the son's share of
 * 24,000 once, then continues with 17,000; 17,000 is correct. Case
 * 284 — the Radd correction (paternal uncle takes the residue) needs a
 * scholar's confirmation.
 *
 * Calculation unchanged: calculateApostateEstate /
 * calculateApostateHeir (existing, tested). Book case 282, estate mode
 * (₹54,000 = ₹24,000 while Muslim + ₹30,000 after): Hanafi wife
 * ₹3,000, mother ₹4,000, son ₹17,000, Bayt al-Mal ₹30,000; Shafi'i
 * Bayt al-Mal ₹54,000, heirs ₹0; Abu Yusuf & Muhammad wife ₹6,750,
 * mother ₹9,000, son ₹38,250, Bayt al-Mal ₹0.
 */
import { useState } from "react";
import { calculateApostateEstate, calculateApostateHeir, rowPercent, type SpecialRow } from "@/lib/specialMethods";
import type { HeirInput } from "@/lib/inheritance";
import { errEstate, errHeirs, fmt, ss, tx3, type TopicCalcProps } from "./types";
import { enteredHeirKeys, hasAnyHeir, heirCount, heirLabel, preloadHeirs } from "./heirMeta";
import {
  AmountRow,
  CalcButton,
  CalcError,
  ExcludedList,
  FinalAnswer,
  HeirPickerSheet,
  HeldBox,
  LoadExampleButton,
  MoneyField,
  ResetButton,
  ResultNotes,
  ResultTable,
  StepShell,
  SwipeCards,
  TotalCheckLine,
  rowLabel,
} from "./shared";

const HEIR_KEYS: (keyof HeirInput)[] = [
  "husband", "wives", "father", "mother", "paternalGrandfather",
  "sons", "daughters", "fullBrothers", "fullSisters",
  "maternalBrothers", "maternalSisters", "paternalBrothers",
  "paternalSisters", "paternalUncles",
];

/** One opinion card's content: heir rows + separate Bayt al-Mal row + total check. */
function OpinionContent({
  rows,
  baytAlMal,
  total,
  lang,
  heirsZero = false,
}: {
  rows: SpecialRow[];
  baytAlMal: number;
  total: number;
  lang: "ta" | "en" | "ar";
  heirsZero?: boolean;
}) {
  const heirRows = rows.filter((r) => r.key !== "bayt-al-mal" && r.key !== "__held__");
  const heldRows = rows.filter((r) => r.key === "__held__");
  return (
    <div>
      {heirRows.length === 0 && !heirsZero ? null : heirRows.map((row) => (
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
      {heirsZero ? (
        <p className="ms4-muted">
          {tx3(lang, "வாரிசுகள்: ₹0.00", "Heirs: ₹0.00", "الورثة: ₹0.00")}
        </p>
      ) : null}
      {heldRows.map((row) => (
        <HeldBox key={row.key} label={rowLabel(row, lang)} amount={row.amount} lang={lang} />
      ))}
      <div className="ms4-bayt-row">
        <span className="ms4-bayt-row-name">{ss("apostateBaytAlMal", lang)}</span>
        <span className="ms4-bayt-row-amount">₹{fmt(baytAlMal)}</span>
      </div>
      <TotalCheckLine total={total} lang={lang} />
    </div>
  );
}

export default function ApostateCalc({ topic, lang }: TopicCalcProps) {
  const [mode, setMode] = useState<"estate" | "heir" | null>(null);
  const [whileMuslim, setWhileMuslim] = useState(24000);
  const [afterLeaving, setAfterLeaving] = useState(30000);
  const [notSure, setNotSure] = useState(false);
  const [estate, setEstate] = useState(400000);
  const [heirs, setHeirs] = useState<HeirInput>(() => preloadHeirs(topic.preload.heirs));
  const [apostateKey, setApostateKey] = useState<keyof HeirInput | null>(null);
  const [openStep, setOpenStep] = useState(1);
  const [estateResult, setEstateResult] = useState<ReturnType<typeof calculateApostateEstate> | null>(null);
  const [heirResult, setHeirResult] = useState<ReturnType<typeof calculateApostateHeir> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const clearResults = () => {
    setEstateResult(null);
    setHeirResult(null);
  };

  const pickMode = (m: "estate" | "heir") => {
    setMode(m);
    clearResults();
    setError(null);
    setOpenStep(2);
  };

  const computeEstate = (w: number, a: number, h: HeirInput) => {
    if (!(w + a > 0)) { setEstateResult(null); setError(errEstate(lang)); return; }
    if (!hasAnyHeir(h)) { setEstateResult(null); setError(errHeirs(lang)); return; }
    try {
      setEstateResult(calculateApostateEstate({ whileMuslim: w, afterLeaving: a, heirs: h }));
      setHeirResult(null);
      setError(null);
      setOpenStep(0);
    } catch (err) {
      setEstateResult(null);
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const computeHeir = (e: number, h: HeirInput, k: keyof HeirInput | null) => {
    if (!(e > 0)) { setHeirResult(null); setError(errEstate(lang)); return; }
    if (!hasAnyHeir(h)) { setHeirResult(null); setError(errHeirs(lang)); return; }
    if (!k || heirCount(h, k) === 0) {
      setHeirResult(null);
      setError(tx3(lang, "மதம் மாறியவர் யார் என்பதைத் தேர்ந்தெடுக்கவும்.", "Choose who left Islam.", "اختر من ارتد."));
      return;
    }
    try {
      setHeirResult(calculateApostateHeir({ estate: e, heirs: h, apostateKeys: [k] }));
      setEstateResult(null);
      setError(null);
      setOpenStep(0);
    } catch (err) {
      setHeirResult(null);
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const load = () => {
    if (mode === "heir") {
      const h = preloadHeirs({ wives: 1, fullSisters: 1, paternalSisters: 1, paternalUncles: 1 });
      setEstate(400000);
      setHeirs(h);
      setApostateKey("wives");
      computeHeir(400000, h, "wives");
    } else {
      setMode("estate");
      const h = preloadHeirs({ wives: 1, mother: 1, sons: 1 });
      setWhileMuslim(24000);
      setAfterLeaving(30000);
      setNotSure(false);
      setHeirs(h);
      computeEstate(24000, 30000, h);
    }
  };

  const reset = () => {
    setWhileMuslim(24000);
    setAfterLeaving(30000);
    setNotSure(false);
    setEstate(400000);
    setHeirs(preloadHeirs(topic.preload.heirs));
    setApostateKey(null);
    setEstateResult(null);
    setHeirResult(null);
    setError(null);
    setOpenStep(1);
  };

  const entered = enteredHeirKeys(heirs);
  const heirCountTotal = Object.values(heirs).reduce((s, v) => s + (v ?? 0), 0);
  const apostateSelected = apostateKey !== null && heirCount(heirs, apostateKey) > 0;
  const showCase282Flag =
    !!estateResult && whileMuslim === 24000 && afterLeaving === 30000;
  const showRaddFlag =
    !!heirResult &&
    heirResult.notes.some((n) => n.includes("284") || n.includes("269/284"));

  return (
    <div className="ms-special-calc-body">
      <StepShell
        n={1}
        title={tx3(lang, "நிலை எது?", "Which situation?", "أي حالة؟")}
        summary={
          mode === "estate"
            ? ss("apostateDeceasedLeft", lang)
            : mode === "heir"
              ? ss("apostateHeirLeft", lang)
              : null
        }
        open={mode === null}
        onOpen={() => setMode(null)}
        lang={lang}
      >
        <div className="ms4-branch-cards">
          <button
            type="button"
            className={`ms4-branch-card ${mode === "estate" ? "is-selected" : ""}`}
            aria-pressed={mode === "estate"}
            onClick={() => pickMode("estate")}
          >
            <span className="ms4-branch-card-title">{ss("apostateDeceasedLeft", lang)}</span>
          </button>
          <button
            type="button"
            className={`ms4-branch-card ${mode === "heir" ? "is-selected" : ""}`}
            aria-pressed={mode === "heir"}
            onClick={() => pickMode("heir")}
          >
            <span className="ms4-branch-card-title">{ss("apostateHeirLeft", lang)}</span>
          </button>
        </div>
      </StepShell>

      {mode === "estate" ? (
        <>
          <StepShell
            n={2}
            title={tx3(lang, "சொத்து எப்போது சம்பாதிக்கப்பட்டது?", "When was the property earned?", "متى كُسب المال؟")}
            summary={`₹${fmt(whileMuslim + afterLeaving)}`}
            open={openStep === 2}
            onOpen={() => setOpenStep(2)}
            lang={lang}
          >
            <MoneyField
              id="apos-while"
              label={ss("apostateEarnedWhileMuslim", lang)}
              value={whileMuslim}
              onChange={(v) => { setWhileMuslim(v); clearResults(); }}
            />
            <button
              type="button"
              className="ms4-load-link"
              aria-pressed={notSure}
              onClick={() => { setNotSure((s) => !s); clearResults(); }}
            >
              {ss("apostateNotSure", lang)}
              {notSure ? " ✓" : ""}
            </button>
            {notSure ? (
              <p className="ms4-muted">
                {tx3(
                  lang,
                  "முஸ்லிமாக இருந்தபோது சம்பாதித்த தொகை தெரியவில்லை — ஹனஃபி பிரிவு கணக்கிடப்படாது; மற்ற இரு கருத்துகளும் காட்டப்படும்.",
                  "While-Muslim value unknown — the Hanafi split is not calculated; the other two opinions still show.",
                  "قيمة ما كُسب وهو مسلم غير معروفة — لن تُحسب قسمة الحنفية؛ ويظهر الرأيان الآخران.",
                )}
              </p>
            ) : null}
            <MoneyField
              id="apos-after"
              label={ss("apostateEarnedAfter", lang)}
              value={afterLeaving}
              onChange={(v) => { setAfterLeaving(v); clearResults(); }}
            />
          </StepShell>

          <StepShell
            n={3}
            title={ss("stepHeirs", lang)}
            summary={heirCountTotal > 0 ? tx3(lang, `${heirCountTotal} வாரிசு(கள்)`, `${heirCountTotal} heir(s)`, `${heirCountTotal} من الورثة`) : null}
            open={openStep === 3}
            onOpen={() => setOpenStep(3)}
            lang={lang}
          >
            <HeirPickerSheet
              heirs={heirs}
              onChange={(h) => { setHeirs(h); clearResults(); }}
              keys={HEIR_KEYS}
              lang={lang}
            />
          </StepShell>

          <div className="ms-special-actions">
            <LoadExampleButton onLoad={load} lang={lang} />
            <CalcButton onClick={() => computeEstate(whileMuslim, afterLeaving, heirs)} lang={lang} />
            <ResetButton onReset={reset} lang={lang} />
          </div>
        </>
      ) : null}

      {mode === "heir" ? (
        <>
          <StepShell
            n={2}
            title={ss("stepEstate", lang)}
            summary={`₹${fmt(estate)}`}
            open={openStep === 2}
            onOpen={() => setOpenStep(2)}
            lang={lang}
          >
            <MoneyField
              id="apos-estate"
              label={ss("stepEstate", lang)}
              value={estate}
              onChange={(v) => { setEstate(v); clearResults(); }}
            />
          </StepShell>

          <StepShell
            n={3}
            title={ss("stepHeirs", lang)}
            summary={heirCountTotal > 0 ? tx3(lang, `${heirCountTotal} வாரிசு(கள்)`, `${heirCountTotal} heir(s)`, `${heirCountTotal} من الورثة`) : null}
            open={openStep === 3}
            onOpen={() => setOpenStep(3)}
            lang={lang}
          >
            <HeirPickerSheet
              heirs={heirs}
              onChange={(h) => { setHeirs(h); clearResults(); }}
              keys={HEIR_KEYS}
              lang={lang}
            />
          </StepShell>

          <StepShell
            n={4}
            title={ss("apostateWhoLeft", lang)}
            summary={apostateSelected && apostateKey ? heirLabel(apostateKey, lang) : null}
            open={openStep === 4}
            onOpen={() => setOpenStep(4)}
            lang={lang}
          >
            {entered.length === 0 ? (
              <p className="ms4-muted">
                {tx3(lang, "முதலில் வாரிசுகளைச் சேர்க்கவும்.", "Add heirs first.", "أضف الورثة أولًا.")}
              </p>
            ) : (
              <div className="ms4-branch-cards">
                {entered.map((m) => {
                  const selected = apostateKey === m.key;
                  const count = heirCount(heirs, m.key);
                  return (
                    <button
                      key={m.key}
                      type="button"
                      className={`ms4-branch-card ${selected ? "is-selected" : ""}`}
                      aria-pressed={selected}
                      onClick={() => { setApostateKey(m.key); clearResults(); }}
                    >
                      <span className="ms4-branch-card-title">
                        {tx3(lang, m.ta, m.en, m.ar)}
                        {count > 1 ? ` × ${count}` : ""}
                      </span>
                      {selected ? (
                        <span className="ms4-pill">{tx3(lang, "மதம் மாறினார்", "Left Islam", "ارتد")}</span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            )}
          </StepShell>

          <div className="ms-special-actions">
            <LoadExampleButton onLoad={load} lang={lang} />
            <CalcButton onClick={() => computeHeir(estate, heirs, apostateKey)} lang={lang} />
            <ResetButton onReset={reset} lang={lang} />
          </div>
        </>
      ) : null}

      {mode === null ? (
        <div className="ms-special-actions">
          <LoadExampleButton onLoad={load} lang={lang} />
          <ResetButton onReset={reset} lang={lang} />
        </div>
      ) : null}

      <CalcError message={error} lang={lang} />

      {estateResult ? (
        <div className="ms-special-results">
          <FinalAnswer lang={lang}>{estateResult.summary}</FinalAnswer>
          <p className="ms4-muted">
            {tx3(lang, "மொத்தச் சொத்து: ", "Total estate: ", "مجموع التركة: ")}₹{fmt(estateResult.total)}
          </p>
          <SwipeCards
            lang={lang}
            cards={[
              {
                title: tx3(lang, "ஹனஃபி", "Hanafi", "الحنفي"),
                content: notSure ? (
                  <p className="ms4-flag" role="note">
                    {ss("apostateHanafiCannotCalc", lang)}
                  </p>
                ) : (
                  <OpinionContent
                    rows={estateResult.abuHanifa.rows}
                    baytAlMal={estateResult.abuHanifa.baytAlMal}
                    total={estateResult.total}
                    lang={lang}
                  />
                ),
              },
              {
                title: tx3(lang, "ஷாஃபிஈ", "Shafi'i", "الشافعي"),
                content: (
                  <OpinionContent
                    rows={estateResult.shafii.rows}
                    baytAlMal={estateResult.shafii.baytAlMal}
                    total={estateResult.total}
                    lang={lang}
                    heirsZero
                  />
                ),
              },
              {
                title: tx3(lang, "அபூ யூசுஃப், முஹம்மது", "Abu Yusuf & Muhammad", "أبو يوسف ومحمد"),
                content: (
                  <OpinionContent
                    rows={estateResult.abuYusufMuhammad.rows}
                    baytAlMal={estateResult.abuYusufMuhammad.baytAlMal}
                    total={estateResult.total}
                    lang={lang}
                  />
                ),
              },
            ]}
          />
          {showCase282Flag ? (
            <p className="ms4-flag" role="note">
              {ss("apostateCase282Flag", lang)}
            </p>
          ) : null}
          <ResultNotes notes={estateResult.notes} scholarReasons={estateResult.scholarReasons} lang={lang} />
        </div>
      ) : null}

      {heirResult ? (
        <div className="ms-special-results">
          <FinalAnswer lang={lang}>{heirResult.summary}</FinalAnswer>
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
          {showRaddFlag ? (
            <p className="ms4-flag" role="note">
              {ss("raddCorrectionFlag", lang)}
            </p>
          ) : null}
          <ResultNotes notes={heirResult.notes} scholarReasons={heirResult.scholarReasons} lang={lang} />
        </div>
      ) : null}
    </div>
  );
}
