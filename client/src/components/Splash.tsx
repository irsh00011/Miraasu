/**
 * Splash — Miraasu entry screen.
 *
 * Full blue background, the medium-big Arabic word مِيرَاث slowly popping
 * up in the centre, and a very small English about-line underneath. Then
 * it hands off to the welcome screen. Frontend only — no routing, app
 * state, or calculation logic is touched here.
 */
import { useEffect, useRef, useState } from "react";

type SplashProps = {
  /** Called once the splash has finished and should hand off to welcome. */
  onComplete: () => void;
};

/** How long the splash stays on screen (ms). Short enough to never feel like a loader. */
const SPLASH_MS = 2300;
/** Exit fade length (ms) — kept in sync with the CSS opacity transition. */
const EXIT_MS = 320;

export default function Splash({ onComplete }: SplashProps) {
  const [leaving, setLeaving] = useState(false);
  const completeRef = useRef(onComplete);
  completeRef.current = onComplete;

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Reduced-motion users get a brief static splash that hands off quickly.
    const total = reduced ? 500 : SPLASH_MS;
    const fadeTimer = window.setTimeout(() => setLeaving(true), Math.max(0, total - (reduced ? 0 : EXIT_MS)));
    const doneTimer = window.setTimeout(() => completeRef.current(), total);
    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(doneTimer);
    };
  }, []);

  return (
    <section
      className={`ent-splash${leaving ? " is-leaving" : ""}`}
      aria-label="Miraasu — Islamic Inheritance Calculator"
    >
      <div className="ent-splash-inner">
        <h1 className="ent-splash-arabic" lang="ar">مِيرَاث</h1>
        <p className="ent-splash-about">Islamic inheritance shares, the Qur&apos;anic way.</p>
      </div>
    </section>
  );
}
