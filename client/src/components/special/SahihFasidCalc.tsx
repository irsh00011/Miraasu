/**
 * 5. Ṣaḥīḥ / Fāsid grandparent classification (book lines 805–834).
 * v4 rebuild (redesign spec §6): no estate, no amounts. Build the chain
 * from the deceased upward — Father's side / Mother's side, then Male /
 * Female links (max 3) — and the result is ONE badge (Ṣaḥīḥ — sound, blue
 * filled; or Fāsid — broken, white with blue border) + ONE consequence
 * line. The 8-category rule text is copied VERBATIM from the book
 * (~/workspace/miraasu/reports/sahih-fasid-rule-verbatim.txt, extracted
 * from MeerathtamilBook2024decnew.doc) and shown under the result; it is
 * never paraphrased or retyped from memory.
 */
import { useMemo, useState } from "react";
import { classifyGrandparent, type GrandparentChainLink } from "@/lib/specialMethods";
import { ss, tx3, type TopicCalcProps } from "./types";
import {
  AddButton,
  Badge,
  BranchCard,
  ChainDrawing,
  LoadExampleButton,
  RemoveButton,
  ResetButton,
  ResultNotes,
} from "./shared";

const SAHIH_FASID_RULE_TA = "1. தந்தை வழி ஜத்து ஸஹீஹ் (الجد الصحيح)\nதந்தையின் தந்தை,     (أب الأب)\nதந்தையுடைய தந்தையின் தந்தை  (أب أب الأب)\nஎன்றத் தொடர்வரிசையில் இருக்க வேண்டும்.\nஇந்த தாத்தா தான் அஸ்ஹாபுல் புரூழ்-ல் கட்டுப்பட்டவர்கள். இவர்கள் மரணித்தவருக்கு தந்தை இல்லாத போது சொத்தை பெறுவார்கள்.\n\n2. தந்தை வழி ஜத்து ஃபாஸித் (الجد الفاسد)\nதந்தையின் தாயின் தந்தை (أب أم الأب) என்றத் தொடர்வரிசையில், இடையில் (பெண்ணான) தாயார் வந்தால் அவருக்கு ஜத்து ஃபாஸித் என்று சொல்லப்படும். இந்த தாத்தா அஸ்ஹாபுல் புரூழ், அஸபாக்கள் இருக்கும் போது இவர்கள் வாரிசாகக் மாட்டார்கள்.\n\n3. தாய் வழி ஜத்து ஸஹீ  (الجد الصحيح)\nதாயின் தந்தை (أب الأم)\nதாயுடைய தாயின் தந்தை  (أب أم الأم)\nஎன்றத் தொடர் வரிசையில் இருக்க வேண்டும்.\nஇந்த தாத்தா, ஜத்து ஸஹீயாக இருந்தாலும் அஸ்ஹாபுல் பராயீழ்-ல்க்கு கட்டுப்பட்டவர் அல்ல. தூரத்து உறவினர்களில் கட்டுப்பட்டவர். எனவே அஸ்ஹாபுல் புரூழ், அஸபாக்கள் இல்லாத போது இவர்கள் சொத்துக்கரியவர்களாக ஆகுவார்கள்.\n\n4. தாய் வழி ஜத்து ஃபாஸித் (الجد الفاسد)\nதாயின் தந்தையின் தாயாரின் தந்தை (أب أم أب الأم)\nஎன்றத் தொடர்வரிசையில் இடையில் ஆண் வாரிசான தந்தை வந்ததால் அதற்கு ஜத்து ஃபாஸித் என்று சொல்லப்படும். எனவே இந்த தாத்தா அஸ்ஹாபுல் புரூழ், அஸபாக்கள் இருக்கும் போது இவர்கள் வாரிசாகக் மாட்டார்கள்.\n\n5. தந்தை வழி ஜத்தா ஸஹீஹா (الجدة الصحيحة)\nதந்தையின் தாய் (أم الأب)\nதந்தையுடைய தந்தையின் தாய் (أم أب الأب)\nஎன்றத் தொடர் வரிசையில் இருந்தால் அவர் ஜத்தா ஸஹீஹா என்று சொல்லப்படும். இவர்கள் அஸ்ஹாபுல் புரூழ்-ல் கட்டுப்பட்டவர்கள். இவர்கள், மரணித்தவருக்கு தாய் இல்லாத சமயத்தில் தங்களுக்குரிய பங்கை பெறுவார்கள்.\n\n6. தந்தை வழி ஜத்தா பாஸிதா (الجدة الفاسدة)\nதந்தையின் தாயினுடைய தந்தையின் தாய் (أم أب أم الأب)\nஎன்றத் தொடர்வரிசையில் இடையில் ஆண். வாரிசான தந்தை வந்தால் அவருக்கு ஜத்தா பாஸிதா என்று சொல்லப்படும். இவர்கள் அஸ்ஹாபுல் புரூழ், அஸபாக்கள் கட்டுப்பட்டவர்கள் இல்லை. எனவே இவர்கள் அஸ்ஹாபுல் புரூழ்: அஸபாக்களை இல்லாத சமயத்தில் பங்கை பெறுவார்கள்.\n\n7. தாய் வழி: ஜத்தா ஸஹீஹா (الجدة الصحيحة)\nதாயுடைய தாய் (أم الأم)\nதாயுடைய தாயின் தாய் (أم أم الأم)\nஎன்றத் தொடர்வரிசையில் இருந்தால் அவருக்கு ஜத்தா ஸஹீஹா என்று சொல்லப்படும். இவள் முதல் வகையினரான அஸ்ஹாபுல் புரூழ்-ல் கட்டுப்பட்டவர்கள். இவர்கள் மரணித்தவருக்கு, தாய் இல்லாத சமயத்தில் தங்களுக்குரிய சொத்தை பெறுவார்கள்.\n\n8. தாய் வழி ஜத்தா ஃபாஸிதா (الجدة الفاسدة)\nதாயுடைய தாயின் தந்தையின் தாய் (أم أب أم الأم)\nஎன்றத் தொடர்வரிசையில், இடையில் ஆண் வாரிசான தந்தை இருந்ததால் அவருக்கு ஜத்தா ஃபாஸிதா என்று சொல்லப்படும். இவர்கள் அஸ்ஹாபுல் புரூழ், அஸபாக்கள் கட்டுப்பட்டவர்கள் இல்லை. எனவே இவர்கள் அஸ்ஹாபுல் புரூழ்: அஸபாக்களை இல்லாத சமயத்தில் பங்கை பெறுவார்கள்.";

const LINK_LABEL = (l: GrandparentChainLink, lang: "ta" | "en" | "ar") =>
  l === "father" ? tx3(lang, "தந்தை", "Father", "أب") : tx3(lang, "தாய்", "Mother", "أم");

export default function SahihFasidCalc({ lang }: TopicCalcProps) {
  const [chain, setChain] = useState<GrandparentChainLink[]>(["father", "father"]);

  // Classification is instant — no estate, no Calculate step.
  const result = useMemo(() => classifyGrandparent(chain), [chain]);

  const setLink = (i: number, link: GrandparentChainLink) =>
    setChain((cs) => cs.map((x, j) => (j === i ? link : x)));

  const load = () => setChain(["mother", "father"]);
  const reset = () => setChain(["father", "father"]);

  const chainText = chain.map((l) => LINK_LABEL(l, lang)).join(" → ");
  const isGrandfather = chain[chain.length - 1] === "father";
  const consequence =
    result.consequence === "fixed-share" ? ss("sahihConsequenceFixed", lang) : ss("sahihConsequenceDistant", lang);
  const detail = tx3(
    lang,
    result.consequence === "fixed-share"
      ? isGrandfather
        ? "நிலையான பங்கு 1/6 (நெருங்கிய மீதம் பெறும் வாரிசு இல்லாதபோது மீதமும்), தந்தை இல்லாதபோது."
        : "மற்ற தகுதியுள்ள பாட்டிகளுடன் 1/6 பங்கைப் பகிர்கிறார், தாய் இல்லாதபோது."
      : "தூரத்து உறவினர் (கிளை 2) — நிலையான பங்கு, மீதம் பெறும் வாரிசு இல்லாதபோது மட்டுமே வாரிசு.",
    result.consequence === "fixed-share"
      ? isGrandfather
        ? "Fixed-share heir: 1/6 (plus the residue when there is no closer Asabah heir), when the father is absent."
        : "Shares 1/6 with the other eligible grandmothers, when the mother is absent."
      : "Dhawul Arham (distant relative), branch 2 — inherits only when no fixed-share heir and no Asabah exists.",
    result.consequence === "fixed-share"
      ? isGrandfather
        ? "وارث ذو فرض: 1/6 (مع الباقي عند عدم وجود عاصب أقرب)، عند غياب الأب."
        : "تشترك في 1/6 مع الجدات الأخريات المستحقات، عند غياب الأم."
      : "من ذوي الأرحام (الفرع 2) — يرث فقط عند عدم وجود وارث ذي فرض أو عاصب.",
  );

  return (
    <div className="ms-special-calc-body">
      <section aria-label={tx3(lang, "சங்கிலியை அமைக்கவும்", "Build the chain", "ابنِ السلسلة")}>
        <h3 className="ms-special-step-title">
          <span className="ms-special-step-num" aria-hidden="true">1</span>{" "}
          {tx3(lang, "மூதாதையர் சங்கிலியை அமைக்கவும்", "Build the grandparent chain", "ابنِ سلسلة القرابة")}
        </h3>
        <p className="ms-special-step-help">
          {tx3(
            lang,
            "கடைசி இணைப்பே அந்த மூதாதையர்: “ஆண்” என்றால் தாத்தா, “பெண்” என்றால் பாட்டி.",
            "The last link is the grandparent: “Male” means a grandfather, “Female” means a grandmother.",
            "الحلقة الأخيرة هي الجد أو الجدة: «ذكر» تعني جدًّا، و«أنثى» تعني جدةً.",
          )}
        </p>

        <div className="ms4-branch-cards">
          <BranchCard
            title={ss("sahihFathersSide", lang)}
            selected={chain[0] === "father"}
            onSelect={() => setLink(0, "father")}
            lang={lang}
          />
          <BranchCard
            title={ss("sahihMothersSide", lang)}
            selected={chain[0] === "mother"}
            onSelect={() => setLink(0, "mother")}
            lang={lang}
          />
        </div>

        {chain.slice(1).map((link, idx) => {
          const i = idx + 1;
          return (
            <div key={i}>
              <p className="ms-special-field-label">
                {tx3(lang, `இணைப்பு ${i + 1}`, `Link ${i + 1}`, `الحلقة ${i + 1}`)}
              </p>
              <div className="ms-special-seg" role="group" aria-label={tx3(lang, `இணைப்பு ${i + 1}`, `Link ${i + 1}`, `الحلقة ${i + 1}`)}>
                <button
                  type="button"
                  aria-pressed={link === "father"}
                  onClick={() => setLink(i, "father")}
                  className={`ms-special-seg-btn ${link === "father" ? "is-on" : ""}`}
                >
                  {tx3(lang, "ஆண்", "Male", "ذكر")}
                </button>
                <button
                  type="button"
                  aria-pressed={link === "mother"}
                  onClick={() => setLink(i, "mother")}
                  className={`ms-special-seg-btn ${link === "mother" ? "is-on" : ""}`}
                >
                  {tx3(lang, "பெண்", "Female", "أنثى")}
                </button>
              </div>
            </div>
          );
        })}

        <div className="ms-special-actions">
          <AddButton onClick={() => setChain((cs) => [...cs, "father"])} disabled={chain.length >= 3}>
            {ss("sahihAddLink", lang)}
          </AddButton>
          {chain.length > 2 ? (
            <RemoveButton
              onClick={() => setChain((cs) => cs.slice(0, -1))}
              label={tx3(lang, "கடைசி இணைப்பை நீக்கு", "Remove last link", "احذف الحلقة الأخيرة")}
            />
          ) : null}
        </div>

        <ChainDrawing
          links={[tx3(lang, "இறந்தவர்", "Deceased", "المتوفى"), ...chain.map((l) => LINK_LABEL(l, lang))]}
        />
        <p className="ms-special-chain-preview">{chainText}</p>
      </section>

      <div className="ms-special-actions">
        <LoadExampleButton onLoad={load} lang={lang} />
        <ResetButton onReset={reset} lang={lang} />
      </div>

      <div className="ms-special-results">
        <div className="ms4-results">
          <Badge kind={result.classification} lang={lang} />
          <p className="ms4-sahih-consequence">{consequence}</p>
          <p className="ms4-muted">
            {tx3(lang, `வகை ${result.bookCategory}`, `Category ${result.bookCategory}`, `الفئة ${result.bookCategory}`)}
            {result.dhawulArhamBranch
              ? ` — ${tx3(lang, `கிளை ${result.dhawulArhamBranch}`, `Branch ${result.dhawulArhamBranch}`, `الفرع ${result.dhawulArhamBranch}`)}`
              : null}
          </p>
          <p className="ms4-muted">{detail}</p>
          <ResultNotes notes={result.notes} scholarReasons={[]} lang={lang} />
        </div>

        <details className="ms4-show-working">
          <summary>
            {tx3(lang, "நூலின் விதி — அச்சிட்டபடி", "The book's rule — as printed", "قاعدة الكتاب — كما طُبعت")}
          </summary>
          <p className="ms4-muted">
            {tx3(
              lang,
              "நூலின் சொற்கள் (தமிழில், அச்சிட்டபடி) — சுருக்கப்படவில்லை, மாற்றப்படவில்லை.",
              "The book's own words (in Tamil, as printed) — not shortened, not changed.",
              "عبارة الكتاب حرفيًّا (بالتاميلية، كما طُبعت) — دون اختصار أو تغيير.",
            )}
          </p>
          <div className="ms4-verbatim" lang="ta">
            {SAHIH_FASID_RULE_TA}
          </div>
        </details>
      </div>
    </div>
  );
}
