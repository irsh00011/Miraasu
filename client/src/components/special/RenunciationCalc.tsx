/**
 * 11. Renunciation / refusal of a share (book §4.11, p. 301; case 271).
 * Initial shares table followed by the redistribution table + final answer;
 * the wrong method (dropping the refuser first) is shown for comparison,
 * with the reason it is wrong.
 */
import { useState } from "react";
import { calculateRenunciation } from "@/lib/specialMethods";
import type { HeirInput } from "@/lib/inheritance";
import { errEstate, errHeirs, fmt, tHint, tx3, type TopicCalcProps } from "./types";
import { enteredHeirKeys, hasAnyHeir, preloadHeirs } from "./heirMeta";
import {
  CalcButton,
  CalcError,
  FinalAnswer,
  HeirPicker,
  LoadExampleButton,
  MoneyField,
  ResetButton,
  ResultNotes,
  ResultTable,
  StepHeading,
} from "./shared";

export default function RenunciationCalc({ topic, lang }: TopicCalcProps) {
  const [estate, setEstate] = useState(0);
  const [heirs, setHeirs] = useState<HeirInput>(() => preloadHeirs({}));
  const [refuserKey, setRefuserKey] = useState<keyof HeirInput>("wives");
  const [result, setResult] = useState<ReturnType<typeof calculateRenunciation> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const compute = (e: number, h: HeirInput, r: keyof HeirInput) => {
    if (!(e > 0)) { setResult(null); setError(errEstate(lang)); return; }
    if (!hasAnyHeir(h)) { setResult(null); setError(errHeirs(lang)); return; }
    try {
      setResult(calculateRenunciation({ estate: e, heirs: h, refuserKey: r }));
      setError(null);
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
    setEstate(0);
    setHeirs(preloadHeirs({}));
    setRefuserKey("wives");
    setResult(null);
    setError(null);
  };

  const entered = enteredHeirKeys(heirs);

  return (
    <div className="ms-special-calc-body">
      <p className="ms-special-hint">{tHint(topic, lang)}</p>

      <StepHeading n={1} title={tx3(lang, "சொத்து", "Estate", "التركة")} />
      <MoneyField id="renun-estate" label={tx3(lang, "சொத்து", "Estate", "التركة")} value={estate} onChange={setEstate} />

      <StepHeading
        n={2}
        title={tx3(lang, "வாரிசுகள் — மறுப்பவரையும் சேர்த்து", "Heirs — including the refuser", "الورثة — بمن فيهم المتنازل")}
        help={tx3(
          lang,
          "மறுக்கும் வாரிசைப் பட்டியலிலிருந்து நீக்க வேண்டாம் — அவரையும் சேர்த்தே முதல் பங்கீடு செய்யப்படும்.",
          "Do not delete the refusing heir from the list — the first division includes them.",
          "لا تحذف الوارث المتنازل من القائمة، فالقسمة الأولى تشمله.",
        )}
      />
      <HeirPicker
        heirs={heirs}
        onChange={setHeirs}
        keys={["husband", "wives", "father", "mother", "paternalGrandfather", "sons", "daughters", "fullBrothers", "fullSisters", "maternalBrothers", "maternalSisters"]}
        lang={lang}
      />

      <StepHeading
        n={3}
        title={tx3(lang, "மறுக்கும் வாரிசு யார்?", "Who refuses their share?", "من الذي يتنازل عن حصته؟")}
      />
      <label className="ms-special-field">
        {tx3(lang, "மறுக்கும் வாரிசு", "The refusing heir", "الوارث المتنازل")}
        <select
          value={String(refuserKey)}
          onChange={(e) => setRefuserKey(e.target.value as keyof HeirInput)}
          className="ms-special-input"
        >
          {entered.map((m) => (
            <option key={m.key} value={m.key}>{tx3(lang, m.ta, m.en, m.ar)}</option>
          ))}
        </select>
      </label>

      <div className="ms-special-actions">
        <LoadExampleButton onLoad={load} lang={lang} />
        <CalcButton onClick={() => compute(estate, heirs, refuserKey)} lang={lang} />
        <ResetButton onReset={reset} lang={lang} />
      </div>
      <CalcError message={error} lang={lang} />

      {result ? (
        <div className="ms-special-results">
          <FinalAnswer>{result.summary}</FinalAnswer>
          <ResultTable
            rows={result.firstDivision}
            lang={lang}
            estate={estate}
            verifyTotal={estate}
            title={tx3(lang, "முதல் பிரிவு — மறுப்பவரையும் சேர்த்து", "First division — with the refuser included", "القسمة الأولى — بمن فيها المتنازل")}
          />
          <p className="ms-special-muted">
            {tx3(lang, "மறுக்கப்பட்ட பங்கு: ", "Refused share: ", "الحصة المتنازَل عنها: ")}₹{fmt(result.refusedAmount)}
          </p>
          <ResultTable
            rows={result.redistribution}
            lang={lang}
            estate={estate}
            title={tx3(lang, "மறுக்கப்பட்ட பங்கின் மறுபகிர்வு", "Re-division of the refused share", "إعادة توزيع الحصة المتنازَل عنها")}
          />
          <ResultTable
            rows={result.finalRows}
            lang={lang}
            estate={estate}
            verifyTotal={estate}
            title={tx3(lang, "இறுதி முடிவு", "Final result", "النتيجة النهائية")}
          />
          <div className="ms-special-wrong">
            <h4 className="ms-special-result-title">
              {tx3(lang, "தவறான முறை — மறுப்பவரை முதலிலேயே நீக்குவது (செய்யக் கூடாது)", "Wrong method — dropping the refuser first (do not use)", "الطريقة الخاطئة — إسقاط المتنازل أولًا (لا تستعملها)")}
            </h4>
            <p className="ms-special-muted">
              {tx3(
                lang,
                "மறுப்பவரை முதலிலேயே நீக்கினால் மற்றவர்களின் நிலையான பங்குகள் மாறிவிடும் — எடுத்துக்காட்டாக, மனைவி இருப்பதால் மகள் 1/2 பெறுகிறார்; மனைவியை முதலிலேயே நீக்கினால் மகள் 1/2-க்குப் பதில் வேறு பங்கு வரும். அதனால்தான் நூல் “இது தவறானது” என்கிறது.",
                "Dropping the refuser first changes the others' fixed shares — for example, the daughter takes 1/2 because the wife is present; remove the wife first and the daughter's share changes. That is why the book says this is wrong.",
                // AR-REVIEW: explanation of why dropping the refuser first is wrong.
                "إسقاط المتنازل أولًا يغيّر فروض الآخرين، فالبنت مثلًا تأخذ النصف لوجود الزوجة، وبدونها يتغير فرضها، ولذلك يقول الكتاب إن هذا خطأ.",
              )}
            </p>
            <ResultTable rows={result.wrongMethod} lang={lang} estate={estate} />
          </div>
          <ResultNotes notes={result.notes} scholarReasons={result.scholarReasons} lang={lang} />
        </div>
      ) : null}
    </div>
  );
}
