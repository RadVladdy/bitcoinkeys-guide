// Numbers as English words, for copy that states a count about this site.
//
// ADDED 2026-07-30. Invariant #10 says no count is ever typed — every number the
// site states about itself derives from its data file. Honouring that in prose
// ("Twelve rules. That's the whole thing.") needs a numeral→word map, and by the
// third surface that needed one there were three copies of the same array in three
// data files. One copy now, imported wherever a count becomes words.
//
// The lesson that earned this file is worth keeping: on 2026-07-30 the home page,
// /start and /404 all advertised "six chapters" for a course that had had FIVE
// numbered levels since 7/29 — retired vocabulary AND a wrong count, surviving
// every count-recompute because **no data file has ever held a "chapter."** The
// recompute checks numbers that drift from a source; it cannot see a number that
// never had one. Deriving is what makes a count checkable at all.

const WORDS = [
  'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
  'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen',
  'seventeen', 'eighteen', 'nineteen', 'twenty',
];

/** 12 → "twelve". Falls back to the numeral above the table, which is fine in prose. */
export const numberWord = (n) => WORDS[n] ?? String(n);

/** 12 → "Twelve", for sentence-initial copy. */
export const numberWordCap = (n) => {
  const w = numberWord(n);
  return w.charAt(0).toUpperCase() + w.slice(1);
};
