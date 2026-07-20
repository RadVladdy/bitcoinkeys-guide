// Collaborative-custody services — an honest, independent comparison, the sibling
// of wallets.js. All are Bitcoin-only (Casa is excluded for supporting other coins).
// In collaborative custody you keep 2 of 3 keys (unilateral control); a service holds
// one backup key for recovery/inheritance help — it can NEVER move your coins alone.
//
// Facts verified 2026-07-20 against each provider's own site + independent sources.
// VOLATILE (re-check): fees · minimums · KYC policy · jurisdiction · device lists.
// STABLE: custody model · insurance existence · open-recovery posture.
// Ratings: 'yes' | 'partial' | 'no'. RE-VERIFY fees before anyone commits money.

export const custodiansVerified = '2026-07-20';

export const custodians = [
  {
    slug: 'nunchuk',
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
    bestFor: 'The most sovereignty-friendly of the six — strictly no KYC, open-source (libnunchuk), the widest device support, and a genuinely free self-driven tier.',
    watch: 'Support is lighter-touch and more self-serve than Unchained or The Bitcoin Adviser — you drive more of the setup yourself.',
    notes: { openRecovery: 'Open-source engine; wallets use standard BSMS/BIP-48 descriptors — recover into Sparrow or Bitcoin Core without Nunchuk.' },
  },
  {
    slug: 'bitkey',
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
    watch: 'A closed, single-vendor stack: the code is source-available but under a Commons-Clause licence (not fully open-source), and recovery leans on Block’s app rather than open multisig tools.',
    notes: { openRecovery: 'You can move funds to any wallet anytime and there’s an Emergency Exit Kit — but the everyday recovery flows depend on Block’s app/infrastructure, so it earns a partial, not a clean check.' },
  },
  {
    slug: 'unchained',
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
    name: 'AnchorWatch',
    url: 'https://anchorwatch.com',
    model: 'Insured miniscript multisig (Trident Vault) — you hold your keys, insured up to $100M',
    noKyc: 'no',
    openRecovery: 'yes',
    insured: 'yes',
    fee: 'Custody from $100/mo (uninsured) · insured premium ~0.55%–2%/yr',
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

export const custodianBySlug = Object.fromEntries(custodians.map((c) => [c.slug, c]));
export function custodianName(slug) { return (custodianBySlug[slug] && custodianBySlug[slug].name) || slug; }
