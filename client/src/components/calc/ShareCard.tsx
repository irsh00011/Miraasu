/** Design: Miraasu Scholarly Ledger — one heir per row: name + share tags, amount in premium numerals. */
import { AnimatedMoney } from "@/components/calc/AnimatedMoney";

type Props = {
  name: string;
  count?: number;
  tag?: string;
  fraction?: string;
  percent?: string;
  amount: string;
  /** When provided with `money`, the amount counts up on appear instead of rendering statically. */
  amountValue?: number;
  money?: (value: number) => string;
  /** Milliseconds to wait before the count-up begins — heir rows cascade with a stagger. */
  delayMs?: number;
  perPersonLabel?: string;
  perPerson?: string;
};

export function ShareCard({ name, count = 1, tag, fraction, percent, amount, amountValue, money, delayMs, perPersonLabel, perPerson }: Props) {
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
      <p className="ms-share-amount num">
        {amountValue !== undefined && money ? (
          <AnimatedMoney value={amountValue} money={money} delay={delayMs} />
        ) : (
          amount
        )}
      </p>
    </article>
  );
}
