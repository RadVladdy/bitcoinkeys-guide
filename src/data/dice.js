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
    vendor: 'Coinkite',
    label: 'Coldcard Q · Mk4 · Mk5',
    covers: ['Coldcard Q', 'Coldcard Mk5'],
    family: 'hashed',
    priority: true,
    dice: 'One ordinary six-sided die.',
    path: ['New Seed Words', 'Advanced', '12 Word Dice Roll  or  24 Word Dice Roll'],
    pathNote:
      'On a device with no seed on it yet. Older write-ups send you to Import Existing → Dice Rolls; that was the menu in firmware 2.1.1 and it is not where the option lives today.',
    rolls: coldcardRolls,
    detail:
      'Each roll changes the running SHA-256 on screen, so you can watch your own entropy accumulate. With zero rolls entered the display always reads e3b0c4…8b855, which is SHA-256 of the empty string — the vendor points this out so you can confirm the device is hashing exactly what you gave it and nothing else.',
    verify:
      'Coinkite publishes rolls.py and rolls12.py so you can reproduce the whole calculation from your sequence and confirm the words match. Their own instruction is to do that on an offline machine — an amnesic live system with no network and no disk — and never on your everyday computer.',
    source: { label: 'Coinkite — Master Seed', url: 'https://coldcard.com/docs/import#dice-rolls-only' },
    source2: { label: 'Coinkite — Verifying Dice Roll Math', url: 'https://coldcard.com/docs/verifying-dice-roll-math/' },
  },
  {
    key: 'jade',
    vendor: 'Blockstream',
    label: 'Blockstream Jade · Jade Plus',
    covers: ['Blockstream Jade', 'Blockstream Jade Plus'],
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
    d: 'Paper and a pen for the seed words. Not a notes app, not a photo, not a password manager, not a laptop. Metal comes later, once the words are confirmed.',
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
    d: 'Rolling is dull and it is easy to lose your place at roll seventy. Being under the minimum silently is the danger; being over it costs nothing at all. If you genuinely do not know where you are, keep rolling — extra rolls never weaken the result.',
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

export const walkSteps = [
  {
    t: 'Update the firmware, then wipe the device',
    d: 'Do this before anything else, on a device with no coins on it. A dice seed generated on old firmware is still a seed generated on old firmware. If the device already holds a wallet you care about, stop and deal with that separately — this procedure starts from empty.',
  },
  {
    t: 'Clear the room',
    d: 'Phones out of the room. Laptop lids shut. Nothing recording, nothing on a call, nobody behind you. Get the die, the pen and the paper out before you start so you are not walking around mid-sequence.',
  },
  {
    t: 'Decide the length, and write the target down',
    d: 'Longer is the easy answer if you are doing this by hand anyway — the extra effort is one more page of rolling, once, ever. Put the target number at the top of your tally sheet so that "how many was I aiming for" is never a question you have to answer from memory.',
  },
  {
    t: 'Find the dice screen on your device',
    d: 'Get to the exact screen before you throw anything. The menu path is different on every make and it has moved between firmware versions on at least one of them, so this is not the moment to be hunting.',
  },
  {
    t: 'Roll, enter, repeat — one at a time',
    d: 'Throw the die, read it, enter it, mark your tally, throw again. Do not throw a handful and read them off; do not roll ahead while entering. The moment you are working from a short list you have written down, that list is your seed sitting on a table.',
  },
  {
    t: 'Pass the target, then keep going a little',
    d: 'Overshooting costs you nothing and removes the only question you cannot answer later. If you lose your place, keep rolling rather than guessing — a sequence that is longer than you think is fine, and one that is shorter is not.',
  },
  {
    t: 'Write the words down, on paper, by hand',
    d: 'Read them off the device screen. Not a photo, not a QR code into anything, not read aloud. Check the spelling of each word against the device before moving on — half the BIP-39 list looks like another half of it at a glance.',
  },
  {
    t: 'Destroy the tally, then wipe and restore',
    d: 'The tally sheet is key material until it is gone; burn or shred it, do not bin it. Then wipe the device and restore it from the words you wrote, so you find out today rather than in five years whether your backup actually works.',
  },
  {
    t: 'Fund it — small first',
    d: 'Send a small amount, confirm it arrives, then send a spend back out to prove you can move it. Only after that does the rest follow. Then move the words to metal, and check them once more as you copy.',
  },
];

/** Derived counts for copy that states how many of these there are. */
export const walkStepCount = walkSteps.length;
export const kitCount = kit.length;
export const failureModeCount = failureModes.length;
export const diceDeviceCount = deviceProcedures.length;
export const noDiceCount = noDicePath.length;
