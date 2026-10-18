/** Design: Miraasu Scholarly Ledger — compact premium heir chip: icon + name + stepper/toggle, clear selected state. */
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

  return (
    <div className={`ms-chip ${selected ? "is-on" : ""}`} style={{ "--i": index } as React.CSSProperties}>
      {Icon ? <span aria-hidden="true" className="ms-chip-icon"><Icon size={17} strokeWidth={2.1} /></span> : null}
      <span className="ms-chip-name">{label}</span>

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
  );
}
