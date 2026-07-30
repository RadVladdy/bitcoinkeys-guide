// The "deeper dive" demos — the Level-201 interactive tier.
// One source of truth so the /deep-dive hub renders them and /start can count them
// without importing the pages themselves. (Globbing the .astro files pulled every
// demo's client script — and its crypto libraries — into /start; hence this file.)

// `featured` + `motif` (added 2026-07-30) drive the home page's sampler row. Only the
// featured four carry a motif today; the rest can gain one when /deep-dive adopts the
// same cards. Keyed by MOTIF NAME rather than by slug, so a demo can be renamed or
// re-homed without stranding its artwork.
export const deepDives = [
  { href: '/deep-dive/seed', featured: true, motif: 'seed', title: 'Watch a seed get born', desc: 'Generate a throwaway seed and follow it from 128 random bits — with the real SHA-256 checksum — to twelve words to a Bitcoin address.', tag: 'live' },
  { href: '/deep-dive/passphrase', title: 'The passphrase (25th word)', desc: 'Same seed, add a passphrase, land in a completely different wallet. See the decoy-vs-hidden idea for yourself.', tag: 'live' },
  { href: '/deep-dive/bip85', title: 'BIP-85 — one seed, many seeds', desc: 'How one master seed derives an endless supply of fresh, independent child seeds — back up one, re-derive the rest.', tag: 'live' },
  { href: '/deep-dive/multisig', featured: true, motif: 'multisig', title: 'Multisig — why 2-of-3 works', desc: 'Three keys, one wallet, any two to spend. Tap the keys and watch the threshold rule enforce itself — no single point of failure.', tag: 'live' },
  { href: '/deep-dive/dice', featured: true, motif: 'dice', title: 'Roll your own randomness', desc: "Don't trust the device's RNG? Roll a die ~50 times and hash it into a seed that's provably random by your own hand.", tag: 'live' },
  { href: '/deep-dive/signing', title: 'Signing — prove it, without showing the key', desc: "Sign a payment, watch anyone verify it came from your key — then try to tamper with the payment and watch the signature break.", tag: 'live' },
  { href: '/deep-dive/addresses', title: 'One key, four address formats', desc: "Why addresses start with 1, 3, bc1q, or bc1p — all four come out of the same seed, and they're all your Bitcoin.", tag: 'live' },
  { href: '/deep-dive/hd-tree', title: 'One seed, endless addresses', desc: 'How one seed grows a whole tree of addresses — and how an xpub lets someone watch a wallet without ever being able to spend.', tag: 'live' },
  { href: '/deep-dive/shamir', title: 'Split a secret into shares', desc: 'The Shamir math behind SLIP-39: cut a backup into five pieces where any three rebuild it and any two reveal nothing.', tag: 'live' },
  { href: '/deep-dive/key-space', featured: true, motif: 'key-space', title: "Why a key can't be guessed", desc: 'Make 2²⁵⁶ concrete — every atom in the Earth computing since the Big Bang barely reaches a coin-flip for one key.', tag: 'live' },
  { href: '/deep-dive/typo', title: 'How a typo gets caught', desc: 'Change one word in a throwaway seed and watch the built-in checksum make a wallet reject it — before any coins are at risk.', tag: 'live' },
];

/** The demos shown on the home page — derived, never hand-listed (invariant #10). */
export const featuredDives = deepDives.filter((d) => d.featured);
