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

import { ruleCountWord, ruleCountWordCap, rules, umbrella } from './rules.js';

export const levels = [
  {
    id: '101',
    title: 'Foundations',
    why: 'The rules first, then what this all actually is — before you touch anything or spend a cent.',
    blurb: `${ruleCountWordCap} rules hold up everything here. Meet them, then learn what a key is, how people lose Bitcoin, and why an exchange isn’t custody.`,
    lessons: [
      { href: '/learn/rules',              label: `The ${ruleCountWord} rules`,        short: `The ${ruleCountWord} rules`, note: 'read first' },
      { href: '/learn/bitcoin-keys',       label: 'What are Bitcoin keys',           short: 'What are Bitcoin keys' },
      { href: '/learn/how-bitcoin-is-lost', label: 'How people lose Bitcoin',           short: 'How people lose Bitcoin' },
      { href: '/learn/not-your-keys',      label: 'Not your keys, not your coins',      short: 'Not your keys, not your coins' },
    ],
  },
  {
    id: '102',
    title: 'Your setup',
    why: 'Now that you know the risks, decide where your money lives — then pick the simplest setup that covers it.',
    blurb: 'Every real setup fits on one ladder. Find the lowest rung that covers you, and move up only when your situation genuinely outgrows it.',
    lessons: [
      { href: '/learn/hot-and-cold',     label: 'Hot and cold — where your money lives', short: 'Hot and cold' },
      { href: '/learn/ladder',           label: 'The wallet configuration ladder', short: 'The wallet configuration ladder' },
      { href: '/learn/beyond-the-ladder', label: 'Beyond the ladder — BIP-85 and Shamir', short: 'Beyond the ladder', note: 'optional' },
      { href: '/learn/choose-a-wallet',  label: 'How to choose a hardware wallet', short: 'Choosing a hardware wallet' },
    ],
  },
  {
    id: '103',
    title: 'The build',
    why: 'The hands-on build — the part where coins actually move.',
    blurb: 'Back it up so fire and water can’t destroy it, prove the backup works, and move coins without fumbling.',
    lessons: [
      // FIRST in the build, because 103 previously opened on backing up a seed
      // that no lesson had ever told the reader how to create. The order is
      // chronological: make the seed, back it up, prove the backup, then move
      // coins.
      { href: '/learn/generate-your-seed', label: 'Generating your seed', short: 'Generating your seed' },
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
      { href: '/learn/privacy',            label: 'Privacy / OpSec',                     short: 'Privacy / OpSec' },
      { href: '/learn/inheritance',        label: 'Bitcoin inheritance',                 short: 'Bitcoin inheritance' },
      { href: '/learn/recovery-kit',       label: 'Build the Recovery Kit',              short: 'Build the Recovery Kit' },
      // RUNNING A NODE ENDS THE COURSE (moved from 201, 2026-08-01). It was the
      // first half of an optional level whose other half was not a lesson at
      // all, and it is not really optional material: checking the rules with
      // your own node is the last habit in the practice this level is about,
      // and it is the umbrella rule ("verify, don't trust") in its fullest
      // form. As the final lesson it reads as the end of the road rather than
      // as a bonus track nobody is expected to reach.
      { href: '/learn/run-a-node',         label: 'Run your own node',                   short: 'Run your own node' },
    ],
  },
];

// LEVEL 201 "UNDER THE HOOD" WAS REMOVED 2026-08-01. It held exactly two things
// and they were different kinds of thing: a real lesson (run a node, now the
// last lesson of 104) and /deep-dive, which is a TOOL — a hub of eleven
// interactive demos with no reading position, no rule, and nothing to complete.
//
// Counting the demo hub as "lesson 18" is what forced the whole no-forward-links
// invariant to carry a named exception for /deep-dive/* links: every aside into a
// demo looked like a link to material further along the course, because
// structurally it was one. It never was. The demos now live in the Tools & demos
// menu group where the rest of the interactive material sits, and an aside into
// one is an aside, not a spoiler.
//
// Consequence held deliberately: the course is now FOUR levels and every one of
// them is required. There is no optional tier, and `optional: true` is no longer
// set on any level — the `levels.some(l => l.optional)` renderers still work and
// simply render nothing extra. If an optional level ever comes back, that flag is
// the switch.

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

// ── A RULE'S LEVEL MUST MATCH THE CURRICULUM ────────────────────────────────
//
// Each rule (and the umbrella) carries `level` and `lesson` as HAND-TYPED text,
// because /learn/rules deliberately names where a rule is taught in plain words
// instead of linking forward to it — that is the whole reason that page has no
// outbound links. Plain text cannot be a wikilink, so it cannot be checked by
// following it, which makes it exactly the kind of claim this project keeps
// finding wrong: true when written, silently false after a move.
//
// It went stale the moment level 201 was removed — the umbrella still said 201
// for a lesson now sitting in 104, and it renders on the page as "In full: 201 ·
// Run your own node". Asserted here rather than in rules.js because rules.js is
// imported BY this file and must not import back.
//
// Negative-control it by changing any rule's `level` and running the build.
{
  const levelOf = {};
  for (const lv of levels) for (const l of lv.lessons) levelOf[normalize(l.href)] = lv.id;
  const wrong = [];
  for (const r of [...rules, umbrella]) {
    const want = levelOf[normalize(r.href)];
    if (!want) { wrong.push(`${r.key || 'umbrella'} → ${r.href} is not a lesson in any level`); continue; }
    if (want !== r.level) wrong.push(`${r.key || 'umbrella'} says level ${r.level}, but ${r.href} is in ${want}`);
  }
  if (wrong.length) {
    throw new Error(
      `curriculum.js: rules.js level labels disagree with the curriculum — /learn/rules would name the wrong level in plain text:\n  ${wrong.join('\n  ')}`,
    );
  }
}
