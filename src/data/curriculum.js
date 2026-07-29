// The curriculum — the Learn shelf as a course, not a pile.
//
// ADDED 2026-07-28. Before this, the twelve how-to guides sat behind a single
// "How-to guides" menu item: no visible order, and no way to tell it was a whole
// second body of learning material. The fix isn't to consolidate them — it's to
// stop grouping by FORMAT ("how-to") and start grouping by LEVEL. Four of the
// guides turned out to be mis-shelved entirely: hot-vs-cold and custodial-risk
// are foundational concepts (101), and choose-a-wallet belongs beside the ladder
// (102). They were only filed under "how-to" because of the URL they live at.
//
// This file is the ONE source for: the Learn mega-menu, the /start syllabus, the
// prev/next lesson footer, and the /how-to index grouping. Add a lesson here and
// every one of those surfaces picks it up.
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
    why: 'What this all is, before you touch anything or spend a cent.',
    blurb: 'Your Bitcoin is a key; the words are that key. What can really go wrong, and the rules that follow from it.',
    lessons: [
      { href: '/how-it-works',           label: 'How your Bitcoin works',      short: 'How your Bitcoin works' },
      { href: '/risks',                  label: 'How people lose Bitcoin',     short: 'How people lose Bitcoin' },
      { href: '/how-to/custodial-risk',  label: 'When the exchange blows up',  short: 'When the exchange blows up' },
      { href: '/how-to/hot-vs-cold',     label: 'Hot vs cold storage',         short: 'Hot vs cold storage' },
      { href: '/principles',             label: 'The security principles',     short: 'The security principles' },
    ],
  },
  {
    id: '102',
    title: 'Your setup',
    why: 'Now that you know the risks, pick the simplest setup that covers them.',
    blurb: 'Every real setup fits on one ladder. Find the lowest rung that covers you — then stop.',
    lessons: [
      { href: '/ladder',                 label: 'The configuration ladder',    short: 'The configuration ladder', note: '+ all 5 rungs' },
      { href: '/how-to/choose-a-wallet', label: 'How to choose a hardware wallet', short: 'Choosing a hardware wallet' },
    ],
  },
  {
    id: '103',
    title: 'The build',
    why: 'The hands-on build — the part where coins actually move.',
    blurb: 'Back it up so fire and water can’t destroy it, prove the backup works, and move coins without fumbling.',
    lessons: [
      { href: '/how-to/back-up-your-seed',   label: 'Back up your seed phrase', short: 'Back up your seed phrase' },
      { href: '/how-to/recovery-rehearsal',  label: 'Test your backup',         short: 'Test your backup' },
      { href: '/how-to/send-bitcoin-safely', label: 'Send Bitcoin safely',      short: 'Send Bitcoin safely' },
      { href: '/how-to/wrong-network',       label: 'The wrong-network trap',   short: 'The wrong-network trap' },
    ],
  },
  {
    id: '104',
    title: 'The long haul',
    why: 'Self-custody is a practice, not an event. These are the ongoing habits.',
    blurb: 'The human habits that stop most real losses — and the plan that lets your Bitcoin outlive you.',
    lessons: [
      { href: '/how-to/opsec-basics',      label: 'Stay safe day to day',              short: 'Stay safe day to day' },
      { href: '/how-to/physical-security', label: 'Physical safety & low profile',     short: 'Physical safety' },
      { href: '/how-to/privacy',           label: 'Protect your privacy',              short: 'Protect your privacy' },
      { href: '/how-to/inheritance',       label: 'Make sure your Bitcoin survives you', short: 'Inheritance' },
    ],
  },
  {
    id: '201',
    title: 'Under the hood',
    optional: true,
    why: 'You don’t need any of this to hold Bitcoin safely. It’s here so you don’t have to take it on faith.',
    blurb: 'Verify rather than trust — run the rules yourself, and watch the cryptography work on throwaway keys.',
    lessons: [
      { href: '/how-to/run-a-node', label: 'Run your own node',  short: 'Run your own node' },
      { href: '/deep-dive',         label: 'See it for yourself', short: 'The interactive demos', note: '11 interactive demos' },
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
