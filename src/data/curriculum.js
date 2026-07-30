// The curriculum — the Learn shelf as a course, not a pile.
//
// ADDED 2026-07-28. Before this, the twelve how-to guides sat behind a single
// "How-to guides" menu item: no visible order, and no way to tell it was a whole
// second body of learning material. The fix isn't to consolidate them — it's to
// stop grouping by FORMAT ("how-to") and start grouping by LEVEL.
//
// RESTRUCTURED 2026-07-29 — the linear pass. Five changes, all in service of one
// idea: a reader should be able to start at the top and walk straight down.
//
//   1. THE RULES COME FIRST. /principles was lesson 5 of 101 and linked out to ten
//      other pages, seven of them further along the course. It's now lesson 1, it
//      carries no outbound links, and it frames everything after it. See rules.js.
//      (Revised later the same day: fifteen rules cut to TWELVE, each rewritten as
//      either a meme-grade statement or a directive — the redundant ones collapsed
//      and anything that was merely a true observation stopped being a rule.)
//   2. HOT VS COLD FOLDED IN. It was the shortest page on the site and it was
//      really two ideas: what hot and cold MEAN (a property of a wallet — belongs
//      in the keys lesson, beside "a wallet is a configuration of keys") and how to
//      TIER money across them (a setup decision — belongs on the ladder).
//   3. WRONG-NETWORK MERGED INTO SEND. Picking the right network is part of
//      sending safely, not a separate discipline. The merge also flushed 254 words
//      of air-gapped/PSBT material out of a beginner build lesson and up to 201.
//   4. OPSEC EMPTIED, NOT SPLIT. Three of its six sections were duplicates of
//      other lessons (verify-on-screen, don't-talk, the $5 wrench). Sent home; what
//      remains is a tight page about phishing, which the risks page calls the
//      number-one real-world attack and which had no lesson of its own.
//   4b. PRIVACY + PHYSICAL-SECURITY MERGED. The two were one argument told twice
//      from opposite ends — the giveaway being that BOTH wrote out the 2020 Ledger
//      breach (270,000 names and home addresses) in full as their centrepiece. The
//      chain is single and linear: a public ledger, plus address reuse, plus an ID
//      check that leaks, puts your name and your holdings in one file, which
//      becomes a target list, which ends at your door. On-chain habits and
//      real-world habits are the same defence at the two ends of it. Coin control
//      and the optional tools (PayJoin, Silent Payments, CoinJoin) went up to 201,
//      where "optional and skippable" is already the level's stated identity.
//   5. INHERITANCE SPLIT. At 1,613 words it was the heaviest page here, and it was
//      cleanly two: why Bitcoin doesn't inherit like money, then how to build the
//      Recovery Kit. One rule (12) across two parts.
//
// URLs moved to /learn/ in the same pass. The old /how-to/ prefix was the same
// group-by-format habit the menu had already shed, and several pages under it were
// not how-tos at all. /learn/* is now the course; everything else (/quiz, /wallets,
// /glossary, /deep-dive…) is tools and reference. Old paths 301 in public/_redirects.
//
// This file is the ONE source for: the Learn mega-menu, the /start syllabus, the
// prev/next lesson footer, and the /learn index. Add a lesson here and every one of
// those surfaces picks it up. The RULE each lesson teaches lives in rules.js and is
// matched by href.
//
// Levels are deliberately numbered. The numbering is a claim that this is a
// SEQUENCE you progress through, not a flat map you browse — 100-level material
// builds on itself in order; 200-level is a different KIND of material (optional,
// skippable, "see it for yourself"), which is why it renders in the `safe` token
// rather than the accent.

export const levels = [
  {
    id: '101',
    title: 'Foundations',
    why: 'The rules first, then what this all actually is — before you touch anything or spend a cent.',
    blurb: 'Twelve rules hold up everything here. Meet them, then learn what a key is, how people lose Bitcoin, and why an exchange isn’t custody.',
    lessons: [
      { href: '/learn/rules',              label: 'The twelve rules',                  short: 'The twelve rules', note: 'read first' },
      { href: '/learn/bitcoin-keys',       label: 'What Bitcoin keys are',           short: 'What Bitcoin keys are' },
      { href: '/learn/how-bitcoin-is-lost', label: 'How people lose Bitcoin',           short: 'How people lose Bitcoin' },
      { href: '/learn/not-your-keys',      label: 'Not your keys, not your coins',      short: 'Not your keys, not your coins' },
    ],
  },
  {
    id: '102',
    title: 'Your setup',
    why: 'Now that you know the risks, pick the simplest setup that covers them.',
    blurb: 'Every real setup fits on one ladder. Find the lowest rung that covers you — then stop.',
    lessons: [
      { href: '/learn/ladder',          label: 'The wallet configuration ladder', short: 'The wallet configuration ladder' },
      { href: '/learn/choose-a-wallet', label: 'How to choose a hardware wallet', short: 'Choosing a hardware wallet' },
    ],
  },
  {
    id: '103',
    title: 'The build',
    why: 'The hands-on build — the part where coins actually move.',
    blurb: 'Back it up so fire and water can’t destroy it, prove the backup works, and move coins without fumbling.',
    lessons: [
      { href: '/learn/back-up-your-seed',   label: 'Back up your seed phrase', short: 'Back up your seed phrase' },
      { href: '/learn/test-your-backup',    label: 'Test your backup',         short: 'Test your backup' },
      { href: '/learn/send-bitcoin-safely', label: 'Send Bitcoin safely',      short: 'Send Bitcoin safely' },
    ],
  },
  {
    id: '104',
    title: 'The long haul',
    why: 'Self-custody is a practice, not an event. These are the ongoing habits.',
    blurb: 'The human habits that stop most real losses — and the plan that lets your Bitcoin outlive you.',
    lessons: [
      { href: '/learn/phishing-and-scams', label: 'Phishing and everyday safety',        short: 'Phishing and everyday safety' },
      { href: '/learn/privacy',            label: 'Privacy and a low profile',           short: 'Privacy and a low profile' },
      { href: '/learn/inheritance',        label: 'Why Bitcoin doesn’t inherit like money', short: 'Bitcoin and inheritance' },
      { href: '/learn/recovery-kit',       label: 'Build the Recovery Kit',              short: 'Build the Recovery Kit' },
    ],
  },
  {
    id: '201',
    title: 'Under the hood',
    optional: true,
    why: 'You don’t need any of this to hold Bitcoin safely. It’s here so you don’t have to take it on faith.',
    blurb: 'Verify rather than trust — run the rules yourself, and watch the cryptography work on throwaway keys.',
    lessons: [
      { href: '/learn/run-a-node', label: 'Run your own node',   short: 'Run your own node' },
      { href: '/deep-dive',        label: 'See it for yourself', short: 'The interactive demos', note: '11 interactive demos' },
    ],
  },
];

/** Every lesson in reading order, each stamped with the level it belongs to. */
export const lessonSequence = levels.flatMap((lv, li) =>
  lv.lessons.map((l, i) => ({
    ...l,
    levelId: lv.id,
    levelTitle: lv.title,
    levelOptional: Boolean(lv.optional),
    indexInLevel: i,
    lessonsInLevel: lv.lessons.length,
    order: levels.slice(0, li).reduce((n, p) => n + p.lessons.length, 0) + i,
  }))
);

/** Total lessons across the whole course. */
export const lessonCount = lessonSequence.length;

const normalize = (p) => (p || '').replace(/\/+$/, '') || '/';

/**
 * Locate a page in the course. Returns null for pages that aren't lessons
 * (the ladder's rung pages, /wallets, /quiz…), so the prev/next footer simply
 * doesn't render there rather than inventing a position.
 */
export function lessonFor(pathname) {
  const path = normalize(pathname);
  const i = lessonSequence.findIndex((l) => normalize(l.href) === path);
  if (i === -1) return null;
  return {
    ...lessonSequence[i],
    prev: i > 0 ? lessonSequence[i - 1] : null,
    next: i < lessonSequence.length - 1 ? lessonSequence[i + 1] : null,
    position: i + 1,
    total: lessonSequence.length,
  };
}

/** The level a lesson belongs to, by level id. */
export const levelById = (id) => levels.find((lv) => lv.id === id) || null;
