// "Where am I on the ladder" — the interactive self-locator + climb advisor.
// Companion to the quiz: the quiz picks a setup for a newcomer; this tool is for
// someone who ALREADY has a setup. It locates their rung, shows what it covers +
// its weakness, then — true to the ladder's rule ("the simplest setup that
// adequately covers your threat model") — DEFAULTS TO "stay put," surfacing the
// next rung only when a real trigger exists. Deep content lives on each rung page;
// this file holds only the tool's interaction logic + the gaps ladder.js doesn't cover.

// The setups a person can self-identify with → the rung they map to (step 0 = not on the ladder).
export const setups = [
  { slug: 'pre',           step: 0, label: "Nothing yet — it's on an exchange, or in a phone / software wallet" },
  { slug: 'single-sig',    step: 1, label: 'One hardware wallet, one seed backup' },
  { slug: 'passphrase',    step: 2, label: 'One hardware wallet + a passphrase (a secret "25th word")' },
  { slug: 'shamir',        step: 3, label: 'My seed backup is split into shares (SLIP-39 / Shamir)' },
  { slug: 'diy-multisig',  step: 4, label: 'Multisig I run entirely myself (e.g. 2-of-3, all my own keys)' },
  { slug: 'collaborative', step: 5, label: 'Multisig where a service holds one key (Unchained, Casa, Nunchuk…)' },
  { slug: '3-of-5',        step: 6, label: '3-of-5 (or larger) multisig' },
];

// Gap-fillers: content ladder.js doesn't carry (rung 1 has a bespoke page, and "pre" isn't a rung).
// For rungs 2–6 the tool reads `tagline` / `solves` / `introduces` straight from ladder.js.
export const extras = {
  'pre': {
    tagline: "You're not on the ladder yet — your coins are held by someone else, or sit on an internet-connected device.",
    protects: null,
    weakness: "Someone else can freeze, lose, or be compelled to hand over your bitcoin. You don't hold the keys, so you don't really hold the coins.",
  },
  'single-sig': {
    protects: 'You hold your own keys, offline — no exchange or third party can freeze or lose your coins.',
    weakness: 'One seed backup is the whole game: found, copied, or destroyed, it can mean total loss.',
    whenToClimb: 'The lightest next step is a <a href="/ladder/passphrase">passphrase (rung 2)</a> — so a found seed backup alone can’t spend your coins. If your real worry is having a single point of failure at all, rather than a found seed, look at <a href="/ladder/diy-multisig">multisig (rung 4)</a>, which removes it entirely.',
  },
};

// The three climb-diagnostics. Phrased so the trigger answer is ALWAYS the flagged one,
// keeping the verdict logic uniform. `worry` is tailored per rung.
const GROWN = {
  id: 'grown',
  q: 'Since you set this up, has the value you’re protecting grown enough that losing it would be life-changing?',
  trigger: 'Yes',
  note: 'What you’re protecting has grown — the stakes are higher than when you built this.',
};
const PLAN = {
  id: 'plan',
  q: 'If something happened to you tomorrow, is there a written plan that would let the right person recover these coins?',
  trigger: 'No',
  note: 'There’s no written recovery plan yet — the biggest single gap at every rung, and the cheapest to fix.',
};
const WORRY = {
  'single-sig':    { q: 'Does it worry you that one found, destroyed, or copied seed backup is all that stands between you and total loss?', note: 'A single seed backup as your only line of defense is a real worry for you.' },
  'passphrase':    { q: 'Is your passphrase only in your head — not backed up anywhere separate that your heirs could reach?', note: 'A passphrase that lives only in your memory is the #1 documented passphrase-inheritance failure.' },
  'shamir':        { q: 'Does it worry you that recovery reassembles the whole seed on one device — a moment where that one device holds everything?', note: 'The reassemble-on-one-device moment is exactly the weakness multisig removes.' },
  'diy-multisig':  { q: 'Would handing this setup to a non-technical heir, exactly as it is today, be a real problem?', note: 'Inheritance is the usual reason holders move from DIY to collaborative multisig.' },
  'collaborative': { q: 'Do you have a genuine multi-party or multi-jurisdiction need that a 2-of-3 can’t serve?', note: 'A real multi-party / multi-jurisdiction need is the only good reason to go past 2-of-3.' },
};

// The diagnostics shown for a given rung (rungs 1–5 only; pre + rung 6 short-circuit).
export function climbQuestions(slug) {
  const w = WORRY[slug];
  if (!w) return [];
  return [
    { ...GROWN, options: ['Yes', 'No'] },
    { ...PLAN,  options: ['Yes', 'No'] },
    { id: 'worry', q: w.q, trigger: 'Yes', note: w.note, options: ['Yes', 'No'] },
  ];
}

// The verdict. pre → 'start'; rung 6 → 'top'; rungs 1–5 → 'stay' (no triggers) or 'consider'.
export function assess(slug, answers) {
  if (slug === 'pre') return { verdict: 'start', triggers: [] };
  if (slug === '3-of-5') return { verdict: 'top', triggers: [] };
  const qs = climbQuestions(slug);
  const triggers = qs.filter((q) => answers[q.id] === q.trigger).map((q) => q.note);
  return { verdict: triggers.length ? 'consider' : 'stay', triggers };
}
