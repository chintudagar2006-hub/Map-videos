// SHEET 17 — episode cast: BRO (gelled hair, black leather jacket, white V-tee, gold chain) and his GIRLFRIEND (pink pyjamas, messy bun).
import { withHair } from '../hair_lib.mjs';
import { INK, P, L, ell, f1, GOLD, fillPts, rect, circ, hl } from '../castkit.mjs';
export const TITLE = 'Cast sheet 17: Condom run';
const RAW = [
  { name: 'bro', label: 'Bro', form: 'chad', coat: '#2b2b33', face: 'cool',
    details: ({ cx, top }) => [
      P(`M${cx - 46},${top - 4} L${cx},${top + 96} L${cx + 46},${top - 4} Z`, '#f6f3ee', INK, 4),                       // white V-tee
      ...[-1, 1].map(s => P(`M${cx + s * 46},${top - 6} L${cx + s * 10},${top + 120} L${cx + s * 30},${top + 150} L${cx + s * 100},${top + 30} Z`, '#3a3a44', INK, 4)),   // lapels
      L(`M${cx - 34},${top + 6} Q${cx},${top + 74} ${cx + 34},${top + 6}`, 6, '#e8b53a'), circ(cx, top + 62, 9, GOLD, 3),    // gold chain + pendant
      L(`M${cx + 6},${top + 150} L${cx + 6},${top + 330}`, 3, '#9a9aa8'), ...[0, 1, 2, 3].map(k => L(`M${cx + 1},${top + 170 + k * 40} l10,0`, 3, '#9a9aa8')),   // zip
      hl(`M${cx - 70},${top + 60} q-10,80 -4,160`, 6, .35)],
  },
  { name: 'gf', label: 'Girlfriend', form: 'lady', coat: '#f4a9bd', face: ['female', 'sleepy'],
    details: ({ cx, top }) => [...[0, 1, 2, 3, 4, 5].map(k => circ(cx - 50 + (k % 3) * 50, top + 80 + Math.floor(k / 3) * 90, 9, '#ffffff', 2.5)),
      P(`M${cx - 30},${top} Q${cx},${top + 30} ${cx + 30},${top}`, 'none', INK, 4)] },
  { name: 'cashier', label: 'Pharmacy Cashier', form: 'standard', coat: '#3f9a6a', face: 'tired',
    details: ({ cx, top }) => [P(`M${cx - 40},${top - 6} L${cx},${top + 60} L${cx + 40},${top - 6} Z`, '#f6f3ee', INK, 4),
      rect(cx + 20, top + 70, 56, 26, '#ffffff', 3, 4), L(`M${cx + 28},${top + 83} l38,0`, 3, '#3f9a6a'),
      P(`M${cx - 44},${top + 150} L${cx + 44},${top + 150} L${cx + 40},${top + 230} L${cx - 40},${top + 230} Z`, '#2f7a52', INK, 4),
      P(`M${cx - 12},${top + 120} l24,0 l0,-10 l12,0 l0,-12 l-12,0 l0,-10 l-24,0 l0,10 l-12,0 l0,12 l12,0 Z`, '#ffffff', INK, 2.5)] },
];
export const CAST = [withHair(RAW[0], 'slickBack', { col: '#2a1c14' }), withHair(RAW[1], 'messyBun', { col: '#7a4a2e' }), withHair(RAW[2], 'buzz', { col: '#3a2a20' })];
