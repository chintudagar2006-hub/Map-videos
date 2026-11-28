'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { scrollToHash, useLenis } from './SmoothScroll';

/** Mobile-only pre-book bar: appears after the hero, hides while the form or footer is on screen. */
export default function StickyCTA() {
  const lenis = useLenis();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const form = document.getElementById('prebook');
    let formVisible = false;
    const io = new IntersectionObserver(([e]) => { formVisible = e.isIntersecting; update(); }, { threshold: 0.05 });
    if (form) io.observe(form);
    const update = () => {
      const bottom = scrollY + innerHeight > document.documentElement.scrollHeight - 200;
      setShow(scrollY > innerHeight * 0.85 && !formVisible && !bottom);
    };
    update();
    addEventListener('scroll', update, { passive: true });
    return () => { io.disconnect(); removeEventListener('scroll', update); };
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="hide-in-showcase fixed inset-x-0 bottom-0 z-[60] px-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:hidden"
          initial={{ y: '120%' }}
          animate={{ y: 0 }}
          exit={{ y: '120%' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="glass flex items-center justify-between gap-3 rounded-full py-2 pl-5 pr-2">
            <span className="flex items-center gap-2 text-xs text-silver">
              <span className="pulse-dot" aria-hidden="true" /> Pre-booking open
            </span>
            <a
              href="#prebook"
              onClick={(e) => { e.preventDefault(); scrollToHash(lenis, '#prebook'); }}
              className="btn-primary inline-flex h-11 items-center gap-2 rounded-full px-5 text-[0.7rem] font-semibold uppercase tracking-[0.16em]"
            >
              Pre-book <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
