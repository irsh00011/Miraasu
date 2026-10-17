/** Premium redesign: saved calculations, local to this device. Props unchanged. */
import { Clock3, FileText, Plus, Trash2 } from "lucide-react";
import type { SavedCalculation } from "@/lib/localHistory";

type Props = {
  kicker: string;
  title: string;
  records: SavedCalculation[];
  formatMoney: (value: number) => string;
  formatDate: (value: string) => string;
  countText: (count: number) => string;
  onOpen: (record: SavedCalculation) => void;
  onDelete: (id: string) => void;
  onClear?: () => void;
  onNew: () => void;
  text: { clear: string; deleteLabel: string; emptyTitle: string; emptyBody: string; newLabel: string };
};

export function HistoryView({ kicker, title, records, formatMoney, formatDate, countText, onOpen, onDelete, onClear, onNew, text }: Props) {
  return (
    <section className="pb-rise">
      <div className="flex items-end justify-between gap-3 border-b border-[#d8e6f7] pb-4">
        <div>
          <p className="pb-kicker">{kicker}</p>
          <h1 className="pb-h1 mt-1 text-[1.55rem]">{title}</h1>
        </div>
        {records.length > 0 && onClear ? (
          <button type="button" onClick={onClear} className="inline-flex min-h-10 items-center gap-2 rounded-xl px-3 text-sm font-bold text-slate-500 hover:text-rose-700"><Trash2 size={16} /> {text.clear}</button>
        ) : null}
      </div>

      {records.length === 0 ? (
        <div className="py-8 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#eaf3ff] text-[#1559a6]"><Clock3 size={22} /></div>
          <h2 className="mt-4 text-lg font-extrabold text-[#0b2a4f]">{text.emptyTitle}</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">{text.emptyBody}</p>
          <button type="button" onClick={onNew} className="pb-btn pb-btn-primary mt-6 min-h-11! text-sm!"><Plus size={17} /> {text.newLabel}</button>
        </div>
      ) : (
        <div className="mt-5 grid gap-2.5">
          {records.map((record) => (
            <article key={record.id} className="pb-card flex items-center gap-3 px-4 py-3">
              <div className="grid h-10 w-10 flex-none place-items-center rounded-xl bg-[#eaf3ff] text-[#1559a6]"><FileText size={20} /></div>
              <button type="button" onClick={() => onOpen(record)} className="min-w-0 flex-1 text-start">
                <p className="num truncate text-lg font-extrabold text-[#0b2a4f]">{formatMoney(record.netEstate)}</p>
                <p className="mt-0.5 truncate text-xs text-slate-500">{formatDate(record.createdAt)} · {countText(record.totalHeirs)}</p>
              </button>
              <button type="button" onClick={() => onDelete(record.id)} className="pb-icon-btn h-10! w-10! hover:text-rose-700" aria-label={text.deleteLabel}><Trash2 size={17} /></button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
