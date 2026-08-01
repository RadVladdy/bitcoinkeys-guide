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
  EXPECTED_RAW, WEIGHT_POINTS,
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
  if (p.fork) {
    if (!['diy', 'collab'].includes(p.fork.lead)) bad('fork.lead invalid');
    if (typeof p.fork.leadNote !== 'string') bad('fork.leadNote not string');
    if (!Array.isArray(p.fork.paths) || p.fork.paths.length !== 2) bad('fork.paths not a 2-array');
    else for (const path of p.fork.paths) {
      for (const f of ['key', 'label', 'rungSlug', 'rungLabel', 'essence', 'tradeoff']) {
        if (typeof path[f] !== 'string') bad(`fork path.${f} not string`);
      }
      if (path.key === 'collab' && (!Array.isArray(path.vendors) || !path.vendors.length)) bad('collab path missing vendors');
      if (path.key === 'diy' && (!Array.isArray(path.wallets) || !path.wallets.length)) bad('diy path missing wallets');
    }
  } else {
    if (!Array.isArray(p.wallets) || !p.wallets.length) bad('non-fork primary missing wallets');
    else for (const w of p.wallets) {
      if (typeof w.name !== 'string' || typeof w.why !== 'string') bad('primary wallet missing name/why');
    }
    if (p.holdback != null && typeof p.holdback !== 'string') bad('primary.holdback not string|null');
  }
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
const isFork = (res) => Boolean(res.primary.fork);

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
  const chosen = res.fit.find((r) => r.setup === (res.primary.fork ? res.primary.fork.paths[0].rungSlug : res.primary.rungSlug))
    || res.fit[0];
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

// ════ result ════════════════════════════════════════════════════════════════
console.log('');
if (failures) {
  console.error(`✗ ${failures} failure(s).`);
  process.exit(1);
}
console.log('✓ All constraints, shapes, and string bans green.');
