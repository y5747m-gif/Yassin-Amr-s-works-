import { useEffect, type RefObject } from 'react';

/**
 * Port of `init3DMotion()`: the cursor aura follows the pointer, the hero
 * device tilts toward it, and whichever card is under the cursor gets a soft
 * 3D tilt. Only on fine pointers, never with reduced motion or on `perf-lite`.
 *
 * Everything here writes CSS custom properties and the `.is-tilting` class
 * directly — React never manages those, so the two never fight.
 */
export function useMotion3D(enabled: boolean): void {
  useEffect(() => {
    if (!enabled) return;
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!finePointer || reduced) return;

    document.body.classList.add('has-pointer');
    const aura = document.getElementById('cursor-aura');
    const hero = document.getElementById('hero-visual');

    let frame = 0;
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let heroRect: DOMRect | null = null;
    let overHero = false;
    let activeCard: HTMLElement | null = null;
    let cardRect: DOMRect | null = null;

    const isLite = () => document.documentElement.classList.contains('perf-lite');

    const invalidateRects = () => {
      heroRect = null;
      cardRect = null;
    };

    const paintPointer = () => {
      frame = 0;
      if (isLite()) return;

      if (aura) {
        aura.style.setProperty('--mx', `${mouseX}px`);
        aura.style.setProperty('--my', `${mouseY}px`);
      }

      if (overHero && hero) {
        if (!heroRect) heroRect = hero.getBoundingClientRect();
        if (heroRect.width > 0 && heroRect.height > 0) {
          const x = (mouseX - heroRect.left) / heroRect.width - 0.5;
          const y = (mouseY - heroRect.top) / heroRect.height - 0.5;
          hero.style.setProperty('--ry', `${(x * 11).toFixed(2)}deg`);
          hero.style.setProperty('--rx', `${(-y * 9).toFixed(2)}deg`);
        }
      }

      if (activeCard) {
        if (!cardRect) cardRect = activeCard.getBoundingClientRect();
        if (cardRect.width > 0 && cardRect.height > 0) {
          const px = Math.max(0, Math.min(1, (mouseX - cardRect.left) / cardRect.width));
          const py = Math.max(0, Math.min(1, (mouseY - cardRect.top) / cardRect.height));
          activeCard.style.setProperty('--card-rx', `${((0.5 - py) * 8).toFixed(2)}deg`);
          activeCard.style.setProperty('--card-ry', `${((px - 0.5) * 10).toFixed(2)}deg`);
        }
      }
    };

    const onHeroEnter = () => {
      overHero = true;
      if (hero) heroRect = hero.getBoundingClientRect();
    };
    const onHeroLeave = () => {
      overHero = false;
      heroRect = null;
      if (!hero) return;
      hero.style.setProperty('--rx', '0deg');
      hero.style.setProperty('--ry', '0deg');
    };

    /* Event delegation keeps cards added later by the owner fully interactive. */
    const onPointerMove = (e: PointerEvent) => {
      if (isLite()) return;
      mouseX = e.clientX;
      mouseY = e.clientY;
      const target = e.target as Element | null;
      const card = target?.closest<HTMLElement>('.svc, .about-card, .work-card') ?? null;
      if (activeCard !== card) {
        if (activeCard) {
          activeCard.classList.remove('is-tilting');
          activeCard.style.setProperty('--card-rx', '0deg');
          activeCard.style.setProperty('--card-ry', '0deg');
        }
        activeCard = card;
        cardRect = card ? card.getBoundingClientRect() : null;
        if (card) card.classList.add('is-tilting');
      }
      if (!frame) frame = requestAnimationFrame(paintPointer);
    };

    const onPointerOut = (e: PointerEvent) => {
      const target = e.target as Element | null;
      const card = target?.closest<HTMLElement>('.svc, .about-card, .work-card');
      if (card && !card.contains(e.relatedTarget as Node)) {
        card.classList.remove('is-tilting');
        card.style.setProperty('--card-rx', '0deg');
        card.style.setProperty('--card-ry', '0deg');
        if (activeCard === card) {
          activeCard = null;
          cardRect = null;
        }
      }
    };

    window.addEventListener('scroll', invalidateRects, { passive: true });
    window.addEventListener('resize', invalidateRects, { passive: true });
    document.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('pointerout', onPointerOut, { passive: true });
    hero?.addEventListener('pointerenter', onHeroEnter, { passive: true });
    hero?.addEventListener('pointerleave', onHeroLeave, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', invalidateRects);
      window.removeEventListener('resize', invalidateRects);
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerout', onPointerOut);
      hero?.removeEventListener('pointerenter', onHeroEnter);
      hero?.removeEventListener('pointerleave', onHeroLeave);
      document.body.classList.remove('has-pointer');
    };
  }, [enabled]);
}

/**
 * Port of the cube-field scroll link: each floating cube/particle glides very
 * gently with the scroll through its own `--sy`. Skipped on weak or
 * coarse-pointer devices, exactly like the original.
 */
export function useCubeParallax(fieldRef: RefObject<HTMLElement | null>, active: boolean): void {
  useEffect(() => {
    const field = fieldRef.current;
    if (!field || !active) return;
    if (document.documentElement.classList.contains('perf-lite')) return;
    if (window.matchMedia('(pointer: coarse)').matches) return;

    let ticking = false;
    const place = () => {
      ticking = false;
      if (document.documentElement.classList.contains('perf-lite')) return;
      const movers = field.children;
      const y = window.scrollY || 0;
      for (let i = 0; i < movers.length; i++) {
        const el = movers[i] as HTMLElement;
        el.style.setProperty('--sy', (y * parseFloat(el.dataset.f || '0')).toFixed(1));
      }
    };
    const onScroll = () => {
      if (ticking || document.documentElement.classList.contains('perf-lite')) return;
      ticking = true;
      requestAnimationFrame(place);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    place();
    return () => window.removeEventListener('scroll', onScroll);
  }, [fieldRef, active]);
}
