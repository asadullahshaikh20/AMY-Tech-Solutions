import { useEffect } from 'react';

/*
  Scroll-triggered reveal for the marketing site.

  Instead of wiring every component by hand, this tags the recurring building blocks of each
  <section> (eyebrow, heading, intro copy, cards, tabs, list rows) and fades them in as they
  enter the viewport. Siblings in the same grid get a small stagger.

  It is progressive enhancement: elements are only hidden once JS has tagged them, and anything
  React re-renders loses the class and simply stays visible.
*/
const SELECTORS = [
  '.section-eyebrow',
  'h2',
  'h2 + p',
  'article',
  '.glass',
  '[role="tab"]',
  'form',
  'ol > li',
  '#contact ul > li',
].join(',');

const STAGGER_MS = 90;
const MAX_STAGGER_STEPS = 6;

export default function useScrollReveal(active) {
  useEffect(() => {
    if (!active) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!('IntersectionObserver' in window)) return;

    const sections = document.querySelectorAll('main section:not(#top)');
    const targets = new Set();

    sections.forEach((section) => {
      section.querySelectorAll(SELECTORS).forEach((el) => {
        // Don't animate an element inside another animated element (e.g. a .glass inside an article).
        if (el.parentElement.closest('[data-reveal]')) return;
        if (el.closest('[data-reveal-skip]')) return;
        el.setAttribute('data-reveal', '');
        targets.add(el);
      });
    });

    targets.forEach((el) => {
      const siblings = [...el.parentElement.children].filter((c) => targets.has(c));
      const step = Math.min(siblings.indexOf(el), MAX_STAGGER_STEPS);
      if (step > 0) el.style.setProperty('--reveal-delay', `${step * STAGGER_MS}ms`);
      el.classList.add('reveal');
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 }
    );
    targets.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
      targets.forEach((el) => {
        el.classList.remove('reveal', 'is-visible');
        el.removeAttribute('data-reveal');
        el.style.removeProperty('--reveal-delay');
      });
    };
  }, [active]);
}
