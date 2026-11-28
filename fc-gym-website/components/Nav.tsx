'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import Wordmark from './Wordmark';
import Magnetic from './Magnetic';
import { NAV, SITE } from '@/lib/site';
import { scrollToHash, useLenis } from './SmoothScroll';

export default function Nav() {
  const lenis = useLenis();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      setHidden(y > last && y > innerHeight * 0.8);
      last = y;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (open) lenis?.stop();
    else lenis?.start();
    document.body.style.overflow = open ? 'hidden' : '';
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [open, lenis]);

  const go = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setOpen(false);
    // let the overlay close before scrolling
    setTimeout(() => scrollToHash(lenis, href), open ? 350 : 0);
  };

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-[70] transition-transform duration-700 [transition-timing-function:var(--ease-out)] ${
          hidden && !open ? '-translate-y-full' : 'translate-y-0'
        }`}
      >
        <div className="gutter pt-3 md:pt-4">
          <nav
            aria-label="Main"
            className={`mx-auto flex h-14 max-w-[1600px] items-center justify-between rounded-full pl-5 pr-2 transition-all duration-700 md:h-16 md:pl-7 ${
              scrolled ? 'glass' : 'border border-transparent'
            }`}
          >
            <a href="#top" onClick={(e) => go(e, '#top')} className="text-[1.65rem] md:text-[1.9rem]">
              <Wordmark />
            </a>

            <ul className="hidden items-center gap-9 lg:flex">
              {NAV.map((n) => (
                <li key={n.href}>
                  <a
                    href={n.href}
                    onClick={(e) => go(e, n.href)}
                    className="group eyebrow !text-bone/80 hover:!text-bone"
                  >
                    <span className="roll">
                      <span>{n.label}</span>
                      <span className="text-lime">{n.label}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-2">
              <Magnetic className="hidden sm:inline-block">
                <a
                  href="#prebook"
                  onClick={(e) => go(e, '#prebook')}
                  className="group btn-primary inline-flex h-10 items-center gap-2 rounded-full px-5 text-[0.72rem] font-semibold uppercase tracking-[0.16em] md:h-12 md:px-6"
                >
                  <span className="roll">
                    <span>Pre-book</span>
                    <span>Pre-book</span>
                  </span>
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:rotate-45" />
                </a>
              </Magnetic>
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-controls="mobile-menu"
                aria-label={open ? 'Close menu' : 'Open menu'}
                className="grid h-10 w-10 place-items-center rounded-full border border-bone/15 text-bone lg:hidden md:h-12 md:w-12"
              >
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </nav>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="fixed inset-0 z-[65] flex flex-col justify-between bg-obsidian/95 px-6 pb-10 pt-28 backdrop-blur-xl lg:hidden"
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
          >
            <ul className="space-y-1">
              {[...NAV, { href: '#prebook', label: 'Pre-book' }].map((n, i) => (
                <li key={n.href} className="overflow-hidden">
                  <motion.a
                    href={n.href}
                    onClick={(e) => go(e, n.href)}
                    className="display flex items-baseline gap-4 py-1 text-[clamp(3rem,15vw,5.5rem)] text-bone"
                    initial={{ y: '110%' }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.15 + i * 0.06 }}
                  >
                    <span className="font-mono text-xs font-normal tracking-widest text-lime">0{i + 1}</span>
                    {n.label}
                  </motion.a>
                </li>
              ))}
            </ul>
            <motion.div
              className="space-y-2 text-sm text-silver"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <p className="eyebrow">Coming soon</p>
              <p>{SITE.location}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
