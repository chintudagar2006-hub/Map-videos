import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Wordmark from '@/components/Wordmark';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Credits & disclosure — FC Gym Rohtak concept',
  description: 'Asset licences and disclosure for the FC Gym Rohtak website design concept.',
};

const ASSETS = [
  ['52094', 'A shirtless young man does repetitions lifting the heavy barbell', 'Hero video, strength image'],
  ['52080', 'A young muscular man training his strength and overall fitness', 'Mobile hero video'],
  ['23056', 'Man jumping the rope at the gym', 'Scroll sequence, cardio image'],
  ['40235', 'Woman lifting weights at the gym', 'Scroll sequence, showcase'],
  ['4596', 'Man bandaging his hand before boxing', 'Scroll sequence, showcase'],
  ['52091', 'A muscular shirtless young man on his strength training', 'Scroll sequence, showcase'],
  ['52088', 'A shirtless young man swings the battle ropes', 'Functional image'],
  ['52084', 'Portrait of a concentrated young shirtless man', 'Personal journey image'],
  ['23450', 'Man training on the bars in the gym', 'Showcase'],
  ['45874', 'Lightweight boxer practicing in a dark boxing ring', 'Showcase'],
  ['40250', 'Man throwing barbells to the floor', 'Pre-booking background'],
];

export default function Credits() {
  return (
    <main className="gutter mx-auto min-h-screen max-w-[1100px] py-16 md:py-24">
      <Link href="/" className="group inline-flex items-center gap-3 text-sm text-silver hover:text-bone">
        <ArrowLeft className="h-4 w-4 transition-transform duration-500 group-hover:-translate-x-1" /> Back to the site
      </Link>
      <div className="mt-16 text-[4rem]"><Wordmark /></div>
      <h1 className="display mt-10 text-[clamp(3rem,8vw,6rem)]">Credits &amp; <span className="metal-text">disclosure</span></h1>
      <p className="mt-8 max-w-2xl text-lg text-silver">
        <span className="text-bone">{SITE.disclosure}</span> This is an independent portfolio project. It uses a temporary
        concept wordmark and does not imply that FC Gym commissioned or approved it. No prices, dates or offers are
        stated, and the pre-booking form is a simulation that sends and stores nothing.
      </p>

      <h2 className="eyebrow mt-16">Imagery &amp; footage</h2>
      <p className="mt-4 max-w-2xl text-silver">
        All visuals are concept imagery — not photographs of the FC Gym premises. Clips come from{' '}
        <a className="link-line text-bone" href="https://mixkit.co/license/#videoFree" target="_blank" rel="noopener noreferrer">Mixkit</a>{' '}
        under the Mixkit Stock Video Free License (free for commercial use, no attribution required), downloaded,
        colour-graded and compressed locally.
      </p>
      <ul className="mt-8 divide-y divide-bone/10 border-y border-bone/10">
        {ASSETS.map(([id, t, use]) => (
          <li key={id} className="grid gap-1 py-4 text-sm md:grid-cols-[6rem_1fr_16rem]">
            <span className="font-mono text-lime">#{id}</span>
            <span className="text-bone">{t}</span>
            <span className="text-silver md:text-right">{use}</span>
          </li>
        ))}
      </ul>

      <h2 className="eyebrow mt-16">Type &amp; tools</h2>
      <p className="mt-4 max-w-2xl text-silver">
        Archivo, Inter Tight and JetBrains Mono (SIL Open Font License). Built with Next.js, Tailwind CSS, GSAP
        ScrollTrigger, Lenis, Motion and Lucide icons.
      </p>
    </main>
  );
}
