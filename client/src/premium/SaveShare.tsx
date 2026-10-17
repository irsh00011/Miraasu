/** Save & Share screen: report preview + save / download / share / print actions. Reads computed results only. */
import { useEffect, useRef, useState } from "react";
import { Bookmark, Check, Download, Printer, Share2, X } from "lucide-react";
import { premiumCopy, type PremiumLang } from "@/premium/copy";

export type SaveShareRow = { name: string; percent: string; amount: string };

type Props = {
  lang: PremiumLang;
  estateLabel: string;
  estateText: string;
  rows: SaveShareRow[];
  saved: boolean;
  onSave: () => void;
  onDownload: () => void;
  onPrint: () => void;
  onDetailed: () => void;
  onNew: () => void;
  onClose: () => void;
};

export function SaveShare({ lang, estateLabel, estateText, rows, saved, onSave, onDownload, onPrint, onDetailed, onNew, onClose }: Props) {
  const t = premiumCopy[lang];
  const rtl = lang === "ar" || lang === "ur";
  const [busy, setBusy] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const headRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headRef.current?.focus();
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const doSave = () => {
    if (saved || busy) return;
    onSave();
  };

  const doDownload = () => {
    if (busy) return;
    setBusy("download");
    try {
      onDownload();
      setNote(t.downloadStarted);
    } finally {
      setBusy(null);
    }
  };

  const doShare = async () => {
    if (busy) return;
    setBusy("share");
    try {
      if (navigator.share) {
        try {
          await navigator.share({ title: "Miraasu", text: t.sharedText, url: window.location.href });
          setNote(t.sharedDone);
        } catch {
          /* dismissed — no message */
        }
        return;
      }
      try {
        await navigator.clipboard.writeText(`${t.sharedText} — ${window.location.href}`);
        setNote(t.copiedNote);
      } catch {
        /* clipboard unavailable — no message */
      }
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="pb-sheet-veil" role="dialog" aria-modal="true" aria-label={t.saveShareTitle} dir={rtl ? "rtl" : "ltr"} onClick={onClose}>
      <div className="pb-sheet" onClick={(event) => event.stopPropagation()}>
        <div className="pb-sheet-head">
          <div className="min-w-0">
            <h2 ref={headRef} tabIndex={-1} className="pb-h2 text-start outline-none">{t.saveShareTitle}</h2>
            <p className="mt-0.5 text-sm text-slate-500">{t.saveShareDesc}</p>
          </div>
          <button type="button" onClick={onClose} aria-label={t.close} className="pb-icon-btn flex-none"><X size={17} /></button>
        </div>

        <div className="pb-sheet-body">
          <section className="pb-report" aria-label={t.reportTitle}>
            <h3 className="text-[1.05rem] font-extrabold text-[#0b2a4f]">{t.reportTitle}</h3>
            <p className="mt-0.5 text-sm text-slate-500">{t.reportDesc}</p>
            <div className="pb-report-estate">
              <span>{estateLabel}</span>
              <b className="num">{estateText}</b>
            </div>
            {rows.length > 0 ? (
              <ul className="pb-report-list">
                {rows.map((row) => (
                  <li key={row.name}>
                    <span className="min-w-0 flex-1 truncate font-semibold text-slate-700">{row.name}</span>
                    <span className="num text-sm font-bold text-[#1559a6]">{row.percent}</span>
                    <b className="num text-sm text-[#0b2a4f]">{row.amount}</b>
                  </li>
                ))}
              </ul>
            ) : null}
          </section>

          <div className="pb-sheet-actions">
            <button type="button" onClick={doSave} disabled={saved || busy !== null} className="pb-btn pb-btn-save">
              {saved ? <Check size={17} /> : <Bookmark size={17} />} {saved ? t.savedLabel : t.saveCalc}
            </button>
            <button type="button" onClick={doDownload} disabled={busy !== null} className="pb-btn pb-btn-dl">
              <Download size={17} /> {t.downloadReport}
            </button>
            <button type="button" onClick={doShare} disabled={busy !== null} className="pb-btn pb-btn-share">
              <Share2 size={17} /> {t.shareResults}
            </button>
            <button type="button" onClick={onPrint} disabled={busy !== null} className="pb-btn pb-btn-print">
              <Printer size={17} /> {t.printReport}
            </button>
          </div>

          {note ? <p className="pb-sheet-note" role="status">{note}</p> : null}

          <div className="pb-sheet-foot">
            <button type="button" onClick={onDetailed} className="text-sm font-bold text-[#1559a6] hover:underline">{t.viewDetailed}</button>
            <button type="button" onClick={onNew} className="text-sm font-bold text-slate-500 hover:underline">{t.newCalc}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
