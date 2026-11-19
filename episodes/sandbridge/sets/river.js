// THE RIVER GORGE: two stone arch bridges racing across a roaring river. OUR bridge spans x -6..6 at y = 0; the RIVAL bridge is
// upstream at y = RIVAL_Y. Each arch rests on timber CENTERING (posts, braces, curved ribs). Our posts stand on IRON SAND
// CYLINDERS (plugs at the bottom); the rival posts stand on wooden wedges. Plan metres, Z up; river surface z = WATER.
// place opts (film.json places.<name>): pour [t0, t1] sand runs out and our centering lowers; chop [t0, t1] rival posts shake under
// the axes; crack t the jagged crack shoots through the rival arch; built = true shows the finished decks and parapets.
import { kit, signTex } from './lib.js';
export const SPAN = 12, RISE = 4.2, SPRING = 1.0, WATER = -1.4, RIVAL_Y = 18, PAD_Z = -0.2;
export const BOXES = [-3.6, -1.2, 1.2, 3.6];                 // x of the four sand cylinders under our centering (y = 0)
export function archZ(x) { const R = (SPAN * SPAN / 4 + RISE * RISE) / (2 * RISE), c = SPRING + RISE - R; return c + Math.sqrt(Math.max(0, R * R - x * x)); }
export function build(THREE, scene, film, ctx) {
  const K = kit(THREE, scene, ctx), { box, cyl, sph, panel, floor, mat, canvasTex, texMat, light, B2T, rnd } = K;
  const o = ctx.place || {}, pour = o.pour || [1e9, 1e9 + 1], chop = o.chop || [1e9, 1e9 + 1], crackT = o.crack ?? 1e9, built = !!o.built;
  if (ctx.sky && ctx.sky.on) ctx.sky.clouds({ kind: 'clear-day' });
  // ---------- terrain: river bed, water, two banks rising into a gorge, far hills
  floor('river_bed', 'ground', 60, 140, [0, 20, WATER - .6], mat('#5a5048', { relief: 'mud' }));
  const water = new THREE.Mesh(new THREE.PlaneGeometry(13, 140, 26, 140), mat('#2f7486', { metal: 'wet', mo: { color: '#2f7486' } })); water.rotation.x = -Math.PI / 2; water.position.copy(B2T([0, 20, WATER])); K.add(water, 'river_water', 'water', { cast: false });
  const wp = water.geometry.attributes.position, w0 = Float32Array.from(wp.array);
  const bankM = mat('#7a8a4a', { relief: 'grass', ro: { scale: 1.2 } }), rockM = mat('#8a8278', { relief: 'stone', ro: { scale: .6 } });
  for (const s of [-1, 1]) {
    box('bank_cliff', 'stone', 4, 140, 4.0, [s * 8.0, 20, WATER - .6], '', { m: rockM });
    box('bank_top', 'ground', 30, 140, .4, [s * 24.0, 20, 3.0], '', { m: bankM });
    box('bank_slope', 'ground', 6, 140, .4, [s * 10.6, 20, 3.0], '', { m: bankM });
  }
  for (let i = 0; i < 40; i++) { const s = i % 2 ? 1 : -1; sph('river_rock', 'stone', .3 + rnd(i) * .5, [s * (5.6 + rnd(i + 2) * 1.0), -20 + rnd(i + 5) * 70, WATER + .05], '#7a746c', { s: [1.3, 1, .7] }); }
  // white water: foam streaks that run downstream
  const foamT = canvasTex(64, 256, (g) => { for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(255,255,255,${.3 + rnd(i) * .5})`; g.fillRect(rnd(i + 1) * 64, rnd(i + 2) * 256, 1 + rnd(i + 3) * 2, 18 + rnd(i + 4) * 40); } });
  foamT.wrapS = foamT.wrapT = THREE.RepeatWrapping; foamT.repeat.set(4, 30);
  const foam = new THREE.Mesh(new THREE.PlaneGeometry(12, 140), new THREE.MeshBasicMaterial({ map: foamT, transparent: true, opacity: .32, depthWrite: false })); foam.rotation.x = -Math.PI / 2; foam.position.copy(B2T([0, 20, WATER + .03])); foam.userData.noExport = true; scene.add(foam);
  for (let i = 0; i < 9; i++) { const h = 8 + rnd(i) * 10, c = new THREE.Mesh(new THREE.ConeGeometry(10 + rnd(i + 1) * 8, h, 7), mat(['#6a7a9a', '#7a88a8', '#5a6a8a'][i % 3])); c.position.copy(B2T([-60 + i * 15, 90 + rnd(i + 3) * 20, 3 + h / 2])); K.add(c, 'far_hill', 'ground', { cast: false }); }
  if (ctx.trees) for (let i = 0; i < 26; i++) { const s = i % 2 ? 1 : -1; ctx.trees.tree({ kind: i % 3 ? 'oak' : 'cypress', at: [s * (13 + rnd(i) * 14), -16 + rnd(i + 7) * 60, 3.2], height: 4 + rnd(i + 3) * 3, seed: i }); }
  // ---------- one stone arch bridge with its centering
  const stoneCols = ['#c9b8a0', '#bfae96', '#d4c4aa', '#b8a68c'];
  const mkBridge = (Y, rival) => {
    const g = new THREE.Group(); scene.add(g); const parts = { g, voussoirs: [], posts: [], center: new THREE.Group(), crack: null };
    const add = (m, name, role) => { m.name = name; m.userData.role = role; m.castShadow = m.receiveShadow = true; g.add(m); return m; };
    // abutments + piers on the banks
    for (const s of [-1, 1]) { add(new THREE.Mesh(new THREE.BoxGeometry(3.2, 4.2, 3.6), mat('#b5a48c', { relief: 'stone', ro: { scale: .6 } })), 'abutment', 'stone').position.copy(B2T([s * 7.4, Y, SPRING - 1.6])); }
    // the arch ring: voussoirs on the segmental arc
    const R = (SPAN * SPAN / 4 + RISE * RISE) / (2 * RISE), cz = SPRING + RISE - R, a0 = Math.asin((SPAN / 2) / R), N = 27;
    for (let i = 0; i < N; i++) {
      const a = -a0 + (2 * a0) * (i + .5) / N, x = R * Math.sin(a), z = cz + R * Math.cos(a), len = 2 * a0 * R / N;
      const v = new THREE.Mesh(new THREE.BoxGeometry(len * .96, .85, 3.4), mat(stoneCols[i % 4], { relief: 'stone', ro: { scale: .5, seed: i } }));
      v.position.copy(B2T([x + Math.sin(a) * .42, Y, z + Math.cos(a) * .42])); v.rotation.z = -a; add(v, i === (N >> 1) ? 'keystone' : 'voussoir', 'stone'); v.userData.base = v.position.clone(); v.userData.a = a; parts.voussoirs.push(v);
    }
    // spandrel fill + deck + parapets (always for ours when built; rival gets them too)
    const deckZ = SPRING + RISE + .9;
    for (let x = -6.4; x <= 6.4; x += .8) { const top = deckZ - .1, bot = archZ(Math.min(5.99, Math.abs(x))) + .7; if (top - bot > .1) add(new THREE.Mesh(new THREE.BoxGeometry(.82, top - bot, 3.3), mat('#c4b49a', { relief: 'stone', ro: { scale: .6, seed: Math.round(x * 10) } })), 'spandrel', 'stone').position.copy(B2T([x, Y, (top + bot) / 2])); }
    const deck = add(new THREE.Mesh(new THREE.BoxGeometry(17, .3, 3.8), mat('#9a8e7e', { relief: 'cobble' })), 'deck', 'stone'); deck.position.copy(B2T([0, Y, deckZ + .05]));
    for (const s of [-1, 1]) { const p = add(new THREE.Mesh(new THREE.BoxGeometry(17, .7, .35), mat('#c9b8a0', { relief: 'stone', ro: { scale: .5 } })), 'parapet', 'stone'); p.position.copy(B2T([0, Y + s * 1.75, deckZ + .55])); p.visible = built; }
    // CENTERING: a timber truss that fills the arch: posts, braces, a curved rib and lagging boards under the voussoirs
    const C = parts.center; C.position.copy(B2T([0, Y, 0])); scene.add(C);
    const wood = mat('#a8763e', { relief: 'wood', ro: { scale: .4 } }), woodD = mat('#7a5230', { relief: 'wood', ro: { scale: .4 } });
    const cAdd = (m, name) => { m.name = name; m.userData.role = 'wood'; m.castShadow = m.receiveShadow = true; C.add(m); return m; };
    const xs = rival ? [-3.6, -1.2, 1.2, 3.6] : BOXES, footZ = PAD_Z + (rival ? .25 : .62);
    for (const yy of [-1.2, 1.2]) {
      for (const x of xs) { const top = archZ(Math.abs(x)) - .05, h = top - footZ; const p = cAdd(new THREE.Mesh(new THREE.BoxGeometry(.32, h, .32), wood), 'centering_post'); p.position.set(x, footZ + h / 2, -yy); parts.posts.push(p); }
      const pts = []; for (let k = 0; k <= 24; k++) { const x = -5.9 + 11.8 * k / 24; pts.push(new THREE.Vector3(x, archZ(Math.abs(x)) - .12, -yy)); }
      cAdd(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 48, .14, 6), woodD), 'centering_rib');
      for (let k = 0; k < xs.length - 1; k++) { const a = xs[k], b = xs[k + 1], za = footZ + .3, zb = archZ(Math.abs(b)) - .4; const v = new THREE.Vector3(b - a, zb - za, 0), L2 = v.length(); const br = cAdd(new THREE.Mesh(new THREE.BoxGeometry(.16, L2, .16), woodD), 'centering_brace'); br.position.set((a + b) / 2, (za + zb) / 2, -yy); br.rotation.z = -Math.atan2(v.x, v.y); }
      const tie = cAdd(new THREE.Mesh(new THREE.BoxGeometry(11.6, .2, .2), woodD), 'centering_tie'); tie.position.set(0, footZ + 1.0, -yy);
    }
    for (let k = 0; k <= 22; k++) { const x = -5.6 + 11.2 * k / 22, z = archZ(Math.abs(x)) - .02; const b2 = cAdd(new THREE.Mesh(new THREE.BoxGeometry(.44, .07, 3.0), wood), 'lagging'); b2.position.set(x, z, 0); b2.rotation.z = -Math.asin(x / ((SPAN * SPAN / 4 + RISE * RISE) / (2 * RISE))); }
    // working pad under the arch (stone footing in the shallows) + supports' feet
    const pad = add(new THREE.Mesh(new THREE.BoxGeometry(9.4, .5, 4.2), mat('#8e8476', { relief: 'stone', ro: { scale: .7 } })), 'footing_pad', 'stone'); pad.position.copy(B2T([0, Y, PAD_Z - .25]));
    // the crack (rival): a jagged dark line down the arch face, revealed from the crown
    if (rival) { const cc = document.createElement('canvas'); cc.width = 128; cc.height = 512; const cg = cc.getContext('2d'); cg.strokeStyle = '#1a120c'; cg.lineWidth = 9; cg.lineCap = 'round'; cg.beginPath(); let x = 64; cg.moveTo(x, 0); for (let yv = 0; yv <= 512; yv += 32) { x = 64 + (rnd(yv) - .5) * 70; cg.lineTo(x, yv); } cg.stroke(); cg.lineWidth = 4; cg.beginPath(); cg.moveTo(70, 200); cg.lineTo(110, 260); cg.moveTo(50, 330); cg.lineTo(14, 380); cg.stroke();
      const ct = new THREE.CanvasTexture(cc); ct.colorSpace = THREE.SRGBColorSpace; const crack = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 4.0), new THREE.MeshBasicMaterial({ map: ct, transparent: true, depthWrite: false, toneMapped: false })); crack.position.copy(B2T([.15, Y - 1.73, SPRING + RISE - 1.0])); crack.name = 'arch_crack'; crack.userData.noExport = true; scene.add(crack); parts.crack = crack; crack.geometry.translate(0, -2.0, 0); crack.position.copy(B2T([.15, Y - 1.73, SPRING + RISE + 1.0])); }
    return parts;
  };
  const ours = mkBridge(0, false), rival = mkBridge(RIVAL_Y, true);
  // OUR sand cylinders: iron drums on the pad with a plug at the bottom, rivets, sand piles that grow, sand streams
  const iron = mat('#4a4c52', { metal: 'iron' }), sandM = mat('#e2c98a', { relief: 'mud', ro: { scale: .3 } });
  const piles = [], streams = [];
  for (const yy of [-1.2, 1.2]) for (const x of BOXES) {
    cyl('sand_cylinder', 'metal', .32, .62, [x, yy, PAD_Z], '', { m: iron }); cyl('cylinder_band', 'metal', .335, .06, [x, yy, PAD_Z + .5], '#2a2c30', { metal: 'iron' }); cyl('cylinder_band', 'metal', .335, .06, [x, yy, PAD_Z + .08], '#2a2c30', { metal: 'iron' });
    cyl('sand_plug', 'metal', .05, .08, [x, yy - .34, PAD_Z + .1], '#c8963c', { lie: 'y', metal: 'brass' });
    const pile = new THREE.Mesh(new THREE.ConeGeometry(.5, .35, 18), sandM); pile.position.copy(B2T([x, yy - .62, PAD_Z])); pile.scale.setScalar(.001); K.add(pile, 'sand_pile', 'ground'); piles.push(pile);
    const pts = []; for (let k = 0; k < 40; k++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ color: '#e8d098', transparent: true, depthWrite: false })); s.scale.setScalar(.05); s.visible = false; s.userData.noExport = true; scene.add(s); pts.push(s); } streams.push({ x, yy, pts });
  }
  // rival posts sit on wooden wedges
  for (const yy of [-1.2, 1.2]) for (const x of [-3.6, -1.2, 1.2, 3.6]) box('wedge', 'wood', .5, .5, .25, [x, RIVAL_Y + yy, PAD_Z], '#8a6a3a');
  // ---------- the construction camp on the left bank: tents, stone blocks, a timber derrick, carts, barrels, a flag, a sign
  for (let i = 0; i < 3; i++) { const t = new THREE.Mesh(new THREE.ConeGeometry(1.4, 1.8, 4), mat(['#efe6d0', '#e8d8b8', '#f2ead8'][i])); t.position.copy(B2T([-14 - i * 3.2, -4 + i * 2.5, 4.1])); t.rotation.y = .7; K.add(t, 'tent', 'cloth'); }
  for (let i = 0; i < 14; i++) box('stone_block', 'stone', .9, .6, .5, [-10.5 + (i % 4) * .95, 4 + Math.floor(i / 4) * .65, 3.2 + (i % 3 === 0 ? .5 : 0)], stoneCols[i % 4], { relief: 'stone', ro: { seed: i } });
  for (let i = 0; i < 5; i++) cyl('barrel', 'wood', .28, .7, [-11 - i * .7, -1.5 + (i % 2) * .6, 3.2], '#8a5a32', { relief: 'wood' });
  const derrick = new THREE.Group(); derrick.position.copy(B2T([-9.6, -2.5, 3.2])); scene.add(derrick);
  const mast = new THREE.Mesh(new THREE.BoxGeometry(.25, 8, .25), mat('#7a5230', { relief: 'wood' })); mast.position.y = 4; derrick.add(mast); const boom = new THREE.Mesh(new THREE.BoxGeometry(.2, 7, .2), mat('#7a5230', { relief: 'wood' })); boom.position.set(2.6, 5.5, 0); boom.rotation.z = -1.05; derrick.add(boom);
  const rope = new THREE.Mesh(new THREE.CylinderGeometry(.02, .02, 3, 6), mat('#c8b080')); rope.position.set(5.6, 5.2, 0); derrick.add(rope); const hb = new THREE.Mesh(new THREE.BoxGeometry(.8, .5, .5), mat('#c9b8a0')); hb.position.set(5.6, 3.6, 0); derrick.add(hb);
  derrick.traverse(m => { if (m.isMesh) { m.castShadow = true; m.name = 'derrick'; m.userData.role = 'wood'; } });
  box('cart', 'wood', 1.6, 1.0, .5, [-12.5, 1.2, 3.6], '#8a5a32', { relief: 'wood' }); for (const s of [-1, 1]) cyl('cart_wheel', 'wood', .45, .1, [-12.5 + s * .55, 1.2 - .55, 3.65], '#5a3a22', { lie: 'y' });
  const flagT = canvasTex(128, 80, (g) => { g.fillStyle = '#c0392b'; g.fillRect(0, 0, 128, 80); g.fillStyle = '#ffd23f'; g.beginPath(); g.arc(64, 40, 18, 0, 7); g.fill(); });
  cyl('flag_pole', 'wood', .05, 4, [-7.8, -1.6, 3.2], '#5a3a22'); const flag = new THREE.Mesh(new THREE.PlaneGeometry(1.2, .75, 10, 1), texMat(flagT, { lit: true })); flag.position.copy(B2T([-7.2, -1.6, 6.8])); flag.name = 'flag'; flag.userData.role = 'cloth'; scene.add(flag); const fp = flag.geometry.attributes.position, f0 = Float32Array.from(fp.array);
  const sg = signTex(K, 512, 220, '#3a2a1a', [['RIVER CROSSING', 54, '#ffd36b', 80], ['LONGEST ARCH IN THE LAND', 30, '#f2e8d0', 150, '700']], { border: '#ffd36b', bw: 8 });
  panel('camp_sign', 'cloth', 2.2, .95, [-10.2, -4.2, 4.6], texMat(sg, { lit: true }), { ry: .3 }); for (const s of [-1, 1]) box('sign_post', 'wood', .08, .08, 1.3, [-10.2 + s * .95, -4.2 + s * .3, 3.2], '#5a3a22');
  // mist over the water + spray at the rocks
  const mistT = canvasTex(64, 64, (g) => { const gr = g.createRadialGradient(32, 32, 2, 32, 32, 30); gr.addColorStop(0, 'rgba(255,255,255,.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); });
  const mist = []; for (let i = 0; i < 30; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: mistT, transparent: true, depthWrite: false })); s.userData.noExport = true; scene.add(s); mist.push(s); }
  const dust = []; for (let i = 0; i < 24; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: mistT, color: '#d8c8a8', transparent: true, depthWrite: false })); s.userData.noExport = true; s.visible = false; scene.add(s); dust.push(s); }
  light('#fff2d8', 3, 14, [0, -3, 2.5]);
  const sm = u => { u = Math.max(0, Math.min(1, u)); return u * u * (3 - 2 * u); };
  return {
    anchors: { our_arch: [0, 0, SPRING + RISE], rival_arch: [0, RIVAL_Y, SPRING + RISE], sand_box: [BOXES[1], -1.2, PAD_Z + .35], plug: [BOXES[1], -1.55, PAD_Z + .1], crack: [.15, RIVAL_Y - 1.75, SPRING + RISE - .5], camp: [-11, 0, 4], river: [0, -6, WATER] },
    update: (f, t) => {
      for (let i = 0; i < wp.count; i++) { const x = w0[i * 3], y = w0[i * 3 + 1]; wp.array[i * 3 + 2] = w0[i * 3 + 2] + Math.sin(y * 1.3 + t * 5) * .06 + Math.sin(x * 2 + y * .7 + t * 3) * .04; } wp.needsUpdate = true;
      foamT.offset.y = (t * .35) % 1;
      for (let i = 0; i < fp.count; i++) { const x = f0[i * 3]; fp.array[i * 3 + 2] = f0[i * 3 + 2] + Math.sin(t * 6 + x * 5) * .06 * (x + .6); } fp.needsUpdate = true;
      mist.forEach((s, i) => { const k = (t * .08 + i / 30) % 1; s.position.copy(B2T([(rnd(i) - .5) * 11, -14 + k * 40, WATER + .3 + rnd(i + 3) * .8])); s.scale.setScalar(2 + rnd(i + 5) * 2); s.material.opacity = .35 * Math.sin(k * Math.PI); });
      // OUR centering lowers while the sand runs out (millimetre by millimetre, smooth)
      const u = sm((t - pour[0]) / (pour[1] - pour[0])), drop = .16 * u; ours.center.position.copy(B2T([0, 0, -drop]));
      piles.forEach(p => p.scale.setScalar(.001 + u * 1.0));
      streams.forEach(({ x, yy, pts }) => pts.forEach((s, k) => { const on = t > pour[0] && t < pour[1] + .3; s.visible = on; if (!on) return; const ph = ((t * 2.2 + k / pts.length) % 1); s.position.copy(B2T([x + Math.sin(k * 7) * .02, yy - .38 - ph * .08, PAD_Z + .1 - ph * .12 + .02])); }));
      // RIVAL: posts shake under the axes, stones shift, then the crack shoots down from the crown and the crown drops a little
      const chopping = t > chop[0] && t < chop[1] + 1.5, hit = chopping ? Math.max(0, Math.sin(t * 9)) ** 6 : 0;
      rival.posts.forEach((p, i) => { p.rotation.z = (chopping ? Math.sin(t * 40 + i) * .02 * hit : 0); });
      const ck = sm((t - crackT) / .35), sag = ck * .08;
      rival.voussoirs.forEach((v, i) => { const mid = 1 - Math.abs(v.userData.a) / .9; v.position.copy(v.userData.base); v.position.y -= sag * Math.max(0, mid) ; if (chopping) { v.position.x += Math.sin(t * 50 + i * 3) * .015 * hit; v.position.y += Math.sin(t * 43 + i) * .01 * hit; } });
      if (rival.crack) { rival.crack.visible = t >= crackT; rival.crack.scale.set(1, Math.max(.001, ck), 1); }
      dust.forEach((s, i) => { const k = (t - crackT - i * .02) / 1.6; s.visible = k > 0 && k < 1; if (!s.visible) return; s.position.copy(B2T([.15 + (rnd(i) - .5) * 2.5 * k, RIVAL_Y - 1.9, SPRING + RISE - .3 - k * (1 + rnd(i + 2) * 2)])); s.scale.setScalar(.6 + k * 1.6); s.material.opacity = (1 - k) * .7; });
    },
  };
}
