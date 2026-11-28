'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import Magnetic from './Magnetic';
import { scrollToHash, useLenis } from './SmoothScroll';

export default function Hero() {
  const lenis = useLenis();
  const root = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const light = useRef<HTMLDivElement>(null);

  // Pick the right video for the device; skip video on data-saver / reduced motion (poster stays).
  useEffect(() => {
    const v = video.current;
    if (!v) return;
    const nav = navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } };
    const slow = nav.connection?.saveData || /(^|-)2g$/.test(nav.connection?.effectiveType ?? '');
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (slow || reduce) return;
    const mobile = matchMedia('(max-width: 767px)').matches;
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause()));
    // Start the video only after the page has loaded, so it never competes with first render.
    const start = () => {
      v.src = mobile ? '/media/hero-mobile.mp4' : '/media/hero-desktop.mp4';
      v.addEventListener('playing', () => v.classList.remove('opacity-0'), { once: true });
      io.observe(v);
    };
    let t = 0;
    const onLoad = () => (t = window.setTimeout(start, 400));
    if (document.readyState === 'complete') onLoad();
    else window.addEventListener('load', onLoad, { once: true });
    return () => { io.disconnect(); clearTimeout(t); window.removeEventListener('load', onLoad); };
  }, []);

  // Layered parallax while leaving the hero.
  useEffect(() => {
    const el = root.current;
    if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = gsap.context(() => {
      const st = { trigger: el, start: 'top top', end: 'bottom top', scrub: true };
      gsap.to('[data-hero-media]', { yPercent: 18, scale: 1.12, ease: 'none', scrollTrigger: st });
      gsap.to('[data-hero-title]', { yPercent: -22, ease: 'none', scrollTrigger: st });
      gsap.to('[data-hero-fade]', { opacity: 0, y: -40, ease: 'none', scrollTrigger: { ...st, end: '60% top' } });
      gsap.to('[data-hero-shade]', { opacity: 1, ease: 'none', scrollTrigger: st });
    }, el);
    return () => ctx.revert();
  }, []);

  // Cursor-responsive lighting (desktop only).
  useEffect(() => {
    const el = root.current, l = light.current;
    if (!el || !l || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const move = (e: PointerEvent) => {
      l.style.setProperty('--x', `${e.clientX}px`);
      l.style.setProperty('--y', `${e.clientY}px`);
      l.style.opacity = '1';
    };
    el.addEventListener('pointermove', move);
    return () => el.removeEventListener('pointermove', move);
  }, []);

  return (
    <section ref={root} id="top" className="relative h-[100svh] min-h-[620px] overflow-hidden bg-obsidian">
      {/* Media layer */}
      <div data-hero-media className="absolute inset-0 will-change-transform">
        <picture>
          <source media="(max-width: 767px)" srcSet="/media/hero-poster-m.webp" />
          <img
            src="/media/hero-poster.webp"
            alt=""
            fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover object-[60%_50%]"
          />
        </picture>
        <video
          ref={video}
          muted
          loop
          playsInline
          preload="none"
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover object-[60%_50%] opacity-0 transition-opacity duration-1000"
        />
      </div>

      {/* Atmosphere */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_70%_30%,transparent_0%,rgba(8,8,8,0.55)_70%)]" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/30 to-obsidian/50" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-obsidian to-transparent" />
      <div
        ref={light}
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700"
        style={{
          background:
            'radial-gradient(520px circle at var(--x,50%) var(--y,50%), rgba(198,255,0,0.07), rgba(245,245,245,0.04) 35%, transparent 70%)',
        }}
      />
      <div data-hero-shade className="pointer-events-none absolute inset-0 bg-obsidian opacity-0" />

      {/* Content */}
      <div className="gutter relative z-10 mx-auto flex h-full max-w-[1600px] flex-col justify-end pb-24 pt-28 md:pb-14">
        <div data-hero-fade className="mb-auto pb-6">
        <div className="fade-in flex items-start justify-between pt-6 md:pt-10" style={{ ['--d' as string]: '0.5s' }}>
          <div className="glass inline-flex items-center gap-3 rounded-full px-4 py-2">
            <span className="pulse-dot" aria-hidden="true" />
            <span className="eyebrow !text-bone">Coming soon · Pre-booking open</span>
          </div>
          <p className="eyebrow hidden text-right leading-6 md:block">
            Ek Rupaya Chowk
            <br />
            Rohtak — Haryana
          </p>
        </div>
        </div>

        <h1 data-hero-title className="display text-[clamp(3.6rem,19vw,7.5rem)] md:text-[min(13.4vw,23vh)] will-change-transform">
          <span className="block overflow-hidden pb-[0.04em]">
            <span className="hero-reveal block" style={{ ['--d' as string]: '0s' }}>
              Rohtak<span className="text-lime">.</span>
            </span>
          </span>
          <span className="block overflow-hidden pb-[0.06em]">
            <span className="hero-reveal metal-text block" style={{ ['--d' as string]: '0.09s' }}>
              Get Stronger<span className="text-lime">.</span>
            </span>
          </span>
        </h1>

        <div data-hero-fade className="mt-7 flex flex-col gap-8 md:mt-10 md:flex-row md:items-end md:justify-between">
          <p className="fade-in max-w-[26rem] text-[1.05rem] leading-relaxed text-silver md:text-lg" style={{ ['--d' as string]: '0.3s' }}>
            A new fitness experience is coming to <span className="text-bone">Ek Rupaya Chowk</span>.
          </p>

          <div className="fade-in flex flex-col gap-3 xs:flex-row xs:flex-wrap md:items-center" style={{ ['--d' as string]: '0.42s' }}>
            <Magnetic>
              <a
                href="#prebook"
                onClick={(e) => { e.preventDefault(); scrollToHash(lenis, '#prebook'); }}
                className="group btn-primary inline-flex h-14 w-full items-center justify-between gap-6 rounded-full pl-7 pr-2 text-[0.78rem] font-semibold uppercase tracking-[0.16em] xs:w-auto md:h-16"
              >
                <span className="roll">
                  <span>Pre-book your membership</span>
                  <span>Pre-book your membership</span>
                </span>
                <span className="grid h-10 w-10 place-items-center rounded-full bg-obsidian text-lime md:h-12 md:w-12">
                  <ArrowUpRight className="h-5 w-5 transition-transform duration-500 group-hover:rotate-45" />
                </span>
              </a>
            </Magnetic>
            <Magnetic>
              <a
                href="#experience"
                onClick={(e) => { e.preventDefault(); scrollToHash(lenis, '#experience'); }}
                className="group btn-ghost inline-flex h-14 w-full items-center justify-center gap-3 rounded-full px-7 text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-bone xs:w-auto md:h-16"
              >
                <span className="roll">
                  <span>Explore the experience</span>
                  <span>Explore the experience</span>
                </span>
                <ArrowDownRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-y-0.5" />
              </a>
            </Magnetic>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div data-hero-fade className="absolute right-[var(--gutter)] top-1/2 z-10 hidden -translate-y-1/2 lg:block" aria-hidden="true">
        <div className="fade-in flex flex-col items-center gap-3" style={{ ['--d' as string]: '0.7s' }}>
          <span className="eyebrow !text-[0.6rem]">Scroll</span>
          <span className="scroll-line" />
        </div>
      </div>
    </section>
  );
}
