// THE VALLEY STREET: a desert-valley block of flat-roofed stucco houses. Every roof is glossy black tar except HIS (centre),
// which turns white as he pours paint (cue paint0..paint1). Brown mountains ring the valley, power poles + wires run along
// the street, AC units sit on the tar roofs. Plan metres, Z up; street along x at y = -6; houses' fronts face -y.
// Place option `hot: true` (August): orange haze, a huge sun, heat shimmer, an egg frying on a tar roof (cue egg), sun rays
// soaked by the tar roofs but bounced back to space by the white one (cue mirror..trip), then the grid trips (cue trip):
// AC sparks, the transformer bangs, the tar houses' windows go dark.
import { kit, signTex } from './lib.js';
export const HERO = [0, 2, 0], ROOF_H = 3.2, HERO_SPOT = [0.9, 0.6, 3.2], NB_YARD = [-4.7, -3.0, 0], NB_ROOF = [-9.0, 0.4, 3.2];
export function build(THREE, scene, film, ctx) {
  const K = kit(THREE, scene, ctx), { box, cyl, sph, panel, floor, mat, canvasTex, texMat, light, B2T, rnd } = K;
  const O = ctx.place || {}, C = O.cues || {}, HOT = !!O.hot, T = (k, d = 1e9) => C[k] ?? d;
  // ground, street, sidewalk, gravel yards
  floor('desert', 'ground', 400, 400, [0, 60, -.02], mat('#d8b98a', { relief: 'stone', ro: { scale: 4 } }), { mat: 'sand' });
  floor('street', 'ground', 120, 4.4, [0, -6.2, 0], mat('#3a3a40', { relief: 'stone', ro: { scale: 1.5 } }), { mat: 'asphalt' });
  for (let i = 0; i < 24; i++) box('lane_dash', 'paint', 1.4, .14, .01, [-58 + i * 5, -6.2, .01], '#f2d36a');
  box('sidewalk', 'concrete', 120, 1.4, .12, [-0, -3.4, 0], '#c9c2b4');
  // houses
  const STUCCO = ['#e8c9a0', '#d9a87a', '#efe0c4', '#c98f6a', '#e3b98f', '#d6c0a0'], tarM = mat('#18181c', { relief: 'stone', ro: { scale: .6 } });
  const tarWins = [], acs = [], tarRoofs = [];
  let heroRoof = null, paintTex = null, paintCtx = null;
  function house(x, y, w, d, h, i, hero = false, far = false) {
    box('house_wall', 'stucco', w, d, h, [x, y, 0], STUCCO[i % 6], { relief: 'plaster' });
    for (const s of [-1, 1]) box('parapet', 'stucco', w + .1, .2, .3, [x, y + s * d / 2, h], STUCCO[i % 6]); for (const s of [-1, 1]) box('parapet', 'stucco', .2, d, .3, [x + s * w / 2, y, h], STUCCO[i % 6]);
    if (hero) { const c = document.createElement('canvas'); c.width = c.height = 256; paintCtx = c.getContext('2d'); paintCtx.fillStyle = '#18181c'; paintCtx.fillRect(0, 0, 256, 256);
      paintTex = new THREE.CanvasTexture(c); paintTex.colorSpace = THREE.SRGBColorSpace; heroRoof = floor('hero_roof', 'roof', w - .3, d - .3, [x, y, h + .02], new THREE.MeshToonMaterial({ map: paintTex }), { mat: 'roof_paint' }); }
    else { const r = floor('tar_roof', 'roof', w - .3, d - .3, [x, y, h + .02], tarM, { mat: 'tar' }); tarRoofs.push([x, y, h, w, d]); }
    if (far) return;
    for (const wx of [-w / 3, w / 3]) { const wm = box('window', 'lamp', 1.1, .05, 1.0, [x + wx, y - d / 2 - .03, 1.2], '#ffd88a', { basic: true, cast: false }); box('window_frame', 'wood', 1.3, .06, .12, [x + wx, y - d / 2 - .04, 1.1], '#6a4428'); if (!hero) tarWins.push(wm); }
    box('door', 'wood', .9, .06, 2.0, [x, y - d / 2 - .03, 0], ['#7a3a2a', '#2e5a6a', '#6a4a2a'][i % 3]);
    if (!hero) { const ac = box('ac_unit', 'metal', .9, .7, .55, [x + w / 4, y + .5, h + .02], '#c9cdd6', { metal: 'steel' }); cyl('ac_fan', 'metal', .26, .02, [x + w / 4, y + .5, h + .58], '#55585e'); acs.push([x + w / 4, y + .5, h + .6]); }
    else for (let k = 0; k < 4; k++) cyl('paint_can', 'metal', .16, .3, [x + w / 2 - .6 - k * .4, y + d / 2 - .6, h + .02], '#c9cdd6', { metal: 'steel' });
    box('vent_pipe', 'metal', .15, .15, .5, [x - w / 3, y + d / 4, h], '#8a8e96');
    // yard: cactus or palm, a car on some drives
    if (i % 2) { cyl('cactus', 'plant', .2, 1.6, [x - w / 2 - .6, y - d / 2 - 1.0, 0], '#4a8a4a'); cyl('cactus_arm', 'plant', .12, .7, [x - w / 2 - .3, y - d / 2 - 1.0, .7], '#4a8a4a'); }
    else { cyl('palm_trunk', 'wood', .16, 5, [x + w / 2 + .7, y - d / 2 - .8, 0], '#8a6a44'); sph('palm_crown', 'leaf', .9, [x + w / 2 + .7, y - d / 2 - .8, 5.1], '#3d8b4a', { s: [1.6, 1.6, .6] }); }
    if (i % 3 === 0) { box('car', 'metal', 3.6, 1.7, .9, [x + w / 2 + 2.6, y - d / 2 - 1.6, .25], ['#c0392b', '#2e6ab0', '#e8e4dc'][i % 3]); box('car_cab', 'glass', 2, 1.5, .6, [x + w / 2 + 2.4, y - d / 2 - 1.6, 1.1], '#556070'); }
  }
  let k = 0;
  for (let i = -3; i <= 3; i++) house(i * 9.5, 2, 7.2, 6.4, ROOF_H, k++, i === 0);
  for (let i = -4; i <= 4; i++) house(i * 9.5 + 4.7, 15, 7.2, 6.4, ROOF_H, k++, false, true);
  for (let i = -5; i <= 5; i++) house(i * 9 + 2, 27, 6.6, 6, 3, k++, false, true);
  // mountains around the valley
  for (let i = 0; i < 14; i++) { const a = -1.2 + i * .18, r = 110 + rnd(i) * 30, m = new THREE.Mesh(new THREE.ConeGeometry(28 + rnd(i + 3) * 20, 30 + rnd(i + 5) * 26, 7), mat(['#a8744a', '#b8865a', '#946a48'][i % 3]));
    m.position.copy(B2T([Math.sin(a) * r * 1.4, Math.cos(a) * r, 12])); K.add(m, 'mountain', 'terrain'); }
  // power poles + wires + the transformer
  const POLES = []; for (let i = -6; i <= 6; i++) { const x = i * 9.5 + 4.75; cyl('power_pole', 'wood', .12, 7.5, [x, -4.5, 0], '#5a4028'); box('crossarm', 'wood', 1.6, .1, .1, [x, -4.5, 7.0], '#5a4028'); POLES.push(x); }
  for (const dx of [-.7, 0, .7]) for (let i = 0; i < POLES.length - 1; i++) { const a = POLES[i], b = POLES[i + 1], w = new THREE.Mesh(new THREE.CylinderGeometry(.015, .015, b - a, 4), mat('#1a1a1a')); w.rotation.z = Math.PI / 2; w.position.copy(B2T([(a + b) / 2 + dx * 0, -4.5 + dx * .01, 7.12 - .25])); K.add(w, 'wire', 'cable'); }
  const TR = [POLES[6] - 0, -4.5, 6.2]; cyl('transformer', 'metal', .35, .9, [TR[0], TR[1] - .3, 5.6], '#8a8e96', { metal: 'steel' });
  // a street sign with the temperature
  const tsign = signTex(K, 512, 256, '#1c1c22', [['115°F', 150, '#ff5a3a', 128]], { border: '#888', bw: 12 });
  cyl('sign_pole', 'metal', .06, 3, [-13, -3.8, 0], '#555'); panel('temp_sign', 'lamp', 1.6, .8, [-13, -3.9, 3.1], texMat(tsign));
  // sun + hot haze (August)
  const sunT = canvasTex(256, 256, (g, w) => { const gr = g.createRadialGradient(128, 128, 10, 128, 128, 128); gr.addColorStop(0, '#fffbe0'); gr.addColorStop(.25, '#ffe27a'); gr.addColorStop(.5, 'rgba(255,170,60,.5)'); gr.addColorStop(1, 'rgba(255,120,40,0)'); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); });
  const sun = new THREE.Sprite(new THREE.SpriteMaterial({ map: sunT, transparent: true, depthWrite: false, fog: false })); sun.position.copy(B2T([25, 160, HOT ? 70 : 85])); sun.scale.set(HOT ? 90 : 45, HOT ? 90 : 45, 1); sun.userData.noExport = true; scene.add(sun);
  if (HOT) { const haze = canvasTex(64, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(255,120,40,0)'); gr.addColorStop(.6, 'rgba(255,140,60,.28)'); gr.addColorStop(1, 'rgba(255,160,80,.45)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
    const hz = new THREE.Mesh(new THREE.CylinderGeometry(150, 150, 60, 32, 1, true), new THREE.MeshBasicMaterial({ map: haze, transparent: true, side: THREE.BackSide, depthWrite: false, fog: false })); hz.position.copy(B2T([0, 20, 30])); hz.userData.noExport = true; scene.add(hz); }
  // sprites: heat shimmer, egg, sparks, rays
  const emo = (e) => canvasTex(128, 128, (g, w) => { g.font = '100px "Noto Color Emoji"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(e, 64, 70); });
  const spr = (tex, s) => { const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, fog: false })); m.scale.set(s, s, 1); m.visible = false; m.userData.noExport = true; scene.add(m); return m; };
  const waveT = canvasTex(64, 128, (g) => { g.strokeStyle = 'rgba(255,200,150,.55)'; g.lineWidth = 5; for (let k = 0; k < 3; k++) { g.beginPath(); for (let y = 0; y < 128; y += 4) g.lineTo(14 + k * 18 + Math.sin(y / 10 + k) * 6, 128 - y); g.stroke(); } });
  const waves = HOT ? tarRoofs.slice(0, 7).flatMap(([x, y, h], i) => [0, 1].map(j => ({ s: spr(waveT, 1.6), x: x + (j - .5) * 2, y, h, ph: i * .7 + j }))) : [];
  const egg = spr(emo('🍳'), 1.1), sizz = spr(waveT, 1.2), sparks = acs.map(() => spr(emo('⚡'), 1.0)), boom = spr(emo('💥'), 2.8);
  const glowM = new THREE.MeshBasicMaterial({ color: '#ff3a1a', transparent: true, opacity: 0, depthWrite: false, fog: false });
  const glows = tarRoofs.slice(0, 7).map(([x, y, h, w, d]) => { const g = new THREE.Mesh(new THREE.PlaneGeometry(w - .3, d - .3), glowM); g.rotation.x = -Math.PI / 2; g.position.copy(B2T([x, y, h + .05])); g.userData.noExport = true; scene.add(g); return g; });
  // sun rays: one per front-row roof; on tar roofs they stop (and the roof glows), on the white roof they bounce back up
  const rayM = new THREE.MeshBasicMaterial({ color: '#ffe36a', transparent: true, opacity: .85, depthWrite: false, fog: false });
  const rays = [-2, -1, 0, 1, 2].map(i => { const x = i * 9.5, top = [x - 6, -2, 26], hit = [x, 2, ROOF_H + .1], up = [x + 6, 4, 26];
    const mk = () => { const m = new THREE.Mesh(new THREE.CylinderGeometry(.09, .09, 1, 6), rayM); m.visible = false; m.userData.noExport = true; scene.add(m); return m; };
    return { i, x, top, hit, up, a: mk(), b: mk(), dot: spr(emo('🟡'), .5) }; });
  const seg = (m, p, q, u) => { const P = B2T(p), Q = B2T(q), E = P.clone().lerp(Q, u), L0 = P.distanceTo(E); if (L0 < .01) { m.visible = false; return; } m.visible = true; m.position.copy(P.clone().lerp(E, .5)); m.scale.set(1, L0, 1); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), E.clone().sub(P).normalize()); };
  light('#fff0d0', HOT ? 2 : 1, 60, [0, -20, 30]);
  // the white paint stream from his bucket to the roof while he pours
  const stream = new THREE.Mesh(new THREE.CylinderGeometry(.045, .07, 1, 10), new THREE.MeshBasicMaterial({ color: '#f4f4f4' })); stream.visible = false; stream.userData.noExport = true; scene.add(stream);
  return {
    anchors: { hero_roof: [HERO[0], HERO[1], ROOF_H + .5], nb_yard: [NB_YARD[0], NB_YARD[1], 1.5], sign: [-13, -3.9, 3.1], town: [0, 8, 2], transformer: TR },
    update: (f, t) => {
      // the paint spreading on his roof
      if (paintCtx) { const u = Math.max(0, Math.min(1, (t - T('paint0', 0)) / (T('paint1', 3) - T('paint0', 0)))); const key = Math.round(u * 60);
        if (paintCtx._k !== key) { paintCtx._k = key; paintCtx.fillStyle = '#18181c'; paintCtx.fillRect(0, 0, 256, 256); paintCtx.fillStyle = '#ffffff';
          if (u > 0) { paintCtx.beginPath(); const R = 30 + u * 260; for (let a = 0; a <= 64; a++) { const th = a / 64 * 6.283, rr = R * (1 + .08 * Math.sin(th * 5 + 1)); paintCtx.lineTo(170 + Math.cos(th) * rr, 175 + Math.sin(th) * rr); } paintCtx.fill(); }
          paintTex.needsUpdate = true; } }
      const pour = !HOT && t > T('paint0', 0) - .2 && t < T('paint1', 3); stream.visible = pour;
      if (pour) { const a = B2T([HERO_SPOT[0] - .42, HERO_SPOT[1] - .3, ROOF_H + .95]), b = B2T([HERO_SPOT[0] - .6, HERO_SPOT[1] - .4, ROOF_H + .03]); stream.position.copy(a.clone().lerp(b, .5)); stream.scale.set(1 + Math.sin(t * 30) * .1, a.distanceTo(b), 1); }
      if (!HOT) return;
      for (const w of waves) { const a = ((t * .6 + w.ph) % 1); w.s.visible = true; w.s.position.copy(B2T([w.x, w.y, w.h + .6 + a * 2.2])); w.s.material.opacity = Math.sin(a * Math.PI) * .9; }
      const eggOn = t > T('egg') && t < T('mirror'); egg.visible = eggOn; sizz.visible = eggOn; if (eggOn) { const h = tarRoofs[3]; egg.position.copy(B2T([h[0] - 1, h[1] - 1.2, h[2] + .25])); sizz.position.copy(B2T([h[0] - 1, h[1] - 1.2, h[2] + .9 + Math.sin(t * 9) * .1])); }
      // rays
      for (const r of rays) { const t0 = T('mirror') + (r.i + 2) * .12, on = t > t0 && t < T('trip') + .3;
        if (!on) { r.a.visible = r.b.visible = r.dot.visible = false; continue; }
        const u = Math.min(1, (t - t0) / .7); seg(r.a, r.top, r.hit, u);
        if (r.x === 0) { const v = Math.max(0, Math.min(1, (t - t0 - .7) / .8)); if (v > 0) seg(r.b, r.hit, r.up, v); else r.b.visible = false; } else r.b.visible = false;
        const cyc = ((t - t0) * .8) % 1, p = r.x === 0 ? (cyc < .5 ? B2T(r.top).lerp(B2T(r.hit), cyc * 2) : B2T(r.hit).lerp(B2T(r.up), (cyc - .5) * 2)) : B2T(r.top).lerp(B2T(r.hit), cyc); r.dot.visible = u >= 1; r.dot.position.copy(p); }
      glowM.opacity = t > T('mirror') + .5 && t < T('trip') + 2 ? .35 + Math.sin(t * 6) * .1 : (t > T('egg') && t < T('mirror') ? .25 : 0);
      // the grid trips
      const tr = T('trip'); sparks.forEach((s, i) => { const on = t > tr - .4 + i * .05 && t < tr + 1.2; s.visible = on && (Math.floor(t * 14 + i) % 2 === 0); if (on) s.position.copy(B2T([acs[i][0], acs[i][1], acs[i][2] + .4])); });
      boom.visible = t > tr && t < tr + .6; if (boom.visible) { boom.position.copy(B2T([TR[0], TR[1] - .4, 6.0])); const s = 2.8 * (1 + (t - tr) * 1.5); boom.scale.set(s, s, 1); }
      const dark = t > tr + .15; for (const w of tarWins) w.material.color.set(dark ? '#1a1a22' : '#ffd88a');
    },
  };
}
