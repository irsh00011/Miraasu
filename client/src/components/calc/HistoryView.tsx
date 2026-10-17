/** Design: Miraasu Scholarly Ledger — saved calculations, local to this device. Shared by all three languages. */
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
    <section className="page-enter">
      <div className="flex items-end justify-between gap-3 border-b border-[rgba(22,79,134,0.14)] pb-4">
        <div>
          <p className="ms-kicker">{kicker}</p>
          <h1 className="ms-h1 text-[1.55rem]!">{title}</h1>
        </div>
        {records.length > 0 && onClear ? (
          <button type="button" onClick={onClear} className="ms-btn-ghost inline-flex min-h-10 items-center gap-2 rounded-xl px-3 text-sm font-bold hover:text-rose-700!"><Trash2 size={16} /> {text.clear}</button>
        ) : null}
      </div>

      {records.length === 0 ? (
        <div className="ms-empty mt-6">
          <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#eaf2fb] text-[#164f86]"><Clock3 size={22} /></div>
          <h2 className="mt-4 text-lg font-extrabold text-slate-900">{text.emptyTitle}</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-600">{text.emptyBody}</p>
          <button type="button" onClick={onNew} className="ms-btn ms-btn-primary mt-6 min-h-11! text-sm!"><Plus size={17} /> {text.newLabel}</button>
        </div>
      ) : (
        <div className="mt-5 space-y-2.5">
          {records.map((record) => (
            <article key={record.id} className="ms-history-row">
              <div className="ms-history-icon"><FileText size={20} /></div>
              <button type="button" onClick={() => onOpen(record)} className="min-w-0 flex-1 text-start">
                <p className="num truncate text-xl font-bold text-slate-900">{formatMoney(record.netEstate)}</p>
                <p className="mt-1 truncate text-xs text-slate-500">{formatDate(record.createdAt)} · {countText(record.totalHeirs)}</p>
              </button>
              <button type="button" onClick={() => onDelete(record.id)} className="ms-icon-btn w-10! h-10! rounded-xl! hover:text-rose-700!" aria-label={text.deleteLabel}><Trash2 size={17} /></button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
