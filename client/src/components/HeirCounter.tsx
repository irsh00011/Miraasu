/** Design: A simple white-and-blue Tamil-first worksheet control with large touch targets. */
/** Design: Ledger of Justice — high-contrast, touch-safe count control for every language and script direction. */
/** Compact square/near-square tile. max=1 → whole tile toggles selection. max>1 → tile shows a mini stepper. */
import { useEffect, useState } from "react";
import { Check } from "lucide-react";

type HeirCounterProps = {
  emoji?: string;
  label: string;
  description?: string;
  searchText?: string;
  value: number;
  onChange: (value: number) => void;
  max?: number;
  language?: "ta" | "en" | "ar";
};

export function HeirCounter({ emoji, label, description, searchText, value, onChange, max = 20, language }: HeirCounterProps) {
  const resolvedLanguage = language ?? (/[\u0B80-\u0BFF]/.test(label) ? "ta" : /[\u0600-\u06FF]/.test(label) ? "ar" : "en");
  const counterCopy = resolvedLanguage === "ta" ? { count: "எண்ணிக்கை" } : resolvedLanguage === "ar" ? { count: "العدد" } : { count: "count" };
  const [familySearch, setFamilySearch] = useState("");

  useEffect(() => {
    const readFamilySearch = () => {
      const input = Array.from(document.querySelectorAll("input")).find((candidate) => {
        const placeholder = candidate.placeholder;
        return placeholder.includes("தேடுக") || placeholder.includes("Search:") || placeholder.includes("ابحث:");
      });
      setFamilySearch(input?.value.trim().toLocaleLowerCase() ?? "");
    };

    // Capturing catches keyboard, paste, autofill, and browser-driven input events before any nested component can stop them.
    document.addEventListener("input", readFamilySearch, true);
    document.addEventListener("change", readFamilySearch, true);
    readFamilySearch();
    return () => {
      document.removeEventListener("input", readFamilySearch, true);
      document.removeEventListener("change", readFamilySearch, true);
    };
  }, []);

  const isSearchMatch = !familySearch || `${label} ${description ?? ""} ${searchText ?? ""}`.toLocaleLowerCase().includes(familySearch);
  const selected = value > 0;
  const isToggle = max === 1;

  if (isToggle) {
    return (
      <button
        type="button"
        hidden={!isSearchMatch}
        data-family-counter
        onClick={() => onChange(selected ? 0 : 1)}
        aria-pressed={selected}
        aria-label={label}
        className={`relative flex aspect-square min-h-[4.25rem] flex-col items-center justify-center gap-1 rounded-2xl border-2 p-1.5 text-center transition ${selected ? "border-[#133D76] bg-blue-50 shadow-sm" : "border-slate-200 bg-white hover:border-blue-200 hover:bg-blue-50/40"}`}
      >
        {selected ? (
          <span className="absolute right-1 top-1 grid size-4 place-items-center rounded-full bg-[#133D76] text-white">
            <Check size={10} />
          </span>
        ) : null}
        {emoji ? <span aria-hidden="true" className="text-xl leading-none">{emoji}</span> : null}
        <span className="line-clamp-2 text-[11px] font-bold leading-tight text-slate-800">{label}</span>
      </button>
    );
  }

  return (
    <div
      hidden={!isSearchMatch}
      data-family-counter
      className={`flex aspect-square min-h-[4.25rem] flex-col items-center justify-between gap-1 rounded-2xl border-2 p-1.5 text-center transition ${selected ? "border-[#133D76] bg-blue-50 shadow-sm" : "border-slate-200 bg-white"}`}
    >
      {emoji ? <span aria-hidden="true" className="text-xl leading-none">{emoji}</span> : null}
      <span className="line-clamp-2 text-[11px] font-bold leading-tight text-slate-800">{label}</span>
      <div className="flex shrink-0 items-center gap-1" aria-label={`${label} ${counterCopy.count}`}>
        <label className="sr-only" htmlFor={`counter-${label}`}>{counterCopy.count}</label>
        <input id={`counter-${label}`} type="number" inputMode="numeric" min={0} max={max} value={value} onChange={(event) => onChange(Math.max(0, Math.min(max, Number(event.target.value) || 0)))} className="h-7 w-12 rounded-lg border border-slate-200 bg-white px-1 text-center text-xs font-extrabold tabular-nums text-[#133D76] outline-none focus:border-[#133D76] focus:ring-2 focus:ring-blue-100" />
      </div>
    </div>
  );
}
