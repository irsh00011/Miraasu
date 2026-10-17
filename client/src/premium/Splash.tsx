/** Premium splash: الميراث reveal on deep navy with a subtle geometric pattern. Auto-dismisses. */
import { useEffect, useState } from "react";

export function Splash({ onDone, minMs = 2600 }: { onDone: () => void; minMs?: number }) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const showMs = reduce ? 400 : minMs;
    const t1 = window.setTimeout(() => setLeaving(true), showMs);
    const t2 = window.setTimeout(onDone, showMs + (reduce ? 50 : 450));
    return () => { window.clearTimeout(t1); window.clearTimeout(t2); };
  }, [onDone, minMs]);

  return (
    <div
      className="pb-splash"
      role="status"
      aria-label="Miraasu"
      style={{ opacity: leaving ? 0 : 1, transition: "opacity 0.45s ease", pointerEvents: leaving ? "none" : "auto" }}
    >
      <div className="pb-splash-ar" lang="ar" dir="rtl">الميراث</div>
      <div className="pb-splash-name">Miraasu</div>
      <div className="pb-splash-sub">Islamic Inheritance Calculator</div>
      <blockquote className="pb-splash-hadith">
        <p>Give the shares of inheritance to those who are entitled to them; whatever remains goes to the closest male relative.</p>
        <cite>Sahih al-Bukhari 6732</cite>
      </blockquote>
      <div className="pb-splash-bar" aria-hidden="true"><i /></div>
    </div>
  );
}
