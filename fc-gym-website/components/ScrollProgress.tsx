'use client';

import { motion, useScroll, useSpring } from 'motion/react';

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.3 });
  return (
    <motion.div
      aria-hidden="true"
      className="fixed left-0 right-0 top-0 z-[80] h-[2px] origin-left bg-lime"
      style={{ scaleX }}
    />
  );
}
