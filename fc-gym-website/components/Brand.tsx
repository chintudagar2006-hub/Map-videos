'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { motion, useReducedMotion } from 'motion/react';
import SplitReveal from './SplitReveal';

const EXPERIENCES = [
  {
    n: '01',
    title: 'Strength training',
    line: 'Heavy, honest work. The foundation of every stronger version of you.',
    img: 'strength',
    alt: 'Concept image: athlete lifting a barbell overhead in a dark industrial gym',
    grid: 'md:col-span-7 md:row-span-2',
    aspect: 'aspect-[4/5] md:aspect-[7/6]',
    speed: -6,
  },
  {
    n: '02',
    title: 'Functional fitness',
    line: 'Movement that carries into real life — power, control, endurance.',
    img: 'functional',
    alt: 'Concept image: athlete training with battle ropes',
    grid: 'md:col-span-5 md:col-start-8 md:mt-40',
    aspect: 'aspect-[4/5]',
    speed: 10,
  },
  {
    n: '03',
    title: 'Cardio training',
    line: 'Conditioning that builds the engine behind everything else.',
    img: 'cardio',
    alt: 'Concept image: athlete skipping rope in a dimly lit gym',
    grid: 'md:col-span-5 md:col-start-2 md:mt-24',
    aspect: 'aspect-[5/4]',
    speed: 4,
  },
  {
    n: '04',
    title: 'Personal fitness journeys',
    line: 'Every goal is different. Progress you can feel, at your own pace.',
    img: 'journey',
    alt: 'Concept image: focused athlete mid-workout',
    grid: 'md:col-span-5 md:col-start-8 md:mt-28',
    aspect: 'aspect-[4/5]',
    speed: -8,
  },
];

function Tile({ e, i }: { e: (typeof EXPERIENCES)[number]; i: number }) {
  const reduce = useReducedMotion();
  return (
    <div data-speed={e.speed} className={e.grid}>
    <motion.figure
      className="group relative"
      initial={reduce ? false : { opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: (i % 2) * 0.1 }}
    >
      <motion.div
        className={`relative overflow-hidden rounded-[22px] bg-charcoal ${e.aspect}`}
        initial={reduce ? false : { clipPath: 'inset(100% 0% 0% 0% round 22px)' }}
        whileInView={{ clipPath: 'inset(0% 0% 0% 0% round 22px)' }}
        viewport={{ once: true, margin: '0px 0px -10% 0px' }}
        transition={{ duration: 1.4, ease: [0.76, 0, 0.24, 1] }}
      >
        <img
          src={`/media/${e.img}.webp`}
          srcSet={`/media/${e.img}-sm.webp 800w, /media/${e.img}.webp 1600w`}
          sizes="(min-width: 768px) 50vw, 100vw"
          alt={e.alt}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full scale-[1.12] object-cover transition-transform duration-[1.6s] [transition-timing-function:var(--ease-out)] group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian/85 via-obsidian/10 to-transparent" />
        <span className="absolute left-4 top-4 rounded-full border border-bone/15 bg-obsidian/40 px-3 py-1 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-silver backdrop-blur-md">
          Proposed concept
        </span>
        <span className="display absolute right-4 top-2 text-[3.2rem] text-bone/10 md:text-[4.5rem]">{e.n}</span>
      </motion.div>
      <figcaption className="mt-5 flex items-start gap-5">
        <span className="mt-1 font-mono text-xs text-lime">{e.n}</span>
        <div>
          <h3 className="display text-[2rem] md:text-[2.6rem]">{e.title}</h3>
          <p className="mt-2 max-w-sm text-[0.95rem] leading-relaxed text-silver">{e.line}</p>
        </div>
      </figcaption>
    </motion.figure>
    </div>
  );
}

export default function Brand() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-speed]').forEach((t) => {
        if (innerWidth < 768) return;
        gsap.to(t, {
          yPercent: Number(t.dataset.speed),
          ease: 'none',
          scrollTrigger: { trigger: t, start: 'top bottom', end: 'bottom top', scrub: true },
        });
      });
      gsap.fromTo(
        '[data-ghost]',
        { xPercent: 8 },
        { xPercent: -28, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } },
      );
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} id="vision" className="relative overflow-hidden bg-obsidian pb-28 pt-28 md:pb-44 md:pt-40">
      {/* Oversized ghost word */}
      <div
        data-ghost
        aria-hidden="true"
        className="display pointer-events-none absolute left-0 top-[34%] whitespace-nowrap text-[34vw] leading-none text-transparent [-webkit-text-stroke:1px_rgba(191,195,199,0.09)]"
      >
        New Standard
      </div>

      <div className="gutter relative mx-auto max-w-[1600px]">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-12">
            <p className="eyebrow mb-6 flex items-center gap-3">
              <span className="inline-block h-px w-8 bg-lime" /> The vision
            </p>
            <SplitReveal
              lines={['Not just a gym.', { text: 'A new standard.', className: 'metal-text' }]}
              className="display text-[clamp(3.2rem,13vw,5.5rem)] md:text-[min(8.6vw,10rem)]"
            />
          </div>
          <div className="flex flex-col justify-end gap-6 md:col-span-5 md:col-start-8">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.3 }}
              className="text-lg leading-relaxed text-silver"
            >
              FC Gym is being shaped for Rohtak as a place where serious effort meets considered design. These are the
              training directions explored for this concept.
            </motion.p>
            <p className="border-l border-lime/60 pl-4 text-sm leading-relaxed text-silver/70">
              Concept visuals only — not photographs of the FC Gym premises. Final facilities and equipment will be
              confirmed by FC Gym at launch.
            </p>
          </div>
        </div>

        <div className="mt-20 grid gap-16 md:mt-32 md:grid-cols-12 md:gap-x-8 md:gap-y-10">
          {EXPERIENCES.map((e, i) => (
            <Tile key={e.n} e={e} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
