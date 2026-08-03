// The dice → word lookup table for the sovereign seed method.
//
// DERIVED, NEVER TYPED. Every row is generated from the BIP-39 English
// wordlist at build time (invariant #10). A hand-maintained 2048-row table
// would be wrong somewhere and nobody would ever find out — and on this page
// a single wrong row is a word the reader cannot recover from.
//
// THE TABLE ITSELF IS NOT SECRET. It is a public, deterministic mapping that
// anyone can regenerate from the published wordlist, so there is no danger in
// printing it, photographing it, or keeping it on a phone. What must never
// become digital is the reader's ROLL SEQUENCE and the WORDS it produces.
// Those are the seed in another alphabet. Do not let the two get conflated in
// page copy: warning readers off the table would be false, and a false warning
// teaches them to ignore the real one.
//
// THE SCHEME: one ordinary six-sided die and one coin.
//   Roll the die; reroll any 5 or 6. What is left is a fair 1–4, worth 2 bits.
//   Five of those give 10 bits, and one coin flip gives the eleventh.
//   2^11 = 2048 = exactly the size of the wordlist, so every outcome maps to
//   one word and nothing is ever discarded or rerolled for being out of range.
//
// A DIE THROW COULD REPLACE THE COIN — 1–3 heads, 4–6 tails — and it is
// exactly fair: a bit needs two equally likely outcomes and six divides by
// two, so nothing is rerolled. CONSIDERED AND REJECTED, deliberately.
//
// It buys a reader nothing but not owning a coin, and costs two things worth
// more. It splits the reroll rule: five throws where 5s and 6s are discarded,
// one where every face counts — and a reader applying the wrong rule to
// either either biases every word or throws away half their results. And it
// breaks exact correspondence with BitBox's published procedure, which is
// what lets this method be checked against a second independent source
// instead of taken on our word.
//
// Do not re-add it. The method stays coin-and-die, identical to theirs.

// WHY NOT A VENDOR'S TABLE: Blockstream's needs two 16-sided dice and an
// eight-sided one; BitBox's needs its own arrangement. Both are fine, and both
// make the reader's method depend on which brand's PDF they happened to open.
// The sovereign method should not require a particular maker's dice.

import { wordlist } from '@scure/bip39/wordlists/english.js';

export const DIE_FACES = 4; // after rerolling 5s and 6s
export const DICE_PER_WORD = 5;
export const BITS_PER_WORD = 11;

// Expected PHYSICAL rolls per accepted d4, since 5s and 6s are rerolled: a d6
// lands in 1–4 two times in three, so each accepted value costs 1.5 throws.
export const THROWS_PER_ACCEPTED = 1.5;

export const rows = (() => {
  const out = [];
  for (let a = 1; a <= DIE_FACES; a += 1)
    for (let b = 1; b <= DIE_FACES; b += 1)
      for (let c = 1; c <= DIE_FACES; c += 1)
        for (let d = 1; d <= DIE_FACES; d += 1)
          for (let e = 1; e <= DIE_FACES; e += 1)
            for (const coin of ['H', 'T']) {
              const v = ((((a - 1) * DIE_FACES + (b - 1)) * DIE_FACES + (c - 1)) * DIE_FACES + (d - 1)) * DIE_FACES + (e - 1);
              const index = v * 2 + (coin === 'H' ? 0 : 1);
              out.push({ dice: `${a}${b}${c}${d}${e}`, coin, index, word: wordlist[index] });
            }
  return out;
})();

// Asserted at BUILD time, so a broken table fails the build instead of
// shipping. A table that is merely "probably right" is worse than none.
if (rows.length !== wordlist.length) {
  throw new Error(`dice-table: generated ${rows.length} rows for a ${wordlist.length}-word list`);
}
if (new Set(rows.map((r) => r.word)).size !== wordlist.length) {
  throw new Error('dice-table: rows do not cover every word exactly once');
}
if (rows.some((r) => !r.word)) {
  throw new Error('dice-table: a row produced no word');
}

export const tableRowCount = rows.length;

// Grouped by the first THREE throws: 64 blocks of 32 rows.
//
// Two throws would give 16 blocks of 128, which packs tighter but makes you
// scan 128 near-identical lines to find one row. Thirty-two lines under a
// heading you can match at a glance is the point of a lookup table — density
// that costs you the lookup is not a saving.
export const PREFIX_THROWS = 3;

export const blocks = (() => {
  const map = new Map();
  for (const r of rows) {
    const k = r.dice.slice(0, PREFIX_THROWS);
    if (!map.has(k)) map.set(k, []);
    map.get(k).push(r);
  }
  return [...map.entries()].map(([prefix, items]) => ({ prefix, items }));
})();

// Asserted, because a prefix length and a block size that disagree would give
// a table that still looks right and sends readers to the wrong row.
if (blocks.length !== DIE_FACES ** PREFIX_THROWS) {
  throw new Error(`dice-table: ${blocks.length} blocks for a ${PREFIX_THROWS}-throw prefix`);
}
if (blocks.some((b) => b.items.length !== rows.length / blocks.length)) {
  throw new Error('dice-table: blocks are not all the same size');
}

export const blockCount = blocks.length;

// Seed lengths, and what each costs in real throws. Stated because the honest
// cost of this method is the thing that decides whether a reader should pick
// it, and it is the thing every other write-up leaves out.
export const seedCosts = [12, 24].map((words) => {
  const chosen = words - 1; // the final word comes from the checksum, not from dice
  return {
    words,
    chosen,
    throws: Math.round(chosen * DICE_PER_WORD * THROWS_PER_ACCEPTED),
    flips: chosen,
  };
});

// ── V2 LAYOUT — an experiment, and a second SHAPE of the same data ──────────
//
// The shipped table repeats the full lookup key on every line: `23142H globe`.
// Three of those five digits are the block prefix, already printed as the
// heading directly above — so 2,048 rows each carry three redundant characters.
//
// V2 nests one level higher. The outer box is the first TWO throws; inside it,
// the four three-digit prefixes sit side by side as sub-columns, and each entry
// prints only what is left: the last two throws, the coin, and the word.
//
//   box "23"  →  231  232  233  234        entry: `42H globe`
//
// SAME ROWS, SAME ORDER, DIFFERENT NESTING. This does not regenerate anything:
// it re-groups `rows`, which is already asserted bijective onto the wordlist, so
// v2 cannot contain a word the shipped table does not.
export const V2_BOX_THROWS = 2;

export const v2Boxes = (() => {
  const boxes = new Map();
  for (const r of rows) {
    const boxKey = r.dice.slice(0, V2_BOX_THROWS);
    const colKey = r.dice.slice(0, PREFIX_THROWS);
    if (!boxes.has(boxKey)) boxes.set(boxKey, new Map());
    const cols = boxes.get(boxKey);
    if (!cols.has(colKey)) cols.set(colKey, []);
    // `rest` is the whole lookup key minus what the headings already say.
    cols.get(colKey).push({ rest: r.dice.slice(PREFIX_THROWS) + r.coin, word: r.word });
  }
  return [...boxes.entries()].map(([box, cols]) => ({
    box,
    cols: [...cols.entries()].map(([prefix, items]) => ({ prefix, items })),
  }));
})();

// The same shape of assert the shipped table gets. A re-grouping that silently
// dropped or duplicated an entry would still render as a plausible table, and
// on this artifact a wrong row is a word the reader cannot recover from.
if (v2Boxes.length !== DIE_FACES ** V2_BOX_THROWS) {
  throw new Error(`dice-table v2: ${v2Boxes.length} boxes for a ${V2_BOX_THROWS}-throw key`);
}
{
  const seen = new Set();
  for (const b of v2Boxes) {
    for (const c of b.cols) {
      for (const it of c.items) seen.add(c.prefix + it.rest);
    }
  }
  if (seen.size !== rows.length) {
    throw new Error(`dice-table v2: regrouping covers ${seen.size} of ${rows.length} entries`);
  }
}

export const v2BoxCount = v2Boxes.length;
export const v2ColsPerBox = v2Boxes[0].cols.length;
export const v2ItemsPerCol = v2Boxes[0].cols[0].items.length;
