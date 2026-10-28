/** Result details popup: the result page shows the result alone; the
 *  remaining detail — the no-share list, the calculation audit trace and
 *  the source book card — lives behind one button in this dialog.
 *  Backdrop click and Escape close it; body scroll locks while open. */
import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

export function ResultDetailsPopup({
  open,
  onClose,
  title,
  language = "ta",
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  language?: string;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="ms-popup-backdrop" role="presentation" onClick={onClose}>
      <div
        className="ms-popup"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        dir={language === "ar" || language === "ur" ? "rtl" : "ltr"}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="ms-popup-head">
          <h2>{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="ms-popup-close"><X size={18} /></button>
        </div>
        <div className="ms-popup-body">{children}</div>
      </div>
    </div>
  );
}
