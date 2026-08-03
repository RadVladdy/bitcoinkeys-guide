// Verification harness for the finder engine (Phase A of the risk-assessment
// redesign). Run: node scripts/verify-finder.mjs
//
// Three jobs:
//   A. LEGACY DIFF GRID — the 3,240-combo answer grid (5 current × 4 stakes ×
//      3 recovery × 3 tech × 3 sovereignty × 6 representative worry orders)
//      through quiz.js recommend() AND recommendV2(shimScores(...)); prints a
//      diff table of every combo where the primary or secondary changed,
//      grouped by pattern with counts and one example each. Informational —
//      every pattern is for human review, not an automatic failure.
//   B. SCORE GRID — each concern at {0, default, 80} plus both C2 high-pair
//      combos, crossed with stakes × tech × sovereignty, asserting the five
//      calibration constraints (C1–C5, documented in finder.js).
//   C. SHAPE + STRING CONTRACT — every recommendV2 output carries the exact
//      fields the current UI reads from recommend(), same-typed; and no output
//      string contains 'quiz', 'Tier ', or a holdings dollar-bracket.
//
// Exit code: nonzero on any constraint (B) or contract (C) failure.

import { recommend } from '../src/data/quiz.js';
import {
  recommendV2, shimScores, fitFor, defaultsFor, scoreWord, scoreFromPrompts,
  CONCERN_KEYS, SECTION_ORDER, SETUP_KEYS, PROTECTION, FAMILY, TIE_MARGIN, prompts,
  EXPECTED_RAW, WEIGHT_POINTS, LADDER_RANK, CAVEAT_TEXT,
} from '../src/data/finder.js';

let failures = 0;
const fail = (msg) => { failures++; console.error(`  FAIL  ${msg}`); };

// ── shared enumerations ─────────────────────────────────────────────────────
const CURRENT = ['pre', 'single-sig', 'passphrase', 'multisig', 'collaborative'];
const STAKES = ['learning', 'meaningful', 'serious', 'lifechanging'];
const RECOVERY = ['just-me', 'partner', 'heirs'];
const TECH = ['simple', 'careful', 'technical'];
const SOV = ['pure', 'lean-self', 'open-help'];
// Six representative worry orders — every worry appears as the top pick, plus
// theft/targeted adjacency and an unsure-first order (mirrors the audit grid).
const WORRY_ORDERS = [
  ['self-loss', 'theft', 'exchange', 'targeted', 'unsure'],
  ['theft', 'self-loss', 'exchange', 'targeted', 'unsure'],
  ['exchange', 'theft', 'self-loss', 'targeted', 'unsure'],
  ['targeted', 'theft', 'self-loss', 'exchange', 'unsure'],
  ['unsure', 'self-loss', 'theft', 'exchange', 'targeted'],
  ['theft', 'targeted', 'self-loss', 'exchange', 'unsure'],
];

const primaryId = (rec) => (rec.primary.fork ? `fork(${rec.primary.fork.lead})` : rec.primary.rungSlug);
const secondaryId = (rec) => `${rec.secondary.rungSlug}·${rec.secondary.rungLabel}`;

// ── C. shape + string contract ──────────────────────────────────────────────
const DOLLAR_BRACKET = /\$\s*\d+(?:\.\d+)?\s*[kKmM]\b|\$\s*\d{1,3}(?:,\d{3})+/;

// noDollar: the holdings-bracket ban applies to engine copy. Vendor rows are
// pass-through data from custodians.js (service fee tiers / insurance figures,
// the /collaborative page's source of truth) that today's engine emits
// identically — they are service facts, not the user's holdings.
function scanStrings(node, path, hits, noDollar = true) {
  if (typeof node === 'string') {
    if (/quiz/i.test(node)) hits.push(`'quiz' at ${path}`);
    if (node.includes('Tier ')) hits.push(`'Tier ' at ${path}`);
    if (noDollar && DOLLAR_BRACKET.test(node)) hits.push(`dollar-bracket at ${path}: "${node.match(DOLLAR_BRACKET)[0]}"`);
    return;
  }
  if (Array.isArray(node)) { node.forEach((v, i) => scanStrings(v, `${path}[${i}]`, hits, noDollar)); return; }
  if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) scanStrings(v, `${path}.${k}`, hits, noDollar && k !== 'vendors');
  }
}

function checkShape(res, label) {
  const bad = (m) => fail(`shape @ ${label}: ${m}`);
  const p = res.primary, s = res.secondary;
  if (!p || typeof p !== 'object') return bad('no primary');
  if (typeof p.rungSlug !== 'string') bad('primary.rungSlug not string');
  if (typeof p.rungLabel !== 'string') bad('primary.rungLabel not string');
  if (typeof p.headline !== 'string') bad('primary.headline not string');
  if (typeof p.why !== 'string') bad('primary.why not string');
  // THE FORK IS GONE (2026-08-01) and its absence is asserted, not assumed. A
  // combined card is what stopped the two multi-key rungs from placing 1st and
  // 2nd against each other, so a fork reappearing is a regression, not a shape
  // variant to tolerate.
  if (p.fork) bad('primary carries a fork — the card layer should emit one rung per card');
  // Every card offers something to act on: devices, or — on the collaborative
  // rung, where the service is chosen before the hardware — services. Never
  // neither, and never both, because the reader would not know which to pick first.
  const hasWallets = Array.isArray(p.wallets) && p.wallets.length > 0;
  const hasVendors = Array.isArray(p.vendors) && p.vendors.length > 0;
  if (!hasWallets && !hasVendors) bad('primary offers neither devices nor services');
  if (hasWallets && hasVendors) bad('primary offers both devices and services — which comes first?');
  if (hasWallets) for (const w of p.wallets) {
    if (typeof w.name !== 'string' || typeof w.why !== 'string') bad('primary wallet missing name/why');
  }
  if (p.rungSlug === 'collaborative' && !hasVendors) bad('collaborative primary carries no services');
  if (p.rungSlug !== 'collaborative' && !hasWallets) bad(`${p.rungSlug} primary carries no devices`);
  if (typeof p.tradeoff !== 'string' || !p.tradeoff) bad('primary.tradeoff missing — every card states its trade');
  if (p.holdback != null && typeof p.holdback !== 'string') bad('primary.holdback not string|null');
  if (!s || typeof s !== 'object') bad('no secondary');
  else for (const f of ['rungSlug', 'rungLabel', 'headline', 'when']) {
    if (typeof s[f] !== 'string') bad(`secondary.${f} not string`);
  }
  const j = res.journey;
  if (j != null) {
    for (const f of ['kind', 'curLabel', 'targetLabel', 'headline', 'message']) {
      if (typeof j[f] !== 'string') bad(`journey.${f} not string`);
    }
    for (const f of ['gap', 'curStep', 'targetStep']) {
      if (typeof j[f] !== 'number') bad(`journey.${f} not number`);
    }
  }
  // extensions
  if (!res.profile || typeof res.profile !== 'object') bad('missing profile');
  else for (const c of CONCERN_KEYS) {
    if (typeof res.profile.scores[c] !== 'number') bad(`profile.scores.${c} not number`);
    if (!['low', 'typical', 'elevated', 'high'].includes(res.profile.words[c])) bad(`profile.words.${c} invalid`);
    if (typeof res.profile.deltas[c] !== 'number') bad(`profile.deltas.${c} not number`);
  }
  if (!Array.isArray(res.reasons) || !res.reasons.length) bad('reasons empty');
  else for (const r of res.reasons) {
    if (typeof r.text !== 'string' || !('concern' in r) || typeof r.setup !== 'string') bad('reason shape');
  }
  if (!Array.isArray(res.holdbacks)) bad('holdbacks not array');
  else for (const hb of res.holdbacks) {
    if (typeof hb.text !== 'string' || typeof hb.concern !== 'string') bad('holdback shape');
  }
  if (!Array.isArray(res.fit) || res.fit.length !== SETUP_KEYS.length) bad('fit ranking wrong length');
  const hits = [];
  scanStrings(res, 'result', hits);
  for (const h of hits) bad(`banned string — ${h}`);
}

// ════ A · LEGACY DIFF GRID ══════════════════════════════════════════════════
console.log('A · Legacy diff grid — old recommend() vs recommendV2(shimScores())');
const patterns = new Map();
let combos = 0, changed = 0;
for (const current of CURRENT)
for (const stakes of STAKES)
for (const recovery of RECOVERY)
for (const tech of TECH)
for (const sovereignty of SOV)
for (const worry of WORRY_ORDERS) {
  combos++;
  const a = { current, stakes, recovery, tech, sovereignty, worry };
  const oldRes = recommend(a);
  const newRes = recommendV2({ ...a, scores: shimScores(a) });
  checkShape(newRes, JSON.stringify(a));
  const oP = primaryId(oldRes), nP = primaryId(newRes);
  const oS = secondaryId(oldRes), nS = secondaryId(newRes);
  if (oP !== nP || oS !== nS) {
    changed++;
    const key = `${oP} → ${nP}   |   2nd: ${oS} → ${nS}`;
    if (!patterns.has(key)) patterns.set(key, { count: 0, example: a });
    patterns.get(key).count++;
  }
}
console.log(`  ${combos} combos · ${combos - changed} identical · ${changed} changed, in ${patterns.size} patterns:\n`);
const sorted = [...patterns.entries()].sort((x, y) => y[1].count - x[1].count);
for (const [key, { count, example }] of sorted) {
  console.log(`  [${String(count).padStart(4)}×] ${key}`);
  console.log(`          e.g. ${example.stakes}/${example.recovery}/${example.tech}/${example.sovereignty} worry=[${example.worry.join(',')}] current=${example.current}`);
}

// ════ B · SCORE GRID — the five calibration constraints ═════════════════════
console.log('\nB · Score grid — calibration constraints');

const baseAnswers = { current: 'pre', recovery: 'just-me', worry: ['unsure'] };
// Rung 3 or 4, read from the rung itself now that there is no combined card.
const isFork = (res) => ['multisig', 'collaborative'].includes(res.primary.rungSlug);

// C1 — the DEFAULT-PROFILE REPORT. Rewritten 2026-08-01 with the gates.
//
// It used to REQUIRE single-sig as the primary for every untouched default at
// learning/meaningful/serious. That made it the last gate in the system: an
// outcome the engine had to produce regardless of what the scores said, which
// is precisely the thing that put fiction in the self-loss column (single-sig
// scored above multisig against lockout, because otherwise this failed).
//
// It is now a REPORT, not an assertion. It prints what the untouched defaults
// actually produce so a human can look at the distribution and decide whether
// the weights are right — which is the only honest way to tune a scored model.
// Ties are still reported for the same reason.
//
// If the default profile SHOULD always land on single-sig, that is a product
// decision and belongs in _Decisions with a reason — at which point it comes
// back here as a real assertion. Do not restore it by quietly reweighting.
let c1n = 0;
const c1counts = new Map(), c1ties = [];
for (const stakes of ['learning', 'meaningful', 'serious', 'lifechanging'])
for (const tech of TECH) for (const sovereignty of SOV) for (const recovery of RECOVERY) {
  c1n++;
  const res = recommendV2({ ...baseAnswers, stakes, tech, sovereignty, recovery, scores: defaultsFor(stakes, sovereignty) });
  const id = primaryId(res);
  const k = `${stakes} → ${id}`;
  c1counts.set(k, (c1counts.get(k) || 0) + 1);
  if (res.tie) c1ties.push(`${stakes}/${tech}/${sovereignty}`);
}
console.log(`  C1 default-profile REPORT — ${c1n} untouched-default combos (no longer asserted):`);
for (const [k, v] of [...c1counts].sort()) console.log(`       ${String(v).padStart(3)}x  ${k}`);
console.log(`       near-ties flagged at defaults: ${c1ties.length}`);

// C2 — motivating case: self-loss 80 + (remote 80 | physical 80) → fork
// primary (collaborative or multisig); passphrase never primary there.
// Asserted at meaningful/serious/lifechanging (learning: continuity wins —
// documented in finder.js).
let c2n = 0;
for (const pair of [{ remote: 80 }, { physical: 80 }])
for (const stakes of ['meaningful', 'serious', 'lifechanging'])
for (const tech of TECH) for (const sovereignty of SOV) {
  c2n++;
  const scores = { ...defaultsFor(stakes), 'self-loss': 80, ...pair };
  const res = recommendV2({ ...baseAnswers, stakes, tech, sovereignty, scores });
  const where = `C2 ${Object.keys(pair)[0]} ${stakes}/${tech}/${sovereignty}`;
  if (!isFork(res)) fail(`${where}: primary=${primaryId(res)} (want the fork family)`);
  if (res.primary.rungSlug === 'passphrase') fail(`${where}: passphrase primary`);
}
console.log(`  C2 motivating case — ${c2n} high-pair combos checked`);

// C3 — monotonicity: raising a concern never lowers the fit-rank of any setup
// holding the top protection weight for that concern (others at default).
let c3n = 0;
for (const concern of CONCERN_KEYS) {
  const maxW = Math.max(...SETUP_KEYS.map((s) => PROTECTION[s].weights[concern]));
  const strong = SETUP_KEYS.filter((s) => PROTECTION[s].weights[concern] === maxW);
  for (const stakes of STAKES) for (const tech of TECH) for (const sovereignty of SOV) {
    c3n++;
    // MUST pass sovereignty: exposure's default comes from that answer, so
    // without it d.exposure is undefined and the sweep's middle sample lands on
    // the sovereignty default (85 for 'pure') — ABOVE the high sample of 80.
    // The points were out of order and the engine was reported non-monotonic
    // for it.
    const d = defaultsFor(stakes, sovereignty);
    const rankPos = (score) => {
      const rows = fitFor({ ...d, [concern]: score }, { stakes, tech, sovereignty });
      return Object.fromEntries(rows.map((r, i) => [r.setup, i]));
    };
    // High sample is 100, not 80. The three points must be ORDERED for a
    // monotonicity test to mean anything, and `exposure`'s default is 85 for a
    // 'pure' answer — so the old 80 put the middle sample ABOVE the high one
    // and reported the engine non-monotonic for the test's own sampling.
    const lo = rankPos(0), mid = rankPos(d[concern]), hi = rankPos(100);
    for (const s of strong) {
      if (mid[s] > lo[s] || hi[s] > mid[s]) {
        fail(`C3 ${concern} ${stakes}/${tech}/${sovereignty}: ${s} rank ${lo[s]}→${mid[s]}→${hi[s]} as score rises`);
      }
    }
  }
}
console.log(`  C3 monotonicity — ${c3n} score-sweeps checked`);

// C4 — DISCLOSURE, not prohibition. Rewritten 2026-08-01 with the gates.
//
// It used to forbid the passphrase whenever locking yourself out was elevated.
// That was a gate wearing a constraint's clothes: it SUPPRESSED a contradictory
// outcome instead of explaining it, and it could not express "somewhat" — every
// one of these risks is a matter of degree.
//
// The rule now: the engine may recommend anything the scores favour, INCLUDING
// a setup that is weak on something the reader rates highly — but when it does,
// the result must carry a caveat naming that weakness in words. A recommendation
// is the best overall option, which is not the same as being good at
// everything, and the reader is owed the difference.
//
// Concretely: for every concern the reader rates elevated or high, if the
// recommended setup's weight is materially below the best available, a caveat
// for THAT concern must be present. And a concern may never appear as both a
// reason and a caveat in the same result.
let c4n = 0;
const CAVEAT_GAP = 1.2;
for (const selfScore of [52, 65, 80])
for (const stakes of STAKES) for (const tech of TECH) for (const sovereignty of SOV) {
  const word = scoreWord(selfScore, 'self-loss', stakes, sovereignty);
  if (word !== 'elevated' && word !== 'high') continue;
  c4n++;
  const scores = { ...defaultsFor(stakes, sovereignty), 'self-loss': selfScore };
  const res = recommendV2({ ...baseAnswers, stakes, tech, sovereignty, scores });
  const where = `C4 self=${selfScore} ${stakes}/${tech}/${sovereignty} (${word})`;
  // The primary's rung IS a setup key now, so this resolves directly. It used to
  // reach through a fork's lead path and fall back to res.fit[0] when the lookup
  // missed — and fit[0] is not necessarily the chosen setup once the near-tie
  // policy has promoted the runner-up, so a miss silently checked the wrong row.
  const chosen = res.fit.find((r) => r.setup === res.primary.rungSlug);
  if (!chosen) { fail(`C4: primary rung '${res.primary.rungSlug}' is not a scored setup`); continue; }
  const mine = PROTECTION[chosen.setup].weights['self-loss'];
  const best = Math.max(...SETUP_KEYS.map((k) => PROTECTION[k].weights['self-loss']));
  if (best - mine >= CAVEAT_GAP && !res.holdbacks.some((h) => h.concern === 'self-loss')) {
    fail(`${where}: recommends ${chosen.setup}, weak on self-loss, with NO caveat`);
  }
  const reasonConcerns = new Set((res.reasons || []).map((r) => r.concern));
  for (const h of res.holdbacks || []) {
    if (reasonConcerns.has(h.concern)) fail(`${where}: '${h.concern}' is both a reason and a caveat`);
  }
}
console.log(`  C4 disclosure — ${c4n} elevated/high self-loss combos checked (caveat required, nothing banned)`);

// C5 — near-ties: whenever the top two distinct eligible families sit within
// TIE_MARGIN, the result must carry the either/or flag naming both — and never
// carry it otherwise. Swept across a coarse score lattice.
let c5n = 0, c5ties = 0;
for (const v of [0, 40, 80]) for (const w of [0, 40, 80])
for (const stakes of STAKES) for (const tech of TECH) for (const sovereignty of SOV) {
  c5n++;
  const scores = { ...defaultsFor(stakes), 'self-loss': v, remote: w };
  const res = recommendV2({ ...baseAnswers, stakes, tech, sovereignty, scores });
  // Mirror the engine's primary gates (C4 + the learning continuity gate).
  // There are NO GATES left to mirror. Every setup is eligible; the scores
  // decide, and the learning-stakes preference for simplicity is expressed as a
  // negative LADDER_PULL weight instead of a bar. This filter used to encode a
  // gate that no longer exists, which made it report spurious ties at learning
  // stakes — the harness modelling an engine that had moved on.
  const eligible = res.fit.filter((r) => !r.gated);
  const top = eligible[0];
  const rival = eligible.find((r) => r.family !== top.family);
  const shouldTie = rival && top.fit - rival.fit < TIE_MARGIN;
  if (shouldTie && !res.tie) fail(`C5 ${stakes}/${tech}/${sovereignty} s=${v} r=${w}: margin ${(top.fit - rival.fit).toFixed(3)} unflagged`);
  if (!shouldTie && res.tie) fail(`C5 ${stakes}/${tech}/${sovereignty} s=${v} r=${w}: spurious tie flag`);
  if (res.tie) {
    c5ties++;
    if (!res.tie.a || !res.tie.b || typeof res.tie.note !== 'string') fail('C5: tie flag missing names/note');
  }
}
console.log(`  C5 near-ties — ${c5n} lattice points checked (${c5ties} genuine either/ors flagged)`);

// ── C6 · THE EXPECTED BUNDLE — the baseline means what it says ──────────────
// The scoring used to only ever ADD, so checking nothing scored the published
// default and the engine silently asserted that a typical holder carries zero
// risk factors. Three properties, asserted end-to-end through real prompt ids
// rather than by re-deriving the formula:
//
//   (a) a reader carrying the expected bundle scores the default EXACTLY
//   (b) a reader who walks a section and clears it scores strictly BELOW the
//       default — far enough below to read 'low', or they get no signal back
//   (c) cleared is NOT the same as skipped; before this they were identical,
//       and they are opposite statements from the reader
let c6n = 0;
for (const c of SECTION_ORDER) {
  const inSection = prompts.filter((p) => p.concern === c && !p.gatedBy);
  // Smallest subset of this section's own prompts summing to the expected
  // bundle. Reachability is a real constraint on EXPECTED_RAW, not a detail:
  // every WEIGHT_POINTS value is even, so an odd target has no subset and C6
  // would quietly degrade into checking the formula against itself.
  let bundle = null;
  const walk = (i, acc, ids) => {
    if (bundle) return;
    if (acc === EXPECTED_RAW[c]) { bundle = ids; return; }
    if (acc > EXPECTED_RAW[c] || i >= inSection.length) return;
    walk(i + 1, acc + WEIGHT_POINTS[inSection[i].weight], [...ids, inSection[i].id]);
    walk(i + 1, acc, ids);
  };
  walk(0, 0, []);
  if (!bundle) { fail(`C6 ${c}: EXPECTED_RAW ${EXPECTED_RAW[c]} is unreachable by any combination of prompts`); continue; }

  const d = defaultsFor('meaningful')[c];
  const atBundle = scoreFromPrompts(bundle, 'meaningful', [])[c];
  if (atBundle !== d) fail(`C6a ${c}: expected bundle scores ${atBundle}, default is ${d} — the baseline does not mean "typical"`);

  const cleared = scoreFromPrompts([], 'meaningful', [])[c];
  if (!(cleared < d)) fail(`C6b ${c}: cleared section scores ${cleared}, not below the default ${d}`);
  if (scoreWord(cleared, c, 'meaningful') !== 'low') fail(`C6b ${c}: cleared section reads '${scoreWord(cleared, c, 'meaningful')}', not 'low'`);

  const skipped = scoreFromPrompts([], 'meaningful', [c])[c];
  if (skipped === cleared) fail(`C6c ${c}: skipping and clearing both score ${skipped} — the engine cannot tell them apart`);
  if (skipped !== d) fail(`C6c ${c}: skipped section scores ${skipped}, should keep the standard estimate ${d}`);
  c6n += 1;
}
console.log(`  C6 expected bundle — ${c6n} concerns: bundle scores the default, cleared reads low, cleared ≠ skipped`);

// ── C7 · SIMPLEST, PLUS ONE — the house bias, made checkable ────────────────
// The site's rule is the simplest ADEQUATE rung. The house bias is one step
// past it: unknown risks exist, and a holder's stack is worth more in four
// years than it is today, so the recommendation leans to protection rather
// than to the bare minimum a reader's answers strictly justify.
//
// This property was true by ACCIDENT — it fell out of the stakes weights and
// was asserted nowhere, which is how this project has lost properties before
// (invariants #8, #9 and #10 all record one that was true by luck until a
// tuning pass quietly ended it). Asserted against the hardest case: a reader
// who CLEARED the entire assessment, whose answers justify the floor and
// nothing more.
//
// THE LEARNING EXEMPTION IS DELIBERATE. At learning stakes the +1 rung is a
// passphrase, and a silent lockout is the one failure a beginner is least
// equipped to survive — the guide says so on several pages. Adding protection
// that can permanently orphan the coins is not the same kind of "+1" as
// adding a second key, so the bias starts at meaningful.
const STAKES_LADDER = ['learning', 'meaningful', 'serious', 'lifechanging'];
let c7n = 0;
const c7min = {};
for (const stakes of STAKES_LADDER) {
  const cleared = scoreFromPrompts([], stakes, []);
  let lo = Infinity;
  // THE ANSWER VALUES MUST BE REAL ONES. This loop used to sweep tech over
  // ['none','some','very'] and sovereignty over ['pure','open-help','service'] —
  // and the engine accepts simple/careful/technical and pure/lean-self/open-help.
  // Every invalid value fell back to the same default, so 27 reported
  // combinations per stakes level were three distinct ones, and 'technical' —
  // the setting that most cheapens complexity and so most favours multisig —
  // was never exercised at all. C7 passed on an eighth of what it claimed.
  // (`recovery` is not read by fitFor and is dropped rather than faked.)
  for (const tech of TECH)
    for (const sovereignty of SOV)
      for (const recovery of RECOVERY) {
        const top = fitFor(cleared, { stakes, tech, sovereignty, recovery, current: 'some' })[0];
        const rank = LADDER_RANK[FAMILY[top.setup]];
        lo = Math.min(lo, rank);
        const where = `C7 ${stakes}/${tech}/${sovereignty}/${recovery} → ${top.setup} (rung ${rank})`;
        if (stakes === 'learning') {
          if (rank !== 1) fail(`${where}: learning stakes must stay on rung 1 — the +1 there is a passphrase, and a beginner is who a silent lockout ruins`);
        } else if (rank < 2) {
          fail(`${where}: a cleared reader with real money must land ABOVE the bare floor — the house bias is simplest PLUS ONE`);
        }
        c7n += 1;
      }
  c7min[stakes] = lo;
}
// Monotone in stakes: more at risk can never recommend a SIMPLER rung. Guards
// the "scaling with what's at stake" half of the bias, which the per-level
// checks above cannot see.
for (let i = 1; i < STAKES_LADDER.length; i += 1) {
  const [prev, cur] = [STAKES_LADDER[i - 1], STAKES_LADDER[i]];
  if (c7min[cur] < c7min[prev]) fail(`C7 monotonicity: ${cur} floors at rung ${c7min[cur]} but ${prev} floors at ${c7min[prev]} — more at risk recommended something simpler`);
}
console.log(`  C7 simplest-plus-one — ${c7n} cleared-reader combos; rung floor by stakes: ${STAKES_LADDER.map((s) => `${s}:${c7min[s]}`).join(' · ')}`);

// ── prompt-bank sanity: gating, cross-bucket, saturation below 100 ──────────
const allIds = prompts.map((p) => p.id);
const allChecked = scoreFromPrompts(allIds, 'meaningful', []);
// SECTION_ORDER, not CONCERN_KEYS: scoreFromPrompts derives only the four
// walked risks. The other two come from questions and this function has, and
// should have, nothing to say about them.
for (const c of SECTION_ORDER) {
  if (allChecked[c] >= 100) fail(`saturation: ${c} hits ${allChecked[c]} with everything checked (must stay <100)`);
  if (scoreWord(allChecked[c], c, 'meaningful') !== 'high') fail(`saturation: ${c} at ${allChecked[c]} with everything checked is not 'high'`);
}
// GATING. This used to assert that a gated-out prompt left the section at the
// DEFAULT — which stopped being the right expectation once clearing a section
// scores the floor instead. The property was never about the default: it is
// that a gated prompt contributes NOTHING until its gate is satisfied, and
// something once it is. Asserted both directions so it cannot pass by the
// prompt being inert.
const clearedAll = scoreFromPrompts([], 'meaningful', []);
const gatedAlone = scoreFromPrompts(['p-family'], 'meaningful', []);
if (gatedAlone.physical !== clearedAll.physical) fail('gating: p-family scored without any gate prompt checked');
const gateId = prompts.find((p) => p.id === 'p-family')?.gatedBy?.[0];
if (!gateId) fail('gating: p-family has no gatedBy — the gate test is checking nothing');
else {
  const gateOnly = scoreFromPrompts([gateId], 'meaningful', []).physical;
  const gatePlus = scoreFromPrompts([gateId, 'p-family'], 'meaningful', []).physical;
  if (!(gatePlus > gateOnly)) fail(`gating: p-family did not move physical once gated by ${gateId} (${gateOnly} → ${gatePlus})`);
}
const skipAll = scoreFromPrompts(allIds, 'meaningful', [...SECTION_ORDER]);
for (const c of SECTION_ORDER) {
  if (skipAll[c] !== defaultsFor('meaningful')[c]) fail(`skip: ${c} moved despite section skip`);
}
console.log(`  prompt bank — ${prompts.length} prompts (${CONCERN_KEYS.map((c) => `${c}:${prompts.filter((p) => p.concern === c).length}`).join(' · ')}); gating, skip and saturation checked`);

// ── C8 · THE REAL READER PATH — recommendV2 driven by PROMPTS ───────────────
// Every check above hands recommendV2 a ready-made `scores` object. The page
// does not: it derives scores from checked prompts, and `checkedPrompts` is a
// documented input of this function. Nothing had ever called it that way, and
// it was broken — scoreFromPrompts returns only the four WALKED risks, so
// `stakes` and `exposure` arrived undefined, every comparison in scoreWord came
// back false, and both rows reported 'high' for every reader with NaN deltas.
// A learning-stakes reader was told a great deal was riding on it.
//
// Swept over real prompt subsets, at every stakes × sovereignty, asserting the
// same shape contract the scores path gets — plus the specific property that
// broke: an untouched preference row must read 'typical', never 'high'.
let c8n = 0;
const PROMPT_SETS = [
  [],
  ['c-exchange'],
  ['s-never-restored', 's-memory-only'],
  ['p-posted', 'p-crypto-job', 'r-follow'],
  prompts.map((p) => p.id),
];
for (const set of PROMPT_SETS)
for (const stakes of STAKES) for (const sovereignty of SOV) for (const tech of TECH) {
  c8n++;
  const res = recommendV2({ ...baseAnswers, stakes, sovereignty, tech, checkedPrompts: set, skippedSections: [] });
  const where = `C8 prompts=${set.length} ${stakes}/${sovereignty}/${tech}`;
  checkShape(res, where);
  for (const c of ['stakes', 'exposure']) {
    if (typeof res.profile.scores[c] !== 'number') fail(`${where}: profile.scores.${c} is not a number — the preference rows fell through`);
    if (Number.isNaN(res.profile.deltas[c])) fail(`${where}: profile.deltas.${c} is NaN`);
  }
  // Neither preference row is touched by any prompt, so both must sit exactly on
  // the default their own ANSWER implies — and therefore read 'typical'.
  const d = defaultsFor(stakes, sovereignty);
  for (const c of ['stakes', 'exposure']) {
    if (res.profile.scores[c] !== d[c]) fail(`${where}: ${c} scored ${res.profile.scores[c]}, answer implies ${d[c]}`);
    if (res.profile.words[c] !== 'typical') fail(`${where}: untouched ${c} reads '${res.profile.words[c]}', not 'typical'`);
  }
}
console.log(`  C8 real reader path — ${c8n} prompt-driven combos through recommendV2`);

// ── C9 · CAVEAT COPY IS REACHABLE, AND EVERY REACHABLE CONCERN HAS COPY ──────
// Two CAVEAT_TEXT entries were dead: `custodial` (all four setups weigh it 3, so
// the gap can never reach the threshold) and the non-custodial `exposure`
// wording (only collaborative has a gap there, and it always takes the
// exposureCustodial key). Dead copy on a page that argues for a living reads as
// covered when nothing covers it — and the reverse, a reachable concern with no
// copy, silently drops a caveat the reader is owed. Asserted both directions.
{
  const GAP = 1.2;
  const reachable = new Set();
  for (const c of CONCERN_KEYS) {
    const best = Math.max(...SETUP_KEYS.map((k) => PROTECTION[k].weights[c]));
    for (const s of SETUP_KEYS) {
      if (best - PROTECTION[s].weights[c] < GAP) continue;
      reachable.add(c === 'exposure' && PROTECTION[s].weights.exposure < 0 ? 'exposureCustodial' : c);
    }
  }
  for (const k of reachable) {
    if (!CAVEAT_TEXT[k]) fail(`C9: '${k}' can fire but has no caveat text — the reader is owed a caveat that never renders`);
  }
  for (const k of Object.keys(CAVEAT_TEXT)) {
    if (!reachable.has(k)) fail(`C9: CAVEAT_TEXT['${k}'] is unreachable — no setup is far enough behind the best on it`);
  }
  console.log(`  C9 caveat reachability — ${reachable.size} reachable, ${Object.keys(CAVEAT_TEXT).length} written, no dead copy`);
}

// ── C10 · THE PASSPHRASE ALWAYS CARRIES ITS LOCKOUT WARNING ─────────────────
// The computed caveats only speak when a concern is rated elevated or high, so a
// passphrase recommended to a reader with LOW self-loss — the most common
// passphrase outcome the engine produces — shipped with no warning at all, while
// the legacy card it replaced carried one unconditionally. This is not a
// trade-off to weigh; it is a condition of the thing being recommended.
let c10n = 0;
for (const stakes of STAKES) for (const tech of TECH) for (const sovereignty of SOV)
for (const selfScore of [0, 20, 52, 80]) {
  const scores = { ...defaultsFor(stakes, sovereignty), 'self-loss': selfScore };
  const res = recommendV2({ ...baseAnswers, stakes, tech, sovereignty, scores });
  if (res.primary.rungSlug !== 'passphrase' || res.primary.fork) continue;
  c10n++;
  const where = `C10 passphrase self=${selfScore} ${stakes}/${tech}/${sovereignty}`;
  if (!res.holdbacks.some((h) => h.concern === 'self-loss')) {
    fail(`${where}: recommends a passphrase with NO lockout warning`);
  }
  if (!/passphrase/i.test(res.primary.holdback || '')) {
    fail(`${where}: the card's own holdback line does not mention the passphrase`);
  }
}
console.log(`  C10 passphrase warning — ${c10n} passphrase primaries, all carry the lockout warning`);

// ── C11 · NO SINGLE POINT OF FAILURE ABOVE LEARNING STAKES ───────────────────
// THE HOUSE STANCE, AND THE ONE THE SITE STATES ON ITS FRONT PAGE. One hardware
// wallet with no passphrase is a single point of failure: one seed, one maker,
// one firmware, and no second thing that has to also be true. For money whose
// loss would actually hurt, the recommendation must clear that — rung 2 or
// higher, every time.
//
// LEARNING STAKES ARE EXEMPT AND THAT IS THE POINT OF THE THRESHOLD. "Losing it
// wouldn't change my life" is not significant holdings, and rung 1 remains the
// hard floor there (principle 5). The stance is about consequence, never amount.
//
// WHY THIS IS ENUMERATED AND NOT SAMPLED. The whole answer space, not a spot
// check: this is a property of EVERY path, and the branch that broke it last
// time was one stakes level away from the one being edited. On the shipped
// engine this constraint fails 7,425 times — 1,305 of them at life-changing
// stakes — which is exactly why the front-page sentence and this engine have to
// ship together. A prose-only invariant is a hope; this file is where it becomes
// a fact.
//
// NEGATIVE CONTROL: drop the C7 rung floor and this fails loudly. Confirmed.
const SCORE_LATTICE = [0, 50, 100];
let c11n = 0;
const c11bad = [];
for (const stakes of STAKES) for (const current of CURRENT) for (const recovery of RECOVERY)
for (const tech of TECH) for (const sovereignty of SOV)
for (const a of SCORE_LATTICE) for (const b of SCORE_LATTICE)
for (const c of SCORE_LATTICE) for (const d of SCORE_LATTICE) {
  if (stakes === 'learning') continue;
  const scores = { custodial: a, 'self-loss': b, remote: c, physical: d };
  const res = recommendV2({ ...baseAnswers, stakes, current, recovery, tech, sovereignty, scores });
  c11n++;
  if (res.primary.rungSlug === 'single-sig') {
    c11bad.push(`${stakes}/${current}/${recovery}/${tech}/${sovereignty} scores=${a}/${b}/${c}/${d}`);
  }
}
if (c11bad.length) {
  fail(`C11: ${c11bad.length} of ${c11n} combos recommend a lone hardware wallet with no passphrase above learning stakes`);
  c11bad.slice(0, 3).forEach((w) => console.error(`        e.g. ${w}`));
}
console.log(`  C11 no single point of failure — ${c11n} combos above learning stakes, ${c11bad.length} bare single-sig`);

// ════ result ════════════════════════════════════════════════════════════════
console.log('');
if (failures) {
  console.error(`✗ ${failures} failure(s).`);
  process.exit(1);
}
console.log('✓ All constraints, shapes, and string bans green.');
