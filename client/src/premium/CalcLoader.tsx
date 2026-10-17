/** Calculation loading overlay: staged checklist (~1.4s), then reveals the real result. Respects reduced motion. */
import { useEffect, useState } from "react";
import { Calculator, Check } from "lucide-react";
import { premiumCopy, type PremiumLang } from "@/premium/copy";

export function CalcLoader({ lang, onDone }: { lang: PremiumLang; onDone: () => void }) {
  const t = premiumCopy[lang];
  const rtl = lang === "ar" || lang === "ur";
  const [doneCount, setDoneCount] = useState(0);
  const total = t.loaderSteps.length;

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { const t0 = window.setTimeout(onDone, 250); return () => window.clearTimeout(t0); }
    const stepMs = 300;
    const timers: number[] = [];
    for (let i = 1; i <= total; i++) timers.push(window.setTimeout(() => setDoneCount(i), i * stepMs));
    timers.push(window.setTimeout(onDone, total * stepMs + 350));
    return () => timers.forEach((t0) => window.clearTimeout(t0));
  }, [onDone, total]);

  return (
    <div className="pb-loader-veil" role="status" aria-live="polite" aria-label={t.loaderTitle} dir={rtl ? "rtl" : "ltr"}>
      <div className="pb-loader-card">
        <div className="pb-loader-ring"><Calculator size={34} /></div>
        <h2 className="pb-h2">{t.loaderTitle}</h2>
        <div className="mt-4">
          {t.loaderSteps.map((step, i) => {
            const done = i < doneCount;
            const now = i === doneCount;
            return (
              <div key={step} className={`pb-check-line ${done ? "is-done" : ""} ${now && !done ? "is-now" : ""}`}>
                <span className="pb-tick" aria-hidden="true">{done ? <Check size={13} strokeWidth={3.5} /> : null}</span>
                <span>{step}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
