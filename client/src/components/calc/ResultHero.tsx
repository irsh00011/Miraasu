/** Premium redesign: result header — navy seal + title. Props unchanged. */
import { BadgeCheck } from "lucide-react";

export function ResultHero({ kicker, title, subtitle, savedNote }: { kicker?: string; title: string; subtitle?: string; savedNote?: string }) {
  return (
    <section className="pb-rise flex items-center gap-3" aria-label={title}>
      <span className="grid h-11 w-11 flex-none place-items-center rounded-2xl bg-[#0b2a4f] text-white" aria-hidden="true">
        <BadgeCheck size={24} />
      </span>
      <div className="min-w-0">
        {kicker ? <p className="pb-kicker">{kicker}</p> : null}
        <h1 className="text-[1.35rem] font-extrabold leading-tight text-[#0b2a4f]">{title}</h1>
        {subtitle ? <p className="mt-0.5 text-sm font-medium text-slate-500">{subtitle}</p> : null}
        {savedNote ? <p className="mt-0.5 text-xs font-bold text-[#15803d]">{savedNote}</p> : null}
      </div>
    </section>
  );
}
