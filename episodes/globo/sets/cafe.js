// THE COFFEE SHOP, day one of the Globo: warm brick cafe, counter with an espresso machine and a pastry case, a chalk menu
// priced in "G", pendant lamps, plants, a big window onto a sunny street. Plan metres, Z up. Counter front edge at y = 1.0
// (x -2..1.6); barista stands behind it at BAR, Brad in front at BRAD.
import { kit, signTex } from './lib.js';
export const BAR = [0.1, 1.75, 0], BRAD = [-0.2, 0.25, 0];
export function build(THREE, scene, film, ctx) {
  const K = kit(THREE, scene, ctx), { box, cyl, sph, panel, floor, mat, canvasTex, texMat, light, rnd } = K;
  floor('floor', 'wood', 9, 8, [0, 2, 0], mat('#9a6a44', { relief: 'wood', ro: { scale: .5 } }), { mat: 'wood_floor' });
  box('wall_back', 'brick', 9, .1, 3.4, [0, 3.2, 0], '#b65c3e', { relief: 'brick' }); box('wall_left', 'plaster', .1, 8, 3.4, [-4.5, 1.5, 0], '#efe2cc'); box('wall_right', 'plaster', .1, 8, 3.4, [4.5, 1.5, 0], '#efe2cc');
  // counter + top + front panels
  box('counter', 'wood', 3.8, .7, 1.0, [-0.2, 1.35, 0], '#5a3a26', { relief: 'wood' }); box('counter_top', 'stone', 4.0, .85, .06, [-0.2, 1.35, 1.0], '#2e2a28');
  for (let i = 0; i < 6; i++) box('counter_slat', 'wood', .5, .02, .8, [-1.95 + i * .65, .99, .1], i % 2 ? '#6e4a30' : '#7a5236');
  // espresso machine, grinder, cups, register
  box('espresso_body', 'metal', .7, .45, .45, [0.9, 1.5, 1.06], '#c9cdd6', { metal: 'steel' }); box('espresso_top', 'metal', .7, .45, .06, [0.9, 1.5, 1.51], '#a8adb6', { metal: 'steel' });
  for (const x of [.7, 1.1]) cyl('espresso_group', 'metal', .05, .12, [x, 1.3, 1.25], '#30333a', { metal: 'steel' });
  cyl('grinder', 'metal', .12, .45, [1.45, 1.55, 1.06], '#30333a'); sph('grinder_beans', 'glass', .13, [1.45, 1.55, 1.6], '#5a3420');
  for (let i = 0; i < 5; i++) cyl('cup', 'ceramic', .045, .09, [-1.6 + i * .12, 1.55, 1.06], ['#fff', '#e8c25a', '#fff', '#7fb8d8', '#fff'][i]);
  box('register', 'plastic', .4, .3, .22, [-0.9, 1.3, 1.06], '#30333a'); panel('register_screen', 'lamp', .3, .14, [-0.9, 1.14, 1.22], new THREE.MeshBasicMaterial({ color: '#7cffb2', toneMapped: false }));
  // the hero cup Brad's ordering
  cyl('coffee_cup', 'ceramic', .055, .13, [-0.25, 1.15, 1.06], '#ffffff'); cyl('coffee_lid', 'plastic', .058, .02, [-0.25, 1.15, 1.19], '#3a2a20'); cyl('coffee_sleeve', 'paper', .057, .05, [-0.25, 1.15, 1.1], '#b07a46');
  // pastry case
  box('pastry_case', 'glass', 1.0, .5, .5, [-1.55, 1.3, 1.06], '#dff4ff', { basic: true, opacity: .25 });
  for (let i = 0; i < 6; i++) sph('pastry', 'food', .07, [-1.9 + (i % 3) * .3, 1.25 + Math.floor(i / 3) * .15, 1.15], ['#d9a05a', '#7a3a2a', '#e8c88a'][i % 3], { s: [1.4, 1, .7] });
  // chalk menu board priced in Globos
  const menu = signTex(K, 768, 512, '#22302a', [['MENU', 84, '#fff6d8', 70], ['COFFEE ........ 3 G', 54, '#ffffff', 190], ['LATTE ........... 5 G', 54, '#ffffff', 270], ['MUFFIN ......... 2 G', 54, '#ffffff', 350], ['TODAY: WE TAKE GLOBOS!', 40, '#ffd23f', 450]], { border: '#8a6a40', bw: 18 });
  panel('menu_board', 'wood', 2.4, 1.6, [0.2, 3.12, 2.45], texMat(menu));
  const sign = signTex(K, 1024, 256, '#3a2418', [['☕ BEAN THERE', 120, '#ffd9a0', 128]], {});
  panel('cafe_sign', 'wood', 2.6, .65, [-2.6, 3.12, 2.75], texMat(sign));
  // shelves of bags + jars on the back wall
  for (const z of [1.5, 2.0]) { box('shelf', 'wood', 1.6, .25, .05, [-2.7, 3.05, z], '#6e4a30'); for (let i = 0; i < 5; i++) box('coffee_bag', 'paper', .2, .12, .3, [-3.3 + i * .3, 3.0, z + .05], ['#c0392b', '#2e7d5b', '#e8c25a', '#3a3a46', '#b07a46'][i]); }
  // pendant lamps
  for (const x of [-1.6, -0.2, 1.2]) { cyl('lamp_cord', 'metal', .01, .9, [x, 1.4, 2.5], '#222'); cyl('lamp_shade', 'metal', .22, .22, [x, 1.4, 2.28], '#2c2c2c', { r2: .05 }); sph('lamp_globe', 'lamp', .08, [x, 1.4, 2.27], '#ffe6a8', { basic: true }); light('#ffd59a', 3, 5, [x, 1.4, 2.2]); }
  // window wall on the right with a sunny street
  const street = canvasTex(512, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#8fd0ff'); gr.addColorStop(1, '#dff3ff'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 6; i++) { g.fillStyle = ['#e8a87c', '#c38d9e', '#85cdca', '#e27d60', '#f4d35e', '#9fb0c8'][i]; g.fillRect(i * 90 - 10, 180 + rnd(i) * 80, 86, 400); g.fillStyle = 'rgba(255,255,255,.7)'; for (let k = 0; k < 4; k++) g.fillRect(i * 90 + 8, 220 + rnd(i) * 80 + k * 50, 22, 26); }
    g.fillStyle = '#5a6068'; g.fillRect(0, 440, w, 72); g.fillStyle = '#4caf50'; g.beginPath(); g.arc(420, 300, 60, 0, 7); g.fill(); });
  panel('window_view', 'glass', 6, 2.6, [4.42, 1.5, 1.5], texMat(street), { ry: -Math.PI / 2 });
  for (const y of [0, 1.5, 3]) box('window_mullion', 'wood', .08, .08, 2.8, [4.4, y - .75, .2], '#3a2418');
  // tables and plants
  for (const [x, y] of [[-3.3, -0.6], [2.8, -0.3]]) { cyl('table_top', 'wood', .45, .04, [x, y, .74], '#7a5236'); cyl('table_leg', 'metal', .04, .74, [x, y, 0], '#222'); for (const s of [-1, 1]) box('chair', 'wood', .4, .4, .45, [x + s * .7, y, 0], '#5a3a26'); }
  for (const [x, y] of [[-4.1, 2.8], [4.0, 2.7]]) { cyl('pot', 'ceramic', .22, .4, [x, y, 0], '#e8e2d6'); sph('plant', 'leaf', .38, [x, y, .75], '#3d8b4a', { s: [1, 1, 1.3] }); }
  light('#fff2d8', 4, 12, [0, -2, 2.8]);
  return { anchors: { counter: [-0.2, 1.2, 1.1], menu: [0.2, 3.1, 2.4], cup: [-0.25, 1.15, 1.15], bar: [BAR[0], BAR[1], 1.5], brad: [BRAD[0], BRAD[1], 1.6] }, update: () => {} };
}
