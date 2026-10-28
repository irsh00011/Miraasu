/** Calculation overlay: 2-second smooth, simple calculator animation.
 *  A small calculator: its display counts smoothly 0 → 100 while the keys
 *  light up one after another, like keys being pressed. No swirl, no
 *  floating words — just a calculator calculating. */
import { useEffect, useState } from "react";

const copy: Record<string, string> = {
  ta: "பங்குகளை கணக்கிடுகிறது…",
  en: "Calculating shares…",
  ar: "جارٍ حساب الحصص…",
  ur: "حصے شمار کیے جا رہے ہیں…",
};

const KEYS = ["7", "8", "9", "÷", "4", "5", "6", "×", "1", "2", "3", "−", "0", ".", "=", "+"];

export function CalculatingOverlay({ language = "ta" }: { language?: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setCount(100);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / 1900);
      const eased = 1 - Math.pow(1 - p, 3);
      setCount(Math.round(eased * 100));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="ms-calc-overlay" role="status" aria-live="polite">
      <div className="ms-calc-box">
        <div className="ms-calc-machine" aria-hidden="true">
          <div className="ms-calc-display"><span className="num">{count}%</span></div>
          <div className="ms-calc-keys">
            {KEYS.map((key, index) => (
              <span key={`${key}-${index}`} className="ms-calc-key" style={{ animationDelay: `${index * 0.12}s` }}>{key}</span>
            ))}
          </div>
        </div>
        <div className="ms-calc-bar"><span className="ms-calc-fill" /></div>
        <p className="ms-calc-text">{copy[language] ?? copy.ta}</p>
      </div>
    </div>
  );
}
