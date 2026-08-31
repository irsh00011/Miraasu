/** Design: compact, touch-safe family grid control shared by all localized calculator pages. */
import { useEffect, useState } from "react";
import { Minus, Plus } from "lucide-react";

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
  const counterCopy = resolvedLanguage === "ta" ? { count: "எண்ணிக்கை", decrease: "குறைக்க", increase: "அதிகரிக்க" } : resolvedLanguage === "ar" ? { count: "العدد", decrease: "إنقاص", increase: "زيادة" } : { count: "count", decrease: "decrease", increase: "increase" };
  const [familySearch, setFamilySearch] = useState("");

  useEffect(() => {
    const readFamilySearch = () => {
      const input = Array.from(document.querySelectorAll("input")).find((candidate) => {
        const placeholder = candidate.placeholder;
        return placeholder.includes("தேடுக") || placeholder.includes("Search:") || placeholder.includes("ابحث:");
      });
      setFamilySearch(input?.value.trim().toLocaleLowerCase() ?? "");
    };
    document.addEventListener("input", readFamilySearch, true);
    document.addEventListener("change", readFamilySearch, true);
    readFamilySearch();
    return () => {
      document.removeEventListener("input", readFamilySearch, true);
      document.removeEventListener("change", readFamilySearch, true);
    };
  }, []);

  const isSearchMatch = !familySearch || `${label} ${description ?? ""} ${searchText ?? ""}`.toLocaleLowerCase().includes(familySearch);

  return (
    <div hidden={!isSearchMatch} data-family-counter className="family-counter flex min-w-0 items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm">
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 text-sm font-bold leading-5 text-slate-900">{emoji ? <span aria-hidden="true" className="text-sm">{emoji}</span> : null}<span className="truncate">{label}</span></p>
        {description ? <p className="mt-0.5 line-clamp-2 text-[11px] leading-4 text-slate-500">{description}</p> : null}
      </div>
      <div className="flex shrink-0 items-center gap-1" aria-label={`${label} ${counterCopy.count}`}>
        <button type="button" onClick={() => onChange(Math.max(0, value - 1))} disabled={value === 0} className="grid size-10 place-items-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40" aria-label={`${label} ${counterCopy.decrease}`}><Minus size={16} /></button>
        <output className="grid size-10 place-items-center rounded-lg bg-blue-50 text-sm font-bold tabular-nums text-[#133D76]">{value}</output>
        <button type="button" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} className="grid size-10 place-items-center rounded-lg bg-[#133D76] text-white transition hover:bg-[#102F5E] disabled:cursor-not-allowed disabled:opacity-40" aria-label={`${label} ${counterCopy.increase}`}><Plus size={16} /></button>
      </div>
    </div>
  );
}
