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
  CONCERN_KEYS, SETUP_KEYS, PROTECTION, FAMILY, TIE_MARGIN, prompts,
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

// C1 — continuity: untouched defaults at learning/meaningful/serious →
// single-sig primary, no tie flag, across tech × sovereignty × recovery.
let c1n = 0;
for (const stakes of ['learning', 'meaningful', 'serious'])
for (const tech of TECH) for (const sovereignty of SOV) for (const recovery of RECOVERY) {
  c1n++;
  const res = recommendV2({ ...baseAnswers, stakes, tech, sovereignty, recovery, scores: defaultsFor(stakes) });
  const where = `C1 ${stakes}/${tech}/${sovereignty}/${recovery}`;
  if (res.primary.rungSlug !== 'single-sig' || res.primary.fork) fail(`${where}: primary=${primaryId(res)} (want single-sig)`);
  if (res.tie) fail(`${where}: tie-flagged at untouched default (${res.tie.a} vs ${res.tie.b}, margin ${res.tie.margin})`);
}
console.log(`  C1 continuity — ${c1n} default-profile combos checked`);

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
    const d = defaultsFor(stakes);
    const rankPos = (score) => {
      const rows = fitFor({ ...d, [concern]: score }, { stakes, tech, sovereignty });
      return Object.fromEntries(rows.map((r, i) => [r.setup, i]));
    };
    const lo = rankPos(0), mid = rankPos(d[concern]), hi = rankPos(80);
    for (const s of strong) {
      if (mid[s] > lo[s] || hi[s] > mid[s]) {
        fail(`C3 ${concern} ${stakes}/${tech}/${sovereignty}: ${s} rank ${lo[s]}→${mid[s]}→${hi[s]} as score rises`);
      }
    }
  }
}
console.log(`  C3 monotonicity — ${c3n} score-sweeps checked`);

// C4 — anti-passphrase honesty: self-loss at/above 'elevated' → passphrase is
// never primary AND never the step-up card, and a computed self-loss holdback
// is present on single-family results.
let c4n = 0;
for (const selfScore of [52, 65, 80])
for (const stakes of STAKES) for (const tech of TECH) for (const sovereignty of SOV) {
  const word = scoreWord(selfScore, 'self-loss', stakes);
  if (word !== 'elevated' && word !== 'high') continue;
  c4n++;
  const scores = { ...defaultsFor(stakes), 'self-loss': selfScore };
  const res = recommendV2({ ...baseAnswers, stakes, tech, sovereignty, scores });
  const where = `C4 self=${selfScore} ${stakes}/${tech}/${sovereignty}`;
  if (res.primary.rungSlug === 'passphrase') fail(`${where}: passphrase primary`);
  if (res.secondary.rungSlug === 'passphrase') fail(`${where}: passphrase step-up offered`);
  if (!res.holdbacks.some((h) => h.concern === 'self-loss')) fail(`${where}: no computed self-loss holdback`);
}
console.log(`  C4 anti-passphrase — ${c4n} elevated/high self-loss combos checked`);

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
  // Mirrors the engine's widened learning gate: at learning stakes the primary
  // stays in the SINGLE family — not merely "not the fork". It was `family ===
  // 'fork'` here and in the engine while the passphrase could never win
  // anything; once it became reachable that wording let it through, so both
  // sides moved to "anything outside the simple family" (2026-08-01).
  const eligible = res.fit.filter((r) => !r.gated && !(stakes === 'learning' && r.family !== 'single'));
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

// ── prompt-bank sanity: gating, cross-bucket, saturation below 100 ──────────
const allIds = prompts.map((p) => p.id);
const allChecked = scoreFromPrompts(allIds, 'meaningful', []);
for (const c of CONCERN_KEYS) {
  if (allChecked[c] >= 100) fail(`saturation: ${c} hits ${allChecked[c]} with everything checked (must stay <100)`);
  if (scoreWord(allChecked[c], c, 'meaningful') !== 'high') fail(`saturation: ${c} at ${allChecked[c]} with everything checked is not 'high'`);
}
const gatedAlone = scoreFromPrompts(['p-family'], 'meaningful', []);
if (gatedAlone.physical !== defaultsFor('meaningful').physical) fail('gating: p-family scored without any gate prompt checked');
const skipAll = scoreFromPrompts(allIds, 'meaningful', [...CONCERN_KEYS]);
for (const c of CONCERN_KEYS) {
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
