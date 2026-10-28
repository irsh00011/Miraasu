/** Design: Miraasu Scholarly Ledger — one member, two separate cards: the
 *  name card (icon + name) and the controls card (toggle or stepper).
 *  The grid gives every name card the same width and every controls card
 *  the same width, so names and controls each form one straight column.
 *  Tapping the name card toggles a toggle-member, exactly like tapping
 *  the whole old chip did. */
import { Check, Minus, Plus, type LucideIcon } from "lucide-react";

type HeirRowProps = {
  icon?: LucideIcon;
  label: string;
  value: number;
  onChange: (value: number) => void;
  max?: number;
  language?: "ta" | "en" | "ar" | "ur";
  /** Position in the list — drives the staggered entrance only. */
  index?: number;
};

export function HeirRow({ icon: Icon, label, value, onChange, max = 20, language = "ta", index = 0 }: HeirRowProps) {
  const copy =
    language === "en"
      ? { add: "Add", decrease: "decrease", increase: "increase" }
      : language === "ar"
        ? { add: "إضافة", decrease: "إنقاص", increase: "زيادة" }
        : language === "ur"
          ? { add: "شامل کریں", decrease: "کم کریں", increase: "بڑھائیں" }
          : { add: "சேர்", decrease: "குறைக்க", increase: "அதிகரிக்க" };
  const selected = value > 0;
  const isToggle = max === 1;

  const nameCard = (
    <>
      {Icon ? <span aria-hidden="true" className="ms-chip-icon"><Icon size={17} strokeWidth={2.1} /></span> : null}
      <span className="ms-chip-name">{label}</span>
    </>
  );

  return (
    <div className={`ms-heir-row ${selected ? "is-on" : ""}`} style={{ "--i": index } as React.CSSProperties}>
      {isToggle ? (
        <button
          type="button"
          onClick={() => onChange(selected ? 0 : 1)}
          aria-pressed={selected}
          aria-label={label}
          className="ms-name-card"
        >
          {nameCard}
        </button>
      ) : (
        <div className="ms-name-card">{nameCard}</div>
      )}

      <div className="ms-ctrl-card">
        {isToggle ? (
          <button
            type="button"
            onClick={() => onChange(selected ? 0 : 1)}
            aria-pressed={selected}
            aria-label={label}
            className="ms-chip-toggle"
          >
            {selected ? <Check size={15} strokeWidth={3} aria-hidden="true" /> : copy.add}
          </button>
        ) : (
          <div className="ms-stepper" aria-label={label}>
            <button type="button" onClick={() => onChange(Math.max(0, value - 1))} disabled={value === 0} aria-label={`${label} ${copy.decrease}`}><Minus size={16} /></button>
            <output className="num">{value}</output>
            <button type="button" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label={`${label} ${copy.increase}`}><Plus size={16} /></button>
          </div>
        )}
      </div>
    </div>
  );
}
