/**
 * 3. Debtor's estate (book §4.3, p. 305; cases 272–273).
 * Dynamic creditor list (add/remove rows: name + amount owed) + pro-rata
 * distribution table. Three states: estate = debt, debt > estate (pro-rata),
 * estate > debt (pay in full, divide the remainder among the heirs).
 */
import { useState } from "react";
import { calculateDebtorEstate } from "@/lib/specialMethods";
import type { HeirInput } from "@/lib/inheritance";
import { errEstate, fmt, tHint, tx3, type TopicCalcProps } from "./types";
import { preloadHeirs } from "./heirMeta";
import {
  AddButton,
  CalcButton,
  CalcError,
  FinalAnswer,
  HeirPicker,
  LoadExampleButton,
  MoneyField,
  RemoveButton,
  ResetButton,
  ResultNotes,
  ResultTable,
  StepHeading,
} from "./shared";

type DebtForm = { name: string; amount: number };

const defaultDebts: DebtForm[] = [
  { name: "Khalid", amount: 7000 },
  { name: "Abu Bakr", amount: 5000 },
  { name: "Ahmad", amount: 3000 },
];

export default function DebtorCalc({ topic, lang }: TopicCalcProps) {
  const [grossEstate, setGrossEstate] = useState(0);
  const [funeralCosts, setFuneralCosts] = useState(0);
  const [debts, setDebts] = useState<DebtForm[]>([]);
  const [heirs, setHeirs] = useState<HeirInput>(() => preloadHeirs({}));
  const [result, setResult] = useState<ReturnType<typeof calculateDebtorEstate> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const compute = (g: number, f: number, d: DebtForm[], h: HeirInput) => {
    if (!(g > 0)) { setResult(null); setError(errEstate(lang)); return; }
    if (d.filter((x) => x.amount > 0).length === 0) {
      setResult(null);
      setError(tx3(lang, "குறைந்தது ஒரு கடனையாவது உள்ளிடவும்.", "Enter at least one debt.", "أدخل دينًا واحدًا على الأقل."));
      return;
    }
    try {
      setResult(calculateDebtorEstate({ grossEstate: g, funeralCosts: f, debts: d.filter((x) => x.amount > 0), heirs: h }));
      setError(null);
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
    setGrossEstate(0);
    setFuneralCosts(0);
    setDebts([]);
    setHeirs(preloadHeirs({}));
    setResult(null);
    setError(null);
  };

  const stateText = (s: 1 | 2 | 3) =>
    s === 1
      ? tx3(lang, "நிலை 1 — சொத்து கடனுக்குச் சமம்: வாரிசுகளுக்கு எதுவும் இல்லை.", "State 1 — estate equals the debt: the heirs get nothing.", "الحالة ١ — التركة تساوي الدين: لا شيء للورثة.")
      : s === 2
        ? tx3(lang, "நிலை 2 — கடன் சொத்தைவிட அதிகம்: சொத்து கடன் கொடுத்தவர்களுக்கு விகிதாசாரமாகப் பிரிக்கப்படுகிறது.", "State 2 — debt exceeds the estate: the estate is divided among the creditors pro rata.", "الحالة ٢ — الدين أكبر من التركة: تُقسَّم التركة على الدائنين بالتناسب.")
        : tx3(lang, "நிலை 3 — சொத்து கடனைவிட அதிகம்: கடன்கள் முழுதும் செலுத்தப்பட்டு, மீதம் வாரிசுகளுக்குப் பிரிக்கப்படுகிறது.", "State 3 — estate exceeds the debt: debts are paid in full, then the remainder is divided among the heirs.", "الحالة ٣ — التركة أكبر من الدين: تُدفع الديون كاملةً، ثم يُقسَّم الباقي على الورثة.");

  return (
    <div className="ms-special-calc-body">
      <p className="ms-special-hint">{tHint(topic, lang)}</p>

      <StepHeading n={1} title={tx3(lang, "சொத்தும் அடக்கச் செலவும்", "Estate and funeral costs", "التركة وتكاليف الدفن")} />
      <MoneyField id="debtor-estate" label={tx3(lang, "மொத்தச் சொத்து", "Gross estate", "إجمالي التركة")} value={grossEstate} onChange={setGrossEstate} />
      <MoneyField
        id="debtor-funeral"
        label={tx3(lang, "அடக்கச் செலவு", "Funeral costs", "تكاليف الدفن")}
        value={funeralCosts}
        onChange={setFuneralCosts}
        help={tx3(lang, "அடக்கச் செலவு முதலில் கழிக்கப்படும்.", "Funeral costs are taken out first.", "تُخصم تكاليف الدفن أولًا.")}
      />

      <StepHeading
        n={2}
        title={tx3(lang, "கடன் கொடுத்தவர்கள்", "Creditors", "الدائنون")}
        help={tx3(
          lang,
          "ஒவ்வொருவருக்கும் செலுத்த வேண்டிய கடன் தொகையை உள்ளிடவும். கடன் சொத்தைவிட அதிகமாக இருந்தால், ஒருவருக்கு முழுமையாகக் கொடுத்துவிட்டு அடுத்தவருக்கு என்று செலுத்தக்கூடாது — விகிதப்படி பிரிக்கப்படும்.",
          "Enter the amount owed to each creditor. If the debt exceeds the estate, creditors are not paid one by one in full — the estate is shared pro rata.",
          // AR-REVIEW: pro-rata warning phrasing.
          "أدخل المبلغ المستحق لكل دائن. وإذا تجاوز الدين التركة فلا يُدفع لدائن كاملًا ثم للآخر، بل تُقسَّم التركة بينهم بالتناسب.",
        )}
      />
      <fieldset className="ms-special-heirs">
        <legend className="ms-special-field-label">{tx3(lang, "கடன்கள்", "Debts", "الديون")}</legend>
        {debts.map((d, i) => (
          <div key={i} className="ms-special-debt-row">
            <input
              type="text"
              aria-label={tx3(lang, "கடன் கொடுத்தவர்", "Creditor", "الدائن")}
              value={d.name}
              onChange={(e) => setDebts((ds) => ds.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))}
              className="ms-special-input"
              placeholder={tx3(lang, "பெயர்", "Name", "الاسم")}
            />
            <MoneyField
              id={`debtor-amount-${i}`}
              label={tx3(lang, "கடன் தொகை", "Debt amount", "مبلغ الدين")}
              value={d.amount}
              onChange={(v) => setDebts((ds) => ds.map((x, j) => (j === i ? { ...x, amount: v } : x)))}
            />
            <RemoveButton onClick={() => setDebts((ds) => ds.filter((_, j) => j !== i))} label={tx3(lang, "நீக்கு", "Remove", "احذف")} />
          </div>
        ))}
        <AddButton onClick={() => setDebts((ds) => [...ds, { name: "", amount: 0 }])}>
          {tx3(lang, "கடனைச் சேர்", "Add debt", "أضف دينًا")}
        </AddButton>
      </fieldset>

      <StepHeading
        n={3}
        title={tx3(lang, "வாரிசுகள் (சொத்து மீதமிருந்தால் மட்டும்)", "Heirs (only if anything remains)", "الورثة (فقط إذا بقي شيء)")}
      />
      <HeirPicker
        heirs={heirs}
        onChange={setHeirs}
        keys={["husband", "wives", "father", "mother", "paternalGrandfather", "sons", "daughters", "fullBrothers", "fullSisters", "maternalBrothers", "maternalSisters"]}
        lang={lang}
      />

      <div className="ms-special-actions">
        <LoadExampleButton onLoad={load} lang={lang} />
        <CalcButton onClick={() => compute(grossEstate, funeralCosts, debts, heirs)} lang={lang} />
        <ResetButton onReset={reset} lang={lang} />
      </div>
      <CalcError message={error} lang={lang} />

      {result ? (
        <div className="ms-special-results">
          <FinalAnswer>{result.summary}</FinalAnswer>
          <p className="ms-special-state">{stateText(result.state)}</p>
          <p className="ms-special-muted">
            {tx3(lang, "மொத்தக் கடன்: ", "Total debt: ", "مجموع الدين: ")}₹{fmt(result.totalDebt)} ·{" "}
            {tx3(lang, "பகிரத்தக்கது: ", "Distributable: ", "المبلغ القابل للتوزيع: ")}₹{fmt(result.distributable)}
          </p>
          {result.creditorRows.length > 0 ? (
            <ResultTable
              rows={result.creditorRows}
              lang={lang}
              estate={result.state === 3 ? result.totalDebt : result.distributable}
              title={tx3(
                lang,
                result.state === 2 ? "கடன் கொடுத்தவர்கள் — விகிதாசாரப் பங்கீடு" : "கடன் கொடுத்தவர்கள்",
                result.state === 2 ? "Creditors — pro-rata distribution" : "Creditors",
                result.state === 2 ? "الدائنون — توزيع تناسبي" : "الدائنون",
              )}
            />
          ) : null}
          {result.heirRows.length > 0 ? (
            <ResultTable
              rows={result.heirRows}
              lang={lang}
              estate={result.remainderForHeirs}
              verifyTotal={result.remainderForHeirs}
              title={tx3(lang, "வாரிசுகள் — மீதத்தின் பங்கீடு", "Heirs — division of the remainder", "الورثة — قسمة الباقي")}
            />
          ) : null}
          {result.state === 3 ? (
            <p className="ms-special-muted">
              {tx3(lang, "வாரிசுகளுக்கு மீதம்: ", "Remainder for the heirs: ", "الباقي للورثة: ")}₹{fmt(result.remainderForHeirs)}
            </p>
          ) : null}
          <ResultNotes notes={result.notes} scholarReasons={result.scholarReasons} lang={lang} />
        </div>
      ) : null}
    </div>
  );
}
