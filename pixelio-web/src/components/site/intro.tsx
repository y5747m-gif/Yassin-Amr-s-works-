/* The intro splash — particles converging, PIXELIO assembling in 3D, STUDIO
   spacing out, the gradient line, then the bar-wipe that reveals the site.
   Ported from views/shell.js (ns.intro) + app.js (initIntro / introParticles). */

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { isLowEndDevice } from '@/lib/pixelio/content';
import { useSite } from '@/site/site-context';

const TIMELINE_MS = 5250; // CSS timeline: letters → word → wipe → fade out
const LETTERS = 'PIXELIO'.split('');
const COLORS = ['#168cff', '#6c3bff', '#e83baf'];

interface Dot {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  c: string;
  a: number;
}

/** The particle field behind the logo. Returns its own stop function. */
function startParticles(canvas: HTMLCanvasElement | null): (() => void) | null {
  if (!canvas) return null;
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return null;
  const lite = isLowEndDevice();
  const dpr = lite ? 1 : Math.min(window.devicePixelRatio || 1, 1.5);
  let w = 0;
  let h = 0;
  let raf = 0;
  let stopped = false;
  const dots: Dot[] = [];

  const resize = () => {
    w = canvas.width = Math.round(window.innerWidth * dpr);
    h = canvas.height = Math.round(window.innerHeight * dpr);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
  };
  resize();
  window.addEventListener('resize', resize, { passive: true });

  const count = lite || window.innerWidth < 600 ? 36 : 90;
  const maxDist2 = ((lite ? 110 : 130) * dpr) ** 2;
  const twoPi = Math.PI * 2;

  for (let i = 0; i < count; i++) {
    dots.push({
      x: Math.random() * w,
      y: Math.random() * h,
      r: (Math.random() * 1.8 + 0.7) * dpr,
      vx: (Math.random() - 0.5) * 0.55 * dpr,
      vy: (Math.random() - 0.5) * 0.55 * dpr,
      c: COLORS[(Math.random() * COLORS.length) | 0],
      a: Math.random() * 0.55 + 0.3,
    });
  }

  const draw = () => {
    if (stopped) return;
    ctx.clearRect(0, 0, w, h);
    const centerX = w * 0.5;
    const centerY = h * 0.5;

    for (let i = 0; i < dots.length; i++) {
      const d = dots[i];
      // gentle pull toward the centre — the logo "attracts" the particles
      d.vx += (centerX - d.x) * 0.000035;
      d.vy += (centerY - d.y) * 0.000035;
      d.x += d.vx;
      d.y += d.vy;
      if (d.x < 0 || d.x > w) d.vx *= -1;
      if (d.y < 0 || d.y > h) d.vy *= -1;

      ctx.globalAlpha = d.a * 0.82;
      ctx.fillStyle = d.c;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, twoPi);
      ctx.fill();
    }

    // Batch all connecting lines into a single draw call (1 stroke vs 300+)
    ctx.globalAlpha = 0.15;
    ctx.strokeStyle = '#8fb6ff';
    ctx.lineWidth = dpr * 0.65;
    ctx.beginPath();
    for (let i = 0; i < dots.length; i++) {
      const di = dots[i];
      for (let j = i + 1; j < dots.length; j++) {
        const dj = dots[j];
        const dx = di.x - dj.x;
        const dy = di.y - dj.y;
        if (dx * dx + dy * dy < maxDist2) {
          ctx.moveTo(di.x, di.y);
          ctx.lineTo(dj.x, dj.y);
        }
      }
    }
    ctx.stroke();

    raf = requestAnimationFrame(draw);
  };
  draw();

  const stop = () => {
    if (stopped) return;
    stopped = true;
    cancelAnimationFrame(raf);
    window.removeEventListener('resize', resize);
  };
  window.setTimeout(stop, 6000);
  return stop;
}

export function Intro() {
  const { introOpen, setIntroOpen, t } = useSite();
  const [mounted, setMounted] = useState(introOpen);
  const [done, setDone] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const closed = useRef(false);
  const started = useRef(0);
  const stopParticles = useRef<(() => void) | null>(null);
  const closeRef = useRef<(natural?: boolean) => void>(() => {});

  useEffect(() => {
    if (!introOpen) {
      setMounted(false);
      return;
    }

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    started.current = performance.now();
    let removalTimer = 0;

    /* `natural` = the CSS outro already played; anything earlier is a skip and
       gets its own quick fade so the overlay never flashes back in. */
    const close = (natural = false) => {
      if (closed.current) return;
      closed.current = true;
      if (stopParticles.current) {
        stopParticles.current();
        stopParticles.current = null;
      }
      try {
        sessionStorage.setItem('twe-intro-seen', '1');
      } catch {
        /* private mode */
      }
      if (!natural && performance.now() - started.current < TIMELINE_MS - 400) setDone(true);
      setIntroOpen(false); // unlocks <body>
      removalTimer = window.setTimeout(() => setMounted(false), natural ? 0 : 700);
    };
    closeRef.current = close;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close(false);
    };
    document.addEventListener('keydown', onKey, { once: true });
    const naturalTimer = window.setTimeout(() => close(true), reduced ? 100 : TIMELINE_MS);
    if (!reduced) stopParticles.current = startParticles(canvasRef.current);

    return () => {
      document.removeEventListener('keydown', onKey);
      window.clearTimeout(naturalTimer);
      window.clearTimeout(removalTimer);
      if (stopParticles.current) stopParticles.current();
    };
  }, [introOpen, setIntroOpen]);

  if (!mounted) return null;

  return (
    <div className={done ? 'intro done' : 'intro'} id="intro" role="presentation">
      <canvas className="intro-particles" id="intro-particles" ref={canvasRef} aria-hidden="true" />
      <div className="intro-rings" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      <div className="intro-stage">
        <div className="intro-logo" aria-label="Pixelio">
          {LETTERS.map((ch, i) => (
            <span key={ch} className="il" style={{ '--i': String(i) } as CSSProperties}>
              {ch}
            </span>
          ))}
          <span className="intro-sweep" aria-hidden="true" />
        </div>
        <div className="intro-word">
          <span className="intro-designer">STUDIO</span>
          <span className="intro-line" aria-hidden="true" />
        </div>
        <p className="intro-tag" id="intro-tag">
          {t('intro.tag')}
        </p>
      </div>

      <div className="intro-bars" aria-hidden="true">
        {Array.from({ length: 6 }, (_, i) => (
          <i key={i} />
        ))}
      </div>
      <button className="intro-skip" id="intro-skip" type="button" onClick={() => closeRef.current(false)}>
        {t('intro.skip')}
      </button>
      <div className="intro-progress" aria-hidden="true">
        <i />
      </div>
    </div>
  );
}
