// One source of truth for site navigation — the lean desktop top-nav, the
// grouped mobile menu, and the grouped footer all read from here.

// The full site map, grouped by the beginner's journey (Start → Learn → Do → About).
// Used by the mobile hamburger menu and the footer.
export const navGroups = [
  {
    title: 'Take action',
    links: [
      { href: '/start', label: 'Start here' },
      { href: '/quiz', label: 'Take the quiz' },
      { href: '/ladder', label: 'The ladder' },
      { href: '/checklist', label: 'Checklist' },
      { href: '/my-plan', label: 'My plan' },
    ],
  },
  {
    title: 'Learn',
    links: [
      { href: '/how-it-works', label: 'How Bitcoin works' },
      { href: '/principles', label: 'Security principles' },
      { href: '/how-to', label: 'How-to guides' },
      { href: '/deep-dive', label: 'Deep dives' },
      { href: '/glossary', label: 'Glossary' },
      { href: '/resources', label: 'Resources' },
    ],
  },
  {
    title: 'Research',
    links: [
      { href: '/wallets', label: 'Hardware wallets' },
      { href: '/collaborative', label: 'Collab custodians' },
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

// The lean desktop top-nav — the journey in order, six items.
export const primaryNav = [
  { href: '/start', label: 'Start here' },
  { href: '/wallets', label: 'Wallets' },
  { href: '/how-to', label: 'Guides' },
  { href: '/ladder', label: 'The ladder' },
  { href: '/glossary', label: 'Glossary' },
  { href: '/my-plan', label: 'My plan' },
];
