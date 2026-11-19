// Shared set helpers for "Billionaire Dad". Plan coords: metres, Z up, Y away from the opening camera.
export function kit(THREE, scene, ctx) {
  const { B2T, toon } = ctx, n = {};
  const R = ctx.relief, PB = ctx.pbr;
  const add = (m, name, role, o = {}) => {
    if (!o.mat && o.metal) o = { ...o, mat: /gold|brass|copper/.test(o.metal) ? 'brass' : 'metal' };   // Blender plate: real metals, not chipped paint
    n[name] = (n[name] || 0) + 1; m.name = n[name] > 1 ? `${name}_${String(n[name]).padStart(2, '0')}` : name;
    m.userData.role = role; if (o.mat) m.userData.mat = o.mat; m.castShadow = o.cast ?? true; m.receiveShadow = true;
    (o.parent || scene).add(m); return m;
  };
  const tagHex = (m, col) => { if (m && col && typeof col === 'string') { m.userData = m.userData || {}; m.userData.baseHex = col; } return m; };
  const mat = (col, o = {}) => o.relief && R ? tagHex(R(o.relief, col, o.ro || {}), col) : o.metal && PB ? tagHex(PB.metal(o.metal, { color: col, ...(o.mo || {}) }), col) : o.basic ? new THREE.MeshBasicMaterial({ color: col, transparent: !!o.opacity, opacity: o.opacity ?? 1, side: THREE.DoubleSide, toneMapped: o.toneMapped ?? false }) : toon(col);
  // box with its BOTTOM at at[2]
  const box = (name, role, w, d, h, at, col, o = {}) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), o.m || mat(col, o)); m.position.copy(B2T([at[0], at[1], at[2] + h / 2]));
    if (o.rz) m.rotation.y = o.rz; if (o.rx) m.rotation.x = o.rx; return add(m, name, role, o);
  };
  const cyl = (name, role, r, h, at, col, o = {}) => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(o.r2 ?? r, r, h, o.seg ?? 20), o.m || mat(col, o)); m.position.copy(B2T([at[0], at[1], at[2] + h / 2]));
    if (o.lie === 'x') { m.rotation.z = Math.PI / 2; m.position.copy(B2T(at)); } if (o.lie === 'y') { m.rotation.x = Math.PI / 2; m.position.copy(B2T(at)); }
    return add(m, name, role, o);
  };
  const sph = (name, role, r, at, col, o = {}) => { const m = new THREE.Mesh(new THREE.SphereGeometry(r, o.seg ?? 20, 14), o.m || mat(col, o)); m.position.copy(B2T(at)); if (o.s) m.scale.set(...o.s); return add(m, name, role, o); };
  // a vertical plane facing -Y (toward the camera) at centre `at`; ry turns it about Z (radians)
  const panel = (name, role, w, h, at, m, o = {}) => { const g = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m); g.position.copy(B2T(at)); g.rotation.y = o.ry || 0; return add(g, name, role, { cast: false, ...o }); };
  const floor = (name, role, w, d, at, m, o = {}) => { const g = new THREE.Mesh(new THREE.PlaneGeometry(w, d), m); g.rotation.x = -Math.PI / 2; g.position.copy(B2T(at)); return add(g, name, role, { cast: false, ...o }); };
  const canvasTex = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); draw(g, w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
  const texMat = (t, o = {}) => o.lit ? new THREE.MeshToonMaterial({ map: t, transparent: !!o.transparent, side: THREE.DoubleSide }) : new THREE.MeshBasicMaterial({ map: t, transparent: !!o.transparent, side: THREE.DoubleSide, toneMapped: false });
  const light = (col, inten, dist, at, o = {}) => { const l = new THREE.PointLight(col, inten, dist, o.decay ?? 1.6); l.position.copy(B2T(at)); l.castShadow = !!o.shadow; if (o.shadow) { l.shadow.mapSize.set(1024, 1024); l.shadow.bias = -0.002; } l.userData.noExport = true; scene.add(l); return l; };
  const rnd = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  return { THREE, B2T, toon, add, mat, box, cyl, sph, panel, floor, canvasTex, texMat, light, rnd };
}

// a poster / sign: coloured background, big lettering, optional sub line and picture fn
export function signTex(K, w, h, bg, lines, o = {}) {
  return K.canvasTex(w, h, (g) => {
    g.fillStyle = bg; g.fillRect(0, 0, w, h);
    if (o.draw) o.draw(g, w, h);
    g.textAlign = 'center'; g.textBaseline = 'middle';
    lines.forEach(([t, size, col, y, font]) => { g.font = `${font || '900'} ${size}px Arial Black, Arial`; g.lineWidth = size * .14; g.strokeStyle = o.stroke || 'rgba(0,0,0,.0)'; if (o.stroke) g.strokeText(t, w / 2, y); g.fillStyle = col; g.fillText(t, w / 2, y); });
    if (o.border) { g.strokeStyle = o.border; g.lineWidth = o.bw || 10; g.strokeRect(o.bw / 2 || 5, o.bw / 2 || 5, w - (o.bw || 10), h - (o.bw || 10)); }
  });
}

// ---------------- held props (film.json held3d builders) ----------------
// phone: upright slab, screen faces -Z in three (toward the lens when held up); grip at the bottom, tip at the top
export function buildPhone(THREE, opts = {}) {
  const toon = opts.toon || (c => new THREE.MeshToonMaterial({ color: c })), g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(.085, .17, .012), toon('#1d1f27')); g.add(body);
  const c = document.createElement('canvas'); c.width = 128; c.height = 256; const x = c.getContext('2d');
  const gr = x.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, opts.top || '#ff7ab6'); gr.addColorStop(1, opts.bot || '#7a5cff'); x.fillStyle = gr; x.fillRect(0, 0, 128, 256);
  x.fillStyle = 'rgba(255,255,255,.85)'; for (let i = 0; i < 4; i++) { x.fillRect(12, 30 + i * 52, 104, 40); } x.fillStyle = '#ff4d6d'; x.beginPath(); x.arc(64, 236, 9, 0, 7); x.fill();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  for (const s of [-1, 1]) { const scr = new THREE.Mesh(new THREE.PlaneGeometry(.075, .155), new THREE.MeshBasicMaterial({ map: t, toneMapped: false })); scr.position.z = s * .0065; if (s > 0) scr.rotation.y = Math.PI; g.add(scr); }
  g.traverse(o => { o.userData.noExport = true; });
  return { group: g, grip: new THREE.Vector3(0, -.06, 0), tip: new THREE.Vector3(0, .085, 0) };
}
export function buildAxe(THREE, opts = {}) {
  const toon = opts.toon || (c => new THREE.MeshToonMaterial({ color: c })), g = new THREE.Group();
  const haft = new THREE.Mesh(new THREE.CylinderGeometry(.022, .026, .85, 10), toon('#8a5a32')); haft.position.y = .42; g.add(haft);
  const head = new THREE.Mesh(new THREE.BoxGeometry(.2, .1, .035), toon('#5a5e66')); head.position.set(.07, .8, 0); g.add(head);
  const edge = new THREE.Mesh(new THREE.BoxGeometry(.04, .16, .03), toon('#c9cdd6')); edge.position.set(.18, .8, 0); g.add(edge);
  g.traverse(o => { o.userData.noExport = true; o.castShadow = true; });
  return { group: g, grip: new THREE.Vector3(0, .12, 0), tip: new THREE.Vector3(.18, .8, 0) };
}
// a small wrench
export function buildWrench(THREE, opts = {}) {
  const toon = opts.toon || (c => new THREE.MeshToonMaterial({ color: c })), g = new THREE.Group();
  const bar = new THREE.Mesh(new THREE.BoxGeometry(.03, .22, .015), toon('#9aa0aa')); bar.position.y = .08; g.add(bar);
  const jaw = new THREE.Mesh(new THREE.TorusGeometry(.03, .012, 6, 12, Math.PI * 1.4), toon('#9aa0aa')); jaw.position.y = .21; g.add(jaw);
  g.traverse(o => { o.userData.noExport = true; });
  return { group: g, grip: new THREE.Vector3(0, 0, 0), tip: new THREE.Vector3(0, .22, 0) };
}
// a giant butcher's cleaver
export function buildCleaver(THREE, opts = {}) {
  const toon = opts.toon || (c => new THREE.MeshToonMaterial({ color: c })), g = new THREE.Group();
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(.025, .03, .22, 10), toon('#4a2e1a')); handle.position.y = .08; g.add(handle);
  const blade = new THREE.Mesh(new THREE.BoxGeometry(.32, .22, .012), toon('#c9cdd6')); blade.position.set(.1, .3, 0); g.add(blade);
  const edge = new THREE.Mesh(new THREE.BoxGeometry(.32, .025, .014), toon('#f2f4f8')); edge.position.set(.1, .195, 0); g.add(edge);
  const hole = new THREE.Mesh(new THREE.CircleGeometry(.025, 12), toon('#2a2a30')); hole.position.set(.21, .36, .007); g.add(hole);
  g.traverse(o => { o.userData.noExport = true; o.castShadow = true; });
  return { group: g, grip: new THREE.Vector3(0, .02, 0), tip: new THREE.Vector3(.26, .3, 0) };
}
// a silver platter with a domed cloche
export function buildPlatter(THREE, opts = {}) {
  const toon = opts.toon || (c => new THREE.MeshToonMaterial({ color: c })), g = new THREE.Group();
  const tray = new THREE.Mesh(new THREE.CylinderGeometry(.26, .26, .02, 28), toon('#d8dce4')); g.add(tray);
  const dome = new THREE.Mesh(new THREE.SphereGeometry(.2, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), toon('#e8ecf2')); dome.position.y = .01; g.add(dome);
  const knob = new THREE.Mesh(new THREE.SphereGeometry(.03, 12, 8), toon('#c9a24a')); knob.position.y = .22; g.add(knob);
  g.traverse(o => { o.userData.noExport = true; o.castShadow = true; });
  return { group: g, grip: new THREE.Vector3(0, -.02, 0), tip: new THREE.Vector3(0, .22, 0) };
}
// a paint bucket full of white paint, tipped forward; grip at the handle
export function buildBucket(THREE, opts = {}) {
  const toon = opts.toon || (c => new THREE.MeshToonMaterial({ color: c })), g = new THREE.Group();
  const can = new THREE.Mesh(new THREE.CylinderGeometry(.16, .13, .3, 20, 1, true), toon('#c9cdd6')); can.material.side = THREE.DoubleSide; can.position.y = -.2; g.add(can);
  const bottom = new THREE.Mesh(new THREE.CircleGeometry(.13, 20), toon('#a8adb6')); bottom.rotation.x = Math.PI / 2; bottom.position.y = -.35; g.add(bottom);
  const paint = new THREE.Mesh(new THREE.CircleGeometry(.15, 20), new THREE.MeshBasicMaterial({ color: '#ffffff' })); paint.rotation.x = -Math.PI / 2; paint.position.y = -.08; g.add(paint);
  const label = new THREE.Mesh(new THREE.CylinderGeometry(.152, .14, .12, 20, 1, true), toon('#3f7fc8')); label.position.y = -.2; g.add(label);
  const handle = new THREE.Mesh(new THREE.TorusGeometry(.16, .008, 6, 20, Math.PI), toon('#555')); handle.position.y = -.06; g.add(handle);
  g.rotation.z = -.6;
  g.traverse(o => { o.userData.noExport = true; o.castShadow = true; });
  return { group: g, grip: new THREE.Vector3(0, .1, 0), tip: new THREE.Vector3(.18, -.1, 0) };
}
// a tall glass of iced lemonade with a straw
export function buildLemonade(THREE, opts = {}) {
  const toon = opts.toon || (c => new THREE.MeshToonMaterial({ color: c })), g = new THREE.Group();
  const glass = new THREE.Mesh(new THREE.CylinderGeometry(.045, .038, .16, 16), new THREE.MeshToonMaterial({ color: '#fff1a0', transparent: true, opacity: .85 })); glass.position.y = .08; g.add(glass);
  for (let i = 0; i < 3; i++) { const ice = new THREE.Mesh(new THREE.BoxGeometry(.03, .03, .03), new THREE.MeshBasicMaterial({ color: '#ffffff' })); ice.position.set(-.015 + i * .015, .14 - i * .02, 0); g.add(ice); }
  const straw = new THREE.Mesh(new THREE.CylinderGeometry(.006, .006, .14, 8), toon('#e2483d')); straw.position.set(.02, .2, 0); straw.rotation.z = -.25; g.add(straw);
  const lemon = new THREE.Mesh(new THREE.CylinderGeometry(.035, .035, .008, 16), toon('#ffd23f')); lemon.position.set(-.04, .16, 0); lemon.rotation.x = Math.PI / 2; g.add(lemon);
  g.traverse(o => { o.userData.noExport = true; o.castShadow = true; });
  return { group: g, grip: new THREE.Vector3(0, .04, 0), tip: new THREE.Vector3(0, .2, 0) };
}
// a tar mop: long stick with a black, dripping mop head
export function buildMop(THREE, opts = {}) {
  const toon = opts.toon || (c => new THREE.MeshToonMaterial({ color: c })), g = new THREE.Group();
  const stick = new THREE.Mesh(new THREE.CylinderGeometry(.018, .018, 1.3, 8), toon('#b07a46')); stick.position.y = -.35; g.add(stick);
  const head = new THREE.Mesh(new THREE.BoxGeometry(.32, .1, .12), toon('#141416')); head.position.y = -1.0; g.add(head);
  for (let i = 0; i < 5; i++) { const d = new THREE.Mesh(new THREE.SphereGeometry(.025, 8, 6), toon('#141416')); d.position.set(-.12 + i * .06, -1.08 - (i % 2) * .04, 0); d.scale.y = 1.8; g.add(d); }
  g.traverse(o => { o.userData.noExport = true; o.castShadow = true; });
  return { group: g, grip: new THREE.Vector3(0, .1, 0), tip: new THREE.Vector3(0, -1.0, 0) };
}
