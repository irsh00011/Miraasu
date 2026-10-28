/** Calculation overlay: 2-second "computing shares" animation before the result appears.
 *  The six Qur'anic fractions swirl together with the small words of the
 *  selected family members' names — each on its own orbit radius, speed
 *  and direction, staying upright while it travels. */
import type { CSSProperties } from "react";

const copy: Record<string, string> = {
  ta: "பங்குகளை கணக்கிடுகிறது…",
  en: "Calculating shares…",
  ar: "جارٍ حساب الحصص…",
  ur: "حصے شمار کیے جا رہے ہیں…",
};

const FRACTIONS = ["1/2", "1/4", "1/8", "1/3", "2/3", "1/6"];
const FRAC_RADII = ["2.2rem", "1.5rem", "2.2rem", "1.5rem", "2.2rem", "1.5rem"];
const NAME_RADII = ["1.9rem", "1.1rem", "2.4rem", "1.9rem", "1.1rem", "2.4rem", "1.9rem", "1.1rem", "2.4rem", "1.9rem"];

const swirlStyle = (index: number, radius: string, angle: number): CSSProperties => ({
  "--r": radius,
  "--a": `${angle}deg`,
  animationDuration: `${3.4 + (index % 4) * 0.4}s`,
  animationDelay: `${-index * 0.45}s`,
} as CSSProperties);

export function CalculatingOverlay({ language = "ta", names = [] }: { language?: string; names?: string[] }) {
  return (
    <div className="ms-calc-overlay" role="status" aria-live="polite">
      <div className="ms-calc-box">
        <div className="ms-calc-mix" aria-hidden="true">
          {FRACTIONS.map((fraction, index) => (
            <span
              key={fraction}
              className={`ms-calc-frac ${index % 2 === 0 ? "is-cw" : "is-ccw"}`}
              style={swirlStyle(index, FRAC_RADII[index], index * 60)}
            >
              {fraction}
            </span>
          ))}
          {names.map((name, index) => (
            <span
              key={`${name}-${index}`}
              className={`ms-calc-word ${index % 2 === 0 ? "is-ccw" : "is-cw"}`}
              style={swirlStyle(index, NAME_RADII[index % NAME_RADII.length], 30 + index * 36)}
            >
              {name}
            </span>
          ))}
        </div>
        <div className="ms-calc-bar"><span className="ms-calc-fill" /></div>
        <p className="ms-calc-text">{copy[language] ?? copy.ta}</p>
      </div>
    </div>
  );
}
