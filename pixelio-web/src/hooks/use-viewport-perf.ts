import { useEffect } from 'react';

const SECTIONS = '.hero, .marquee, #services, #work, #about, #contact';

/**
 * Port of `initViewportPerformance()`:
 *  - `body.tab-hidden` while the tab is in the background,
 *  - `.offscreen` on sections that scroll out of view (CSS uses it to pause
 *    their infinite animations, and the hero carousel skips hidden frames),
 *  - a runtime FPS guard that steps the page down to `perf-lite` when an
 *    underpowered GPU drops below ~38 FPS over a 28-frame window.
 */
export function useViewportPerformance(onPerfLite: () => void): void {
  useEffect(() => {
    const onVisibility = () => {
      document.body.classList.toggle('tab-hidden', document.hidden);
    };
    document.addEventListener('visibilitychange', onVisibility);

    let io: IntersectionObserver | null = null;
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            entry.target.classList.toggle('offscreen', !entry.isIntersecting);
          });
        },
        { rootMargin: '160px 0px' },
      );
      document.querySelectorAll(SECTIONS).forEach((sec) => io?.observe(sec));
    }

    const isLite = () => document.documentElement.classList.contains('perf-lite');
    let raf = 0;
    let startTimer = 0;

    if (!isLite() && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      let samples = 0;
      let slowFrames = 0;
      let last = performance.now();

      const probe = (now: number) => {
        const dt = now - last;
        last = now;
        // Ignore tab-switch spikes (> 250ms)
        if (dt > 0 && dt < 250) {
          samples++;
          if (dt > 28) slowFrames++;
        }
        if (samples < 28) {
          raf = requestAnimationFrame(probe);
        } else if (slowFrames >= 12) {
          document.documentElement.classList.add('perf-lite');
          document.body.classList.remove('has-pointer');
          onPerfLite();
        }
      };

      startTimer = window.setTimeout(() => {
        last = performance.now();
        raf = requestAnimationFrame(probe);
      }, 900);
    }

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      io?.disconnect();
      window.clearTimeout(startTimer);
      cancelAnimationFrame(raf);
    };
  }, [onPerfLite]);
}
