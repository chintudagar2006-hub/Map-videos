// THE ROYAL CORRIDOR into the THRONE ROOM: a long red-carpeted gallery with columns, banners, torches, suits of armour and a
// checkpoint table where guards lift every cloche; through tall doors the throne room with a dais, a golden throne and the king's
// private dinner table (candelabra, roast, fruit, goblets). Plan metres, Z up. Corridor x -2.5..2.5, y -2..9; throne room
// x -6..6, y 9..20. Checkpoint at CHECK; the throne at THRONE; the dinner table in front of it.
import { kit, signTex } from './lib.js';
export const CHECK = [0.9, 3.0, 0], THRONE = [0, 17.6, 0.6];
export function build(THREE, scene, film, ctx) {
  const K = kit(THREE, scene, ctx), { box, cyl, sph, panel, floor, mat, canvasTex, texMat, light, B2T, rnd } = K;
  const marble = mat('#e8e0d0', { relief: 'tile', ro: { scale: .9 } });
  floor('corridor_floor', 'stone', 5, 11, [0, 3.5, 0], marble, { mat: 'stone' }); floor('throne_floor', 'stone', 12, 11, [0, 14.5, 0], marble, { mat: 'stone' });
  floor('carpet', 'cloth', 1.6, 20, [0, 9, .01], mat('#a8202a', { relief: 'burlap' }), { mat: 'cloth' }); for (const s of [-1, 1]) floor('carpet_trim', 'cloth', .08, 20, [s * .82, 9, .012], mat('#d4a93a'));
  const wallM = mat('#d8c8a8', { relief: 'plaster' });
  for (const s of [-1, 1]) { box('corridor_wall', 'plaster', .3, 11, 5, [s * 2.6, 3.5, 0], '', { m: wallM }); box('throne_wall', 'plaster', .3, 11, 7, [s * 6.1, 14.5, 0], '', { m: wallM }); box('cross_wall', 'plaster', 3.5, .4, 7, [s * 4.35, 9, 0], '', { m: wallM }); }
  box('throne_back_wall', 'plaster', 12, .3, 7, [0, 20, 0], '', { m: wallM }); box('corridor_ceiling', 'plaster', 5, 11, .2, [0, 3.5, 5], '#c8b898', { cast: false }); box('throne_ceiling', 'plaster', 12, 11, .2, [0, 14.5, 7], '#c8b898', { cast: false });
  // columns with gold capitals, banners, torches (flicker), suits of armour along the corridor
  const torches = [];
  for (let i = 0; i < 4; i++) for (const s of [-1, 1]) {
    const y = -0.5 + i * 2.6; cyl('column', 'stone', .28, 4.6, [s * 2.15, y, 0], '#efe6d4', { relief: 'stone' }); cyl('column_cap', 'metal', .38, .25, [s * 2.15, y, 4.6], '#d4a93a', { metal: 'gold' });
    if (i < 3) { const bt = signTex(K, 128, 320, '#1f3a8a', [['', 10, '#fff', 0]], { draw: (g) => { g.fillStyle = '#d4a93a'; g.beginPath(); g.moveTo(64, 60); for (let k = 0; k < 5; k++) { const a = -Math.PI / 2 + k * 2 * Math.PI / 5, b = a + Math.PI / 5; g.lineTo(64 + Math.cos(a) * 40, 120 + Math.sin(a) * 40); g.lineTo(64 + Math.cos(b) * 16, 120 + Math.sin(b) * 16); } g.fill(); g.beginPath(); g.moveTo(0, 290); g.lineTo(64, 320); g.lineTo(128, 290); g.lineTo(128, 320); g.lineTo(0, 320); g.fillStyle = '#d4a93a'; g.fill(); } });
      panel('banner', 'cloth', .7, 1.8, [s * 2.43, y + 1.3, 3.2], texMat(bt, { lit: true }), { ry: -s * Math.PI / 2 });
      box('torch_bracket', 'metal', .2, .1, .3, [s * 2.4, y + .6, 2.4], '#2a2a30'); const fl = new THREE.Mesh(new THREE.ConeGeometry(.08, .3, 8), new THREE.MeshBasicMaterial({ color: '#ffb24a', toneMapped: false })); fl.position.copy(B2T([s * 2.33, y + .6, 2.75])); fl.name = 'torch_flame'; fl.userData.role = 'lamp'; scene.add(fl); torches.push(fl); light('#ffa04a', 2.2, 5, [s * 2.1, y + .6, 2.8]); }
  }
  for (const [x, y] of [[-1.85, .8], [1.85, 6.0]]) { cyl('armour_legs', 'metal', .16, 1.0, [x, y, 0], '#9aa0aa', { metal: 'steel' }); sph('armour_body', 'metal', .3, [x, y, 1.3], '#b8bec8', { s: [1, .8, 1.3], metal: 'steel' }); sph('armour_helm', 'metal', .2, [x, y, 1.85], '#b8bec8', { metal: 'steel' }); cyl('armour_spear', 'wood', .025, 2.6, [x + .3, y, 0], '#6a4428'); }
  // the CHECKPOINT: a table with a stack of trays, an inspection lamp, a ledger
  const [CX, CY] = CHECK;
  box('check_table', 'wood', 1.4, .7, .9, [CX + .4, CY, 0], '#6a4428', { relief: 'wood' }); box('check_cloth', 'cloth', 1.45, .75, .02, [CX + .4, CY, .9], '#f2efe8');
  for (let i = 0; i < 3; i++) { cyl('tray', 'metal', .22, .02, [CX + .1 + i * .3, CY + .1, .92 + i * .02], '#d8dce4', { metal: 'steel' }); }
  const cl = new THREE.Mesh(new THREE.SphereGeometry(.16, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), mat('#e8ecf2', { metal: 'steel' })); cl.position.copy(B2T([CX + .9, CY - .1, .93])); K.add(cl, 'cloche_lifted', 'metal');
  box('ledger', 'cloth', .3, .22, .04, [CX - .1, CY - .15, .92], '#7a2a2a');
  // tall doors between corridor and throne room (open)
  for (const s of [-1, 1]) box('throne_door', 'wood', 1.2, .12, 3.6, [s * 1.9, 8.6, 0], '#5a3418', { relief: 'wood', rz: s * .9 });
  // the THRONE ROOM: dais with steps, golden throne, the private dinner table, candelabra, roast, fruit, goblets; stained window
  box('dais', 'stone', 6, 3.4, .4, [0, 18, 0], '#cbbd9e', { relief: 'stone' }); box('dais_step', 'stone', 6, .5, .2, [0, 16.05, 0], '#cbbd9e', { relief: 'stone' });
  const [TX, TY, TZ] = THRONE;
  box('throne_seat', 'metal', 1.3, .9, .55, [TX, TY + .25, .4], '#d4a93a', { metal: 'gold' }); box('throne_back', 'metal', 1.3, .2, 2.4, [TX, TY + .7, .4], '#d4a93a', { metal: 'gold' }); box('throne_cushion', 'cloth', 1.0, .7, .12, [TX, TY + .2, .95], '#8a1a2a');
  for (const s of [-1, 1]) { box('throne_arm', 'metal', .18, .9, .45, [TX + s * .6, TY + .2, .95], '#d4a93a', { metal: 'gold' }); sph('throne_jewel', 'glass', .08, [TX + s * .35, TY + .62, 2.6], s < 0 ? '#c0392b' : '#3a6ac8'); }
  const DT = [0, 16.6, 0.4];
  box('dinner_table', 'wood', 2.6, .9, .1, [DT[0], DT[1], DT[2] + .72], '#5a3418', { relief: 'wood' }); box('dinner_cloth', 'cloth', 2.7, 1.0, .02, [DT[0], DT[1], DT[2] + .83], '#f6f0e2');
  for (const [dx, dy] of [[-1.2, -.35], [1.2, -.35], [-1.2, .35], [1.2, .35]]) box('dinner_leg', 'wood', .1, .1, .72, [DT[0] + dx, DT[1] + dy, DT[2]], '#5a3418');
  sph('roast', 'cloth', .22, [-.4, DT[1], DT[2] + 1.0], '#a85a2a', { s: [1.5, 1, .8] }); cyl('platter_big', 'metal', .35, .02, [-.4, DT[1], DT[2] + .85], '#d8dce4', { metal: 'steel' });
  for (let i = 0; i < 7; i++) sph('fruit', 'cloth', .07, [.5 + (i % 4) * .12, DT[1] + (i > 3 ? .1 : -.05), DT[2] + .93 + (i > 3 ? .06 : 0)], ['#c0392b', '#e8c34a', '#7ac84a', '#8a4ac8'][i % 4]);
  for (const s of [-1, 1]) { cyl('goblet', 'metal', .05, .2, [s * .9, DT[1] - .1, DT[2] + .85], '#d4a93a', { metal: 'gold' }); }
  const candles = []; cyl('candelabra', 'metal', .04, .6, [1.1, DT[1] + .2, DT[2] + .85], '#d4a93a', { metal: 'gold' }); for (let k = 0; k < 3; k++) { cyl('candle', 'cloth', .025, .2, [1.0 + k * .1, DT[1] + .2, DT[2] + 1.45], '#f6f0e2'); const fl = new THREE.Mesh(new THREE.ConeGeometry(.02, .07, 6), new THREE.MeshBasicMaterial({ color: '#ffd36b', toneMapped: false })); fl.position.copy(B2T([1.0 + k * .1, DT[1] + .2, DT[2] + 1.69])); fl.userData.noExport = true; scene.add(fl); candles.push(fl); }
  const sw = canvasTex(256, 512, (g) => { const cols = ['#c0392b', '#2a6ac8', '#e8c34a', '#2a9a5a', '#8a3ac8']; for (let i = 0; i < 60; i++) { g.fillStyle = cols[i % 5]; g.fillRect((i % 6) * 43, Math.floor(i / 6) * 52, 42, 51); } g.strokeStyle = '#1a1a1a'; g.lineWidth = 6; for (let x = 0; x < 256; x += 43) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 512); g.stroke(); } });
  panel('stained_window', 'lamp', 1.6, 3.2, [0, 19.83, 4.6], texMat(sw));
  for (const s of [-1, 1]) { const bt = signTex(K, 160, 400, '#8a1a2a', [['', 10, '#fff', 0]], { draw: (g) => { g.fillStyle = '#d4a93a'; g.beginPath(); g.arc(80, 140, 44, 0, 7); g.fill(); } }); panel('throne_banner', 'cloth', 1.0, 2.6, [s * 2.4, 19.83, 4.0], texMat(bt, { lit: true })); }
  light('#ffd9a0', 6, 14, [0, 14, 6], { shadow: true }); light('#ffcf88', 4, 6, [1.1, DT[1] + .2, DT[2] + 2]); light('#ffd9a0', 4, 10, [0, 3.5, 4.5]);
  return {
    anchors: { check: [CX + .4, CY, 1.0], throne: [TX, TY, 1.6], dinner: [DT[0], DT[1], DT[2] + 1.0], window: [0, 19.8, 4.6], doors: [0, 8.6, 2.0] },
    update: (f, t) => { torches.concat(candles).forEach((fl, i) => fl.scale.set(1, 1 + Math.sin(t * 15 + i * 2.3) * .2, 1)); },
  };
}
