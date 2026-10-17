/** Premium redesign: compact square heir card — icon, name, stepper/toggle, blue selected state. Props unchanged. */
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
    <div className={`pb-fam ${selected ? "is-on" : ""}`}>
      <span className="pb-fam-check" aria-hidden="true"><Check size={12} strokeWidth={3.5} /></span>
      {Icon ? <span aria-hidden="true" className="pb-fam-icon"><Icon size={20} strokeWidth={2} /></span> : null}
      <span className="pb-fam-name">{label}</span>

      {isToggle ? (
        <button
          type="button"
          onClick={() => onChange(selected ? 0 : 1)}
          aria-pressed={selected}
          aria-label={label}
          className="pb-fam-add"
        >
          {selected ? <Check size={13} className="inline" /> : copy.add}
        </button>
      ) : (
        <div className="pb-stepper" aria-label={label}>
          <button type="button" onClick={() => onChange(Math.max(0, value - 1))} disabled={value === 0} aria-label={`${label} ${copy.decrease}`}><Minus size={12} /></button>
          <output className="num">{value}</output>
          <button type="button" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label={`${label} ${copy.increase}`}><Plus size={12} /></button>
        </div>
      )}
    </div>
  );
}
