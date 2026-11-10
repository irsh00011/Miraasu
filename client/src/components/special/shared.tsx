/**
 * Special Methods v2 — shared form + result components used by all 12
 * per-topic calculators. Blue-and-white only; mobile-first.
 */
import { useRef, useState, type ReactNode } from "react";
import { BookOpen, Calculator, Plus, RotateCcw, Trash2 } from "lucide-react";
import { SPECIAL_METHODS_PAGE_COPY, type SpecialTopic } from "@/lib/specialMethodsContent";
import { lcmOfRows, rowPercent, type SpecialRow } from "@/lib/specialMethods";
import type { HeirInput } from "@/lib/inheritance";
import { fmt, tScholar, tx3, type Lang } from "./types";
import { HEIR_LABEL, HEIR_META, heirCount } from "./heirMeta";

// ---------------------------------------------------------------------------
// Form primitives
// ---------------------------------------------------------------------------

export function StepHeading({ n, title, help }: { n: number; title: string; help?: string }) {
  return (
    <div className="ms-special-step">
      <h3 className="ms-special-step-title">
        <span className="ms-special-step-num" aria-hidden="true">{n}</span> {title}
      </h3>
      {help ? <p className="ms-special-step-help">{help}</p> : null}
    </div>
  );
}

export function MoneyField({
  id,
  label,
  value,
  onChange,
  min = 0,
  help,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  help?: string;
}) {
  return (
    <label className="ms-special-field" htmlFor={id}>
      <span className="ms-special-field-label">{label}</span>
      {help ? <span className="ms-special-field-help">{help}</span> : null}
      <span className="ms-special-money-wrap">
        <span aria-hidden="true">₹</span>
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min={min}
          step="any"
          value={Number.isFinite(value) ? value : ""}
          onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
          className="ms-special-input"
        />
      </span>
    </label>
  );
}

export function Stepper({
  label,
  value,
  onChange,
  max = 20,
  min = 0,
  disabled = false,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  max?: number;
  min?: number;
  disabled?: boolean;
}) {
  return (
    <div className="ms-special-stepper">
      <span className="ms-special-stepper-label">{label}</span>
      <span className="ms-special-stepper-controls">
        <button type="button" aria-label={`${label} −`} disabled={disabled || value <= min} onClick={() => onChange(Math.max(min, value - 1))} className="ms-special-step-btn">−</button>
        <span className="ms-special-step-value" aria-live="polite">{value}</span>
        <button type="button" aria-label={`${label} +`} disabled={disabled || value >= max} onClick={() => onChange(Math.min(max, value + 1))} className="ms-special-step-btn">+</button>
      </span>
    </div>
  );
}

export type NamesMap = Partial<Record<string, string[]>>;

function defaultName(key: string, index: number, count: number, lang: Lang): string {
  const label = lang === "ta" ? HEIR_LABEL[key]?.ta ?? key : lang === "ar" ? HEIR_LABEL[key]?.ar ?? key : HEIR_LABEL[key]?.en ?? key;
  return count > 1 ? `${label} ${index + 1}` : label;
}

/** Resize a names array to a count, filling new slots with defaults. */
export function sizedNames(prev: string[] | undefined, key: string, count: number, lang: Lang): string[] {
  const out: string[] = [];
  for (let i = 0; i < count; i++) out.push(prev?.[i] ?? defaultName(key, i, count, lang));
  return out;
}

export function HeirPicker({
  heirs,
  onChange,
  keys,
  lang,
  names,
  onNamesChange,
}: {
  heirs: HeirInput;
  onChange: (next: HeirInput) => void;
  keys: (keyof HeirInput)[];
  lang: Lang;
  names?: NamesMap;
  onNamesChange?: (next: NamesMap) => void;
}) {
  const setCount = (key: keyof HeirInput, count: number) => {
    const next = { ...heirs, [key]: count } as HeirInput;
    onChange(next);
    if (onNamesChange && names) {
      const nextNames: NamesMap = { ...names };
      if (count > 0) nextNames[key] = sizedNames(names[key], String(key), count, lang);
      else delete nextNames[key];
      onNamesChange(nextNames);
    }
  };
  return (
    <fieldset className="ms-special-heirs">
      <legend className="ms-special-field-label">{tx3(lang, "வாரிசுகள்", "Heirs", "الورثة")}</legend>
      <div className="ms-special-heir-grid">
        {keys.map((key) => {
          const meta = HEIR_META.find((m) => m.key === key);
          if (!meta) return null;
          const count = heirCount(heirs, key);
          const label = tx3(lang, meta.ta, meta.en, meta.ar);
          if (meta.single) {
            const on = count > 0;
            return (
              <div key={key} className="ms-special-heir-row">
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => setCount(key, on ? 0 : 1)}
                  className={`ms-special-single ${on ? "is-on" : ""}`}
                >
                  {label}
                </button>
                {onNamesChange && names && on ? (
                  <input
                    type="text"
                    aria-label={tx3(lang, "பெயர்", "Name", "الاسم")}
                    value={names[key]?.[0] ?? defaultName(String(key), 0, 1, lang)}
                    onChange={(e) => onNamesChange({ ...names, [key]: [e.target.value] })}
                    className="ms-special-input ms-special-name-input"
                  />
                ) : null}
              </div>
            );
          }
          return (
            <div key={key} className="ms-special-heir-row">
              <Stepper label={label} value={count} onChange={(v) => setCount(key, v)} max={key === "wives" ? 4 : 20} />
              {onNamesChange && names && count > 0 ? (
                <div className="ms-special-names">
                  {sizedNames(names[key], String(key), count, lang).map((nm, i) => (
                    <input
                      key={i}
                      type="text"
                      aria-label={`${label} ${i + 1}`}
                      value={nm}
                      onChange={(e) => {
                        const arr = sizedNames(names[key], String(key), count, lang);
                        arr[i] = e.target.value;
                        onNamesChange({ ...names, [key]: arr });
                      }}
                      className="ms-special-input ms-special-name-input"
                    />
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}

/** Display label for a result row: heir keys translate; names/creditors pass through. */
export function rowLabel(row: SpecialRow, lang: Lang): string {
  const known = HEIR_LABEL[row.key];
  if (known) return tx3(lang, known.ta, known.en, known.ar);
  if (row.key === "__held__")
    return tx3(lang, "நிறுத்தி வைக்கப்பட்டது / ஒதுக்கப்படாதது", "Held / unallocated", "محجوز / غير موزَّع");
  if (row.key === "bayt-al-mal")
    return tx3(lang, "பைத்துல் மால் (பொதுக் கருவூலம்)", "Bayt al-Mal (public treasury)", "بيت المال");
  return row.label;
}

const rowCount = (row: SpecialRow): string => (row.count > 1 ? ` × ${row.count}` : "");

// ---------------------------------------------------------------------------
// Result display
// ---------------------------------------------------------------------------

export function ResultTable({
  rows,
  lang,
  title,
  total,
  estate,
  verifyTotal,
  showDetails = true,
}: {
  rows: SpecialRow[];
  lang: Lang;
  title?: string;
  total?: number;
  /** Estate this table divides (for the step-by-step detail lines). */
  estate?: number;
  /** When set, the footer verifies rows sum exactly to this amount. */
  verifyTotal?: number;
  showDetails?: boolean;
}) {
  const shown = rows.filter((r) => r.amount > 0 || r.count > 0);
  const sum = total ?? rows.reduce((s, r) => s + r.amount, 0);
  const lcm = lcmOfRows(rows);
  const verified =
    verifyTotal !== undefined ? Math.abs(sum - verifyTotal) < 0.005 : null;
  return (
    <div className="ms-special-result-table-wrap">
      {title ? <h4 className="ms-special-result-title">{title}</h4> : null}
      {lcm > 1 ? (
        <p className="ms-special-lcm">
          {tx3(lang, "பொது மடங்கு (LCM): ", "Common base (LCM): ", "المضاعف المشترك الأصغر: ")}
          {lcm}
        </p>
      ) : null}
      <table className="ms-special-result-table">
        <thead>
          <tr>
            <th scope="col">{tx3(lang, "வாரிசு", "Heir", "الوارث")}</th>
            <th scope="col">{tx3(lang, "பங்கு", "Share", "الحصة")}</th>
            <th scope="col" className="ms-num">%</th>
            <th scope="col" className="ms-num">{tx3(lang, "தொகை", "Amount", "المبلغ")}</th>
          </tr>
        </thead>
        <tbody>
          {shown.map((row) => (
            <tr
              key={`${row.key}-${row.label}`}
              className={row.key === "__held__" ? "is-held" : row.amount === 0 ? "is-zero" : ""}
            >
              <td>
                {rowLabel(row, lang)}
                {rowCount(row)}
                {row.key === "__held__" ? (
                  <span className="ms-special-held-tag">{tx3(lang, "நிறுத்தப்பட்டது", "Held", "محجوز")}</span>
                ) : null}
                {row.note ? <span className="ms-special-row-note">{row.note}</span> : null}
              </td>
              <td>{row.fraction}</td>
              <td className="ms-num">{rowPercent(row).toFixed(2)}%</td>
              <td className="ms-num">₹{fmt(row.amount)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={3}>{tx3(lang, "மொத்தம்", "Total", "المجموع")}</td>
            <td className="ms-num">₹{fmt(sum)}</td>
          </tr>
        </tfoot>
      </table>
      {verified !== null ? (
        <p className={verified ? "ms-special-ok" : "ms-special-error"} role="status">
          {verified
            ? tx3(
                lang,
                `✓ வரிசைகளின் கூட்டுத்தொகை ₹${fmt(sum)} — சொத்துடன் சரியாகப் பொருந்துகிறது.`,
                `✓ Rows total ₹${fmt(sum)} — matches the estate exactly.`,
                `✓ مجموع الصفوف ₹${fmt(sum)} — يطابق التركة تمامًا.`,
              )
            : tx3(
                lang,
                `⚠ வரிசைகளின் கூட்டுத்தொகை ₹${fmt(sum)} — சொத்து ₹${fmt(verifyTotal ?? 0)} உடன் பொருந்தவில்லை.`,
                `⚠ Rows total ₹${fmt(sum)} — does not match the estate ₹${fmt(verifyTotal ?? 0)}.`,
                `⚠ مجموع الصفوف ₹${fmt(sum)} — لا يطابق التركة ₹${fmt(verifyTotal ?? 0)}.`,
              )}
        </p>
      ) : null}
      {showDetails && estate !== undefined && shown.length > 0 ? (
        <details className="ms-special-details">
          <summary>
            {tx3(
              lang,
              "படிப்படியாக — ஒவ்வொரு தொகையும் எப்படிக் கணக்கிடப்பட்டது",
              "Step by step — how each amount was worked out",
              // AR-REVIEW: idiomatic phrasing for the step-by-step detail heading.
              "خطوة بخطوة — كيف حُسب كل مبلغ",
            )}
          </summary>
          <ol className="ms-special-detail-list">
            {shown.map((row) => (
              <li key={`d-${row.key}-${row.label}`}>
                {rowLabel(row, lang)}
                {rowCount(row)}: {row.fraction} × ₹{fmt(estate)} = ₹{fmt(row.amount)}
                {` (${rowPercent(row).toFixed(2)}%)`}
              </li>
            ))}
          </ol>
        </details>
      ) : null}
    </div>
  );
}

export function FinalAnswer({ children }: { children: ReactNode }) {
  return <p className="ms-special-final">{children}</p>;
}

export function ScholarBanner({ topic, lang }: { topic: SpecialTopic; lang: Lang }) {
  if (!topic.scholarFlag.needed) return null;
  return (
    <div className="ms-special-scholar" role="note">
      <p className="ms-special-scholar-title">
        {tx3(lang, "அறிஞர் உறுதி தேவை", "Scholar confirmation needed", "يلزم تأكيد عالم")}
      </p>
      <p>{tScholar(topic, lang)}</p>
    </div>
  );
}

export function CalcError({ message, lang }: { message: string | null; lang: Lang }) {
  if (!message) return null;
  return (
    <p className="ms-special-error" role="alert">
      {tx3(lang, "கணக்கிட முடியவில்லை: ", "Could not calculate: ", "تعذّر الحساب: ")}
      {message}
    </p>
  );
}

export function ResultNotes({
  notes,
  scholarReasons,
  lang,
}: {
  notes: string[];
  scholarReasons: string[];
  lang: Lang;
}) {
  if (notes.length === 0 && scholarReasons.length === 0) return null;
  return (
    <div className="ms-special-notes">
      {notes.map((n, i) => (
        <p key={`n${i}`}>{n}</p>
      ))}
      {scholarReasons.map((n, i) => (
        <p key={`s${i}`} className="ms-special-note-flag">
          {tx3(lang, "கவனிக்க: ", "Note: ", "ملاحظة: ")}
          {n}
        </p>
      ))}
    </div>
  );
}

export function HeldLine({ label, amount, lang }: { label: string; amount: number; lang: Lang }) {
  return (
    <p className="ms-special-held-line">
      {label} ₹{fmt(amount)}
    </p>
  );
}

export function ExcludedList({
  title,
  items,
  lang,
}: {
  title: string;
  items: { label: string; rule: string }[];
  lang: Lang;
}) {
  if (items.length === 0) return null;
  return (
    <div className="ms-special-blocked">
      <h4 className="ms-special-result-title">{title}</h4>
      <ul>
        {items.map((x, i) => (
          <li key={i}>
            <strong>{x.label}</strong> — {x.rule}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Buttons
// ---------------------------------------------------------------------------

export function LoadExampleButton({ onLoad, lang }: { onLoad: () => void; lang: Lang }) {
  return (
    <button type="button" onClick={onLoad} className="ms-special-load-btn">
      <BookOpen size={16} />{" "}
      {lang === "ta"
        ? SPECIAL_METHODS_PAGE_COPY.loadExampleTa
        : lang === "ar"
          ? // AR-REVIEW: button label for loading the book's worked example.
            "حمّل مثال الكتاب"
          : SPECIAL_METHODS_PAGE_COPY.loadExampleEn}
    </button>
  );
}

export function CalcButton({ onClick, lang }: { onClick: () => void; lang: Lang }) {
  return (
    <button type="button" onClick={onClick} className="ms-special-calc-btn">
      <Calculator size={17} />{" "}
      {lang === "ta"
        ? SPECIAL_METHODS_PAGE_COPY.calculateTa
        : lang === "ar"
          ? "احسب"
          : SPECIAL_METHODS_PAGE_COPY.calculateEn}
    </button>
  );
}

export function ResetButton({ onReset, lang }: { onReset: () => void; lang: Lang }) {
  return (
    <button type="button" onClick={onReset} className="ms-special-load-btn">
      <RotateCcw size={16} /> {tx3(lang, "மீண்டும் தொடங்கு", "Start again", "إعادة تعيين")}
    </button>
  );
}

export function AddButton({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} className="ms-special-add-btn">
      <Plus size={15} /> {children}
    </button>
  );
}

export function RemoveButton({
  onClick,
  label,
}: {
  onClick: () => void;
  label: string;
}) {
  return (
    <button type="button" aria-label={label} onClick={onClick} className="ms-special-icon-btn">
      <Trash2 size={16} />
    </button>
  );
}

// ---------------------------------------------------------------------------
// Multi-death editor (Munasakha / simultaneous death)
// ---------------------------------------------------------------------------

export type DeathForm = {
  deceasedName: string;
  estate: number;
  heirs: HeirInput;
  names: NamesMap;
};

export function namesForHeirs(h: HeirInput, lang: Lang): NamesMap {
  const out: NamesMap = {};
  for (const m of HEIR_META) {
    const count = heirCount(h, m.key);
    if (count > 0) out[m.key] = sizedNames(undefined, String(m.key), count, lang);
  }
  return out;
}

export function cleanNames(names: NamesMap, heirs: HeirInput, lang: Lang): NamesMap {
  const out: NamesMap = {};
  for (const m of HEIR_META) {
    const count = heirCount(heirs, m.key);
    if (count > 0) out[m.key] = sizedNames(names[m.key], String(m.key), count, lang);
  }
  return out;
}

export function DeathEditor({
  death,
  index,
  lang,
  onChange,
  onRemove,
  canRemove,
  earlierNames,
  showEstate,
}: {
  death: DeathForm;
  index: number;
  lang: Lang;
  onChange: (next: DeathForm) => void;
  onRemove: () => void;
  canRemove: boolean;
  earlierNames: string[];
  showEstate: boolean;
}) {
  const listId = `earlier-names-${index}`;
  const [open, setOpen] = useState(true);
  // HeirPicker fires onChange (heirs) and onNamesChange (names) back-to-back
  // inside one stepper click, and both spread the same `death` prop — so the
  // second call would clobber the first and the stepper would silently do
  // nothing. Keep the latest form in a ref, updated synchronously, so the
  // two calls merge instead of overwriting each other.
  const latestRef = useRef(death);
  latestRef.current = death;
  const update = (next: DeathForm) => {
    latestRef.current = next;
    onChange(next);
  };
  return (
    <details className="ms-special-death" open={open} onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}>
      <summary className="ms-special-death-summary">
        <span className="ms-special-result-title">
          {tx3(lang, "மரணம்", "Death", "الوفاة")} {index + 1}
          {death.deceasedName ? ` — ${death.deceasedName}` : ""}
        </span>
        {canRemove ? (
          <span onClick={(e) => e.preventDefault()}>
            <RemoveButton onClick={onRemove} label={tx3(lang, "இந்த மரணத்தை நீக்கு", "Remove this death", "احذف هذه الوفاة")} />
          </span>
        ) : null}
      </summary>
      <label className="ms-special-field">
        {tx3(lang, "இறந்தவர் பெயர்", "Name of the deceased", "اسم المتوفى")}
        <input
          type="text"
          list={earlierNames.length > 0 ? listId : undefined}
          value={death.deceasedName}
          onChange={(e) => onChange({ ...death, deceasedName: e.target.value })}
          className="ms-special-input"
          placeholder={tx3(lang, "எ.கா. ஸலீம்", "e.g. Saleem", "مثال: سالم")}
        />
        {earlierNames.length > 0 ? (
          <datalist id={listId}>
            {earlierNames.map((n) => (
              <option key={n} value={n} />
            ))}
          </datalist>
        ) : null}
      </label>
      {showEstate ? (
        <MoneyField
          id={`death-estate-${index}`}
          label={tx3(lang, "இந்தச் சொத்து", "This estate", "هذه التركة")}
          value={death.estate}
          onChange={(v) => onChange({ ...death, estate: v })}
        />
      ) : null}
      <HeirPicker
        heirs={death.heirs}
        onChange={(h) => update({ ...latestRef.current, heirs: h, names: cleanNames(latestRef.current.names, h, lang) })}
        keys={[
          "husband",
          "wives",
          "father",
          "mother",
          "paternalGrandfather",
          "paternalGrandmothers",
          "maternalGrandmothers",
          "sons",
          "daughters",
          "fullBrothers",
          "fullSisters",
          "maternalBrothers",
          "maternalSisters",
          "paternalBrothers",
          "paternalSisters",
          "paternalUncles",
          "paternalUnclesSons",
          "sonsSons",
          "sonsDaughters",
        ]}
        lang={lang}
        names={death.names}
        onNamesChange={(n) => update({ ...latestRef.current, names: n })}
      />
    </details>
  );
}
