'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Viewport-triggered page effects, ported from the old main.js.
 *
 *  - `.sr-fade-up` / `.sr-fade-left` / `.sr-fade-right` / `.sr-zoom` reveal once
 *    they scroll into view (class `sr-in`).
 *  - `.counter[data-target]` counts up the first time it is seen.
 *
 * Both respect `prefers-reduced-motion` by jumping straight to the end state.
 * Re-runs on navigation because App Router transitions swap page content without
 * a document load.
 */
export default function ScrollEffects() {
  const pathname = usePathname();

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const observers: IntersectionObserver[] = [];

    // --- Scroll reveal -----------------------------------------------------
    const revealTargets = document.querySelectorAll<HTMLElement>(
      '.sr-fade-up, .sr-fade-left, .sr-fade-right, .sr-zoom'
    );
    if (revealTargets.length) {
      if (reduceMotion) {
        revealTargets.forEach((el) => el.classList.add('sr-in'));
      } else {
        const revealObserver = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting) return;
              entry.target.classList.add('sr-in');
              revealObserver.unobserve(entry.target);
            });
          },
          { rootMargin: '0px 0px -10% 0px', threshold: 0.08 }
        );
        revealTargets.forEach((el) => revealObserver.observe(el));
        observers.push(revealObserver);
      }
    }

    // --- Impact counters ---------------------------------------------------
    const counters = document.querySelectorAll<HTMLElement>('.counter');
    const frames = new Set<number>();

    const finalValue = (el: HTMLElement) => {
      const target = parseInt(el.getAttribute('data-target') ?? '', 10);
      if (Number.isNaN(target)) return;
      const prefix = el.getAttribute('data-prefix') ?? '';
      const suffix = el.getAttribute('data-suffix') ?? '';
      el.textContent = prefix + target.toLocaleString() + suffix;
    };

    const animate = (el: HTMLElement, target: number, duration = 1400) => {
      const prefix = el.getAttribute('data-prefix') ?? '';
      const suffix = el.getAttribute('data-suffix') ?? '';
      const increment = target / (duration / 16);
      let value = 0;
      el.textContent = `${prefix}0${suffix}`;
      const step = () => {
        value += increment;
        if (value < target) {
          el.textContent = prefix + Math.floor(value).toLocaleString() + suffix;
          frames.add(requestAnimationFrame(step));
        } else {
          el.textContent = prefix + target.toLocaleString() + suffix;
        }
      };
      frames.add(requestAnimationFrame(step));
    };

    if (counters.length) {
      if (reduceMotion) {
        counters.forEach(finalValue);
      } else {
        // Each counter animates independently the moment it scrolls into view.
        const counterObserver = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting) return;
              const el = entry.target as HTMLElement;
              const target = parseInt(el.getAttribute('data-target') ?? '', 10);
              if (!Number.isNaN(target)) animate(el, target);
              counterObserver.unobserve(el);
            });
          },
          { threshold: 0.4, rootMargin: '0px 0px -10% 0px' }
        );
        counters.forEach((el) => counterObserver.observe(el));
        observers.push(counterObserver);
      }
    }

    return () => {
      observers.forEach((o) => o.disconnect());
      frames.forEach((id) => cancelAnimationFrame(id));
    };
  }, [pathname]);

  return null;
}
