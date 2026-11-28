'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const LenisCtx = createContext<Lenis | null>(null);
export const useLenis = () => useContext(LenisCtx);

/** Scroll to an in-page anchor using Lenis when available. */
export function scrollToHash(lenis: Lenis | null, hash: string) {
  const el = document.querySelector(hash) as HTMLElement | null;
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { offset: 0, duration: 1.4 });
  else el.scrollIntoView({ behavior: 'smooth' });
  history.replaceState(null, '', hash);
}

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    // Native touch scrolling stays untouched on phones (no hijacking); wheel gets eased.
    const l = new Lenis({ lerp: 0.1, wheelMultiplier: 1, smoothWheel: true });
    l.on('scroll', ScrollTrigger.update);
    const tick = (time: number) => l.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    setLenis(l);
    return () => {
      gsap.ticker.remove(tick);
      l.destroy();
      setLenis(null);
    };
  }, []);

  // Showcase mode: press "P" for a constant-speed cinematic auto-scroll (for screen recording), "Esc" to stop.
  useEffect(() => {
    if (document.documentElement.dataset.showcase !== 'true') return;
    console.info('[showcase] Press P to auto-scroll, Esc to stop, Home to return to top.');
    let playing = false;
    const onKey = (e: KeyboardEvent) => {
      const max = document.documentElement.scrollHeight - innerHeight;
      if (e.key === 'p' || e.key === 'P') {
        if (playing) return;
        playing = true;
        const remaining = max - scrollY;
        const duration = remaining / (innerHeight * 0.32); // ~a third of a screen per second
        if (lenis) lenis.scrollTo(max, { duration, easing: (t) => t, onComplete: () => (playing = false) });
        else window.scrollTo({ top: max, behavior: 'smooth' });
      }
      if (e.key === 'Escape') {
        playing = false;
        lenis?.scrollTo(scrollY, { immediate: true, force: true });
      }
      if (e.key === 'Home') {
        playing = false;
        lenis?.scrollTo(0, { immediate: true, force: true });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lenis]);

  return <LenisCtx.Provider value={lenis}>{children}</LenisCtx.Provider>;
}
