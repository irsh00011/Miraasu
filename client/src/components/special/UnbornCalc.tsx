/**
 * 6. Unborn child (book §4.6, p. 284; cases 267–268).
 * v4 rebuild (redesign spec §7): "Child (unborn)" is a locked pre-added
 * row; the "Add heir" sheet lists "Pregnant wife" first (distinct from a
 * plain wife), then mother, daughter, uncle, others. One line under the
 * title: best not to divide until birth. Result: swipeable "If boy" /
 * "If girl" cards (each with its own one-line total check), then a large
 * "Pay now" card (lesser amount each) and a large "Held until birth" box,
 * with the book-is-silent flags (twins, stillbirth, time limit) under the
 * Held box. Optional after-birth screen: two big buttons, Boy / Girl,
 * showing the final division with the held amount distributed.
 * Calculation unchanged: calculateUnbornChild (existing, tested).
 */
import { useState } from "react";
import { X } from "lucide-react";
import { calculateUnbornChild } from "@/lib/specialMethods";
import type { HeirInput } from "@/lib/inheritance";
import { errEstate, errHeirs, fmt, ss, tx3, type TopicCalcProps } from "./types";
import { hasAnyHeir, preloadHeirs } from "./heirMeta";
import {
  BranchCard,
  CalcButton,
  CalcError,
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
  type SheetExtraOption,
} from "./shared";

const HEIR_KEYS: (keyof HeirInput)[] = [
  "mother", "daughters", "sons", "paternalUncles",
  "father", "paternalGrandfather", "fullBrothers", "fullSisters",
  "maternalBrothers", "maternalSisters",
];

export default function UnbornCalc({ topic, lang }: TopicCalcProps) {
  const [estate, setEstate] = useState(topic.preload.estate);
  const [heirs, setHeirs] = useState<HeirInput>(() => preloadHeirs(topic.preload.heirs));
  const [pregnantWife, setPregnantWife] = useState((topic.preload.heirs.wives ?? 0) > 0);
  const [openStep, setOpenStep] = useState(1);
  const [result, setResult] = useState<ReturnType<typeof calculateUnbornChild> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [afterBirth, setAfterBirth] = useState<"boy" | "girl" | null>(null);

  const clearResult = () => setResult(null);

  const compute = (e: number, h: HeirInput) => {
    if (!(e > 0)) { setResult(null); setError(errEstate(lang)); return; }
    if (!hasAnyHeir(h)) { setResult(null); setError(errHeirs(lang)); return; }
    try {
      setResult(calculateUnbornChild({ estate: e, heirs: h }));
      setError(null);
      setOpenStep(0);
      setAfterBirth(null);
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const load = () => {
    const e = 8000;
    const h = preloadHeirs({ wives: 1, daughters: 1, mother: 1, paternalUncles: 1 });
    setEstate(e);
    setHeirs(h);
    setPregnantWife(true);
    compute(e, h);
  };

  const reset = () => {
    setEstate(topic.preload.estate);
    setHeirs(preloadHeirs(topic.preload.heirs));
    setPregnantWife((topic.preload.heirs.wives ?? 0) > 0);
    setResult(null);
    setError(null);
    setAfterBirth(null);
    setOpenStep(1);
  };

  const heirCount = Object.values(heirs).reduce((s, v) => s + (v ?? 0), 0);

  const pregnantOption: SheetExtraOption = {
    id: "pregnantWife",
    ta: ss("unbornPregnantWife", "ta"),
    en: ss("unbornPregnantWife", "en"),
    ar: ss("unbornPregnantWife", "ar"),
    onPick: () => {
      setHeirs((h) => ({ ...h, wives: 1 }));
      setPregnantWife(true);
      clearResult();
    },
  };

  return (
    <div className="ms-special-calc-body">
      <p className="ms-special-hint">{ss("unbornBestNotDivide", lang)}</p>

      <StepShell
        n={1}
        title={ss("stepEstate", lang)}
        summary={`₹${fmt(estate)}`}
        open={openStep === 1}
        onOpen={() => setOpenStep(1)}
        lang={lang}
      >
        <MoneyField
          id="unborn-estate"
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
        <div className="ms4-locked-row">
          <span>{tx3(lang, "கர்ப்பத்திலுள்ள குழந்தை", "Child (unborn)", "الطفل في الحمل")}</span>
          <span>{tx3(lang, "எப்போதும் சேர்க்கப்படுகிறார்", "Always included", "مضمَّن دائمًا")}</span>
        </div>
        {pregnantWife ? (
          <div className="ms4-chosen-row">
            <span className="ms4-chosen-name">{ss("unbornPregnantWife", lang)}</span>
            <button
              type="button"
              className="ms4-chosen-remove"
              aria-label={`${tx3(lang, "நீக்குக", "Remove", "احذف")} ${ss("unbornPregnantWife", lang)}`}
              onClick={() => {
                setHeirs((h) => ({ ...h, wives: 0 }));
                setPregnantWife(false);
                clearResult();
              }}
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>
        ) : null}
        <HeirPickerSheet
          heirs={heirs}
          onChange={(h) => { setHeirs(h); clearResult(); }}
          keys={HEIR_KEYS}
          lang={lang}
          extraOptions={[pregnantOption]}
        />
      </StepShell>

      <div className="ms-special-actions">
        <LoadExampleButton onLoad={load} lang={lang} />
        <CalcButton onClick={() => compute(estate, heirs)} lang={lang} />
        <ResetButton onReset={reset} lang={lang} />
      </div>
      <CalcError message={error} lang={lang} />

      {result ? (
        <div className="ms-special-results">
          <SwipeCards
            lang={lang}
            cards={[
              {
                title: ss("unbornIfBoy", lang),
                content: (
                  <ResultTable
                    rows={result.asSon.rows}
                    lang={lang}
                    estate={estate}
                    verifyTotal={estate}
                    total={result.asSon.totalDistributed}
                  />
                ),
              },
              {
                title: ss("unbornIfGirl", lang),
                content: (
                  <ResultTable
                    rows={result.asDaughter.rows}
                    lang={lang}
                    estate={estate}
                    verifyTotal={estate}
                    total={result.asDaughter.totalDistributed}
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
          <HeldBox label={ss("unbornHeldUntilBirth", lang)} amount={result.heldAmount} lang={lang} />
          <TotalCheckLine total={estate} lang={lang} />
          <ResultNotes notes={[]} scholarReasons={result.scholarReasons} lang={lang} />

          <div className="ms4-results">
            <h4 className="ms4-results-title">{ss("unbornAfterBirth", lang)}</h4>
            <div className="ms4-branch-cards">
              <BranchCard
                title={tx3(lang, "ஆண்", "Boy", "ذكر")}
                selected={afterBirth === "boy"}
                onSelect={() => setAfterBirth("boy")}
                lang={lang}
              />
              <BranchCard
                title={tx3(lang, "பெண்", "Girl", "أنثى")}
                selected={afterBirth === "girl"}
                onSelect={() => setAfterBirth("girl")}
                lang={lang}
              />
            </div>
            {afterBirth ? (
              <ResultTable
                rows={afterBirth === "boy" ? result.asSon.rows : result.asDaughter.rows}
                lang={lang}
                estate={estate}
                verifyTotal={estate}
                total={estate}
                title={tx3(lang, "இறுதிப் பிரிவு", "Final division", "القسمة النهائية")}
              />
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
