/**
 * 1. Dhawul Arham — distant relatives (book p. 279; cases 260–266).
 * v4 rebuild (redesign spec §2): Step 1 estate → Step 2 fixed-share heirs
 * (bottom-sheet picker) → Step 3 four big branch cards (single-select),
 * then "Add relative" bottom sheet listing only that branch's relations.
 * Result: amount cards (fixed heirs first, then the winning branch),
 * blocked claimants muted as excluded, and a small 4-branch ladder
 * highlighting the answering branch. Branches 2 and 4 carry the
 * "Not in the book" flag — no numbers are invented for them.
 * Calculation unchanged: calculateDhawulArham (existing, tested).
 */
import { useState } from "react";
import {
  calculateDhawulArham,
  type DhawulArhamClaimant,
} from "@/lib/specialMethods";
import type { HeirInput } from "@/lib/inheritance";
import { errEstate, errHeirsOrClaimants, fmt, ss, tBranchTitle, tx3, type Lang, type TopicCalcProps } from "./types";
import { hasAnyHeir, preloadHeirs } from "./heirMeta";
import {
  AddButton,
  BranchCard,
  CalcButton,
  CalcError,
  ExcludedList,
  HeirPickerSheet,
  LoadExampleButton,
  MoneyField,
  RemoveButton,
  ResetButton,
  ResultNotes,
  ResultTable,
  StepShell,
  Stepper,
} from "./shared";

type ClaimantForm = { label: string; branch: 1 | 2 | 3 | 4; degree: number; sex: "male" | "female"; count: number };

type RelationOption = { ta: string; en: string; ar: string; sex: "male" | "female"; degree: number };

const BRANCH_RELATIONS: Record<1 | 2 | 3 | 4, RelationOption[]> = {
  1: [
    { ta: "மகளின் மகன்", en: "Daughter's son", ar: "ابن البنت", sex: "male", degree: 1 },
    { ta: "மகளின் மகள்", en: "Daughter's daughter", ar: "بنت البنت", sex: "female", degree: 1 },
    { ta: "மகளின் மகனின் மகன்", en: "Daughter's son's son", ar: "ابن ابن البنت", sex: "male", degree: 2 },
    { ta: "மகளின் மகனின் மகள்", en: "Daughter's son's daughter", ar: "بنت ابن البنت", sex: "female", degree: 2 },
    { ta: "மகளின் மகளின் மகன்", en: "Daughter's daughter's son", ar: "ابن بنت البنت", sex: "male", degree: 2 },
    { ta: "மகளின் மகளின் மகள்", en: "Daughter's daughter's daughter", ar: "بنت بنت البنت", sex: "female", degree: 2 },
    { ta: "மகனின் மகளின் மகன்", en: "Son's daughter's son", ar: "ابن بنت الابن", sex: "male", degree: 2 },
    { ta: "மகனின் மகளின் மகள்", en: "Son's daughter's daughter", ar: "بنت بنت الابن", sex: "female", degree: 2 },
  ],
  2: [
    { ta: "தாயின் தந்தை", en: "Mother's father", ar: "أبو الأم", sex: "male", degree: 1 },
    { ta: "தாயின் தாய்", en: "Mother's mother", ar: "أم الأم", sex: "female", degree: 1 },
    { ta: "தந்தையின் தாயின் தந்தை", en: "Father's mother's father", ar: "أبو أم الأب", sex: "male", degree: 2 },
    { ta: "தந்தையின் தாயின் தாய்", en: "Father's mother's mother", ar: "أم أم الأب", sex: "female", degree: 2 },
  ],
  3: [
    { ta: "சகோதரனின் மகள்", en: "Brother's daughter", ar: "بنت الأخ", sex: "female", degree: 1 },
    { ta: "சகோதரியின் மகன்", en: "Sister's son", ar: "ابن الأخت", sex: "male", degree: 1 },
    { ta: "சகோதரியின் மகள்", en: "Sister's daughter", ar: "بنت الأخت", sex: "female", degree: 1 },
    { ta: "சகோதரனின் மகளின் மகன்", en: "Brother's daughter's son", ar: "ابن بنت الأخ", sex: "male", degree: 2 },
    { ta: "சகோதரனின் மகளின் மகள்", en: "Brother's daughter's daughter", ar: "بنت بنت الأخ", sex: "female", degree: 2 },
    { ta: "சகோதரியின் மகனின் மகன்", en: "Sister's son's son", ar: "ابن ابن الأخت", sex: "male", degree: 2 },
    { ta: "சகோதரியின் மகனின் மகள்", en: "Sister's son's daughter", ar: "بنت ابن الأخت", sex: "female", degree: 2 },
    { ta: "சகோதரியின் மகளின் மகன்", en: "Sister's daughter's son", ar: "ابن بنت الأخت", sex: "male", degree: 2 },
    { ta: "சகோதரியின் மகளின் மகள்", en: "Sister's daughter's daughter", ar: "بنت بنت الأخت", sex: "female", degree: 2 },
  ],
  4: [
    { ta: "தந்தையின் தாய் வழி சகோதரர்", en: "Father's maternal uncle", ar: "خال الأب", sex: "male", degree: 1 },
    { ta: "தந்தையின் தாய் வழி சகோதரி", en: "Father's maternal aunt", ar: "خالة الأب", sex: "female", degree: 1 },
    { ta: "தாயின் சகோதரர்", en: "Mother's brother", ar: "خال الأم", sex: "male", degree: 1 },
    { ta: "தாயின் சகோதரி", en: "Mother's sister", ar: "خالة الأم", sex: "female", degree: 1 },
    { ta: "தாயின் தாய் வழி சகோதரர்", en: "Mother's maternal uncle", ar: "خال أم الأم", sex: "male", degree: 2 },
    { ta: "தாயின் தாய் வழி சகோதரி", en: "Mother's maternal aunt", ar: "خالة أم الأم", sex: "female", degree: 2 },
  ],
};

const defaultClaimants = (lang: Lang): ClaimantForm[] => [
  { label: tx3(lang, "மகளின் மகன்", "Daughter's son", "ابن البنت"), branch: 1, degree: 1, sex: "male", count: 1 },
  { label: tx3(lang, "மகளின் மகள்", "Daughter's daughter", "بنت البنت"), branch: 1, degree: 1, sex: "female", count: 1 },
];

const FIXED_KEYS: (keyof HeirInput)[] = [
  "husband", "wives", "father", "mother", "sons", "daughters",
  "fullBrothers", "fullSisters", "maternalBrothers", "maternalSisters",
];

export default function DhawulArhamCalc({ topic, lang }: TopicCalcProps) {
  const [estate, setEstate] = useState(topic.preload.estate);
  const [fixedHeirs, setFixedHeirs] = useState<HeirInput>(() => preloadHeirs(topic.preload.heirs));
  const [claimants, setClaimants] = useState<ClaimantForm[]>(() => defaultClaimants(lang));
  const [branch, setBranch] = useState<1 | 2 | 3 | 4>(1);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [openStep, setOpenStep] = useState(1);
  const [result, setResult] = useState<ReturnType<typeof calculateDhawulArham> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const clearResult = () => setResult(null);

  const compute = (e: number, fh: HeirInput, cl: ClaimantForm[]) => {
    if (!(e > 0)) { setResult(null); setError(errEstate(lang)); return; }
    if (!hasAnyHeir(fh) && cl.length === 0) { setResult(null); setError(errHeirsOrClaimants(lang)); return; }
    try {
      setResult(
        calculateDhawulArham({
          estate: e,
          fixedHeirs: fh,
          claimants: cl.map(
            (c) =>
              ({
                label: c.label || tx3(lang, "தூரத்து உறவினர்", "Distant relative", "ذو رحم"),
                branch: c.branch,
                degree: c.degree,
                sex: c.sex,
                count: c.count,
              }) as DhawulArhamClaimant,
          ),
        }),
      );
      setError(null);
      setOpenStep(0);
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const load = () => {
    const e = 1000;
    const fh = preloadHeirs({ wives: 1 });
    const cl = defaultClaimants(lang);
    setEstate(e);
    setFixedHeirs(fh);
    setClaimants(cl);
    setBranch(1);
    compute(e, fh, cl);
  };

  const reset = () => {
    setEstate(topic.preload.estate);
    setFixedHeirs(preloadHeirs(topic.preload.heirs));
    setClaimants(defaultClaimants(lang));
    setBranch(1);
    setResult(null);
    setError(null);
    setOpenStep(1);
  };

  const updateClaimant = (i: number, patch: Partial<ClaimantForm>) =>
    setClaimants((cs) => cs.map((c, j) => (j === i ? { ...c, ...patch } : c)));

  const fixedCount = Object.values(fixedHeirs).reduce((s, v) => s + (v ?? 0), 0);

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
          id="dhawul-estate"
          label={ss("stepEstate", lang)}
          value={estate}
          onChange={(v) => { setEstate(v); clearResult(); }}
        />
      </StepShell>

      <StepShell
        n={2}
        title={tx3(lang, "நிலையான பங்கு பெறும் வாரிசுகள்", "Fixed-share heirs", "أصحاب الفروض")}
        summary={fixedCount > 0 ? tx3(lang, `${fixedCount} வாரிசு(கள்)`, `${fixedCount} heir(s)`, `${fixedCount} من الورثة`) : null}
        open={openStep === 2}
        onOpen={() => setOpenStep(2)}
        lang={lang}
      >
        <p className="ms4-muted">
          {tx3(
            lang,
            "இவர்கள் முதலில் தங்கள் பங்கைப் பெறுகிறார்கள்; மீதம்தான் தூரத்து உறவினர்களுக்குச் செல்கிறது.",
            "These heirs take their fixed shares first; only the residue goes to the distant relatives.",
            "هؤلاء يأخذون فروضهم أولًا، والباقي فقط يذهب إلى ذوي الأرحام.",
          )}
        </p>
        <HeirPickerSheet
          heirs={fixedHeirs}
          onChange={(h) => { setFixedHeirs(h); clearResult(); }}
          keys={FIXED_KEYS}
          lang={lang}
        />
      </StepShell>

      <StepShell
        n={3}
        title={tx3(lang, "கிளை — தூரத்து உறவினர்கள்", "Branch — distant relatives", "الفرع — ذوو الأرحام")}
        summary={claimants.length > 0 ? tx3(lang, `கிளை ${branch} · ${claimants.length} உறவினர்(கள்)`, `Branch ${branch} · ${claimants.length} relative(s)`, `الفرع ${branch} · ${claimants.length} من الأقارب`) : null}
        open={openStep === 3}
        onOpen={() => setOpenStep(3)}
        lang={lang}
      >
        <div className="ms4-branch-cards" role="group" aria-label={tx3(lang, "கிளைகள்", "Branches", "الفروع")}>
          {(topic.branches ?? []).map((b, i) => {
            const no = ((i + 1) as 1 | 2 | 3 | 4);
            return (
              <BranchCard
                key={no}
                title={tBranchTitle(b, lang)}
                sub={ss(`dhawulBranch${no}` as "dhawulBranch1" | "dhawulBranch2" | "dhawulBranch3" | "dhawulBranch4", lang)}
                selected={branch === no}
                onSelect={() => { setBranch(no); clearResult(); }}
                flag={no === 2 || no === 4 ? "Not in the book" : null}
                lang={lang}
              />
            );
          })}
        </div>
        <p className="ms4-muted">
          {tx3(
            lang,
            "முந்தைய கிளை இருந்தால் பிந்தைய கிளைக்கு எதுவும் இல்லை; ஒரே கிளைக்குள் நெருங்கிய படிநிலையில் உள்ளவர் முழுவதையும் பெறுகிறார்.",
            "An earlier branch blocks a later one; within a branch the nearer in degree takes everything.",
            "الفرع الأسبق يحجب الفرع اللاحق، وداخل الفرع الواحد يأخذ الأقرب درجةً كل شيء.",
          )}
        </p>

        {claimants.length > 0 ? (
          <div className="ms4-chosen-list">
            {claimants.map((c, i) => (
              <div key={i} className="ms4-claimant-row">
                <input
                  type="text"
                  aria-label={tx3(lang, "பெயர் / உறவு", "Name / relation", "الاسم / القرابة")}
                  value={c.label}
                  onChange={(e) => { updateClaimant(i, { label: e.target.value }); clearResult(); }}
                  className="ms-special-input"
                  placeholder={tx3(lang, "எ.கா. மகளின் மகன்", "e.g. Daughter's son", "مثال: ابن البنت")}
                />
                <div className="ms4-row-controls">
                  <span className="ms4-muted">
                    {tx3(lang, `கிளை ${c.branch}`, `Branch ${c.branch}`, `الفرع ${c.branch}`)}
                  </span>
                  <Stepper
                    label={tx3(lang, "படிநிலை", "Degree", "الدرجة")}
                    value={c.degree}
                    onChange={(v) => { updateClaimant(i, { degree: v }); clearResult(); }}
                    min={1}
                    max={6}
                  />
                  <label className="ms-special-field">
                    {tx3(lang, "பாலினம்", "Sex", "الجنس")}
                    <select
                      value={c.sex}
                      onChange={(e) => { updateClaimant(i, { sex: e.target.value as "male" | "female" }); clearResult(); }}
                      className="ms-special-input"
                    >
                      <option value="male">{tx3(lang, "ஆண்", "Male", "ذكر")}</option>
                      <option value="female">{tx3(lang, "பெண்", "Female", "أنثى")}</option>
                    </select>
                  </label>
                  <Stepper
                    label={tx3(lang, "எண்ணிக்கை", "Count", "العدد")}
                    value={c.count}
                    onChange={(v) => { updateClaimant(i, { count: v }); clearResult(); }}
                    min={1}
                    max={20}
                  />
                  <RemoveButton onClick={() => { setClaimants((cs) => cs.filter((_, j) => j !== i)); clearResult(); }} label={tx3(lang, "நீக்கு", "Remove", "احذف")} />
                </div>
              </div>
            ))}
          </div>
        ) : null}

        <div className="ms4-picker-wrap">
          <button type="button" className="ms4-add-heir-btn" onClick={() => setSheetOpen(true)} aria-expanded={sheetOpen}>
            {tx3(lang, "உறவினரைச் சேர்", "Add relative", "أضف قريبًا")}
          </button>
          {sheetOpen ? (
            <>
              <div className="ms4-sheet-backdrop" onClick={() => setSheetOpen(false)} aria-hidden="true" />
              <div className="ms4-sheet" role="dialog" aria-modal="true" aria-label={tx3(lang, "உறவினரைச் சேர்", "Add relative", "أضف قريبًا")}>
                <h4 className="ms4-sheet-title">
                  {tBranchTitle((topic.branches ?? [])[branch - 1], lang)} — {ss(`dhawulBranch${branch}` as "dhawulBranch1" | "dhawulBranch2" | "dhawulBranch3" | "dhawulBranch4", lang)}
                </h4>
                <div className="ms4-sheet-list">
                  {BRANCH_RELATIONS[branch].map((rel) => (
                    <button
                      key={rel.en}
                      type="button"
                      className="ms4-sheet-item"
                      onClick={() => {
                        setClaimants((cs) => [...cs, { label: tx3(lang, rel.ta, rel.en, rel.ar), branch, degree: rel.degree, sex: rel.sex, count: 1 }]);
                        clearResult();
                      }}
                    >
                      {tx3(lang, rel.ta, rel.en, rel.ar)}
                    </button>
                  ))}
                </div>
                <button type="button" className="ms4-sheet-close" onClick={() => setSheetOpen(false)}>
                  {tx3(lang, "மூடுக", "Close", "إغلاق")}
                </button>
              </div>
            </>
          ) : null}
        </div>
      </StepShell>

      <div className="ms-special-actions">
        <LoadExampleButton onLoad={load} lang={lang} />
        <CalcButton onClick={() => compute(estate, fixedHeirs, claimants)} lang={lang} />
        <ResetButton onReset={reset} lang={lang} />
      </div>
      <CalcError message={error} lang={lang} />

      {result ? (
        <div className="ms-special-results">
          <ResultTable
            rows={result.rows}
            lang={lang}
            estate={estate}
            verifyTotal={estate}
            title={tx3(lang, "முழு பங்கீடு", "Full distribution", "التوزيع الكامل")}
          />
          <ExcludedList
            title={tx3(lang, "தடுக்கப்பட்டவர்கள் — பங்கு இல்லை", "Excluded — no share", "المستبعدون — لا حصة لهم")}
            items={result.blockedClaimants.map((b) => ({ label: b.label, rule: b.reason }))}
            lang={lang}
          />
          <div className="ms4-ladder" aria-label={tx3(lang, "கிளை ஏணி", "Branch ladder", "سلم الفروع")}>
            {([1, 2, 3, 4] as const).map((no) => {
              const answered = result.winningBranch === no;
              return (
                <div key={no} className={`ms4-ladder-row ${answered ? "is-answered" : ""}`}>
                  <span>
                    {tBranchTitle((topic.branches ?? [])[no - 1], lang)} —{" "}
                    {ss(`dhawulBranch${no}` as "dhawulBranch1" | "dhawulBranch2" | "dhawulBranch3" | "dhawulBranch4", lang)}
                  </span>
                  <span className="ms4-ladder-status">
                    {answered ? ss("dhawulBranchAnswered", lang, { n: no }) : ss("noShare", lang)}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="ms4-muted">{ss("dhawulSplit21", lang)}</p>
          <ResultNotes notes={result.notes} scholarReasons={result.scholarReasons} lang={lang} />
        </div>
      ) : null}
    </div>
  );
}
