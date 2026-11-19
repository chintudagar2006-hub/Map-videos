// SHEET 20 — episode cast: the ROOF PAINTER (calm everyman in white painter's overalls splashed with paint, a white painter's
// cap, a brush in the bib pocket). Used by "White Roof" with sheet-13 BBQ Dad as the loud neighbour.
import { withHair } from '../hair_lib.mjs';
import { INK, P, L, ell, rect, circ, hl } from '../castkit.mjs';
export const TITLE = 'Cast sheet 20: White roof';
const WHITE = '#f4f2ec', SHADE = '#d9d6cc', TEE = '#3f7fc8';
const painter = { name: 'painter', label: 'Roof Painter', form: 'standard', coat: TEE, face: 'standard',
  details: ({ cx, top }) => [
    P(`M${cx - 70},${top + 110} L${cx + 70},${top + 110} L${cx + 78},${top + 345} L${cx - 78},${top + 345} Z`, WHITE, INK, 4),        // overall bib + legs top
    ...[-1, 1].map(s => P(`M${cx + s * 58},${top + 112} L${cx + s * 44},${top - 4} L${cx + s * 28},${top - 4} L${cx + s * 40},${top + 112} Z`, WHITE, INK, 3.5)),   // straps
    ...[-1, 1].map(s => circ(cx + s * 50, top + 122, 7, '#c9cdd6', 2.5)),
    rect(cx - 34, top + 150, 68, 56, SHADE, 3, 6),                                                                                    // bib pocket
    P(`M${cx + 8},${top + 92} l14,0 l0,64 l-14,0 Z`, '#b07a46', INK, 3), P(`M${cx + 4},${top + 74} l22,0 l-2,20 l-18,0 Z`, '#f8f8f8', INK, 3), // brush
    ...[[-46, 230, 13], [30, 260, 9], [-12, 300, 16], [52, 190, 7], [-60, 168, 6]].map(([x, y, r]) => ell(cx + x, top + y, r, r * .8, '#ffffff', '#c8c4b8', 2)),
    ...[[40, 310, 6], [-30, 270, 5]].map(([x, y, r]) => circ(cx + x, top + y, r, '#e8c25a', 0)),
    hl(`M${cx - 60},${top + 130} q-6,100 -2,200`, 6, .35)] };
const base = withHair(painter, 'texturedCrop', { col: '#5a3a22' });
// a white painter's cap with a short brim, a few paint drops on it
base.hat = ({ cx, hy }) => [
  P(`M${cx - 118},${hy - 52} Q${cx - 112},${hy - 150} ${cx},${hy - 156} Q${cx + 112},${hy - 150} ${cx + 118},${hy - 52} Z`, WHITE, INK, 6),
  P(`M${cx + 20},${hy - 60} Q${cx + 120},${hy - 70} ${cx + 182},${hy - 44} Q${cx + 120},${hy - 30} ${cx + 18},${hy - 40} Z`, SHADE, INK, 5),
  L(`M${cx - 116},${hy - 66} Q${cx},${hy - 80} ${cx + 116},${hy - 66}`, 4, INK),
  ...[[-60, -110, 9], [30, -128, 7], [70, -96, 6]].map(([x, y, r]) => circ(cx + x, hy + y, r, '#e8c25a', 0)),
  hl(`M${cx - 80},${hy - 110} Q${cx - 40},${hy - 140} ${cx + 10},${hy - 146}`, 7, .5)];
export const CAST = [base];
