import type { Metadata, Viewport } from 'next';
import { Archivo, Inter_Tight, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { SITE } from '@/lib/site';
import SmoothScroll from '@/components/SmoothScroll';

const display = Archivo({
  subsets: ['latin'],
  axes: ['wdth'],
  variable: '--font-display',
  display: 'swap',
});
const sans = Inter_Tight({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});

const title = 'FC Gym Rohtak — Coming Soon to Ek Rupaya Chowk | Pre-book';
const description =
  'A new fitness experience is coming to Ek Rupaya Chowk, Rohtak. Register your interest and be first to hear about the FC Gym launch. (Independent design concept.)';

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title,
  description,
  applicationName: 'FC Gym Rohtak (concept)',
  keywords: ['FC Gym', 'Rohtak gym', 'Ek Rupaya Chowk', 'gym Rohtak', 'fitness Rohtak', 'pre-book gym'],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    title,
    description,
    url: '/',
    siteName: 'FC Gym Rohtak — concept',
    images: [{ url: '/og.jpg', width: 1200, height: 630, alt: 'FC Gym Rohtak — Get Stronger' }],
    locale: 'en_IN',
  },
  twitter: { card: 'summary_large_image', title, description, images: ['/og.jpg'] },
  robots: { index: false, follow: false }, // portfolio concept: keep out of search results
  icons: { icon: '/favicon.svg' },
};

export const viewport: Viewport = {
  themeColor: '#080808',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

// Runs before first paint: decides whether the intro plays and whether showcase mode is on.
const bootScript = `(function(){try{var d=document.documentElement,q=location.search;
var sc=/[?&]showcase(=1|=true)?(&|$)/.test(q);if(sc){d.setAttribute('data-showcase','true');sessionStorage.setItem('fc-showcase','1')}
else if(sessionStorage.getItem('fc-showcase')==='1'){d.setAttribute('data-showcase','true')}
var rm=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if(rm||(!sc&&sessionStorage.getItem('fc-intro')==='1')){d.setAttribute('data-intro','skip')}
sessionStorage.setItem('fc-intro','1');}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
        <link rel="preload" as="image" href="/media/hero-poster.webp" media="(min-width: 768px)" />
        <link rel="preload" as="image" href="/media/hero-poster-m.webp" media="(max-width: 767px)" />
      </head>
      <body className="font-sans">
        <SmoothScroll>{children}</SmoothScroll>
        <div className="grain" aria-hidden="true" />
      </body>
    </html>
  );
}
