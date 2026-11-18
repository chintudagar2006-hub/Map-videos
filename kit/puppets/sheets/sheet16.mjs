// SHEET 16 — episode cast: E-MAX MOON (original fictional tech billionaire) and his teenage son.
import { withHair } from '../hair_lib.mjs';
import { INK, P, L, ell, f1, GOLD, fillPts, rect, circ, hl } from '../castkit.mjs';
export const TITLE = 'Cast sheet 16: Billionaire dad';
const CYAN = '#3fe0ff', CYAND = '#1aa6c8', SUIT = '#2a2e3a', SUIT2 = '#3a3f4f';
const RAW = [
  // E-MAX MOON: tall noodle body, huge black futuristic suit with shoulder plates and cyan circuit piping,
  // a crescent-moon chest emblem, messy spiky dark hair, one glowing cyan lens over his left eye, a thin smug chin tuft.
  { name: 'emax', label: 'E-MAX MOON', form: 'noodle', coat: SUIT, face: 'awkward',
    faceTop: ({ cx, hy }) => [
      // the AR lens: a round cyan glass on a thin wire over the left eye
      `<circle cx="${f1(cx - 36)}" cy="${f1(hy - 4)}" r="30" fill="${CYAN}" fill-opacity=".28" stroke="${INK}" stroke-width="5"/>`,
      `<circle cx="${f1(cx - 36)}" cy="${f1(hy - 4)}" r="30" fill="none" stroke="${CYAN}" stroke-width="2.5" stroke-opacity=".9"/>`,
      hl(`M${cx - 52},${hy - 18} q8,-10 20,-12`, 4, .8),
      L(`M${cx - 66},${hy - 6} Q${cx - 92},${hy - 10} ${cx - 98},${hy + 4}`, 4),
      // chin tuft
      P(`M${cx - 6},${hy + 86} q6,18 2,30 q8,-10 10,-30 Z`, '#2a2230', INK, 3)],
    details: ({ cx, top }) => [
      // high collar
      P(`M${cx - 46},${top - 6} L${cx - 30},${top + 30} L${cx + 30},${top + 30} L${cx + 46},${top - 6} L${cx + 26},${top - 20} L${cx - 26},${top - 20} Z`, SUIT2, INK, 4),
      // oversized shoulder plates
      ...[-1, 1].map(s => P(`M${cx + s * 40},${top + 10} Q${cx + s * 96},${top - 10} ${cx + s * 118},${top + 40} Q${cx + s * 96},${top + 66} ${cx + s * 56},${top + 60} Z`, SUIT2, INK, 4.5)),
      ...[-1, 1].map(s => L(`M${cx + s * 58},${top + 30} Q${cx + s * 90},${top + 20} ${cx + s * 106},${top + 42}`, 3, CYAN)),
      // lapels
      ...[-1, 1].map(s => P(`M${cx + s * 28},${top + 30} L${cx + s * 4},${top + 210} L${cx + s * 46},${top + 120} Z`, SUIT2, INK, 4)),
      // circuit piping down the front
      L(`M${cx - 10},${top + 220} L${cx - 10},${top + 300} l-18,18 l0,40`, 3, CYAN), L(`M${cx + 10},${top + 220} L${cx + 10},${top + 280} l20,20 l0,60`, 3, CYAN),
      ...[[cx - 28, top + 358], [cx + 30, top + 360]].map(([x, y]) => circ(x, y, 5, CYAN, 2.5)),
      // crescent moon emblem on the chest
      P(`M${cx + 44},${top + 92} a22,22 0 1,0 6,34 a17,17 0 1,1 -6,-34 Z`, CYAN, INK, 3.4),
      hl(`M${cx + 34},${top + 100} q-6,10 -2,22`, 3, .7)],
  },
  // THE SON: teen slouch, orange hoodie with a fox print, curtains haircut, headphones round the neck.
  { name: 'son', label: 'The Son', form: 'teen', coat: '#e8673c', face: ['teen', 'deadpan'],
    details: ({ cx, top }) => [
      P(`M${cx - 64},${top + 4} Q${cx},${top + 50} ${cx + 64},${top + 4} Q${cx},${top + 26} ${cx - 64},${top + 4} Z`, '#c9512c', INK, 3.5),
      L(`M${cx - 14},${top + 30} q-4,44 0,86 M${cx + 14},${top + 30} q4,44 0,86`, 3.2, '#f6efe2'),
      // headphones round the neck
      P(`M${cx - 70},${top - 4} Q${cx},${top + 56} ${cx + 70},${top - 4}`, 'none', INK, 9), L(`M${cx - 70},${top - 4} Q${cx},${top + 56} ${cx + 70},${top - 4}`, 5, '#3a3d4a'),
      ...[-1, 1].map(s => ell(cx + s * 72, top + 2, 20, 26, '#2a2c36', INK, 4)),
      // pocket
      P(`M${cx - 70},${top + 190} L${cx + 70},${top + 190} L${cx + 58},${top + 260} L${cx - 58},${top + 260} Z`, '#c9512c', INK, 4),
      // little fox face print
      P(`M${cx - 26},${top + 96} l26,34 l26,-34 l-10,-4 l-16,10 l-16,-10 Z`, '#fff3e0', INK, 3), circ(cx, top + 126, 4, INK, 0)],
  },
];

export const CAST = [withHair(RAW[0], 'spiky', { col: '#1f1a24' }), withHair(RAW[1], 'curtains90', { col: '#6a4024' })];
