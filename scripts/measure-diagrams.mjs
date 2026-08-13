// Measure every diagram in a real browser with the site's real fonts. The eye has
// been wrong on this project's artifacts in both directions, so this reads geometry.
//
// Three classes, because each of the later ones is invisible to the one before it:
//   1. TEXT vs ITS BOX — glyph extents against the rect the text sits in.
//   2. A CONNECTOR THAT ENDS IN MID-AIR — a stroked path whose endpoint touches no
//      box, no circle, no arrowhead, no label and no other connector. That is how
//      the passphrase branch came to stop short of the wallet it was pointing at,
//      with a second, disconnected arrow starting further along the same line. The
//      overflowing label was the half a reader reported; this was the half that
//      made the drawing say something untrue.
//   3. A LABEL THAT HAS LEFT ITS BOX — an AUTHORED pairing, read from `data-in` /
//      `data-near` against `data-box` in Diagram.astro. Rules 1 and 2 both start
//      from what the drawing happens to look like, so both were blind in the same
//      direction: a label was only ever compared to the boxes it OVERLAPPED, and a
//      caption that had drifted clean off its box overlapped nothing, was measured
//      against nothing but the viewBox, and passed. The worse the drift, the
//      likelier it went unreported. Geometry cannot close that — the SVG never says
//      which rect a <text> is *supposed* to belong to, so no smarter guess would
//      have done; the pairing had to be written down. It is now, and a label whose
//      box is named must sit in it (`data-in`) or beside it (`data-near`).
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
//
// ⚠️ WHERE A CLEAN RUN STOPS LOOKING — read this before trusting one.
//   · AN UNAUTHORED LABEL IS STILL CHECKED ONLY AGAINST WHAT IT OVERLAPS. Rule 3
//     covers the labels a human paired to a box; every other label — titles,
//     summary lines, the captions belonging to a circle or a control glyph — keeps
//     the old treatment, because it has no box to have left. That is a real limit
//     and it is now a REVIEWABLE one rather than a structural one: the run prints
//     how many labels each diagram authored out of how many it has, so a drawing
//     whose labels are all unpaired is visible instead of merely quiet.
//   · A `data-near` GAP IS A DISTANCE, AND DISTANCES ARE TUNED. NEAR is set from
//     the widest gap the shipped artwork actually uses, plus headroom; the run
//     prints the widest measured gap so the margin can be read rather than assumed.
//     A caption that drifts by less than the headroom still passes.
//   · IT MEASURES GEOMETRY, NEVER MEANING. The passphrase diagram's real fault was
//     that it drew something untrue; what this caught was a line ending in mid-air.
//     A perfectly-joined diagram can still teach the wrong thing.
//   · IT ONLY SEES THE PAGES IN `PAGES`, which is hand-kept — see the note there.
//
// *(Two holes this header used to declare are CLOSED. The centre-containment one —
// a label whose middle cleared its box being compared against no box at all — on
// 2026-08-05, by the overlap rule below. The orphan-label one — a caption that had
// drifted clear of every rect being compared against nothing — on 2026-08-12, by
// the authored pairing above.)*
import { chromium } from 'playwright';

// EVERY PAGE THAT RENDERS A DIAGRAM MUST BE LISTED HERE. This is a hand-kept list
// against a component used across the site, which is the exact shape of a check
// that goes quietly blind: a diagram added to an unlisted page is never measured,
// and the run stays green while covering less than it did. Adding a page here is
// part of adding a diagram — see the privacy-tools entries, added with the three
// drawings that shipped on 2026-08-05.
const PAGES = [
  '/learn/bitcoin-keys/',
  '/learn/ladder/',
  '/learn/beyond-the-ladder/',
  '/learn/hot-and-cold/',
  '/privacy-tools/payjoin/',
  '/privacy-tools/silent-payments/',
  '/privacy-tools/coinjoin/',
  // The setup walkthroughs. NINE device pages carry SEVEN distinct storyboards —
  // two pairs share an interface class and the dedup below measures each drawing
  // once — but every page is listed anyway, because the thing this list protects
  // against is a page whose diagram nobody is looking at, and "it renders the same
  // one as its sibling" is a fact about today's data rather than about the list.
  '/setup-walkthrough/',
  '/setup-walkthrough/coldcard-q/',
  '/setup-walkthrough/coldcard-mk5/',
  '/setup-walkthrough/trezor-safe-3/',
  '/setup-walkthrough/trezor-safe-5/',
  '/setup-walkthrough/trezor-safe-7/',
  '/setup-walkthrough/bitbox02/',
  '/setup-walkthrough/jade-core/',
  '/setup-walkthrough/jade-core-2026/',
  '/setup-walkthrough/jade-plus/',
];
const BASE = process.argv[2] || 'http://localhost:4399';
const PAD = 3;    // a glyph this close to a stroke reads as touching it
const TOL = 12;   // how near an endpoint must be to something to count as joined
// How far a `data-near` caption may sit from the edge of the box it names. Set from
// the shipped artwork rather than chosen: the widest real gap is printed at the end
// of every run, and this is that figure with room for an ordinary nudge. Raising it
// to quiet a red run is how this check would stop meaning anything.
const NEAR = 26;

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
        key: r.getAttribute('data-box') || null,
      }));
      const circles = [...svg.querySelectorAll('circle')].map(c => ({
        cx: c.cx.baseVal.value, cy: c.cy.baseVal.value, r: c.r.baseVal.value,
      }));
      const texts = [...svg.querySelectorAll('text')].map(t => {
        const b = t.getBBox();
        // Either attribute may sit on a <g> and cover every label beneath it — nine
        // seed words in one group is one pairing, not nine. Nearest wins, so a text
        // can still name its own box inside a group that names another.
        const owner = t.closest('[data-in],[data-near]');
        return {
          s: t.textContent.trim(), x: b.x, y: b.y, w: b.width, h: b.height,
          in: owner?.getAttribute('data-in') ?? null,
          near: owner?.getAttribute('data-near') ?? null,
          both: !!(t.getAttribute('data-in') && t.getAttribute('data-near')),
        };
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

// How far a point sits outside a rect — 0 when it is inside or touching.
const gapToRect = (b, r) => {
  const dx = Math.max(r.x - (b.x + b.w), b.x - (r.x + r.w), 0);
  const dy = Math.max(r.y - (b.y + b.h), b.y - (r.y + r.h), 0);
  return Math.hypot(dx, dy);
};
const overflows = (t, r) => {
  const tl = t.x, tr = t.x + t.w, tt = t.y, tb = t.y + t.h;
  const over = [];
  if (tl < r.x + PAD) over.push(`left by ${(r.x - tl).toFixed(1)}`);
  if (tr > r.x + r.w - PAD) over.push(`right by ${(tr - (r.x + r.w)).toFixed(1)}`);
  if (tt < r.y + PAD) over.push(`top by ${(r.y - tt).toFixed(1)}`);
  if (tb > r.y + r.h - PAD) over.push(`bottom by ${(tb - (r.y + r.h)).toFixed(1)}`);
  return over;
};

let bad = 0;
let widestNear = { gap: -1, s: '', name: '' };
let totalAuthored = 0;
const seen = new Set();
for (const d of report) {
  if (seen.has(d.name)) continue;     // multisig renders on two pages, same markup
  seen.add(d.name);
  const problems = [];

  // The authored pairings, checked BEFORE any geometry is trusted. A key that names
  // no box is the failure this whole class exists to prevent, one level up: a
  // mistyped pairing would otherwise check nothing at all and look identical to a
  // label that has no box, which is precisely the silence being closed here.
  const boxes = new Map();
  for (const r of d.rects) {
    if (!r.key) continue;
    if (boxes.has(r.key)) problems.push(`DUPLICATE data-box KEY  "${r.key}"  — a label naming it cannot say which`);
    else boxes.set(r.key, r);
  }
  const authored = d.texts.filter(t => t.in || t.near);
  totalAuthored += authored.length;
  for (const t of authored) {
    if (t.both) problems.push(`LABEL NAMES A BOX TWICE  "${t.s}"  — data-in and data-near on one element`);
    const key = t.in ?? t.near;
    if (!boxes.has(key))
      problems.push(`PAIRED TO A BOX THAT ISN'T THERE  "${t.s}"  ${t.in ? 'data-in' : 'data-near'}="${key}"  — no rect carries data-box="${key}"`);
  }

  for (const t of d.texts) {
    const tl = t.x, tr = t.x + t.w, tt = t.y, tb = t.y + t.h;
    if (tl < d.vb.x || tr > d.vb.x + d.vb.w || tt < d.vb.y || tb > d.vb.y + d.vb.h)
      problems.push(`OUT OF VIEWBOX  "${t.s}"  x ${tl.toFixed(1)}–${tr.toFixed(1)} (vb 0–${d.vb.w})`);

    // AUTHORED: measured against the ONE box its author named, and against no
    // other. A rect it happens to overlap on the way past is not its box.
    const namedKey = t.in ?? t.near;
    if (namedKey) {
      const r = boxes.get(namedKey);
      if (!r) continue;               // already reported above
      const gap = gapToRect(t, r);
      if (t.in) {
        if (gap > 0)
          problems.push(`LABEL HAS LEFT ITS BOX  "${t.s}"  data-in="${namedKey}"  text ${tl.toFixed(1)},${tt.toFixed(1)}–${tr.toFixed(1)},${tb.toFixed(1)} vs box ${r.x},${r.y}–${r.x + r.w},${r.y + r.h}  [clear of it by ${gap.toFixed(1)}]`);
        else {
          const over = overflows(t, r);
          if (over.length)
            problems.push(`OVERFLOWS ITS BOX  "${t.s}"  text ${tl.toFixed(1)}–${tr.toFixed(1)} vs box ${r.x}–${r.x + r.w}  [${over.join(', ')}]`);
        }
      } else {
        if (gap > widestNear.gap) widestNear = { gap, s: t.s, name: d.name };
        if (gap > NEAR)
          problems.push(`CAPTION HAS DRIFTED OFF ITS BOX  "${t.s}"  data-near="${namedKey}"  ${gap.toFixed(1)} from the box edge (limit ${NEAR})`);
      }
      continue;
    }

    for (const r of d.rects) {
      // A rect shorter than the glyphs was never a container — the hot/cold gradient
      // bar has emoji sitting ON it inside their own circles, and reading that as an
      // overflow is the checker being wrong, not the diagram.
      if (r.h < t.h) continue;
      // OVERLAP, NOT CONTAINMENT — and the difference is the whole point of the rule.
      // This asked whether the text's CENTRE fell inside the rect, which meant a
      // label pushed far enough out that its middle cleared the box was compared
      // against no box at all and passed: the worse the overflow, the likelier it
      // went unreported. Found by negative-controlling this script on new artwork,
      // recorded as a known hole, then closed 2026-08-05 — proven by shifting
      // keys-mailbox's "↑ your public address" from x=215 to x=300, which the old
      // rule called clean and this one reports as overflowing right by 73.1.
      // Overlap costs nothing here: all 10 shipped diagrams stay clean under it.
      if (!(tr > r.x && tl < r.x + r.w && tb > r.y && tt < r.y + r.h)) continue;
      const over = overflows(t, r);
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

  console.log(`\n── ${d.name}  (${d.path})  ${d.texts.length} text (${authored.length} paired to a box) · ${d.rects.length} rect (${boxes.size} keyed) · ${connectors.length} connector · ${markers.length} marker`);
  if (!problems.length) console.log('   clean');
  else { bad += problems.length; problems.forEach(p => console.log('   !! ' + p)); }
}

// Printed on every run, clean or not: the headroom NEAR is carrying. A caption
// creeping toward the limit is readable here a run before it becomes a failure.
if (widestNear.gap >= 0)
  console.log(`\nwidest data-near gap: ${widestNear.gap.toFixed(1)} of ${NEAR}  ("${widestNear.s}" in ${widestNear.name})`);

// THE RUN THAT CHECKS NOTHING AND SAYS SO. `data-box` and `data-in` ship in the
// same markup, so a build made before this check existed carries neither — and the
// authored rule then has nothing to measure and reports nothing, which is
// indistinguishable from artwork that is fine. That is the exact shape of every
// blind check this project has paid for, and the live site is where it would
// happen: point this at bitcoinkeys.guide before the deploy lands and every
// pairing is simply absent. It is a fact the run can know about itself, so it does.
if (bad === 0 && totalAuthored === 0) {
  console.log(`\n!! NOT MEASURING WHAT IT THINKS IT IS — ${seen.size} diagrams and not one authored pairing.\n` +
              `   This markup predates the data-box/data-in pairing, so the authored rule checked nothing.\n` +
              `   Against a URL, that means the deploy is older than the check.`);
  bad = 1;
}
console.log(`${bad === 0 ? 'ALL DIAGRAMS CLEAN' : bad + ' PROBLEM(S)'} — ${seen.size} diagrams measured, ${totalAuthored} labels paired to a box`);
await browser.close();
process.exit(bad ? 1 : 0);
