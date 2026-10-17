/** Design: Miraasu Scholarly Ledger — confident money fields, tabular numerals, RTL-safe currency. */
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
    <label className="ms-field block">
      <span className={`ms-label ${xl ? "text-sm sm:text-base" : ""}`}>{label}</span>
      <span className="ms-money">
        <span aria-hidden="true" className="ms-money-currency num text-xl">₹</span>
        <input
          type="number"
          inputMode="decimal"
          min="0"
          data-field
          value={value || ""}
          onChange={(event) => onValueChange(Number(event.target.value))}
          onKeyDown={onKeyDown}
          placeholder="0"
          className={`ms-input num no-spin ${xl ? "ms-input-xl" : "text-xl font-bold"}`}
        />
      </span>
      {help ? <span className="ms-help">{help}</span> : null}
    </label>
  );
}
