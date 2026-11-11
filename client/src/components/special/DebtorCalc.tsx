/**
 * 3. Debtor's estate (book p. 305; cases 272–273).
 * v4 rebuild (redesign spec §4): Step 1 keeps the burial-costs field
 * (gross estate, burial costs, computed "Estate after burial costs" line).
 * Step 2: creditor rows (name + amount), "Add creditor", live "Total debt"
 * line. One short banner, picked automatically: (a) estate = debt,
 * (b) debt > estate (pro-rata), (c) estate > debt (debts paid in full,
 * remainder to heirs). Step 3 (heirs) appears ONLY in state (c).
 * Result state (b): creditor table with name, share-of-debt %, amount paid
 * (large), unpaid balance muted. Result state (c): creditors paid in full,
 * Remainder box, then heir amount cards. Case 272 "Load book example"
 * loads Khalid ₹7,000 (NOT 70,000) with the one-line flag.
 * Calculation unchanged: calculateDebtorEstate (existing, tested).
 */
import { useState } from "react";
import { calculateDebtorEstate, rowPercent } from "@/lib/specialMethods";
import type { HeirInput } from "@/lib/inheritance";
import { errEstate, fmt, ss, tx3, type TopicCalcProps } from "./types";
import { hasAnyHeir, preloadHeirs } from "./heirMeta";
import {
  AddButton,
  CalcButton,
  CalcError,
  FlagLine,
  HeirPickerSheet,
  HeldBox,
  LoadExampleButton,
  MoneyField,
  RemoveButton,
  ResetButton,
  ResultNotes,
  ResultTable,
  RoundingRow,
  StepShell,
  TotalCheckLine,
  TotalLine,
} from "./shared";

type DebtForm = { name: string; amount: number };

const defaultDebts: DebtForm[] = [
  { name: "Khalid", amount: 7000 },
  { name: "Abu Bakr", amount: 5000 },
  { name: "Ahmad", amount: 3000 },
];

const HEIR_KEYS: (keyof HeirInput)[] = [
  "husband", "wives", "father", "mother", "paternalGrandfather", "sons", "daughters",
  "fullBrothers", "fullSisters", "maternalBrothers", "maternalSisters",
];

/** 1 = estate equals debt; 2 = debt exceeds estate; 3 = estate exceeds debt. */
const debtorState = (distributable: number, totalDebt: number): 1 | 2 | 3 =>
  distributable <= 0 || totalDebt > distributable ? 2 : totalDebt === distributable ? 1 : 3;

export default function DebtorCalc({ topic, lang }: TopicCalcProps) {
  const [grossEstate, setGrossEstate] = useState(topic.preload.estate);
  const [funeralCosts, setFuneralCosts] = useState(0);
  const [debts, setDebts] = useState<DebtForm[]>(defaultDebts);
  const [heirs, setHeirs] = useState<HeirInput>(() => preloadHeirs(topic.preload.heirs));
  const [openStep, setOpenStep] = useState(1);
  const [result, setResult] = useState<ReturnType<typeof calculateDebtorEstate> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const clearResult = () => setResult(null);
  const distributable = Math.max(0, grossEstate - funeralCosts);
  const totalDebt = debts.reduce((s, d) => s + Math.max(0, d.amount), 0);
  const state = debtorState(distributable, totalDebt);
  const bannerKey = state === 1 ? "debtorStateA" : state === 2 ? "debtorStateB" : "debtorStateC";

  const compute = (g: number, f: number, d: DebtForm[], h: HeirInput) => {
    if (!(g > 0)) { setResult(null); setError(errEstate(lang)); return; }
    if (d.filter((x) => x.amount > 0).length === 0) {
      setResult(null);
      setError(tx3(lang, "குறைந்தது ஒரு கடனையாவது உள்ளிடவும்.", "Enter at least one debt.", "أدخل دينًا واحدًا على الأقل."));
      return;
    }
    const dist = Math.max(0, g - f);
    const tot = d.reduce((s, x) => s + Math.max(0, x.amount), 0);
    if (debtorState(dist, tot) === 3 && !hasAnyHeir(h)) {
      setResult(null);
      setError(tx3(lang, "மீதம் வாரிசுகளுக்குச் செல்வதால் குறைந்தது ஒரு வாரிசையாவது உள்ளிடவும்.", "The remainder goes to the heirs, so enter at least one heir.", "الباقي يذهب إلى الورثة، فأدخل وارثًا واحدًا على الأقل."));
      return;
    }
    try {
      setResult(calculateDebtorEstate({ grossEstate: g, funeralCosts: f, debts: d.filter((x) => x.amount > 0), heirs: h }));
      setError(null);
      setOpenStep(0);
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const load = () => {
    const g = 10000;
    const f = 0;
    const d: DebtForm[] = [...defaultDebts];
    const h = preloadHeirs({ mother: 1, father: 1, sons: 1, wives: 1 });
    setGrossEstate(g);
    setFuneralCosts(f);
    setDebts(d);
    setHeirs(h);
    compute(g, f, d, h);
  };

  const reset = () => {
    setGrossEstate(topic.preload.estate);
    setFuneralCosts(0);
    setDebts(defaultDebts);
    setHeirs(preloadHeirs(topic.preload.heirs));
    setResult(null);
    setError(null);
    setOpenStep(1);
  };

  const heirCount = Object.values(heirs).reduce((s, v) => s + (v ?? 0), 0);
  // Case 272 flag: show only when the case-272 figures are the ones loaded.
  const showCase272Flag =
    !!result &&
    result.state === 2 &&
    result.totalDebt === 15000 &&
    result.distributable === 10000 &&
    debts.some((d) => d.name === "Khalid" && d.amount === 7000);
  // Case 273 rounding: the book prints the son as 2,361.12; the calculator
  // gives 2,361.11 so the total is exactly 5,000.00.
  const sonRow = result?.heirRows.find((r) => r.key === "sons");
  const showCase273Rounding =
    !!result &&
    result.state === 3 &&
    result.remainderForHeirs === 5000 &&
    !!sonRow &&
    Math.abs(sonRow.amount - 2361.11) < 0.01;

  return (
    <div className="ms-special-calc-body">
      <StepShell
        n={1}
        title={tx3(lang, "சொத்தும் அடக்கச் செலவும்", "Estate and burial costs", "التركة وتكاليف الدفن")}
        summary={`₹${fmt(grossEstate)}`}
        open={openStep === 1}
        onOpen={() => setOpenStep(1)}
        lang={lang}
      >
        <MoneyField
          id="debtor-estate"
          label={tx3(lang, "மொத்தச் சொத்து", "Gross estate", "إجمالي التركة")}
          value={grossEstate}
          onChange={(v) => { setGrossEstate(v); clearResult(); }}
        />
        <MoneyField
          id="debtor-funeral"
          label={ss("debtorBurialCosts", lang)}
          value={funeralCosts}
          onChange={(v) => { setFuneralCosts(v); clearResult(); }}
          help={tx3(lang, "அடக்கச் செலவு முதலில் கழிக்கப்படும்.", "Burial costs are taken out first.", "تُخصم تكاليف الدفن أولًا.")}
        />
        <p className="ms4-estate-line">
          {tx3(lang, "அடக்கச் செலவுக்குப் பிறகு சொத்து: ", "Estate after burial costs: ", "التركة بعد تكاليف الدفن: ")}
          ₹{fmt(distributable)}
        </p>
      </StepShell>

      <StepShell
        n={2}
        title={tx3(lang, "கடன் கொடுத்தவர்கள்", "Creditors", "الدائنون")}
        summary={totalDebt > 0 ? `${ss("debtorTotalDebt", lang)} ₹${fmt(totalDebt)}` : null}
        open={openStep === 2}
        onOpen={() => setOpenStep(2)}
        lang={lang}
      >
        <div className="ms4-chosen-list">
          {debts.map((d, i) => (
            <div key={i} className="ms4-debt-row">
              <input
                type="text"
                aria-label={ss("debtorCreditor", lang)}
                value={d.name}
                onChange={(e) => { setDebts((ds) => ds.map((x, j) => (j === i ? { ...x, name: e.target.value } : x))); clearResult(); }}
                className="ms-special-input"
                placeholder={tx3(lang, "பெயர்", "Name", "الاسم")}
              />
              <div className="ms4-row-controls">
                <MoneyField
                  id={`debtor-amount-${i}`}
                  label={tx3(lang, "கடன் தொகை", "Debt amount", "مبلغ الدين")}
                  value={d.amount}
                  onChange={(v) => { setDebts((ds) => ds.map((x, j) => (j === i ? { ...x, amount: v } : x))); clearResult(); }}
                />
                <RemoveButton onClick={() => { setDebts((ds) => ds.filter((_, j) => j !== i)); clearResult(); }} label={tx3(lang, "நீக்கு", "Remove", "احذف")} />
              </div>
            </div>
          ))}
        </div>
        <AddButton onClick={() => { setDebts((ds) => [...ds, { name: "", amount: 0 }]); clearResult(); }}>
          {ss("debtorAddCreditor", lang)}
        </AddButton>
        <p className="ms4-estate-line">
          {ss("debtorTotalDebt", lang)}: ₹{fmt(totalDebt)}
        </p>
        <p className="ms4-banner" role="status">{ss(bannerKey, lang)}</p>
      </StepShell>

      {state === 3 ? (
        <StepShell
          n={3}
          title={ss("stepHeirs", lang)}
          summary={heirCount > 0 ? tx3(lang, `${heirCount} வாரிசு(கள்)`, `${heirCount} heir(s)`, `${heirCount} من الورثة`) : null}
          open={openStep === 3}
          onOpen={() => setOpenStep(3)}
          lang={lang}
        >
          <HeirPickerSheet
            heirs={heirs}
            onChange={(h) => { setHeirs(h); clearResult(); }}
            keys={HEIR_KEYS}
            lang={lang}
          />
        </StepShell>
      ) : null}

      <div className="ms-special-actions">
        <LoadExampleButton onLoad={load} lang={lang} />
        <CalcButton onClick={() => compute(grossEstate, funeralCosts, debts, heirs)} lang={lang} />
        <ResetButton onReset={reset} lang={lang} />
      </div>
      <CalcError message={error} lang={lang} />

      {result ? (
        <div className="ms-special-results">
          <div className="ms4-result-list">
            {result.creditorRows.map((row, i) => {
              const debt = debts.filter((d) => d.amount > 0)[i];
              const owed = debt?.amount ?? 0;
              const unpaid = Math.max(0, owed - row.amount);
              const sub = [row.fraction, `${rowPercent(row).toFixed(2)}%`].filter(Boolean).join(" · ");
              return (
                <div key={`${row.key}-${i}`} className="ms4-creditor-row">
                  <div className="ms4-creditor-row-name">{row.label}</div>
                  <div className="ms4-creditor-row-amount">₹{fmt(row.amount)}</div>
                  <div className="ms4-creditor-row-sub">
                    {ss("debtorShareOfDebt", lang)} {sub} · {ss("debtorAmountPaid", lang)}
                  </div>
                  {result.state === 2 && unpaid > 0 ? (
                    <p className="ms4-creditor-row-note">
                      {tx3(lang, "செலுத்தப்படாத மீதம்: ", "Unpaid balance: ", "الرصيد غير المسدد: ")}₹{fmt(unpaid)}
                    </p>
                  ) : (
                    <p className="ms4-creditor-row-note">
                      {tx3(lang, "முழுமையாகக் கொடுக்கப்பட்டது.", "Paid in full.", "دُفع بالكامل.")}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
          {result.state === 3 ? (
            <TotalLine total={result.creditorRows.reduce((s, r) => s + r.amount, 0)} lang={lang} />
          ) : (
            <TotalCheckLine total={result.creditorRows.reduce((s, r) => s + r.amount, 0)} lang={lang} ok />
          )}
          {showCase272Flag ? (
            <FlagLine
              text="Case 272: the book's question prints Khalid's debt as 70,000; the working uses 7,000."
              lang={lang}
            />
          ) : null}
          {result.state === 3 ? (
            <>
              <HeldBox
                label={tx3(lang, "மீதம் — வாரிசுகளுக்கு", "Remainder — for the heirs", "الباقي — للورثة")}
                amount={result.remainderForHeirs}
                lang={lang}
              />
              {result.heirRows.length > 0 ? (
                <ResultTable
                  rows={result.heirRows}
                  lang={lang}
                  estate={result.remainderForHeirs}
                  verifyTotal={result.remainderForHeirs}
                  title={tx3(lang, "வாரிசுகள் — மீதத்தின் பங்கீடு", "Heirs — division of the remainder", "الورثة — قسمة الباقي")}
                />
              ) : null}
              {showCase273Rounding && sonRow ? (
                <RoundingRow
                  label={tx3(lang, "மகன்", "Son", "الابن")}
                  amount={sonRow.amount}
                  bookAmount={2361.12}
                  lang={lang}
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
