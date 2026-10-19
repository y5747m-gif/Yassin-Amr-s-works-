import { useEffect } from 'react';

const TARGETS = '.reveal:not(.in), .svc:not(.in), .work-card:not(.in)';

/**
 * Port of `observeReveals()`: one IntersectionObserver adds `.in` the first
 * time a card/section enters the viewport, and a MutationObserver keeps
 * watching so nodes React mounts later (owner-added projects, language
 * switches) are picked up exactly like the innerHTML rebuilds used to be.
 */
export function useRevealObserver(): void {
  useEffect(() => {
    const nodes = () => Array.from(document.querySelectorAll<HTMLElement>(TARGETS));

    if (!('IntersectionObserver' in window)) {
      nodes().forEach((el) => el.classList.add('in'));
      return;
    }

    const seen = new WeakSet<Element>();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -5% 0px' },
    );

    const scan = () => {
      nodes().forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        if (el.dataset.delay && !el.style.getPropertyValue('--rd')) {
          el.style.setProperty('--rd', `${el.dataset.delay}ms`);
        }
        io.observe(el);
      });
    };

    scan();
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      mo.disconnect();
      io.disconnect();
    };
  }, []);
}
