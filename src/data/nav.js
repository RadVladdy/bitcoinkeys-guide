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
// A link marked `ref: true` is lookup material, not a chapter — the menus render a
// divider before the first one so the list reads as "chapters, then reference."

export const navGroups = [
  {
    title: 'Learn',
    // The syllabus, in teaching order. Chapter 1 (/start) is the overview of
    // everything below it; each chapter assumes the one before it.
    links: [
      { href: '/start', label: 'Start here' },
      { href: '/how-it-works', label: 'How your Bitcoin works' },
      { href: '/risks', label: 'How people lose Bitcoin' },
      { href: '/principles', label: 'Security principles' },
      { href: '/ladder', label: 'The ladder' },
      { href: '/how-to', label: 'How-to guides' },
      { href: '/deep-dive', label: 'Deeper dives' },
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
  { href: '/how-it-works', label: 'How it works' },
  { href: '/ladder', label: 'The ladder' },
  { href: '/quiz', label: 'Take the quiz' },
  { href: '/my-plan', label: 'Your plan' },
  { href: '/checklist', label: 'Your checklist' },
];
