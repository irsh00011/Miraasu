/**
 * 8. Khuntha — intersex heir (book §4.8, p. 323; cases 280–281).
 * v4 rebuild (redesign spec §9): the "Add heir" sheet lists "Khuntha
 * child" first (distinct), then son, daughter, mother, husband, others.
 * Step 3 is a gate — two big buttons, "Can we wait for puberty?" Yes /
 * No (required). Yes → ONE screen: "Book says wait" + one line, NO
 * numbers, with the flag that the book does not say which traits decide
 * predominance. No → three opinion cards (swipeable on phone with page
 * dots, side by side on desktop), equal weight, no "recommended" tag:
 * Shafi'i (each heir gets the lesser, difference held), Abu Hanifa
 * (khuntha gets the lesser, nothing held), Prevailing view (larger share
 * reserved for the khuntha). Each card: its own table (amounts large),
 * its own Held box, its own one-line total check. NO averaging anywhere.
 *
 * Display note on the prevailing view: the engine's prevailing.rows carry
 * the khuntha's LARGER amount as a row and report heldAmount 0 (the
 * larger is "reserved", not paid). The spec (§9 D) and the coordinator's
 * verification show it as the Held box instead — the khuntha's larger
 * amount (case 280: 1,200; case 281: 4,500) is the held/reserved share,
 * the other heirs are paid the lesser. Same amounts, only the placement
 * differs; the engine is untouched. The held figure is rule-derived from
 * the book's stated view, not tabulated in the book.
 * Calculation unchanged: calculateKhuntha (existing, tested).
 */
import { useState } from "react";
import { X } from "lucide-react";
import { calculateKhuntha, type KhunthaRole, type SpecialRow } from "@/lib/specialMethods";
import type { HeirInput } from "@/lib/inheritance";
import { errEstate, errHeirs, fmt, ss, tx3, type TopicCalcProps } from "./types";
import { hasAnyHeir, preloadHeirs } from "./heirMeta";
import {
  BranchCard,
  CalcButton,
  CalcError,
  FlagLine,
  HeirPickerSheet,
  LoadExampleButton,
  MoneyField,
  ResetButton,
  ResultNotes,
  ResultTable,
  StepShell,
  SwipeCards,
  type SheetExtraOption,
} from "./shared";

const HEIR_KEYS: (keyof HeirInput)[] = [
  "sons", "daughters", "mother", "husband", "father",
  "fullBrothers", "fullSisters", "paternalBrothers", "paternalSisters",
  "maternalBrothers", "maternalSisters",
];

const WAIT_TRAITS_FLAG =
  "Wait until puberty if division can wait: if male traits predominate decide male; if female traits predominate, decide female. The book does not specify which traits/signs count.";

const fracStr = (f: { n: number; d: number }) => (f.d === 1 ? `${f.n}` : `${f.n}/${f.d}`);

const heldRow = (share: { n: number; d: number }, amount: number): SpecialRow => ({
  key: "__held__",
  label: "Held until the sex is known",
  count: 1,
  fraction: fracStr(share),
  share,
  amount,
});

const khunthaSiblingLabel = (lang: "ta" | "en" | "ar") =>
  tx3(lang, "குஃன்ஃதா (தந்தை வழிச் சகோதரர்/சகோதரி)", "Khuntha (paternal half-sibling)", "الخنثى (أخ / أخت لأب)");

export default function KhunthaCalc({ topic, lang }: TopicCalcProps) {
  const [estate, setEstate] = useState(topic.preload.estate);
  const [heirs, setHeirs] = useState<HeirInput>(() => preloadHeirs(topic.preload.heirs));
  const [khuntha, setKhuntha] = useState(true);
  const [role, setRole] = useState<KhunthaRole>("child");
  const [waitChoice, setWaitChoice] = useState<"yes" | "no" | null>(null);
  const [waitShown, setWaitShown] = useState(false);
  const [openStep, setOpenStep] = useState(1);
  const [result, setResult] = useState<ReturnType<typeof calculateKhuntha> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const clearResult = () => {
    setResult(null);
    setWaitShown(false);
  };

  const compute = (e: number, h: HeirInput, r: KhunthaRole, choice: "yes" | "no" | null, hasKhuntha: boolean) => {
    if (!(e > 0)) { setResult(null); setWaitShown(false); setError(errEstate(lang)); return; }
    if (!hasAnyHeir(h)) { setResult(null); setWaitShown(false); setError(errHeirs(lang)); return; }
    if (!hasKhuntha) {
      setResult(null);
      setWaitShown(false);
      setError(tx3(lang, "குஃன்ஃதா வாரிசைச் சேர்க்கவும்.", "Add the khuntha heir.", "أضف الوارث الخنثى."));
      return;
    }
    if (!choice) {
      setResult(null);
      setWaitShown(false);
      setError(
        tx3(
          lang,
          "பருவ வயதுவரை காத்திருக்க முடியுமா என்பதைத் தேர்ந்தெடுக்கவும்.",
          "Choose whether you can wait for puberty.",
          "اختر ما إذا كان يمكن الانتظار حتى البلوغ.",
        ),
      );
      return;
    }
    if (choice === "yes") {
      setResult(null);
      setWaitShown(true);
      setError(null);
      setOpenStep(0);
      return;
    }
    try {
      setResult(calculateKhuntha({ estate: e, heirs: h, role: r }));
      setWaitShown(false);
      setError(null);
      setOpenStep(0);
    } catch (err) {
      setResult(null);
      setWaitShown(false);
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const load = () => {
    const e = 3000;
    const h = preloadHeirs({ sons: 1, daughters: 1 });
    setEstate(e);
    setHeirs(h);
    setKhuntha(true);
    setRole("child");
    setWaitChoice("no");
    compute(e, h, "child", "no", true);
  };

  const reset = () => {
    setEstate(topic.preload.estate);
    setHeirs(preloadHeirs(topic.preload.heirs));
    setKhuntha(true);
    setRole("child");
    setWaitChoice(null);
    setWaitShown(false);
    setResult(null);
    setError(null);
    setOpenStep(1);
  };

  const heirCount = Object.values(heirs).reduce((s, v) => s + (v ?? 0), 0);
  const khunthaLabel = role === "child" ? ss("khunthaChild", lang) : khunthaSiblingLabel(lang);

  const khunthaOptions: SheetExtraOption[] = [
    {
      id: "khuntha-child",
      ta: ss("khunthaChild", "ta"),
      en: ss("khunthaChild", "en"),
      ar: ss("khunthaChild", "ar"),
      onPick: () => {
        setKhuntha(true);
        setRole("child");
        clearResult();
      },
    },
    {
      id: "khuntha-sibling",
      ta: khunthaSiblingLabel("ta"),
      en: khunthaSiblingLabel("en"),
      ar: khunthaSiblingLabel("ar"),
      onPick: () => {
        setKhuntha(true);
        setRole("paternalSibling");
        clearResult();
      },
    },
  ];

  // Prevailing view (display split): the khuntha's larger amount is the
  // held/reserved share; the other heirs are paid the lesser.
  const prevailingKhunthaRow = result?.prevailing.rows.find((r) => r.key === "khuntha");
  const prevailingOthers = result?.prevailing.rows.filter((r) => r.key !== "khuntha") ?? [];
  const prevailingHeld: SpecialRow = prevailingKhunthaRow
    ? { ...prevailingKhunthaRow, key: "__held__", label: "Held until the sex is known" }
    : heldRow({ n: 0, d: 1 }, 0);

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
          id="khuntha-estate"
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
        {khuntha ? (
          <div className="ms4-chosen-row">
            <span className="ms4-chosen-name">{khunthaLabel}</span>
            <button
              type="button"
              className="ms4-chosen-remove"
              aria-label={`${tx3(lang, "நீக்குக", "Remove", "احذف")} ${khunthaLabel}`}
              onClick={() => {
                setKhuntha(false);
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
          extraOptions={khunthaOptions}
        />
      </StepShell>

      <StepShell
        n={3}
        title={ss("khunthaCanWait", lang)}
        summary={
          waitChoice === "yes"
            ? tx3(lang, "ஆம் — காத்திருக்கலாம்", "Yes — can wait", "نعم — يمكن الانتظار")
            : waitChoice === "no"
              ? tx3(lang, "இல்லை — காத்திருக்க முடியாது", "No — cannot wait", "لا — لا يمكن الانتظار")
              : null
        }
        open={openStep === 3}
        onOpen={() => setOpenStep(3)}
        lang={lang}
      >
        <div className="ms4-branch-cards">
          <BranchCard
            title={tx3(lang, "ஆம்", "Yes", "نعم")}
            selected={waitChoice === "yes"}
            onSelect={() => { setWaitChoice("yes"); clearResult(); }}
            lang={lang}
          />
          <BranchCard
            title={tx3(lang, "இல்லை", "No", "لا")}
            selected={waitChoice === "no"}
            onSelect={() => { setWaitChoice("no"); clearResult(); }}
            lang={lang}
          />
        </div>
      </StepShell>

      <div className="ms-special-actions">
        <LoadExampleButton onLoad={load} lang={lang} />
        <CalcButton onClick={() => compute(estate, heirs, role, waitChoice, khuntha)} lang={lang} />
        <ResetButton onReset={reset} lang={lang} />
      </div>
      <CalcError message={error} lang={lang} />

      {waitShown ? (
        <div className="ms-special-results">
          <div className="ms4-results">
            <p className="ms4-sahih-consequence">{ss("khunthaBookSaysWait", lang)}</p>
            <p className="ms4-muted">{ss("khunthaWaitThenDecide", lang)}</p>
            <FlagLine text={WAIT_TRAITS_FLAG} lang={lang} />
          </div>
        </div>
      ) : null}

      {result ? (
        <div className="ms-special-results">
          <SwipeCards
            lang={lang}
            cards={[
              {
                title: tx3(lang, "ஷாஃபிஈ", "Shafi'i", "الشافعي"),
                content: (
                  <ResultTable
                    rows={[...result.shafii.payNow, heldRow(result.shafii.heldShare, result.shafii.heldAmount)]}
                    lang={lang}
                    estate={estate}
                    verifyTotal={estate}
                    total={estate}
                  />
                ),
              },
              {
                title: tx3(lang, "அபூ ஹனீஃபா", "Abu Hanifa", "أبو حنيفة"),
                content: (
                  <ResultTable
                    rows={[...result.abuHanifa.rows, heldRow({ n: 0, d: 1 }, 0)]}
                    lang={lang}
                    estate={estate}
                    verifyTotal={estate}
                    total={estate}
                  />
                ),
              },
              {
                title: ss("khunthaPrevailing", lang),
                content: (
                  <>
                    <ResultTable
                      rows={[...prevailingOthers, prevailingHeld]}
                      lang={lang}
                      estate={estate}
                      verifyTotal={estate}
                      total={estate}
                    />
                    <p className="ms4-muted">
                      {tx3(
                        lang,
                        "விதியிலிருந்து பெறப்பட்டது: பெரிய தொகை குஃன்ஃதாவுக்காக ஒதுக்கப்படுகிறது; இந்த நிறுத்திவைக்கும் தொகை நூலில் அட்டவணையில் இல்லை.",
                        "Rule-derived: the larger amount is reserved for the khuntha; the book does not tabulate this held figure.",
                        "مستنتج من القاعدة: يُحجز المبلغ الأكبر للخنثى؛ والكتاب لا يذكر هذا المبلغ المحجوز في جدول.",
                      )}
                    </p>
                  </>
                ),
              },
            ]}
          />
          <ResultNotes notes={result.notes} scholarReasons={[]} lang={lang} />
        </div>
      ) : null}
    </div>
  );
}
