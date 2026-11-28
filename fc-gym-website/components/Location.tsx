'use client';

import { motion } from 'motion/react';
import { ArrowUpRight, MapPin } from 'lucide-react';
import SplitReveal from './SplitReveal';
import { SITE } from '@/lib/site';

/** Abstract "radar" map — deliberately not a street map, since only the area is confirmed. */
function Radar() {
  return (
    <div className="relative aspect-square w-full max-w-[560px]" aria-hidden="true">
      <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full">
        <defs>
          <radialGradient id="rg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#C6FF00" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#C6FF00" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="sweep" x1="0" x2="1">
            <stop offset="0%" stopColor="#C6FF00" stopOpacity="0" />
            <stop offset="100%" stopColor="#C6FF00" stopOpacity="0.22" />
          </linearGradient>
        </defs>
        <circle cx="200" cy="200" r="190" fill="url(#rg)" />
        {[190, 145, 100, 55].map((r) => (
          <circle key={r} cx="200" cy="200" r={r} fill="none" stroke="#BFC3C7" strokeOpacity="0.14" />
        ))}
        <path d="M200 10V390M10 200H390" stroke="#BFC3C7" strokeOpacity="0.1" />
        {/* stylised roads meeting at a chowk */}
        <g stroke="#BFC3C7" strokeOpacity="0.32" strokeWidth="1.5" fill="none">
          <path d="M40 120 C120 150 160 180 200 200" />
          <path d="M360 90 C300 140 240 175 200 200" />
          <path d="M200 200 C210 260 230 320 250 380" />
          <path d="M200 200 C150 230 90 260 30 300" />
        </g>
        <circle cx="200" cy="200" r="22" fill="none" stroke="#BFC3C7" strokeOpacity="0.4" />
        <g className="origin-center motion-safe:animate-[spin_6s_linear_infinite]" style={{ transformOrigin: '200px 200px' }}>
          <path d="M200 200 L200 10 A190 190 0 0 1 334 66 Z" fill="url(#sweep)" />
        </g>
      </svg>
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <span className="pulse-dot block !h-3 !w-3 shadow-[0_0_24px_#C6FF00]" />
      </div>
      <span className="eyebrow absolute left-[56%] top-[44%] !text-bone">Ek Rupaya Chowk</span>
      <span className="eyebrow absolute bottom-[6%] left-1/2 -translate-x-1/2 !text-[0.6rem]">Rohtak · Haryana</span>
    </div>
  );
}

export default function Location() {
  return (
    <section id="location" className="relative overflow-hidden border-t border-bone/[0.06] bg-charcoal py-28 md:py-40">
      <div className="gutter mx-auto grid max-w-[1600px] items-center gap-16 lg:grid-cols-2">
        <div>
          <p className="eyebrow mb-6 flex items-center gap-3">
            <span className="inline-block h-px w-8 bg-lime" /> Location
          </p>
          <SplitReveal
            lines={['FC Gym —', { text: 'Coming soon.', className: 'metal-text' }]}
            className="display text-[clamp(3.2rem,14vw,7rem)] lg:text-[min(7.4vw,8.5rem)]"
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <address className="mt-10 flex items-start gap-4 not-italic">
              <span className="mt-1 grid h-11 w-11 shrink-0 place-items-center rounded-full border border-bone/15 text-lime">
                <MapPin className="h-5 w-5" />
              </span>
              <span className="text-xl leading-snug text-bone md:text-2xl">
                Ek Rupaya Chowk,
                <br />
                Rohtak, Haryana.
              </span>
            </address>
            <a
              href={SITE.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group btn-ghost mt-10 inline-flex h-14 items-center gap-3 rounded-full px-7 text-[0.78rem] font-semibold uppercase tracking-[0.16em]"
            >
              <span className="roll">
                <span>Open area in Google Maps</span>
                <span className="text-lime">Open area in Google Maps</span>
              </span>
              <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:rotate-45" />
            </a>
            <p className="mt-5 max-w-sm text-sm text-silver/60">
              Shows the Ek Rupaya Chowk area. The exact address will be shared by FC Gym closer to launch.
            </p>
          </motion.div>
        </div>
        <div className="flex justify-center lg:justify-end">
          <Radar />
        </div>
      </div>
    </section>
  );
}
