/** Design: Miraasu Scholarly Ledger — one member, one connected card: the
 *  name on one side, the toggle or stepper controls in the side corner of
 *  the same card, clear selected state. No icons on the cards. Single
 *  heirs have no separate add button: the name itself is the button and
 *  tapping it directly toggles selection. Countable heirs keep the
 *  stepper; tapping an empty card adds 1. */
import { Minus, Plus } from "lucide-react";

type HeirRowProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  max?: number;
  language?: "ta" | "en" | "ar" | "ur";
  /** Position in the list — drives the staggered entrance only. */
  index?: number;
};

export function HeirRow({ label, value, onChange, max = 20, language = "ta", index = 0 }: HeirRowProps) {
  const copy =
    language === "en"
      ? { decrease: "decrease", increase: "increase" }
      : language === "ar"
        ? { decrease: "إنقاص", increase: "زيادة" }
        : language === "ur"
          ? { decrease: "کم کریں", increase: "بڑھائیں" }
          : { decrease: "குறைக்க", increase: "அதிகரிக்க" };
  const selected = value > 0;
  const isToggle = max === 1;

  /* Direct card tap on a countable heir adds 1 when empty; the stepper
   * still changes counts from there. */
  const handleCardClick = () => {
    if (!isToggle && value === 0) onChange(1);
  };

  return (
    <div className={`ms-chip ${selected ? "is-on" : ""}`} style={{ "--i": index } as React.CSSProperties}>
      {isToggle ? (
        <button
          type="button"
          onClick={() => onChange(selected ? 0 : 1)}
          aria-pressed={selected}
          aria-label={label}
          className="ms-chip-top"
        >
          <span className="ms-chip-name">{label}</span>
        </button>
      ) : (
        <>
          <div className="ms-chip-top" onClick={handleCardClick}>
            <span className="ms-chip-name">{label}</span>
          </div>
          <div className="ms-stepper" aria-label={label}>
          <button type="button" onClick={() => onChange(Math.max(0, value - 1))} disabled={value === 0} aria-label={`${label} ${copy.decrease}`}><Minus size={16} /></button>
          <output className="num">{value}</output>
          <button type="button" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label={`${label} ${copy.increase}`}><Plus size={16} /></button>
          </div>
        </>
      )}
    </div>
  );
}
