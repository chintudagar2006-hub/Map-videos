// SHEET 19 — episode cast: VIPER (tall hooded assassin, plum cloak, dagger, squints because he lost his glasses) and the HEAD CHEF
// (the sheet-06 chef body and toque, without the ladle, so he can hold a giant cleaver as a 3D prop).
import { INK, P, L, ell, f1, GOLD, fillPts, rect, circ, hl } from '../castkit.mjs';
import { CAST as S6 } from './sheet06.mjs';
export const TITLE = 'Cast sheet 19: Viper';
const HOOD = '#2e2638', HOOD2 = '#1c1724';
const viper = { name: 'viper', label: 'Viper', form: 'noodle', coat: HOOD, face: 'sus',
  headBack: ({ cx, hy }) => [P(`M${cx - 150},${hy + 40} Q${cx - 160},${hy - 150} ${cx},${hy - 168} Q${cx + 160},${hy - 150} ${cx + 150},${hy + 40} Q${cx + 150},${hy + 150} ${cx + 96},${hy + 170} L${cx - 96},${hy + 170} Q${cx - 150},${hy + 150} ${cx - 150},${hy + 40} Z`, HOOD, INK, 6)],
  hat: ({ cx, hy }) => [
    // the hood: a peaked cowl over the head that leaves the face open, with a dark inner shadow band
    `<path d="M${cx - 150},${hy + 70} Q${cx - 168},${hy - 140} ${cx + 6},${hy - 176} Q${cx + 40},${hy - 200} ${cx + 30},${hy - 168} Q${cx + 160},${hy - 120} ${cx + 150},${hy + 70} L${cx + 112},${hy + 70} Q${cx + 128},${hy - 104} ${cx},${hy - 120} Q${cx - 128},${hy - 104} ${cx - 112},${hy + 70} Z" fill="${HOOD}" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>`,
    P(`M${cx - 112},${hy + 70} Q${cx - 128},${hy - 104} ${cx},${hy - 120} Q${cx + 128},${hy - 104} ${cx + 112},${hy + 70} L${cx + 98},${hy + 70} Q${cx + 112},${hy - 88} ${cx},${hy - 102} Q${cx - 112},${hy - 88} ${cx - 98},${hy + 70} Z`, HOOD2, 'none', 0),
    hl(`M${cx - 120},${hy - 70} Q${cx - 80},${hy - 140} ${cx - 10},${hy - 156}`, 8, .22)],
  faceTop: ({ cx, hy }) => [P(`M${cx - 100},${hy + 58} Q${cx},${hy + 96} ${cx + 100},${hy + 58} L${cx + 92},${hy + 112} Q${cx},${hy + 140} ${cx - 92},${hy + 112} Z`, HOOD2, INK, 5)],   // a face scarf over the chin
  details: ({ cx, top }) => [
    ...[-1, 1].map(s => P(`M${cx + s * 60},${top - 10} L${cx + s * 20},${top + 120} L${cx + s * 6},${top + 330} L${cx + s * 70},${top + 330} Z`, HOOD2, INK, 4)),
    rect(cx - 64, top + 190, 128, 24, '#5a3a22', 4, 3), rect(cx - 10, top + 190, 20, 24, GOLD, 3, 2),
    P(`M${cx + 30},${top + 210} l12,0 l2,64 l-6,18 l-6,-18 Z`, '#c9cdd6', INK, 3), rect(cx + 26, top + 204, 22, 10, '#3a2a1a', 2.5, 2),     // dagger
    hl(`M${cx - 50},${top + 40} q-10,120 -4,240`, 6, .2)] };
const base = S6.find(c => c.name === 'chef');
const headchef = { ...base, name: 'headchef', label: 'Head Chef', face: 'evil' }; delete headchef.over; delete headchef.arms;
export const CAST = [viper, headchef];
