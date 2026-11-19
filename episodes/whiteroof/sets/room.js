// A LIVING ROOM in the valley, two dressings by place option `mode`:
//  hot  = a black-tar house at midnight in the heatwave: orange-red light, a struggling desk fan, a wall thermometer at 108°F,
//         a melting candle, a clock at 12:00, the AC unit in the window rattling until the grid trips (cue trip) -> lights out.
//  cool = HIS house: calm blue-white light, the same layout but tidy, thermometer at 88°F, a lemonade on the side table,
//         the AC unit switched OFF with a sticky note "OFF", plants, a cat asleep.
// Plan metres, Z up. Couch along the back wall at y = 1.8; SEAT_L / SEAT_R are the two seats (sit_chair puts the hips there).
import { kit, signTex } from './lib.js';
export const SEAT_L = [-0.7, 1.35, 0], SEAT_R = [0.7, 1.35, 0], STAND = [1.9, 0.6, 0];
export function build(THREE, scene, film, ctx) {
  const K = kit(THREE, scene, ctx), { box, cyl, sph, panel, floor, mat, canvasTex, texMat, light, rnd } = K;
  const O = ctx.place || {}, C = O.cues || {}, HOT = O.mode !== 'cool', T = (k, d = 1e9) => C[k] ?? d;
  floor('floor', 'wood', 8, 7, [0, 1, 0], mat(HOT ? '#8a5a3a' : '#b08a62', { relief: 'wood', ro: { scale: .5 } }), { mat: 'wood_floor' });
  floor('rug', 'cloth', 3.4, 2.2, [0, .4, .01], mat(HOT ? '#8a2a2a' : '#4a7a9a'));
  const WALL = HOT ? '#c9895a' : '#dfe6ea';
  box('wall_back', 'plaster', 8, .1, 3, [0, 2.6, 0], WALL, { relief: 'plaster' }); box('wall_left', 'plaster', .1, 7, 3, [-4, 1, 0], WALL); box('wall_right', 'plaster', .1, 7, 3, [4, 1, 0], WALL);
  // couch
  box('couch_base', 'cloth', 2.8, .9, .45, [0, 1.75, 0], HOT ? '#7a4a3a' : '#5a6a8a'); box('couch_back', 'cloth', 2.8, .3, .9, [0, 2.25, 0], HOT ? '#6a3a2e' : '#4a5a7a');
  for (const s of [-1, 1]) box('couch_arm', 'cloth', .3, .9, .7, [s * 1.45, 1.75, 0], HOT ? '#6a3a2e' : '#4a5a7a');
  for (const s of [-1, 1]) box('cushion', 'cloth', 1.25, .75, .15, [s * .66, 1.7, .45], HOT ? '#8a5a4a' : '#6a7a9a');
  // side tables, lamp, TV
  box('side_table', 'wood', .6, .6, .6, [2.0, 1.8, 0], '#6a4428'); box('coffee_table', 'wood', 1.4, .7, .4, [0, .5, 0], '#6a4428');
  cyl('lamp_base', 'ceramic', .12, .4, [2.0, 1.8, .6], '#e8e2d6'); cyl('lamp_shade', 'cloth', .25, .3, [2.0, 1.8, 1.0], HOT ? '#ffb070' : '#f4f1ea', { r2: .18 });
  box('tv_stand', 'wood', 1.6, .5, .5, [-2.8, -.6, 0], '#3a2a1a'); box('tv', 'plastic', 1.3, .08, .8, [-2.8, -.6, .55], '#111');
  // window with the AC unit, outside view
  const night = canvasTex(256, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, HOT ? '#3a1020' : '#0a1a3a'); gr.addColorStop(1, HOT ? '#7a2a1a' : '#1a3a6a'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 40; i++) { g.fillStyle = 'rgba(255,255,255,.7)'; g.fillRect(rnd(i) * w, rnd(i + 3) * h * .6, 2, 2); } g.fillStyle = '#1a1018'; g.fillRect(0, h * .75, w, h * .25); });
  panel('window_view', 'glass', 1.6, 1.2, [-1.6, 2.54, 1.8], texMat(night)); box('window_frame', 'wood', 1.8, .08, .1, [-1.6, 2.53, 1.15], '#f2efe8'); box('window_frame', 'wood', 1.8, .08, .1, [-1.6, 2.53, 2.4], '#f2efe8');
  box('ac_box', 'metal', .9, .5, .5, [-1.6, 2.4, 1.2], '#d8dce4', { metal: 'steel' }); for (let i = 0; i < 6; i++) box('ac_grille', 'metal', .8, .02, .02, [-1.6, 2.14, 1.28 + i * .07], '#8a8e96');
  // thermometer + clock on the back wall
  const therm = signTex(K, 256, 512, '#f8f6f0', [[HOT ? '108°F' : '88°F', 70, HOT ? '#e2483d' : '#2e7dd1', 440]], { border: '#333', bw: 10, draw: (g) => { g.fillStyle = '#ddd'; g.fillRect(110, 40, 36, 330); g.fillStyle = HOT ? '#e2483d' : '#2e7dd1'; const lv = HOT ? 320 : 170; g.fillRect(114, 370 - lv, 28, lv); g.beginPath(); g.arc(128, 380, 34, 0, 7); g.fill(); } });
  panel('thermometer', 'plastic', .4, .8, [1.1, 2.54, 1.9], texMat(therm));
  const clock = canvasTex(256, 256, (g) => { g.fillStyle = '#fff'; g.beginPath(); g.arc(128, 128, 120, 0, 7); g.fill(); g.lineWidth = 10; g.strokeStyle = '#222'; g.stroke(); g.lineWidth = 12; g.beginPath(); g.moveTo(128, 128); g.lineTo(128, 40); g.stroke(); g.lineWidth = 8; g.beginPath(); g.moveTo(128, 128); g.lineTo(128, 60); g.stroke(); g.font = '900 34px Arial'; g.fillStyle = '#222'; g.textAlign = 'center'; g.fillText('12', 128, 52); });
  panel('clock', 'plastic', .5, .5, [-0.2, 2.54, 2.3], texMat(clock, { transparent: true }));
  // pictures, plants, a bookshelf
  for (const [x, c] of [[2.6, '#c0392b'], [3.2, '#2e7d5b']]) panel('picture', 'paper', .5, .4, [x, 2.54, 1.9], new THREE.MeshToonMaterial({ color: c }));
  box('shelf', 'wood', .4, 1.2, 2, [3.75, 0.2, 0], '#5a3a22'); for (let i = 0; i < 8; i++) box('book', 'paper', .25, .12, .3, [3.7, -.2 + (i % 4) * .25, .5 + Math.floor(i / 4) * .6], ['#c0392b', '#2e7d5b', '#e8c25a', '#3a3a46'][i % 4]);
  cyl('pot', 'ceramic', .2, .35, [-3.4, 2.1, 0], '#e8e2d6'); sph('plant', 'leaf', .38, [-3.4, 2.1, .7], HOT ? '#7a7a3a' : '#3d8b4a', { s: [1, 1, 1.3] });
  let fanBlade = null, candle = null, sticky = null;
  if (HOT) { cyl('fan_pole', 'metal', .03, 1.0, [2.0, 1.8, .6], '#555'); fanBlade = cyl('fan_blades', 'metal', .3, .02, [2.0, 1.65, 1.65], '#ccc', { lie: 'y' });
    candle = cyl('candle', 'wax', .06, .3, [0.3, .5, .4], '#f4ead0'); sph('wax_puddle', 'wax', .14, [0.3, .5, .4], '#f4ead0', { s: [1, 1, .15] });
    for (let i = 0; i < 3; i++) cyl('soda_can', 'metal', .04, .12, [-0.4 + i * .12, .45, .4], '#c0392b'); }
  else { sticky = panel('sticky_note', 'paper', .18, .18, [-1.6, 2.14, 1.55], texMat(signTex(K, 128, 128, '#ffe36a', [['OFF', 46, '#222', 64]]))); sph('cat', 'cloth', .2, [-2.3, .7, .12], '#e8a44a', { s: [1.6, 1, .7] }); sph('cat_head', 'cloth', .12, [-2.05, .7, .2], '#e8a44a');
    for (let i = 0; i < 3; i++) { cyl('pot', 'ceramic', .14, .25, [2.6 + i * .45, 2.3, 0], '#f4f1ea'); sph('plant', 'leaf', .25, [2.6 + i * .45, 2.3, .45], '#3d8b4a'); } }
  const lampL = light(HOT ? '#ff7a3a' : '#bfe0ff', HOT ? 5 : 3.5, 9, [2.0, 1.5, 1.4]), ceil = light(HOT ? '#ff9a5a' : '#e8f4ff', HOT ? 4 : 4, 12, [0, -1.5, 2.8]);
  const I0 = [lampL.intensity, ceil.intensity];
  return {
    anchors: { couch: [0, 1.7, 1.0], thermometer: [1.1, 2.54, 1.9], ac: [-1.6, 2.4, 1.45], clock: [-0.2, 2.54, 2.3], window: [-1.6, 2.54, 1.8] },
    update: (f, t) => {
      if (fanBlade) fanBlade.rotation.y = t * (t > T('trip') + .2 ? 2 : 14);
      if (HOT) { const out = t > T('trip') + .2; const flick = t > T('trip') - .5 && t < T('trip') + .2 ? (Math.floor(t * 20) % 2 ? .3 : 1) : 1; lampL.intensity = out ? .15 : I0[0] * flick; ceil.intensity = out ? .4 : I0[1] * flick; }
    },
  };
}
