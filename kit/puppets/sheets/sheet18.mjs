// SHEET 18 — episode cast: the JUNIOR ENGINEER (flat cap, rolled white sleeves, brown waistcoat, tool belt), the CHIEF ARCHITECT
// (stout, grey frock coat, top hat, big moustache, rolled blueprint) and a RIVAL WORKER (broad, blue shirt, braces, flat cap).
import { withHair } from '../hair_lib.mjs';
import { INK, P, L, ell, f1, GOLD, fillPts, rect, circ, hl } from '../castkit.mjs';
export const TITLE = 'Cast sheet 18: Sand bridge';
const RAW = [
  { name: 'engineer', label: 'Junior Engineer', form: 'standard', coat: '#8a5a32', face: 'standard',
    details: ({ cx, top }) => [
      P(`M${cx - 44},${top - 6} L${cx - 6},${top + 70} L${cx - 6},${top + 300} L${cx - 60},${top + 300} Z`, '#f2efe8', INK, 3.5),      // shirt front
      P(`M${cx + 44},${top - 6} L${cx + 6},${top + 70} L${cx + 6},${top + 300} L${cx + 60},${top + 300} Z`, '#f2efe8', INK, 3.5),
      ...[0, 1, 2].map(k => circ(cx - 22, top + 120 + k * 50, 6, GOLD, 2.5)), ...[0, 1, 2].map(k => circ(cx + 22, top + 120 + k * 50, 6, GOLD, 2.5)),
      rect(cx - 74, top + 268, 148, 26, '#4a2e1a', 4, 4), rect(cx - 10, top + 270, 22, 22, GOLD, 3, 3),                            // tool belt
      P(`M${cx + 40},${top + 296} l10,0 l4,46 l-18,0 Z`, '#9aa0aa', INK, 3), P(`M${cx - 54},${top + 296} l14,0 l-2,36 l-10,0 Z`, '#c8963c', INK, 3),
      P(`M${cx - 18},${top - 8} L${cx},${top + 22} L${cx + 18},${top - 8} Z`, '#c0392b', INK, 3)] },                               // red neckerchief
  { name: 'architect', label: 'Chief Architect', form: 'bigboi', coat: '#6a6e7a', face: 'standard', moustache: '#e8e4dc',
    details: ({ cx, top }) => [
      P(`M${cx - 50},${top - 6} L${cx},${top + 80} L${cx + 50},${top - 6} Z`, '#f2efe8', INK, 4), P(`M${cx - 14},${top + 6} L${cx},${top + 40} L${cx + 14},${top + 6} Z`, '#2a2a30', INK, 3),
      ...[-1, 1].map(s => P(`M${cx + s * 50},${top - 8} L${cx + s * 12},${top + 160} L${cx + s * 40},${top + 190} L${cx + s * 130},${top + 40} Z`, '#555a66', INK, 4)),
      ...[0, 1, 2, 3].map(k => circ(cx - 26, top + 210 + k * 55, 8, GOLD, 3)),
      L(`M${cx + 20},${top + 170} Q${cx + 60},${top + 200} ${cx + 80},${top + 170}`, 3.5, GOLD), circ(cx + 80, top + 168, 9, GOLD, 3)] },   // watch chain
  { name: 'worker', label: 'Rival Worker', form: 'chad', coat: '#3f6aa8', face: 'standard',
    details: ({ cx, top }) => [...[-1, 1].map(s => L(`M${cx + s * 40},${top - 4} L${cx + s * 34},${top + 340}`, 9, '#5a3a22')),
      P(`M${cx - 30},${top - 6} L${cx},${top + 40} L${cx + 30},${top - 6} Z`, '#e8dcc0', INK, 3), ...[0, 1].map(k => circ(cx, top + 80 + k * 60, 6, '#f2efe8', 2.5)), hl(`M${cx - 70},${top + 60} q-8,80 -2,160`, 6, .3)] },
];
export const CAST = [withHair(RAW[0], 'messyBun' === 'x' ? 'x' : 'curlyCrop', { col: '#6a3c20', hat: 'flatcap' }), withHair(RAW[1], 'combOver', { col: '#d8d4cc', hat: 'tophat' }), withHair(RAW[2], 'buzz', { col: '#3a2a20', hat: 'flatcap' })];
