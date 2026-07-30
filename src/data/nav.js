// One source of truth for site navigation — the desktop top-nav dropdowns, the
// grouped mobile menu, and the grouped footer all read from here.
//
// ORDER IS THE ARGUMENT (restructured 2026-07-28). The site is education-forward:
// you LEARN the material in a deliberate basic→advanced sequence, and only then
// TAKE ACTION. There is exactly ONE door into action — the quiz — which places you
// on the ladder and produces your plan and your checklist. The ladder itself is an
// EDUCATIONAL idea and so lives in Learn; nothing in Learn asks the reader to do
// anything except read the next chapter.
//
// A link marked `ref: true` is lookup material, not a lesson — the menus set it
// apart so the list reads as "the course, then reference."
//
// The Learn group is `mega: true`: its body is the CURRICULUM (see curriculum.js),
// rendered as levels. /learn deliberately has no menu slot — the mega-menu links
// every one of its lessons directly, so an index of pages already in the menu
// isn't earning a place there. It is linked from the foot of /start instead, so
// the page keeps a navigation path and never becomes orphaned.

export const navGroups = [
  {
    title: 'Learn',
    // The course. `mega: true` makes this render as a wide panel of LEVELS rather
    // than a flat dropdown — every lesson is one click from the top of any page, so
    // nobody has to open a category to find out what's inside it. The levels
    // themselves live in curriculum.js; only the lead-in and the reference row are
    // declared here.
    mega: true,
    lead: { href: '/start', label: 'The whole syllabus, in order', pin: 'Start here' },
    links: [
      { href: '/glossary', label: 'Glossary', ref: true },
      { href: '/resources', label: 'Further reading', ref: true },
    ],
  },
  {
    title: 'Take action',
    // One straight line, no branching: the quiz places you → your plan holds the
    // roadmap → your checklist walks you through building it.
    links: [
      { href: '/quiz', label: 'Take the quiz' },
      { href: '/my-plan', label: 'Your plan' },
      { href: '/checklist', label: 'Your checklist' },
    ],
  },
  {
    title: 'Hardware & services',
    // The reference shelf you dip into once the quiz has told you what you need.
    links: [
      { href: '/wallets', label: 'Hardware wallets' },
      { href: '/standard', label: 'How we rate them' },
      { href: '/collaborative', label: 'Collaborative custody' },
    ],
  },
  {
    title: 'About',
    links: [
      { href: '/about', label: 'About' },
      { href: '/changelog', label: 'What’s changed' },
      { href: '/tip', label: '⚡ Tip the guide' },
    ],
  },
];

// A lean flat list of the journey's spine — kept in sync with the groups above.
// Not currently rendered (the four dropdowns replaced it); retained for any
// surface that wants the short path rather than the full map.
export const primaryNav = [
  { href: '/start', label: 'Start here' },
  { href: '/learn/bitcoin-keys', label: 'How it works' },
  { href: '/learn/ladder', label: 'The ladder' },
  { href: '/quiz', label: 'Take the quiz' },
  { href: '/my-plan', label: 'Your plan' },
  { href: '/checklist', label: 'Your checklist' },
];
