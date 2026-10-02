/** Design: Miraasu Scholarly Ledger — compact chip tile; max=1 toggles, max>1 shows a mini stepper. */
import { useEffect, useState } from "react";
import { Check, Minus, Plus } from "lucide-react";

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
        className={`ms-chip ${selected ? "is-on" : ""}`}
        title={description}
      >
        {emoji ? <span aria-hidden="true" className="ms-chip-emoji">{emoji}</span> : null}
        <span className="ms-chip-name">{label}</span>
        {selected ? <span className="grid size-5 flex-none place-items-center rounded-full bg-[#164f86] text-white"><Check size={11} /></span> : null}
      </button>
    );
  }

  return (
    <div hidden={!isSearchMatch} data-family-counter className={`ms-chip ${selected ? "is-on" : ""}`} title={description}>
      {emoji ? <span aria-hidden="true" className="ms-chip-emoji">{emoji}</span> : null}
      <span className="ms-chip-name">{label}</span>
      <div className="ms-stepper" aria-label={`${label} ${counterCopy.count}`}>
        <button type="button" onClick={() => onChange(Math.max(0, value - 1))} disabled={value === 0} aria-label={`${label} ${counterCopy.decrease}`}><Minus size={12} /></button>
        <output className="num">{value}</output>
        <button type="button" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label={`${label} ${counterCopy.increase}`}><Plus size={12} /></button>
      </div>
    </div>
  );
}
