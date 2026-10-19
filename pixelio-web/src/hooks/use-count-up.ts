import { useEffect, useRef, useState } from 'react';

/**
 * Port of `updateStatCount()`: eases the displayed number to `target` over
 * 600 ms with an ease-out cubic, starting from whatever is on screen.
 */
export function useCountUp(target: number, animate = true): number {
  // The vanilla page ships "0" in the markup and animates up when the
  // portfolio lands, so the count always starts from zero.
  const [value, setValue] = useState(0);
  const fromRef = useRef(0);
  const frameRef = useRef(0);

  useEffect(() => {
    if (!animate) {
      fromRef.current = target;
      setValue(target);
      return;
    }
    const start = fromRef.current;
    if (start === target) {
      setValue(target);
      return;
    }
    const t0 = performance.now();
    const tick = (now: number) => {
      const k = Math.min(1, (now - t0) / 600);
      const next = Math.round(start + (target - start) * (1 - Math.pow(1 - k, 3)));
      fromRef.current = next;
      setValue(next);
      if (k < 1) frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, animate]);

  return value;
}
