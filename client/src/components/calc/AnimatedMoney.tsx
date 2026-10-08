/** Premium count-up numbers: amounts tick up from zero when the result appears,
 *  with the main figures revealing first and heir rows cascading after a subtle stagger. */
import { useEffect, useRef, useState } from "react";

export const COUNT_UP_MS = 700;
export const STAGGER_MS = 70;

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Counts from 0 to `target` with an ease-out-expo curve, starting after `delay` ms.
 *  Renders the final value instantly when reduced motion is preferred. */
export function useCountUp(target: number, duration = COUNT_UP_MS, delay = 0) {
  const [value, setValue] = useState(0);
  const frame = useRef(0);
  const timer = useRef(0);

  useEffect(() => {
    if (!Number.isFinite(target) || prefersReducedMotion()) {
      setValue(Number.isFinite(target) ? target : 0);
      return;
    }
    const begin = () => {
      const start = performance.now();
      const tick = (now: number) => {
        const progress = Math.min(1, (now - start) / duration);
        const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        setValue(target * eased);
        if (progress < 1) frame.current = requestAnimationFrame(tick);
        else setValue(target);
      };
      frame.current = requestAnimationFrame(tick);
    };
    if (delay > 0) timer.current = window.setTimeout(begin, delay);
    else begin();
    return () => {
      cancelAnimationFrame(frame.current);
      window.clearTimeout(timer.current);
    };
  }, [target, duration, delay]);

  return value;
}

type Props = {
  value: number;
  money: (amount: number) => string;
  duration?: number;
  /** Milliseconds to wait before the count-up begins — used for the staggered reveal. */
  delay?: number;
};

/** Renders `money(value)` while counting up to it from zero. */
export function AnimatedMoney({ value, money, duration, delay }: Props) {
  const current = useCountUp(value, duration, delay);
  return <>{money(current)}</>;
}
