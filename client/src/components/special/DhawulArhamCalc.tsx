/**
 * 1. Dhawul Arham — four-branch hierarchy (book §4.1, p. 279).
 * Branch cards 1–4 with their members; claimants added per branch + degree;
 * the winning branch is highlighted, blocked branches shown as excluded.
 */
import { useState } from "react";
import {
  calculateDhawulArham,
  type DhawulArhamClaimant,
} from "@/lib/specialMethods";
import type { HeirInput } from "@/lib/inheritance";
import { errEstate, errHeirsOrClaimants, fmt, tBranchItems, tBranchTitle, tHint, tx3, type TopicCalcProps } from "./types";
import { heirLabel, preloadHeirs } from "./heirMeta";
import {
  AddButton,
  CalcButton,
  CalcError,
  ExcludedList,
  FinalAnswer,
  HeirPicker,
  HeldLine,
  LoadExampleButton,
  MoneyField,
  RemoveButton,
  ResetButton,
  ResultNotes,
  ResultTable,
  StepHeading,
  Stepper,
} from "./shared";

const BRANCH_NO = [1, 2, 3, 4] as const;

type ClaimantForm = { label: string; branch: 1 | 2 | 3 | 4; degree: number; sex: "male" | "female"; count: number };

const defaultClaimants = (lang: TopicCalcProps["lang"]): ClaimantForm[] => [
  { label: tx3(lang, "மகளின் மகன்", "Daughter's son", "ابن البنت"), branch: 1, degree: 1, sex: "male", count: 1 },
  { label: tx3(lang, "மகளின் மகள்", "Daughter's daughter", "بنت البنت"), branch: 1, degree: 1, sex: "female", count: 1 },
];

export default function DhawulArhamCalc({ topic, lang }: TopicCalcProps) {
  const defaults = () => ({
    estate: 0,
    fixedHeirs: preloadHeirs({}),
    claimants: [],
  });
  const [estate, setEstate] = useState(0);
  const [fixedHeirs, setFixedHeirs] = useState<HeirInput>(() => preloadHeirs({}));
  const [claimants, setClaimants] = useState<ClaimantForm[]>([]);
  const [result, setResult] = useState<ReturnType<typeof calculateDhawulArham> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const compute = (e: number, fh: HeirInput, cl: ClaimantForm[]) => {
    if (!(e > 0)) { setResult(null); setError(errEstate(lang)); return; }
    const hasFixed = Object.values(fh).some((v) => (v ?? 0) > 0);
    if (!hasFixed && cl.length === 0) { setResult(null); setError(errHeirsOrClaimants(lang)); return; }
    try {
      const input = {
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
      };
      setResult(calculateDhawulArham(input));
      setError(null);
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
    compute(e, fh, cl);
  };

  const reset = () => {
    const d = defaults();
    setEstate(d.estate);
    setFixedHeirs(d.fixedHeirs);
    setClaimants(d.claimants);
    setResult(null);
    setError(null);
  };

  const updateClaimant = (i: number, patch: Partial<ClaimantForm>) =>
    setClaimants((cs) => cs.map((c, j) => (j === i ? { ...c, ...patch } : c)));

  const claimedBranches = new Set(claimants.map((c) => c.branch));
  const residue = result ? result.residueShare : null;

  return (
    <div className="ms-special-calc-body">
      <p className="ms-special-hint">{tHint(topic, lang)}</p>

      <StepHeading n={1} title={tx3(lang, "சொத்து", "Estate", "التركة")} />
      <MoneyField id="dhawul-estate" label={tx3(lang, "சொத்து", "Estate", "التركة")} value={estate} onChange={setEstate} />

      <StepHeading
        n={2}
        title={tx3(lang, "நிலையான பங்கு பெறும் வாரிசுகள்", "Fixed-share heirs", "أصحاب الفروض")}
        help={tx3(
          lang,
          "இவர்கள் முதலில் தங்கள் பங்கைப் பெறுகிறார்கள்; மீதம்தான் தூரத்து உறவினர்களுக்குச் செல்கிறது.",
          "These heirs take their fixed shares first; only the residue goes to the distant relatives.",
          "هؤلاء يأخذون فروضهم أولًا، والباقي فقط يذهب إلى ذوي الأرحام.",
        )}
      />
      <HeirPicker
        heirs={fixedHeirs}
        onChange={setFixedHeirs}
        keys={["husband", "wives", "father", "mother", "paternalGrandfather", "sons", "daughters", "fullBrothers", "fullSisters", "maternalBrothers", "maternalSisters"]}
        lang={lang}
      />

      <StepHeading
        n={3}
        title={tx3(lang, "தூரத்து உறவினர்கள் — கிளை, படிநிலை", "Distant relatives — branch & degree", "ذوو الأرحام — الفرع والدرجة")}
        help={tx3(
          lang,
          "முந்தைய கிளை இருந்தால் பிந்தைய கிளைக்கு எதுவும் இல்லை; ஒரே கிளைக்குள் நெருங்கிய படிநிலையில் உள்ளவர் முழுவதையும் பெறுகிறார்.",
          "An earlier branch blocks a later one; within a branch the nearer in degree takes everything.",
          "الفرع الأقرب يحجب الفرع الأبعد، وداخل الفرع الواحد يأخذ الأقرب درجةً كل شيء.",
        )}
      />
      {/* Four-branch hierarchy cards */}
      <div className="ms-special-branch-cards" role="list">
        {(topic.branches ?? []).map((branch, i) => {
          const no = BRANCH_NO[i] ?? ((i + 1) as 1 | 2 | 3 | 4);
          const isWinner = result?.winningBranch === no;
          const isBlocked = result !== null && claimedBranches.has(no) && !isWinner;
          return (
            <article
              key={no}
              role="listitem"
              className={`ms-special-branch-card ${isWinner ? "is-winner" : ""} ${isBlocked ? "is-blocked" : ""}`}
            >
              <h4 className="ms-special-branch-title">
                {tBranchTitle(branch, lang)}
                {isWinner ? (
                  <span className="ms-special-winner-tag">
                    {tx3(lang, "வென்ற கிளை", "Winning branch", "الفرع الفائز")}
                  </span>
                ) : null}
                {isBlocked ? (
                  <span className="ms-special-blocked-tag">
                    {tx3(lang, "தடுக்கப்பட்டது", "Blocked", "محجوب")}
                  </span>
                ) : null}
              </h4>
              <ul>
                {tBranchItems(branch, lang).map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ul>
              {!claimedBranches.has(no) ? (
                <p className="ms-special-muted">
                  {tx3(lang, "இந்தக் கிளையில் உரிமை கோருபவர் யாரும் இல்லை.", "No claimant in this branch.", "لا مدّعٍ في هذا الفرع.")}
                </p>
              ) : null}
            </article>
          );
        })}
      </div>

      <fieldset className="ms-special-heirs">
        <legend className="ms-special-field-label">
          {tx3(lang, "உரிமை கோருபவர்களைச் சேர்", "Add claimants", "أضف المدّعين")}
        </legend>
        {claimants.map((c, i) => (
          <div key={i} className="ms-special-claimant">
            <input
              type="text"
              aria-label={tx3(lang, "பெயர் / உறவு", "Name / relation", "الاسم / القرابة")}
              value={c.label}
              onChange={(e) => updateClaimant(i, { label: e.target.value })}
              className="ms-special-input"
              placeholder={tx3(lang, "எ.கா. மகளின் மகன்", "e.g. Daughter's son", "مثال: ابن البنت")}
            />
            <label className="ms-special-field">
              {tx3(lang, "கிளை", "Branch", "الفرع")}
              <select
                value={c.branch}
                onChange={(e) => updateClaimant(i, { branch: Number(e.target.value) as 1 | 2 | 3 | 4 })}
                className="ms-special-input"
              >
                {BRANCH_NO.map((b) => (
                  <option key={b} value={b}>
                    {tx3(lang, `கிளை ${b}`, `Branch ${b}`, `الفرع ${b}`)}
                  </option>
                ))}
              </select>
            </label>
            <Stepper
              label={tx3(lang, "படிநிலை", "Degree", "الدرجة")}
              value={c.degree}
              onChange={(v) => updateClaimant(i, { degree: v })}
              min={1}
              max={6}
            />
            <label className="ms-special-field">
              {tx3(lang, "பாலினம்", "Sex", "الجنس")}
              <select
                value={c.sex}
                onChange={(e) => updateClaimant(i, { sex: e.target.value as "male" | "female" })}
                className="ms-special-input"
              >
                <option value="male">{tx3(lang, "ஆண்", "Male", "ذكر")}</option>
                <option value="female">{tx3(lang, "பெண்", "Female", "أنثى")}</option>
              </select>
            </label>
            <Stepper
              label={tx3(lang, "எண்ணிக்கை", "Count", "العدد")}
              value={c.count}
              onChange={(v) => updateClaimant(i, { count: v })}
              min={1}
              max={20}
            />
            <RemoveButton onClick={() => setClaimants((cs) => cs.filter((_, j) => j !== i))} label={tx3(lang, "நீக்கு", "Remove", "احذف")} />
          </div>
        ))}
        <AddButton onClick={() => setClaimants((cs) => [...cs, { label: "", branch: 1, degree: 1, sex: "male", count: 1 }])}>
          {tx3(lang, "உறவினரைச் சேர்", "Add relative", "أضف قريبًا")}
        </AddButton>
      </fieldset>

      <div className="ms-special-actions">
        <LoadExampleButton onLoad={load} lang={lang} />
        <CalcButton onClick={() => compute(estate, fixedHeirs, claimants)} lang={lang} />
        <ResetButton onReset={reset} lang={lang} />
      </div>
      <CalcError message={error} lang={lang} />

      {result ? (
        <div className="ms-special-results">
          <FinalAnswer>{result.summary}</FinalAnswer>
          {residue ? (
            <p className="ms-special-muted">
              {tx3(lang, "நிலையான பங்கு பெறும் வாரிசுகளுக்குப் பிறகு மீதம்: ", "Residue after the fixed-share heirs: ", "الباقي بعد أصحاب الفروض: ")}
              {residue.n}/{residue.d}
            </p>
          ) : null}
          {result.fixedRows.length > 0 ? (
            <ResultTable
              rows={result.fixedRows}
              lang={lang}
              estate={estate}
              title={tx3(lang, "நிலையான பங்கு / மீதம் பெறும் வாரிசுகள்", "Fixed-share / residuary heirs", "أصحاب الفروض والعصبة")}
            />
          ) : null}
          {result.distantRows.length > 0 ? (
            <ResultTable
              rows={result.distantRows}
              lang={lang}
              estate={estate}
              title={tx3(lang, "தூரத்து உறவினர்கள் — வென்ற கிளை", "Distant relatives — winning branch", "ذوو الأرحام — الفرع الفائز")}
            />
          ) : null}
          <ResultTable
            rows={result.rows}
            lang={lang}
            estate={estate}
            verifyTotal={estate}
            title={tx3(lang, "முழு பங்கீடு", "Full distribution", "التوزيع الكامل")}
          />
          <ExcludedList
            title={tx3(lang, "தடுக்கப்பட்டவர்கள் — பங்கு இல்லை", "Blocked — no share", "المحجوبون — لا حصة لهم")}
            items={result.blockedClaimants.map((b) => ({ label: b.label, rule: b.reason }))}
            lang={lang}
          />
          {result.rows.some((r) => r.key === "__held__") ? (
            <HeldLine
              label={tx3(lang, "நிறுத்தி வைக்கப்பட்டது:", "Held:", "المحجوز:")}
              amount={result.rows.find((r) => r.key === "__held__")?.amount ?? 0}
              lang={lang}
            />
          ) : null}
          <p className="ms-special-muted">
            {tx3(lang, "தகுதியுள்ள வாரிசுகள்: ", "Eligible heirs: ", "الورثة المستحقون: ")}
            {result.rows.filter((r) => r.key !== "__held__").map((r) => `${heirLabel(r.key, lang)}${r.count > 1 ? ` × ${r.count}` : ""}`).join(", ") || "—"}
          </p>
          <ResultNotes notes={result.notes} scholarReasons={result.scholarReasons} lang={lang} />
        </div>
      ) : null}
    </div>
  );
}
