/** Design: Full book-family coverage in short, labeled groups; every extended selection leads to a visible review state. */
import { EXTENDED_HEIR_SECTIONS, VERIFIED_EXTENDED_KEYS, type ExtendedHeirKey, type HeirInput } from "@/lib/inheritance";
import { HeirCounter } from "@/components/HeirCounter";
import { RotateCcw } from "lucide-react";

type BookFamilySectionsProps = {
  heirs: HeirInput;
  onChange: (key: ExtendedHeirKey, value: number) => void;
  query: string;
  onReset: (keys: ExtendedHeirKey[]) => void;
  language?: "ta" | "en";
};

export function BookFamilySections({ heirs, onChange, query, onReset, language = "ta" }: BookFamilySectionsProps) {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const sections = EXTENDED_HEIR_SECTIONS
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => !normalizedQuery || `${section.title} ${section.helper} ${section.titleEn} ${section.helperEn} ${item.label} ${item.description} ${item.labelEn} ${item.descriptionEn}`.toLocaleLowerCase().includes(normalizedQuery)),
    }))
    .filter((section) => section.items.length > 0);

  if (sections.length === 0) {
    return <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">{language === "en" ? "No relationship matches this search." : "இந்தத் தேடலுக்கு பொருத்தமான உறவு இல்லை."}</p>;
  }

  return (
    <div className="space-y-7">
      {sections.map((section) => {
        const automated = section.items.filter((item) => VERIFIED_EXTENDED_KEYS.has(item.key)).length;
        const reviewOnly = section.items.length - automated;
        const status = reviewOnly === 0 ? (language === "en" ? "Automatic rules" : "தானியங்கி விதிகள்") : automated === 0 ? (language === "en" ? "Scholar review" : "அறிஞர் உறுதிப்படுத்தல்") : (language === "en" ? "Rules + review" : "விதிகள் + உறுதிப்படுத்தல்");
        return (
        <section key={section.title} className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
            <div><div className="flex flex-wrap items-center gap-2"><p className="text-sm font-extrabold text-[#133D76]">{language === "en" ? section.titleEn : section.title}</p><span className={`rounded-md px-2 py-1 text-[10px] font-extrabold ${reviewOnly === 0 ? "bg-emerald-50 text-emerald-700" : automated === 0 ? "bg-amber-50 text-amber-800" : "bg-blue-50 text-[#133D76]"}`}>{status}</span></div><p className="mt-1 text-xs leading-5 text-slate-500">{language === "en" ? section.helperEn : section.helper}</p></div>
            <button type="button" onClick={() => onReset(section.items.map((item) => item.key))} className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-xl px-2 text-xs font-bold text-slate-500 hover:bg-slate-100 hover:text-[#133D76]" aria-label={language === "en" ? `Clear ${section.titleEn}` : `${section.title} உறவுகளை அழிக்க`}><RotateCcw size={15} /> {language === "en" ? "Clear" : "அழி"}</button>
          </div>
          <div className="mt-3 grid gap-3">
            {section.items.map((item) => (
              <HeirCounter
                key={item.key}
                emoji={item.emoji}
                label={language === "en" ? item.labelEn : item.label}
                description={language === "en" ? item.descriptionEn : item.description}
                value={heirs[item.key] ?? 0}
                onChange={(value) => onChange(item.key, value)}
              />
            ))}
          </div>
        </section>
        );
      })}
    </div>
  );
}
