/* Ambient background, cursor aura and the floating glass-cube field —
   ported from views/shell.js + app.js (CUBE_PLAN / PARTICLE_PLAN / buildCubeField). */

import { useRef, useState, type CSSProperties } from 'react';
import { PxDefs } from '@/lib/pixelio/icons';
import { isLowEndDevice } from '@/lib/pixelio/content';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { useCubeParallax } from '@/hooks/use-motion';

const BG_CURVES = [
  'M-40 210 C 320 90 700 330 1100 180 C 1280 112 1380 140 1480 112',
  'M-40 330 C 300 210 760 470 1140 300 C 1300 228 1390 262 1480 232',
  'M-40 640 C 340 540 720 790 1120 620 C 1290 548 1390 582 1480 552',
  'M-40 760 C 300 680 760 900 1160 730 C 1310 666 1400 692 1480 668',
];

const GLAWS = ['cyan', 'violet', 'pink'] as const;

export function Background() {
  return (
    <div className="bg" aria-hidden="true">
      {GLAWS.map((c) => (
        <div key={c} className={`glow glow-${c}`} />
      ))}
      <svg className="bg-curves" viewBox="0 0 1440 900" preserveAspectRatio="none">
        {BG_CURVES.map((d) => (
          <path key={d} d={d} />
        ))}
      </svg>
      <div className="grid-lines" />
      <div className="noise" />
    </div>
  );
}

export function CursorAura() {
  return <div className="cursor-aura" id="cursor-aura" aria-hidden="true" />;
}

export { PxDefs };

/* ----------------------------------------------------------------------
 * FLOATING GLASS CUBES
 * A light field of transparent 3D cubes (and a few light particles) drifts
 * across the page. Each one spins slowly on its own and glides very gently
 * with the scroll — subtle depth, never a heavy parallax.
 * -------------------------------------------------------------------- */
const CUBE_PLAN = [
  { x: 4, y: 12, s: 86, c: 'c-blue', f: -0.035, spin: 30, bob: 11, d: 0 },
  { x: 88, y: 18, s: 64, c: 'c-cyan', f: 0.045, spin: 24, bob: 9, d: -3 },
  { x: 14, y: 52, s: 46, c: 'c-violet', f: 0.055, spin: 21, bob: 8, d: -5 },
  { x: 79, y: 58, s: 96, c: 'c-pink', f: -0.05, spin: 34, bob: 13, d: -2 },
  { x: 46, y: 78, s: 38, c: 'c-cyan', f: 0.06, spin: 18, bob: 7, d: -6 },
  { x: 92, y: 84, s: 56, c: 'c-violet', f: -0.04, spin: 27, bob: 10, d: -1 },
  { x: 6, y: 86, s: 70, c: 'c-blue', f: 0.038, spin: 32, bob: 12, d: -4 },
];

const PARTICLE_PLAN = [
  { x: 24, y: 24, s: 6, c: 'rgba(37,199,255,.5)', f: 0.07, bob: 13, d: 0 },
  { x: 62, y: 16, s: 4, c: 'rgba(108,59,255,.45)', f: -0.05, bob: 11, d: -3 },
  { x: 34, y: 66, s: 5, c: 'rgba(232,59,175,.4)', f: 0.06, bob: 15, d: -6 },
  { x: 70, y: 40, s: 4, c: 'rgba(22,140,255,.45)', f: -0.06, bob: 12, d: -2 },
  { x: 88, y: 70, s: 6, c: 'rgba(37,199,255,.4)', f: 0.05, bob: 14, d: -8 },
];

export function CubeField({ perfLite }: { perfLite: boolean }) {
  const fieldRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [small] = useState(() => window.matchMedia('(max-width: 760px)').matches);
  const lite = perfLite || isLowEndDevice();

  // Skip scroll-linked style recalculations on weak or coarse-pointer devices
  useCubeParallax(fieldRef, !reduced && !lite && !small);

  const cubes = small || lite ? CUBE_PLAN.filter((_, i) => i % 2 === 0) : CUBE_PLAN;
  const dots = small || lite ? PARTICLE_PLAN.slice(0, 2) : PARTICLE_PLAN;
  const scale = small || lite ? 0.68 : 1;

  return (
    <div className="cube-field" id="cube-field" aria-hidden="true" ref={fieldRef}>
      {reduced
        ? null
        : cubes.map((c) => (
            <span
              key={`cube-${c.x}-${c.y}`}
              className={`pcube ${c.c}`}
              data-f={c.f}
              style={
                {
                  left: `${c.x}%`,
                  top: `${c.y}%`,
                  '--s': `${Math.round(c.s * scale)}px`,
                  '--spin': `${c.spin}s`,
                  '--bob': `${c.bob}s`,
                  '--d': `${c.d}s`,
                } as CSSProperties
              }
            >
              <span className="pcube-f">
                <span className="pcube-i">
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                </span>
              </span>
            </span>
          ))}
      {reduced
        ? null
        : dots.map((p) => (
            <span
              key={`dot-${p.x}-${p.y}`}
              className="particle"
              data-f={p.f}
              style={
                {
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  '--ps': `${p.s}px`,
                  '--pc': p.c,
                  '--bob': `${p.bob}s`,
                  '--d': `${p.d}s`,
                } as CSSProperties
              }
            />
          ))}
    </div>
  );
}
