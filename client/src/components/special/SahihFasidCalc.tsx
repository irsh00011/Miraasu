/**
 * 5. Sahih / fasid grandparent classification (book §4.5).
 * Chain picker: build a grandparent chain link by link (father/mother) →
 * classification card (ṣaḥīḥ / fāsid, book category) → consequence
 * (fixed-share heir / Asabah / distant relative → Dhawul Arham branch).
 * This topic classifies a person; it divides no estate, so there is no
 * estate step — the chain itself is the input.
 */
import { useState } from "react";
import { classifyGrandparent, type GrandparentChainLink } from "@/lib/specialMethods";
import { tCategoryName, tCategoryResult, tHint, tx3, type TopicCalcProps } from "./types";
import {
  AddButton,
  CalcButton,
  CalcError,
  LoadExampleButton,
  RemoveButton,
  ResetButton,
  ResultNotes,
  StepHeading,
} from "./shared";

export default function SahihFasidCalc({ topic, lang }: TopicCalcProps) {
  const [chain, setChain] = useState<GrandparentChainLink[]>(["father", "father"]);
  const [result, setResult] = useState<ReturnType<typeof classifyGrandparent> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const compute = (c: GrandparentChainLink[]) => {
    try {
      setResult(classifyGrandparent(c));
      setError(null);
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const load = () => {
    const c: GrandparentChainLink[] = ["mother", "father"];
    setChain(c);
    compute(c);
  };

  const reset = () => {
    setChain(["father", "father"]);
    setResult(null);
    setError(null);
  };

  const linkLabel = (l: GrandparentChainLink) =>
    l === "father" ? tx3(lang, "தந்தை", "Father", "أب") : tx3(lang, "தாய்", "Mother", "أم");
  const chainText = chain.map(linkLabel).join(" → ");

  return (
    <div className="ms-special-calc-body">
      <p className="ms-special-hint">{tHint(topic, lang)}</p>

      <StepHeading
        n={1}
        title={tx3(lang, "மூதாதையர் சங்கிலியை அமைக்கவும்", "Build the grandparent chain", "ابنِ سلسلة القرابة")}
        help={tx3(
          lang,
          "இறந்தவரிடமிருந்து வெளியே செல்லும் தொடர்பை ஒவ்வொரு இணைப்பாகச் சேர்க்கவும். கடைசி இணைப்பே அந்த மூதாதையர்: “தந்தை” என்றால் தாத்தா, “தாய்” என்றால் பாட்டி.",
          "Build the chain of relation outward from the deceased, one link at a time. The last link is the grandparent themself: “father” means a grandfather, “mother” means a grandmother.",
          "ابنِ سلسلة القرابة من المتوفى إلى الخارج حلقةً حلقة. الحلقة الأخيرة هي الجد أو الجدة نفسها: «أب» تعني جدًّا، و«أم» تعني جدةً.",
        )}
      />
      <fieldset className="ms-special-heirs">
        <legend className="ms-special-field-label">
          {tx3(lang, "சங்கிலி (இறந்தவரிடமிருந்து வெளியே)", "Chain (outward from the deceased)", "السلسلة (من المتوفى إلى الخارج)")}
        </legend>
        <div className="ms-special-chain">
          {chain.map((link, i) => (
            <span key={i} className="ms-special-chain-link">
              <select
                aria-label={tx3(lang, `இணைப்பு ${i + 1}`, `Link ${i + 1}`, `الحلقة ${i + 1}`)}
                value={link}
                onChange={(e) =>
                  setChain((cs) => cs.map((x, j) => (j === i ? (e.target.value as GrandparentChainLink) : x)))
                }
                className="ms-special-input"
              >
                <option value="father">{tx3(lang, "தந்தை", "Father", "أب")}</option>
                <option value="mother">{tx3(lang, "தாய்", "Mother", "أم")}</option>
              </select>
              {i < chain.length - 1 ? <span aria-hidden="true">→</span> : null}
            </span>
          ))}
        </div>
        <p className="ms-special-chain-preview">{chainText}</p>
        <div className="ms-special-actions">
          <AddButton onClick={() => setChain((cs) => [...cs, "father"])} disabled={chain.length >= 5}>
            {tx3(lang, "இணைப்பைச் சேர்", "Add link", "أضف حلقة")}
          </AddButton>
          <RemoveButton
            onClick={() => setChain((cs) => cs.slice(0, -1))}
            label={tx3(lang, "கடைசி இணைப்பை நீக்கு", "Remove last link", "احذف الحلقة الأخيرة")}
          />
        </div>
      </fieldset>

      <div className="ms-special-actions">
        <LoadExampleButton onLoad={load} lang={lang} />
        <CalcButton onClick={() => compute(chain)} lang={lang} />
        <ResetButton onReset={reset} lang={lang} />
      </div>
      <CalcError message={error} lang={lang} />

      {result ? (
        <div className="ms-special-results">
          <StepHeading n={2} title={tx3(lang, "வகைப்பாடு", "Classification", "التصنيف")} />
          <div className="ms-special-class-card">
            <p className="ms-special-class-title">{chainText}</p>
            <p className="ms-special-class-value">
              {result.classification === "sahih"
                ? tx3(lang, "ஸஹீஹ் (சரியானது)", "Ṣaḥīḥ (sound)", "صحيح")
                : tx3(lang, "ஃபாஸித் (சரியற்றது)", "Fāsid (unsound)", "فاسد")}
              {" — "}
              {tx3(lang, "நூலின் வகை", "Book category", "الفئة في الكتاب")} {result.bookCategory}
              {result.matchedBookExample
                ? ` · ${tx3(lang, "நூலின் எடுத்துக்காட்டு", "A book example", "مثال من الكتاب")}`
                : ` · ${tx3(lang, "நூலின் எடுத்துக்காட்டில் நேரடியாக இல்லை", "Not literally a book example", "ليس مثالًا مذكورًا حرفيًّا في الكتاب")}`}
            </p>
            <p>
              <strong>
                {tx3(lang, "விளைவு: ", "Consequence: ", "النتيجة: ")}
                {result.consequence === "fixed-share"
                  ? tx3(lang, "நிலையான பங்கு பெறும் வாரிசு.", "A fixed-share heir.", "صاحب فرض.")
                  : tx3(lang, "தூரத்து உறவினர்.", "A distant relative.", "ذو رحم.")}
              </strong>
              {result.dhawulArhamBranch ? (
                <>
                  {" "}
                  {tx3(lang, "தூரத்து உறவினர் கிளை", "Dhawul Arham branch", "فرع ذوي الأرحام")} {result.dhawulArhamBranch}
                </>
              ) : null}
            </p>
            <p>{result.consequenceNote}</p>
            {result.matchedBookExample ? null : (
              <p className="ms-special-note-flag">
                {tx3(lang, "கவனிக்க: இந்தச் சங்கிலி நூலின் எடுத்துக்காட்டுகளில் நேரடியாக இல்லை.", "Note: this chain is not literally one of the book's listed examples.", "ملاحظة: هذه السلسلة ليست من أمثلة الكتاب المذكورة حرفيًّا.")}
              </p>
            )}
            <ResultNotes
              notes={result.notes}
              scholarReasons={
                result.needsScholarConfirmation
                  ? [
                      tx3(
                        lang,
                        "இந்த வகைப்பாட்டைப் பயன்படுத்துவதற்கு முன் அறிஞரிடம் உறுதி செய்க.",
                        "Confirm this classification with a scholar before using it.",
                        "أكّد هذا التصنيف مع عالم قبل الاعتماد عليه.",
                      ),
                    ]
                  : []
              }
              lang={lang}
            />
          </div>

          {topic.categories ? (
            <div className="ms-special-categories">
              <h4 className="ms-special-result-title">
                {tx3(lang, "நூலின் எட்டு வகைகள்", "The book's eight categories", "الفئات الثماني في الكتاب")}
              </h4>
              <table className="ms-special-result-table">
                <thead>
                  <tr>
                    <th scope="col">{tx3(lang, "வகை", "Category", "الفئة")}</th>
                    <th scope="col">{tx3(lang, "முடிவு", "Outcome", "النتيجة")}</th>
                  </tr>
                </thead>
                <tbody>
                  {topic.categories.map((c, i) => (
                    <tr key={i} className={result.bookCategory === i + 1 ? "is-held" : ""}>
                      <td>{tCategoryName(c, lang)}</td>
                      <td>{tCategoryResult(c, lang)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
