/** Design: Ledger of Justice — a plain row control (icon + full name + stepper) so every relative's name is always fully readable on mobile and desktop, with no text clamping. */
import { Check, Minus, Plus } from "lucide-react";

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
      ? { add: "Add", decrease: "decrease", increase: "increase" }
      : language === "ar"
        ? { add: "إضافة", decrease: "إنقاص", increase: "زيادة" }
        : { add: "சேர்", decrease: "குறைக்க", increase: "அதிகரிக்க" };
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
        <div className="flex shrink-0 items-center gap-1.5" aria-label={label}>
          <button
            type="button"
            onClick={() => onChange(Math.max(0, value - 1))}
            disabled={value === 0}
            aria-label={`${label} ${copy.decrease}`}
            className="grid size-8 place-items-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <Minus size={13} />
          </button>
          <output className="min-w-5 text-center text-sm font-extrabold tabular-nums text-[#133D76]">{value}</output>
          <button
            type="button"
            onClick={() => onChange(Math.min(max, value + 1))}
            disabled={value >= max}
            aria-label={`${label} ${copy.increase}`}
            className="grid size-8 place-items-center rounded-lg bg-[#133D76] text-white transition hover:bg-[#102F5E] disabled:cursor-not-allowed disabled:opacity-30"
          >
            <Plus size={13} />
          </button>
        </div>
      )}
    </div>
  );
}
