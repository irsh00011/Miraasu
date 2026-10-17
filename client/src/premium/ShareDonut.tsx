/** Animated SVG donut of the share distribution. Purely presentational — reads computed rows. */
import { useEffect, useState } from "react";

export type DonutSlice = { label: string; percent: number; amount: string };

const PALETTE = ["#0b2a4f", "#1559a6", "#1769ff", "#5c94d6", "#9fc5f0", "#d8e9fa"];

export function ShareDonut({ slices, centerLabel, centerValue, size = 210 }: {
  slices: DonutSlice[];
  centerLabel: string;
  centerValue: string;
  size?: number;
}) {
  const [animate, setAnimate] = useState(false);
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { setAnimate(true); return; }
    const t = window.setTimeout(() => setAnimate(true), 60);
    return () => window.clearTimeout(t);
  }, []);

  const total = slices.reduce((s, x) => s + x.percent, 0) || 1;
  const R = 80;
  const C = 2 * Math.PI * R;
  let offset = 25; // start at top

  return (
    <div className="pb-donut-wrap">
      <div className="relative flex-none" style={{ width: size, height: size }}>
        <svg viewBox="0 0 200 200" width={size} height={size} className="pb-donut-svg" role="img" aria-label={centerLabel}>
          <circle cx="100" cy="100" r={R} fill="none" stroke="#eaf3ff" strokeWidth="26" />
          {slices.map((slice, i) => {
            const frac = slice.percent / total;
            const dash = `${(animate ? frac * C : 0).toFixed(2)} ${C.toFixed(2)}`;
            const dashOffset = (-offset * C / 100).toFixed(2);
            offset += frac * 100;
            return (
              <circle
                key={slice.label}
                className="pb-seg-arc"
                cx="100" cy="100" r={R} fill="none"
                stroke={PALETTE[i % PALETTE.length]}
                strokeWidth="26"
                strokeDasharray={dash}
                strokeDashoffset={dashOffset}
                strokeLinecap="butt"
              >
                <title>{`${slice.label} — ${slice.percent.toFixed(2)}% — ${slice.amount}`}</title>
              </circle>
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="num text-lg font-extrabold text-[#0b2a4f] leading-tight px-8">{centerValue}</span>
          <span className="mt-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">{centerLabel}</span>
        </div>
      </div>
      <ul className="pb-legend" aria-label={centerLabel}>
        {slices.map((slice, i) => (
          <li className="pb-legend-row" key={slice.label}>
            <span className="pb-legend-dot" style={{ background: PALETTE[i % PALETTE.length] }} aria-hidden="true" />
            <span className="min-w-0 flex-1 truncate font-semibold text-slate-700">{slice.label}</span>
            <span className="pb-legend-meta num">
              <b>{slice.percent.toFixed(2)}%</b>
              <span>{slice.amount}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
