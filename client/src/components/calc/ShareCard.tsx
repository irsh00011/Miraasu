/** Design: Miraasu Scholarly Ledger — one heir per row: name + share tags, amount in premium numerals. */
type Props = {
  name: string;
  count?: number;
  tag?: string;
  fraction?: string;
  percent?: string;
  amount: string;
  perPersonLabel?: string;
  perPerson?: string;
};

export function ShareCard({ name, count = 1, tag, fraction, percent, amount, perPersonLabel, perPerson }: Props) {
  return (
    <article className="ms-share premium-pop">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <h3 className="ms-share-name">{name}</h3>
          {count > 1 ? <span className="ms-tag ms-tag-count num">×{count}</span> : null}
          {tag ? <span className="ms-tag ms-tag-asaba">{tag}</span> : null}
        </div>
        <div className="ms-share-meta">
          {fraction ? <span className="ms-tag ms-tag-fraction num">{fraction}</span> : null}
          {percent ? <span className="ms-tag ms-tag-percent num">{percent}</span> : null}
        </div>
        {perPerson ? <p className="ms-share-each">{perPersonLabel}: <span className="num">{perPerson}</span></p> : null}
      </div>
      <p className="ms-share-amount num">{amount}</p>
    </article>
  );
}
