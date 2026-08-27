/** Design: Ledger of Justice — an open ledger within balanced arcs, used as an audit motif rather than a generic app icon. */
type LedgerBrandMarkProps = { className?: string };

export function LedgerBrandMark({ className = "size-6" }: LedgerBrandMarkProps) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path d="M11 33.5C5.4 28.5 5.4 19.5 11 14.5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M37 33.5C42.6 28.5 42.6 19.5 37 14.5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M24 15.5C20.2 12.8 15.2 12.7 11.5 15.3V32.5C15.5 29.8 20.5 30 24 33" stroke="currentColor" strokeWidth="2.75" strokeLinejoin="round" />
      <path d="M24 15.5C27.8 12.8 32.8 12.7 36.5 15.3V32.5C32.5 29.8 27.5 30 24 33" stroke="currentColor" strokeWidth="2.75" strokeLinejoin="round" />
      <path d="M17 20.5H21M27 20.5H31M17 24.5H21M27 24.5H31" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
