// One source of truth for site navigation — the desktop top-nav dropdowns, the
// grouped mobile menu, and the grouped footer all read from here.
//
// ORDER IS THE ARGUMENT (restructured 2026-07-28). The site is education-forward:
// you LEARN the material in a deliberate basic→advanced sequence, and only then
// TAKE ACTION. There is exactly ONE door into action — the quiz — which places you
// on the ladder and produces your plan and your checklist. The ladder itself is an
// EDUCATIONAL idea and so lives in Learn; nothing in Learn asks the reader to do
// anything except read the next lesson.
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
    title: 'Your setup',
    // One straight line, no branching: the setup finder places you → your plan holds the
    // roadmap → your checklist walks you through building it.
    links: [
      { href: '/find-your-setup', label: 'Find your setup' },
      { href: '/my-plan', label: 'Your plan' },
      { href: '/checklist', label: 'Your checklist' },
    ],
  },
  {
    title: 'Hardware & services',
    // The reference shelf you dip into once the setup finder has told you what
    // you need. THE TEST FOR THIS GROUP IS OUTBOUND VENDOR LINKS — every page
    // here sends the reader out to buy something or sign up for something, and
    // no lesson does. That is what makes it a shelf rather than a chapter.
    links: [
      { href: '/wallets', label: 'Hardware wallets' },
      // Listed directly under the hardware page while an advisory is active: a
      // reader checking whether their own device is affected should not have to
      // find it through a banner they may have already scrolled past.
      { href: '/advisory/coldcard-seed-entropy', label: 'Security advisory — Coldcard' },
      { href: '/standard', label: 'How we rate them' },
      { href: '/metal-backups', label: 'Metal backups' },
      { href: '/collaborative', label: 'Collaborative custody' },
    ],
  },
  {
    title: 'Tools & demos',
    // ADDED 2026-08-01. The interactive material had no home and was scattered
    // across three groups: the demos hub was counted as a LESSON (level 201,
    // position 18 of 18) despite having no reading position, no rule and nothing
    // to complete; the dice procedure was reachable only from one lesson and one
    // checklist step; and the printable table only from the procedure.
    //
    // THE TEST FOR THIS GROUP: you DO something here, on your own device, and
    // nothing is saved, scored, or added to your plan. That is what separates it
    // from Your setup, where every tool writes to the plan, and from Hardware &
    // services, where every page sends you out to buy something.
    //
    // Deliberately NOT here: /find-your-setup, /my-plan and /checklist. They are
    // tools, but they are the one straight line through the site and belong
    // together. Order below is what-you-came-for first: browse the demos, then
    // the procedure, then the sheet the procedure needs.
    links: [
      { href: '/demos', label: 'Interactive demos' },
      { href: '/roll-your-own-seed', label: 'Roll your own seed' },
      { href: '/dice-word-table', label: 'Dice → word table' },
    ],
  },
  {
    title: 'About',
    links: [
      { href: '/about', label: 'About' },
      // MOVED HERE from Hardware & services (2026-08-01). It sat beside
      // /standard because both are published "how we decide" pages — but
      // /standard is a rubric applied to PRODUCTS, and this one explains how the
      // site itself reasons. That is About material: it is about us, not about
      // anything you would buy.
      { href: '/how-we-weigh-risk', label: 'How we weigh risk' },
      { href: '/changelog', label: 'What’s changed' },
      { href: '/tip', label: '⚡ Tip the guide' },
    ],
  },
];

// ── WHERE A PAGE LIVES, IN THE READER'S OWN MENU ───────────────────────────
//
// A lesson may not link to a take-action page (see LessonClose.astro), so it has
// to TELL the reader where to find one instead — "in the Hardware & services
// menu, under Metal backups." That sentence is a claim about another surface,
// and this project's whole history says a claim typed once about a surface it
// cannot see goes stale silently. So it is derived from the menu itself: rename
// a nav label and every lesson describing it updates in the same build.
//
// THROWS rather than returning null. A lesson pointing a reader at a menu entry
// that does not exist sends them looking for something they will not find, and
// that failure is invisible to every link checker precisely because there is no
// link to check. Failing the build is the only place it can be caught.
export function navWhere(href) {
  const clean = String(href || '').replace(/\/$/, '');
  for (const g of navGroups) {
    for (const l of g.links || []) {
      if (l.href.replace(/\/$/, '') === clean) return { group: g.title, label: l.label };
    }
    const lead = g.lead;
    if (lead && lead.href.replace(/\/$/, '') === clean) return { group: g.title, label: lead.pin || lead.label };
  }
  throw new Error(
    `nav.js: navWhere("${href}") — no menu entry. A lesson describes where this page lives `
    + 'in words rather than linking to it, so it has to BE in the menu. Add it to navGroups, '
    + 'or point the lesson somewhere a reader can actually find.',
  );
}

// A lean flat list of the journey's spine — kept in sync with the groups above.
// Not currently rendered (the four dropdowns replaced it); retained for any
// surface that wants the short path rather than the full map.
export const primaryNav = [
  { href: '/start', label: 'Start here' },
  { href: '/learn/bitcoin-keys', label: 'How it works' },
  { href: '/learn/ladder', label: 'The ladder' },
  { href: '/find-your-setup', label: 'Find your setup' },
  { href: '/my-plan', label: 'Your plan' },
  { href: '/checklist', label: 'Your checklist' },
];
