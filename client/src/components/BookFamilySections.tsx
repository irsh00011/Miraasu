/** Design: Full book-family coverage in short, labeled groups; every extended selection leads to a visible review state. */
import { EXTENDED_HEIR_SECTIONS, type ExtendedHeirKey, type HeirInput } from "@/lib/inheritance";
import { HeirCounter } from "@/components/HeirCounter";
import { RotateCcw } from "lucide-react";

type BookFamilySectionsProps = {
  heirs: HeirInput;
  onChange: (key: ExtendedHeirKey, value: number) => void;
  query: string;
  onReset: (keys: ExtendedHeirKey[]) => void;
};

export function BookFamilySections({ heirs, onChange, query, onReset }: BookFamilySectionsProps) {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const sections = EXTENDED_HEIR_SECTIONS
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => !normalizedQuery || `${section.title} ${section.helper} ${item.label} ${item.description}`.toLocaleLowerCase().includes(normalizedQuery)),
    }))
    .filter((section) => section.items.length > 0);

  if (sections.length === 0) {
    return <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">இந்தத் தேடலுக்கு பொருத்தமான உறவு இல்லை.</p>;
  }

  return (
    <div className="space-y-7">
      {sections.map((section) => (
        <section key={section.title} className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
            <div><p className="text-sm font-extrabold text-[#133D76]">{section.title}</p><p className="mt-1 text-xs leading-5 text-slate-500">{section.helper}</p></div>
            <button type="button" onClick={() => onReset(section.items.map((item) => item.key))} className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-xl px-2 text-xs font-bold text-slate-500 hover:bg-slate-100 hover:text-[#133D76]" aria-label={`${section.title} உறவுகளை அழிக்க`}><RotateCcw size={15} /> அழி</button>
          </div>
          <div className="mt-3 grid gap-3">
            {section.items.map((item) => (
              <HeirCounter
                key={item.key}
                emoji={item.emoji}
                label={item.label}
                description={item.description}
                value={heirs[item.key] ?? 0}
                onChange={(value) => onChange(item.key, value)}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
