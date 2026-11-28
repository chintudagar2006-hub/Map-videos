# FC Gym Rohtak — cinematic website concept

> **Independent website design concept. Not an official FC Gym website.**
> Temporary concept wordmark; not commissioned or approved by FC Gym. All imagery is concept imagery from
> licensed stock footage, not photographs of the FC Gym premises.

A premium, scroll-driven pre-launch site for an upcoming gym at Ek Rupaya Chowk, Rohtak, Haryana.

**Stack (all free / open source):** Next.js 15 (static export) · TypeScript · Tailwind CSS · GSAP + ScrollTrigger ·
Lenis · Motion for React · Lucide icons · Archivo / Inter Tight / JetBrains Mono (OFL) · FFmpeg for media.
Three.js was deliberately left out: nothing on the page needed real 3D, and skipping it saves ~150 KB of JS on
mobile.

## What's inside

| Section | Highlights |
| --- | --- |
| Opening | Pure-CSS, ~1.4 s metallic light sweep + lime accent. Plays once per session (sessionStorage), never for reduced-motion users. |
| Hero | Graded looping video (separate 720p vertical file for phones, poster-only on Data Saver), split reveal, layered parallax, cursor-responsive light, Coming Soon pulse, scroll indicator. |
| Cinematic sequence | 420vh section with a CSS-sticky canvas. Native scroll drives 120 frames (72 portrait frames on phones), loaded progressively; three typographic beats synced to the scroll. No scroll hijacking. |
| Vision | Asymmetric editorial grid, masked image reveals, depth parallax, ghost type. Every tile labelled "Proposed concept". |
| Showcase | Horizontal scroll on desktop (containerAnimation masks, image drift, rolling counter); stacked masked reveals on mobile/tablet. |
| Pre-booking | Glass form with validation (Indian mobile numbers), accessible errors, simulated submission and a clearly labelled **demo confirmation**. Nothing is sent or stored. |
| Location | "FC Gym — Coming Soon", Ek Rupaya Chowk, Rohtak, Haryana + a Google Maps *area* search link (no invented address). |
| Extras | Scroll progress bar, magnetic buttons (fine pointers only), rolling nav links, glass nav that hides on scroll down, mobile full-screen menu, sticky mobile pre-book bar, film grain, `/credits` page with route transition. |

## Run locally

```bash
cd fc-gym-website
npm install
npm run dev          # http://localhost:3000 (development)
# or the production build:
npm run build        # static site in ./out
npx serve out        # http://localhost:3000
```

Media is already in `public/media`. To rebuild it from the original clips (needs `curl` + `ffmpeg`):

```bash
npm run assets       # downloads Mixkit clips, grades + compresses them, exports the frame sequence
```

## Showcase / screen-recording mode

Open **`/?showcase`** (e.g. `http://localhost:3000/?showcase`). In this mode:

- the opening animation plays on every load (normally it plays once per session),
- the sticky mobile pre-book bar is hidden,
- press **P** to start a smooth constant-speed auto-scroll through the whole page, **Esc** to stop, **Home** to jump to top.

Use the production build (`npm run build && npx serve out`) so there are no development overlays at all. The mode
sticks for the browser tab; close the tab to leave it.

## Testing

```bash
npm run build
npm i -D playwright && npx playwright install chromium   # once
npm run test:visual   # serves ./out, screenshots desktop + iPhone 13 into ./screenshots,
                      # fails on console errors, 4xx responses, horizontal overflow, broken form flow
```

## Deploy free (static hosting)

The site is a fully static export (`out/`), so any free static host works:

- **Cloudflare Pages** — build command `npm run build`, output directory `out`, root directory `fc-gym-website`.
- **Netlify** — same settings (base `fc-gym-website`, build `npm run build`, publish `out`), or drag-and-drop the `out` folder at app.netlify.com/drop.
- **Vercel** — import the repo, set root directory to `fc-gym-website`; Next.js is detected automatically.
- **GitHub Pages** — upload `out/` (add an empty `.nojekyll` file). If served from a sub-path, set `basePath` in `next.config.mjs`.

Set `NEXT_PUBLIC_SITE_URL` to the final URL for correct Open Graph links. The site ships with
`robots: noindex` because it is a portfolio concept; remove that in `app/layout.tsx` only for an authorised launch.

## Going live (if FC Gym ever adopts it)

1. Replace the concept wordmark (`components/Wordmark.tsx`, `public/favicon.svg`) with official branding.
2. Replace stock footage with real photos/videos of the premises and remove the concept labels.
3. Connect the form to an authorised backend and publish a privacy policy before collecting any personal data
   (the submit handler in `components/PreBook.tsx` is marked where to do this).
4. Only add prices, dates or offers that FC Gym has confirmed.

## Asset licences

All footage: [Mixkit](https://mixkit.co/license/#videoFree) — Mixkit Stock Video Free License (free commercial use,
no attribution required). Clip IDs and where each is used are listed on the `/credits` page and in
`scripts/build-assets.sh`. Fonts: SIL Open Font License via Google Fonts (self-hosted at build time by `next/font`).
