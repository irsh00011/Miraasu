/** Premium redesign: confident money fields, tabular numerals, RTL-safe currency. Props unchanged. */
import type { KeyboardEvent } from "react";

type Props = {
  label: string;
  help?: string;
  value: number;
  onValueChange: (value: number) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
  size?: "xl" | "md";
};

/** ENTER moves to the next visible field in the same [data-step-fields] group; on the last field it runs onLast. */
export function advanceOnEnter(event: KeyboardEvent<HTMLInputElement>, onLast: () => void) {
  if (event.key !== "Enter") return;
  event.preventDefault();
  const container = event.currentTarget.closest("[data-step-fields]");
  const fields = container ? Array.from(container.querySelectorAll<HTMLInputElement>("input[data-field]")).filter((field) => field.offsetParent !== null) : [];
  const next = fields[fields.indexOf(event.currentTarget) + 1];
  if (next) {
    next.focus();
    next.select();
  } else {
    onLast();
  }
}

export function MoneyField({ label, help, value, onValueChange, onKeyDown, size = "md" }: Props) {
  const xl = size === "xl";
  return (
    <label className="pb-field block">
      <span className="pb-label">{label}</span>
      <span className="pb-money">
        <span aria-hidden="true" className="pb-money-currency num">₹</span>
        <input
          type="number"
          inputMode="decimal"
          min="0"
          data-field
          value={value || ""}
          onChange={(event) => onValueChange(Number(event.target.value))}
          onKeyDown={onKeyDown}
          placeholder="0"
          className={`pb-input num no-spin ${xl ? "pb-input-xl" : ""}`}
        />
      </span>
      {help ? <span className="pb-help">{help}</span> : null}
    </label>
  );
}
