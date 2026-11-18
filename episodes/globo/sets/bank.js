// THE WORLD BANK HQ: a marble hall with columns, a giant glowing world-map screen (every country gold), a long desk with a big red
// "RATES" lever, flags of many nations along the walls, a gold "WORLD BANK" sign. Plan metres, Z up. The banker stands at BANKER in
// front of the screen (screen plane y = 3.6, centred x 0, z 1..3.8).
import { kit, signTex } from './lib.js';
import { WORLD } from './world_data.js';
export const BANKER = [0.2, 1.6, 0];
export function build(THREE, scene, film, ctx) {
  const K = kit(THREE, scene, ctx), { box, cyl, sph, panel, floor, mat, canvasTex, texMat, light, rnd } = K, C = (ctx.place && ctx.place.cues) || {};
  floor('floor', 'stone', 12, 9, [0, 1, 0], mat('#e6e1d6', { relief: 'tile', ro: { scale: 1.1 } }), { mat: 'marble' });
  box('wall_back', 'stone', 12, .1, 5, [0, 3.8, 0], '#d9d2c2'); box('wall_left', 'stone', .1, 9, 5, [-6, 1, 0], '#cfc7b4'); box('wall_right', 'stone', .1, 9, 5, [6, 1, 0], '#cfc7b4');
  for (const x of [-5, -3.6, 3.6, 5]) { cyl('column', 'stone', .32, 4.6, [x, 3.3, 0], '#efe9dc', { relief: 'stone' }); box('column_cap', 'stone', .8, .8, .25, [x, 3.3, 4.55], '#e2dbcb'); }
  // the world screen
  const scr = canvasTex(2048, 1024, (g, w, h) => { g.fillStyle = '#0b2a3a'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(120,220,255,.15)'; g.lineWidth = 2; for (let i = 0; i < 24; i++) { g.beginPath(); g.moveTo(i * w / 24, 0); g.lineTo(i * w / 24, h); g.stroke(); g.beginPath(); g.moveTo(0, i * h / 12); g.lineTo(w, i * h / 12); g.stroke(); }
    const sx = x => (x + 105) / 210 * w, sy = y => (55 - y) / 110 * h; g.fillStyle = '#ffd23f'; g.strokeStyle = '#7a5a06'; g.lineWidth = 2;
    for (const c of WORLD) for (const p of c.p) { g.beginPath(); const r = p[0]; g.moveTo(sx(r[0][0]), sy(r[0][1])); for (const q of r) g.lineTo(sx(q[0]), sy(q[1])); g.closePath(); g.fill(); g.stroke(); } });
  box('screen_frame', 'metal', 6.6, .12, 3.4, [0, 3.7, 0.85], '#2a2a30'); panel('world_screen', 'lamp', 6.3, 3.15, [0, 3.62, 2.42], new THREE.MeshBasicMaterial({ map: scr, toneMapped: false }));
  const title = signTex(K, 1024, 200, '#00000000', [['WORLD BANK', 130, '#ffd23f', 100]], { stroke: '#5a3a06' });
  panel('bank_sign', 'metal', 3.6, .7, [0, 3.7, 4.45], texMat(title, { transparent: true }));
  // the desk + the RATES lever
  box('desk', 'wood', 3.2, .9, .85, [2.4, .9, 0], '#4a2a1a', { relief: 'wood' }); box('desk_top', 'wood', 3.3, 1.0, .06, [2.4, .9, .85], '#2e1a10');
  box('lever_base', 'metal', .35, .25, .12, [3.3, .85, .91], '#30333a'); cyl('lever_stick', 'metal', .025, .45, [3.3, .85, 1.0], '#c9cdd6', { metal: 'steel' }); sph('lever_knob', 'plastic', .07, [3.3, .85, 1.47], '#e2483d');
  const rate = signTex(K, 256, 96, '#111', [['RATES', 56, '#ff5a4a', 48]], {}); panel('rates_label', 'plastic', .4, .15, [3.3, .71, .93], texMat(rate), {}).rotation.x = -1.2;
  for (let i = 0; i < 4; i++) box('paper_stack', 'paper', .3, .22, .04 + i * .02, [1.3 + i * .35, .8, .91], '#f4f1ea');
  sph('globe', 'metal', .22, [1.5, 1.1, 1.13], '#3a8fd0'); cyl('globe_stand', 'metal', .05, .2, [1.5, 1.1, .91], '#c9a24a', { metal: 'brass' });
  // flags along both walls
  const cols = [['#c8102e', '#fff', '#1f3b8a'], ['#009c3b', '#ffdf00', '#002776'], ['#000', '#dd0000', '#ffce00'], ['#ff9933', '#fff', '#138808'], ['#de2910', '#ffde00', '#de2910'], ['#d52b1e', '#fff', '#d52b1e'], ['#0d5eaf', '#fff', '#0d5eaf'], ['#bc002d', '#fff', '#bc002d']];
  cols.forEach((c, i) => { const side = i < 4 ? -1 : 1, y = .2 + (i % 4) * .9, x = side * 5.6; cyl('flag_pole', 'metal', .03, 3, [x, y, 0], '#c9a24a', { metal: 'brass' });
    const tx = canvasTex(96, 64, (g) => { c.forEach((cc, k) => { g.fillStyle = cc; g.fillRect(0, k * 64 / 3, 96, 22); }); }); panel('flag', 'cloth', .9, .6, [x - side * .45, y, 2.6], texMat(tx), { ry: Math.PI / 2 }); });
  // money stacks and a gold vault door in the corner
  for (let i = 0; i < 6; i++) box('gold_bar', 'metal', .3, .14, .1, [4.3 + (i % 3) * .32, 2.6, (Math.floor(i / 3)) * .1], '#ffd23f', { metal: 'gold' });
  cyl('vault_door', 'metal', 1.0, .15, [4.8, 3.65, 1.3], '#b8b8c0', { metal: 'steel', lie: 'y' });
  light('#ffe8c0', 5, 14, [0, -2, 4]); light('#7ad0ff', 3, 5, [0, 2.6, 2.4]);
  return { anchors: { screen: [0, 3.6, 2.4], lever: [3.3, .85, 1.3], desk: [2.4, .9, 1.0], banker: [BANKER[0], BANKER[1], 1.6] }, update: () => {} };
}
