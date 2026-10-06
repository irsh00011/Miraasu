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
  note: string;
  dir?: "ltr" | "rtl";
};

export function PrintSheet(props: Props) {
  return (
    <div className="ms-print-sheet" dir={props.dir ?? "ltr"} aria-hidden="true">
      <p className="ms-ps-brand">{props.brand}</p>
      <h1 className="ms-ps-title">{props.title}</h1>
      <p className="ms-ps-date">{props.dateText}</p>

      <div className="ms-ps-estate">
        <span>{props.estateLabel}</span>
        <strong>{props.estate}</strong>
      </div>

      <table className="ms-ps-table">
        <thead>
          <tr>
            <th scope="col">{props.heirLabel}</th>
            <th scope="col">{props.shareLabel}</th>
            <th scope="col">{props.amountLabel}</th>
          </tr>
        </thead>
        <tbody>
          {props.rows.map((row, index) => (
            <tr key={index}>
              <td>{row.name}</td>
              <td>{row.share}</td>
              <td className="num">{row.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="ms-ps-total">
        <span>{props.totalLabel}</span>
        <strong className="num">{props.total}</strong>
      </div>
      {props.remaining ? (
        <div className="ms-ps-total">
          <span>{props.remainingLabel}</span>
          <strong className="num">{props.remaining}</strong>
        </div>
      ) : null}
      {props.noShareText ? (
        <p className="ms-ps-noshare">
          <strong>{props.noShareLabel}: </strong>
          {props.noShareText}
        </p>
      ) : null}

      <p className="ms-ps-note">{props.note}</p>
    </div>
  );
}
