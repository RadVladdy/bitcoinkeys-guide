// Choosing a metal seed backup.
//
// The guide rates twelve hardware wallets against a published standard and then tells
// the reader to "move it to metal". Without this, that instruction had no answer
// anywhere on the site.
//
// THE FRAMING IS DELIBERATELY DIFFERENT FROM /standard. We rate hardware wallets
// ourselves because that judgement is about design and firmware, which we can read.
// Metal backups are decided by a propane torch, muriatic acid and a 20-ton press, and
// we have not run those tests. Jameson Lopp has, on 75 devices, with published
// per-device results — so: our criteria, his measurements, and we say which is which.
//
// COUNTS AND GRADES DERIVE FROM `metalOutcome`, never typed into copy (invariant #10).
// The distribution is the whole point of the section and it is counter-intuitive:
// MOST devices pass. Writing "roughly half fail" — which this site did, on a
// safety-critical lesson, sourced to Lopp — was wrong by a factor of four and made
// the reader more anxious than the evidence warrants. The useful advice is not "tread
// carefully, it is a minefield"; it is "avoid a short list of specific traps."
//
// PRICES ARE BANDS, NOT FIGURES, and that is a choice about shelf life rather than
// about precision. A band still has to be RIGHT on the day it is stamped: three of the
// five were wrong against Lopp's own published price column, which is the source
// sitting one click away. Check each band against that column whenever this file is
// touched.
//
// EVERYTHING THIS FILE PUBLISHES IS SOMEBODY ELSE'S LIVING DATA, so the verified date
// below is derived, never typed. Until 2026-08-06 it was typed, and the only registry
// entry touching this source was a LINK CHECK — which asks whether the URL loads and
// nothing about whether the numbers moved, while the page carried a verified date over
// three of his figures and five of his prices. The group is now `subtype: metal` in
// ~/dev/bkeys-freshness: the source link, the five purchase links, a judge on the
// outcome distribution and a judge on the price bands. The runner sets the constant
// from that group's floor and `scripts/check-freshness-stamps.py` fails the push if it
// ever runs ahead of it.

/** ISO floor of the `metal` freshness group. Runner-set — never hand-type this. */
export const metalVerified = '2026-07-31';
export const metalSource = {
  name: 'Jameson Lopp\u2019s metal seed storage stress tests',
  url: 'https://jlopp.github.io/metal-bitcoin-storage-reviews/',
  note: 'the canonical independent testing in this space, and the source for every grade and price below.',
};

/** How the devices are actually tested — his parameters, not our paraphrase. */
export const metalTests = [
  { t: 'Heat', d: 'A 2000\u00B0F propane flame held on the device for ten minutes, then quenched in water to imitate a fire being put out.' },
  { t: 'Corrosion', d: 'Submerged in 16% muriatic acid for twelve hours.' },
  { t: 'Crush', d: 'Deformed under a 20-ton hydraulic press, then checked for whether the words can still be read.' },
];

/**
 * The distribution, which is the finding most people get backwards.
 * Recomputed from the source's grade column on the metalVerified date.
 *
 * ⚠️ COUNT THE GRADE, NOT THE LETTER. `topGrade` was 56 until 2026-08-06, which is
 * grade A PLUS grade A- — and the sentence it renders into says "came through every
 * test with nothing lost", which A- does not mean. Every one of the 11 A- devices
 * carries a B in exactly one of the three tests, and the source's own review text
 * explains one of those Bs as a deduction for potential data loss on read-back. The
 * number and its own gloss disagreed. Straight A in heat, corrosion AND crush is 45.
 */
export const metalOutcome = {
  reviewed: 75,
  topGrade: 45,   // grade A overall — straight A in all three tests
  nearTop: 11,    // grade A- — marked down in exactly one of the three
  poor: 10,       // grade D or F overall
};

/** What actually separates a backup that survives from one that doesn't. */
export const metalCriteria = [
  {
    t: 'Stamped or centre-punched — not engraved, printed or etched',
    d: 'The words have to be physically driven into the steel. Surface methods look fine on the shelf and disappear in a fire or an acid bath. This one distinction separates most of the passes from most of the failures.',
  },
  {
    t: 'A single solid plate, not loose tiles',
    d: 'Tile systems ask you to slot dozens of little letter pieces into a frame. They work, but a crush or a drop can scatter them, and reassembling a seed from loose tiles is not something you want to discover under pressure. One plate has nothing to come apart. One tile design in the test set had its rivets dissolve, dropping every letter out — the tester’s own words for the result are catastrophic data loss.',
  },
  {
    t: 'Stainless steel is enough; titanium is optional',
    d: 'Good stainless survives every test that matters — the cheapest device to score top marks throughout costs about the price of a takeaway. Titanium costs several times more and, in these tests, is not measurably tougher. Spend the difference on a second plate in a second location instead.',
  },
  {
    t: 'You write it — no proprietary format, no company involved',
    d: 'A backup that needs a specific company\u2019s product, app or lookup table to read back is a dependency you did not need. Plain BIP-39 words (or their numbers) that any wallet can accept is the whole point.',
  },
  {
    t: 'Room for what you actually hold',
    d: 'Check it fits 24 words if you use 24, and that you have somewhere separate for a passphrase if you run one. A plate sized for 12 words is not a plate you can grow into.',
  },
];

/**
 * OUR shortlist, drawn from the many that pass HIS tests — that division is the whole
 * point of the section. Every entry grades A in all three stress tests; each is here
 * because it also meets the criteria above, which he does not test for.
 *
 * `band` MUST match the source's published price. Verified against it on metalVerified.
 */
export const metalPicks = [
  { name: 'Seedplate', url: 'https://seedplate.com/', method: 'Punched steel',
    band: '$', pick: 'value',
    note: 'Straightforward 2mm punched steel, 12- and 24-word versions, top marks in all three tests, and the cheapest of these by some way. Also sold through Coinkite if you would rather buy from a Bitcoin shop you already use.' },
  { name: 'Coinplate Alpha', url: 'https://getcoinplate.com/', method: 'Punched steel',
    band: '$$',
    note: 'Top marks in every test, and the whole Coinplate family tests well — the cheaper Punch and Grid score identically, so buy on the layout you prefer rather than the price.' },
  { name: 'Steelwallet', url: 'https://bitbox.swiss/steelwallet/', method: 'Centre-punched plate',
    band: '$$',
    note: 'A centre-punch plate from Shift Crypto \u2014 the same Swiss company that makes the BitBox02, which is worth knowing given we rate that device well too. You look each word up and punch its code.' },
  { name: 'BitPLATES Domino', url: 'https://www.bitplates.com/', method: 'Punched 316L steel',
    band: '$$',
    note: 'Marine-grade 316L stainless, perfect scores throughout. A more finished object than a bare plate, for a little more money.' },
  { name: 'CryptoTag Zeus', url: 'https://cryptotag.io', method: 'Punched titanium',
    band: '$$$', pick: 'titanium',
    note: 'Titanium, top marks. Buy it because you want titanium \u2014 not because stainless was not enough, because it is.' },
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
  { key: '$', label: 'roughly $30\u201370' },
  { key: '$$', label: 'roughly $70\u2013110' },
  { key: '$$$', label: '$120 and up' },
];

/**
 * The devices worth naming because they FAILED, and why each failure is instructive.
 * `why` names the design flaw, so the list teaches the criteria rather than just
 * blacklisting five brand names.
 */
export const metalFailed = [
  { name: 'Blockstream Metal', why: 'a tile design whose rivets dissolved in the acid test, spilling every letter out. Made by Blockstream \u2014 whose Jade we rate in our cold-storage tier. A company can build an excellent signing device and a poor backup plate; they are different products with different engineering, and owning one is no reason to trust the other.' },
  { name: 'Ballet Crypto', why: 'failed all three tests outright \u2014 the only device in the set to do so.' },
  { name: 'BitHD Frozen Armor', why: 'destroyed by heat and acid before it reached the press.' },
  { name: 'Ellipal Mnemonic Metal', why: 'also sold alongside a hardware wallet, and also failed heat and corrosion.' },
  { name: 'Bunkeroid', why: 'failed heat and corrosion despite being priced like a premium plate.' },
];

export const metalPickCount = metalPicks.length;
export const metalCriteriaCount = metalCriteria.length;
export const metalTestCount = metalTests.length;
