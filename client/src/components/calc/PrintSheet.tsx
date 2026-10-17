/**
 * Print-only result summary sheet. Hidden on screen; shown only when the body
 * carries the `print-summary` class inside `@media print`. The OS print dialog
 * ("Save as PDF") renders Tamil / Arabic / Urdu shaping perfectly, which
 * client-side PDF libraries cannot do.
 */
export type PrintRow = { name: string; share: string; amount: string };

type Props = {
  brand: string;
  title: string;
  dateText: string;
  estateLabel: string;
  estate: string;
  heirLabel: string;
  shareLabel: string;
  amountLabel: string;
  rows: PrintRow[];
  totalLabel: string;
  total: string;
  remainingLabel?: string;
  remaining?: string;
  noShareLabel?: string;
  noShareText?: string;
  note?: string;
  dir?: "ltr" | "rtl";
};

export function PrintSheet(props: Props) {
  return (
    <div className="ms-print-sheet" dir={props.dir ?? "ltr"} aria-hidden="true">
      <div style={{ background: "#0b2a4f", color: "#fff", borderRadius: 12, padding: "18px 22px", marginBottom: 16 }}>
        <p style={{ margin: 0, fontSize: 12, letterSpacing: "0.22em", opacity: 0.85, fontWeight: 800 }}>{props.brand}</p>
        <h1 style={{ margin: "6px 0 0", fontSize: 24 }}>{props.title}</h1>
        <p style={{ margin: "6px 0 0", fontSize: 12, opacity: 0.8 }}>{props.dateText}</p>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", border: "1px solid #d8e6f7", borderRadius: 10, padding: "10px 14px", marginBottom: 12, background: "#f4f8ff" }}>
        <span style={{ fontWeight: 700, color: "#64748b" }}>{props.estateLabel}</span>
        <strong style={{ color: "#0b2a4f" }}>{props.estate}</strong>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr>
            <th scope="col" style={{ textAlign: "start", borderBottom: "2px solid #0b2a4f", padding: "8px 6px", color: "#0b2a4f" }}>{props.heirLabel}</th>
            <th scope="col" style={{ textAlign: "start", borderBottom: "2px solid #0b2a4f", padding: "8px 6px", color: "#0b2a4f" }}>{props.shareLabel}</th>
            <th scope="col" style={{ textAlign: "end", borderBottom: "2px solid #0b2a4f", padding: "8px 6px", color: "#0b2a4f" }}>{props.amountLabel}</th>
          </tr>
        </thead>
        <tbody>
          {props.rows.map((row, index) => (
            <tr key={index}>
              <td style={{ borderBottom: "1px solid #eaf3ff", padding: "8px 6px", fontWeight: 700 }}>{row.name}</td>
              <td style={{ borderBottom: "1px solid #eaf3ff", padding: "8px 6px" }}>{row.share}</td>
              <td className="num" style={{ borderBottom: "1px solid #eaf3ff", padding: "8px 6px", textAlign: "end", fontWeight: 800, color: "#15803d" }}>{row.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, padding: "10px 14px", background: "#0b2a4f", color: "#fff", borderRadius: 10 }}>
        <span>{props.totalLabel}</span>
        <strong className="num">{props.total}</strong>
      </div>
      {props.remaining ? (
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, padding: "10px 14px", border: "1px solid #d8e6f7", borderRadius: 10 }}>
          <span>{props.remainingLabel}</span>
          <strong className="num">{props.remaining}</strong>
        </div>
      ) : null}
      {props.noShareText ? (
        <p style={{ fontSize: 12, color: "#64748b", marginTop: 12 }}>
          <strong>{props.noShareLabel}: </strong>
          {props.noShareText}
        </p>
      ) : null}

      {props.note ? <p style={{ fontSize: 12, color: "#64748b" }}>{props.note}</p> : null}
    </div>
  );
}
