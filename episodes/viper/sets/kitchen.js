// THE ROYAL KITCHEN: a smoky stone vault with a roaring hearth, a huge black cauldron of bubbling GREEN STEW on a fire, copper pans
// hanging from a rack, a long butcher's table piled with vegetables, hams and loaves, shelves of jars, strings of onions and garlic,
// barrels, a skylight in the ceiling (Viper's way in). Plan metres, Z up. Room x -4..4, y -1.5..5, ceiling 4. The stew pot is at POT.
import { kit, signTex } from './lib.js';
export const POT = [0.9, 2.6, 0];
export function build(THREE, scene, film, ctx) {
  const K = kit(THREE, scene, ctx), { box, cyl, sph, panel, floor, mat, canvasTex, texMat, light, B2T, rnd } = K;
  const X = 4, Y1 = 5, H = 4;
  floor('floor', 'stone', 8, 7, [0, 1.75, 0], mat('#8a7a68', { relief: 'cobble', ro: { scale: .8 } }), { mat: 'cobble' });
  const wallM = mat('#b8a88c', { relief: 'stone', ro: { scale: .5 } });
  box('wall_back', 'stone', 8, .3, H, [0, Y1, 0], '', { m: wallM }); box('wall_left', 'stone', .3, 7, H, [-X, 1.75, 0], '', { m: wallM }); box('wall_right', 'stone', .3, 7, H, [X, 1.75, 0], '', { m: wallM });
  box('ceiling', 'wood', 8, 7, .2, [0, 1.75, H], '#4a3424', { cast: false }); for (let i = 0; i < 6; i++) box('ceiling_beam', 'wood', .25, 7, .3, [-3.2 + i * 1.3, 1.75, H - .3], '#3a2818', { relief: 'wood' });
  // skylight (broken) in the ceiling with moonlight
  panel('skylight', 'lamp', .9, .9, [0.4, 0.9, H - .02], new THREE.MeshBasicMaterial({ color: '#9fb0ff', toneMapped: false })).rotation.x = Math.PI / 2;
  // HEARTH on the back wall: stone arch, fire, logs, glow
  box('hearth_back', 'brick', 2.6, .3, 2.4, [-2.1, Y1 - .3, 0], '#5a3a2e', { relief: 'brick' }); box('hearth_lintel', 'stone', 3.0, .5, .4, [-2.1, Y1 - .4, 2.2], '#8a7a68', { relief: 'stone' });
  for (const s of [-1, 1]) box('hearth_side', 'stone', .4, .6, 2.2, [-2.1 + s * 1.3, Y1 - .4, 0], '#8a7a68', { relief: 'stone' });
  for (let i = 0; i < 4; i++) cyl('log', 'wood', .12, 1.1, [-2.1 + (i - 1.5) * .25, Y1 - .7, .14 + (i % 2) * .15], '#5a3a22', { lie: 'x', relief: 'bark' });
  const flames = []; for (let i = 0; i < 7; i++) { const fl = new THREE.Mesh(new THREE.ConeGeometry(.16 + rnd(i) * .1, .6 + rnd(i + 3) * .4, 8), new THREE.MeshBasicMaterial({ color: i % 2 ? '#ffb24a' : '#ff6a2a', transparent: true, opacity: .9, toneMapped: false })); fl.position.copy(B2T([-2.1 + (i - 3) * .17, Y1 - .7, .55])); fl.name = 'hearth_flame'; fl.userData.role = 'lamp'; scene.add(fl); flames.push(fl); }
  // THE CAULDRON of green stew on a fire ring
  const [PX, PY] = POT;
  for (let i = 0; i < 8; i++) sph('fire_stone', 'stone', .14, [PX + Math.cos(i / 8 * 6.28) * .75, PY + Math.sin(i / 8 * 6.28) * .75, .08], '#5a5048');
  const potFl = []; for (let i = 0; i < 5; i++) { const fl = new THREE.Mesh(new THREE.ConeGeometry(.12, .4, 8), new THREE.MeshBasicMaterial({ color: i % 2 ? '#ffb24a' : '#ff6a2a', transparent: true, opacity: .9, toneMapped: false })); fl.position.copy(B2T([PX + (i - 2) * .15, PY, .25])); fl.userData.noExport = true; scene.add(fl); potFl.push(fl); }
  const pot = new THREE.Mesh(new THREE.SphereGeometry(.7, 28, 16, 0, Math.PI * 2, Math.PI * .28, Math.PI * .72), mat('#1d1d22', { metal: 'iron' })); pot.position.copy(B2T([PX, PY, .95])); K.add(pot, 'cauldron', 'metal', { mat: 'metal' });
  const rim = new THREE.Mesh(new THREE.TorusGeometry(.6, .05, 8, 32), mat('#2a2a30', { metal: 'iron' })); rim.rotation.x = Math.PI / 2; rim.position.copy(B2T([PX, PY, 1.38])); K.add(rim, 'cauldron_rim', 'metal');
  const stew = new THREE.Mesh(new THREE.CircleGeometry(.58, 32), new THREE.MeshToonMaterial({ color: '#6adf3a', emissive: '#2f8a10', emissiveIntensity: .6 })); stew.rotation.x = -Math.PI / 2; stew.position.copy(B2T([PX, PY, 1.32])); K.add(stew, 'green_stew', 'lamp', { mat: 'emissive_lamp' });
  const bubbles = []; for (let i = 0; i < 9; i++) { const b = sph('stew_bubble', 'glass', .05 + rnd(i) * .05, [PX, PY, 1.34], '#9cff6a', { mat: 'flat' }); b.userData.ph = rnd(i + 4); bubbles.push(b); }
  cyl('ladle_handle', 'wood', .025, 1.0, [PX + .3, PY + .2, 1.6], '#6a4428', { r2: .02 }); // a ladle sticking out
  // LONG TABLE piled with food
  const TX = -1.6, TY = 1.6;
  box('table_top', 'wood', 2.6, 1.0, .12, [TX, TY, .82], '#8a5a32', { relief: 'wood' }); for (const [dx, dy] of [[-1.15, -.4], [1.15, -.4], [-1.15, .4], [1.15, .4]]) box('table_leg', 'wood', .12, .12, .82, [TX + dx, TY + dy, 0], '#6a4428');
  const foods = [['#e86a2a', 'carrot'], ['#8a4ac8', 'cabbage'], ['#f2d07a', 'loaf'], ['#c0392b', 'tomato'], ['#7ac84a', 'leek'], ['#d8a06a', 'ham']];
  for (let i = 0; i < 16; i++) { const [c, n] = foods[i % 6], x = TX - 1.1 + (i % 8) * .3, y = TY - .3 + Math.floor(i / 8) * .5; if (n === 'loaf' || n === 'ham') sph(n, 'cloth', .14, [x, y, 1.0], c, { s: [1.5, 1, .9] }); else if (n === 'carrot' || n === 'leek') cyl(n, 'cloth', .04, .4, [x, y, .98], c, { lie: 'x' }); else sph(n, 'cloth', .1, [x, y, 1.0], c); }
  box('chopping_board', 'wood', .6, .4, .05, [TX + .7, TY - .2, .94], '#c8963c');
  // copper pan rack hanging over the table (pans sway)
  box('pan_rack', 'metal', 2.4, .08, .08, [TX, TY, 3.2], '#3a2a1a'); const pans = [];
  for (let i = 0; i < 6; i++) { const g = new THREE.Group(); g.position.copy(B2T([TX - 1.0 + i * .4, TY, 3.15])); scene.add(g); const pan = new THREE.Mesh(new THREE.CylinderGeometry(.15 + (i % 3) * .03, .13, .08, 20), mat('#c8743a', { metal: 'copper' })); pan.rotation.x = Math.PI / 2; pan.position.y = -.4; pan.name = 'copper_pan'; pan.userData.role = 'metal'; pan.userData.mat = 'brass'; pan.castShadow = true; g.add(pan); const h2 = new THREE.Mesh(new THREE.CylinderGeometry(.015, .015, .3), mat('#5a3a22')); h2.position.y = -.17; g.add(h2); pans.push(g); }
  // shelves of jars on the right wall, strings of onions and garlic, barrels, sacks
  for (let z = .9; z < 3.2; z += .55) { box('shelf', 'wood', .35, 3.0, .05, [X - .2, 2.4, z], '#6a4428'); for (let k = 0; k < 10; k++) cyl('jar', 'glass', .07, .18 + rnd(k + z) * .1, [X - .2, 1.05 + k * .3, z + .03], ['#e8c34a', '#c0392b', '#7ac84a', '#8a4ac8', '#f2efe8'][k % 5]); }
  for (let s = 0; s < 3; s++) for (let k = 0; k < 6; k++) sph('onion', 'cloth', .07, [-X + .2, .4 + s * .35, 3.0 - k * .18], k % 2 ? '#d8a06a' : '#f2efe8');
  for (let i = 0; i < 4; i++) cyl('barrel', 'wood', .35, .9, [3.2 - (i % 2) * .75, -0.6 + Math.floor(i / 2) * .8, 0], '#7a5230', { relief: 'wood' });
  for (let i = 0; i < 3; i++) sph('flour_sack', 'cloth', .3, [-3.4 + i * .5, -.8, .3], '#e8dcc0', { s: [1, 1, 1.3] });
  // a sign on the wall
  const sg = signTex(K, 512, 256, '#3a2a1a', [['NO RATS', 60, '#ffd36b', 100], ['IN THE STEW', 44, '#f2e8d0', 180, '700']], { border: '#ffd36b', bw: 8 });
  panel('kitchen_sign', 'cloth', 1.2, .6, [1.6, Y1 - .16, 2.8], texMat(sg, { lit: true }));
  // STEAM and SMOKE (sprites)
  const smT = canvasTex(64, 64, (g) => { const gr = g.createRadialGradient(32, 32, 2, 32, 32, 30); gr.addColorStop(0, 'rgba(220,235,210,.75)'); gr.addColorStop(1, 'rgba(220,235,210,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); });
  const steam = []; for (let i = 0; i < 26; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: smT, color: i % 3 ? '#e8f0e0' : '#b8ff9a', transparent: true, depthWrite: false })); s.userData.noExport = true; scene.add(s); steam.push(s); }
  light('#ff9a4a', 9, 8, [-2.1, Y1 - 1.2, 1.0], { shadow: true }); light('#7aff4a', 4, 4, [PX, PY, 1.8]); light('#9fb0ff', 2, 6, [.4, .9, 3.6]); light('#ffd9a0', 4, 9, [0, 1.5, 3.4]);
  return {
    anchors: { pot: [PX, PY, 1.35], hearth: [-2.1, Y1 - .5, .8], table: [TX, TY, 1.0], skylight: [.4, .9, H], pans: [TX, TY, 2.8] },
    update: (f, t) => {
      flames.concat(potFl).forEach((fl, i) => { fl.scale.set(1, 1 + Math.sin(t * 13 + i * 2) * .25, 1); });
      bubbles.forEach((b, i) => { const k = (t * .8 + b.userData.ph) % 1, a = b.userData.ph * 6.28; b.position.copy(B2T([PX + Math.cos(a) * .35 * b.userData.ph, PY + Math.sin(a) * .35, 1.33 + Math.sin(k * Math.PI) * .06])); b.scale.setScalar(k < .9 ? .3 + k : .01); });
      pans.forEach((g, i) => { g.rotation.z = Math.sin(t * 1.2 + i) * .05; });
      steam.forEach((s, i) => { const k = (t * .22 + i / 26) % 1; const src = i % 2 ? [PX, PY, 1.4] : [-2.1, Y1 - .6, 1.6]; s.position.copy(B2T([src[0] + Math.sin(k * 5 + i) * .4, src[1] - k * .6, src[2] + k * 2.4])); s.scale.setScalar(.4 + k * 1.8); s.material.opacity = Math.sin(k * Math.PI) * .55; });
    },
  };
}
