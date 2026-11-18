// usage: node kit/geo/geo.mjs 0.06 episodes/<name>/sets/world_data.js
// world countries -> plan metres (NaturalEarth1, x east, y north), simplified, as sets/world_data.js
import fs from 'fs'; import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const topo = require('topojson-client'), d3 = require('d3-geo');
const W = JSON.parse(fs.readFileSync(new URL('./node_modules/world-atlas/countries-50m.json', import.meta.url)));
const fc = topo.feature(W, W.objects.countries);
const S = 200 / (2 * Math.PI * 0.8707);            // natural earth: x range ~ +-0.8707*pi -> map 200 m wide
const proj = d3.geoNaturalEarth1().scale(S).translate([0, 0]).rotate([-10, 0]);
const tol = +process.argv[2] || 0.05;
function simp(r) { const o = [r[0]]; for (const p of r) { const q = o[o.length - 1]; if (Math.hypot(p[0] - q[0], p[1] - q[1]) > tol) o.push(p); } return o; }
const area = r => { let a = 0; for (let i = 0; i < r.length; i++) { const [x0, y0] = r[i], [x1, y1] = r[(i + 1) % r.length]; a += x0 * y1 - x1 * y0; } return a / 2; };
const out = [];
for (const f of fc.features) {
  // project through geoPath so the antimeridian is clipped (no slivers across the map)
  const rings = []; let cur = null;
  const ctxp = { moveTo(x, y) { cur = [[x, -y]]; rings.push(cur); }, lineTo(x, y) { cur.push([x, -y]); }, closePath() {}, arc() {}, rect() {} };
  d3.geoPath(proj, ctxp)(f);
  const R = rings.map(r => simp(r.map(([x, y]) => [+x.toFixed(3), +y.toFixed(3)]))).filter(r => r.length >= 4);
  // group: outer rings (ccw/positive area after y flip? use sign of the biggest ring) with holes = rings inside them
  const outers = [], holes = []; const big = R.reduce((m, r) => Math.max(m, Math.abs(area(r))), 0); const sg = Math.sign(area(R.find(r => Math.abs(area(r)) === big) || [[0,0],[1,0],[0,1]]));
  for (const r of R) (Math.sign(area(r)) === sg ? outers : holes).push(r);
  const inside = (pt, r) => { let c = false; for (let i = 0, j = r.length - 1; i < r.length; j = i++) { const [xi, yi] = r[i], [xj, yj] = r[j]; if ((yi > pt[1]) !== (yj > pt[1]) && pt[0] < (xj - xi) * (pt[1] - yi) / (yj - yi) + xi) c = !c; } return c; };
  const P = outers.filter(o => Math.abs(area(o)) >= 0.004).map(o => [o, ...holes.filter(h => inside(h[0], o))]);
  if (P.length && f.properties.name !== 'Antarctica') out.push({ id: f.id, n: f.properties.name, p: P });
}
const c = (name) => { const f = out.find(o => o.n === name); return f; };
fs.writeFileSync(process.argv[3], 'export const WORLD = ' + JSON.stringify(out) + ';\n');
// a few centroids for labels
const want = ['United States of America', 'France', 'Canada', 'Australia', 'Greece', 'Germany', 'Norway', 'India', 'Brazil', 'China', 'Russia', 'Italy', 'Spain', 'United Kingdom', 'Egypt', 'Japan', 'Mexico', 'Nigeria'];
const cen = {}; for (const f of fc.features) if (want.includes(f.properties.name)) { const p = proj(d3.geoCentroid(f)); cen[f.properties.name] = [+p[0].toFixed(2), +(-p[1]).toFixed(2)]; }
console.log(out.length, 'countries', (fs.statSync(process.argv[3]).size / 1e6).toFixed(2), 'MB'); console.log(JSON.stringify(cen));
