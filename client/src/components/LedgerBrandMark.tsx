/** Design: Ledger of Justice — an open ledger within balanced arcs, used as an audit motif rather than a generic app icon. */
type LedgerBrandMarkProps = { className?: string };

export function LedgerBrandMark({ className = "size-6" }: LedgerBrandMarkProps) {
  return (
    <img src="/manus-storage/mirath-balance-icon-primary_62d86f73.png" alt="" className={`${className} object-contain`} />
  );
}
