// Choosing a metal seed backup.
//
// The guide rates eleven hardware wallets against a published standard and then said
// "move it to metal" with no guidance on which metal. That gap was conspicuous — the
// site rates eleven hardware wallets against a published standard and then says
// "move it to metal" without a word on which metal.
//
// THE FRAMING MATTERS AND IS DELIBERATELY DIFFERENT FROM /standard. We rate hardware
// wallets ourselves because that judgement is about design and firmware, which we can
// read. Metal backups are decided by FIRE, ACID AND A 20-TON PRESS, and we have not
// run those tests. Jameson Lopp has — 75 devices, four stress categories, published
// results — and pretending to an independent verdict we did not earn would be exactly
// the dishonesty this site exists against. So: our criteria, his test results, and we
// say which is which.
//
// PRICES ARE BANDS, NOT FIGURES. Wallet prices are watched by the freshness runner
// (~/dev/bkeys-freshness) and carry a verified date; these are not, so a precise
// number would be a claim we cannot keep. Bands by product type stay true for years.
// If these ever earn per-product prices, they need a registry entry first.

export const metalVerified = '2026-07-30';
export const metalSource = {
  name: 'Jameson Lopp’s metal seed storage stress tests',
  url: 'https://jlopp.github.io/metal-bitcoin-storage-reviews/',
  note: '75 devices put through heat (2000°F for ten minutes), corrosion, crush (20-ton press) and shock. The canonical independent testing in this space, and the source for every verdict below.',
};

/** What actually separates a backup that survives from one that doesn't. */
export const metalCriteria = [
  {
    t: 'Stamped or centre-punched — not engraved, printed or etched',
    d: 'The words have to be physically driven into the steel. Surface methods look fine on the shelf and disappear in a fire or an acid bath. This one distinction separates most of the passes from most of the failures.',
  },
  {
    t: 'A single solid plate, not loose tiles',
    d: 'Tile systems ask you to slot dozens of little letter pieces into a frame. They work, but a crush or a drop can scatter them, and reassembling a seed from loose tiles is not something you want to discover under pressure. One plate has nothing to come apart.',
  },
  {
    t: 'Stainless steel is enough; titanium is optional',
    d: 'Good stainless survives every test that matters. Titanium survives more, and costs several times as much for a margin most people will never meet. Spend the difference on a second plate in a second location instead.',
  },
  {
    t: 'You write it — no proprietary format, no company involved',
    d: 'A backup that needs a specific company’s product, app or lookup table to read back is a dependency you did not need. Plain BIP-39 words (or their numbers) that any wallet can accept is the whole point.',
  },
  {
    t: 'Room for what you actually hold',
    d: 'Check it fits 24 words if you use 24, and that you have somewhere separate for a passphrase if you run one. A plate sized for 12 words is not a plate you can grow into.',
  },
];

/**
 * A short list, not a ranking of our own. Every entry below scored top marks across
 * all four of Lopp's stress categories; the two he singles out are marked. This is
 * deliberately not exhaustive — a fuller analysis is a future piece of work.
 */
export const metalPicks = [
  { name: 'Coinplate Alpha', url: 'https://getcoinplate.com/', method: 'Punched steel',
    band: '$', pick: 'value',
    note: 'Top marks in every stress category, cheap, and the whole Coinplate family tests well. A single punched plate is the shape that keeps winning.' },
  { name: 'Steelwallet', url: 'https://bitbox.swiss/steelwallet/', method: 'Centre-punched plate',
    band: '$$',
    note: 'A centre-punch plate from Shift Crypto — the same Swiss company that makes the BitBox02, which is worth knowing given we rate that device well too. You look each word up and punch its code.' },
  { name: 'Seedplate', url: 'https://seedplate.com/', method: 'Punched steel',
    band: '$$',
    note: 'Straightforward 2mm steel, 12- and 24-word versions, tests clean. Also sold through Coinkite if you would rather buy from a Bitcoin shop you already use.' },
  { name: 'BitPLATES Domino', url: 'https://www.bitplates.com/', method: 'Punched 316L steel',
    band: '$$',
    note: 'Marine-grade 316L stainless, perfect scores throughout. A more finished object than a bare plate, for a little more money.' },
  { name: 'CryptoTag Zeus', url: 'https://cryptotag.io', method: 'Punched titanium',
    band: '$$$', pick: 'titanium',
    note: 'Titanium, top marks. Buy it because you want titanium — not because stainless was not enough, because it is.' },
];

// TWO PRODUCTS WERE CUT AFTER LINK-CHECKING, and the reason is worth keeping so a
// future pass does not re-add them from the test results alone. Lopp's data names
// Blockplate as a value pick and the Quadrat Register as the most durable device he
// has tested — but blockplate.com 404s (including the exact product URL his own
// review links), and quadrat.io is a parked GoDaddy for-sale page. Both URLs were
// originally guessed from the product names, which is how a Bitcoin safety guide
// ends up pointing at a domain squatter. EVERY LINK HERE WAS FETCHED AND CONFIRMED
// 200 WITH A BROWSER USER-AGENT. Never ship a purchase link you have not loaded.

/** Bands, so nothing here goes stale the way a figure would. */
export const metalBands = [
  { key: '$', label: 'roughly $30–70' },
  { key: '$$', label: 'roughly $70–120' },
  { key: '$$$', label: '$150 and up' },
];

/**
 * Things that FAILED Lopp's testing and are worth naming, because two of them are
 * sold by companies whose hardware wallets people already own — which is exactly
 * when someone assumes the metal must be fine too.
 */
export const metalFailed = ['Ballet Crypto', 'BitHD Frozen Armor', 'Bunkeroid', 'Ellipal Mnemonic Metal', 'Steeldisk'];

export const metalPickCount = metalPicks.length;
export const metalCriteriaCount = metalCriteria.length;
