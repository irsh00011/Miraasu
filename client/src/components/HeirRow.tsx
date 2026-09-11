/** Design: Ledger of Justice — a plain row control (icon + full name + stepper) so every relative's name is always fully readable on mobile and desktop, with no text clamping. */
import { Check } from "lucide-react";

type HeirRowProps = {
  emoji?: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  max?: number;
  language?: "ta" | "en" | "ar";
};

export function HeirRow({ emoji, label, value, onChange, max = 20, language = "ta" }: HeirRowProps) {
  const copy =
    language === "en"
      ? { add: "Add", count: "count" }
      : language === "ar"
        ? { add: "إضافة", count: "العدد" }
        : { add: "சேர்", count: "எண்ணிக்கை" };
  const selected = value > 0;
  const isToggle = max === 1;

  return (
    <div
      className={`flex min-h-[3.25rem] items-center gap-3 rounded-xl border px-3 py-2 transition ${
        selected ? "border-[#133D76] bg-blue-50" : "border-slate-200 bg-white"
      }`}
    >
      {emoji ? (
        <span aria-hidden="true" className="shrink-0 text-xl leading-none">
          {emoji}
        </span>
      ) : null}
      <span className="min-w-0 flex-1 break-words text-sm font-bold leading-snug text-slate-800">{label}</span>

      {isToggle ? (
        <button
          type="button"
          onClick={() => onChange(selected ? 0 : 1)}
          aria-pressed={selected}
          aria-label={label}
          className={`inline-flex min-h-9 shrink-0 items-center gap-1 rounded-lg px-3 text-xs font-extrabold transition ${
            selected ? "bg-[#133D76] text-white" : "border border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-blue-50"
          }`}
        >
          {selected ? <Check size={13} /> : copy.add}
        </button>
      ) : (
        <div className="flex shrink-0 items-center gap-2" aria-label={label}>
          <label className="sr-only" htmlFor={`count-${label}`}>{copy.count}</label>
          <input
            id={`count-${label}`}
            type="number"
            inputMode="numeric"
            min={0}
            max={max}
            value={value}
            onChange={(event) => onChange(Math.max(0, Math.min(max, Number(event.target.value) || 0)))}
            className="h-9 w-16 rounded-lg border border-slate-200 bg-white px-2 text-center text-sm font-extrabold tabular-nums text-[#133D76] outline-none focus:border-[#133D76] focus:ring-4 focus:ring-blue-100"
          />
        </div>
      )}
    </div>
  );
}
