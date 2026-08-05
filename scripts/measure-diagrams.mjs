// Measure every diagram in a real browser with the site's real fonts. The eye has
// been wrong on this project's artifacts in both directions, so this reads geometry.
//
// Two classes, because the second is the one that shipped and text-fitting alone
// would never have found it:
//   1. TEXT vs ITS BOX — glyph extents against the rect the text sits in.
//   2. A CONNECTOR THAT ENDS IN MID-AIR — a stroked path whose endpoint touches no
//      box, no circle, no arrowhead, no label and no other connector. That is how
//      the passphrase branch came to stop short of the wallet it was pointing at,
//      with a second, disconnected arrow starting further along the same line. The
//      overflowing label was the half a reader reported; this was the half that
//      made the drawing say something untrue.
//
// NOT part of the pre-push gate, and deliberately not a check-*.py: it needs a
// browser and a SERVED build, neither of which belongs in a push hook. It is also
// not runnable from a bare clone — playwright is not a dependency of this repo,
// because pulling a browser into every install to check seven drawings is a worse
// trade than running this by hand when the drawings change. It lives here anyway,
// rather than in a scratch directory, for the reason the pre-push hook is tracked:
// a check that exists only on the box that wrote it is a check that quietly stops
// existing.
//
// Usage:  npm run build && npx serve -l 4399 dist
//         node scripts/measure-diagrams.mjs                     # the local build
//         node scripts/measure-diagrams.mjs https://bitcoinkeys.guide   # live
//
// ⚠️ NEGATIVE-CONTROL IT AGAINST A BUILD THAT STILL HAS THE FAULT before trusting
// a clean run. Its first version reported three problems that were the CHECKER
// being wrong — multisig's connectors leave from under their "Key 1/2/3" captions,
// and hot-and-cold's emoji sit on a 10px gradient bar that was never a container.
// Both rules below carry that history; a green run means nothing until it has been
// shown to go red.
import { chromium } from 'playwright';

const PAGES = [
  '/learn/bitcoin-keys/',
  '/learn/ladder/',
  '/learn/beyond-the-ladder/',
  '/learn/hot-and-cold/',
];
const BASE = process.argv[2] || 'http://localhost:4399';
const PAD = 3;    // a glyph this close to a stroke reads as touching it
const TOL = 12;   // how near an endpoint must be to something to count as joined

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
const report = [];

for (const path of PAGES) {
  await page.goto(BASE + path, { waitUntil: 'networkidle' });
  const found = await page.evaluate(() => {
    const out = [];
    for (const fig of document.querySelectorAll('figure.diagram')) {
      const svg = fig.querySelector('svg');
      if (!svg) continue;
      const vb = svg.viewBox.baseVal;
      const rects = [...svg.querySelectorAll('rect')].map(r => ({
        x: r.x.baseVal.value, y: r.y.baseVal.value,
        w: r.width.baseVal.value, h: r.height.baseVal.value,
      }));
      const circles = [...svg.querySelectorAll('circle')].map(c => ({
        cx: c.cx.baseVal.value, cy: c.cy.baseVal.value, r: c.r.baseVal.value,
      }));
      const texts = [...svg.querySelectorAll('text')].map(t => {
        const b = t.getBBox();
        return { s: t.textContent.trim(), x: b.x, y: b.y, w: b.width, h: b.height };
      });
      // A path with a fill and no stroke is a marker (an arrowhead); a path with a
      // stroke and no fill is a connector. That is the whole convention in this file.
      const paths = [...svg.querySelectorAll('path')].map(p => {
        const st = getComputedStyle(p);
        const len = p.getTotalLength();
        const a = p.getPointAtLength(0), z = p.getPointAtLength(len);
        const b = p.getBBox();
        return {
          d: p.getAttribute('d'),
          stroked: st.stroke !== 'none' && parseFloat(st.strokeWidth) > 0,
          filled: st.fill !== 'none',
          len, a: { x: a.x, y: a.y }, z: { x: z.x, y: z.y },
          bb: { x: b.x, y: b.y, w: b.width, h: b.height },
        };
      });
      out.push({ name: fig.dataset.diagram,
                 vb: { x: vb.x, y: vb.y, w: vb.width, h: vb.height },
                 rects, circles, texts, paths });
    }
    return out;
  });
  for (const d of found) report.push({ path, ...d });
}

const nearRect = (p, r) => {
  const dx = Math.max(r.x - p.x, 0, p.x - (r.x + r.w));
  const dy = Math.max(r.y - p.y, 0, p.y - (r.y + r.h));
  return Math.hypot(dx, dy) <= TOL;
};
const nearCircle = (p, c) =>
  Math.abs(Math.hypot(p.x - c.cx, p.y - c.cy) - c.r) <= TOL ||
  Math.hypot(p.x - c.cx, p.y - c.cy) < c.r;
const nearBox = (p, b) => {
  const dx = Math.max(b.x - p.x, 0, p.x - (b.x + b.w));
  const dy = Math.max(b.y - p.y, 0, p.y - (b.y + b.h));
  return Math.hypot(dx, dy) <= TOL;
};

let bad = 0;
const seen = new Set();
for (const d of report) {
  if (seen.has(d.name)) continue;     // multisig renders on two pages, same markup
  seen.add(d.name);
  const problems = [];

  for (const t of d.texts) {
    const tl = t.x, tr = t.x + t.w, tt = t.y, tb = t.y + t.h;
    if (tl < d.vb.x || tr > d.vb.x + d.vb.w || tt < d.vb.y || tb > d.vb.y + d.vb.h)
      problems.push(`OUT OF VIEWBOX  "${t.s}"  x ${tl.toFixed(1)}–${tr.toFixed(1)} (vb 0–${d.vb.w})`);
    const cx = (tl + tr) / 2, cy = (tt + tb) / 2;
    for (const r of d.rects) {
      // A rect shorter than the glyphs was never a container — the hot/cold gradient
      // bar has emoji sitting ON it inside their own circles, and reading that as an
      // overflow is the checker being wrong, not the diagram.
      if (r.h < t.h) continue;
      if (!(cx > r.x && cx < r.x + r.w && cy > r.y && cy < r.y + r.h)) continue;
      const over = [];
      if (tl < r.x + PAD) over.push(`left by ${(r.x - tl).toFixed(1)}`);
      if (tr > r.x + r.w - PAD) over.push(`right by ${(tr - (r.x + r.w)).toFixed(1)}`);
      if (tt < r.y + PAD) over.push(`top by ${(r.y - tt).toFixed(1)}`);
      if (tb > r.y + r.h - PAD) over.push(`bottom by ${(tb - (r.y + r.h)).toFixed(1)}`);
      if (over.length)
        problems.push(`OVERFLOWS ITS BOX  "${t.s}"  text ${tl.toFixed(1)}–${tr.toFixed(1)} vs box ${r.x}–${r.x + r.w}  [${over.join(', ')}]`);
    }
  }

  const connectors = d.paths.filter(p => p.stroked && !p.filled && p.len > 20);
  const markers = d.paths.filter(p => p.filled && !p.stroked);
  for (const c of connectors) {
    for (const [end, p] of [['start', c.a], ['end', c.z]]) {
      const joined =
        d.rects.some(r => nearRect(p, r)) ||
        d.circles.some(k => nearCircle(p, k)) ||
        markers.some(m => nearBox(p, m.bb)) ||
        // A label counts as a join: multisig's three lines leave from under their
        // "Key 1/2/3" captions rather than from the circle itself, which is the
        // layout working, not a break. This does not weaken the real case — the
        // passphrase branch died 23px clear of the nearest label.
        d.texts.some(t => nearBox(p, t)) ||
        connectors.some(o => o !== c &&
          (Math.hypot(p.x - o.a.x, p.y - o.a.y) <= TOL ||
           Math.hypot(p.x - o.z.x, p.y - o.z.y) <= TOL));
      if (!joined)
        problems.push(`CONNECTOR ${end.toUpperCase()} IN MID-AIR  at (${p.x.toFixed(0)},${p.y.toFixed(0)})  d="${c.d}"`);
    }
  }

  console.log(`\n── ${d.name}  (${d.path})  ${d.texts.length} text · ${d.rects.length} rect · ${connectors.length} connector · ${markers.length} marker`);
  if (!problems.length) console.log('   clean');
  else { bad += problems.length; problems.forEach(p => console.log('   !! ' + p)); }
}

console.log(`\n${bad === 0 ? 'ALL DIAGRAMS CLEAN' : bad + ' PROBLEM(S)'} — ${seen.size} diagrams measured`);
await browser.close();
process.exit(bad ? 1 : 0);
