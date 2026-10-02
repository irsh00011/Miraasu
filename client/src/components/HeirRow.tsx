/** Design: Miraasu Scholarly Ledger — compact premium heir chip: icon + name + stepper/toggle, clear selected state. */
import { Check, Minus, Plus, type LucideIcon } from "lucide-react";

type HeirRowProps = {
  icon?: LucideIcon;
  label: string;
  value: number;
  onChange: (value: number) => void;
  max?: number;
  language?: "ta" | "en" | "ar" | "ur";
};

export function HeirRow({ icon: Icon, label, value, onChange, max = 20, language = "ta" }: HeirRowProps) {
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
    <div className={`ms-chip ${selected ? "is-on" : ""}`}>
      {Icon ? <span aria-hidden="true" className="ms-chip-icon"><Icon size={17} strokeWidth={2.1} /></span> : null}
      <span className="ms-chip-name">{label}</span>

      {isToggle ? (
        <button
          type="button"
          onClick={() => onChange(selected ? 0 : 1)}
          aria-pressed={selected}
          aria-label={label}
          className={`inline-flex min-h-8 shrink-0 items-center gap-1 rounded-lg px-2.5 text-[11px] font-extrabold transition ${
            selected ? "bg-[#164f86] text-white" : "border border-[rgba(22,79,134,0.25)] text-[#164f86] hover:bg-[#eaf2fb]"
          }`}
        >
          {selected ? <Check size={13} /> : copy.add}
        </button>
      ) : (
        <div className="ms-stepper" aria-label={label}>
          <button type="button" onClick={() => onChange(Math.max(0, value - 1))} disabled={value === 0} aria-label={`${label} ${copy.decrease}`}><Minus size={12} /></button>
          <output className="num">{value}</output>
          <button type="button" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label={`${label} ${copy.increase}`}><Plus size={12} /></button>
        </div>
      )}
    </div>
  );
}
