// WORLD MAP for "One Currency": real country shapes (NaturalEarth1, plan metres, x east, y north, map ~200 m wide) lying on z = 0,
// seen from above. Teal ocean with fake bathymetry, flat coloured countries with dark borders, and a timeline of overlays
// (emoji icons, labels, flag-balls, price tags, planes, fire, a 3D coin) driven by ctx.place.cues (seconds, film time).
import { WORLD } from './world_data.js';
import { kit } from './lib.js';
export const P = { usa: [-55.6, 25.2], dc: [-44.8, 25.1], france: [-3.7, 30], canada: [-51.2, 36.4], australia: [66.9, -16.1], greece: [6.2, 25.4],
  norway: [-0.4, 39.1], india: [37.5, 14.2], europe: [1, 32.1], germany: [0.2, 32.8], brazil: [-34.3, -6.4], china: [49.2, 22.6], russia: [35.8, 39.4], africa: [5.6, 3.2], atl: [-22, 14] };
const EURO = ['Austria', 'Belgium', 'Croatia', 'Cyprus', 'Estonia', 'Finland', 'France', 'Germany', 'Greece', 'Ireland', 'Italy', 'Latvia', 'Lithuania', 'Luxembourg', 'Malta', 'Netherlands', 'Portugal', 'Slovakia', 'Slovenia', 'Spain'];
const PAL = ['#f4d35e', '#ee964b', '#f95738', '#7bc67b', '#5fa8d3', '#c77dff', '#ff8fab', '#90e0ef', '#b5e48c', '#ffd6a5', '#a0c4ff', '#ffadad'];
const GOLD = '#ffd23f', GREEN = '#41d37e', RED = '#e2483d', BLUE = '#3d6fe0', GREY = '#8e9aa6';
const ease = u => u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u);
const back = u => { if (u <= 0) return 0; if (u >= 1) return 1; const c = 1.7; return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2); };
const rnd = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

export function build(THREE, scene, film, ctx) {
  const K = kit(THREE, scene, ctx), { B2T, canvasTex } = K, C = (ctx.place && ctx.place.cues) || {};
  const root = new THREE.Group(); root.rotation.x = -Math.PI / 2; scene.add(root);          // local x east, y north, z up -> plan
  const basic = (o) => new THREE.MeshBasicMaterial({ fog: false, toneMapped: false, ...o });
  // ---------------- ocean (bathymetry look) ----------------
  const OW = 360, OH = 220, TW = 4096, TH = Math.round(TW * OH / OW), sx = x => (x + OW / 2) / OW * TW, sy = y => (OH / 2 - y) / OH * TH;
  const trace = (g, rings) => { for (const r of rings) { g.moveTo(sx(r[0][0]), sy(r[0][1])); for (let i = 1; i < r.length; i++) g.lineTo(sx(r[i][0]), sy(r[i][1])); g.closePath(); } };
  const ocean = canvasTex(TW, TH, (g, w, h) => {
    const gr = g.createRadialGradient(w * .45, h * .45, 50, w * .5, h * .5, w * .7); gr.addColorStop(0, '#1d5664'); gr.addColorStop(1, '#0e2d38'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    // deep trenches and ridges: soft random strokes
    for (let i = 0; i < 900; i++) { const x = rnd(i) * w, y = rnd(i + 7) * h, l = 40 + rnd(i + 3) * 260, a = rnd(i + 5) * 6.3; g.strokeStyle = rnd(i + 9) > .5 ? 'rgba(120,200,210,.06)' : 'rgba(0,15,25,.10)'; g.lineWidth = 2 + rnd(i + 11) * 10; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a) * l * .5 + 30, y + Math.sin(a) * l * .5 - 30, x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }
    // continental shelf: lighter teal glow around every coast
    for (const [blur, col] of [[46, 'rgba(70,160,170,.55)'], [18, 'rgba(110,200,205,.6)'], [6, 'rgba(150,225,225,.7)']]) {
      g.save(); g.filter = `blur(${blur}px)`; g.fillStyle = col; g.beginPath(); for (const c of WORLD) for (const p of c.p) trace(g, [p[0]]); g.fill(); g.restore(); }
    // tiny noise speckle
    const id = g.getImageData(0, 0, w, h), d = id.data; for (let i = 0; i < d.length; i += 4) { const n = (Math.random() - .5) * 10; d[i] += n; d[i + 1] += n; d[i + 2] += n; } g.putImageData(id, 0, 0);
  });
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(OW, OH), basic({ map: ocean })); root.add(sea); sea.name = 'ocean'; const deep = new THREE.Mesh(new THREE.PlaneGeometry(2000, 2000), basic({ color: '#0e2d38' })); deep.position.z = -.05; root.add(deep); sea.userData.role = 'floor';
  // ---------------- countries ----------------
  const countries = {};
  WORLD.forEach((c, i) => {
    const shapes = c.p.map(poly => { const s = new THREE.Shape(poly[0].map(([x, y]) => new THREE.Vector2(x, y))); for (const h of poly.slice(1)) s.holes.push(new THREE.Path(h.map(([x, y]) => new THREE.Vector2(x, y)))); return s; });
    const base = new THREE.Color(PAL[i % PAL.length]);
    const m = new THREE.Mesh(new THREE.ShapeGeometry(shapes, 2), basic({ color: base.clone() })); m.position.z = .03; m.name = 'country'; m.userData.role = 'floor'; root.add(m);
    let cx = 0, cy = 0, n = 0; for (const [x, y] of c.p[0][0]) { cx += x; cy += y; n++; }
    countries[c.n] = { m, base, i, c: [cx / n, cy / n] };
  });
  // borders: one merged ribbon mesh (width in metres), a darker coast and lighter inner borders look the same from far
  const bw = .16, pos = [], idx = [];
  for (const c of WORLD) for (const poly of c.p) for (const r of poly) {
    const n = r.length, b0 = pos.length / 3;
    for (let i = 0; i <= n; i++) { const p = r[i % n], a = r[(i - 1 + n) % n], q = r[(i + 1) % n];
      let tx = q[0] - a[0], ty = q[1] - a[1]; const l = Math.hypot(tx, ty) || 1; tx /= l; ty /= l;
      pos.push(p[0] - ty * bw / 2, p[1] + tx * bw / 2, .06, p[0] + ty * bw / 2, p[1] - tx * bw / 2, .06); }
    for (let i = 0; i < n; i++) { const p = r[i], q = r[(i + 1) % n]; if (Math.hypot(q[0] - p[0], q[1] - p[1]) > 6) continue; const k = b0 + i * 2; idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
  }
  const bg = new THREE.BufferGeometry(); bg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); bg.setIndex(idx);
  const borders = new THREE.Mesh(bg, basic({ color: '#16222a', side: THREE.DoubleSide })); borders.name = 'borders'; root.add(borders);
  // ---------------- overlay sprites ----------------
  const texCache = new Map();
  const emojiTex = (e, px = 256) => { const k = 'e' + e + px; if (!texCache.has(k)) texCache.set(k, canvasTex(px, px, (g, w, h) => { g.font = `${Math.round(w * .78)}px "Noto Color Emoji"`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.shadowColor = 'rgba(0,0,0,.45)'; g.shadowBlur = w * .05; g.shadowOffsetY = w * .03; g.fillText(e, w / 2, h * .54); })); return texCache.get(k); };
  const labelTex = (txt, o = {}) => { const k = 'l' + txt + JSON.stringify(o); if (!texCache.has(k)) { const fs = o.fs || 120, c = document.createElement('canvas'), g0 = c.getContext('2d'); g0.font = `900 ${fs}px "Arial Black", Arial`; const tw = g0.measureText(txt).width;
      texCache.set(k, { t: canvasTex(Math.ceil(tw + fs * .8), Math.ceil(fs * 1.5), (g, w, h) => { if (o.bg) { g.fillStyle = o.bg; const r = h * .35; g.beginPath(); g.roundRect(4, 4, w - 8, h - 8, r); g.fill(); g.lineWidth = 8; g.strokeStyle = '#111'; g.stroke(); }
        g.font = `900 ${fs}px "Arial Black", Arial`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round'; g.lineWidth = fs * .2; g.strokeStyle = o.stroke || '#111'; if (!o.bg) g.strokeText(txt, w / 2, h * .54); g.fillStyle = o.col || '#fff'; g.fillText(txt, w / 2, h * .54); }), a: (tw + fs * .8) / (fs * 1.5) }); } return texCache.get(k); };
  const flagDraw = {
    usa: (g, w, h) => { for (let i = 0; i < 13; i++) { g.fillStyle = i % 2 ? '#fff' : '#c8102e'; g.fillRect(0, i * h / 13, w, h / 13 + 1); } g.fillStyle = '#1f3b8a'; g.fillRect(0, 0, w * .48, h * 7 / 13); g.fillStyle = '#fff'; for (let r = 0; r < 4; r++) for (let q = 0; q < 5; q++) { g.beginPath(); g.arc(w * (.06 + q * .09), h * (.07 + r * .12), w * .018, 0, 7); g.fill(); } },
    france: (g, w, h) => { [['#1f3b8a', 0], ['#fff', 1], ['#d22630', 2]].forEach(([c, i]) => { g.fillStyle = c; g.fillRect(i * w / 3, 0, w / 3 + 1, h); }); },
    canada: (g, w, h) => { g.fillStyle = '#d52b1e'; g.fillRect(0, 0, w, h); g.fillStyle = '#fff'; g.fillRect(w * .27, 0, w * .46, h); g.font = `${w * .36}px "Noto Color Emoji"`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('🍁', w / 2, h * .55); },
    australia: (g, w, h) => { g.fillStyle = '#012169'; g.fillRect(0, 0, w, h); g.strokeStyle = '#fff'; g.lineWidth = w * .07; g.beginPath(); g.moveTo(0, 0); g.lineTo(w * .5, h * .5); g.moveTo(w * .5, 0); g.lineTo(0, h * .5); g.stroke(); g.strokeStyle = '#c8102e'; g.lineWidth = w * .025; g.stroke(); g.fillStyle = '#fff'; g.fillRect(w * .21, 0, w * .08, h * .5); g.fillRect(0, h * .21, w * .5, h * .08); g.fillStyle = '#c8102e'; g.fillRect(w * .23, 0, w * .04, h * .5); g.fillRect(0, h * .23, w * .5, h * .04); g.fillStyle = '#fff'; for (const [x, y, r] of [[.25, .75, .06], [.75, .3, .035], [.68, .55, .035], [.85, .5, .03], [.75, .82, .035]]) { g.beginPath(); g.arc(w * x, h * y, w * r, 0, 7); g.fill(); } },
    greece: (g, w, h) => { for (let i = 0; i < 9; i++) { g.fillStyle = i % 2 ? '#fff' : '#0d5eaf'; g.fillRect(0, i * h / 9, w, h / 9 + 1); } g.fillStyle = '#0d5eaf'; g.fillRect(0, 0, w * .4, h * 5 / 9); g.fillStyle = '#fff'; g.fillRect(w * .16, 0, w * .08, h * 5 / 9); g.fillRect(0, h * 2 / 9, w * .4, h / 9); },
    norway: (g, w, h) => { g.fillStyle = '#ba0c2f'; g.fillRect(0, 0, w, h); g.fillStyle = '#fff'; g.fillRect(w * .28, 0, w * .2, h); g.fillRect(0, h * .4, w, h * .2); g.fillStyle = '#00205b'; g.fillRect(w * .32, 0, w * .12, h); g.fillRect(0, h * .44, w, h * .12); },
    india: (g, w, h) => { [['#ff9933', 0], ['#fff', 1], ['#138808', 2]].forEach(([c, i]) => { g.fillStyle = c; g.fillRect(0, i * h / 3, w, h / 3 + 1); }); g.strokeStyle = '#000080'; g.lineWidth = w * .02; g.beginPath(); g.arc(w / 2, h / 2, h * .12, 0, 7); g.stroke(); },
    germany: (g, w, h) => { [['#000', 0], ['#dd0000', 1], ['#ffce00', 2]].forEach(([c, i]) => { g.fillStyle = c; g.fillRect(0, i * h / 3, w, h / 3 + 1); }); },
    brazil: (g, w, h) => { g.fillStyle = '#009c3b'; g.fillRect(0, 0, w, h); g.fillStyle = '#ffdf00'; g.beginPath(); g.moveTo(w * .5, h * .12); g.lineTo(w * .92, h * .5); g.lineTo(w * .5, h * .88); g.lineTo(w * .08, h * .5); g.fill(); g.fillStyle = '#002776'; g.beginPath(); g.arc(w / 2, h / 2, w * .2, 0, 7); g.fill(); },
    china: (g, w, h) => { g.fillStyle = '#de2910'; g.fillRect(0, 0, w, h); g.fillStyle = '#ffde00'; g.font = `${w * .3}px Arial`; g.fillText('★', w * .12, h * .38); },
    japan: (g, w, h) => { g.fillStyle = '#fff'; g.fillRect(0, 0, w, h); g.fillStyle = '#bc002d'; g.beginPath(); g.arc(w / 2, h / 2, w * .2, 0, 7); g.fill(); },
  };
  const ballTex = (fl, mood = 'ok') => { const k = 'b' + fl + mood; if (!texCache.has(k)) texCache.set(k, canvasTex(256, 256, (g, w, h) => {
    g.save(); g.beginPath(); g.arc(128, 132, 104, 0, 7); g.clip(); (flagDraw[fl] || flagDraw.japan)(g, 256, 256); const sh = g.createRadialGradient(95, 90, 10, 128, 132, 110); sh.addColorStop(0, 'rgba(255,255,255,.35)'); sh.addColorStop(.6, 'rgba(255,255,255,0)'); sh.addColorStop(1, 'rgba(0,0,0,.35)'); g.fillStyle = sh; g.fillRect(0, 0, 256, 256); g.restore();
    g.lineWidth = 9; g.strokeStyle = '#111'; g.beginPath(); g.arc(128, 132, 104, 0, 7); g.stroke();
    // eyes
    for (const s of [-1, 1]) { g.fillStyle = '#fff'; g.beginPath(); g.ellipse(128 + s * 34, 116, 20, mood === 'shock' ? 26 : 22, 0, 0, 7); g.fill(); g.lineWidth = 5; g.stroke();
      g.fillStyle = '#111'; g.beginPath(); g.arc(128 + s * 34 + (mood === 'side' ? 8 : 0), 120, mood === 'shock' ? 6 : 9, 0, 7); g.fill();
      if (mood === 'angry') { g.lineWidth = 9; g.beginPath(); g.moveTo(128 + s * 56, 86); g.lineTo(128 + s * 18, 100); g.stroke(); }
      if (mood === 'happy') { g.fillStyle = (flagDraw[fl] ? '#fff' : '#fff'); } }
    if (mood === 'happy') { g.lineWidth = 8; g.beginPath(); g.arc(128, 160, 26, .2, Math.PI - .2); g.stroke(); }
    if (mood === 'shock' || mood === 'angry') { g.fillStyle = '#111'; g.beginPath(); g.ellipse(128, 172, 14, mood === 'shock' ? 18 : 8, 0, 0, 7); g.fill(); }
    if (mood === 'sweat') { g.fillStyle = '#7fd0ff'; g.beginPath(); g.moveTo(205, 60); g.quadraticCurveTo(222, 92, 205, 100); g.quadraticCurveTo(188, 92, 205, 60); g.fill(); g.lineWidth = 4; g.stroke(); g.lineWidth = 7; g.beginPath(); g.moveTo(108, 170); g.quadraticCurveTo(128, 158, 148, 170); g.stroke(); }
  })); return texCache.get(k); };
  const coinTex = (face) => { const k = 'c' + face; if (!texCache.has(k)) texCache.set(k, canvasTex(512, 512, (g, w, h) => {
    const gr = g.createRadialGradient(200, 180, 20, 256, 256, 256); gr.addColorStop(0, '#fff3b0'); gr.addColorStop(.5, '#ffd23f'); gr.addColorStop(1, '#c98b10'); g.fillStyle = gr; g.beginPath(); g.arc(256, 256, 250, 0, 7); g.fill();
    g.lineWidth = 14; g.strokeStyle = '#a86e08'; g.beginPath(); g.arc(256, 256, 214, 0, 7); g.stroke(); for (let i = 0; i < 48; i++) { const a = i / 48 * 6.283; g.fillStyle = '#b97c0c'; g.beginPath(); g.arc(256 + Math.cos(a) * 234, 256 + Math.sin(a) * 234, 5, 0, 7); g.fill(); }
    g.textAlign = 'center'; g.textBaseline = 'middle';
    if (face === 'G') { g.font = '900 250px "Arial Black", Arial'; g.fillStyle = '#a86e08'; g.fillText('G', 262, 272); g.fillStyle = '#fff1a8'; g.fillText('G', 252, 262); g.font = '900 40px "Arial Black", Arial'; g.fillStyle = '#8a5a06'; g.fillText('GLOBO', 256, 420); }
    else if (face === 'blank') { g.font = '900 230px "Arial Black", Arial'; g.fillStyle = '#a86e08'; g.fillText('?', 256, 270); }
    else { g.font = '260px "Noto Color Emoji"'; g.fillText(face, 256, 276); g.font = '900 40px "Arial Black", Arial'; g.fillStyle = '#8a5a06'; g.fillText('GLOBO', 256, 440); }
  })); texCache.get(k).center.set(.5, .5); texCache.get(k).rotation = Math.PI / 2; return texCache.get(k); };
  const items = [];
  const mkSprite = (tex, w, h) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false, depthWrite: false, fog: false, toneMapped: false })); s.renderOrder = 10; s.userData.noExport = true; s.userData.wh = [w, h]; s.visible = false; scene.add(s); return s; };
  // item: { s: sprite, at:[x,y], z, t0, t1, w, h, kind, wob, path }
  const add = (o) => { const s = mkSprite(o.tex, o.w, o.h || o.w); items.push({ z: 2, wob: 0, ...o, s }); return items[items.length - 1]; };
  const emoji = (e, at, w, t0, t1, o = {}) => add({ tex: emojiTex(e), at, w, t0, t1, ...o });
  const label = (txt, at, h, t0, t1, o = {}) => { const L = labelTex(txt, o); return add({ tex: L.t, at, w: h * L.a, h, t0, t1, ...o }); };
  const ball = (fl, at, w, t0, t1, o = {}) => add({ tex: ballTex(fl, o.mood), at, w, t0, t1, ...o });
  const T = (k, d = 1e9) => C[k] ?? d;
  // ---------------- the story timeline (all times from gen_film cues) ----------------
  // L1-2: dollar over the USA, poof; every country its own colour + a currency symbol, then all turn GOLD
  emoji('💵', P.usa, 16, 0, T('poof'), { wob: 1 });
  emoji('💨', P.usa, 18, T('poof'), T('poof') + .7, { fade: 1 });
  ball('usa', [P.usa[0] + 9, P.usa[1] - 9], 9, .2, T('poof') + .9, { mood: 'shock', at2: null });
  const syms = [['€', P.europe], ['£', [-9, 38]], ['¥', [66, 24]], ['₹', P.india], ['₽', P.russia], ['R$', P.brazil], ['₦', [-1, 6]], ['元', P.china], ['$', P.canada], ['A$', P.australia], ['₩', [58, 25]], ['R', [16, -26]], ['₺', [16, 27]], ['MX$', [-60, 15]]];
  syms.forEach(([s, at], i) => label(s, at, 5, T('syms') + i * .08, T('gold') + .25, { col: '#fff', fs: 120 }));
  const coinBig = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, .12, 64), [basic({ color: '#c98b10' }), basic({ map: coinTex('G') }), basic({ map: coinTex('G') })]);
  coinBig.userData.noExport = true; coinBig.visible = false; scene.add(coinBig);
  const faceMat = coinBig.material[1];
  // L7: nobody knows, not even the government
  ball('usa', [P.dc[0] - 2, P.dc[1] - 4], 8, T('nobody'), T('tag9') - .3, { mood: 'side' }); emoji('🏛️', [P.dc[0] - 12, P.dc[1] + 2], 8, T('nobody') + .1, T('tag9') - .3); emoji('❓', [P.dc[0] + 3, P.dc[1] + 4], 5, T('nobody') + .5, T('tag9') - .3, { wob: 1 }); emoji('❓', [P.dc[0] - 8, P.dc[1] + 9], 4, T('gov'), T('tag9') - .3, { wob: 1 });
  // L8-11: burger tags, then planes flood to the cheap country
  emoji('🍔', [P.norway[0] - 7, P.norway[1] + 3], 7, T('tag9'), T('fly') + 1.2); label('9 G', [P.norway[0] + 2, P.norway[1] + 1], 5.5, T('tag9') + .15, T('fly') + 1.2, { bg: '#ffffff', col: '#e2483d', fs: 110 });
  emoji('🍔', [P.india[0] - 7, P.india[1] + 3], 7, T('tag2'), T('end')); label('2 G', [P.india[0] + 2, P.india[1] + 1], 5.5, T('tag2') + .15, T('end'), { bg: '#ffffff', col: '#1a9e52', fs: 110 });
  for (let i = 0; i < 70; i++) { const a = rnd(i) * 6.283, r = 45 + rnd(i + 3) * 60, from = [P.india[0] + Math.cos(a) * r * 1.4, P.india[1] + Math.sin(a) * r * .7], t0 = T('fly') + rnd(i + 8) * 1.2;
    emoji('✈️', from, 4.6, t0, t0 + 1.6, { path: [from, P.india], dur: 1.5, turn: 1 }); }
  // L15-16: half the planet cheers (green + 📈), the other half burns (red + 🔥)
  const west = n => countries[n].c[0] < 12;
  for (let i = 0; i < 9; i++) emoji(['🤑', '🎉', '💰'][i % 3], [-75 + rnd(i) * 80, -30 + rnd(i + 2) * 75], 6, T('cheer') + i * .07, T('europe'));
  for (let i = 0; i < 16; i++) emoji('🔥', [20 + rnd(i + 30) * 65, -28 + rnd(i + 32) * 72], 5 + rnd(i) * 3, T('fire') + i * .06, T('europe'), { wob: 2 });
  // L17-18: Europe zoom, the euro, Greece crashes
  emoji('💶', [P.europe[0] - 6, P.europe[1] + 6], 6, T('europe') + .3, T('coinwar'));
  ball('greece', [P.greece[0] + 4.5, P.greece[1] - 3.5], 4.2, T('greece'), T('coinwar'), { mood: 'sweat', shake: 1 });
  emoji('🖨️', [P.greece[0] - 5, P.greece[1] - 4.5], 4, T('print'), T('coinwar')); emoji('❌', [P.greece[0] - 5, P.greece[1] - 4.5], 4.4, T('print') + .3, T('coinwar'));
  emoji('📉', [P.greece[0] + 1, P.greece[1] + 3.5], 4, T('greece') + .3, T('coinwar'));
  // L19-23: the coin war. Blank coin centre-Atlantic, four balls pitch their faces
  const pitch = [['usa', P.usa, '🦅', 'eagle'], ['france', P.france, '🥐', 'croissant'], ['canada', P.canada, '🫎', 'moose'], ['australia', P.australia, '🕷️', 'spider']];
  pitch.forEach(([fl, at, e, k], i) => { const t0 = T(k), at2 = [P.atl[0] + [-15, 15, -15, 15][i], P.atl[1] + [13, 13, -13, -13][i]];
    ball(fl, at2, 9, T('coinwar') + .2 + i * .12, T('potato') - .2, { mood: 'angry', yell: [t0, t0 + 1.2] });
    emoji(e, [at2[0], at2[1] + 8.5], 7, t0, T('potato') - .2, { wob: 1 }); });
  emoji('🗣️', [P.atl[0] - 4, P.atl[1] - 24], 6, T('meet'), T('potato') - .2); label('400 HOURS', [P.atl[0] + 6, P.atl[1] - 24], 4, T('meet') + .2, T('potato') - .2, { bg: '#ffffff', col: '#111', fs: 100 });
  // end: dollar vs potato
  emoji('💵', [P.atl[0] - 13, P.atl[1] + 2], 15, T('final'), T('end')); label('OR', [P.atl[0], P.atl[1] + 2], 5, T('final') + .2, T('end'), { col: '#ffd23f' }); emoji('🥔', [P.atl[0] + 13, P.atl[1] + 2], 15, T('final') + .35, T('end'));
  label('COMMENT 👇', [P.atl[0], P.atl[1] - 12], 5.5, T('comment'), T('end'), { bg: '#e2483d', col: '#fff', fs: 110 });
  // ---------------- colours over time ----------------
  const cGold = new THREE.Color(GOLD), cGreen = new THREE.Color(GREEN), cRed = new THREE.Color(RED), cBlue = new THREE.Color(BLUE), cGrey = new THREE.Color(GREY), tmp = new THREE.Color();
  function colourAt(name, k, t) {
    tmp.copy(k.base);
    if (t < T('gold')) { if (name === 'United States of America' && t < T('poof') + .8) tmp.lerp(cGreen, .8); return tmp; }
    const ug = ease((t - T('gold')) / .8 - k.c[0] / 260 - .2); tmp.lerp(cGold, Math.min(1, ug * 1.6));
    if (t >= T('cheer') && t < T('europe')) { tmp.copy(cGold); const u = ease((t - (west(name) ? T('cheer') : T('fire'))) / .6); tmp.lerp(west(name) ? cGreen : cRed, u); }
    if (t >= T('europe') && t < T('coinwar')) { tmp.copy(cGold).lerp(cGrey, .55); if (EURO.includes(name)) { tmp.lerp(cBlue, ease((t - T('europe') - .2 - k.i % 7 * .05) / .5)); if (name === 'Greece') tmp.lerp(cRed, ease((t - T('greece')) / .3)); } }
    if (t >= T('coinwar')) { tmp.copy(cGold); if (t < T('potato') + .2) tmp.lerp(cGrey, .25); }
    return tmp;
  }
  const W3 = (x, y, z) => B2T([x, y, z]);
  return {
    anchors: { usa: [...P.usa, 0], india: [...P.india, 0], europe: [...P.europe, 0], atl: [...P.atl, 0], world: [-10, 10, 0] },
    update: (f, t) => {
      for (const [n, k] of Object.entries(countries)) { k.m.material.color.copy(colourAt(n, k, t)); k.m.position.x = n === 'Greece' && t > T('greece') && t < T('coinwar') ? Math.sin(t * 60) * .25 : 0; }
      for (const it of items) {
        const vis = t >= it.t0 && t < it.t1; it.s.visible = vis; if (!vis) continue;
        const a = t - it.t0, out = it.t1 - t, pop = back(Math.min(1, a / .28)) * (out < .2 ? Math.max(0, out / .2) : 1);
        let [x, y] = it.at, sc = pop, rot = 0;
        if (it.path) { const u = ease(Math.min(1, a / it.dur)); x = it.path[0][0] + (it.path[1][0] - it.path[0][0]) * u; y = it.path[0][1] + (it.path[1][1] - it.path[0][1]) * u; rot = Math.atan2(it.path[1][1] - it.path[0][1], it.path[1][0] - it.path[0][0]) - Math.PI / 4; sc = u > .85 ? (1 - u) / .15 : 1; }
        if (it.wob === 1) rot += Math.sin(t * 6 + it.at[0]) * .12; if (it.wob === 2) sc *= 1 + Math.sin(t * 14 + it.at[0] * 3) * .12;
        if (it.shake) x += Math.sin(t * 50) * .35;
        if (it.yell && t > it.yell[0] && t < it.yell[1]) { sc *= 1.25 + Math.sin(t * 30) * .08; y += Math.abs(Math.sin(t * 18)) * 1.2; }
        if (it.fade) it.s.material.opacity = Math.max(0, 1 - a / (it.t1 - it.t0));
        it.s.position.copy(W3(x, y, it.z)); it.s.scale.set(it.w * sc, (it.h || it.w) * sc, 1); it.s.material.rotation = rot;
      }
      // the 3D coin: arrives spinning at 'globo', sits as the blank coin at 'coinwar', flips to the potato at 'potato'
      let cv = false, cs = 1, cp = [P.atl[0], P.atl[1] + 2, 3], spin = 0;
      if (t >= T('globo') && t < T('globo_end')) { cv = true; const a = t - T('globo'); cs = 8.5 * back(Math.min(1, a / .45)); spin = Math.max(0, 1 - a / 1.1) * 9; cp = [-10, 14, 4]; faceMat.map = coinTex('G'); }
      if (t >= T('coinwar') && t < T('final')) { cv = true; const a = t - T('coinwar'); cs = 9 * back(Math.min(1, a / .4)); faceMat.map = coinTex(t < T('potato') + .25 ? 'blank' : '🥔');
        if (t >= T('potato') - .35 && t < T('potato') + .45) spin = (t - T('potato') + .35) / .8 * Math.PI * 4; }
      coinBig.visible = cv; if (cv) { coinBig.scale.set(cs, cs * .6, cs); coinBig.position.copy(W3(...cp)); coinBig.rotation.set(0, 0, 0); coinBig.rotateZ(spin); }
    },
  };
}
