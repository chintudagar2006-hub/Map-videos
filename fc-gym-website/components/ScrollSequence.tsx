'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const SETS = {
  d: { count: 120, path: (i: number) => `/media/seq/d/${String(i).padStart(3, '0')}.webp` },
  m: { count: 72, path: (i: number) => `/media/seq/m/${String(i).padStart(3, '0')}.webp` },
};

const PHRASES = [
  { k: '01', a: 'Built for', b: 'ambition.' },
  { k: '02', a: 'Designed for', b: 'progress.' },
  { k: '03', a: 'Your next chapter', b: 'starts here.' },
];

/**
 * Pinned (CSS sticky) cinematic sequence. Native scroll drives a frame-by-frame canvas,
 * so scrolling is never hijacked — the page simply scrolls through a tall section.
 */
export default function ScrollSequence() {
  const section = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    setReduced(reduce);
    const el = section.current, cv = canvas.current;
    if (!el || !cv) return;
    const ctx2d = cv.getContext('2d', { alpha: false });
    if (!ctx2d) return;

    const set = matchMedia('(max-width: 767px) and (orientation: portrait)').matches ? SETS.m : SETS.d;
    const frames: (HTMLImageElement | null)[] = new Array(set.count).fill(null);
    let current = 0;
    let wanted = 0;

    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = cv.getBoundingClientRect();
      cv.width = Math.round(r.width * dpr);
      cv.height = Math.round(r.height * dpr);
      draw(current, true);
    };

    const nearestLoaded = (i: number) => {
      for (let d = 0; d < set.count; d++) {
        if (frames[i - d]?.complete) return i - d;
        if (frames[i + d]?.complete) return i + d;
      }
      return -1;
    };

    const draw = (i: number, force = false) => {
      const idx = nearestLoaded(i);
      if (idx < 0 || (!force && idx === current)) return;
      const img = frames[idx]!;
      current = idx;
      const cw = cv.width, ch = cv.height;
      const s = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
      const w = img.naturalWidth * s, h = img.naturalHeight * s;
      ctx2d.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
    };

    // Progressive loading: first frame, then every 8th, 4th, 2nd, rest — the sequence is usable early.
    let started = false;
    const load = () => {
      if (started) return;
      started = true;
      const order: number[] = [];
      const seen = new Set<number>();
      for (const step of [set.count, 8, 4, 2, 1]) {
        for (let i = 0; i < set.count; i += step) if (!seen.has(i)) { seen.add(i); order.push(i); }
      }
      let k = 0;
      const next = () => {
        if (k >= order.length) return;
        const i = order[k++];
        const img = new Image();
        img.decoding = 'async';
        img.onload = img.onerror = () => {
          frames[i] = img;
          if (Math.abs(i - wanted) < Math.abs(current - wanted) || i === 0) draw(wanted, true);
          next();
        };
        img.src = set.path(i);
      };
      for (let p = 0; p < 6; p++) next(); // 6 parallel requests
    };

    const io = new IntersectionObserver((e) => e[0].isIntersecting && load(), { rootMargin: '150% 0px' });
    io.observe(el);
    size();
    window.addEventListener('resize', size);

    const g = gsap.context(() => {
      const st = ScrollTrigger.create({
        trigger: el,
        start: 'top top',
        end: 'bottom bottom',
        scrub: reduce ? false : 0.4,
        onUpdate: (self) => {
          wanted = Math.round(self.progress * (set.count - 1));
          draw(wanted);
        },
      });
      if (reduce) return;
      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, start: 'top top', end: 'bottom bottom', scrub: 0.6 },
        defaults: { ease: 'none' },
      });
      tl.fromTo('[data-seq-veil]', { opacity: 1 }, { opacity: 0, duration: 0.6 }, 0);
      PHRASES.forEach((_, i) => {
        const at = 0.5 + i * 2.6;
        const sel = `[data-phrase="${i}"]`;
        tl.fromTo(`${sel} [data-l]`, { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, stagger: 0.12, duration: 0.7, ease: 'power3.out' }, at)
          .fromTo(`${sel}`, { scale: 1.08, filter: 'blur(6px)' }, { scale: 1, filter: 'blur(0px)', duration: 1.2 }, at);
        if (i < PHRASES.length - 1)
          tl.to(`${sel}`, { opacity: 0, scale: 0.96, filter: 'blur(8px)', duration: 0.6 }, at + 1.9);
      });
      tl.fromTo('[data-seq-bar]', { scaleX: 0 }, { scaleX: 1, duration: 8.2 }, 0)
        .to('[data-seq-out]', { opacity: 1, duration: 0.8 }, 7.6);
      return () => st.kill();
    }, el);

    return () => {
      io.disconnect();
      window.removeEventListener('resize', size);
      g.revert();
    };
  }, []);

  return (
    <section
      ref={section}
      id="experience"
      aria-label="Built for ambition — cinematic sequence"
      className={`relative bg-obsidian ${reduced ? 'h-auto' : 'h-[420vh]'}`}
    >
      <div className={`${reduced ? 'relative h-[100svh]' : 'sticky top-0 h-[100svh]'} overflow-hidden`}>
        <canvas ref={canvas} className="absolute inset-0 h-full w-full" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(8,8,8,0.75)_100%)]" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-obsidian/60 via-transparent to-obsidian/70" />
        <div data-seq-veil className={`pointer-events-none absolute inset-0 bg-obsidian ${reduced ? "hidden" : ""}`} />

        <div className="gutter absolute inset-0 grid place-items-center">
          {PHRASES.map((p, i) => (
            <div
              key={p.k}
              data-phrase={i}
              className={`col-start-1 row-start-1 text-center ${reduced && i > 0 ? 'hidden' : ''}`}
            >
              <span className="block overflow-hidden">
                <span data-l className="eyebrow block !text-lime">— {p.k} / 03</span>
              </span>
              <h2 className="display mt-5 text-[clamp(3rem,13vw,6rem)] md:text-[min(9.5vw,17vh)]">
                <span className="block overflow-hidden pb-[0.04em]">
                  <span data-l className="block text-bone">{p.a}</span>
                </span>
                <span className="block overflow-hidden pb-[0.06em]">
                  <span data-l className="metal-text block">{p.b}</span>
                </span>
              </h2>
            </div>
          ))}
        </div>

        <div className="gutter absolute inset-x-0 bottom-8 flex items-center gap-5 md:bottom-10">
          <span className="eyebrow whitespace-nowrap">Concept footage</span>
          <span className="relative h-px flex-1 bg-bone/10">
            <span data-seq-bar className="absolute inset-0 origin-left bg-lime" />
          </span>
          <span className="eyebrow whitespace-nowrap">Scroll</span>
        </div>
        <div data-seq-out className="pointer-events-none absolute inset-0 bg-obsidian opacity-0" />
      </div>
    </section>
  );
}
