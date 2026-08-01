// The setup finder's risk-assessment scoring engine — Phase A of the redesign.
//
// This file replaces the ranked-worries heuristics in quiz.js with a scored
// model: four concerns, each 0–100 internally but ALWAYS presented as words
// (low / typical / elevated / high — never numbers), seeded from research-based
// defaults, moved by evidence-backed situation prompts, and fed through a
// protection-matrix fit function. recommendV2() returns the SAME output shape
// as quiz.js recommend() — primary / secondary / journey — so the UI can swap
// engines, extended with profile / reasons / holdbacks / tie / fit.
//
// PRIVACY UNCHANGED: no amounts are ever asked or stated. Stakes are the
// consequence of loss, exactly as before. Pure functions; nothing persisted.
//
// HOW THE TWO ENGINES RELATE (until Phase B/C retire quiz.js):
//   • The fit engine here decides WHAT to recommend (which rung / fork).
//   • quiz.js recommend() is then called with a synthesized answer set that
//     forces that rung, so the card structure — fork paths, device pairs,
//     wallet notes, journey framing — stays byte-identical with today's UI.
//     The explanation layer (why / holdback) is replaced with computed copy.
//   • shimScores() maps a legacy ranked-worries answer object to a score
//     vector, so saved plans and prefilled finders keep working (Phase B wires
//     it into plan.js).
//
// Verified by scripts/verify-finder.mjs — the 3,240-combo legacy diff grid plus
// the score grid asserting the five calibration constraints (C1–C5, § below).

import { recommend } from './quiz.js';

// ── 1 · The four concerns ───────────────────────────────────────────────────
// Same buckets the finder has always used, now scored independently — "two
// concerns both high" is finally expressible. Labels are plain English for the
// assessment UI; keys are stable and appear in saved plans, so never rename.

export const CONCERNS = [
  {
    key: 'custodial',
    label: 'A company failing you',
    blurb: 'Your exchange or custodian going under, freezing your account, or losing your coins — the Mt. Gox to FTX class of loss.',
  },
  {
    key: 'self-loss',
    label: 'Locking yourself out',
    blurb: 'Lost or untested backups, a forgotten passphrase, no way for anyone to recover if something happens to you, a botched migration.',
  },
  {
    key: 'remote',
    label: 'Scams and remote theft',
    blurb: 'Phishing, fake support and fake apps, SIM swaps, malware, address poisoning, long-con investment scams — theft that never touches your door.',
  },
  {
    key: 'physical',
    label: 'Targeted physical theft',
    blurb: 'Someone coming after you specifically — coercion, burglary for devices and backups, insider theft by people who know you.',
  },
  {
    key: 'exposure',
    label: 'Your identity tied to your coins',
    blurb: 'A company inside your setup that knows who you are and can see what you hold — ID checks that end up in a database, a service that can be compelled, a permanent link between your name and your balance.',
    // NOT a share of expected loss like the other four, and the assessment must
    // not present it as one. The others answer "how does Bitcoin get taken from
    // you"; this one answers "how much do you mind being known". It is scored
    // the same way and multiplies against protection the same way, but its
    // default comes from the sovereignty ANSWER rather than from research base
    // rates, because it is a preference, not a frequency.
    preference: true,
  },
];

export const CONCERN_KEYS = CONCERNS.map((c) => c.key);
// The order the assessment walks its sections (design § 3).
export const SECTION_ORDER = ['custodial', 'self-loss', 'remote', 'physical'];

// ── 2 · Defaults — the ghost bars ───────────────────────────────────────────
// Forward-looking share of expected loss for a typical holder, from the
// research pass behind the design doc (Chainalysis / IC3 flow data, lost-coin
// stock estimates, exchange-failure rates, the Lopp physical-attack registry).
// Stake-shifted: small stakes skew custodial (more likely fully on-exchange);
// large stakes skew physical (perceived-worth targeting) and shrink custodial
// (large holders are mostly off-exchange already).

const DEFAULTS = {
  small: { custodial: 33, 'self-loss': 30, remote: 35, physical: 2, exposure: 50 },
  mid:   { custodial: 20, 'self-loss': 35, remote: 40, physical: 5, exposure: 50 },
  large: { custodial: 10, 'self-loss': 35, remote: 35, physical: 20, exposure: 50 },
};

// `exposure` is seeded by the SOVEREIGNTY answer, not by stakes — the reader
// already tells us how much they mind a third party, and until now that answer
// was spent on a flat cost multiplier applied to one setup plus a hard gate
// deciding which path led a card. Both were the model compensating for a
// concern it could not express. Scored, it behaves like every other answer:
// it moves a bar, and the bar moves the recommendation.
export const EXPOSURE_BY_SOV = { pure: 85, 'lean-self': 55, 'open-help': 20 };

// Consequence-of-loss answer → default band. 'serious' is still "mid": the
// design's large band is $1M+/public-footprint territory, which maps to
// life-changing consequence, not "a big chunk of my savings".
const STAKES_BAND = { learning: 'small', meaningful: 'mid', serious: 'mid', lifechanging: 'large' };

export function defaultsFor(stakes) {
  return { ...DEFAULTS[STAKES_BAND[stakes] || 'mid'] };
}

// ── 3 · The word scale ──────────────────────────────────────────────────────
// Scores are 0–100 internally but ALWAYS presented as words (decided § 11.1).
// Thresholds are relative to each concern's (stake-shifted) default d and its
// published-band half-width h:
//
//     low       n <  d − h          (below the research band)
//     typical   d − h ≤ n ≤ d + h   (the default band — "you're the base rate")
//     elevated  d + h < n ≤ d + 2.5h
//     high      n >  d + 2.5h
//
// h comes from the design's § 2 uncertainty bands (remote 30–50, self 25–45,
// custodial 10–30 → ±10; physical 1–8 → ±4). At mid stakes that means, e.g.,
// remote: low <30 · typical 30–50 · elevated 51–65 · high 66+, and physical:
// typical 1–9 · elevated 10–15 · high 16+. Physical's compressed scale is
// deliberate — its default share is small, so it takes little evidence of
// being a target to be genuinely "high" for you.

export const HALF_BAND = { custodial: 10, 'self-loss': 10, remote: 10, physical: 4, exposure: 15 };

export function scoreWord(n, concern, stakes = 'meaningful') {
  const d = defaultsFor(stakes)[concern];
  const h = HALF_BAND[concern];
  if (n < d - h) return 'low';
  if (n <= d + h) return 'typical';
  if (n <= d + 2.5 * h) return 'elevated';
  return 'high';
}

// ── 4 · The question bank — evidence-backed situation prompts ───────────────
// Every prompt is a yes/no life-fact ("true of me?") with a one-line receipt —
// the why line renders inline as the reason the checkbox moves the bar.
// Weights are coarse (small / medium / large); the mapping to points is below.
//
// gatedBy: the family prompt (decided § 11.4) only appears after a yes on any
// of the three public-exposure prompts — asking "are your relatives findable?"
// cold would be creepy and useless; it only matters once targeting is live.
//
// also: cross-bucket effects. A hardware wallet shipped to a leaked home
// address is both a physical-targeting fact and a phishing-list fact.

export const WEIGHT_POINTS = { small: 6, medium: 10, large: 16 };

export const prompts = [
  // ── custodial ── (raises: exchange/custodian failure)
  {
    id: 'c-exchange', concern: 'custodial', weight: 'large',
    statement: 'My Bitcoin sits on an exchange or app, not in a wallet I control.',
    why: 'Roughly six in ten exchanges ever launched have closed. While a company holds the keys, its problems are your problems.',
  },
  {
    id: 'c-multicoin', concern: 'custodial', weight: 'small',
    statement: 'The place holding it also sells lots of other coins and tokens.',
    why: 'The multi-coin, trading-first profile is the FTX profile — trading businesses fail differently than vaults do.',
  },
  {
    id: 'c-yield', concern: 'custodial', weight: 'large',
    statement: 'I’m earning interest or “rewards” on my Bitcoin.',
    why: 'Every 2022 bankruptcy that froze retail funds was a yield platform. Yield means your coins are out working — and not for you.',
  },
  {
    id: 'c-audit', concern: 'custodial', weight: 'small',
    statement: 'I couldn’t say who audits my platform, or whether it publishes proof of reserves.',
    why: 'Platforms that show their reserves can be checked; platforms that don’t can only be believed.',
  },
  {
    id: 'c-friction', concern: 'custodial', weight: 'medium',
    statement: 'I’ve had a withdrawal delayed, an account frozen, or a surprise re-verification.',
    why: 'Withdrawal friction preceded the Celsius collapse by about a month — it is the classic early warning.',
  },
  {
    id: 'c-never-withdrawn', concern: 'custodial', weight: 'medium',
    statement: 'I’ve never actually withdrawn to a wallet of my own.',
    why: 'In a bank-run the withdrawal window is days. An exit you have never practised is not an exit plan.',
  },
  {
    id: 'c-unregulated', concern: 'custodial', weight: 'medium',
    statement: 'My exchange isn’t regulated where I live.',
    why: 'Of the exchanges that vanished with no explanation at all, almost every one was an unregulated venue.',
  },

  // ── self-loss ── (raises: self-inflicted loss)
  {
    id: 's-forgot', concern: 'self-loss', weight: 'medium',
    statement: 'I’ve forgotten or reset an important password in the last few years.',
    why: 'About four in ten US crypto owners have forgotten a crypto password. Ordinary forgetfulness is the base rate, not the exception.',
  },
  {
    id: 's-never-restored', concern: 'self-loss', weight: 'large',
    statement: 'I’ve never restored a wallet from my written backup to prove it works.',
    why: 'Recovery firms see seeds written down with errors all the time — and the error only surfaces at restore time, the worst moment to learn.',
  },
  {
    id: 's-nobody-knows', concern: 'self-loss', weight: 'medium',
    statement: 'Nobody but me knows my Bitcoin exists, or how to reach it.',
    why: 'True of nearly nine in ten holders — and it is the QuadrigaCX failure mode: if something happens to you, the coins go with you.',
  },
  {
    id: 's-memory-only', concern: 'self-loss', weight: 'large',
    statement: 'Part of what unlocks my Bitcoin exists only in my memory.',
    why: 'The top recovery-firm caseload. A wrong passphrase gives no error message — just an empty wallet.',
  },
  {
    id: 's-one-place', concern: 'self-loss', weight: 'medium',
    statement: 'All my backup information lives in one place.',
    why: 'One fire, flood, or house move can take all of it at once. The Newport landfill drive is the famous case of a whole class.',
  },
  {
    id: 's-wiped', concern: 'self-loss', weight: 'small',
    statement: 'I’ve wiped or tossed an old phone or computer without checking what was on it.',
    why: 'A meaningful share of "lost" Bitcoin left in exactly this way — an old wallet nobody remembered until it was gone.',
  },
  {
    id: 's-complexity', concern: 'self-loss', weight: 'medium',
    statement: 'My setup has parts I couldn’t explain to a smart friend in five minutes.',
    why: 'Complexity beyond your own skill is a loss multiplier in recovery-firm data — you can’t rebuild what you can’t explain.',
  },
  {
    id: 's-cant-name', concern: 'self-loss', weight: 'medium',
    statement: 'I couldn’t name every wallet and account I’ve ever put Bitcoin in.',
    why: 'A third of holders have already lost access to at least one wallet. Untracked is halfway to lost.',
  },

  // ── remote ── (raises: remote theft & scams)
  {
    id: 'r-sms', concern: 'remote', weight: 'medium',
    statement: 'My exchange or email second step is a text message to my phone — or I’m not sure.',
    why: 'A SIM swap moves your number to an attacker’s phone at a carrier counter — the FTX hack began exactly there.',
  },
  {
    id: 'r-public-link', concern: 'remote', weight: 'medium',
    also: [{ concern: 'physical', weight: 'small' }],
    statement: 'My phone number or email is publicly connected to crypto — an old forum, a bio, a breached service.',
    why: 'Scammers buy breach lists and work through them. One insider breach at a major exchange fed a $16M impersonation operation.',
  },
  {
    id: 'r-follow', concern: 'remote', weight: 'large',
    statement: 'If my exchange called or texted about a security problem, I’d follow the instructions.',
    why: 'Real support never makes first contact. One scripted crew took over $4M with exactly this call.',
  },
  {
    id: 'r-type-seed', concern: 'remote', weight: 'large',
    statement: 'If a wallet app or support page asked in a convincing way, I’d type my 12 or 24 words in.',
    why: 'Every request for your seed words is theft — no exceptions, ever. This one behaviour is behind most emptied wallets.',
  },
  {
    id: 'r-store-search', concern: 'remote', weight: 'medium',
    statement: 'I find wallet apps by searching the app store rather than following the maker’s own link.',
    why: 'Dozens of seed-stealing fakes have made it into the official app stores; one fake desktop wallet took about $1.8M.',
  },
  {
    id: 'r-history-copy', concern: 'remote', weight: 'medium',
    statement: 'I copy addresses from my transaction history and check only the first and last characters.',
    why: 'Address poisoning targets exactly this habit — $83M+ confirmed stolen, including a single $50M loss.',
  },
  {
    id: 'r-cracked', concern: 'remote', weight: 'medium',
    statement: 'I download cracked software, or share USB sticks, on the computer I use for crypto.',
    why: 'Clipboard-swapping malware rides in on exactly this — and it waits silently for a copied address.',
  },
  {
    id: 'r-quick', concern: 'remote', weight: 'medium',
    statement: 'I act on crypto messages quickly, and I’m confident I can spot a fake.',
    why: 'Quick responders and the self-confident click more, not less — about 80% of people overrate their own detection.',
  },
  {
    id: 'r-online-friend', concern: 'remote', weight: 'large',
    statement: 'Someone I know only online has encouraged me to move or invest my crypto.',
    why: 'The single biggest scam category there is — $7.2B in US losses in one year. The relationship itself is the weapon.',
  },

  // ── physical ── (raises: targeted physical)
  {
    id: 'p-known', concern: 'physical', weight: 'medium',
    statement: 'People outside my household know or suspect I own bitcoin.',
    why: 'Victim selection is essentially never random — every documented case starts with someone knowing.',
  },
  {
    id: 'p-posted', concern: 'physical', weight: 'large',
    statement: 'I’ve posted anything online showing amounts, or my username links to my real name.',
    why: 'A streamer was home-invaded three weeks after a wallet screenshot. Amounts plus identity is the targeting formula.',
  },
  {
    id: 'p-crypto-job', concern: 'physical', weight: 'large',
    statement: 'I work in crypto, or I’m known online as a crypto person.',
    why: 'The recent attack wave is heavily executives and influencers — and their families.',
  },
  {
    id: 'p-family', concern: 'physical', weight: 'medium',
    gatedBy: ['p-known', 'p-posted', 'p-crypto-job'],
    statement: 'My spouse, kids, or parents are publicly linkable to me.',
    why: 'Relatives are routinely taken as proxies — attackers who can’t reach you reach for the people around you.',
  },
  {
    id: 'p-cash', concern: 'physical', weight: 'medium',
    statement: 'I’ve bought or sold bitcoin in person for cash — or I would.',
    why: 'A quarter of reported physical attacks happen at in-person trades.',
  },
  {
    id: 'p-shipped', concern: 'physical', weight: 'small',
    also: [{ concern: 'remote', weight: 'small' }],
    statement: 'I’ve had a hardware wallet shipped to my home address, or used a portfolio service that holds my identity and balances.',
    why: 'One vendor leak put 272,000 home addresses in criminal hands; a portfolio-service leak with balances preceded kidnappings.',
  },
  {
    id: 'p-insiders', concern: 'physical', weight: 'medium',
    statement: 'Contractors, cleaners, or acquaintances have seen where my device or backup lives — or I’ve mentioned bitcoin to them.',
    why: 'Insider and acquaintance theft is a documented attacker class, and it includes family.',
  },
  {
    id: 'p-door', concern: 'physical', weight: 'small',
    statement: 'I’d open the door to an unexpected delivery or a “police” visit without verifying it first.',
    why: 'An impersonated delivery or police visit is the standard entry in dozens of home invasions.',
  },
];

export const promptById = Object.fromEntries(prompts.map((p) => [p.id, p]));
export const promptsFor = (concern) => prompts.filter((p) => p.concern === concern);

// ── Prompt → score mechanics ────────────────────────────────────────────────
// Checked prompts accumulate raw points per concern; the score climbs from the
// (stake-shifted) default toward a per-concern CEILING with diminishing
// returns:  score = d + (C − d) · raw / (raw + H).
//
// H is roughly a third of the section's total raw points, so checking
// EVERYTHING lands at d + 0.75·(C − d) — solidly in the high band, near the
// ceiling, never at it and never 100. Certainty theater is off-brand: the
// design's "saturates near the band ceiling" is implemented as the ceiling of
// the plausible range (the high band), NOT the § 2 default band — prompts must
// be able to reach elevated/high or the whole assessment would be decorative.
//
// Section totals: custodial 74 · self-loss 88 · remote 108(+6 cross) ·
// physical 84(+6 cross). One large prompt alone moves a bar visibly but not
// conclusively; the big movers (on-exchange, yield, seed-typing, doxxed) are
// the ones the incident record actually names.

const CEILING = { custodial: 88, 'self-loss': 88, remote: 90, physical: 80 };
const H_SAT = { custodial: 25, 'self-loss': 29, remote: 36, physical: 28 };

/**
 * Score vector from checked prompts. Sections in skippedSections keep the
 * standard estimate (decided § 11.3). A gated prompt whose gate was never
 * answered yes contributes nothing, whatever the caller sends.
 */
export function scoreFromPrompts(checkedPrompts = [], stakes = 'meaningful', skippedSections = []) {
  const d = defaultsFor(stakes);
  const checked = new Set(checkedPrompts);
  const raw = { custodial: 0, 'self-loss': 0, remote: 0, physical: 0 };
  for (const p of prompts) {
    if (!checked.has(p.id)) continue;
    if (p.gatedBy && !p.gatedBy.some((g) => checked.has(g))) continue;
    raw[p.concern] += WEIGHT_POINTS[p.weight];
    for (const x of p.also || []) raw[x.concern] += WEIGHT_POINTS[x.weight];
  }
  const scores = {};
  for (const c of CONCERN_KEYS) {
    scores[c] = skippedSections.includes(c)
      ? d[c]
      : Math.round(d[c] + (CEILING[c] - d[c]) * (raw[c] / (raw[c] + H_SAT[c]) || 0));
  }
  return scores;
}

// ── 5 · Protection matrix + fit ─────────────────────────────────────────────
// How well each setup defends each concern, −1…3. The negative is the honesty:
// a passphrase DEFENDS a found seed by ADDING the silent-lockout failure mode
// that is already most holders' top real risk. Values are the design's § 5
// starting matrix — calibration (below) moved the COST terms, not the matrix.
//
//                      custodial  self-loss  remote  physical   complexity devices
//   single-sig cold        3          1        2        0           0        1
//   + passphrase           3         −1        2        1           1        1
//   DIY multisig 2-of-3    3          0        3        3           2        3
//   collaborative 2-of-3   3          3        3        3           1        2
//   3-of-5 (step-up)       3          1        3        3           3        5
//
// Receipts carried into copy: multisig's physical 3 is the only defense with
// an incident record (funds not reachable at the scene ended real attacks);
// collaborative's self-loss 3 is the provider key-replacement backstop.

export const PROTECTION = {
  // ── the `exposure` column, added 2026-08-01 ──────────────────────────────
  // Positive = keeps your name away from your coins. NEGATIVE = actively
  // creates the link, the same way the passphrase carries a negative on
  // self-loss. Collaborative custody is the only setup here that hands a
  // company your identity, so it is the only negative.
  //
  // And collaborative's `remote` drops 3 -> 2. KYC is not risk-free: an ID
  // database is a phishing and extortion list the moment it leaks, and the
  // holder is on it through no fault of their own. Scoring it level with a
  // setup that never collected the data said something untrue.
  'single-sig':    { weights: { custodial: 3, 'self-loss': 1,  remote: 2, physical: 0, exposure: 2 }, complexity: 0, devices: 1 },
  // The passphrase row, re-weighted 2026-08-01.
  //   physical 3 — a passphrase is a full duress defence (the decoy/hidden
  //     wallet), not a partial one. Level with multisig: both mean what is on
  //     the device is not what an attacker gets.
  //   remote 2.5 — above single-sig's 2, because a passphrase also blunts a
  //     seed pulled off a compromised machine or generated by a device you
  //     cannot fully trust. The 2026-07 Coldcard entropy flaw is the case in
  //     point: a strong unique passphrase was one of only three things that
  //     kept coins out of the sweep, because it is mixed in AFTER the device's
  //     random number generator has done its work.
  //   complexity 0 and a FULL simplicity share — it is one device, no extra
  //     hardware, no coordinator, no quorum to manage. Charging it a complexity
  //     cost while single-sig collected a simplicity bonus was double-counting
  //     the same property, and it is what made the rung unreachable.
  // The self-loss −1 is unchanged and deliberate: forgotten passphrases are the
  // top recovery-firm caseload, and a wrong one shows an empty wallet with no
  // error. That penalty, plus the C4 gate, is now the ONLY thing holding the
  // passphrase back — which is the honest place for the brake to sit.
  passphrase:      { weights: { custodial: 3, 'self-loss': -0.5, remote: 2.5, physical: 3, exposure: 2.5 }, complexity: 0, devices: 1 },
  multisig:        { weights: { custodial: 3, 'self-loss': 0,  remote: 3, physical: 3, exposure: 3 }, complexity: 2, devices: 3 },
  collaborative:   { weights: { custodial: 3, 'self-loss': 3,  remote: 2, physical: 3, exposure: -2 }, complexity: 1, devices: 2 },
  'three-of-five': { weights: { custodial: 3, 'self-loss': 1,  remote: 3, physical: 3, exposure: 3 }, complexity: 3, devices: 5 },
};

export const SETUP_KEYS = Object.keys(PROTECTION);

// Which recommendation FAMILY a setup belongs to. Both 2-of-3 flavors (and the
// 3-of-5 step-up) collapse into the multisig FORK — the fork card always shows
// both paths, and who LEADS is a preserved hard gate (see recommendV2), never
// a fit result.
export const FAMILY = {
  'single-sig': 'single', passphrase: 'passphrase',
  multisig: 'fork', collaborative: 'fork', 'three-of-five': 'fork',
};

// Each family's position ON THE LADDER (/learn/ladder rungs 1–4), which is the
// site's own ordering of protection: single-sig cold → + passphrase → multisig
// → collaborative. The fork's two rungs share a rank because they are presented
// as two equal paths, never as a hierarchy. Used ONLY to resolve near-ties
// upward (C6) — it never reorders anything the scores actually separated.
export const LADDER_RANK = { single: 1, passphrase: 2, fork: 3 };

// ── Tuning constants ── (the calibration outcome — see the contract below)
//
// fit(setup) = Σ_c eff_c · W[c][setup]  −  complexity·TECH·STAKES·0.9
//              −  sovereigntyCost(collab only)  −  (devices−1)·BUDGET[stakes]
//              +  (single-sig only) SIMPLICITY_EDGE[stakes]
//
// eff_c = clamp(d_c + GAIN·(score_c − d_c), 0, 100) / 100 — the score's
// DEVIATION from the default is amplified by GAIN before weighting. Rationale:
// with raw shares (design's starting Σ score/100 · W), collaborative's weight
// row dominates at the DEFAULT profile for low-cost users (technical,
// open-help) and no additive cost set can fix it without also burying the
// motivating high-score cases — the design § 5 predicted exactly this failure.
// Amplifying deviation keeps the default profile cheap to defend (C1) while
// letting genuinely elevated scores overpower the costs (C2). GAIN=1.6 with
// the costs below satisfies all five constraints with real margins.
//
// SIMPLICITY_EDGE is the site's core rule as arithmetic — "the simplest setup
// that adequately covers your threat model" — a bonus the challengers must
// overcome with real, score-backed protection. It shrinks as stakes rise.
//
// THE CALIBRATION CONTRACT (asserted programmatically, scripts/verify-finder.mjs):
//  C1 continuity: untouched default profile at learning/meaningful/serious →
//     single-sig cold primary, with NO near-tie flag, across every tech ×
//     sovereignty × recovery combination.
//  C2 motivating case: self-loss 80 AND (remote 80 OR physical 80) →
//     the fork family (collaborative or multisig) is primary; passphrase never.
//     Asserted at meaningful/serious/lifechanging. At LEARNING stakes C1-style
//     continuity deliberately wins instead (documented deviation: we do not
//     push someone still learning into multisig; the old engine never did
//     either, and the checklist carries their risk work).
//  C3 monotonicity: raising any concern never lowers the fit-rank of a setup
//     with the top protection weight for that concern (linear + monotone eff
//     makes this structural; asserted anyway).
//  C4 anti-passphrase honesty: self-loss at or above 'elevated' → passphrase
//     is hard-gated out of primary AND out of the step-up card, and the result
//     carries a computed holdback naming the reason. (In practice the matrix
//     already makes passphrase unwinnable as a primary — see note below.)
//  C5 near-ties: top two distinct families within TIE_MARGIN → the result is
//     flagged as a genuine either/or (result.tie), never a false winner.

const DEVIATION_GAIN = 1.6;
const SIMPLICITY_EDGE = { learning: 1.15, meaningful: 1.05, serious: 1.0, lifechanging: 0.45 };
// WHO gets the simplicity bonus, and how much of it. It used to be single-sig
// ONLY — which double-charged the passphrase for simplicity it actually has:
// one device, like single-sig, yet it paid a complexity cost AND forfeited the
// whole bonus. Combined with a physical weight of 1, that made it STRICTLY
// DOMINATED: swept over 527,076 answer x score combinations it ranked first
// ZERO times, and in the exact case it exists for — elevated physical risk,
// low self-loss, one device, "keep it simple" — it ranked LAST of five while
// the engine recommended three hardware wallets. A rung the ladder teaches must
// be reachable by the assessment that is supposed to find it.
// Passphrase takes a PARTIAL share, not the full bonus: it is the second-
// simplest setup, not the simplest — one device, but one more secret.
const SIMPLICITY_SHARE = { 'single-sig': 1, passphrase: 1 };
// How much of the simplicity bonus the PASSPHRASE keeps, by stakes. Single-sig
// always keeps all of it (it is the simplest thing there is); this scales only
// the passphrase's share.
//
// Why it has to taper: a flat full share made the passphrase the DEFAULT answer
// at life-changing stakes — one device and one memory holding life-changing
// money, beating multisig for a reader who had not adjusted a single bar. That
// cuts against the ladder's own logic that more at stake means more keys, and
// the passphrase's single point of failure is exactly what stops being
// affordable as consequences grow. Simplicity is a real virtue at small stakes
// and a weaker argument at large ones, so its bonus fades the same way
// SIMPLICITY_EDGE already does.
const PASSPHRASE_SHARE_BY_STAKES = { learning: 1, meaningful: 1, serious: 0.75, lifechanging: 0.25 };

// LADDER PULL — how hard the consequence-of-loss answer pushes up the rungs.
// Added as (rung − 1) × the stakes value, so the effect is SEQUENTIAL: rung 2
// gets one dose, rung 3 gets two. Nothing at learning stakes.
//
// Why it exists as its own term: stakes used to move the result only
// INDIRECTLY, by making complexity cheaper (STAKES_FACTOR, BUDGET_FACTOR,
// SIMPLICITY_EDGE all fade as stakes rise). That is a discount on the downside,
// not an argument for the upside, and it left "more at stake" as a weak,
// emergent nudge rather than a stated position. The site's own ladder says
// plainly that more consequence justifies more protection; this makes the
// engine say it too, and makes it tunable in one visible place.
// It starts at 'serious', not at 'meaningful'. The term represents "more at
// stake justifies more protection", and at "I'd be upset, but I'd be okay"
// that argument is genuinely weak — applying it there pulled the passphrase to
// within 0.05 of single-sig on the untouched default and tripped C1's no-
// near-tie clause. The pull should appear where the reasoning appears.
//
// Tuned against C1: at 'serious' a pull of 0.3 flipped the UNTOUCHED DEFAULT
// profile to multisig, breaking the continuity guarantee that a reader who
// changes nothing still lands on single-sig cold. 0.15 keeps that intact while
// still leaning up. Life-changing is outside C1 by design and stays strong.
// If serious-by-default should move to multisig, that is a C1 decision, not a
// tuning one — change the constraint deliberately, don't quietly outweigh it.
const LADDER_PULL = { learning: 0, meaningful: 0, serious: 0.15, lifechanging: 0.6 };
const TECH_FACTOR = { simple: 0.9, careful: 0.65, technical: 0.4 };
const STAKES_FACTOR = { learning: 1.3, meaningful: 1.1, serious: 0.8, lifechanging: 0.4 };
const COMPLEXITY_BASE = 0.9;
// Collaborative custody's fee/KYC/trust preference cost, scaled by the
// sovereignty answer. It steers, it never gates: even 'pure' users get the
// fork when their scores demand it — with the DIY path leading (the gate).
// RETIRED 2026-08-01 — kept only to validate the sovereignty answer. It used to
// be a flat penalty applied to collaborative custody alone, which is how the
// model expressed "you said you want sovereignty" without ever scoring it. That
// job now belongs to the `exposure` concern (EXPOSURE_BY_SOV), where the reader
// can see the bar, adjust it, and watch it move the answer — like every other
// input. A preference applied as a hidden discount is not a preference the
// reader can argue with.
const SOV_VALUES = { pure: 1, 'lean-self': 1, 'open-help': 1 };
// Extra hardware beyond the first device weighs on a budget; consequence-of-
// loss is the only budget proxy we have (never an amount).
const BUDGET_FACTOR = { learning: 0.25, meaningful: 0.15, serious: 0.05, lifechanging: 0 };
export const TIE_MARGIN = 0.15;

/**
 * Rank all setups for a score vector + the finder's other answers.
 * Returns [{ setup, family, fit, gated, contributions, costs }] sorted by fit,
 * best first. contributions[] is the per-concern (concern × weight × effective
 * score) breakdown the UI renders as "because" lines; costs itemizes what was
 * subtracted. Pure ranking — the C4 passphrase gate is reported via `gated`,
 * not by reordering, so monotonicity stays inspectable.
 */
export function fitFor(scores, answers = {}) {
  const stakes = STAKES_FACTOR[answers.stakes] ? answers.stakes : 'meaningful';
  const tech = TECH_FACTOR[answers.tech] ? answers.tech : 'careful';
  const sov = SOV_VALUES[answers.sovereignty] ? answers.sovereignty : 'lean-self';
  const d = defaultsFor(stakes);
  // `exposure` defaults to whatever the sovereignty ANSWER implies, not to the
  // neutral 50 in DEFAULTS — that neutral only exists so the shape stays whole
  // for callers that pass no answers. An explicit score always wins, so a
  // reader who nudges the bar on the review screen overrides their own earlier
  // answer, exactly as they can for the other four.
  const dEff = { ...d };
  if (EXPOSURE_BY_SOV[sov] !== undefined) dEff.exposure = EXPOSURE_BY_SOV[sov];

  const eff = {};
  for (const c of CONCERN_KEYS) {
    const s = typeof scores[c] === 'number' ? scores[c] : dEff[c];
    eff[c] = Math.min(100, Math.max(0, dEff[c] + DEVIATION_GAIN * (s - dEff[c]))) / 100;
  }
  const selfWord = scoreWord(
    typeof scores['self-loss'] === 'number' ? scores['self-loss'] : d['self-loss'],
    'self-loss', stakes
  );
  const rows = SETUP_KEYS.map((setup) => {
    const P = PROTECTION[setup];
    const contributions = CONCERN_KEYS.map((c) => ({
      concern: c, weight: P.weights[c], eff: eff[c],
      points: Math.round(P.weights[c] * eff[c] * 100) / 100,
    }));
    const protection = contributions.reduce((t, x) => t + x.points, 0);
    const costs = {
      complexity: Math.round(P.complexity * TECH_FACTOR[tech] * STAKES_FACTOR[stakes] * COMPLEXITY_BASE * 100) / 100,
      sovereignty: 0,
      budget: Math.round((P.devices - 1) * BUDGET_FACTOR[stakes] * 100) / 100,
      simplicityEdge: Math.round((SIMPLICITY_EDGE[stakes]
        * (SIMPLICITY_SHARE[setup] || 0)
        * (setup === 'passphrase' ? PASSPHRASE_SHARE_BY_STAKES[stakes] : 1)) * 100) / 100,
      ladderPull: Math.round((LADDER_PULL[stakes] * (LADDER_RANK[FAMILY[setup]] - 1)) * 100) / 100,
    };
    return {
      setup,
      family: FAMILY[setup],
      fit: Math.round((protection - costs.complexity - costs.sovereignty - costs.budget + costs.simplicityEdge + costs.ladderPull) * 1000) / 1000,
      gated: setup === 'passphrase' && selfWord === 'high',
      contributions, costs,
    };
  });
  rows.sort((a, b) => b.fit - a.fit);
  return rows;
}

// ── 6 · Legacy shim — ranked worries → a score vector ───────────────────────
// So saved plans and prefilled finders keep working while the assessment UI
// ships. Mapping: rank 1 lands in the concern's HIGH band, rank 2 in
// ELEVATED, rank 3 stays at the default (typical), rank 4+ drops to the low
// side; unranked concerns keep the default. 'unsure' moves nothing (and eats
// its rank slot — a #1 "honestly not sure" means the #2 pick was NOT the top
// worry, so it must not get rank-1 strength).
//
// The old 'theft' option spanned two buckets ("a remote hack, or a thief
// finding my backup"), so a top-two theft also lifts physical to the elevated
// floor — unless the user ranked 'targeted' explicitly, which then wins.

const RANK1_SCORE = { custodial: 55, 'self-loss': 70, remote: 70, physical: 35 };
const RANK2_SCORE = { custodial: 38, 'self-loss': 52, remote: 55, physical: 12 };
const WORRY_TO_CONCERN = {
  'self-loss': 'self-loss', exchange: 'custodial', theft: 'remote', targeted: 'physical',
};

export function shimScores(answers = {}) {
  const stakes = answers.stakes || 'meaningful';
  const d = defaultsFor(stakes);
  const scores = { ...d };
  const worries = Array.isArray(answers.worry) ? answers.worry : (answers.worry ? [answers.worry] : []);
  // Pass 1 — theft's physical spillover (explicit 'targeted' ranks overwrite it).
  const theftIdx = worries.indexOf('theft');
  if (theftIdx === 0 || theftIdx === 1) {
    scores.physical = Math.max(scores.physical, RANK2_SCORE.physical);
  }
  // Pass 2 — explicit ranks.
  worries.forEach((w, i) => {
    const c = WORRY_TO_CONCERN[w];
    if (!c) return; // 'unsure' (or unknown): keep the default, consume the slot
    if (i === 0) scores[c] = RANK1_SCORE[c];
    else if (i === 1) scores[c] = RANK2_SCORE[c];
    else if (i === 2) scores[c] = d[c];
    else scores[c] = Math.max(0, Math.round(d[c] - 1.5 * HALF_BAND[c]));
  });
  return scores;
}

// ── 7 · Computed reasons — the "because" lines ──────────────────────────────
// Generated from the primary's largest fit contributions, phrased per concern
// and per family. {word} interpolates the user's own word for that concern.

const REASON_TEXT = {
  custodial: {
    single: 'Your company-failure concern is {word} — and this setup answers it completely, on day one. The moment the keys are yours, no exchange can freeze your account, lose your coins, or take them down with it.',
    fork: 'Your company-failure concern is {word} — and any setup here answers it completely. The moment the keys are yours, no exchange can freeze your account, lose your coins, or take them down with it.',
  },
  'self-loss': {
    single: 'Your locking-yourself-out concern is {word}. The answer is fewer moving parts and a backup you have actually tested — one seed, restored once to prove it works, beats any clever extra secret.',
    fork: 'Your locking-yourself-out concern is {word}, and a 2-of-3 answers it structurally: lose any one key and the other two recover everything. On the collaborative path the service can even help replace a lost key.',
  },
  remote: {
    single: 'Your scams-and-remote-theft concern is {word}. A hardware wallet answers the part that matters most: the key never touches an internet-connected device, and every payment is confirmed on a screen no scammer can reach.',
    fork: 'Your scams-and-remote-theft concern is {word}. With 2-of-3, one phished or malware-compromised key still can’t move a single coin — the attack that empties a one-key wallet stops at the second signature.',
  },
  physical: {
    single: 'Your targeted-theft concern is {word}. At this level the setup stays simple and the win is a low profile: nothing at home needs to reveal what you hold, and the checklist’s privacy steps carry most of the weight.',
    fork: 'Your targeted-theft concern is {word}. Multisig is the strongest answer on record: with keys in separate places, nothing at the scene can move your coins — separation and delay have ended real attacks.',
  },
};

// § 6's custody-trade sentence — shown when custodial dominates the profile.
const CUSTODY_TRADE = 'One honest note: withdrawing to your own keys takes company failure to zero and transfers that risk to self-inflicted loss. Custody choice doesn’t remove risk — it chooses which risk. The checklist below is how you handle the one you’re choosing.';

// The § 6 exemplar holdback — computed, not hand-written per branch.
function passphraseHoldback(word) {
  return {
    concern: 'self-loss',
    text: `We deliberately did NOT add a passphrase. It defends against a found seed by adding a silent, unrecoverable way to lock yourself out — and locking yourself out is already your ${word} concern. A backup you have actually tested protects you here; another secret does not.`,
  };
}

// ── 8 · recommendV2 — the scored engine behind the same output shape ────────
//
// answers = the existing finder answer object (current, stakes, recovery,
// tech, sovereignty, worry) PLUS any of:
//   scores:          { custodial, 'self-loss', remote, physical }  (0–100)
//   checkedPrompts:  ['c-exchange', ...]        → scores derived via prompts
//   skippedSections: ['physical', ...]          → those keep the default
// Neither scores nor checkedPrompts present → shimScores(answers) (legacy).
//
// Returns { primary, secondary, journey } shaped exactly like quiz.js
// recommend(), extended with:
//   profile:   { scores, words, defaults, deltas }
//   reasons:   [{ text, concern, setup }]   — from the top fit contributions
//   holdbacks: [{ text, concern }]          — computed anti-add-on honesty
//   tie:       null | { a, b, margin, note } — C5 genuine either/or
//   fit:       the full fitFor() ranking (per-setup breakdowns for the UI)
//
// HARD GATES PRESERVED: single-sig cold is the floor for everyone (the engine
// only ever ranks the five ladder setups — "stay on the exchange" is not an
// outcome); the fork's lead is collaborative iff sovereignty is open-help AND
// tech is not technical, exactly as today (inherited by construction — see
// makeLegacyAnswers); sovereignty steers via SOV_COST; no dollar amounts.

function normalizedScores(answers) {
  if (answers.scores && typeof answers.scores === 'object') {
    const d = defaultsFor(answers.stakes || 'meaningful');
    const skipped = Array.isArray(answers.skippedSections) ? answers.skippedSections : [];
    const out = {};
    for (const c of CONCERN_KEYS) {
      const v = answers.scores[c];
      out[c] = skipped.includes(c) || typeof v !== 'number'
        ? d[c]
        : Math.min(100, Math.max(0, Math.round(v)));
    }
    return out;
  }
  if (Array.isArray(answers.checkedPrompts)) {
    return scoreFromPrompts(answers.checkedPrompts, answers.stakes || 'meaningful',
      Array.isArray(answers.skippedSections) ? answers.skippedSections : []);
  }
  return shimScores(answers);
}

/**
 * Synthesize a legacy answer object that forces quiz.js recommend() to emit
 * the card structure for the family the fit engine chose. The card COPY that
 * depends on answers we fake gets replaced (why / holdback); everything real
 * flows through untouched: current (→ journey), tech + stakes (→ device
 * pairs), sovereignty + tech (→ fork lead, the preserved gate), recovery
 * (→ the fork's inheritance note).
 */
function makeLegacyAnswers(family, a) {
  const worry = Array.isArray(a.worry) && a.worry.length ? a.worry : ['unsure'];
  if (family === 'passphrase') {
    // RUNG 2 of the ladder, and it has a real card in quiz.js already — the
    // gap was never the copy, it was that nothing could ever reach it. That
    // card fires on worry 'theft'/'targeted' provided the multisig gate is not
    // tripped, so:
    //   worry  → 'targeted'  (the honest mapping: the fit engine only ever
    //            ranks passphrase first when PHYSICAL is elevated and
    //            self-loss sits at the bottom — which is precisely "someone
    //            coming after me", and it makes the card's own why-copy true)
    //   stakes → 'meaningful' (serious/lifechanging trip wantsMultisig and
    //            would bounce us into the fork. The passphrase card reads only
    //            `tech` for its device pair and never reads stakes, so the
    //            card content is identical — nothing real is lost.)
    // current/tech/recovery flow through untouched, so journey framing and the
    // device pick stay honest.
    return { ...a, worry: ['targeted'], stakes: 'meaningful' };
  }
  if (family === 'fork') {
    // 'lifechanging' is the one stakes value that always forks in the old
    // engine; fork content never reads stakes, so nothing else shifts.
    return { ...a, worry, stakes: 'lifechanging' };
  }
  // single family. Keep real stakes for the device economics — except
  // lifechanging (always forks in the old engine), which maps to 'serious'
  // (same big-stakes device tier). Worry 'unsure' selects the worry-neutral
  // copy branch; recovery 'heirs' at serious would trigger the old multisig
  // rule, so it degrades to 'partner' (identical behavior in every branch the
  // single-sig card actually reads).
  const stakes = a.stakes === 'lifechanging' ? 'serious' : (a.stakes || 'meaningful');
  const recovery = stakes === 'serious' && a.recovery === 'heirs' ? 'partner' : (a.recovery || 'just-me');
  return { ...a, worry: ['unsure'], stakes, recovery };
}

// The step-up (2nd-choice) card, computed from the profile rather than from a
// worry ranking. Same shape as quiz.js secondaries: {rungSlug, rungLabel,
// headline, when}.
function secondaryFor(runnerUp, words, answers) {
  const S = (rungSlug, rungLabel, headline, when) => ({ rungSlug, rungLabel, headline, when });
  if (!runnerUp) return null;

  // The second choice is now WHATEVER SCORED SECOND — the runner-up family from
  // the same ranking that chose the primary — instead of a hand-written rule
  // per primary. Reason it changed (2026-08-01): the old version was the only
  // part of the result no weighting could influence. Sweeping every scoring
  // lever moved the second choice by exactly zero, because it was never reading
  // the scores. One engine now explains both cards, so a reader who disagrees
  // with the second choice is disagreeing with something their own answers
  // actually produced.
  //
  // Copy is still authored per destination — a card needs a headline and a
  // "when" — but WHICH card appears is derived, never decided here.
  const sov = answers.sovereignty;
  switch (runnerUp.setup) {
    case 'single-sig':
      return S('single-sig', 'Single-sig cold storage', 'Keep it to one key',
        'The simpler alternative, and an honest one: one key, one backup, nothing else to manage or forget. It scored close enough here to be a real option — it asks the least of you, and for most holders it is the right home for a long time. Take it if the setup above feels like more than you want to run, and know what you are trading: the protection the first card adds is protection this does not have.');
    case 'passphrase':
      return S('passphrase', 'Single-sig + passphrase', 'Add a passphrase (the “25th word”)',
        'The step that stays on one device: a phrase only you know is mixed in on top of your seed, so a seed someone finds — or one your device generated badly — opens only a small decoy wallet, not the real balance. Take it on once you are confident you can back the passphrase up as carefully as the seed itself, because forgetting it loses everything.');
    case 'collaborative':
      return S('collaborative', 'Collaborative custody (2-of-3)', 'Let a service hold one key',
        'The same 2-of-3 protection with far less for you to run: a Bitcoin-only service holds one of the three keys as a safety net, and recovery — including for your heirs — is built in by design. The trade is trust and privacy: most require ID verification, and you are bringing an outside institution into your setup.');
    case 'three-of-five':
      return S('multisig', '3-of-5 multisig', 'Spread the keys wider (3-of-5)',
        'As holdings grow, a self-run 3-of-5 across separate locations tolerates more lost or stolen keys before anything is at risk — the same self-sovereign technology as a 2-of-3, just more keys and more resilience. No company required, and more to manage.');
    case 'multisig':
    default:
      if (sov === 'pure') {
        return S('multisig', '2-of-3 multisig', 'Step up to 2-of-3 multisig',
          'Three keys, any two together can move or recover your coins, so no single lost, stolen, or coerced key can strand you — and nothing depends on a secret you have to remember. Run it entirely yourself, no company involved.');
      }
      return S('multisig', '2-of-3 multisig', 'Step up to 2-of-3 multisig',
        'When a single point of failure starts keeping you up at night, 2-of-3 multisig removes it: three keys, any two together can move or recover your coins. You can run it entirely yourself — no company involved — or let a Bitcoin service hold one key; both paths are laid out, equally, when you get there.');
  }
}

export function recommendV2(answers = {}) {
  const stakes = STAKES_FACTOR[answers.stakes] ? answers.stakes : 'meaningful';
  const scores = normalizedScores(answers);
  const d = defaultsFor(stakes);
  const words = {};
  const deltas = {};
  for (const c of CONCERN_KEYS) {
    words[c] = scoreWord(scores[c], c, stakes);
    deltas[c] = scores[c] - d[c];
  }

  // ── rank + gates ──
  const ranking = fitFor(scores, { ...answers, stakes });
  // C4: passphrase out of primary at elevated+ self-loss. LEARNING CONTINUITY
  // GATE: at learning stakes the primary stays in the single family — the old
  // engine's explicit rule ("low stakes change the budget, not the setup"),
  // kept because pushing someone still learning into multisig trades their
  // named risks for the complexity risk they are least equipped to carry. The
  // fork remains one card away, as the step-up.
  //
  // THE GATE COVERS THE PASSPHRASE TOO (added 2026-07-31 with the reachability
  // change). It used to say `family === 'fork'`, which was complete only while
  // passphrase could never win anything — the moment it became reachable, that
  // wording let it through, and the full-grid diff caught it recommending a
  // passphrase to 2,430 learning-stakes combinations. That is the single worst
  // place on the site to add a secret with a silent, unrecoverable failure
  // mode: the legacy learning card refuses one in so many words ("every extra
  // secret is one more thing to lose while you are still learning"), and a
  // novice is the reader least able to carry it. Gate by "is this the simple
  // family", not by naming one rival.
  const eligible = ranking.filter(
    (r) => !r.gated && !(stakes === 'learning' && r.family !== 'single')
  );
  const fitLeader = eligible[0];

  // ── C5 near-tie: the best-scoring ELIGIBLE setup from a DIFFERENT family ──
  // Deliberately computed against `eligible`, so it mirrors BOTH primary gates.
  // A near-tie is presented as "either of these is right, your call" — which is
  // only honest about a setup we would actually let lead. At learning stakes the
  // fork is barred from the primary on purpose, so it is offered underneath as a
  // step-up for later, never as an equal alternative today. The second card
  // still appears there; it just is not framed as a coin-flip.
  const fitRival = eligible.find((r) => r.family !== fitLeader.family);
  const isTie = Boolean(fitRival && fitLeader.fit - fitRival.fit < TIE_MARGIN);

  // ── C6 ties resolve UPWARD, but ONLY away from bare single-sig ───────────
  // When two setups land within a hair of each other the arithmetic is not the
  // thing deciding it — noise is. So the tiebreak is a POLICY, not a number.
  //
  // SCOPE (narrowed 2026-07-31, deliberately): the policy fires only when the
  // fit leader is SINGLE-SIG. That is the one rung with no layer at all — one
  // key, one seed, nothing behind it — so a coin-flip between "bare" and
  // "bare + a layer" should not land on bare. A passphrase in particular is a
  // cheap upgrade on one device that answers seed exposure and theft, which is
  // exactly the trade worth defaulting to when it is close.
  //
  // It does NOT fire between two already-layered setups (passphrase vs the
  // multisig fork). Both carry real protection and real cost, the choice
  // between them is a genuine preference, and forcing the more complex one
  // there would be complexity for its own sake rather than covering a bare
  // risk. Those ties keep the fit order and are presented as the either/or
  // they are.
  //
  // "Simplest that adequately covers you" still governs everywhere the scores
  // actually separate; this only decides which of two near-equals is presented
  // FIRST, and the copy says plainly that either is right.
  // The rival must itself be eligible to LEAD. At learning stakes the fork can
  // be the near-tie and the step-up card, but it must never be promoted to
  // primary — that gate is the whole reason a novice is not sent to multisig.
  const upgradeFromBare = isTie
    && fitLeader.family === 'single'
    && LADDER_RANK[fitRival.family] > LADDER_RANK[fitLeader.family]
    && eligible.includes(fitRival);
  const top = upgradeFromBare ? fitRival : fitLeader;
  const family = top.family;
  const rival = isTie ? (top === fitLeader ? fitRival : fitLeader) : fitRival;

  const tie = isTie
    ? {
        a: top.setup, b: rival.setup,
        margin: Math.round(Math.abs(fitLeader.fit - fitRival.fit) * 1000) / 1000,
        upgraded: top !== fitLeader,
        note: top !== fitLeader
          ? 'These two are a genuine either/or — both setups fit your picture, and neither is the wrong answer. They scored within a hair of each other, so we led with the more protective one rather than the simpler one: when it is that close, the safer default is the one worth justifying. Read both, and the reasons under each, then pick the one that feels right for you.'
          : 'These two are a genuine either/or — both setups fit your picture, and neither is the wrong answer. Read both, and the reasons under each, then pick the one that feels right for you. The first is ahead by a hair, not by a mile.',
      }
    : null;

  // ── the card structure, from the legacy engine (fork paths, device pairs,
  //    journey framing — everything the current UI renders) ──
  const legacy = recommend(makeLegacyAnswers(family, { ...answers, stakes }));
  const primary = legacy.primary;
  const journey = legacy.journey;

  // ── computed reasons (the profile explains the pick) ──
  const isElevated = (c) => words[c] === 'elevated' || words[c] === 'high';
  const topRow = ranking.find((r) => r.setup === top.setup);
  const named = topRow.contributions
    .filter((x) => x.weight > 0 && isElevated(x.concern))
    .sort((a, b) => b.points - a.points)
    .slice(0, 3);
  const reasons = named.map((x) => ({
    concern: x.concern,
    setup: primary.rungSlug,
    text: REASON_TEXT[x.concern][family === 'fork' ? 'fork' : 'single'].replace('{word}', words[x.concern]),
  }));
  if (!reasons.length) {
    reasons.push({
      concern: null, setup: primary.rungSlug,
      text: 'Nothing in your assessment stands out from the typical holder’s picture — and for that picture, the simplest setup that covers it wins. Most real-world loss is self-inflicted or scams, and both are answered by a tested backup and the habits in the checklist.',
    });
  }
  // The custody-trade sentence, when company failure dominates the profile.
  const maxScore = Math.max(...CONCERN_KEYS.map((c) => scores[c]));
  if (words.custodial === 'high' && scores.custodial === maxScore) {
    reasons.push({ concern: 'custodial', setup: primary.rungSlug, text: CUSTODY_TRADE });
  }

  // ── computed holdbacks (anti-add-on honesty, per the user's own scores) ──
  const holdbacks = [];
  if (isElevated('self-loss')) {
    if (family === 'single') holdbacks.push(passphraseHoldback(words['self-loss']));
    if (family === 'fork') {
      holdbacks.push({
        concern: 'self-loss',
        text: `We stopped at 2-of-3 — no passphrase on top, no fourth or fifth key. Every extra secret and every extra key is another way to lock yourself out, and locking yourself out is already your ${words['self-loss']} concern. Two-of-three removes the single point of failure; going further would put one back.`,
      });
    }
  } else if (family === 'single' && isElevated('remote')) {
    holdbacks.push({
      concern: 'remote',
      text: 'We deliberately did NOT add a passphrase. It defends a found seed, not a fooled owner — the scams your assessment flags are answered by verifying on the device’s own screen and trusting no one who contacts you first, and those live in the checklist, not in extra secrets.',
    });
  } else if (family === 'single') {
    holdbacks.push({
      concern: 'self-loss',
      text: 'We deliberately did NOT add a passphrase or a second key. Nothing in your assessment calls for them — the thing that protects you at this level is a backup you have actually tested, and every extra moving part is one more thing to lose.',
    });
  } else if (family === 'passphrase') {
    // The passphrase card MUST carry its own cost in the reader's face. The
    // legacy card had this warning; recommendV2 overwrites primary.holdback
    // from this computed list, so without a branch here the one setup with a
    // documented silent-failure mode would ship the ONLY holdback-free result
    // on the site. It is recommended here precisely because self-loss scored
    // low — which is a statement about them today, not a guarantee.
    holdbacks.push({
      concern: 'self-loss',
      text: 'The honest cost of this one: a passphrase is a brand-new way to lose everything. Forget it and the seed alone will not save you — there is no error message, just an empty wallet. We are recommending it because locking yourself out scored low for you, so this is the trade you can afford. It only stays true if you back the passphrase up as carefully as the seed itself, and somewhere separate from it.',
    });
  } else if (family === 'fork' && isElevated('physical')) {
    // THE SILENT CASE. When self-loss is NOT elevated, none of the branches
    // above fire — so a reader whose physical risk pushed them to multisig was
    // shown three devices with NO explanation of why the simpler one-device
    // answer (a passphrase, which their own ladder teaches as the duress rung)
    // was not it. Every other path explains its holdback; this one just went
    // quiet. Silence reads as "nobody considered it."
    holdbacks.push({
      concern: 'physical',
      text: `We did consider a passphrase — it is the simpler answer to ${words.physical} physical risk, and a hidden wallet is a real defence. We went with separate keys instead because a passphrase still leaves one device holding everything, and it only protects you for as long as you can keep defending a secret in person. Keys in different places do not depend on that.`,
    });
  }

  // The primary card renders one holdback string (legacy shape); the full
  // structured list rides alongside for the Phase C result page. Fork cards
  // keep holdback null exactly like today (the fork band has no holdback slot).
  if (!primary.fork) primary.holdback = holdbacks.length ? holdbacks[0].text : null;

  // The runner-up is the best-scoring setup from a DIFFERENT family than the
  // primary. Different family, because the fork card already shows the DIY and
  // collaborative paths side by side — offering the other half of a card the
  // reader is already looking at is not a second choice.
  //
  // The C4 passphrase gate applies here too — a passphrase is never offered as
  // the step-up when locking yourself out is elevated, or the primary card's
  // holdback would argue with the card directly beneath it.
  //
  // The LEARNING-stakes gate deliberately does NOT apply. It exists to keep a
  // novice's PRIMARY in the single family, and its own rule has always been
  // that "the fork remains one card away, as the step-up" — so filtering it out
  // here would delete the second choice entirely at learning stakes rather than
  // demote it, which is the opposite of what that gate is for.
  // ── the second card: best score among ADJACENT rungs ────────────────────
  // Still score-derived — but chosen from the primary's LADDER NEIGHBOURS
  // first, rather than from the whole board.
  //
  // Why adjacency (2026-08-01): "next-best family by score" skipped a rung in
  // 46.8% of results. It offered "multisig, or bare single-sig" and "single-sig,
  // or hand a key to a company" — two cards that quietly behave as if the rung
  // between them did not exist. The ladder is the site's whole mental model of
  // this decision, so two options a reader is asked to choose between should be
  // neighbours on it; jumping the middle rung reads as if we forgot it.
  //
  // A skip is still possible and still correct when the middle rung is GATED —
  // most often the passphrase, barred by C4 because locking yourself out is the
  // reader's elevated concern. That case is deliberate and the primary card
  // already carries a holdback saying so in words, so the reader is told why
  // rather than left to notice the gap.
  const primaryRung = LADDER_RANK[family];
  const otherFamilies = ranking.filter((r) => !r.gated && r.family !== family);
  const adjacent = otherFamilies.filter((r) => Math.abs(LADDER_RANK[r.family] - primaryRung) === 1);
  const runnerUp = adjacent[0] || otherFamilies[0] || null;
  const secondary = secondaryFor(runnerUp, words, { ...answers, stakes });

  return {
    primary,
    secondary,
    journey,
    profile: { scores, words, defaults: d, deltas },
    reasons,
    holdbacks,
    tie,
    fit: ranking,
  };
}
