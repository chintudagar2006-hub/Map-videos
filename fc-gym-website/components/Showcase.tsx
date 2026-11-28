'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

const SLIDES = [
  { img: 'wrap', title: 'Preparation', sub: 'Every session starts before the first rep.', alt: 'Concept image: athlete wrapping hands before training' },
  { img: 'barbell', title: 'Iron', sub: 'Steel, light and intent.', alt: 'Concept image: loaded barbell on the floor lit by a vertical light' },
  { img: 'pullup', title: 'Power', sub: 'Strength you can see — and feel.', alt: 'Concept image: athlete performing pull-ups against a bright window' },
  { img: 'boxer', title: 'Conditioning', sub: 'Engine, footwork, breath.', alt: 'Concept image: silhouette of an athlete shadow-boxing in haze' },
  { img: 'focus', title: 'Focus', sub: 'The quiet before the lift.', alt: 'Concept image: athlete gripping a barbell overhead' },
];

function Counter({ value }: { value: number }) {
  return (
    <span className="relative inline-block h-[0.9em] w-[1.15em] overflow-hidden align-bottom leading-[0.9]">
      <AnimatePresence initial={false}>
        <motion.span
          key={value}
          className="absolute inset-0"
          initial={{ y: '100%' }}
          animate={{ y: '0%' }}
          exit={{ y: '-100%' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          0{value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export default function Showcase() {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [horizontal, setHorizontal] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    const mq = matchMedia('(min-width: 1024px) and (prefers-reduced-motion: no-preference)');
    const set = () => setHorizontal(mq.matches);
    set();
    mq.addEventListener('change', set);
    return () => mq.removeEventListener('change', set);
  }, []);

  useEffect(() => {
    if (!horizontal) return;
    const el = section.current, tr = track.current;
    if (!el || !tr) return;
    const ctx = gsap.context(() => {
      const distance = () => tr.scrollWidth - innerWidth;
      const setHeight = () => (el.style.height = `${distance() + innerHeight}px`);
      setHeight();
      const tween = gsap.to(tr, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.5,
          invalidateOnRefresh: true,
          onRefreshInit: setHeight,
          onUpdate: (s) => setActive(Math.min(SLIDES.length - 1, Math.floor(s.progress * SLIDES.length * 0.999))),
        },
      });
      // depth: images drift against the track, reveal from a mask as they enter
      gsap.utils.toArray<HTMLElement>('[data-slide]').forEach((s) => {
        const img = s.querySelector('img');
        const mask = s.querySelector('[data-mask]');
        gsap.fromTo(img, { xPercent: -10, scale: 1.18 }, {
          xPercent: 10, scale: 1.05, ease: 'none',
          scrollTrigger: { trigger: s, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true },
        });
        gsap.fromTo(mask, { clipPath: 'inset(12% 18% 12% 18% round 28px)' }, {
          clipPath: 'inset(0% 0% 0% 0% round 28px)', ease: 'none',
          scrollTrigger: { trigger: s, containerAnimation: tween, start: 'left right', end: 'center 60%', scrub: true },
        });
        gsap.fromTo(s.querySelectorAll('[data-t]'), { yPercent: 120 }, {
          yPercent: 0, stagger: 0.08, ease: 'power3.out',
          scrollTrigger: { trigger: s, containerAnimation: tween, start: 'left 70%', end: 'left 25%', scrub: true },
        });
      });
    }, el);
    const r = () => ScrollTrigger.refresh();
    window.addEventListener('load', r);
    return () => {
      window.removeEventListener('load', r);
      ctx.revert();
      el.style.height = '';
    };
  }, [horizontal]);

  const Header = (
    <div className="flex shrink-0 flex-col justify-between lg:w-[34vw] lg:pr-16">
      <div>
        <p className="eyebrow mb-6 flex items-center gap-3">
          <span className="inline-block h-px w-8 bg-lime" /> Visual showcase
        </p>
        <h2 className="display text-[clamp(3.2rem,8vw,8.5rem)]">
          The mood,
          <br />
          <span className="metal-text">in frames.</span>
        </h2>
        <p className="mt-6 max-w-sm text-silver">
          An art-directed look at the atmosphere this concept is chasing — contrast, metal and quiet intensity.
        </p>
      </div>
      <p className="eyebrow mt-10 hidden lg:block">Concept imagery · licensed stock footage</p>
    </div>
  );

  if (!horizontal) {
    return (
      <section id="showcase" className="relative bg-obsidian py-24 md:py-32">
        <div className="gutter mx-auto max-w-[1600px]">
          {Header}
          <div className="mt-14 space-y-14">
            {SLIDES.map((s, i) => (
              <motion.figure
                key={s.img}
                initial={reduce ? false : { opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: '0px 0px -15% 0px' }}
                className="group"
              >
                <motion.div
                  className="relative aspect-[4/5] overflow-hidden rounded-[22px] bg-charcoal sm:aspect-[16/10]"
                  initial={reduce ? false : { clipPath: 'inset(8% 8% 8% 8% round 22px)' }}
                  whileInView={{ clipPath: 'inset(0% 0% 0% 0% round 22px)' }}
                  viewport={{ once: true, margin: '0px 0px -15% 0px' }}
                  transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1] }}
                >
                  <motion.img
                    src={`/media/${s.img}-sm.webp`}
                    srcSet={`/media/${s.img}-sm.webp 800w, /media/${s.img}.webp 1600w`}
                    sizes="100vw"
                    alt={s.alt}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover"
                    initial={reduce ? false : { scale: 1.25 }}
                    whileInView={{ scale: 1.02 }}
                    viewport={{ once: true, margin: '0px 0px -15% 0px' }}
                    transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-obsidian/80 to-transparent" />
                  <span className="display absolute bottom-3 right-4 text-[4.5rem] text-bone/15">0{i + 1}</span>
                </motion.div>
                <figcaption className="mt-5 flex items-baseline gap-4">
                  <span className="font-mono text-xs text-lime">0{i + 1}</span>
                  <div>
                    <h3 className="display text-[2.4rem]">{s.title}</h3>
                    <p className="text-silver">{s.sub}</p>
                  </div>
                </figcaption>
              </motion.figure>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={section} id="showcase" className="relative bg-obsidian">
      <div className="sticky top-0 h-screen overflow-hidden">
        <div ref={track} className="gutter flex h-full w-max items-center gap-[4vw] pb-[13vh] pt-[10vh] will-change-transform">
          {Header}
          {SLIDES.map((s, i) => (
            <figure key={s.img} data-slide className="relative h-full w-[62vw] shrink-0">
              <div data-mask className="relative h-[calc(100%-5.5rem)] overflow-hidden rounded-[28px] bg-charcoal">
                <img
                  src={`/media/${s.img}.webp`}
                  srcSet={`/media/${s.img}-sm.webp 800w, /media/${s.img}.webp 1600w`}
                  sizes="62vw"
                  alt={s.alt}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover will-change-transform"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-obsidian/70 via-transparent to-transparent" />
              </div>
              <figcaption className="mt-5 flex items-end justify-between">
                <div className="flex items-baseline gap-5">
                  <span className="overflow-hidden font-mono text-xs text-lime"><span data-t className="block">0{i + 1}</span></span>
                  <h3 className="display overflow-hidden text-[3.4rem]"><span data-t className="block">{s.title}</span></h3>
                </div>
                <p className="overflow-hidden text-silver"><span data-t className="block">{s.sub}</span></p>
              </figcaption>
            </figure>
          ))}
          <div className="w-[8vw] shrink-0" aria-hidden="true" />
        </div>

        {/* Animated section counter */}
        <div className="gutter pointer-events-none absolute bottom-[2.5vh] right-0 flex items-end gap-2 font-mono text-bone" aria-hidden="true">
          <span className="display text-[2.6rem] text-lime">
            <Counter value={active + 1} />
          </span>
          <span className="text-xs text-silver">/ 0{SLIDES.length}</span>
        </div>
      </div>
    </section>
  );
}
