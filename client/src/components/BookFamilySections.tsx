/** Design: Full book-family coverage in short, labeled groups; every extended selection leads to a visible review state. */
import { EXTENDED_HEIR_SECTIONS, type ExtendedHeirKey, type HeirInput } from "@/lib/inheritance";
import { HeirCounter } from "@/components/HeirCounter";

type BookFamilySectionsProps = {
  heirs: HeirInput;
  onChange: (key: ExtendedHeirKey, value: number) => void;
};

export function BookFamilySections({ heirs, onChange }: BookFamilySectionsProps) {
  return (
    <div className="space-y-7">
      {EXTENDED_HEIR_SECTIONS.map((section) => (
        <section key={section.title} className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="border-b border-slate-100 pb-3">
            <p className="text-sm font-extrabold text-[#133D76]">{section.title}</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">{section.helper}</p>
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
