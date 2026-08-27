/** Design: A simple white-and-blue Tamil-first worksheet control with large touch targets. */
/** Design: Ledger of Justice — high-contrast, touch-safe count control for every language and script direction. */
import { useEffect, useState } from "react";
import { Minus, Plus } from "lucide-react";

type HeirCounterProps = {
  emoji?: string;
  label: string;
  description?: string;
  value: number;
  onChange: (value: number) => void;
  max?: number;
  language?: "ta" | "en" | "ar";
};

export function HeirCounter({ emoji, label, description, value, onChange, max = 20, language }: HeirCounterProps) {
  const resolvedLanguage = language ?? (/[\u0B80-\u0BFF]/.test(label) ? "ta" : /[\u0600-\u06FF]/.test(label) ? "ar" : "en");
  const counterCopy = resolvedLanguage === "ta" ? { count: "எண்ணிக்கை", decrease: "குறைக்க", increase: "அதிகரிக்க" } : resolvedLanguage === "ar" ? { count: "العدد", decrease: "إنقاص", increase: "زيادة" } : { count: "count", decrease: "decrease", increase: "increase" };
  const [familySearch, setFamilySearch] = useState("");

  useEffect(() => {
    const updateSearch = (event: Event) => {
      const target = event.target;
      if (!(target instanceof HTMLInputElement)) return;
      const isFamilySearch = target.placeholder.includes("தேடுக") || target.placeholder.includes("Search:") || target.placeholder.includes("ابحث:");
      if (isFamilySearch) setFamilySearch(target.value.trim().toLocaleLowerCase());
    };
    document.addEventListener("input", updateSearch);
    return () => document.removeEventListener("input", updateSearch);
  }, []);

  const isSearchMatch = !familySearch || `${label} ${description ?? ""}`.toLocaleLowerCase().includes(familySearch);

  return (
    <div hidden={!isSearchMatch} data-family-counter className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="min-w-0">
        <p className="flex items-center gap-2 font-semibold text-slate-900">{emoji ? <span aria-hidden="true" className="text-base">{emoji}</span> : null}{label}</p>
        {description ? <p className="mt-0.5 text-xs leading-5 text-slate-500">{description}</p> : null}
      </div>
      <div className="flex shrink-0 items-center gap-2" aria-label={`${label} ${counterCopy.count}`}>
        <button
          type="button"
          onClick={() => onChange(Math.max(0, value - 1))}
          disabled={value === 0}
          className="grid size-10 place-items-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label={`${label} ${counterCopy.decrease}`}
        >
          <Minus size={17} />
        </button>
        <output className="grid size-10 place-items-center rounded-xl bg-blue-50 font-bold tabular-nums text-[#133D76]">{value}</output>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="grid size-10 place-items-center rounded-xl bg-[#133D76] text-white transition hover:bg-[#102F5E] disabled:cursor-not-allowed disabled:opacity-40"
          aria-label={`${label} ${counterCopy.increase}`}
        >
          <Plus size={17} />
        </button>
      </div>
    </div>
  );
}
