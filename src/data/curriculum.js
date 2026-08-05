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
//      (Reversed 07-30: /learn/hot-and-cold came back as 102's opening lesson —
//      the tiering DECISION needed a page of its own before the ladder could
//      answer it. See hot-and-cold.astro's header for the full round trip.)
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
//      real-world habits are the same defence at the two ends of it. The optional
//      tools (PayJoin, Silent Payments, CoinJoin) went up to run-a-node (then 201,
//      now the 104 finale); coin control STAYED in privacy as an everyday habit,
//      with run-a-node recapping it in one line (settled 2026-08-04).
//   5. INHERITANCE SPLIT. At 1,613 words it was the heaviest page here, and it was
//      cleanly two: why Bitcoin doesn't inherit like money, then how to build the
//      Recovery Kit. One rule (12) across two parts.
//
// URLs moved to /learn/ in the same pass. The old /how-to/ prefix was the same
// group-by-format habit the menu had already shed, and several pages under it were
// not how-tos at all. /learn/* is now the course; everything else (/find-your-setup,
// /wallets, /glossary, /demos…) is tools and reference. Old paths 301 in public/_redirects.
//
// This file is the ONE source for: the Learn mega-menu, the /start syllabus, the
// prev/next lesson footer, and the /learn index. Add a lesson here and every one of
// those surfaces picks it up. The RULE each lesson teaches lives in rules.js and is
// matched by href.
//
// Levels are deliberately numbered. The numbering is a claim that this is a
// SEQUENCE you progress through, not a flat map you browse — 100-level material
// builds on itself in order, and since 201's removal (2026-08-01, see below)
// every level is 100-level and required. The `safe`-token rendering for an
// `optional` level survives in the renderers, dormant, should one return.

import { ruleCountWord, ruleCountWordCap, rules, umbrella } from './rules.js';

export const levels = [
  {
    id: '101',
    title: 'Foundations',
    why: 'The rules first, then what this all actually is — before you touch anything or spend a cent.',
    blurb: `${ruleCountWordCap} rules hold up everything here. Meet them, then learn what a key is, how people lose Bitcoin, and why an exchange isn’t custody.`,
    lessons: [
      { href: '/learn/rules',              label: `The ${ruleCountWord} rules`,        short: `The ${ruleCountWord} rules`, note: 'read first' },
      // Not "What ARE Bitcoin keys" — a question, and the only interrogative label
      // left after the 2026-08-03 sweep that made every title describe its material.
      { href: '/learn/bitcoin-keys',       label: 'What Bitcoin keys are',           short: 'What Bitcoin keys are' },
      { href: '/learn/how-bitcoin-is-lost', label: 'How people lose Bitcoin',           short: 'How people lose Bitcoin' },
      { href: '/learn/not-your-keys',      label: 'Not your keys, not your coins',      short: 'Not your keys, not your coins' },
    ],
  },
  {
    id: '102',
    // "Wallet configuration", NOT "Your setup". The level teaches what the arrangements
    // ARE; the "Your setup" nav group (nav.js) is the three pages that build
    // YOURS. Both titles were live at once and both render on the home page, one
    // in the level list and one on the card beside it — the same word for the
    // idea and for the reader's own instance of it. The level is the generic one,
    // so the level is what renamed.
    title: 'Wallet configuration',
    why: 'Now that you know the risks: how every real setup is built, from one key upward — and how to tell which one would cover you.',
    blurb: 'Every real setup fits on one ladder. Find the lowest rung that covers you, and move up only when your situation genuinely outgrows it.',
    lessons: [
      { href: '/learn/hot-and-cold',     label: 'Hot and cold — where savings belong', short: 'Hot and cold' },
      { href: '/learn/ladder',           label: 'The wallet configuration ladder', short: 'The wallet configuration ladder' },
      { href: '/learn/beyond-the-ladder', label: 'Beyond the ladder — BIP-85 and Shamir', short: 'Beyond the ladder', note: 'optional' },
      { href: '/learn/choose-a-wallet',  label: 'Choosing a hardware wallet', short: 'Choosing a hardware wallet' },
    ],
  },
  {
    id: '103',
    title: 'Private key creation',
    why: 'Where the keys themselves come into existence — made, backed up, proven, and used for the first time.',
    blurb: 'Making a seed, backing it up so fire and water can’t destroy it, proving the backup works, and moving coins without fumbling.',
    lessons: [
      // FIRST in the build, because 103 previously opened on backing up a seed
      // that no lesson had ever told the reader how to create. The order is
      // chronological: make the seed, back it up, prove the backup, then move
      // coins.
      { href: '/learn/generate-your-seed', label: 'Generating a seed', short: 'Generating a seed' },
      { href: '/learn/back-up-your-seed',   label: 'Backing up a seed phrase', short: 'Backing up a seed phrase' },
      { href: '/learn/test-your-backup',    label: 'Testing a backup',         short: 'Testing a backup' },
      { href: '/learn/send-bitcoin-safely', label: 'Sending Bitcoin safely',      short: 'Sending Bitcoin safely' },
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
      // "Bitcoin inheritance" named the whole SUBJECT while this page is only its
      // first half — the 2026-07-29 split gave the second half its own lesson, and
      // a label covering both made the pair below it look like a repetition.
      { href: '/learn/inheritance',        label: 'Why Bitcoin doesn’t inherit like money', short: 'Why Bitcoin doesn’t inherit' },
      { href: '/learn/recovery-kit',       label: 'Building a Recovery Kit',              short: 'Building a Recovery Kit' },
      // RUNNING A NODE ENDS THE COURSE (moved from 201, 2026-08-01). It was the
      // first half of an optional level whose other half was not a lesson at
      // all, and it is not really optional material: checking the rules with
      // your own node is the last habit in the practice this level is about,
      // and it is the umbrella rule ("verify, don't trust") in its fullest
      // form. As the final lesson it reads as the end of the road rather than
      // as a bonus track nobody is expected to reach.
      { href: '/learn/run-a-node',         label: 'Running your own node',                   short: 'Running your own node' },
    ],
  },
];

// LEVEL 201 "UNDER THE HOOD" WAS REMOVED 2026-08-01. It held exactly two things
// and they were different kinds of thing: a real lesson (run a node, now the
// last lesson of 104) and /demos, which is a TOOL — a hub of eleven
// interactive demos with no reading position, no rule, and nothing to complete.
//
// Counting the demo hub as "lesson 18" is what forced the whole no-forward-links
// invariant to carry a named exception for /demos/* links: every aside into a
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
// THE `lesson` TITLE IS CHECKED TOO, since 2026-08-03 — and it is the half that
// was already drifting. Only `level` was asserted, so when the lesson titles were
// swept to gerunds ("Test your backup" → "Testing a backup") all twelve of
// rules.js's hand-typed lesson names would have gone on naming pages that no
// longer go by those names, on the one page that deliberately cannot link to
// them. A plain-text pointer is unfollowable BY DESIGN, so nothing but an assert
// can catch it — which is the argument for asserting both halves rather than the
// one that happened to break first.
{
  const levelOf = {};
  const labelOf = {};
  for (const lv of levels) for (const l of lv.lessons) {
    levelOf[normalize(l.href)] = lv.id;
    labelOf[normalize(l.href)] = l.label;
  }
  const wrong = [];
  for (const r of [...rules, umbrella]) {
    const want = levelOf[normalize(r.href)];
    if (!want) { wrong.push(`${r.key || 'umbrella'} → ${r.href} is not a lesson in any level`); continue; }
    if (want !== r.level) wrong.push(`${r.key || 'umbrella'} says level ${r.level}, but ${r.href} is in ${want}`);
    const wantLabel = labelOf[normalize(r.href)];
    if (r.lesson !== wantLabel) {
      wrong.push(`${r.key || 'umbrella'} names the lesson "${r.lesson}", but ${r.href} is titled "${wantLabel}"`);
    }
  }
  if (wrong.length) {
    throw new Error(
      `curriculum.js: rules.js level/lesson labels disagree with the curriculum — /learn/rules would name the wrong level or lesson in plain text:\n  ${wrong.join('\n  ')}`,
    );
  }
}
