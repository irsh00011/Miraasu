/** Premium redesign shared primitives. Frontend only. */
import type { ButtonHTMLAttributes, ReactNode } from "react";

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline" | "ghost";
  block?: boolean;
};

export function PbButton({ variant = "primary", block, className = "", children, ...rest }: BtnProps) {
  return (
    <button
      type="button"
      className={`pb-btn pb-btn-${variant} ${block ? "pb-btn-block" : ""} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export function PbDots({ total, current, label }: { total: number; current: number; label?: string }) {
  return (
    <div className="pb-dots" role="img" aria-label={label}>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={i === current ? "is-on" : ""} />
      ))}
    </div>
  );
}

export function PbSectionHead({ kicker, title, lead }: { kicker?: string; title: string; lead?: string }) {
  return (
    <div className="pb-rise">
      {kicker ? <p className="pb-kicker">{kicker}</p> : null}
      <h1 className="pb-h1 mt-1">{title}</h1>
      {lead ? <p className="pb-lead mt-2">{lead}</p> : null}
    </div>
  );
}

export function PbEmpty({ icon, title, action }: { icon?: ReactNode; title: string; action?: ReactNode }) {
  return (
    <div className="py-8 text-center">
      {icon ? <div className="mx-auto mb-3 text-slate-300">{icon}</div> : null}
      <p className="font-bold text-slate-700">{title}</p>
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  );
}
