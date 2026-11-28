// Visual + functional smoke test. Usage: npm run build && node scripts/visual-test.mjs [baseUrl]
// Serves ./out if no baseUrl is given. Saves screenshots to screenshots/.
import { createRequire } from 'node:module';
const { chromium, devices } = createRequire(import.meta.url)('playwright'); // npm i -D playwright (or global + NODE_PATH)
import { createServer } from 'node:http';
import { readFile, mkdir, stat } from 'node:fs/promises';
import { extname, join } from 'node:path';

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.mp4': 'video/mp4',
  '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.json': 'application/json', '.txt': 'text/plain', '.ico': 'image/x-icon' };
let base = process.argv[2];
let server;
if (!base) {
  server = createServer(async (req, res) => {
    let p = join('out', decodeURIComponent(req.url.split('?')[0]));
    try { if ((await stat(p)).isDirectory()) p = join(p, 'index.html'); } catch { res.writeHead(404); return res.end(); }
    try {
      const buf = await readFile(p);
      const range = req.headers.range;
      if (range && extname(p) === '.mp4') {
        const [s, e] = range.replace('bytes=', '').split('-').map(Number);
        const end = e || buf.length - 1;
        res.writeHead(206, { 'Content-Type': 'video/mp4', 'Content-Range': `bytes ${s}-${end}/${buf.length}`, 'Accept-Ranges': 'bytes', 'Content-Length': end - s + 1 });
        return res.end(buf.subarray(s, end + 1));
      }
      res.writeHead(200, { 'Content-Type': TYPES[extname(p)] || 'application/octet-stream' });
      res.end(buf);
    } catch { res.writeHead(404); res.end(); }
  }).listen(4173);
  base = 'http://localhost:4173';
}
await mkdir('screenshots', { recursive: true });
const browser = await chromium.launch();
const problems = [];

async function run(name, ctxOpts, shots) {
  const ctx = await browser.newContext(ctxOpts);
  const page = await ctx.newPage();
  page.on('console', (m) => m.type() === 'error' && problems.push(`[${name}] console: ${m.text()}`));
  page.on('pageerror', (e) => problems.push(`[${name}] pageerror: ${e.message}`));
  page.on('response', (r) => r.status() >= 400 && problems.push(`[${name}] ${r.status()} ${r.url()}`));
  await page.goto(base + '/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1800);
  const vh = ctxOpts.viewport.height;
  for (const [label, y] of shots) {
    const target = y === 'SHOWCASE+1.6'
      ? await page.evaluate(() => document.querySelector('#showcase').getBoundingClientRect().top + scrollY + innerHeight * 1.6)
      : typeof y === 'string' ? await page.evaluate((s) => document.querySelector(s).getBoundingClientRect().top + scrollY, y) : y * vh;
    await page.evaluate((t) => window.scrollTo(0, t), target);
    await page.waitForTimeout(1400);
    await page.screenshot({ path: `screenshots/${name}-${label}.png` });
  }
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  if (overflow > 0) problems.push(`[${name}] horizontal overflow ${overflow}px`);
  // form: invalid then valid submit
  await page.evaluate(() => document.querySelector('#prebook').scrollIntoView());
  await page.waitForTimeout(600);
  await page.click('#prebook button[type=submit]');
  const errs = await page.locator('#prebook [role=alert]').count();
  if (errs !== 4) problems.push(`[${name}] expected 4 validation errors, got ${errs}`);
  await page.fill('#prebook input[name=name]', 'Aarav Test');
  await page.fill('#prebook input[name=phone]', '98765 43210');
  await page.selectOption('#prebook select[name=goal]', { index: 1 });
  await page.click('#prebook label:has(input[value=whatsapp])');
  await page.click('#prebook button[type=submit]');
  await page.waitForSelector('#prebook [role=status]', { timeout: 4000 }).catch(() => problems.push(`[${name}] no confirmation`));
  await page.waitForTimeout(900);
  await page.locator('#prebook').screenshot({ path: `screenshots/${name}-form-done.png` });
  await ctx.close();
}

await run('desktop', { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 }, [
  ['01-hero', 0], ['02-seq-a', 1.6], ['03-seq-b', 2.9], ['04-seq-c', 4.0], ['05-brand', '#vision'], ['06-brand-tiles', 6.6],
  ['07-showcase', '#showcase'], ['08-showcase-mid', 'SHOWCASE+1.6'], ['09-prebook', '#prebook'], ['10-location', '#location'], ['11-footer', 99],
]);
await run('mobile', { ...devices['iPhone 13'] }, [
  ['01-hero', 0], ['02-seq-a', 1.6], ['03-seq-c', 4.0], ['04-brand', '#vision'], ['05-showcase', '#showcase'], ['06-prebook', '#prebook'], ['07-location', '#location'], ['08-footer', 99],
]);
await browser.close();
server?.close();
console.log(problems.length ? problems.join('\n') : 'No problems found.');
