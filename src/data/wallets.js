// The 2026 hardware-wallet landscape — assessed against criteria, not brand.
// Source: Bitcoin KB "Hardware wallets overview" + live vendor pages.
// Prices/specs verified 2026-07-15 against each vendor's own site — RE-VERIFY before recommending a purchase.
// Trust badges (reproducible build + recoverability) verified 2026-07-16 against vendor repos/docs + WalletScrutiny.
// Rule of the guide: there is no "best" device, only fit-to-purpose.

export const walletsVerified = '2026-07-15';

// rating scale used in the compare table + chooser badges: 'yes' | 'partial' | 'no'
export const wallets = [
  {
    name: 'Coldcard Q',
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
    bestFor: 'Passphrase-heavy workflows (full QWERTY keyboard); strong multisig + BIP-85. Deep features, but everyday use stays straightforward.',
    watch: 'More menus than a minimalist device — though that depth doesn’t make routine use harder. Firmware is source-available, not OSI-licensed.',
    notes: {
      reproducible: 'Firmware is reproducibly buildable — you can rebuild it from source and confirm the binary matches (independently verified on WalletScrutiny).',
      recoverability: 'Standard BIP-39 seed — restore your funds in Sparrow, Electrum, Bitcoin Core, or any competent wallet.',
    },
  },
  {
    name: 'Foundation Passport',
    vendor: 'Foundation Devices',
    price: '$199',
    priceNum: 199,
    airgap: 'yes',      // strict QR-only
    btcOnly: 'yes',
    openSource: 'yes',
    multisig: 'yes',
    secureElement: 'yes',
    reproducible: 'yes',
    recoverability: 'yes',
    useCases: ['first', 'multisig'],
    bestFor: 'Strict air-gap by design (QR only); pleasant UX; rechargeable battery.',
    watch: 'QR-only signing is a little more workflow friction for routine spending. (A larger "Passport Prime," ~$299+, is a separate, more advanced device.)',
    notes: {
      reproducible: 'Fully open-source with documented reproducible builds — the firmware is verifiable, not just trusted.',
      recoverability: 'Standard BIP-39 seed — restorable in any BIP-39 wallet if Foundation ever disappeared.',
    },
  },
  {
    name: 'Trezor Safe 5',
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
    bestFor: 'The only mainstream device with native SLIP-39; colour touchscreen; mainstream UX.',
    watch: 'Multi-coin device. Multisig is adequate rather than best-in-class.',
    notes: {
      reproducible: 'Open-source with documented reproducible builds (verifiable after stripping the vendor signature).',
      recoverability: 'Defaults to a SLIP-39 (Shamir) backup, which only restores in SLIP-39-aware wallets (Sparrow, Electrum, a handful of others) — not every wallet. A plain BIP-39 seed is still an option if you prefer maximum portability.',
    },
  },
  {
    name: 'BitBox02 (BTC-only)',
    vendor: 'Shift Crypto',
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
    vendor: 'Blockstream',
    price: '$79',
    priceNum: 79,
    airgap: 'partial',  // QR camera + USB/Bluetooth
    btcOnly: 'yes',
    openSource: 'yes',
    multisig: 'partial',
    secureElement: 'no',
    reproducible: 'yes',
    recoverability: 'yes',
    useCases: ['first', 'budget'],
    bestFor: 'Genuinely good on a budget; solid multisig; Unchained integration.',
    watch: 'No dedicated secure element (uses a "blind oracle" model). Some multisig quirks. (A premium metal-body "Jade Plus," ~$149, is also sold.)',
    notes: {
      reproducible: 'Open-source with documented reproducible builds.',
      recoverability: 'Standard BIP-39 seed — interoperable both ways with Coldcard, Trezor, Ledger and others.',
    },
  },
  {
    name: 'Bitkey',
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
  { key: 'passphrase', label: 'Passphrase-heavy' },
  { key: 'multisig',   label: 'Multisig component' },
  { key: 'budget',     label: 'Tight budget' },
];

export const budgetBuckets = [
  { key: 'any',      label: 'Any price', max: Infinity },
  { key: 'under150', label: 'Under $150', max: 150 },
  { key: 'under100', label: 'Under $100', max: 100 },
];
