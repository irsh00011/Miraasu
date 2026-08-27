/** Design: Ledger of Justice — an open ledger within balanced arcs, used as an audit motif rather than a generic app icon. */
type LedgerBrandMarkProps = { className?: string };

export function LedgerBrandMark({ className = "size-6" }: LedgerBrandMarkProps) {
  return (
    <span className={`worksheet-mark relative inline-grid place-items-center ${className}`} aria-hidden="true">
      <svg viewBox="0 0 32 32" fill="none" className="size-full" focusable="false">
        <path d="M4.5 7.5C7.8 5.6 11.3 5.6 14.6 7.5V25C11.3 23.7 7.8 23.7 4.5 25V7.5Z" fill="#F8FBFF" stroke="#164F86" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M17.4 7.5C20.7 5.6 24.2 5.6 27.5 7.5V25C24.2 23.7 20.7 23.7 17.4 25V7.5Z" fill="#F8FBFF" stroke="#164F86" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M7.6 12.2H11.5M9.55 9.9V14.5M20.5 11.2H24.4M20.5 15.2H24.4M22.45 9.3V17.1" stroke="#164F86" strokeWidth="1.55" strokeLinecap="round" />
        <path d="M6.2 27.2C9.5 25.7 12.4 25.7 16 27.2C19.6 25.7 22.5 25.7 25.8 27.2" stroke="#164F86" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="16" cy="6.5" r="2.15" fill="#B8892D" />
      </svg>
    </span>
  );
}
