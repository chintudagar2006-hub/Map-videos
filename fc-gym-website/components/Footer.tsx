import Link from 'next/link';
import Wordmark from './Wordmark';
import { SITE } from '@/lib/site';

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-obsidian pb-28 pt-24 md:pb-10">
      <div className="gutter mx-auto max-w-[1600px]">
        <div className="text-[clamp(5rem,26vw,25rem)] leading-none" aria-hidden="true">
          <Wordmark />
        </div>
        <div className="hairline my-10" />
        <div className="grid gap-8 text-sm text-silver md:grid-cols-3">
          <p>
            <span className="eyebrow mb-2 block">Coming soon</span>
            {SITE.location}
          </p>
          <p>
            <span className="eyebrow mb-2 block">Imagery</span>
            Concept imagery from licensed stock footage — not photographs of the FC Gym premises.{' '}
            <Link href="/credits/" className="link-line text-bone">Credits</Link>
          </p>
          <p className="md:text-right">
            <span className="eyebrow mb-2 block">Disclosure</span>
            <span className="text-bone">{SITE.disclosure}</span> Concept wordmark; not commissioned or approved by FC Gym.
          </p>
        </div>
      </div>
    </footer>
  );
}
