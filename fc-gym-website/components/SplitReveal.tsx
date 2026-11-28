'use client';

import { motion, useReducedMotion } from 'motion/react';

/**
 * Splits text into lines → words and reveals each word from a mask when it scrolls into view.
 * `lines` keeps intentional editorial line breaks.
 */
export default function SplitReveal({
  lines,
  className = '',
  lineClassName = '',
  delay = 0,
  as: Tag = 'h2',
}: {
  lines: (string | { text: string; className?: string })[];
  className?: string;
  lineClassName?: string;
  delay?: number;
  as?: 'h1' | 'h2' | 'h3' | 'p';
}) {
  const reduce = useReducedMotion();
  let i = 0;
  return (
    <Tag className={className}>
      {lines.map((line, li) => {
        const l = typeof line === 'string' ? { text: line } : line;
        return (
          <span key={li} className={`block ${lineClassName}`}>
            {l.text.split(' ').map((w, wi) => {
              const d = delay + i++ * 0.06;
              return (
                <span key={wi} className="inline-block overflow-hidden pb-[0.06em] align-top">
                  <motion.span
                    className={`inline-block ${l.className ?? ''}`}
                    initial={reduce ? false : { y: '108%', rotate: 4 }}
                    whileInView={{ y: '0%', rotate: 0 }}
                    viewport={{ once: true, margin: '0px 0px -12% 0px' }}
                    transition={{ duration: 1.05, ease: [0.16, 1, 0.3, 1], delay: d }}
                  >
                    {w}
                    {wi < l.text.split(' ').length - 1 ? ' ' : ''}
                  </motion.span>
                </span>
              );
            })}
          </span>
        );
      })}
    </Tag>
  );
}
