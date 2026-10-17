/**
 * Splash — premium entry screen for Miraasu.
 *
 * Shows once when the app first loads: the logo fades and scales in, the app
 * name rises, a subtle Islamic geometric pattern and a fine frame appear, then
 * it hands off to the welcome screen. Frontend only — no routing, app state,
 * or calculation logic is touched here.
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
      <div className="ent-splash-pattern" aria-hidden="true" />
      <div className="ent-splash-frame" aria-hidden="true" />
      <div className="ent-splash-inner">
        <span className="ent-splash-glow" aria-hidden="true" />
        <img
          src="/book-cover-icon-192.png"
          alt=""
          width={192}
          height={192}
          className="ent-splash-logo"
        />
        <h1 className="ent-splash-name">Miraasu</h1>
        <p className="ent-splash-sub">Islamic Inheritance Calculator</p>
        <div className="ent-splash-loader" aria-hidden="true">
          <span />
        </div>
      </div>
    </section>
  );
}
