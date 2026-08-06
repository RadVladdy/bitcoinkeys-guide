// Collaborative-custody services — an honest, independent comparison, the sibling
// of wallets.js. All are Bitcoin-only (Casa is excluded for supporting other coins).
// In collaborative custody you keep 2 of 3 keys (unilateral control); a service holds
// one backup key for recovery/inheritance help — it can NEVER move your coins alone.
//
// Facts verified 2026-07-20 against each provider's own site + independent sources.
// VOLATILE (re-check): fees · minimums · KYC policy · jurisdiction · device lists.
// STABLE: custody model · insurance existence · open-recovery posture.
// Ratings: 'yes' | 'partial' | 'no'. RE-VERIFY fees before anyone commits money.
//
// ── `kind` — TWO KINDS OF COLLABORATIVE CUSTODY (2026-08-01) ────────────────
//
//   'savings'  RUNG 4 of the ladder. You hold two keys of three and a service
//              holds the third as a backstop for a LONG-TERM VAULT. This is what
//              the finder means when it recommends collaborative custody.
//   'spending' A collaborative-custody PRODUCT that is not rung 4. Genuinely
//              2-of-3 and genuinely a service — but a sealed, single-vendor
//              stack built for money you are spending, not a savings vault you
//              assemble and control.
//
// WHY THE SPLIT EXISTS: Bitkey is a collaborative-custody provider, and listing
// it flat alongside the savings services made it a candidate answer to "which
// service should hold the third key of my vault" — a question it does not
// answer. It is the same judgement wallets.js already publishes about the same
// product ('built for spending'), and the two must agree; the assert below is
// what makes that structural rather than a matter of remembering.
//
// A reader is not being warned off it. It is a genuinely good, genuinely
// no-KYC on-ramp — it is simply answering a different question, and the page
// now says which.

// One-way: custodians.js reads the device tiers, wallets.js knows nothing about
// this file, so this cannot create a cycle.
import { wallets, deviceBySlug } from './wallets.js';
import { notRecommendedFor } from './advisories.js';

// Bumped 2026-08-04: the Bitkey section arrived ~08-01 while this stamp still
// read 07-20 — a stamp covers the page's newest material, not its oldest.
export const custodiansVerified = '2026-08-06';

export const custodians = [
  {
    slug: 'nunchuk',
    kind: 'savings',
    name: 'Nunchuk',
    url: 'https://nunchuk.io',
    model: '2-of-3 assisted multisig (also 2-of-4 / 3-of-5) — you hold the keys, Nunchuk holds an assist key',
    noKyc: 'yes',
    openRecovery: 'yes',
    insured: 'no',
    fee: 'Free DIY tier · Iron Hand $120/yr · Honey Badger $480/yr',
    minimum: 'None',
    subscription: 'Ongoing (free tier is free forever)',
    devices: 'Broadest support — Coldcard, Tapsigner, Jade, Ledger, Trezor, SeedSigner, BitBox, Passport, Keystone',
    jurisdiction: 'Global',
    bestFor: 'The most sovereignty-friendly option here — strictly no KYC, open-source (libnunchuk), the widest device support, and a genuinely free self-driven tier.',
    watch: 'Support is lighter-touch and more self-serve than Unchained or The Bitcoin Adviser — you drive more of the setup yourself.',
    notes: { openRecovery: 'Open-source engine; wallets use standard BSMS/BIP-48 descriptors — recover into Sparrow or Bitcoin Core without Nunchuk.' },
  },
  {
    slug: 'bitkey',
    kind: 'spending',
    name: 'Bitkey (by Block)',
    url: 'https://bitkey.world',
    model: '2-of-3 — a phone app key + a hardware device you hold, plus a Block server recovery key',
    noKyc: 'yes',
    openRecovery: 'partial',
    insured: 'no',
    fee: 'One-time ~$250 (device included) — no subscription',
    minimum: 'None',
    subscription: 'One-time',
    devices: 'Device included (Block’s own hardware + app — single vendor)',
    jurisdiction: 'Global (US + ~95 countries)',
    bestFor: 'The cheapest, simplest, no-KYC way into a 2-of-3 — recovery is built in (no seed phrase to lose), so it’s an especially good first collaborative setup for non-technical holders.',
    // Cross-surface note added 2026-07-30: Bitkey is the only entry here that is
    // ALSO a device on /wallets, where our standard rates it "built for spending"
    // rather than cold storage. Neither page acknowledged the other's verdict on
    // the same vendor. Same underlying fact (the dependence on Block), two jobs.
    watch: 'A closed, single-vendor stack: the code is source-available but under a Commons-Clause licence (not fully open-source), and recovery leans on Block’s app rather than open multisig tools. As a device we rate it built for spending rather than cold storage, for the same reason — see how we rate hardware.',
    notes: { openRecovery: 'You can move funds to any wallet anytime and there’s an Emergency Exit Kit — but the everyday recovery flows depend on Block’s app/infrastructure, so it earns a partial, not a clean check.' },
  },
  {
    slug: 'unchained',
    kind: 'savings',
    name: 'Unchained',
    url: 'https://unchained.com',
    model: '2-of-3 collaborative multisig — you hold 2 keys, Unchained holds 1 recovery key',
    noKyc: 'no',
    openRecovery: 'yes',
    insured: 'no',
    fee: '~$250 per vault / year (concierge support extra)',
    minimum: 'None for a basic vault',
    subscription: 'Ongoing (annual per vault)',
    devices: 'Trezor, Ledger, Coldcard + other standard multisig signers',
    jurisdiction: 'US-focused (IRA is US-only; verify non-US)',
    bestFor: 'The longest track record and best human support, plus a full Bitcoin-only financial stack (vaults, IRA, loans, inheritance) — the most hand-held of the DIY-adjacent options.',
    watch: 'US financial firm — KYC is required, so it’s the least private here, and support tiers add cost.',
    notes: { openRecovery: 'Standard multisig; documented recovery via their open-source Caravan tool or Sparrow — recoverable without Unchained.' },
  },
  {
    slug: 'swan-vault',
    kind: 'savings',
    name: 'Swan Vault',
    url: 'https://swanbitcoin.com/vault',
    model: '2-of-3 multisig — you hold 2 Jade keys, Swan holds 1 cloud key',
    noKyc: 'partial',
    openRecovery: 'yes',
    insured: 'no',
    fee: '$30/mo up to $150k, then 0.02%/mo (capped $500/mo) · ~$319 device kit',
    minimum: 'None (private-wealth desk above ~$250k)',
    subscription: 'Ongoing (monthly)',
    devices: 'Blockstream Jade / Jade Plus only',
    jurisdiction: 'US-focused (verify non-US)',
    bestFor: 'The cleanest guided 2-of-3 if you already buy through Swan — a downloadable recovery kit imports into open-source Specter or Bitcoin Core.',
    watch: 'Single-vendor hardware (Jade only), and the vault lives inside a KYC’d Swan exchange account even though the custody itself is non-custodial.',
    notes: { noKyc: 'The vault is genuine self-custody, but you onboard through a regulated Swan account, so expect ID verification.' },
  },
  {
    slug: 'bitcoin-adviser',
    kind: 'savings',
    name: 'The Bitcoin Adviser',
    url: 'https://thebitcoinadviser.com',
    model: 'Collaborative 2-of-3 with an estate protocol — a professional key agent, built on Unchained / Nunchuk / bespoke',
    noKyc: 'partial',
    openRecovery: 'yes',
    insured: 'no',
    fee: '% of holdings, paid in sats: 1.00%/yr (yrs 1–4) → 0.75% → 0.50% (yr 9+)',
    minimum: 'None stated for advisory custody',
    subscription: 'Ongoing (% of holdings)',
    devices: 'Broad — depends on the platform they place you on (Coldcard, Tapsigner, Jade, Ledger, Trezor)',
    jurisdiction: 'Global (US, UK, EU, Australia, APAC)',
    bestFor: 'The most high-touch for estate & inheritance planning across jurisdictions — hand-holding and documented, testable heir access are the whole point.',
    watch: 'A percentage-of-stack fee that’s the priciest structure here for large holders, and the details (incl. KYC) vary by the underlying platform they choose for you.',
    notes: { noKyc: 'KYC depends on the platform they build on (Unchained = KYC; Nunchuk = none) — not a blanket policy, so treat it as unclear.' },
  },
  {
    slug: 'anchorwatch',
    kind: 'savings',
    name: 'AnchorWatch',
    url: 'https://anchorwatch.com',
    model: 'Insured miniscript multisig (Trident Vault) — you hold your keys, insured up to $100M',
    noKyc: 'no',
    openRecovery: 'yes',
    insured: 'yes',
    // CORRECTED 2026-08-06 against anchorwatch.com/custody/pricing, which now
    // publishes a flat tier LADDER rather than the single entry price we quoted.
    // "From $100/mo" stayed literally true and read as the whole story: a reader
    // holding $2.5M pays $375/mo, and the ceiling ($1,000/mo for individuals and
    // small businesses, whatever you hold) is the genuinely reassuring number we
    // were leaving out. The old "~0.55%–2%/yr" premium band was the half that had
    // gone wrong — their published floor is $4,000 per $1M of coverage per year
    // (0.4%), and their own calculator estimates 0.6% Flagship / 0.8% MIC, so
    // nothing on their site supports a 2% top end any more.
    fee: 'Custody $100–$1,000/mo by vault value · insured premium from ~0.4%/yr',
    minimum: 'Insurance from $250k of coverage (the high-minimum option)',
    subscription: 'Ongoing (premium + monthly fee)',
    devices: 'Coldcard Mk4 / Q, Ledger Nano S Plus (Trezor not supported)',
    jurisdiction: 'Custody global; insurance for US customers',
    bestFor: 'The only genuinely insured option — real Lloyd’s of London cover on your holdings, while you still hold your own keys. Built for large holdings.',
    watch: 'Aimed at big stacks ($250k+ to be insured), KYC’d, and narrow device support. Uninsured vaults are still recoverable via Bitcoin Core.',
    notes: { insured: 'Lloyd’s of London, up to $100M per vault ($500M for institutions) — the only real insurance among these services.' },
  },
];

// Trust badges (green / amber / struck), the collaborative-custody equivalent of the
// wallet badges. Insurance is handled as a separate highlight (a plus, not a flaw when absent).
export const custodianBadges = [
  { key: 'noKyc', label: 'No KYC', tip: 'No ID verification required to use it — your identity stays off your holdings.' },
  { key: 'openRecovery', label: 'Open-source recovery', tip: 'The single most important test: can you recover your Bitcoin WITHOUT them if they vanish? Green means standard multisig you can rebuild in open tools like Sparrow, Caravan, or Bitcoin Core.' },
];

// Full comparison-table columns.
export const custodianCompare = [
  { key: 'model', label: 'Model', type: 'text' },
  { key: 'noKyc', label: 'No KYC', type: 'rate' },
  { key: 'openRecovery', label: 'Open recovery', type: 'rate' },
  { key: 'insured', label: 'Insured', type: 'rate' },
  { key: 'fee', label: 'Fee', type: 'text' },
  { key: 'minimum', label: 'Minimum', type: 'text' },
  { key: 'jurisdiction', label: 'Where', type: 'text' },
];

// Device support per custodian, in current-catalog slugs (wallets.js), + the picks
// we'd recommend for the user-held keys. Drives the custodian-specific device advice
// on /my-plan. Bitkey ships its own device (no bring-your-own). Verified 2026-07-20.
const _support = {
  nunchuk: { supports: ['coldcard-q', 'coldcard-mk5', 'passport-prime', 'trezor-safe-3', 'trezor-safe-5', 'trezor-safe-7', 'bitbox02', 'jade-core', 'jade-plus', 'ledger'], recommends: ['coldcard-q', 'bitbox02'] },
  unchained: { supports: ['coldcard-q', 'coldcard-mk5', 'trezor-safe-3', 'trezor-safe-5', 'trezor-safe-7', 'ledger', 'bitbox02', 'jade-core', 'jade-plus', 'passport-prime'], recommends: ['coldcard-q', 'trezor-safe-5'] },
  'swan-vault': { supports: ['jade-core', 'jade-plus'], recommends: ['jade-plus'] },
  // AnchorWatch also supports Ledger, but we never *recommend* a device that
  // doesn't clear our standard — the renderer flags DQ'd devices in `supports`.
  anchorwatch: { supports: ['coldcard-q', 'ledger'], recommends: ['coldcard-q'] },
  'bitcoin-adviser': { supports: ['coldcard-q', 'coldcard-mk5', 'jade-core', 'jade-plus', 'ledger', 'trezor-safe-3', 'trezor-safe-5', 'trezor-safe-7', 'bitbox02', 'passport-prime'], recommends: ['coldcard-q', 'bitbox02'] },
  bitkey: { supports: [], recommends: [] },
};
// `recommends` IS FILTERED, NOT HAND-EDITED, and the reason is the one stated
// against AnchorWatch above, generalised. "We never recommend a device that does
// not clear our standard" had a sibling nobody had needed until 2026-08-06: we
// never recommend a device whose recommendation we have WITHDRAWN either, even
// though it clears the standard perfectly. Doing it by deletion would have meant
// five hand-edits that the next person to add a custodian cannot see; doing it
// here means the lists move by themselves when a flag is added or lifted.
//
// `supports` is deliberately NOT filtered. What a service supports is a fact
// about that service and ours to report, not to curate — the same reason a
// disqualified Ledger stays in `supports` and gets flagged by the renderer.
const _recommendable = (slugs = []) => slugs.filter((s) => {
  const d = deviceBySlug[s];
  return d && !notRecommendedFor(d.name);
});
custodians.forEach((c) => {
  const s = _support[c.slug];
  if (!s) return;
  c.supports = s.supports;
  c.recommends = _recommendable(s.recommends);
  // THE HOLE THIS CREATES, CARRIED RATHER THAN HIDDEN. AnchorWatch supports
  // exactly two devices — the Coldcard Q and a Ledger — so once the Coldcard is
  // withdrawn and the Ledger is disqualified, there is NO device we would put
  // forward for a reader who picks that service. An empty list rendered as
  // silence would read as "no advice offered" when the truth is "the advice is
  // uncomfortable", so the flag is computed here and the renderer states it.
  c.recommendsStranded = s.recommends.length > 0 && c.recommends.length === 0;
});

// RUNG 4 — the services the finder may recommend as the third key of a savings
// vault. Everything the ladder's collaborative rung means is in this list.
export const savingsCustodians = custodians.filter((c) => c.kind === 'savings');
// Collaborative custody that is NOT rung 4. Presented on /collaborative in its
// own right, never mixed into the rung-4 comparison.
export const spendingCustodians = custodians.filter((c) => c.kind === 'spending');

// EVERY custodian must declare a kind, or it would silently fall out of BOTH
// lists — the exact shape that dropped Bitkey off the seed-generation lesson
// when `n/a` was a third state neither derived list modelled.
{
  const untagged = custodians.filter((c) => !['savings', 'spending'].includes(c.kind));
  if (untagged.length) {
    throw new Error(
      `custodians.js: ${untagged.map((c) => c.slug).join(', ')} — no \`kind\`, so it would appear in neither the rung-4 list nor the spending list`,
    );
  }
}

export const custodianBySlug = Object.fromEntries(custodians.map((c) => [c.slug, c]));

// THE TWO JUDGEMENTS ABOUT ONE PRODUCT MUST AGREE. Where a custodian also ships
// a device we rate, its custody `kind` and its device `tier` are the same call
// made twice — "is this for savings or for spending" — and this project's whole
// bug history is two surfaces answering one question differently. Asserted at
// build so they cannot drift: flip either one and the site refuses to build.
{
  const DEVICE_FOR = { bitkey: 'Bitkey' };
  for (const [slug, deviceName] of Object.entries(DEVICE_FOR)) {
    const c = custodianBySlug[slug];
    const d = wallets.find((w) => w.name === deviceName);
    if (!c || !d) continue;
    const want = d.tier === 'spending' ? 'spending' : 'savings';
    if (c.kind !== want) {
      throw new Error(
        `custodians.js: "${c.name}" is kind '${c.kind}' but wallets.js rates the ${deviceName} tier '${d.tier}' — one product, two answers to "savings or spending".`,
      );
    }
  }
}

export const custodianVendorKinds = { savings: savingsCustodians.length, spending: spendingCustodians.length };
export function custodianName(slug) { return (custodianBySlug[slug] && custodianBySlug[slug].name) || slug; }
