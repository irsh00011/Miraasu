/** Design: Miraasu Scholarly Ledger — two-option switch (simple result ↔ detailed calculation). */
type Option<T extends string> = { value: T; label: string };

export function SegmentedTabs<T extends string>({ value, options, onChange }: { value: T; options: readonly Option<T>[]; onChange: (value: T) => void }) {
  return (
    <div role="tablist" className="ms-tabs">
      {options.map((option) => (
        <button key={option.value} type="button" role="tab" aria-selected={value === option.value} onClick={() => onChange(option.value)}>
          {option.label}
        </button>
      ))}
    </div>
  );
}
