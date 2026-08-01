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
    // THE QUESTION IS ABOUT A MEANINGFUL SHARE, not about having an account.
    // Almost every holder has SOME Bitcoin on an exchange, so asked loosely this
    // section climbed for readers whose savings were already cold. What the
    // Mt. Gox and FTX losses have in common is not that people had an account;
    // it is how much of their stack was in it.
    //
    // NOTE FOR EXPECTED_RAW: the custodial estimate of 22 was reasoned from
    // "most holders still have some on an exchange". Under the narrower wording
    // that prevalence is LOWER, so 22 is now the softest number in a set of soft
    // numbers and should be revisited when the bundle is next calibrated.
    blurb: 'A meaningful share of your Bitcoin sitting with an exchange or custodian that goes under, freezes your account, or loses your coins — the Mt. Gox to FTX class of loss. Small change on an app is not what this is about.',
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
    key: 'stakes',
    label: 'How much is riding on this',
    blurb: 'What losing it would actually cost you — not an amount, the consequence. The more that is riding on it, the more protection is worth its cost.',
    // Like `exposure`, a preference rather than a frequency: seeded by the
    // stakes ANSWER. It used to be a multiplier scattered across four different
    // terms (a complexity discount, a device-budget discount, a shrinking
    // simplicity bonus, and a ladder pull). Scored as a row instead, it is
    // visible, tunable in one place, and cannot double-count itself.
    preference: true,
  },
  {
    key: 'exposure',
    label: 'Being known to hold Bitcoin',
    blurb: 'Who can tie you to your coins, and how much they can see — ID checks that end up in a database, a service that can be compelled, a permanent link between your name and your balance, or a seed that reveals everything you own the moment someone gets it.',
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

// FOUR entries, not five. `exposure` deliberately has no stakes-based default:
// it is seeded by the SOVEREIGNTY answer instead (EXPOSURE_BY_SOV, below).
//
// It briefly carried a neutral 50 here so the shape stayed whole, and that was
// a real bug rather than a tidy placeholder. The engine amplifies a score's
// DEVIATION from its default — so a caller passing the neutral 50 against a
// sovereignty-derived default of 20 read as "this reader deliberately raised
// it", and the passphrase's exposure score came out HIGHEST for the reader who
// had just said they mind exposure LEAST. Backwards, and invisible until the
// contributions were printed side by side.
const DEFAULTS = {
  small: { custodial: 33, 'self-loss': 30, remote: 35, physical: 2 },
  mid:   { custodial: 20, 'self-loss': 35, remote: 40, physical: 5 },
  large: { custodial: 10, 'self-loss': 35, remote: 35, physical: 20 },
};

// `exposure` is seeded by the SOVEREIGNTY answer, not by stakes — the reader
// already tells us how much they mind a third party, and until now that answer
// was spent on a flat cost multiplier applied to one setup plus a hard gate
// deciding which path led a card. Both were the model compensating for a
// concern it could not express. Scored, it behaves like every other answer:
// it moves a bar, and the bar moves the recommendation.
export const EXPOSURE_BY_SOV = { pure: 85, 'lean-self': 55, 'open-help': 20 };

// The stakes answer as a 0–100 score. Deliberately reaching the top of the
// scale: this row carries roughly double the weight of the others (0 / 2.5 / 5
// / 6 against their 0–3), which is what "more at stake justifies more
// protection" looks like when it is stated rather than implied.
export const STAKES_SCORE = { learning: 0, meaningful: 40, serious: 75, lifechanging: 100 };

// Consequence-of-loss answer → default band. 'serious' is still "mid": the
// design's large band is $1M+/public-footprint territory, which maps to
// life-changing consequence, not "a big chunk of my savings".
const STAKES_BAND = { learning: 'small', meaningful: 'mid', serious: 'mid', lifechanging: 'large' };

export function defaultsFor(stakes, sovereignty) {
  const d = { ...DEFAULTS[STAKES_BAND[stakes] || 'mid'] };
  // Exposure's default is the sovereignty answer, so it only appears once the
  // caller says which answer was given. Callers that omit it get the four
  // research-based concerns and nothing invented.
  if (sovereignty && EXPOSURE_BY_SOV[sovereignty] !== undefined) d.exposure = EXPOSURE_BY_SOV[sovereignty];
  if (STAKES_SCORE[stakes] !== undefined) d.stakes = STAKES_SCORE[stakes];
  return d;
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

export const HALF_BAND = { custodial: 10, 'self-loss': 10, remote: 10, physical: 4, exposure: 15, stakes: 20 };

export function scoreWord(n, concern, stakes = 'meaningful', sovereignty = 'lean-self') {
  const d = defaultsFor(stakes, sovereignty)[concern];
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
    statement: 'A meaningful share of my Bitcoin sits on an exchange or app, not in a wallet I control.',
    why: 'Roughly six in ten exchanges ever launched have closed. While a company holds the keys, its problems are your problems.',
  },
  {
    id: 'c-multicoin', concern: 'custodial', weight: 'small',
    statement: 'The place holding that share also sells lots of other coins and tokens.',
    why: 'The multi-coin, trading-first profile is the FTX profile — trading businesses fail differently than vaults do.',
  },
  {
    id: 'c-yield', concern: 'custodial', weight: 'large',
    statement: 'Some meaningful part of my Bitcoin is earning interest or “rewards”.',
    why: 'Every 2022 bankruptcy that froze retail funds was a yield platform. Yield means your coins are out working — and not for you.',
  },
  {
    id: 'c-audit', concern: 'custodial', weight: 'small',
    statement: 'I couldn’t say who audits the platform holding it, or whether it publishes proof of reserves.',
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

// ── THE EXPECTED BUNDLE — what the typical holder actually carries ──────────
//
// The defaults above are a SHARE of expected loss for a typical holder, and
// they sum to 100. The bug this fixes: prompts only ever added, so checking
// nothing scored the default exactly — which silently asserted that the
// typical holder carries ZERO risk factors. That is the one thing we know is
// false. Everyone drained on 30 July had at least one.
//
// It also made a walked-and-cleared section indistinguishable from a SKIPPED
// one, and those are opposite signals from the reader.
//
// So the baseline needs a model of what the typical holder has. EXPECTED_RAW
// is that model, in the same raw-weight points the prompts accumulate: the
// prevalence-weighted sum of each section's prompts. Score above it and the
// bar rises; below it and the bar falls; hit it exactly and you sit on the
// published default, which is what "typical" is supposed to mean.
//
// WHY POINTS AND NOT A COUNT: prompts carry small/medium/large weights, so
// "three of eight" describes different people depending on which three.
//
// HOW THESE WERE ESTIMATED, and how solid each is. Four prompts carry a
// published prevalence in their own receipt (s-forgot ~40%, s-nobody-knows
// ~87%, r-quick 80%, and c-exchange's figure is about EXCHANGES failing, not
// about readers, so it is NOT usable here). The remaining 28 are house
// estimates of how common the situation is among self-custody holders. They
// are estimates, they are the softest numbers in this engine, and
// /how-we-weigh-risk must publish them as estimates rather than as research.
//
//   custodial 22 of 74 available — most holders still have some on an
//     exchange and few can name their auditor, but our mid-stakes reader is
//     mid-migration by construction
//   self-loss 42 of 88 — deliberately the highest share, because this is the
//     thing holders are genuinely worst at: the large majority have never
//     test-restored, and ~87% have told nobody
//   remote 36 of 108 — driven by near-universal overconfidence (r-quick's
//     own 80%) and ordinary habits like app-store searching
//   physical 22 of 84 — the lowest, matching physical's small default share;
//     most holders are known to somebody but very few are targets
//
// EVERY VALUE HERE IS EVEN, and must stay even. WEIGHT_POINTS are 6/10/16, so
// an odd target is unreachable by any combination of prompts — which would
// make C6 untestable end-to-end and reduce it to checking the formula against
// itself. Estimated 35 and 23 for remote and physical; both moved one point
// to the nearest reachable sum, which is far inside these numbers' real
// uncertainty. If a prompt weight ever becomes odd, this constraint relaxes.
//
// NOT STAKE-SHIFTED, deliberately. The stake bands already move the DEFAULT.
// Shifting the expected bundle as well would let stakes move the same bar
// twice — the exact double-count this file already had to strip out of the
// gain term and the sovereignty cost.
export const EXPECTED_RAW = { custodial: 22, 'self-loss': 42, remote: 36, physical: 22 };

// Where a fully-cleared section lands, as a fraction of that concern's
// default. Not zero: a careful holder still retains irreducible exposure —
// you can still be scammed, hardware still fails, and you can still die
// without a plan. Nothing here goes to nothing.
//
// 0.3 is chosen so a cleared section reads 'low' rather than 'typical' on the
// word scale — it must land below d − HALF_BAND or the reader gets no signal
// back for having answered honestly.
const FLOOR_FRAC = 0.3;

// PHYSICAL floors at zero instead. Its half-band (4) is almost its whole
// default (5), so 'low' means "below 1" — a 30% floor could never reach it
// and the bar would read 'typical' for someone with no targeting factors at
// all. Flooring at zero is also the honest reading: a holder nobody can
// connect to bitcoin is not a target. This is a quirk of physical's tiny
// share in the word scale, not something the expected-bundle model creates.
const floorFor = (concern, dc) => (concern === 'physical' ? 0 : Math.round(dc * FLOOR_FRAC));

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
  // SECTION_ORDER, not CONCERN_KEYS. This function derives scores from PROMPTS,
  // and only the four walked risks have any — the other two come from questions
  // the reader answered directly, so this has nothing to say about them.
  //
  // Iterating every concern emitted `stakes: null` and `exposure: null`, and an
  // explicit null is not the same as an absent key: it travelled into the engine
  // as a supplied value, resolved differently from a genuine default, and made
  // the page recommend single-sig where a direct call recommended multisig for
  // identical answers. Omit what you do not know; do not report it as null.
  for (const c of SECTION_ORDER) {
    // A SKIPPED section keeps the standard estimate. This is now meaningfully
    // different from a section walked and cleared, which lands at the floor —
    // before the expected bundle they were the same number, so the engine
    // could not tell "none of this is me" from "I did not answer".
    if (skippedSections.includes(c)) { scores[c] = d[c]; continue; }

    const expected = EXPECTED_RAW[c] || 0;
    const excess = raw[c] - expected;

    if (excess >= 0) {
      // ABOVE the typical bundle — saturating toward the band ceiling, so
      // there is always somewhere further to go and the bar never reads 100.
      scores[c] = Math.round(d[c] + (CEILING[c] - d[c]) * (excess / (excess + H_SAT[c]) || 0));
    } else {
      // BELOW it — LINEAR to the floor, not saturating. Deliberately
      // asymmetric: exposure has no natural limit, but safety does, and the
      // floor is a place you can actually arrive at. It also makes the scale
      // explainable in one sentence on /how-we-weigh-risk: clear the whole
      // section and you sit at the floor, carry the typical bundle and you
      // sit on the published default.
      const floor = floorFor(c, d[c]);
      scores[c] = Math.round(d[c] - (d[c] - floor) * (expected ? -excess / expected : 0));
    }
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

// THE SELF-LOSS COLUMN, rebuilt 2026-08-01 around what actually protects you
// from locking yourself out — REDUNDANCY — rather than around making the
// constraints pass.
//
// It used to read single-sig 1, multisig 0, which asserted that ONE key
// protects you against lockout better than THREE do. That is false on its face:
// a 2-of-3 survives losing any single key, and a lone seed survives nothing.
// The 0 existed because multisig's setup complexity is a real lockout risk and
// the column was netting the two effects into one number — so the redundancy
// disappeared and only the complexity showed. Complexity already has its own
// cost term; it does not need to be charged twice.
//   single-sig 0.5  one seed, no redundancy at all — a tested backup is the
//                   only thing standing between you and a total loss
//   passphrase -0.5 strictly worse than single-sig: one more secret, and the
//                   only one whose failure is silent
//   multisig 2      lose any one key and you are still fine
//   3-of-5 2.5      lose any two
//   collaborative 3 redundancy PLUS a service whose job is helping you recover
export const PROTECTION = {
  //                custodial  self-loss  remote  physical  exposure  stakes
  'single-sig':    { weights: { custodial: 3, 'self-loss': 1, remote: 1,   physical: 0,   exposure: 3,    stakes: 0   }, complexity: 0, devices: 1 },
  passphrase:      { weights: { custodial: 3, 'self-loss': 0, remote: 2,   physical: 2,   exposure: 3,    stakes: 2   }, complexity: 0, devices: 1 },
  multisig:        { weights: { custodial: 3, 'self-loss': 2, remote: 2.5, physical: 2.5, exposure: 3,    stakes: 5   }, complexity: 2, devices: 3 },
  collaborative:   { weights: { custodial: 3, 'self-loss': 2.5, remote: 3, physical: 3,   exposure: -0.5, stakes: 5.5 }, complexity: 1, devices: 2 },
};


// FOUR setups, one per ladder rung. 3-of-5 was scored here as a fifth option
// until 2026-08-01 and is not any more: it is a SIZE of do-it-yourself
// multisig, not a rung of its own, and scoring it separately let it compete
// against its own rung — which is how the result page ended up able to show
// "multisig" as both the first and the second choice. The teaching about 3-of-5
// stays on the ladder lesson where it belongs; the recommendation says
// multisig, and how many keys is a decision inside that.
export const SETUP_KEYS = Object.keys(PROTECTION);

// Which LADDER RUNG a setup sits on. One entry per rung, and every rung is
// scored on its own merits.
//
// It used to collapse DIY multisig, collaborative custody and 3-of-5 into a
// single 'fork', so the two could never place 1st and 2nd against each other,
// and which of them LED was decided by a hard rule on the sovereignty answer
// rather than by their scores. That was the model compensating for a concern it
// could not express — now that third-party exposure is scored, collaborative
// can compete honestly and lose honestly.
//
// 2-of-3 and 3-of-5 DO still share rung 3: they are the same idea at two sizes,
// not two rungs. Which one shows is a fit result between them.
export const FAMILY = {
  'single-sig': 'single', passphrase: 'passphrase',
  multisig: 'multisig', collaborative: 'collaborative',
};

// Each family's position ON THE LADDER (/learn/ladder rungs 1–4), which is the
// site's own ordering of protection: single-sig cold → + passphrase → multisig
// → collaborative. The fork's two rungs share a rank because they are presented
// as two equal paths, never as a hierarchy. Used ONLY to resolve near-ties
// upward (C6) — it never reorders anything the scores actually separated.
export const LADDER_RANK = { single: 1, passphrase: 2, multisig: 3, collaborative: 4 };

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
//  C4 anti-passphrase honesty — a DISCLOSURE, not a prohibition: self-loss at
//     or above 'elevated' → if a passphrase still wins on score, the result
//     must carry a computed caveat naming the reason. Nothing is banned.
//     (This entry described a hard gate out of primary and the step-up card
//     long after the gates were removed and the harness had been rewritten to
//     assert disclosure — the contract block is the one place that must not
//     drift, because it is what a reader trusts instead of reading the code.)
//  C5 near-ties: top two distinct families within TIE_MARGIN → the result is
//     flagged as a genuine either/or (result.tie), never a false winner.
//  C6 the expected bundle: a reader carrying the typical holder's bundle of
//     risk factors scores the published default EXACTLY; a reader who walks a
//     section and clears it scores below it and reads 'low'; and clearing is
//     never the same as skipping. Guards the meaning of the baseline itself.
//  C7 simplest PLUS ONE — the house bias: the guide recommends the simplest
//     ADEQUATE rung, then leans one step past it, because unknown risks exist
//     and a stack is worth more in four years than today. Asserted against a
//     reader who cleared the whole assessment: above learning stakes they
//     never land on the bare floor, the rung never falls as stakes rise, and
//     LEARNING is exempt — the +1 there is a passphrase, and a silent lockout
//     is the failure a beginner is least equipped to survive. This held by
//     accident, falling out of the stakes weights and asserted nowhere,
//     until it was written down.

const DEVIATION_GAIN = 1.6;
// FLAT. It used to fade as stakes rose, which was one of four places stakes
// quietly multiplied something. Stakes is a scored row now; letting it also
// shrink this would count it twice.
const SIMPLICITY_EDGE = 1.0;
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
// The passphrase keeps most of the simplicity bonus — it is genuinely one
// device with no coordinator — but not ALL of it. It is the second-simplest
// setup, not the simplest: there is one more secret than bare single-sig, and
// the bonus represents "simplest thing that covers you". At a full share it
// took the untouched default away from single-sig, which is not a tuning
// artefact so much as the number claiming something untrue.
const SIMPLICITY_SHARE = { 'single-sig': 1, passphrase: 0.7 };
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



const TECH_FACTOR = { simple: 0.9, careful: 0.65, technical: 0.4 };

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
// Flat: extra hardware costs what it costs, whatever is at stake.
const BUDGET_FACTOR = 0.15;
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
  const stakes = STAKES_SCORE[answers.stakes] !== undefined ? answers.stakes : 'meaningful';
  const tech = TECH_FACTOR[answers.tech] ? answers.tech : 'careful';
  const sov = SOV_VALUES[answers.sovereignty] ? answers.sovereignty : 'lean-self';
  const d = defaultsFor(stakes, sov);
  // `exposure` defaults to whatever the sovereignty ANSWER implies, not to the
  // neutral 50 in DEFAULTS — that neutral only exists so the shape stays whole
  // for callers that pass no answers. An explicit score always wins, so a
  // reader who nudges the bar on the review screen overrides their own earlier
  // answer, exactly as they can for the other four.
  const dEff = { ...d };

  const eff = {};
  for (const c of CONCERN_KEYS) {
    const s = typeof scores[c] === 'number' ? scores[c] : dEff[c];
    eff[c] = Math.min(100, Math.max(0, dEff[c] + DEVIATION_GAIN * (s - dEff[c]))) / 100;
  }
  const rows = SETUP_KEYS.map((setup) => {
    const P = PROTECTION[setup];
    const contributions = CONCERN_KEYS.map((c) => ({
      concern: c, weight: P.weights[c], eff: eff[c],
      points: Math.round(P.weights[c] * eff[c] * 100) / 100,
    }));
    const protection = contributions.reduce((t, x) => t + x.points, 0);
    const costs = {
      complexity: Math.round(P.complexity * TECH_FACTOR[tech] * COMPLEXITY_BASE * 100) / 100,
      sovereignty: 0,
      budget: Math.round((P.devices - 1) * BUDGET_FACTOR * 100) / 100,
      simplicityEdge: Math.round((SIMPLICITY_EDGE * (SIMPLICITY_SHARE[setup] || 0)) * 100) / 100,
      ladderPull: 0,
    };
    return {
      setup,
      family: FAMILY[setup],
      fit: Math.round((protection - costs.complexity - costs.sovereignty - costs.budget + costs.simplicityEdge + costs.ladderPull) * 1000) / 1000,
      // NO HARD GATES. Every setup competes on score alone — the negative
      // self-loss weight is what argues against a passphrase for a reader who
      // is likely to forget, and it argues proportionally instead of absolutely.
      // A ban cannot express "somewhat", and every one of these risks is a
      // matter of degree.
      gated: false,
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
  const d = defaultsFor(stakes, answers.sovereignty);
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

// ── CAVEATS — the other half of an honest result ─────────────────────────────
// A recommendation is the setup that scored best OVERALL. That is not the same
// as it being good at everything, and where it is weak on something the reader
// told us they care about, the result has to say so in its own words.
//
// This replaces a set of hand-written holdbacks that only knew about the
// passphrase, and it replaces the hard gates entirely. The gates used to
// SUPPRESS contradictory outcomes; a caveat DISCLOSES them, which is both more
// honest and more useful — the reader can weigh it, where a gate just quietly
// removed an option and told them nothing.
//
// Fires when: the chosen setup's weight on a concern is materially worse than
// the best available, AND the reader rates that concern elevated or high.
// REACHABILITY IS ASSERTED (verify-finder.mjs). Every key here must be able to
// fire for at least one setup, and every concern whose gap can reach CAVEAT_GAP
// must have a key. Two entries were dead when this was written and are gone:
//
//   custodial — all four setups weigh it 3, because they all answer it
//     completely the moment the keys are yours. The gap can never reach 1.2, so
//     this string could never render.
//   exposure (the non-custodial wording) — only `collaborative` has a gap on
//     exposure, and the key-swap below always sends collaborative to
//     `exposureCustodial`. Unreachable by construction.
//
// Dead copy on a page that argues for a living is worse than no copy: it reads
// as covered when nothing covers it.
export const CAVEAT_TEXT = {
  'self-loss': 'The trade you are making: this is the weakest option here for locking yourself out, and you rated that {word}. It leans on you getting the backup right — and, if it has a passphrase, on remembering something whose failure is silent. Test your recovery before you trust it with real money.',
  remote: 'The trade you are making: this does less against scams and remote theft than the alternatives, and you rated that {word}. The habits in your checklist — verify on the device screen, trust nobody who contacts you first — are carrying more weight here than the setup is.',
  physical: 'The trade you are making: this is weaker against someone coming after you specifically than the alternatives, and you rated that {word}. Keys in one place can all be reached in one visit; the low-profile steps in your checklist matter more here.',
  // Fires for BOTH single-sig and the passphrase — the two one-device rungs —
  // so it must not describe either of them specifically. It used to say "this
  // is the lightest setup on the ladder", which is true of bare single-sig and
  // false of a passphrase, and the reader recommended a passphrase was told
  // something about their own recommendation that was not so.
  stakes: 'The trade you are making: how much is riding on this is {word}, and this setup rests on a single device and a single backup. It asks the least of you, which is a real virtue — but there is nothing else holding the line if that one thing fails.',
  exposureCustodial: 'The trade you are making: how much you mind being known to hold Bitcoin is {word}, and this setup brings a company inside it. Most require ID verification, which ties your name to your holdings, and they can see what this wallet holds.',
};

// A STANDING warning, not a computed caveat. The caveat machinery only speaks
// when the reader rates a concern elevated or high — right for a trade-off, and
// wrong for this one.
//
// A passphrase adds a failure that is SILENT and total, and the guide says on
// five other surfaces that keeping one only in your head is the single most
// documented way people lose passphrase-protected Bitcoin. The legacy card
// carried that warning unconditionally; recommendV2 overwrites `holdback` with
// the computed caveat and so DELETED it for precisely the readers the engine
// sends to a passphrase with LOW self-loss — which is the most common passphrase
// outcome there is. The one card recommending the thing shipped with no warning
// about it. Asserted in verify-finder.mjs.
const PASSPHRASE_STANDING = {
  concern: 'self-loss',
  standing: true,
  // The computed caveats all answer "why not more?"; this one does not — it is
  // a condition attached to the thing we just recommended, so it carries its
  // own label rather than borrowing a question it is not the answer to.
  label: 'Before you take this on',
  text: 'One thing to take on with it: a passphrase adds a way to lose everything that no backup can undo. Forget it and the seed alone opens only the decoy — there is no reset and nobody to ask. Back the passphrase up as carefully as the seed itself, keep it somewhere the seed is not, and say plainly in your recovery notes that it exists.',
};

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
  stakes: {
    single: 'How much is riding on this is {word}. At this level the win is a setup you will actually operate correctly — one key, one tested backup, and nothing else to get wrong.',
    fork: 'How much is riding on this is {word}, and that is the case for more than one key. When the consequence of losing it is this large, spreading the keys stops being over-engineering and starts being proportionate.',
  },
  exposure: {
    single: 'How much you mind being known to hold Bitcoin is {word}. This setup keeps it to you — no company checks your ID, no third party can see your balance, and with a passphrase a seed someone obtains does not reveal what you actually hold.',
    fork: 'How much you mind being known to hold Bitcoin is {word}. Running the keys yourself keeps every one of them out of a company’s records — no ID check, no account, nobody who can be asked what you own.',
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

// Fill the two PREFERENCE rows (stakes, exposure) from the answers that seed
// them, for any score source that cannot know about them. Never overwrites a
// value the caller supplied — a hand-nudged bar still wins.
//
// `sovereignty` is validated the same way fitFor validates it, so a saved plan
// that predates the sovereignty question resolves to the same default the
// engine scores against rather than leaving exposure undefined.
function withPreferenceDefaults(scores, answers = {}) {
  const stakes = STAKES_SCORE[answers.stakes] !== undefined ? answers.stakes : 'meaningful';
  const sov = EXPOSURE_BY_SOV[answers.sovereignty] !== undefined ? answers.sovereignty : 'lean-self';
  const d = defaultsFor(stakes, sov);
  const out = { ...scores };
  for (const c of ['stakes', 'exposure']) {
    if (typeof out[c] !== 'number') out[c] = d[c];
  }
  return out;
}

function normalizedScores(answers) {
  if (answers.scores && typeof answers.scores === 'object') {
    const d = defaultsFor(answers.stakes || 'meaningful', answers.sovereignty);
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
    // scoreFromPrompts only knows the four WALKED risks — `stakes` and
    // `exposure` come from questions, not prompts, so it deliberately omits
    // them. That omission has to be filled HERE or the two preference rows
    // arrive undefined.
    //
    // Undefined is not harmless: scoreWord's comparisons against it are all
    // false, so both rows reported 'high' for every reader, deltas came back
    // NaN, and `stakes: high` fired a caveat telling someone at learning stakes
    // that a great deal was riding on it. The page never hit this because it
    // passes a `scores` object, which the branch above fills — but
    // checkedPrompts is a documented entry point of this function and nothing
    // in the harness had ever called it. Filled here, and asserted below.
    return withPreferenceDefaults(
      scoreFromPrompts(answers.checkedPrompts, answers.stakes || 'meaningful',
        Array.isArray(answers.skippedSections) ? answers.skippedSections : []),
      answers,
    );
  }
  return withPreferenceDefaults(shimScores(answers), answers);
}

/**
 * Synthesize a legacy answer object that forces quiz.js recommend() to emit
 * the card structure for the family the fit engine chose. The card COPY that
 * depends on answers we fake gets replaced (why / holdback); everything real
 * flows through untouched: current (→ journey), tech + stakes (→ device
 * pairs), sovereignty + tech (→ fork lead, the preserved gate), recovery
 * (→ the fork's inheritance note).
 */
// Rung 3 or 4 — a setup built on more than one key. Replaces the old 'fork'
// family test now that DIY multisig and collaborative custody are separate
// rungs that compete with each other.
const isMultiKey = (fam) => fam === 'multisig' || fam === 'collaborative';

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
  if (isMultiKey(family)) {
    // 'lifechanging' is the one stakes value that always forks in the old
    // engine; fork content never reads stakes, so nothing else shifts.
    //
    // THE LEAD IS FORCED FROM THE WINNING SETUP — the last piece of the old
    // gate. quiz.js picks which path leads from `sovereignty === 'open-help' &&
    // tech !== 'technical'`, so a reader who answered 'pure' got a DIY-led card
    // even when COLLABORATIVE was the setup that actually won the scoring. The
    // visible result then contradicted the ranking behind it, and the second
    // card could come back 'multisig' underneath a card already leading
    // multisig — the same setup twice.
    //
    // Sovereignty and tech are synthesized here PURELY to steer that lead;
    // the reader's real answers already did their work in the scoring, where
    // sovereignty now feeds the `exposure` concern. Nothing else in the fork
    // card reads either field.
    const leadCollab = family === 'collaborative';
    return {
      ...a, worry, stakes: 'lifechanging',
      sovereignty: leadCollab ? 'open-help' : 'pure',
      tech: leadCollab ? 'simple' : a.tech,
    };
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
  const stakes = STAKES_SCORE[answers.stakes] !== undefined ? answers.stakes : 'meaningful';
  const scores = normalizedScores(answers);
  const d = defaultsFor(stakes, answers.sovereignty);
  const words = {};
  const deltas = {};
  for (const c of CONCERN_KEYS) {
    // SOVEREIGNTY MUST BE PASSED. `exposure`'s default comes from that answer,
    // and scoreWord bands a score against its default — so omitting it measured
    // every reader's exposure against the 'lean-self' baseline of 55.
    //
    // Two of the three answers therefore got the wrong word on a bar they had
    // never touched: 'pure' (default 85) read ELEVATED and 'open-help'
    // (default 20) read LOW, when both are by definition TYPICAL. It was not
    // cosmetic — a reader who chose pure self-custody saw "how much you mind
    // being known is elevated" as the sole stated reason for their
    // recommendation, and the review screen, which does pass it, disagreed with
    // the result screen about the same bar.
    words[c] = scoreWord(scores[c], c, stakes, answers.sovereignty);
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
    (r) => !r.gated
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
  // A concern is a REASON only where this setup is genuinely competitive on it.
  // Without this, single-sig listed "locking yourself out" as a reason it was
  // chosen AND as a caveat against itself, in the same result — its weight is
  // positive but it is the worst option on the ladder for that concern. Reasons
  // and caveats must partition the elevated concerns, never overlap them.
  const caveated = new Set();
  for (const c of CONCERN_KEYS) {
    const mine = PROTECTION[top.setup].weights[c];
    const best = Math.max(...SETUP_KEYS.map((k) => PROTECTION[k].weights[c]));
    if (best - mine >= 1.2) caveated.add(c);
  }
  const named = topRow.contributions
    .filter((x) => x.weight > 0 && isElevated(x.concern) && !caveated.has(x.concern))
    .sort((a, b) => b.points - a.points)
    .slice(0, 3);
  const reasons = named.map((x) => ({
    concern: x.concern,
    setup: primary.rungSlug,
    // Guarded: a concern added without a REASON_TEXT entry used to throw here,
    // and the harness reported ZERO failures because it died before running a
    // single constraint. A crash that reads as a pass is worse than a failure.
    text: ((REASON_TEXT[x.concern] || {})[isMultiKey(family) ? 'fork' : 'single'] || '')
      .replace('{word}', words[x.concern]),
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

  // ── computed CAVEATS (the honest half of the result) ──────────────────────
  // Derived entirely from the scores, per concern. For each thing the reader
  // rated elevated or high, compare the chosen setup's weight against the best
  // weight available anywhere on the ladder — and if it is materially worse,
  // say so plainly. Nothing is hidden and nothing is refused; the reader is
  // told what they are trading and left to decide.
  //
  // This is the replacement for both the hand-written passphrase holdbacks and
  // the hard gates. A gate would have removed this recommendation and explained
  // nothing; a caveat hands the reader the same information and lets them use it.
  const CAVEAT_GAP = 1.2;   // how much worse than the best before it is worth saying
  const holdbacks = [];
  for (const c of CONCERN_KEYS) {
    if (!isElevated(c)) continue;
    const mine = PROTECTION[top.setup].weights[c];
    const best = Math.max(...SETUP_KEYS.map((k) => PROTECTION[k].weights[c]));
    if (best - mine < CAVEAT_GAP) continue;
    const key = (c === 'exposure' && PROTECTION[top.setup].weights.exposure < 0)
      ? 'exposureCustodial' : c;
    const text = (CAVEAT_TEXT[key] || '').replace('{word}', words[c]);
    if (text) holdbacks.push({ concern: c, text });
  }
  // The passphrase's silent-lockout warning rides ALWAYS, not only when the
  // reader happens to rate locking themselves out elevated. If a computed
  // self-loss caveat already fired it says the same thing better, so this does
  // not double up.
  if (family === 'passphrase' && !holdbacks.some((h) => h.concern === 'self-loss')) {
    holdbacks.push({ ...PASSPHRASE_STANDING });
  }
  // Worst gap first — if a result carries several caveats, the reader should
  // meet the biggest trade before the smaller ones. A STANDING warning always
  // leads: it is not a trade to weigh against the others, it is a condition of
  // the thing being recommended, and sorting it by gap would have buried it
  // under the stakes caveat on the very card it belongs to.
  holdbacks.sort((a, b) => {
    if (Boolean(a.standing) !== Boolean(b.standing)) return a.standing ? -1 : 1;
    const gap = (x) => Math.max(...SETUP_KEYS.map((k) => PROTECTION[k].weights[x.concern])) - PROTECTION[top.setup].weights[x.concern];
    return gap(b) - gap(a);
  });

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
