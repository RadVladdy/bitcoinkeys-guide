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
// 2026-07-18: prices re-verified against vendor stores. Blockstream lineup corrected — the $79 entry is the
//   original "Blockstream Jade" (button + screen, no camera → airgap 'no'), NOT the "Jade Core" (that's the $99
//   touchscreen, also no camera; not carried here). Jade Plus is $169 (was $149). Bitkey $250 and Passport Prime
//   $349 (Arctic Copper "America 250" limited edition) both confirmed.
// 2026-07-19: Trezor Safe 3 repriced $79 → $59 at trezor.io (browser-verified: buy price "USD 59",
//   no strikethrough, offer valid to 2031 — a permanent cut, not a sale). Ladder cost-floor cascaded
//   to $59. Freshness runner caught it via the new headless-render deterministic (JSON-LD) price read.
// 2026-07-31: full forced freshness pass + human verification. Jade Plus back DOWN $169 → $149 (store base
//   variant; it has bounced $149→$169→$149 — see changelog history). Trezor Safe line is running a limited-time
//   sale ($47/$103/$224) — editorial decision: the guide shows list prices ($59/$129/$249), which are unchanged;
//   sales are transient. Blockstream formally launched Jade Core ($99, USB-C+Bluetooth, blind oracle, no camera)
//   2026-04-28 — still not carried; a drafted row is staged on the freshness review surface pending device art
//   and a carry/no-carry call. All other prices confirmed at vendor stores today.
// 2026-07-31 (later): Jade Core CARRIED (editorial call) — 12th device, cold tier, explicit slug
//   'jade-core-2026' ('jade-core' was already taken by the $79 Jade; slugs are persisted user data).
//   Ships without device art for now (art render = front of the backlog); the image field is optional
//   since this entry — renderers guard on it and the slug no longer derives from the image basename alone.
// Rule of the guide: every device is rated in three tiers against the published
// standard (standardGates/tiers below, rendered at /standard). Within a tier,
// fit decides — there is still no single "best" device, but there IS a bar.

import { numberWord } from './numbers.js';

export const walletsVerified = '2026-07-31';

// `barCaveat` is the cold tier's honesty layer, and it must AGREE WITH THE BADGES.
// Until 2026-07-30 the Trezor Safe 3 and Safe 5 carried none, so /standard called
// them caveat-free while /wallets showed each of them an amber `~` on Bitcoin-only
// AND on portable recovery — and their own sibling, the Safe 7, carried a caveat
// written about the multi-coin default all three share. If a device shows a
// `partial` on any field a standardGate depends on (btcOnly · openSource ·
// reproducible · recoverability), it needs a caveat saying so in words.

// rating scale used in the compare table + chooser badges: 'yes' | 'partial' | 'no'
import { diceCapability, SUPPORTED, DICE_METHOD_KEYS } from './dice.js';

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
    // NOT 'budget': at $170 it sits above every budget bucket the chooser offers
    // ($150 / $100), so the chip surfaced it to readers who had asked for cheap.
    useCases: ['multisig'],
    bestFor: 'The pocket-sized, lower-cost Coldcard — the same dual secure element, air-gapped MicroSD signing, and Bitcoin-only open-source firmware as the Q, in a credit-card form factor. An excellent affordable multisig signer or travel key; USB-C + NFC for tap-to-sign.',
    watch: 'A numeric keypad (not a full keyboard) makes typing a passphrase more of a chore than the Q, and there’s no built-in QR scanner (it air-gaps via MicroSD). Firmware is source-available rather than OSI open-source — verifiable, but a licensing caveat for purists.',
    notes: {
      reproducible: 'Firmware is reproducibly buildable — rebuild from source and confirm the binary matches. Dual secure elements.',
      recoverability: 'Standard BIP-39 seed — restore your funds in Sparrow, Electrum, Bitcoin Core, or any competent wallet.',
    },
  },
  {
    name: 'Foundation Passport Prime',
    tier: 'spending',
    tierNote: {
      fails: ['minimal-os'],
      summary: 'A capable, secure device — but a general-purpose platform (it runs apps, stores files, 2FA and passkeys) is more surface than a long-term savings vault needs.',
      detail: 'The Passport Prime is well-engineered — open-source, air-gap-capable, with a secure element and a Bitcoin-only first-party wallet — so this is not a security knock. It sits here because it is no longer a minimal signer: it is a general-purpose secure platform that also stores 2FA codes, passkeys and files, adds Bluetooth and NFC, and can run third-party apps. That is more code and more surface than you want on a device whose entire job should be guarding keys for a decade. As a do-more device or an active-use signer it is genuinely capable; for a set-and-forget cold vault we would reach for something simpler from the tier above. If Foundation ships a stripped Bitcoin-only signer again — as the older $199 Passport was — it moves up.',
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
    barCaveat: 'Clears the bar — open-source, reproducibly buildable, with a Bitcoin-only firmware available. Two things worth knowing first: it ships multi-coin by default, so the Bitcoin-only build is something you have to choose; and its Shamir (SLIP-39) backup only restores in SLIP-39-aware wallets, so take the plain BIP-39 seed if you want a backup that restores anywhere.',
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
    barCaveat: 'Clears the bar — the same open-source, reproducible firmware and available Bitcoin-only build as the rest of the Safe line. Two caveats: it ships multi-coin by default, and it defaults to a Shamir (SLIP-39) backup, which only restores in SLIP-39-aware wallets. Choose the plain BIP-39 seed at setup unless you specifically want the split.',
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
    barCaveat: 'A Bitcoin-only firmware is available and the source is open, so it clears the bar — but note it is a multi-coin device by default, and this model adds a Bluetooth radio a USB-only or air-gapped signer does not have. Every spend still needs on-device approval, so we treat the radio as a caveat, not a disqualifier. Its Shamir (SLIP-39) backup, like the rest of the Safe line, only restores in SLIP-39-aware wallets — take the plain BIP-39 seed if you want one that restores anywhere.',
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
    name: 'Blockstream Jade Core',
    slug: 'jade-core-2026', // explicit: no device art yet (art is the front backlog item); 'jade-core' is TAKEN by the $79 Jade above
    barCaveat: 'Clears the bar — Bitcoin-only, fully open-source. Same deliberate trade-off as its siblings: no dedicated secure-element chip; a "blind oracle" acts as a virtual one, and Blockstream argues there is nothing physical on the device to steal.',
    ladderReach: { s: 'strong', p: 'ok', m: 'ok', note: 'Built as a guided first device; passphrase and multisig work but are not its focus.' },
    vendor: 'Blockstream',
    price: '$99',
    priceNum: 99,
    airgap: 'no',        // USB-C + Bluetooth, no camera
    btcOnly: 'yes',
    openSource: 'yes',
    multisig: 'partial', // Sparrow / Nunchuk / Electrum compatible per vendor
    secureElement: 'no', // blind-oracle "virtual secure element"
    reproducible: 'yes',
    recoverability: 'yes',
    useCases: ['first', 'budget'],
    bestFor: 'Blockstream’s beginner-focused device (launched April 2026) — guided setup through the Blockstream app, USB-C or Bluetooth, a Genuine Check authenticity test at setup, and the same fully open-source blind-oracle security as the rest of the Jade line.',
    watch: 'No camera, so no air-gapped QR signing (the Jade Plus adds that), and Bluetooth is present. No dedicated secure element (the blind-oracle model). New hardware — its track record is months, not years.',
    notes: {
      reproducible: 'Same open-source firmware family as the other Jades, with documented reproducible builds.',
      recoverability: 'Standard BIP-39 seed — restorable in any BIP-39 wallet.',
    },
  },
  {
    name: 'Blockstream Jade Plus',
    barCaveat: 'Clears the bar — Bitcoin-only, fully open-source and reproducible, with an air-gap mode. Same deliberate trade-off as the original Jade: no dedicated secure-element chip, so physical-extraction resistance leans on its blind-oracle design rather than a hardened chip.',
    image: '/devices/jade-plus.webp',
    ladderReach: { s: 'strong', p: 'ok', m: 'ok', note: 'Covers the ladder; the joystick makes passphrase and multisig fiddlier, but the camera + battery make it a nicer air-gap unit than the standard Jade.' },
    vendor: 'Blockstream',
    price: '$149',
    priceNum: 149,
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
    tier: 'spending',
    tierNote: {
      fails: ['self-sovereign'],
      summary: 'Clever and secure — a 2-of-3 with no single seed to steal, and Block can’t spend alone — but recovery and daily use lean on Block’s living servers and app, with no seed you hold on steel.',
      detail: 'Bitkey is the most interesting device here, and it clears the security floor cleanly: there is no single master seed to steal, it is a 2-of-3 across three independent keys, and the one key Block holds on its servers cannot move your coins on its own. Architecturally that is stronger against seed theft than a single-seed device. What keeps it out of the cold-storage tier is dependence, not danger. Everyday recovery and setup run through Block’s app and servers; the firmware is source-available but not independently reproducible; there is no 24-word seed you can stamp on steel and walk away with; and while you can export a watch-only descriptor, a clean exit still leans on Block’s own tooling. For an active, phone-first holder or a smaller balance, that trade is often worth it — the experience is excellent and it is real self-custody. For a decade-long vault we would rather not have a company’s servers anywhere in the recovery path. That is exactly the line between it and Ledger: Bitkey splits trust and stays open enough to read; Ledger concentrates a single secret behind firmware you can’t.',
    },
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
    tier: 'disqualified',
    tierNote: {
      fails: ['key-export', 'verifiable'],
      summary: 'Its closed firmware has proven it can ship your single master seed off the device over the internet — so your safety reduces to trusting an unauditable black box.',
      detail: 'By default a Ledger keeps its seed on the device and cannot spend your coins — that part is genuine self-custody, and worth stating plainly. What disqualifies it is what the 2023 “Ledger Recover” service revealed: the closed firmware is capable of extracting your 24-word seed, encrypting it, splitting it, and sending the pieces to third-party custodians over the internet — a capability Ledger had previously told customers was impossible. Recover is opt-in and paid, so this is not a default backdoor or a proven theft. But because the secure-element firmware is closed and unauditable, you cannot verify which code your device is running, so your security collapses to trusting one company not to export your single master secret — now, under a future update, or under a subpoena. A lone seed guarded by an unverifiable black box is exactly the model the security floor exists to reject. (The 2020 leak of around a million customers’ names, addresses and phone numbers, which fuelled phishing and physical-threat campaigns, doesn’t help its case.)',
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
    bestFor: 'Wide ecosystem support — the reason many people already own one. If that’s you, read the standard’s reasoning before relying on it for savings; your BIP-39 seed moves cleanly to a device that clears the bar. (Range spans Nano S Plus to the touchscreen Flex and Stax.)',
    watch: 'Closed-source firmware; the 2023 Recover controversy and 2020 customer-data leak. Engage those before choosing it.',
    notes: {
      reproducible: 'The security-critical Secure Element firmware is closed-source — it can’t be reproduced or independently verified.',
      recoverability: 'Standard BIP-39 seed — restorable in any BIP-39 wallet. (Ledger’s trust caveats are the closed firmware and Recover service, not seed portability.)',
    },
  },
];

// ── The published selection standard: two gates, three tiers ────────────────
// We judge every device on two separate things, and it matters which is which:
//
//   • A hard SECURITY FLOOR — non-negotiables. Miss one and the device is
//     Disqualified ("doesn't clear our bar"), full stop. This is about the
//     security MODEL being sound, not about fit.
//   • SAVINGS-GRADE criteria — what we want on a device guarding a decade of
//     cold savings. A secure device that misses one of these isn't unsafe; it
//     just carries extra surface or dependence we wouldn't want on a vault. It
//     lands in "Built for spending" — fine for active or smaller balances.
//
// Every device is covered in full regardless of tier. A device's tier and
// reasoning live on the device itself (`tier` + `tierNote`); everything the
// pages show is derived from that, so the standard and the list cannot drift.
export const standardGates = [
  // ---- The security floor (miss one → Disqualified) ----
  {
    key: 'key-export', level: 'floor',
    title: 'Your keys can never leave over the internet',
    short: 'No feature — vendor or firmware — can copy, shard, or ship your secret off the device to a server.',
    why: 'The whole reason to own cold storage is that the secret never touches an online system. A device whose firmware is capable of exporting your seed — even encrypted, even opt-in — has put back exactly the risk you paid to remove. Capability is the fail, not just use.',
  },
  {
    key: 'verifiable', level: 'floor',
    title: 'Verifiable — not a closed black box',
    short: 'The code that touches your keys is open enough to inspect, so you are not simply trusting one company’s secret firmware.',
    // NOT "principle number ten" (which this read until 2026-07-30). "Verify, don't
    // trust" is the UMBRELLA in rules.js — deliberately unnumbered — and rule 10 is
    // "Talk about Bitcoin. Never talk about your Bitcoin." A typed number here also
    // escaped the spine's citation grep, which only scans *.astro.
    why: 'Verify, don’t trust — the idea every rule in this guide is an instance of. If the security-critical firmware is closed and unauditable, your safety reduces to a company’s word — and words have been broken before. Source you can read (ideally rebuild and match) clears this; a sealed operating system does not.',
  },
  // ---- Savings-grade (miss one → Built for spending, still secure) ----
  {
    key: 'btc-only', level: 'savings',
    title: 'Bitcoin-only firmware',
    short: 'A firmware that runs only Bitcoin is available for the device.',
    why: 'A signer juggling dozens of other coins carries code you will never use, and every line is attack surface. For money you are locking away, less code doing one job is the safer bet. We only ask that a Bitcoin-only build exists, not that the device can never do anything else.',
  },
  {
    key: 'minimal-os', level: 'savings',
    title: 'A minimal, single-purpose signer',
    short: 'Lean firmware built to hold keys and sign — not a general-purpose gadget that installs apps, stores files, or stays wirelessly connected.',
    why: 'Every extra app, file store, and radio is another door and another thing that can break. A device you cannot turn into a little internet computer is a smaller target — exactly what you want standing guard for years. Great for a daily gadget; more than a vault needs.',
  },
  {
    key: 'self-sovereign', level: 'savings',
    title: 'Self-sovereign, portable recovery',
    short: 'A backup you hold — a standard seed you can restore in independent software — with no dependence on a company’s servers or app to get your coins back.',
    why: 'Self-custody means no permission slips and no expiry date. If your recovery leans on a company staying alive, online, and willing, then your ten-year plan is really their business plan. A seed you can stamp on steel and restore anywhere is the opposite of lock-in.',
  },
];

// The three tiers, in order. A device with no `tier` is 'cold' (recommended).
export const tiers = [
  {
    key: 'cold',
    label: 'Built for cold storage',
    tagline: 'What we’d trust with long-term savings.',
    blurb: 'Clears the security floor and every savings-grade criterion: minimal, verifiable, self-sovereign, Bitcoin-only. A dumb, offline, checkable lump of metal whose only job is to guard your keys for years.',
  },
  {
    key: 'spending',
    label: 'Built for spending',
    tagline: 'Secure — but suited to active or smaller balances, not a savings vault.',
    blurb: 'These clear the security floor: the maker cannot take your coins and no firmware feature can ship your keys off the device, so they are honest self-custody. They miss a savings-grade criterion — a general-purpose OS, or a dependence on a living company’s servers — that adds surface or a lifeline you would not want on money you are locking away for a decade. For everyday use or smaller amounts, they are genuinely good.',
  },
  {
    key: 'disqualified',
    label: 'Doesn’t clear our bar',
    tagline: 'Fails a security non-negotiable.',
    blurb: 'These miss the hard security floor — not a matter of fit or taste. We still cover them in full, because pretending they don’t exist wouldn’t help you, but we would not put your keys on one.',
  },
];

// ── Can you supply your own randomness on this device? ──────────────────────
//
// DERIVED from dice.js, never stated on the wallet row. The dice page and this
// filter answer the same question, and typed twice they would disagree the
// first time a maker shipped a firmware update.
//
// The import runs ONE WAY — dice.js knows nothing about wallets.js — so adding
// this cannot create a cycle.
//
// The assertion is the point: a device added to this file with no entry in
// dice.js FAILS THE BUILD rather than quietly displaying as "no dice support",
// which is a claim we would be making by omission and would never notice.
// Bitkey maps to 'no' for filtering because you genuinely cannot do this on it
// — it has no seed phrase at all — but its reason is different from Trezor's
// refusal, and the dice page draws that distinction where there is room for it.
for (const w of wallets) {
  const cap = diceCapability(w.name);
  if (!cap) {
    throw new Error(`wallets.js: "${w.name}" has no entry in dice.js deviceDice — add one, or the dice filter silently answers "no" for it`);
  }
  w.diceEntropy = DICE_METHOD_KEYS.some((k) => SUPPORTED.has(cap[k])) ? 'yes' : 'no';
}

// Derived groupings — nothing here is hand-maintained.
export const tierOf = (w) => w.tier || 'cold';
export const gateByKey = Object.fromEntries(standardGates.map((g) => [g.key, g]));
export const tierByKey = Object.fromEntries(tiers.map((t) => [t.key, t]));
export const walletsInTier = (key) => wallets.filter((w) => tierOf(w) === key);
export const coldWallets = walletsInTier('cold');
export const spendingWallets = walletsInTier('spending');
export const disqualifiedWallets = walletsInTier('disqualified');

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
  // 'coldTier' is special-cased in the chooser script: it filters on the tier
  // system (only "built for cold storage" devices pass) rather than a rating
  // field. It leads the list because it's the guide's own headline judgement.
  { key: 'coldTier',       label: 'Cold-storage tier' },
  { key: 'btcOnly',        label: 'Bitcoin-only' },
  { key: 'airgap',         label: 'Air-gapped' },
  { key: 'openSource',     label: 'Open-source' },
  { key: 'reproducible',   label: 'Reproducible build' },
  { key: 'recoverability', label: 'Portable recovery' },
  // Derived from dice.js — see the diceEntropy loop above.
  { key: 'diceEntropy',    label: 'Your own dice entropy' },
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
// A device may instead carry an explicit `slug` (needed when it ships before its
// device art exists — the image is optional, the slug is not).
// WARNING: these slugs are PERSISTED USER DATA — they live in saved plans
// (localStorage / downloaded files / Nostr backups). Never rename one (even
// when the slug reads oddly, e.g. jade-core = the original Jade) without a
// migration in plan.js normalize().
export const deviceCatalog = wallets.map((w) => ({
  slug: w.slug ?? w.image.replace('/devices/', '').replace(/\.webp$/, ''),
  name: w.name,
  price: w.price,
  priceNum: w.priceNum,
  tier: w.tier || 'cold',
}));
export const deviceBySlug = Object.fromEntries(deviceCatalog.map((d) => [d.slug, d]));
export function deviceName(slug) { return (deviceBySlug[slug] && deviceBySlug[slug].name) || slug; }
// Map a device display name (as the quiz recommends devices by name) → its slug.
const _slugByName = Object.fromEntries(deviceCatalog.map((d) => [d.name, d.slug]));
export function slugForName(name) { return _slugByName[name] || null; }

// How many keys the user personally holds for a given setup — drives the roadmap
// slots (owned devices fill them; the rest become a "still to get" shopping list).
// Collaborative = the user holds 2 of 3 (a Bitcoin service holds the third).
// The "Getting started" tier returned 0 here — a phone wallet first, no hardware.
// That tier was retired 2026-07-30 when single-sig cold storage became the minimum
// recommendation, so nothing produces it any more. The guard stays for plans SAVED
// under the old tier, which would otherwise ask their owner for a device the plan
// never told them to buy.
export function keysForSetup({ rungSlug, label = '', tier = '' } = {}) {
  if (/getting started/i.test(tier)) return 0;   // legacy saved plans only
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
// Deliberately broader than the comparison above — most people hold an
// OLDER or discontinued model, so this leans legacy. Current-lineup models reuse
// the exact `deviceCatalog` slugs so "I own this" on /wallets and this picker agree.
// Grouped by make for a compact make→model dropdown; `current:true` marks the
// still-sold models. Anything truly unlisted is captured as free text ("x:<name>").
// FRESHNESS SYNC: legacy models here are static and NOT price/availability-checked.
// But when the freshness runner flags a CURRENT device as added/discontinued
// (an `avail-*` judge in ~/dev/bkeys-freshness), update this catalog's `current:`
// flags to match the comparison — that's the only maintenance tie-in.
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
    { slug: 'bitbox02', name: 'BitBox02 (BTC-only)', current: true },
    { slug: 'bitbox02-multi', name: 'BitBox02 (Multi edition)' },
    { slug: 'bitbox01', name: 'BitBox01 (Digital Bitbox)' },
  ] },
  { brand: 'Blockstream', models: [
    { slug: 'jade-plus', name: 'Blockstream Jade Plus', current: true },
    { slug: 'jade-core', name: 'Blockstream Jade', current: true },
    { slug: 'jade-core-2026', name: 'Blockstream Jade Core', current: true },
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
// Prefers the CANONICAL comparison-page name (deviceBySlug) so recommendation
// and support lists match the /wallets cards — the ownable catalog's names are
// picker-phrased (e.g. "Ledger Nano (unsure which)") and only fit legacy models.
export function ownedName(slug) {
  if (typeof slug === 'string' && slug.startsWith('x:')) return slug.slice(2);
  return (deviceBySlug[slug] && deviceBySlug[slug].name) || (ownableBySlug[slug] && ownableBySlug[slug].name) || slug;
}

/**
 * How many tiers the standard defines, in words — so "three tiers" in page copy
 * derives instead of being typed. Invariant #10. It was typed on four spots
 * (/wallets description + callout label + callout body, /standard), one of them
 * mid-sentence between two ALREADY-derived numbers.
 */
export const tierCount = tiers.length;
export const tierCountWord = numberWord(tierCount);

// ── Does a device someone OWNS meet our standard? ───────────────────────────
// Added 2026-07-30. The site had every fact needed to answer this and never once
// asked it: a reader could tell the setup finder they own a Ledger and be shown two
// replacement devices with no explanation, then see "Get a real hardware wallet —
// you have Ledger Nano" on their checklist. Naming what they have while telling
// them to go and get one is the worst of both.
//
// The care needed here is NOT inventing a judgement. 48 of the 59 models in the
// ownership catalog have never been rated, and saying nothing about those is the
// honest answer — `unrated` is a real verdict, not a failure to compute one.
//
// ONE family maps beyond its own slug: the rated "Ledger Nano family" entry says in
// its own copy that it spans the Nano S Plus through the Flex and Stax, and the
// reason it is disqualified (closed firmware that can export the seed) is a property
// of the platform, not of one model. No other brand's rating claims that reach —
// a Trezor Model T is NOT covered by the Safe 3/5/7 entries, so it stays unrated.
const RATED_FAMILY = Object.fromEntries(
  ownableDevices.filter((d) => d.slug.startsWith('ledger')).map((d) => [d.slug, 'ledger'])
);

/** The rated device covering an owned slug, or null if we have never rated it. */
export function ratedSlugFor(slug) {
  if (deviceBySlug[slug]) return slug;
  return RATED_FAMILY[slug] || null;
}

/**
 * Judge a list of owned/planned device slugs against the published standard.
 * Returns one entry per slug: { slug, name, verdict, why }.
 *   verdict: 'cold' | 'spending' | 'disqualified' | 'unrated'
 * `why` is pulled from the device's own tierNote so this can never drift from
 * /standard — there is no second copy of the reasoning.
 */
export function assessDevices(slugs = []) {
  return slugs.filter(Boolean).map((slug) => {
    const ratedSlug = ratedSlugFor(slug);
    // Matched through the canonical slug, NOT by scanning image paths. The
    // `image` field became optional when a device shipped ahead of its art,
    // and this scan touched EVERY wallet before finding its match — so it
    // threw on any device sitting after the art-less one in the array, taking
    // out personalization on /checklist and /my-plan for those owners. The
    // art-less device itself was fine, which is why it went unnoticed.
    const w = ratedSlug ? wallets.find((x) => (x.slug ?? (x.image || '').replace('/devices/', '').replace(/\.webp$/, '')) === ratedSlug) : null;
    if (!w) {
      return {
        slug, name: ownedName(slug), verdict: 'unrated',
        why: 'We haven’t rated this model against our standard, so we can’t tell you either way. Check it against the criteria yourself.',
      };
    }
    const verdict = tierOf(w);
    const why = (w.tierNote && w.tierNote.summary)
      || (w.barCaveat ? w.barCaveat : 'Clears our bar for long-term cold storage.');
    return { slug, name: ownedName(slug), verdict, why, ratedName: w.name };
  });
}

/** True if any of these devices fails to reach the cold-storage tier. */
export const anyBelowBar = (slugs = []) =>
  assessDevices(slugs).some((d) => d.verdict === 'spending' || d.verdict === 'disqualified');
