// THE WRONG PALACE AT NIGHT: a moonlit tiled roof with chimneys (one smoking: the kitchen), a skylight hatch Viper drops through,
// towers with lit windows and flags, the city below. Plan metres, Z up. Roof ridge along x at y = 2, eaves at y = -1 (z 6) and
// y = 5; the hatch is at HATCH. Viper crouches on the ridge, then drops.
import { kit, signTex } from './lib.js';
export const HATCH = [0.4, 0.6, 7.0];
export function build(THREE, scene, film, ctx) {
  const K = kit(THREE, scene, ctx), { box, cyl, sph, panel, floor, mat, canvasTex, texMat, light, B2T, rnd } = K;
  const tile = mat('#8a3a2e', { relief: 'tile', ro: { scale: .35 } });
  // two roof slopes (ridge at z 8 along y = 2)
  for (const [y, rx] of [[0.5, .55], [3.5, -.55]]) { const r = box('roof_slope', 'roof', 24, 3.4, .2, [0, y, 6.9], '', { m: tile, rx }); r.userData.mat = 'roof_tile'; }
  box('ridge_cap', 'roof', 24, .3, .25, [0, 2, 7.75], '#5a2a22');
  // walls below the eaves (lit windows), a parapet walkway on the front
  box('palace_wall', 'plaster', 24, .4, 6, [0, -.9, 0], '#d8c8a8'); for (let i = 0; i < 9; i++) box('palace_window', 'lamp', .7, .05, 1.2, [-10 + i * 2.5, -1.12, 3.4], rnd(i) > .35 ? '#ffcf7a' : '#2a3048', { basic: true, cast: false });
  // chimneys, one smoking
  for (const [x, y] of [[-4, 1.4], [3.2, 2.8], [7, 1.2]]) { box('chimney', 'brick', .7, .7, 1.8, [x, y, 6.8], '#8a5040', { relief: 'brick' }); box('chimney_cap', 'stone', .85, .85, .12, [x, y, 8.6], '#5a4a40'); }
  // the hatch Viper drops through (a lit square in the roof with a wooden lid flipped open)
  const H = HATCH; panel('hatch_glow', 'lamp', .9, .9, [H[0], H[1], H[2] + .02], new THREE.MeshBasicMaterial({ color: '#ffb24a', toneMapped: false }), { ry: 0 }).rotation.x = -Math.PI / 2 + .55;
  box('hatch_frame', 'wood', 1.1, 1.1, .1, [H[0], H[1], H[2] - .05], '#4a2e1a', { rx: .55 });
  box('hatch_lid', 'wood', 1.0, .08, 1.0, [H[0], H[1] - .55, H[2] + .3], '#6a4428', { rx: .3 });
  // towers with conical roofs, flags, lit windows
  const flags = [];
  for (const [x, y, h] of [[-9, 4, 13], [9.5, 3.5, 15], [-14, 10, 17], [15, 11, 14]]) {
    cyl('tower', 'stone', 1.6, h, [x, y, 0], '#cbbd9e', { relief: 'stone' }); const c = new THREE.Mesh(new THREE.ConeGeometry(2.0, 3.4, 16), mat('#3a4a8a')); c.position.copy(B2T([x, y, h + 1.7])); K.add(c, 'tower_roof', 'roof');
    for (let k = 0; k < 3; k++) box('tower_window', 'lamp', .45, .05, .8, [x + Math.sin(k) * .4, y - 1.62, h - 3 - k * 3], '#ffcf7a', { basic: true, cast: false });
    cyl('flag_pole', 'wood', .04, 1.6, [x, y, h + 3.3], '#3a2a1a'); const fl = new THREE.Mesh(new THREE.PlaneGeometry(1.1, .6, 8, 1), mat('#c0392b')); fl.material.side = THREE.DoubleSide; fl.position.copy(B2T([x + .55, y, h + 4.5])); fl.name = 'flag'; fl.userData.role = 'cloth'; scene.add(fl); flags.push([fl, Float32Array.from(fl.geometry.attributes.position.array)]);
  }
  // the city far below + night sky with a big moon
  const sky = canvasTex(512, 1024, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#060a24'); gr.addColorStop(.7, '#1c2050'); gr.addColorStop(1, '#3a2a5a'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 260; i++) { g.fillStyle = `rgba(255,255,255,${.3 + rnd(i) * .7})`; g.fillRect(rnd(i + 1) * w, rnd(i + 2) * h * .75, 1.5, 1.5); }
    g.fillStyle = '#f6f0d8'; g.beginPath(); g.arc(360, 220, 70, 0, 7); g.fill(); g.fillStyle = 'rgba(246,240,216,.15)'; g.beginPath(); g.arc(360, 220, 110, 0, 7); g.fill();
    for (let i = 0; i < 60; i++) { const bw = 10 + rnd(i) * 22, bh = 20 + rnd(i + 4) * 70, x = i * 9; g.fillStyle = '#141838'; g.fillRect(x, h - bh, bw, bh); if (rnd(i + 9) > .4) { g.fillStyle = '#ffcf7a'; g.fillRect(x + 3, h - bh + 8, 3, 4); } } });
  panel('sky_card', 'glass', 140, 80, [0, 60, 20], texMat(sky));
  // a weather vane, gargoyle stand-ins, a pigeon on the ridge
  cyl('vane_pole', 'metal', .03, 1.4, [-1.5, 2, 7.8], '#2a2a30'); box('vane_arrow', 'metal', .9, .05, .1, [-1.5, 2, 9.1], '#c9a24a', { metal: 'brass' });
  for (const x of [-11.5, 11.5]) { sph('gargoyle_body', 'stone', .4, [x, -1.05, 6.3], '#7a7468', { s: [1, 1.2, .9] }); sph('gargoyle_head', 'stone', .25, [x, -1.4, 6.5], '#7a7468'); }
  sph('pigeon', 'cloth', .1, [2.3, 2, 7.92], '#8a8a96', { s: [1.4, 1, 1] }); sph('pigeon_head', 'cloth', .055, [2.42, 2, 8.0], '#6a6a78');
  // smoke from the kitchen chimney (sprites)
  const smT = canvasTex(64, 64, (g) => { const gr = g.createRadialGradient(32, 32, 2, 32, 32, 30); gr.addColorStop(0, 'rgba(200,200,215,.7)'); gr.addColorStop(1, 'rgba(200,200,215,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); });
  const smoke = []; for (let i = 0; i < 18; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: smT, transparent: true, depthWrite: false })); s.userData.noExport = true; scene.add(s); smoke.push(s); }
  light('#ffb24a', 6, 6, [H[0], H[1] - .2, H[2] + .6]); light('#9fb0ff', 2, 30, [10, -10, 18]);
  return {
    anchors: { hatch: H, moon: [8, 60, 30], chimney: [3.2, 2.8, 8.8], ridge: [0, 2, 7.8], tower: [9.5, 3.5, 12] },
    update: (f, t) => {
      flags.forEach(([fl, p0], i) => { const p = fl.geometry.attributes.position; for (let k = 0; k < p.count; k++) { const x = p0[k * 3]; p.array[k * 3 + 2] = p0[k * 3 + 2] + Math.sin(t * 5 + x * 6 + i) * .08 * (x + .55); } p.needsUpdate = true; });
      smoke.forEach((s, i) => { const k = (t * .25 + i / 18) % 1; s.position.copy(B2T([3.2 + k * 1.5 + Math.sin(k * 6 + i) * .2, 2.8, 8.8 + k * 3])); s.scale.setScalar(.4 + k * 1.6); s.material.opacity = (1 - k) * .6; });
    },
  };
}
