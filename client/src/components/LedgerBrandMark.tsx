/** Design: Ledger of Justice — an open ledger within balanced arcs, used as an audit motif rather than a generic app icon. */
type LedgerBrandMarkProps = { className?: string };

export function LedgerBrandMark({ className = "size-6" }: LedgerBrandMarkProps) {
  return (
    <span className={`relative inline-grid place-items-center ${className}`}><img src="/manus-storage/mirath-balance-icon-primary_62d86f73.png" alt="" className="size-full scale-125 object-contain" /><span className="absolute bottom-0 size-1.5 rounded-full bg-[#B8892D]" /></span>
  );
}
