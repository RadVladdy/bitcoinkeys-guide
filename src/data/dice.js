// Dice entropy — the facts behind /roll-your-own-seed.
//
// WHY THIS IS A DATA FILE. Every number the walkthrough prints about dice is
// DERIVED here and never typed on the page (invariant #10): bits per roll, how
// many rolls reach a given strength, how many valid final words a device can
// offer. Typed once and echoed across a procedure page, a device table and a
// changelog entry, those figures disagree within a week.
//
// THE ONE THING THIS FILE MUST NEVER HOLD, AND NEITHER MUST THE PAGE: a reader's
// actual dice values, in any form. The site tells readers that a dice sequence is
// secret key material that must never be photographed, saved, or entered into a
// networked computer — so a page that accepted rolls "just to check the maths"
// would contradict the guide's own teaching and put coins at risk. There is no
// input on the page, no storage, and no arithmetic over anything a reader types.
// The only client state is which device is selected, which steps are ticked, and
// a tally of taps that carries no values — and even that is in memory only.
//
// EVERY PROCEDURE BELOW WAS READ OFF THE VENDOR'S OWN CURRENT DOCUMENTATION, and
// each entry carries the URL it came from. A menu path taken from a blog post, a
// forum answer or an older firmware release is a procedure that sends a reader
// hunting through a menu that no longer exists while holding their life savings.

import { numberWord } from './numbers.js';
// The worksheet's own shape, so option 1's steps describe the sheet the reader
// is actually holding. dice-table.js imports nothing from here, so there is no
// cycle — and these must never be re-typed: the 3 + 2 grouping on the printed
// worksheet comes from the same two constants.
import { DICE_PER_WORD, PREFIX_THROWS, seedCosts } from './dice-table.js';

/** ISO date every vendor page and purchase link below was last loaded and re-read. */
export const diceVerified = '2026-08-01';

// ── the maths ───────────────────────────────────────────────────────────────
// All of it derived from two facts: a fair d6 has six faces, and the BIP-39
// English wordlist has 2,048 words. Nothing below is a figure anyone typed.

/** Faces on a fair six-sided die. */
export const D6_FACES = 6;
/** Words in the BIP-39 English wordlist. */
export const WORDLIST_SIZE = 2048;

/** log2(6) ≈ 2.585 — the entropy one honest d6 roll is worth. */
export const bitsPerRoll = Math.log2(D6_FACES);
/** log2(2048) = 11 — the entropy one BIP-39 word carries. */
export const bitsPerWord = Math.log2(WORDLIST_SIZE);

/** Entropy in bits from n independent d6 rolls. */
export const bitsFromRolls = (n) => n * bitsPerRoll;
/** Rolls needed to reach (at least) a target strength in bits. */
export const rollsForBits = (bits) => Math.ceil(bits / bitsPerRoll);

/**
 * BIP-39 shape for a mnemonic of `words` words. Total bits = words × 11, split
 * 32:1 between entropy and checksum. Returns the entropy size, the checksum
 * size, and how many valid final words a device can offer once you have supplied
 * all but the last one yourself.
 *
 * Cross-check that keeps this honest: for 24 words it must come out at 8 options,
 * which is the number BitBox's own dice guide says the device displays.
 */
export const mnemonicShape = (words) => {
  const total = words * bitsPerWord;
  const entropy = (total * 32) / 33;
  const checksum = total - entropy;
  const freeBitsInLastWord = entropy - (words - 1) * bitsPerWord;
  return {
    words,
    entropy,
    checksum,
    /** Words you choose yourself when the device calculates the last one. */
    youPick: words - 1,
    /** Entropy your own words carry in that method. */
    yourBits: (words - 1) * bitsPerWord,
    /** How many valid final words exist — 2^(the entropy bits left in it). */
    finalWordOptions: 2 ** freeBitsInLastWord,
  };
};

/**
 * The two seed lengths, with everything about them computed.
 * `minRollsD6` is the VENDOR'S stated minimum for the hash-the-rolls method, not
 * ours — see the Coldcard entry's source. It is kept beside the derived figure
 * deliberately, because the two do not quite agree and the page says so.
 */
export const seedLengths = [
  { key: '12', words: 12, target: 128, minRollsD6: 50 },
  { key: '24', words: 24, target: 256, minRollsD6: 99 },
].map((s) => ({
  ...s,
  wordsWord: numberWord(s.words),
  shape: mnemonicShape(s.words),
  /** Rolls to CLEAR the target outright, by our own arithmetic. */
  rollsToClear: rollsForBits(s.target),
  /** What the vendor's stated minimum actually buys, in bits. */
  bitsAtMin: bitsFromRolls(s.minRollsD6),
}));

export const seedLengthByKey = Object.fromEntries(seedLengths.map((s) => [s.key, s]));

// ── Passphrase strength ─────────────────────────────────────────────────────
// WHY A PASSPHRASE NEEDS REAL ENTROPY AND NOT CLEVERNESS. BIP-39 turns your
// words plus your passphrase into a seed with PBKDF2-HMAC-SHA512 at 2,048
// iterations — the standard's own figure, frozen, and thin by any modern
// password-hashing standard. So an attacker holding your seed backup can test
// candidate passphrases OFFLINE, as fast as their hardware allows, with no
// wallet to rate-limit them and no lockout to trip. There is nothing between
// them and your coins except how hard the passphrase is to guess.
//
// Which is why this guide gives a passphrase the same treatment it gives a
// seed: build it from the same dice and the same printed word table, and let
// the arithmetic say when it is enough. A phrase you invented is worth a small
// fraction of what it feels like — the memorable structure IS the weakness, and
// it is the part a cracking rig models first.
//
// THE TARGETS ARE NOT ROUND NUMBERS PICKED FOR THE PAGE. Six words clears the
// 64-bit mark that is the usual floor for anything guessed offline; eight
// clears 80, which is where the margin stops depending on assumptions about an
// attacker's hardware. Both derive from bitsPerWord, so the bits on the page
// can never disagree with the words on the page.
export const PBKDF2_ITERATIONS = 2048;

export const passphraseTargets = [
  // `who` is rendered as its own sentence, so it is written as one.
  { key: 'floor', words: 6, who: 'The floor for any passphrase worth having' },
  { key: 'savings', words: 8, who: 'For savings, or anything you would not want to explain losing' },
].map((t) => ({
  ...t,
  wordsWord: numberWord(t.words),
  /** Whole bits, rounded down — never claim a fraction of a bit you don't have. */
  bits: Math.floor(t.words * bitsPerWord),
  /** Off the same printed table: five throws and a coin flip per word. */
  throws: t.words * DICE_PER_WORD,
  flips: t.words,
}));

export const passphraseByKey = Object.fromEntries(passphraseTargets.map((t) => [t.key, t]));

/** The length this guide steers people to when they are rolling by hand anyway. */
export const recommendedLength = seedLengthByKey['24'];

// ── the two families of dice procedure ──────────────────────────────────────
// The distinction that organises the device table, and the thing most write-ups
// of "roll your own seed" leave out: only one family lets the device do the work.

export const methodFamilies = [
  {
    key: 'hashed',
    label: 'The device takes your rolls',
    short: 'device hashes your rolls',
    how:
      'You press 1–6 on the device itself as you roll. The device hashes the whole sequence with SHA-256 and turns the result straight into seed words. Nothing you rolled ever leaves the device, and none of the device’s own randomness is mixed in — which is the entire point.',
    tradeoff:
      'Fewest ways to go wrong: no lookup table, no transcription, no arithmetic. You are trusting the device to hash honestly rather than to be random, and that is a claim you can check afterwards on an offline computer.',
  },
  {
    key: 'final-word',
    label: 'You pick the words, the device finishes them',
    short: 'you pick words, device calculates the last',
    how:
      'You use the vendor’s printed lookup table to turn dice results into BIP-39 words on paper, then type all but the last word into the device. The device works out which final words make a valid checksum and lets you choose one. There is no "enter your rolls" screen — the device only ever sees words.',
    tradeoff:
      'More steps and more places to slip: a mis-read row, a word written in the wrong order, a dropped reroll. It also needs a printed table you must not mark. In exchange it works on devices that have no dice mode at all.',
  },
];

export const familyByKey = Object.fromEntries(methodFamilies.map((f) => [f.key, f]));

// ── per-device procedures ───────────────────────────────────────────────────
//
// The Coldcard's roll minimums are COMPOSED from seedLengths rather than typed
// into its `rolls` string, so the card and the table on the page cannot drift.

const coldcardRolls = seedLengths
  .map((s) => `${s.minRollsD6} for ${s.words} words`)
  .join(', ') +
  ` — Coinkite's own minimums. The device refuses to finish below them, and will also reject a sequence it judges too regular to be real.`;

// `path` is the literal on-screen menu route, in the wording the vendor's current
// documentation uses. `covers` names the models in wallets.js this entry applies
// to, so the page can say which of the devices it rates have a dice path without
// hand-listing them.

export const deviceProcedures = [
  {
    key: 'coldcard',
    options: ['dice-only', 'enrich'],
    vendor: 'Coinkite',
    label: 'Coldcard Q · Mk4 · Mk5',
    covers: ['Coldcard Q', 'Coldcard Mk5'],
    family: 'hashed',
    priority: true,
    dice: 'One ordinary six-sided die.',
    path: ['New Seed Words', 'Advanced', '12 Word Dice Roll  or  24 Word Dice Roll'],
    pathNote:
      'On a device with no seed on it yet. This is the route on current Q, Mk4 and Mk5 firmware — the Mk3 is a different menu entirely, and has its own entry below.',
    rolls: coldcardRolls,
    detail:
      'Each roll changes the running SHA-256 on screen, so you can watch your own entropy accumulate. With zero rolls entered the display always reads e3b0c4…8b855, which is SHA-256 of the empty string — the vendor points this out so you can confirm the device is hashing exactly what you gave it and nothing else.',
    verify:
      'Coinkite publishes rolls.py and rolls12.py so you can reproduce the whole calculation from your sequence and confirm the words match. Their own instruction is to do that on an offline machine — an amnesic live system with no network and no disk — and never on your everyday computer.',
    source: { label: 'Coinkite — Master Seed', url: 'https://coldcard.com/docs/import#dice-rolls-only' },
    source2: { label: 'Coinkite — Verifying Dice Roll Math', url: 'https://coldcard.com/docs/verifying-dice-roll-math/' },
  },
  {
    // THE MK3 IS A SEPARATE ENTRY BECAUSE ITS MENU IS SEPARATE. The vendor's
    // own current security advisory routes the Mk3 through Import Existing >
    // Dice Rolls, which is NOT the path on Q/Mk4/Mk5 — treating one model's
    // menu as the maker's menu would send a reader hunting a screen their
    // device does not have, while holding their savings.
    //
    // It carries no `covers` because this guide does not rate the Mk3, and it
    // is here anyway: it is the model with the least entropy under the 2026
    // seed-generation advisory, so its owners are the readers most likely to
    // be regenerating a seed on the day they arrive here.
    key: 'coldcard-mk3',
    options: ['dice-only', 'enrich'],
    vendor: 'Coinkite',
    label: 'Coldcard Mk3',
    covers: [],
    family: 'hashed',
    dice: 'One ordinary six-sided die.',
    path: ['Import Existing', 'Dice Rolls'],
    pathNote:
      'On an empty Mk3 running firmware 4.2.0 or later — update first, or the device you are about to trust is the one with the defect. Coinkite calls this an advanced procedure and says so plainly; the ordinary New Wallet flow on 4.2.0 is already fixed and is the safer choice unless you specifically want the device to have no hand in your entropy.',
    rolls:
      'At least 99 independent rolls, per Coinkite’s advisory. Fewer than that and this path is not worth taking.',
    detail:
      'This is a dedicated dice-only route: it hashes your roll sequence directly and does not touch the device’s random-number generator at all. That is the whole point of using it on this model — the generator is exactly what the advisory is about.',
    verify:
      'Verify the written backup and the wallet fingerprint of the old seed before erasing anything, verify a receive address on the new one, and send a small test transaction before moving the rest. If the Mk3 is your only device you have to alternate between the two seeds to do this, which is the part people get wrong.',
    source: { label: 'Coinkite — security advisory (Mk3 dice-only migration)', url: 'https://blog.coinkite.com/coldcard-mk3-seed-generation-warning/' },
    source2: { label: 'Coinkite — Verifying Dice Roll Math', url: 'https://coldcard.com/docs/verifying-dice-roll-math/' },
  },
  {
    key: 'jade',
    options: ['sovereign'],
    vendor: 'Blockstream',
    label: 'Blockstream Jade · Jade Plus',
    covers: ['Blockstream Jade', 'Blockstream Jade Plus', 'Blockstream Jade Core'],
    family: 'final-word',
    dice: 'Two 16-sided dice and one 8-sided die — not a d6.',
    path: ['Set Up Jade', 'Advanced Setup', 'Restore Wallet', '12/24 Words', 'Calculate'],
    pathNote:
      'Options → Temporary Signer → 12/24 Words reaches the same screen without committing the device. Choose Calculate, not Existing: Existing is for when you already know your final word.',
    rolls:
      'Three dice thrown together per word, for 11 or 23 words.',
    detail:
      'The three dice are chosen so that 16 × 16 × 8 lands exactly on the size of the BIP-39 wordlist, so every throw maps to one word and nothing is ever discarded. Blockstream publishes the lookup table as a PDF; you need it open beside you.',
    verify:
      'Restore the finished words onto a second device or a watch-only wallet and check the first receive address matches before anything is funded.',
    caution:
      'This is the one method here that does not use a six-sided die. If all you own is a d6, this procedure is not available to you as written. And note who it is documented for: Blockstream keeps a single Jade section in its help centre, but this article’s wording and screens are the Jade and the Jade Plus. There is no Jade Core documentation for it, so we are not going to tell you the menu is identical on a Jade Core — check on the device before you commit to an evening.',
    source: { label: 'Blockstream — Create a recovery phrase using dice', url: 'https://help.blockstream.com/blockstream-jade/add-more-security-functionality/create-a-recovery-phrase-using-dice' },
    source2: { label: 'Blockstream — dice lookup table (PDF)', url: 'https://storage.googleapis.com/dxp-production-assets/content/blockstream-jade/add-more-security-functionality/create-a-recovery-phrase-using-dice/JadeDiceRollsGuide.pdf' },
  },
  {
    key: 'bitbox',
    options: ['sovereign'],
    vendor: 'BitBox',
    label: 'BitBox02',
    covers: ['BitBox02 (BTC-only)'],
    family: 'final-word',
    dice: 'Five six-sided dice and a coin. One die works, it is just slower.',
    path: ['Restore from recovery words', '24 words', 'enter your 23 words', 'pick one of the valid final words'],
    pathNote:
      'It runs through the RESTORE flow rather than a create-a-wallet flow, which reads oddly the first time. That is the supported route in BitBox’s own guide, not a workaround.',
    rolls:
      'Five dice and a coin flip per word, for 23 words — plus rerolls, because any die showing 5 or 6 is thrown again.',
    detail:
      'The dice select a page, a row and a column of BitBox’s printed lookup table. Because 5s and 6s are rerolled, the number of throws you actually make is higher than the arithmetic suggests, and there is no way to know in advance how much higher.',
    verify:
      'BitBox’s own step: once setup finishes, open Manage device → Show recovery words in the BitBoxApp and check every word against your backup card before funding anything.',
    caution:
      'BitBox is blunt about the trade: the standard setup already blends five independent entropy sources, and doing this by hand introduces mistakes that setup cannot make. Their guidance is to follow one documented method start to finish rather than improvise partway through.',
    source: { label: 'BitBox — Create a Bitcoin wallet with your own entropy', url: 'https://support.bitbox.swiss/en_US/create-bitcoin-wallet-own-entropy' },
    source2: { label: 'BitBox — Seed generation with dice (PDF)', url: 'https://bitbox.swiss/bitbox02/BitBox_Diceware_HowTo.pdf' },
  },
  {
    key: 'passport',
    options: ['sovereign'],
    vendor: 'Foundation',
    label: 'Foundation Passport Core',
    covers: [],
    family: 'final-word',
    partial: true,
    dice: 'Your own — Foundation publishes no dice table and states no roll count.',
    path: ['Import Seed', '12 words  or  24 words', 'enter your first 11 or 23 words', 'Generate Final Word'],
    pathNote: 'Firmware 2.3.0 and later.',
    rolls: 'Not stated by the vendor.',
    detail:
      'Foundation supports the shape of the procedure — you supply all but the last word and Passport computes a valid final one — but publishes no method for turning dice into those words. You would be bringing a lookup table from somewhere else, and the vendor’s own wording is that the feature should be used with extreme caution because non-random seed generation can lose everything.',
    verify:
      'Restore the finished phrase onto a second device and confirm it derives the same first address.',
    caution:
      'Half a documented procedure. We list it because the device really does offer the final-word step, not because Foundation has published a way to get to it with dice.',
    source: { label: 'Foundation — Passport Core setup', url: 'https://docs.foundation.xyz/passport/setup/' },
  },
{
    // Coldcard belongs under option 1 as well, and was missing from it. Its
    // matrix row says yes for all three, but this list only carried its
    // on-device path — so a reader following option 1 was told the Coldcard
    // had no route, while the tile beside it said the opposite. Two surfaces
    // disagreeing about one device, each internally fine.
    key: 'coldcard-words',
    options: ['sovereign'],
    vendor: 'Coinkite',
    label: 'Coldcard Q · Mk4 · Mk5',
    covers: ['Coldcard Q', 'Coldcard Mk5'],
    family: 'final-word',
    dice: 'One ordinary six-sided die and a coin, with our table.',
    path: ['Import Existing', '12 / 18 / 24 Words'],
    pathNote:
      'On a device with no seed on it. Type the words you chose; as you reach the last one the device narrows the keyboard to the finals that make a valid checksum, so you cannot enter an impossible word.',
    rolls: 'Set by the table, not by the device — five throws and a flip per word.',
    detail:
      'The Coldcard is the only device here that can do this AND take dice directly, so you can pick whichever option you trust more without buying different hardware.',
    verify:
      'Check the fingerprint against an independent wallet before funding, exactly as with any other route.',
    source: { label: 'Coinkite — Master Seed', url: 'https://coldcard.com/docs/master-seed/' },
  },
  {
    key: 'coldcard-mk3-words',
    options: ['sovereign'],
    vendor: 'Coinkite',
    label: 'Coldcard Mk3',
    covers: [],
    family: 'final-word',
    dice: 'One ordinary six-sided die and a coin, with our table.',
    path: ['Import Existing', '24 Words'],
    pathNote:
      'Twenty-four words only on this model — there is no 12-word equivalent. It offers the eight valid final words and you choose one.',
    rolls: 'Twenty-three words from the table; the device supplies the last.',
    detail:
      'Included because Mk3 owners are the most likely to be regenerating a seed, and every menu on this model differs from the newer Coldcards.',
    verify:
      'Verify the written backup and fingerprint of the old seed before erasing anything, and move funds only after a small test.',
    source: { label: 'Coinkite — security advisory', url: 'https://blog.coinkite.com/coldcard-mk3-seed-generation-warning/' },
  },
];

/** Devices this guide rates that have NO dice path, and what the vendor says instead. */
export const noDicePath = [
  {
    key: 'trezor',
    label: 'Trezor Safe 3 · Safe 5 · Safe 7',
    covers: ['Trezor Safe 3', 'Trezor Safe 5', 'Trezor Safe 7'],
    why:
      'There is no dice option on any Trezor and no plan for one. Trezor’s position, in its own words, is "Never choose your own wallet backup" — the wallet will not be secure and funds could be lost. Its answer to the single-RNG problem is to blend several independent sources instead: host randomness plus the microcontroller’s hardware generator, plus the Optiga secure element on the Safe 3 and Safe 5, plus the TROPIC01 chip on the Safe 7. Trezor Suite can also challenge the device afterwards to prove the host’s randomness really was used.',
    reality:
      'That is a genuine mitigation and it is not the same thing as rolling your own. It replaces one generator with four; it still asks you to trust that four generators, all inside the same device, are behaving. If you want dice specifically, this is not the device to do it on.',
    source: { label: 'Trezor — What is entropy and how does Trezor generate your wallet', url: 'https://trezor.io/guides/trezor-devices/trezor-fundamentals/what-is-entropy-and-how-does-trezor-generate-your-wallet' },
  },
  {
    key: 'passport-prime',
    label: 'Foundation Passport Prime',
    covers: ['Foundation Passport Prime'],
    why:
      'Foundation’s documentation for the Prime describes seed generation from the microcontroller, the secure element and an avalanche noise source, and lists its restore options as SeedQR, BIP-39 words, an encrypted Passport Core backup, or Keycards. Dice, custom entropy and a final-word calculation are not mentioned.',
    reality:
      'The Passport Core has the final-word feature; the Prime’s documentation is silent on whether it inherited it. Silent is not the same as absent — but a procedure the vendor has not written down is not a procedure we will publish.',
    source: { label: 'Foundation — Passport Prime setup', url: 'https://docs.foundation.xyz/prime/setup/' },
  },
];

// ── what you need ───────────────────────────────────────────────────────────

export const kit = [
  {
    t: 'A die you trust',
    d: 'A fair six-sided die, ideally a sharp-edged casino die rather than the rounded one out of a board game. A cheap moulded die is very slightly biased; it will not ruin a seed on its own, but it is the one input you cannot check afterwards.',
  },
  {
    t: 'A room with no one in it',
    d: 'No people, no cameras, no smart speaker, no video call left running on a laptop across the room. Phones somewhere else entirely — not face-down on the table.',
  },
  {
    t: 'The hardware wallet, with no seed on it',
    d: 'A new device, or one you have deliberately wiped. Update the firmware first, so the device you are about to trust is the fixed version.',
  },
  {
    t: 'Something to write on that is not a phone',
    // Names the worksheet, deliberately WITHOUT restating what it is — the
    // failure-modes list further down the same page already explains it, and
    // the first draft of this line repeated that sentence almost word for word.
    d: 'Paper and a pen for the seed words — our printable worksheet is made for exactly this. Not a notes app, not a photo, not a password manager, not a laptop. Metal comes later, once the words are confirmed.',
  },
  {
    t: 'An hour you are not being interrupted in',
    d: 'A hundred rolls entered carefully is genuinely tedious. Losing count halfway and guessing is worse than not doing this at all.',
  },
];

// ── the failure modes ───────────────────────────────────────────────────────
// Ordered by how likely a careful person is to hit them, not by severity.

export const failureModes = [
  {
    t: 'Recording the sequence anywhere digital',
    d: 'The list of rolls IS the seed, in a different alphabet. Typing it into a phone to keep count, photographing the tally sheet, or checking the maths on your everyday laptop hands over the wallet as surely as posting the words. Coinkite says to verify only on an offline amnesic system; BitBox says the numbers must never touch an electronic device except the wallet itself. Both mean it literally.',
  },
  {
    t: 'A die that is not fair',
    d: 'Loaded, chipped, or heavily rounded dice skew the distribution. You cannot detect this from a hundred rolls by eye, and you will not get a warning. Use a sharp-edged die you have no reason to distrust, and if you find one behaving oddly afterwards, start again with a different one.',
  },
  {
    t: 'Rolling somewhere you are overlooked',
    d: 'A camera that sees the table sees the seed. So does anyone standing behind you, and so does an open laptop lid. This is the failure mode that does not feel like one at the time.',
  },
  {
    t: 'Losing count',
    d: 'Rolling is dull and it is easy to lose your place at roll seventy. Being under the minimum silently is the danger; being over it costs nothing at all. If you genuinely do not know where you are, keep rolling — extra rolls never weaken the result. This is what the printable worksheet is for: a numbered row per word, filled in as you go, so your place is on the paper rather than in your head.',
  },
  {
    t: 'Stopping early because it is boring',
    d: 'The device will stop you below its minimum, but only on the methods where the device counts. On a lookup-table method nothing checks you, and eleven words instead of twenty-three is a wallet with a fraction of the strength you think it has.',
  },
  {
    t: 'Making the rolls up',
    d: 'Typing a plausible-looking string instead of throwing the die is the one mistake that has actually cost people coins. People are extremely bad at inventing randomness, and an attacker searching human-shaped sequences is a well-understood attack. Coinkite spells it out: you cannot fabricate rolls without compromising security.',
  },
  {
    t: 'Never testing the backup',
    d: 'A seed you rolled yourself is exactly as easy to write down wrong as one the device generated. Wipe the device and restore from your written words before a single satoshi goes in.',
  },
];

// ── the walkthrough itself ──────────────────────────────────────────────────
// Rendered as a list that is ALWAYS fully visible. A procedure you follow while
// holding a die in one hand must not hide the next instruction behind a button:
// the ticks record where you are, they never gate what you can read.

// Roll counts for the copy below, derived: `rollsToClear` is the point at which
// the reader's own dice carry the seed's full target strength by our own
// arithmetic. Coinkite's stated minimums sit just under it, which is why the
// recommendation is the derived number and not the vendor's.
const W12 = seedLengths[0].words, W24 = seedLengths[1].words;
const ROLLS12 = seedLengths[0].rollsToClear, ROLLS24 = seedLengths[1].rollsToClear;

// THE DEVICE-ENTRY WALKTHROUGH — options 2 and 3, both Coldcard-only.
//
// ORDER IS A DEPENDENCY CHAIN, not a preference. The length is decided FIRST
// because it picks the actual menu item on the device ("12 Word Dice Roll" or
// "24 Word Dice Roll") and sets how long you will be rolling; it used to sit at
// step three, after the firmware update and after the room had been locked
// down, which is deciding something you already needed.
//
// NO TALLY, ON EITHER OPTION. The Coldcard counts your throws on its own screen
// and shows a running hash — the reader never writes a number down, so the
// "mark your tally / destroy the tally" steps were describing paperwork that
// does not exist and telling readers to burn a sheet they never made.
const deviceSteps = (kind) => {
  const target = kind === 'dice-only';
  return [
    {
      t: target ? 'Decide 12 words or 24, and a roll target' : 'Decide 12 words or 24',
      d: target
        ? `Pick the length first — it is the menu item you choose on the device, so you need it before you touch anything. Then pick how many times you will roll. ${ROLLS24} throws for a ${W24}-word seed is our recommendation and ${ROLLS12} for a ${W12}-word one; those are the counts at which your own dice alone carry the full strength of the seed, and Coinkite's own minimums sit just underneath them. The device counts for you and will not let you finish short, so the number is a target to head for rather than something to keep track of. It goes quicker than it sounds: roll, press, roll, press.`
        : `Pick 12 or 24 words as usual; longer is the easy answer since the effort is the same either way. There is no roll target on this option — the device has already produced a full-strength seed on its own and yours is being added on top, so any number of throws is an improvement and none of them is a threshold.`,
    },
    {
      t: 'Update the firmware, then wipe the device',
      d: 'Do this before anything else, on a device with no coins on it — and do it now, while you still have a computer and the internet to hand, because the next step shuts all of that down. A dice seed generated on old firmware is still a seed generated on old firmware. If the device already holds a wallet you care about, stop and deal with that separately: this procedure starts from empty.',
    },
    {
      t: 'Clear the room',
      d: 'Phones out of the room. Laptop lids shut. Nothing recording, nothing on a call, nobody behind you. Get the die out before you start so you are not walking around mid-sequence.',
    },
    {
      t: 'Find the dice screen on your device',
      d: 'Get to the exact screen before you throw anything. The menu path is below and it is different on every make; on at least one it has moved between firmware versions. This is not the moment to be hunting.',
    },
    {
      t: 'Roll and enter, one at a time',
      d: 'Throw the die, read it, press it, throw again. Do not throw a handful and read them off, and do not roll ahead while entering — the moment you are working from a short list you have written down, that list is your seed sitting on a table. The device shows its own count as you go, so there is nothing for you to record.',
    },
    target
      ? {
          t: 'Keep going until you pass your target',
          d: 'Watch the count on the screen and stop when it is past the number you picked. Overshooting costs you nothing and removes the only question you cannot answer later, so if you lose track, keep rolling rather than guessing — more throws than you think is fine, fewer is not.',
        }
      : {
          t: 'Stop whenever you want to',
          d: 'Ten throws are better than none and a hundred are better than ten, but nothing happens at any particular number and nothing is waiting to be satisfied. This is the step that costs you the least in the whole procedure, and it is why this is the option we suggest by default.',
        },
    {
      t: 'Write the words down, on paper, by hand',
      d: 'Read them off the device screen. Not a photo, not a QR code into anything, not read aloud. Check the spelling of each word against the device before moving on — half the BIP-39 list looks like the other half at a glance.',
    },
    {
      t: 'Wipe the device and restore from your written words',
      d: 'Before anything goes in. This is the step that tells you today, rather than in five years, whether what you wrote down actually rebuilds the wallet. If it does not restore, you have lost nothing yet.',
    },
    {
      t: 'Copy the words to metal, and check each one as you copy',
      d: 'Paper survives a drawer; it does not survive a fire or a flood. Read each word off your sheet and check it again on the metal — this is the second of the two times you transcribe your seed, and both are places one goes quietly wrong.',
    },
    {
      t: 'Fund it — small first',
      d: 'Send a small amount, confirm it arrives, then send a spend back out to prove you can move it. Only after that does the rest follow.',
    },
  ];
};

export const walkSteps = deviceSteps('dice-only');
const enrichWalkSteps = deviceSteps('enrich');

// ── OPTION 1 HAS ITS OWN PROCEDURE, AND IT IS NOT THIS ONE ──────────────────
// The steps above are the DEVICE-ENTRY walkthrough: find the dice screen, press
// each roll in, read the words off the screen. That is `family: 'hashed'` —
// options 2 and 3.
//
// Option 1 is the opposite shape and was being given those steps anyway. Under
// "you pick every word", the page told the reader to find the dice screen on
// their device and enter throws into it, four lines below its own sentence
// saying the device never generates anything and their randomness never touches
// a machine. Both halves on one screen, contradicting each other, on a
// safety-critical procedure — and it also broke a promise made on
// /dice-word-table, which tells the reader they do not roll the last word and
// that "the procedure on the site explains how, for each device."
//
// THE SHAPE OF OPTION 1, which every `family: 'final-word'` device entry below
// already encodes: you roll and read words off OUR printed table, by hand, on
// paper. The device is not involved until every word but the last is chosen,
// and its only job is the final word — the one carrying the checksum, which
// cannot be rolled and cannot be worked out by hand.
//
// EVERY NUMBER HERE DERIVES from mnemonicShape() and seedCosts. `youPick`,
// `finalWordOptions` and the throw counts all move on their own if the table's
// arithmetic ever changes, which is the whole reason those helpers exist.
const shape24 = mnemonicShape(24);
const shape12 = mnemonicShape(12);

const COST12 = seedCosts.find((c) => c.words === 12);
const COST24 = seedCosts.find((c) => c.words === 24);

export const tableWalkSteps = [
  {
    // FIRST, because step two prints a worksheet and there is one per length —
    // a reader who has not chosen yet cannot do step two. It used to sit at
    // position four, after the printing, and spent its length explaining the
    // checksum and which word you do not roll. That is true, and it is not what
    // this step is for: the reader here is deciding between two lengths, and the
    // checksum is already covered on the method sheet, on the worksheet's last
    // row, and in the step that finally involves the device.
    t: 'Decide 12 words or 24 — before you print anything',
    d: `Both are standard and every wallet worth owning takes either. This is not really a security decision: ${COST24.words} words carries more randomness than ${COST12.words}, and both are already so far past anything that could be guessed that neither is the weak point in your setup. It is a decision about WORK, and by hand the difference is large. ${COST24.words} words means ${COST24.chosen} lookups and roughly ${COST24.throws} throws; ${COST12.words} means ${COST12.chosen} lookups and about ${COST12.throws}. That is an evening against an hour — and every lookup is another chance to write a word on the wrong line, which is the way this procedure actually goes wrong. Our suggestion: if this is a stack you mean to leave alone for years and you are doing it by hand anyway, take ${COST24.words}; the extra margin costs one more page of rolling, once, ever. If it is your first time, or the amount is modest, ${COST12.words} done carefully beats ${COST24.words} done tired. Whichever you pick, print that worksheet and only that one.`,
  },
  {
    // RIGHT AFTER THE CHOICE, because it is the first thing that choice runs
    // into: you pick 24 and the sheet has 23 rows. That is surprising, it looks
    // like a mistake, and finding out mid-procedure while holding key material
    // is the wrong moment.
    // DELIBERATELY NO ARITHMETIC. The version of this that got cut explained
    // checksum bits, which is true and is not what a beginner is asking. The
    // question is "why is my sheet one short?" — so that is what it answers, in
    // terms of something they can see.
    // AND IT STOPS AT "the device does it". HOW the device does it belongs to
    // the step that involves the device, and stating the mechanics twice is two
    // copies of one fact waiting to disagree.
    t: 'You roll every word but the last one',
    d: `So a ${COST24.words}-word seed is ${COST24.chosen} lookups and a ${COST12.words}-word seed is ${COST12.chosen}, not ${COST24.words} and ${COST12.words}. This surprises everyone the first time and nothing has gone wrong. The final word is not free to be anything: it has to agree with all the words in front of it, and that agreement is what lets a wallet tell you when you have mistyped one of them years later. It cannot be worked out with a die and a printed table, so your hardware wallet works it out for you at the end. That is why your worksheet has one greyed row at the bottom marked "not rolled", and why its count stops one short of the length you picked.`,
  },
  {
    t: 'Print the BIP-39 word table, a worksheet, and read the method sheet first',
    d: 'Three separate things, and it matters which is which: the BIP-39 WORD TABLE is the reference you look words up in and it is public; the WORKSHEET is where you write, and it becomes your seed; the METHOD SHEET is the one-page instructions. There is a worksheet for each seed length — print only the one you are doing. The downloads are directly below this list of steps. Read the method before you throw anything — it is the part that says which throws map to which column, and that 5s and 6s are rerolled, which is why no entry on the table contains one. The table holds no secret and is safe to print, photograph or leave lying about: it is the standard word list in a fixed order, and anyone can regenerate it.',
  },
  {
    t: 'Update the firmware, then wipe the device',
    d: 'Even though the device plays almost no part here, it still holds the finished seed at the end. Do this first, on a device with no coins on it. If it already holds a wallet you care about, stop and deal with that separately — this procedure starts from empty.',
  },
  {
    t: 'Clear the room',
    d: 'Phones out of the room. Laptop lids shut. Nothing recording, nothing on a call, nobody behind you. Get the die, the coin, the table, the pen and the paper out before you start so you are not walking around mid-sequence.',
  },
  {
    t: 'Fill in one row at a time — throws, flip, then the word',
    d: `The worksheet has a row per word: ${PREFIX_THROWS} boxes for the throws that find your block, ${DICE_PER_WORD - PREFIX_THROWS} for the ones that find the line inside it, one for the coin, and the word itself at the end. Complete a row before you throw for the next one. Rerolled 5s and 6s are the exception and do not go in a box — they do not count and are not recorded, which is why no entry in the table contains one. Do not roll several words ahead: the row bands every five rows are there because the mistake this sheet exists to prevent is a word written on the wrong line. AND FROM THE FIRST MARK YOU MAKE, THIS SHEET IS YOUR SEED — the throws alone already are it, in another alphabet, before a word is written beside them. Never photograph it, never type it up, never leave it out, and keep it in the room until you are done.`,
  },
  {
    t: 'Count your words before the device is switched on',
    d: `You should have exactly ${shape24.youPick} words in order (or ${shape12.youPick}), each one legible and spelled the way the table spells it. Check the count and the spelling now. Half the BIP-39 list looks like the other half at a glance, and a word you cannot read later is a seed you cannot restore.`,
  },
  {
    t: 'Now the device — and only for the last word',
    d: `Use the device's IMPORT or RESTORE flow, not "create a new wallet". That reads oddly the first time and it is correct: you are not asking it to make a seed, you are handing it one and asking for the final word. Type your words in, and at the last position the device does the only thing it does in this procedure — it produces a valid final word. Some devices calculate one for you; some offer the valid options and let you choose. There are ${shape24.finalWordOptions} of them for a 24-word seed and ${shape12.finalWordOptions} for a 12-word one, because a few bits of your own randomness still live in that word alongside the checksum. Your exact menu path is below.`,
  },
  {
    t: 'Write the final word in the last row, then wipe and restore',
    d: 'The worksheet keeps a box for it on the row marked "not rolled" — it is as much a part of your seed as the ones you chose. Then wipe the device and restore it from the full written list, so you find out today rather than in five years whether you transcribed it correctly.',
  },
  {
    t: 'Copy to metal, and check each word as you copy',
    d: 'This is the permanent backup, and it has to exist before the paper one goes. Read each word off the sheet and check it again on the metal — this is the second of the two transcriptions in this procedure, and both of them are places a seed goes quietly wrong.',
  },
  {
    t: 'Only now, destroy the worksheet',
    d: 'Once the words are on their permanent backup and you have restored successfully from it, the sheet has done its job and is nothing but a liability. Burn or shred it; do not simply bin it. Destroying it any earlier means the only copy of your seed is a device you have not finished testing.',
  },
  {
    t: 'Fund it — small first',
    d: 'Send a small amount, confirm it arrives, then send a spend back out to prove you can move it. Only after that does the rest follow.',
  },
];



/**
 * The right walkthrough for a method — three of them, not one.
 *   sovereign  → the table procedure; the device only computes the last word
 *   dice-only  → device entry, with a roll target the vendor sets
 *   enrich     → device entry, with no target at all
 * The page must never render one under another. That is the bug this function
 * exists to make unreachable rather than merely unlikely.
 */
export const walkStepsFor = (methodKey) => {
  if (methodKey === 'sovereign') return tableWalkSteps;
  if (methodKey === 'enrich') return enrichWalkSteps;
  return walkSteps;
};

/** Derived counts for copy that states how many of these there are. */
export const walkStepCount = walkSteps.length;
export const tableWalkStepCount = tableWalkSteps.length;
export const kitCount = kit.length;
export const failureModeCount = failureModes.length;
export const diceDeviceCount = deviceProcedures.length;
export const noDiceCount = noDicePath.length;

// ── THE FOUR OPTIONS ────────────────────────────────────────────────────────
//
// The page leads on these, in order of how much of the randomness is yours.
// They are FOUR because "let the device do it" is a real choice that most
// readers will make, and a page that lists only the effortful options reads as
// disapproval and gets closed.
//
// Support is stated PER DEVICE below and joined here, never typed into the
// copy — the whole point of the tiles is that they answer "can mine do this?"
// and an answer that drifts from the device data is worse than no answer.

export const methods = [
  {
    key: 'sovereign',
    n: 1,
    label: 'You pick every word',
    tagline: 'The device never generates anything.',
    yours: 'All of it.',
    how:
      'You roll for each word and read it off a printed table, then type all but the last word into the device. The device computes only the final word, which carries the checksum and cannot be worked out by hand. Your randomness never touches a machine.',
    tradeoff:
      'The most work by a distance, and the most places to slip: a mis-read row, two words swapped, a dropped reroll. Nothing about it is secret, though — the table is public and so is the arithmetic, so every step can be checked.',
    trust: 'Nothing but arithmetic you can verify yourself.',
    // `pick` is the CHOOSING line — it renders on the tab, above the fold, so
    // the reader can compare the three without opening each one. It states the
    // differentiator and the cost in one breath, because those are the two
    // things the choice actually turns on. Kept to one sentence deliberately:
    // a tab that needs a paragraph is a tab nobody reads.
    pick: 'Every word is yours, and nothing about it needs trusting — but it is an evening\u2019s work with a printed table.',
  },
  {
    key: 'dice-only',
    n: 2,
    label: 'Your rolls, hashed by the device',
    tagline: 'Its random number generator plays no part.',
    yours: 'All of it.',
    how:
      'You press each roll into the device as it happens. It hashes the sequence and turns that into your words. None of its own randomness is mixed in.',
    tradeoff:
      'Far fewer ways to go wrong than option 1 — no table, no transcription, no arithmetic — and the result is reproducible, so you can check the words afterwards on an offline computer. You are trusting the device to hash honestly rather than to be random.',
    trust: 'The device to do arithmetic faithfully.',
    pick: 'The device’s own generator plays no part, and there is nothing to look up or transcribe — but only Coinkite devices take dice on the device.',
  },
  {
    key: 'enrich',
    n: 3,
    label: 'Your rolls added to the device’s own',
    tagline: 'Belt and braces.',
    yours: 'Mixed in with the device’s.',
    how:
      'The device generates as usual, and you add as many rolls as you like on top. The two are combined.',
    tradeoff:
      'The cheapest real protection here. If the device’s randomness turns out to be broken, your rolls save you; if your rolls are sloppy, its randomness saves you. Coinkite states in its own documentation that this cannot produce worse entropy than letting the device do it alone.',
    trust: 'Either source alone is enough for it to be safe.',
    pick: 'The cheapest real protection here: a few minutes, no lookup table, and it cannot make the result worse than leaving it to the device.',
    // THE HOUSE RECOMMENDATION — never rendered as a badge.
    //
    // A default is the wrong shape for this choice. Which option is right
    // depends on the device the reader owns and how far they want to go, so a
    // rosette on one tile makes the other three read as runners-up before the
    // reader knows which their own hardware can even perform.
    //
    // The STANCE is unchanged: where your device allows it, add your own
    // throws. This flag is what a tailored recommendation reads to suggest and
    // order the options. It stays for that reason — remove it and the stance
    // has no enforcement point in the data at all.
    houseDefault: true,
  },
  {
    key: 'device',
    n: 4,
    label: 'Let the device do it',
    tagline: 'The ordinary way, and not a wrong answer.',
    yours: 'None of it.',
    how:
      'You choose "create a new wallet" and write down the words it shows you.',
    tradeoff:
      'Nothing to get wrong, which genuinely matters — far more coins are lost to botched setups than to faulty randomness. The cost is that the device is a single point of failure for the one number everything else rests on, and you have no way to check it from outside.',
    trust: 'The maker, completely, on the thing you cannot inspect.',
  },
];

export const methodByKey = Object.fromEntries(methods.map((m) => [m.key, m]));
export const methodCount = methods.length;

// ── WHAT EACH DEVICE ACTUALLY ALLOWS ────────────────────────────────────────
//
// `name` matches wallets.js exactly where we rate the device, so /wallets can
// join on it. Entries with rated:false are here because readers own them, not
// because this guide recommends them.
//
// EVERY CLAIM IS PER MODEL. A maker's other model doing something is not
// evidence, and treating one model's menu as the maker's menu has already
// produced one defect on this page. Where the finding is derived from firmware
// source rather than a vendor sentence, `sourceDerived` says so and the page
// prints that rather than implying a vendor confirmed it.
//
// 'partial' is a real value and is not a soft yes: on Passport Core the device
// picks the final word's leftover entropy bits with its OWN generator and shows
// you one word, where Jade, BitBox02 and Coldcard hand you the full set of
// valid final words and let you choose. It looks like option 1 and is not.

export const deviceDice = [
  {
    name: 'Coldcard Q', rated: true, vendor: 'Coinkite',
    sovereign: 'yes', 'dice-only': 'yes', enrich: 'yes',
    note: 'The only maker here that takes dice on the device itself, and it supports all three.',
  },
  {
    name: 'Coldcard Mk5', rated: true, vendor: 'Coinkite',
    sovereign: 'yes', 'dice-only': 'yes', enrich: 'yes',
    note: 'Coinkite states the Mk5 runs the same firmware image as the Mk4, which is where this comes from — there is no Mk5-specific menu documentation.',
    sourceDerived: true,
  },
  {
    name: 'Blockstream Jade', rated: true, vendor: 'Blockstream',
    sovereign: 'yes', 'dice-only': 'no', enrich: 'no',
    note: 'Blockstream publishes its own dice guide, though it asks for two 16-sided dice and an eight-sided one rather than an ordinary die.',
  },
  {
    name: 'Blockstream Jade Plus', rated: true, vendor: 'Blockstream',
    sovereign: 'yes', 'dice-only': 'no', enrich: 'no',
    note: 'Same firmware tree as the Jade; the final-word feature is not restricted by board type.',
    sourceDerived: true,
  },
  {
    name: 'Blockstream Jade Core', rated: true, vendor: 'Blockstream',
    sovereign: 'yes', 'dice-only': 'no', enrich: 'no',
    note: 'Confirmed from Blockstream’s own firmware source and its published list of build targets, which names the Core. No Blockstream help page mentions the Core by name in this context, so we are telling you where this comes from rather than implying they said it.',
    sourceDerived: true,
  },
  {
    name: 'BitBox02 (BTC-only)', rated: true, vendor: 'BitBox',
    sovereign: 'yes', 'dice-only': 'no', enrich: 'no',
    note: 'BitBox publishes a lookup table and a walkthrough, and its firmware source says this case exists specifically so a seed can be made with dice and no external software.',
  },
  {
    name: 'Trezor Safe 3', rated: true, vendor: 'Trezor',
    sovereign: 'no', 'dice-only': 'no', enrich: 'no',
    note: 'Not an omission — a position. Trezor’s protocol has no way to accept your entropy or a partial phrase, and the company’s published advice is that you should never choose your own backup.',
  },
  {
    name: 'Trezor Safe 5', rated: true, vendor: 'Trezor',
    sovereign: 'no', 'dice-only': 'no', enrich: 'no',
    note: 'Same across the whole Safe line.',
  },
  {
    name: 'Trezor Safe 7', rated: true, vendor: 'Trezor',
    sovereign: 'no', 'dice-only': 'no', enrich: 'no',
    note: 'Same across the whole Safe line.',
  },
  {
    name: 'Foundation Passport Prime', rated: true, vendor: 'Foundation',
    sovereign: 'no', 'dice-only': 'no', enrich: 'no',
    note: 'Restoring requires a complete valid phrase. Its predecessor the Passport Core does offer a final word; the Prime runs different software and does not.',
  },
  {
    name: 'Bitkey', rated: true, vendor: 'Block',
    sovereign: 'n/a', 'dice-only': 'n/a', enrich: 'n/a',
    note: 'There is no seed phrase to build. Bitkey is a 2-of-3 multisig and its recovery kit holds an encrypted key, not words — so none of this applies to it in either direction.',
  },
  {
    name: 'Ledger Nano family', rated: true, vendor: 'Ledger',
    sovereign: 'no', 'dice-only': 'no', enrich: 'no',
    note: 'Restoring requires every word. Ledger’s recovery-check tool only validates a phrase you already have, and the company publishes an argument against mixing entropy sources at all.',
  },
  {
    name: 'Coldcard Mk3', rated: false, vendor: 'Coinkite',
    sovereign: 'yes', 'dice-only': 'yes', enrich: 'yes',
    note: 'All three, but 24-word seeds only, and every menu path differs from the newer Coldcards. Included because the Mk3 is the model worst affected by the 2026 seed-generation flaw, so its owners are the most likely to be doing this.',
  },
  {
    name: 'Foundation Passport Core', rated: false, vendor: 'Foundation',
    sovereign: 'partial', 'dice-only': 'no', enrich: 'no',
    note: 'It will give you a final word, but it chooses that word’s leftover randomness with its own generator instead of offering you the valid options. That is a meaningful difference from every other device here, and Foundation’s own documentation says to use the feature with extreme caution.',
  },
];

// The three keys that mean "your randomness got in". 'device' is deliberately
// NOT one of them — it is the option where none of it is yours.
export const DICE_METHOD_KEYS = ['sovereign', 'dice-only', 'enrich'];
export const SUPPORTED = new Set(['yes', 'partial']);
export const diceCapability = (deviceName) => deviceDice.find((d) => d.name === deviceName) || null;
export const devicesForMethod = (key) =>
  deviceDice.filter((d) => SUPPORTED.has(d[key]));
export const ratedDevicesForMethod = (key) =>
  devicesForMethod(key).filter((d) => d.rated);
// Devices that allow NOTHING — worth naming, because "your device will not let
// you" is the answer for a large share of readers and nobody publishes it.
export const devicesWithNoDicePath = deviceDice.filter(
  (d) => d.rated && ['sovereign', 'dice-only', 'enrich'].every((k) => !SUPPORTED.has(d[k])) && d.sovereign !== 'n/a',
);
export const anyDiceSupport = (deviceName) => {
  const c = diceCapability(deviceName);
  return !!c && ['sovereign', 'dice-only', 'enrich'].some((k) => SUPPORTED.has(c[k]));
};

// Devices for which the QUESTION DOES NOT APPLY — 'n/a', a third state that is
// neither "can" nor "cannot". Bitkey has no seed phrase to build at all: it is a
// 2-of-3 whose recovery kit holds an encrypted key rather than words.
//
// This exists because `ratedDevicesForMethod` and `devicesWithNoDicePath` are
// both derived and neither models 'n/a', so a device sitting in that state fell
// out of BOTH lists — and the lesson enumerated eleven of the twelve devices we
// rate with no mention of the twelfth. The data held the honest answer the whole
// time; nothing published it.
//
// ASSERTED BELOW: every rated device must appear in exactly one of the three
// lists, so the next third state cannot vanish the same way.
export const devicesOutsideDiceQuestion = deviceDice.filter(
  (d) => d.rated && DICE_METHOD_KEYS.every((k) => d[k] === 'n/a'),
);

{
  const rated = deviceDice.filter((d) => d.rated);
  const listed = new Set([
    ...DICE_METHOD_KEYS.flatMap((k) => ratedDevicesForMethod(k).map((d) => d.name)),
    ...devicesWithNoDicePath.map((d) => d.name),
    ...devicesOutsideDiceQuestion.map((d) => d.name),
  ]);
  const orphans = rated.filter((d) => !listed.has(d.name)).map((d) => d.name);
  if (orphans.length) {
    throw new Error(
      `dice.js: ${orphans.join(', ')} — rated device(s) in none of the three published lists (can / cannot / does not apply). A page that enumerates every rated device would silently omit them.`,
    );
  }
}

// ── THE TWO LISTS MUST AGREE ────────────────────────────────────────────────
//
// deviceDice says WHICH devices can do each option; deviceProcedures says HOW.
// They were written at different times and drifted immediately: the matrix said
// the Coldcard supports option 1, while the procedure list carried only its
// on-device path — so the option-1 tile named the Coldcard and the option-1
// instructions did not. Two surfaces disagreeing about one device, each
// internally fine, which is this project's most common bug shape and one no
// link checker can see.
//
// Asserted at build so the next device added has to be added to both.
for (const key of DICE_METHOD_KEYS) {
  const covered = new Set(
    deviceProcedures.filter((p) => (p.options || []).includes(key)).flatMap((p) => p.covers || []),
  );
  for (const d of deviceDice) {
    if (!d.rated || !SUPPORTED.has(d[key])) continue;
    if (!covered.has(d.name)) {
      throw new Error(
        `dice.js: deviceDice says "${d.name}" supports "${key}" but no deviceProcedure tagged "${key}" covers it — the tile would name a device the instructions do not`,
      );
    }
  }
}

// ── WHICH OPTION TO POINT A READER AT, GIVEN THEIR HARDWARE ─────────────────
//
// The checklist knows which devices a reader owns or plans, so it can send
// them to the option their own kit can actually perform instead of to a page
// listing four, three of which may be impossible for them.
//
// Order of preference is the house position: enrich first (cheapest real
// protection, cannot be worse than letting the device decide), then the
// sovereign table method, and an honest dead end when the device allows
// neither. The dead end is the useful case — nowhere else tells them.
export function diceAdviceFor(deviceNames = []) {
  const caps = deviceNames.map(diceCapability).filter(Boolean);
  const can = (key) => caps.filter((c) => SUPPORTED.has(c[key]));

  const enrich = can('enrich');
  if (enrich.length) {
    return {
      key: 'enrich',
      href: '/roll-your-own-seed#enrich',
      line: `Your ${enrich[0].name} can take your own dice throws alongside its own randomness. It costs a few minutes, it cannot make the result worse, and it removes the one failure you cannot otherwise check.`,
    };
  }

  const sovereign = can('sovereign');
  if (sovereign.length) {
    const partial = sovereign[0].sovereign === 'partial';
    return {
      key: 'sovereign',
      href: '/roll-your-own-seed#sovereign',
      line: partial
        ? `Your ${sovereign[0].name} will finish a seed you choose yourself, but it picks the last word's remaining randomness with its own generator rather than offering you the options — so it is a weaker version of this than other devices manage.`
        : `Your ${sovereign[0].name} has no dice mode, but it will let you choose every word yourself from a printed table and calculate only the final one. That is the whole of your randomness, by hand.`,
    };
  }

  if (!caps.length) return null;
  return {
    key: 'none',
    href: '/learn/generate-your-seed',
    line: `Your ${caps[0].name} does not let you supply any of your own randomness — it generates the seed and there is no way in. That is not a reason to panic or to replace it, but it is worth knowing, because it is the one part of your setup you cannot check.`,
  };
}
