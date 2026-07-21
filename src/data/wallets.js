// The 2026 hardware-wallet landscape — assessed against criteria, not brand.
// Source: Bitcoin KB "Hardware wallets overview" + live vendor pages.
// Prices/specs verified 2026-07-15 against each vendor's own site — RE-VERIFY before recommending a purchase.
// Trust badges (reproducible build + recoverability) verified 2026-07-16 against vendor repos/docs + WalletScrutiny.
// 2026-07-17: Foundation retired the $199 Passport (now "Passport Core," discontinued); replaced with the
//   $349 Passport Prime — a multi-function security platform. Badges re-derived from foundation.xyz + Keylabs
//   audit + independent reviews (WalletInsights, The Bitcoin Hole): btcOnly/airgap now 'partial', reproducible 'no'.
// 2026-07-17: Trezor Safe line expanded to three cards — Safe 3 ($79, buttons/mono), Safe 5 ($129, touchscreen),
//   Safe 7 ($249, Oct-2025 flagship: dual secure element incl. the auditable TROPIC01 chip, Bluetooth).
//   Prices/specs from trezor.io/compare + independent reviews.
// 2026-07-17: added Coldcard Mk5 ($170, pocket keypad Coldcard, dual SE, MicroSD air-gap) and covered Blockstream
//   Jade. Now 11 devices.
// 2026-07-18: prices re-verified against vendor stores (the owner). Blockstream lineup corrected — the $79 entry is the
//   original "Blockstream Jade" (button + screen, no camera → airgap 'no'), NOT the "Jade Core" (that's the $99
//   touchscreen, also no camera; not carried here). Jade Plus is $169 (was $149). Bitkey $250 and Passport Prime
//   $349 (Arctic Copper "America 250" limited edition) both confirmed.
// 2026-07-19: Trezor Safe 3 repriced $79 → $59 at trezor.io (browser-verified: buy price "USD 59",
//   no strikethrough, offer valid to 2031 — a permanent cut, not a sale). Ladder cost-floor cascaded
//   to $59. Freshness runner caught it via the new headless-render deterministic (JSON-LD) price read.
// Rule of the guide: there is no "best" device, only fit-to-purpose.

export const walletsVerified = '2026-07-19';

// rating scale used in the compare table + chooser badges: 'yes' | 'partial' | 'no'
export const wallets = [
  {
    name: 'Coldcard Q',
    barCaveat: 'Clears the bar comfortably. One honest asterisk: the firmware is source-available and independently reproducible rather than OSI-licensed open-source — you can read and rebuild it, but the licence is stricter than a purist would like. A philosophical caveat, not a functional one.',
    image: '/devices/coldcard-q.webp',
    ladderReach: { s: 'strong', p: 'strong', m: 'strong', note: 'Full ladder, all first-class — buy-once, no new hardware as you climb.' },
    vendor: 'Coinkite',
    price: '$249',
    priceNum: 249,
    airgap: 'yes',      // QR / MicroSD air-gap mode
    btcOnly: 'yes',
    openSource: 'partial', // source-available (non-OSI)
    multisig: 'yes',
    secureElement: 'yes',
    reproducible: 'yes',
    recoverability: 'yes',
    useCases: ['passphrase', 'multisig'],
    bestFor: 'The friendliest to operate — a real keyboard and clear menus make passphrases and multisig the easiest to drive of any device here. Buy-once: one device covers single-sig, a passphrase, and multisig, so climbing the ladder never means new hardware.',
    watch: 'The premium price of the group. Firmware is source-available (independently reproducible) rather than OSI-licensed open-source — a philosophical caveat for open-source purists, not a functional one.',
    notes: {
      reproducible: 'Firmware is reproducibly buildable — you can rebuild it from source and confirm the binary matches (independently verified on WalletScrutiny).',
      recoverability: 'Standard BIP-39 seed — restore your funds in Sparrow, Electrum, Bitcoin Core, or any competent wallet.',
    },
  },
  {
    name: 'Coldcard Mk5',
    barCaveat: 'Clears the bar comfortably. Same asterisk as the Q: firmware is source-available and reproducible rather than OSI-licensed open-source — readable and verifiable, but a stricter licence than purists prefer.',
    image: '/devices/coldcard-mk5.webp',
    ladderReach: { s: 'strong', p: 'ok', m: 'strong', note: 'Full ladder; the numeric keypad makes passphrase entry more of a chore than the Q, but single-sig and multisig sign well.' },
    vendor: 'Coinkite',
    price: '$170',
    priceNum: 170,
    airgap: 'yes',      // MicroSD air-gap; also USB-C / NFC
    btcOnly: 'yes',
    openSource: 'partial', // source-available (non-OSI)
    multisig: 'yes',
    secureElement: 'yes',  // dual secure elements
    reproducible: 'yes',
    recoverability: 'yes',
    useCases: ['multisig', 'budget'],
    bestFor: 'The pocket-sized, lower-cost Coldcard — the same dual secure element, air-gapped MicroSD signing, and Bitcoin-only open-source firmware as the Q, in a credit-card form factor. An excellent affordable multisig signer or travel key; USB-C + NFC for tap-to-sign.',
    watch: 'A numeric keypad (not a full keyboard) makes typing a passphrase more of a chore than the Q, and there’s no built-in QR scanner (it air-gaps via MicroSD). Firmware is source-available rather than OSI open-source — verifiable, but a licensing caveat for purists.',
    notes: {
      reproducible: 'Firmware is reproducibly buildable — rebuild from source and confirm the binary matches. Dual secure elements.',
      recoverability: 'Standard BIP-39 seed — restore your funds in Sparrow, Electrum, Bitcoin Core, or any competent wallet.',
    },
  },
  {
    name: 'Foundation Passport Prime',
    belowBar: {
      fails: ['minimal-os'],
      summary: 'A general-purpose platform — it runs apps (including altcoin apps), stores files, 2FA and passkeys — rather than a minimal Bitcoin-only signer.',
      detail: 'We rate Foundation highly, and the Passport Prime is open-source, has an air-gap mode, and ships a Bitcoin-only first-party wallet — so this is not a knock on its security engineering. It falls below the bar on one criterion: it is no longer a minimal, single-purpose signer. The Prime is a general-purpose secure platform that also stores 2FA codes, passkeys and files, adds Bluetooth and NFC, and can run third-party (including altcoin) apps. That is more surface, and more to trust, than a device whose only job is to hold Bitcoin keys. If Foundation ships a stripped Bitcoin-only signer again — as the older $199 Passport was — it would clear the bar. For now we cover it fully but keep it below the line, and would point a first-time buyer at a simpler signer.',
    },
    image: '/devices/passport-prime.webp',
    ladderReach: { s: 'strong', p: 'strong', m: 'strong', note: 'Full ladder; a built-in keyboard makes passphrase entry easy, and it signs multisig up to 15 keys.' },
    vendor: 'Foundation Devices',
    price: '$349',
    priceNum: 349,
    airgap: 'partial',  // QR / microSD air-gap capable, but also has Bluetooth + NFC
    btcOnly: 'partial', // first-party wallet is Bitcoin-only; the platform can run altcoin apps
    openSource: 'yes',
    multisig: 'yes',
    secureElement: 'yes',
    reproducible: 'no',  // reproducible builds not available yet (2026)
    recoverability: 'yes',
    useCases: ['passphrase', 'multisig'],
    bestFor: 'A polished, US-assembled “security platform” — a big colour touchscreen with a keyboard, an independent audit (Keylabs), a strong default backup (2-of-3 Shamir across tap-to-read NFC keycards), and Bitcoin multisig up to 15 keys.',
    watch: 'It’s more device — and more money ($349) — than a first Bitcoin wallet needs: it also stores 2FA codes, passkeys and files and can run altcoin apps, so it isn’t the minimal Bitcoin-only signer this guide leans toward. It adds Bluetooth + NFC (so it’s not strictly air-gapped), and its firmware isn’t reproducibly buildable yet. Foundation retired the simpler $199 Passport, so this is now their only device.',
    notes: {
      reproducible: 'Open-source (GPLv3) and independently audited by Keylabs (the wallet.fail team), but reproducible builds aren’t available yet — you can read the source, but can’t yet rebuild it and confirm the shipped firmware matches.',
      recoverability: 'Standard BIP-39 seed (12 or 24 words) export/import is supported, so you’re never locked in — though the default backup is a 2-of-3 Shamir (SLIP-39) split across three tap-to-read NFC keycards.',
    },
  },
  {
    name: 'Trezor Safe 3',
    image: '/devices/trezor-safe-3.webp',
    ladderReach: { s: 'strong', p: 'ok', m: 'ok', note: 'Two-button entry makes a passphrase a chore; multisig is only adequate. A fine hold-and-forget starter.' },
    vendor: 'SatoshiLabs',
    price: '$59',
    priceNum: 59,
    airgap: 'no',       // USB, functionally cold
    btcOnly: 'partial', // multi-coin device
    openSource: 'yes',
    multisig: 'partial',
    secureElement: 'yes', // EAL6+
    reproducible: 'yes',
    recoverability: 'partial',
    useCases: ['first', 'budget'],
    bestFor: 'The budget Trezor — two physical buttons and a small monochrome screen, but the same EAL6+ secure element, open-source firmware and optional Shamir backup as its pricier siblings. A solid hold-and-forget first wallet.',
    watch: 'Buttons and a tiny mono screen make passphrase entry and reading long addresses more of a chore than the touchscreen models. Multi-coin, and multisig is adequate rather than best-in-class.',
    notes: {
      reproducible: 'Open-source with documented reproducible builds (verifiable after stripping the vendor signature).',
      recoverability: 'Offers a SLIP-39 (Shamir) backup that only restores in SLIP-39-aware wallets (Sparrow, Electrum, a few others). A plain BIP-39 seed is also an option if you prefer maximum portability.',
    },
  },
  {
    name: 'Trezor Safe 5',
    image: '/devices/trezor-safe-5.webp',
    ladderReach: { s: 'strong', p: 'strong', m: 'ok', note: 'Single-sig and passphrase are easy on the touchscreen; multisig is only adequate (and it’s multi-coin).' },
    vendor: 'SatoshiLabs',
    price: '$129',
    priceNum: 129,
    airgap: 'no',       // USB, functionally cold
    btcOnly: 'partial', // multi-coin device, BTC-focused use possible
    openSource: 'yes',
    multisig: 'partial',
    secureElement: 'yes',
    reproducible: 'yes',
    recoverability: 'partial',
    useCases: ['first', 'passphrase'],
    bestFor: 'The middle Trezor: a colour touchscreen makes passphrase entry and address-checking easy, with mainstream UX and native SLIP-39. The sweet spot if you want a touchscreen without paying for the flagship.',
    watch: 'Multi-coin, and multisig is adequate rather than best-in-class. USB-only (the Safe 7 adds Bluetooth and an auditable chip).',
    notes: {
      reproducible: 'Open-source with documented reproducible builds (verifiable after stripping the vendor signature).',
      recoverability: 'Defaults to a SLIP-39 (Shamir) backup, which only restores in SLIP-39-aware wallets (Sparrow, Electrum, a handful of others) — not every wallet. A plain BIP-39 seed is still an option if you prefer maximum portability.',
    },
  },
  {
    name: 'Trezor Safe 7',
    barCaveat: 'A Bitcoin-only firmware is available and the source is open, so it clears the bar — but note it is a multi-coin device by default, and this model adds a Bluetooth radio a USB-only or air-gapped signer does not have. Every spend still needs on-device approval, so we treat the radio as a caveat, not a disqualifier.',
    image: '/devices/trezor-safe-7.webp',
    ladderReach: { s: 'strong', p: 'strong', m: 'ok', note: 'The big touchscreen makes single-sig and passphrase easy; multisig is only adequate (and it’s multi-coin).' },
    vendor: 'SatoshiLabs',
    price: '$249',
    priceNum: 249,
    airgap: 'no',       // USB + Bluetooth — not air-gapped
    btcOnly: 'partial', // multi-coin device
    openSource: 'yes',
    multisig: 'partial',
    secureElement: 'yes', // dual SE, incl. the auditable TROPIC01
    reproducible: 'yes',
    recoverability: 'partial',
    useCases: ['first', 'passphrase'],
    bestFor: 'The flagship — a big 2.5″ touchscreen, wireless (Bluetooth, even with an iPhone), and the headline feature: the first *auditable* secure-element chip (TROPIC01), paired with a second certified chip. For anyone who wants a vault chip open to outside inspection rather than a closed black box.',
    watch: 'The priciest Trezor at $249, and Bluetooth adds a wireless interface a USB-only or air-gapped device doesn’t have (every send still needs on-device approval). Multi-coin, and multisig is adequate rather than best-in-class.',
    notes: {
      reproducible: 'Open-source with documented reproducible builds — and its new TROPIC01 secure element is itself auditable (the chip’s design is open to outside experts), a first for hardware wallets.',
      recoverability: 'Offers a SLIP-39 (Shamir) backup that only restores in SLIP-39-aware wallets; a plain BIP-39 seed is also an option if you prefer maximum portability.',
    },
  },
  {
    name: 'BitBox02 (BTC-only)',
    image: '/devices/bitbox02.webp',
    ladderReach: { s: 'strong', p: 'ok', m: 'strong', note: 'An excellent multisig component; passphrase on the touch-slider is the fiddly part.' },
    vendor: 'BitBox',
    price: '$137',
    priceNum: 137,
    airgap: 'no',       // USB, functionally cold
    btcOnly: 'yes',
    openSource: 'yes',
    multisig: 'yes',
    secureElement: 'yes',
    reproducible: 'yes',
    recoverability: 'yes',
    useCases: ['first', 'multisig'],
    bestFor: 'Swiss, minimalist, fully open-source; an excellent multi-vendor multisig component.',
    watch: 'USB-connected rather than strict air-gap. Minimalist by design — few frills.',
    notes: {
      reproducible: 'Open-source with reproducible builds; the device can even display its firmware hash so you can check it.',
      recoverability: 'Standard BIP-39 seed (also kept on a microSD backup) — restorable in any BIP-39 wallet.',
    },
  },
  {
    name: 'Blockstream Jade',
    barCaveat: 'Clears the bar — Bitcoin-only, fully open-source and reproducible. Its one trade-off is deliberate: no dedicated secure-element chip. That is fine for its threat model (and a blind-oracle mode hardens it), but a determined attacker with physical possession of the device is more of a concern than on a secure-element signer.',
    image: '/devices/jade-core.webp',
    ladderReach: { s: 'strong', p: 'ok', m: 'ok', note: 'Covers the ladder cheaply; the joystick makes passphrase and multisig fiddlier. Great to start.' },
    vendor: 'Blockstream',
    price: '$79',
    priceNum: 79,
    airgap: 'no',       // no on-device camera — connects by USB or Bluetooth
    btcOnly: 'yes',
    openSource: 'yes',
    multisig: 'partial',
    secureElement: 'no',
    reproducible: 'yes',
    recoverability: 'yes',
    useCases: ['first', 'budget'],
    bestFor: 'Genuinely good on a budget — the original $79 Blockstream device (plug-and-play, plastic body, one button + screen). Solid single-sig, workable multisig, and Unchained integration.',
    watch: 'No dedicated secure element (a "blind oracle" model), and no on-device camera — so it connects by USB or Bluetooth rather than air-gapped QR (the Jade Plus adds a camera + battery for that). Some multisig quirks.',
    notes: {
      reproducible: 'Open-source with documented reproducible builds.',
      recoverability: 'Standard BIP-39 seed — interoperable both ways with Coldcard, Trezor, Ledger and others.',
    },
  },
  {
    name: 'Blockstream Jade Plus',
    barCaveat: 'Clears the bar — Bitcoin-only, fully open-source and reproducible, with an air-gap mode. Same deliberate trade-off as the original Jade: no dedicated secure-element chip, so physical-extraction resistance leans on its blind-oracle design rather than a hardened chip.',
    image: '/devices/jade-plus.webp',
    ladderReach: { s: 'strong', p: 'ok', m: 'ok', note: 'Covers the ladder; the joystick makes passphrase and multisig fiddlier, but the camera + battery make it a nicer air-gap unit than the standard Jade.' },
    vendor: 'Blockstream',
    price: '$169',
    priceNum: 169,
    airgap: 'partial',  // on-device camera for QR air-gap, but also USB/Bluetooth
    btcOnly: 'yes',
    openSource: 'yes',
    multisig: 'partial',
    secureElement: 'no',
    reproducible: 'yes',
    recoverability: 'yes',
    useCases: ['first', 'multisig'],
    bestFor: 'The premium Jade — a metal body (six colours), a built-in camera for air-gapped QR signing, and a rechargeable battery, with the same open-source “blind oracle” security as the standard Jade. A nicer-feeling, air-gap-capable device without a big price jump.',
    watch: 'Like the Core, it uses a "blind oracle" model rather than a dedicated secure element (Blockstream argues there’s nothing physical to steal from it). Bluetooth is present alongside the camera. Some multisig quirks.',
    notes: {
      reproducible: 'Open-source with documented reproducible builds.',
      recoverability: 'Standard BIP-39 seed — interoperable both ways with Coldcard, Trezor, Ledger and others.',
    },
  },
  {
    name: 'Bitkey',
    barCaveat: 'Clears the bar on the letter of every rule — Bitcoin-only, open-source, your device key never leaves it. Know the trade-off it makes: it is a 2-of-3 where Block holds one key on its servers and recovery runs through Block’s app, rather than a lone seed phrase you control. That is a deliberate, well-built design for non-technical holders, but it leans on a company staying online in a way the other in-standard signers do not.',
    image: '/devices/bitkey.webp',
    ladderReach: { s: 'na', p: 'na', m: 'na', note: 'Its own built-in 2-of-3 — a great first setup, but a DIY passphrase or multisig means different hardware.' },
    vendor: 'Block, Inc.',
    price: '$250',
    priceNum: 250,
    airgap: 'no',       // NFC + fingerprint
    btcOnly: 'yes',
    openSource: 'yes',
    multisig: 'partial', // its own 2-of-3 model
    secureElement: 'yes',
    reproducible: 'no',
    recoverability: 'partial',
    useCases: ['phone', 'first'],
    bestFor: 'Non-technical, mobile-first holders; the 2026 version now has an on-device touchscreen to verify transactions; built-in 2-of-3 recovery model.',
    watch: 'Fingerprint-only unlock, and it still centers on its own app and 2-of-3 model rather than open multisig with other devices. The screened 2026 hardware is new — confirm current availability.',
    notes: {
      reproducible: 'The phone app is verifiable, but the device firmware can’t be independently reproduced (a proprietary fingerprint-sensor library can’t be released).',
      recoverability: 'No standard seed phrase — recovery runs through Bitkey’s own 2-of-3 model and app. You can always sweep your funds out without Block’s servers, but there’s no portable seed to type into another wallet.',
    },
  },
  {
    name: 'Ledger Nano family',
    belowBar: {
      fails: ['btc-only', 'key-export', 'minimal-os', 'open-source'],
      summary: 'No Bitcoin-only firmware, closed-source, and the 2023 Recover feature proved the firmware can shard your seed to third parties over the internet.',
      detail: 'Ledger is the clearest miss against every version of this bar. There is no Bitcoin-only firmware — the device is built around a multi-coin app store running on a closed-source operating system you cannot inspect. Most seriously, the 2023 “Ledger Recover” feature revealed that the firmware is capable of extracting your seed, splitting it into shares, and sending those shares to outside companies over the internet — the exact thing a hardware wallet exists to make impossible. Ledger notes it is opt-in; the problem is that the capability now lives in the firmware at all. Add the 2020 customer-data breach and it falls below the bar on Bitcoin-only, keys-never-leave, minimal-signer, and open-source alike.',
    },
    image: '/devices/ledger.webp',
    ladderReach: { s: 'ok', p: 'ok', m: 'ok', note: 'Covers the ladder, but closed firmware and the 2023 Recover episode are the real caveats.' },
    vendor: 'Ledger',
    price: '$79–$399',
    priceNum: 79,
    airgap: 'no',
    btcOnly: 'partial',
    openSource: 'no',   // closed firmware
    multisig: 'partial',
    secureElement: 'yes',
    reproducible: 'no',
    recoverability: 'yes',
    useCases: [],
    bestFor: 'Wide ecosystem support; fine for a holder who already owns one and has read the caveats. (Range spans Nano S Plus to the touchscreen Flex and Stax.)',
    watch: 'Closed-source firmware; the 2023 Recover controversy and 2020 customer-data leak. Engage those before choosing it.',
    notes: {
      reproducible: 'The security-critical Secure Element firmware is closed-source — it can’t be reproduced or independently verified.',
      recoverability: 'Standard BIP-39 seed — restorable in any BIP-39 wallet. (Ledger’s trust caveats are the closed firmware and Recover service, not seed portability.)',
    },
  },
];

// ── The published selection standard ("the bar") ────────────────────────────
// A device must clear ALL of these hard gates to sit in-standard on this guide.
// Miss even one and it moves to the penalty box: still covered and compared in
// full, but marked below the bar with the reason. This is a deliberate,
// opinionated stance from a Bitcoin-only point of view — see /standard.
// A device fails a gate when its `belowBar.fails` array lists that gate's key.
export const standardGates = [
  {
    key: 'btc-only',
    title: 'Bitcoin-only firmware',
    short: 'A firmware that runs only Bitcoin must exist for the device.',
    why: 'A signer juggling dozens of other coins carries code you will never use — and every line of code is attack surface. A Bitcoin-only build does one thing, so there is less that can go wrong and less to audit. We only require that a Bitcoin-only firmware is available, not that the device can never run anything else.',
  },
  {
    key: 'key-export',
    title: 'Keys can never leave over the internet',
    short: 'The seed is made on the device and no feature can copy, shard, or back it up to a server.',
    why: 'The whole reason to own cold storage is that the secret never touches an online system. A feature that can send your seed out — even encrypted, even opt-in — puts back exactly the risk you paid to remove. If the firmware is capable of it at all, the device fails here.',
  },
  {
    key: 'minimal-os',
    title: 'A minimal, single-purpose signer',
    short: 'Lean firmware built to hold keys and sign — not a general-purpose gadget that installs apps or stays wirelessly connected.',
    why: 'Every extra app, file store, and radio is another door. A device you cannot turn into a little internet computer is a smaller target. Bluetooth alone is a caveat we will note, not an automatic fail; a general-purpose app platform is a fail.',
  },
  {
    key: 'open-source',
    title: 'Open-source and verifiable',
    short: 'The firmware source is public so anyone can inspect it — ideally reproducibly buildable.',
    why: 'Principle number ten: verify, don’t trust. You cannot check a black box. Source-available-and-reproducible firmware (you can rebuild it and confirm the match) clears this even if the licence is stricter than OSI open-source; a fully closed operating system does not.',
  },
  {
    key: 'portable-recovery',
    title: 'Portable, self-custodial recovery',
    short: 'A standard seed phrase you can restore in independent wallet software if the maker disappears.',
    why: 'Self-custody means no permission slips. Your recovery must not depend on a company staying alive, online, or willing. A proprietary format or a server standing between you and your coins is lock-in wearing a security costume.',
  },
];

// Derived membership — nothing here is hand-maintained, so the bar and the
// device list can never drift. A device is in-standard unless it declares a
// `belowBar` block; the penalty box is everything that does.
export const meetsBar = (w) => !w.belowBar;
export const inStandardWallets = wallets.filter(meetsBar);
export const belowBarWallets = wallets.filter((w) => w.belowBar);
export const gateByKey = Object.fromEntries(standardGates.map((g) => [g.key, g]));

export const compareCriteria = [
  { key: 'price', label: 'Price', type: 'text' },
  { key: 'airgap', label: 'Air-gap', type: 'rating' },
  { key: 'btcOnly', label: 'Bitcoin-only', type: 'rating' },
  { key: 'openSource', label: 'Open source', type: 'rating' },
  { key: 'multisig', label: 'Multisig', type: 'rating' },
  { key: 'secureElement', label: 'Secure element', type: 'rating' },
];

// ── Wallet-chooser (interactive tool) metadata ──────────────────────────────
// The five trust badges rendered on each device card. Each maps to a rating
// field above (yes/partial/no). These are verifiable facts, not rankings — the
// whole point of the independent guide is that we can show them plainly.
export const badgeDefs = [
  { key: 'btcOnly',        label: 'Bitcoin-only',       tip: 'Bitcoin-only firmware — no altcoin attack surface, focused on doing one thing well.' },
  { key: 'airgap',         label: 'Air-gapped',         tip: 'Can sign transactions without ever touching a computer or the internet (via QR or microSD).' },
  { key: 'openSource',     label: 'Open-source',        tip: 'The firmware source is public, so anyone can inspect what the device actually does.' },
  { key: 'reproducible',   label: 'Reproducible build', tip: 'You can rebuild the firmware from source and confirm the code on your device matches — trust is verifiable, not assumed. This is a genuinely strong guarantee.' },
  { key: 'recoverability', label: 'Portable recovery',  tip: 'Uses a standard seed phrase you could restore in other wallet software if the vendor ever vanished — no lock-in to one company.' },
];

// Faceted filters. Property filters are hard "must-have" requirements (AND).
// A device passes a property requirement unless its rating is 'no' — a 'partial'
// still counts, but its badge shows the caveat.
export const chooserFilters = [
  { key: 'btcOnly',        label: 'Bitcoin-only' },
  { key: 'airgap',         label: 'Air-gapped' },
  { key: 'openSource',     label: 'Open-source' },
  { key: 'reproducible',   label: 'Reproducible build' },
  { key: 'recoverability', label: 'Portable recovery' },
];

// Use-case chips narrow by fit (OR within this facet).
export const useCaseChips = [
  { key: 'first',      label: 'A good first device' },
  { key: 'phone',      label: 'Phone-first / non-technical' },
  { key: 'passphrase', label: 'Easy passphrase entry' },
  { key: 'multisig',   label: 'Multisig component' },
  { key: 'budget',     label: 'Tight budget' },
];

export const budgetBuckets = [
  { key: 'any',      label: 'Any price', max: Infinity },
  { key: 'under150', label: 'Under $150', max: 150 },
  { key: 'under100', label: 'Under $100', max: 100 },
];

// ── Plan integration: stable per-device slugs + a setup→keys map ─────────────
// The plan feature (owned wallets · roadmap slots · "add to plan" on tiles) needs
// a canonical id per device. We derive it from each device's image basename —
// already unique and stable — so no hand-maintained id list can drift from `wallets`.
export const deviceCatalog = wallets.map((w) => ({
  slug: w.image.replace('/devices/', '').replace(/\.webp$/, ''),
  name: w.name,
  price: w.price,
  priceNum: w.priceNum,
}));
export const deviceBySlug = Object.fromEntries(deviceCatalog.map((d) => [d.slug, d]));
export function deviceName(slug) { return (deviceBySlug[slug] && deviceBySlug[slug].name) || slug; }
// Map a device display name (as the quiz recommends devices by name) → its slug.
const _slugByName = Object.fromEntries(deviceCatalog.map((d) => [d.name, d.slug]));
export function slugForName(name) { return _slugByName[name] || null; }

// How many keys the user personally holds for a given setup — drives the roadmap
// slots (owned devices fill them; the rest become a "still to get" shopping list).
// Collaborative = the user holds 2 of 3 (a Bitcoin service holds the third).
// "Getting started" (learning) = 0: a phone wallet first, no hardware pushed yet —
// consistent with the guide's "don't buy gear you don't need" ethos.
export function keysForSetup({ rungSlug, label = '', tier = '' } = {}) {
  if (/getting started/i.test(tier)) return 0;
  if (/3-of-5/.test(String(label) + ' ' + String(tier))) return 5;
  switch (rungSlug) {
    case 'single-sig': return 1;
    case 'passphrase': return 1;
    case 'multisig': return 3;      // DIY 2-of-3, all your own keys
    case 'collaborative': return 2; // you hold 2, the service holds 1
    default: return 1;
  }
}

// ── Ownership catalog: what someone might ALREADY OWN (make → model) ─────────
// Deliberately broader than the 11-device comparison above — most people hold an
// OLDER or discontinued model, so this leans legacy. Current-lineup models reuse
// the exact `deviceCatalog` slugs so "I own this" on /wallets and this picker agree.
// Grouped by make for a compact make→model dropdown; `current:true` marks the
// still-sold models. Anything truly unlisted is captured as free text ("x:<name>").
// FRESHNESS SYNC: legacy models here are static and NOT price/availability-checked.
// But when the freshness runner flags a CURRENT device as added/discontinued
// (an `avail-*` judge in ~/dev/bkeys-freshness), update this catalog's `current:`
// flags to match the 11-device comparison — that's the only maintenance tie-in.
export const ownableCatalog = [
  { brand: 'Coldcard (Coinkite)', models: [
    { slug: 'coldcard-q', name: 'Coldcard Q', current: true },
    { slug: 'coldcard-mk5', name: 'Coldcard Mk5', current: true },
    { slug: 'coldcard-mk4', name: 'Coldcard Mk4' },
    { slug: 'coldcard-mk3', name: 'Coldcard Mk3' },
    { slug: 'coldcard-mk2', name: 'Coldcard Mk2' },
    { slug: 'coldcard-mk1', name: 'Coldcard Mk1' },
    { slug: 'coinkite-tapsigner', name: 'Tapsigner' },
    { slug: 'coinkite-opendime', name: 'Opendime' },
  ] },
  { brand: 'Trezor', models: [
    { slug: 'trezor-safe-7', name: 'Trezor Safe 7', current: true },
    { slug: 'trezor-safe-5', name: 'Trezor Safe 5', current: true },
    { slug: 'trezor-safe-3', name: 'Trezor Safe 3', current: true },
    { slug: 'trezor-model-t', name: 'Trezor Model T' },
    { slug: 'trezor-model-one', name: 'Trezor Model One' },
  ] },
  { brand: 'Ledger', models: [
    { slug: 'ledger', name: 'Ledger Nano (unsure which)', current: true },
    { slug: 'ledger-stax', name: 'Ledger Stax' },
    { slug: 'ledger-flex', name: 'Ledger Flex' },
    { slug: 'ledger-nano-x', name: 'Ledger Nano X' },
    { slug: 'ledger-nano-s-plus', name: 'Ledger Nano S Plus' },
    { slug: 'ledger-nano-s', name: 'Ledger Nano S' },
  ] },
  { brand: 'BitBox', models: [
    { slug: 'bitbox02', name: 'BitBox02 (Bitcoin-only)', current: true },
    { slug: 'bitbox02-multi', name: 'BitBox02 (Multi edition)' },
    { slug: 'bitbox01', name: 'BitBox01 (Digital Bitbox)' },
  ] },
  { brand: 'Blockstream', models: [
    { slug: 'jade-plus', name: 'Blockstream Jade Plus', current: true },
    { slug: 'jade-core', name: 'Blockstream Jade', current: true },
    { slug: 'jade-2021', name: 'Blockstream Jade (original, 2021)' },
  ] },
  { brand: 'Foundation', models: [
    { slug: 'passport-prime', name: 'Passport Prime', current: true },
    { slug: 'passport-core', name: 'Passport Core' },
    { slug: 'passport-gen1', name: 'Passport (gen 1 / batch 2)' },
  ] },
  { brand: 'Bitkey (Block)', models: [
    { slug: 'bitkey', name: 'Bitkey', current: true },
  ] },
  { brand: 'Keystone', models: [
    { slug: 'keystone-3-pro', name: 'Keystone 3 Pro' },
    { slug: 'keystone-essential', name: 'Keystone Essential' },
    { slug: 'keystone-pro', name: 'Keystone Pro / Cobo Vault Pro' },
    { slug: 'cobo-vault', name: 'Cobo Vault' },
  ] },
  { brand: 'KeepKey', models: [ { slug: 'keepkey', name: 'KeepKey' } ] },
  { brand: 'DIY (SeedSigner · Krux · Specter)', models: [
    { slug: 'seedsigner', name: 'SeedSigner' },
    { slug: 'krux', name: 'Krux' },
    { slug: 'specter-diy', name: 'Specter DIY' },
  ] },
  { brand: 'Ellipal', models: [
    { slug: 'ellipal-titan-2', name: 'Ellipal Titan 2.0' },
    { slug: 'ellipal-titan', name: 'Ellipal Titan' },
  ] },
  { brand: 'OneKey', models: [
    { slug: 'onekey-pro', name: 'OneKey Pro' },
    { slug: 'onekey-classic', name: 'OneKey Classic' },
    { slug: 'onekey-touch', name: 'OneKey Touch' },
    { slug: 'onekey-mini', name: 'OneKey Mini' },
  ] },
  { brand: 'Cypherock', models: [ { slug: 'cypherock-x1', name: 'Cypherock X1' } ] },
  { brand: 'NGRAVE', models: [ { slug: 'ngrave-zero', name: 'NGRAVE Zero' } ] },
  { brand: 'GridPlus', models: [ { slug: 'gridplus-lattice1', name: 'GridPlus Lattice1' } ] },
  { brand: 'SecuX', models: [
    { slug: 'secux-v20', name: 'SecuX V20' },
    { slug: 'secux-w20', name: 'SecuX W20' },
    { slug: 'secux-nifty', name: 'SecuX Nifty' },
  ] },
  { brand: "D'CENT", models: [ { slug: 'dcent-biometric', name: "D'CENT Biometric" } ] },
  { brand: 'CoolWallet', models: [
    { slug: 'coolwallet-pro', name: 'CoolWallet Pro' },
    { slug: 'coolwallet-s', name: 'CoolWallet S' },
  ] },
  { brand: 'SafePal', models: [ { slug: 'safepal-s1', name: 'SafePal S1' } ] },
  { brand: 'Tangem', models: [ { slug: 'tangem', name: 'Tangem cards' } ] },
  { brand: 'Other brands', models: [
    { slug: 'arculus', name: 'Arculus' },
    { slug: 'ballet', name: 'Ballet' },
    { slug: 'imkey-pro', name: 'imKey Pro' },
    { slug: 'prokey', name: 'Prokey Optimum' },
    { slug: 'keevo', name: 'Keevo' },
  ] },
];
export const ownableDevices = ownableCatalog.flatMap((b) => b.models.map((m) => ({ ...m, brand: b.brand })));
export const ownableBySlug = Object.fromEntries(ownableDevices.map((d) => [d.slug, d]));
// Display name for any owned slug, including current-lineup devices and free-text
// ("x:<name>") entries the user typed for something not in the catalog.
export function ownedName(slug) {
  if (typeof slug === 'string' && slug.startsWith('x:')) return slug.slice(2);
  return (ownableBySlug[slug] && ownableBySlug[slug].name) || (deviceBySlug[slug] && deviceBySlug[slug].name) || slug;
}
