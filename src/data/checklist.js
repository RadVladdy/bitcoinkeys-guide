// The self-custody checklist — shared so both /checklist (the interactive list)
// and /my-plan (which resolves saved item IDs back to their titles) read one source.
//
// RESTRUCTURED 2026-07-28. This used to be one flat list, identical for everyone.
// It's now the GENERATED end of the journey: the quiz places you, /my-plan holds the
// roadmap, and this turns that into the specific steps *you* need, in order, with one
// highlighted next action. The action steps that used to live on /start moved here.
//
// EVERY `id` BELOW IS STABLE AND MUST STAY THAT WAY — ids are the keys stored in a
// visitor's saved plan, so renaming one silently wipes their ticked progress.
//
// Item metadata drives the personalization (all of it optional):
//   phase  — which of the five phases the item belongs to (see PHASES)
//   only   — array of target setups this applies to; absent = applies to everyone.
//            Values are ladder slugs: single-sig · passphrase · multisig · collaborative
//   needs  — a condition the plan must meet: 'heirs' (someone else must be able to
//            recover) · 'custodian' (a collaborative plan with a service key)
//   done   — the quiz already settled this, so a personalized list hides it
//
// Everything with neither `only` nor `needs` shows to everyone, personalized or not.
//
// `href` MUST BE SCOPE-CHECKED, not merely resolved — a wrong-but-real page links
// fine and no link checker catches it. Audited 2026-07-30 against the 7/29
// restructure: three items pointed at `/learn/inheritance` (which now only states
// the PROBLEM) when they instruct the reader to write or review the Recovery Kit,
// whose lesson is `/learn/recovery-kit`. The same pass rewrote `daily-safety`'s
// description, which still summarised the retired `opsec-basics` page — two of the
// three habits it named moved to other lessons and already have their own items here.

export const PHASES = [
  { key: 'setup',  tag: 'Step 1',    title: 'Get set up',        intro: 'The moves that get your Bitcoin out of someone else’s hands and into your own.' },
  { key: 'backup', tag: 'Step 2',    title: 'Secure the backup', intro: 'The backup IS the wallet. This is the part people get wrong, and it’s the part that loses coins.' },
  { key: 'prove',  tag: 'Step 3',    title: 'Prove it works',    intro: 'A backup you haven’t tested is a hope. Do this before you move real money.' },
  { key: 'live',   tag: 'Step 4',    title: 'Live with it',      intro: 'Once your coins are cold, close the everyday gaps — and leave a plan someone else could follow.' },
  { key: 'yearly', tag: 'Every year', title: 'Keep it alive',    intro: 'A setup is a practice, not a one-time event. Once a year, in one sitting:' },
];

const MULTI = ['multisig', 'collaborative'];

export const checklistItems = [
  // ── Step 1 · Get set up ───────────────────────────────────────────────────
  { id: 'learn-hot-cold', phase: 'setup', t: 'Understand hot vs cold before you move anything',
    d: 'A hot wallet is connected to the internet — fine for spending money. A cold wallet keeps the keys offline — that’s where savings belong. Getting this straight first stops the most common beginner mistake.',
    href: '/learn/bitcoin-keys' },
  { id: 'get-device', phase: 'setup', t: 'Get a real hardware wallet',
    d: 'A device from our cold-storage tier — Bitcoin-only firmware available, its own screen, offline signing. Buy direct from the maker and check the tamper seal.',
    href: '/wallets', deviceSlot: true },
  { id: 'multisig-brands', phase: 'setup', only: MULTI, t: 'Use different brands for your keys',
    d: 'The cheapest big upgrade in all of self-custody. Three identical devices share one point of failure — a flaw in that brand hits every key at once. Different makers means a problem with one brand can only ever cost you one key.',
    href: '/learn/choose-a-wallet' },
  { id: 'choose-custodian', phase: 'setup', only: ['collaborative'], t: 'Choose your collaborative custodian',
    d: 'The service holds one key of your multisig — you hold the rest, and they can never move your coins alone. Compare them on recovery terms and whether you could rebuild the wallet without them.',
    href: '/collaborative' },
  { id: 'generate-seed', phase: 'setup', t: 'Generate a fresh seed on the device yourself',
    d: 'Never use pre-set words. Let the device create the seed in front of you.',
    href: '/learn/ladder/single-sig' },
  { id: 'passphrase-choose', phase: 'setup', only: ['passphrase'], t: 'Choose your passphrase carefully',
    d: 'The secret “25th word” that opens your real wallet — the seed alone opens a decoy. It can’t be reset, rate-limited, or recovered, so a weak or guessable one is almost as bad as none.',
    href: '/learn/ladder/passphrase' },
  { id: 'test-send', phase: 'setup', t: 'Move a test amount off the exchange first',
    d: 'Send a small amount to your own wallet, confirm it arrives, then move the rest. Never move everything in one blind step.',
    href: '/learn/send-bitcoin-safely' },

  // ── Step 2 · Secure the backup ────────────────────────────────────────────
  { id: 'back-up-seed', phase: 'backup', t: 'Back up the seed on metal, in two places',
    d: 'Write it by hand, move it to steel, store two copies in separate locations. No photos, no cloud, ever.',
    href: '/learn/back-up-your-seed' },
  { id: 'passphrase-backup', phase: 'backup', only: ['passphrase'], t: 'Back up the passphrase — separately from the seed',
    d: 'The single most documented way people lose passphrase-protected Bitcoin: they memorise it, never write it down, then forget it or die. The seed is backed up so the wallet LOOKS recoverable — it isn’t. Back up the passphrase as carefully as the seed, in a different place.',
    href: '/learn/ladder/passphrase' },
  { id: 'multisig-descriptor', phase: 'backup', only: MULTI, t: 'Back up the wallet descriptor',
    d: 'Multisig needs one thing single-sig doesn’t: the descriptor — the small file describing how your keys combine. Without it your keys alone can’t rebuild the wallet. It holds no secrets, so back it up everywhere your keys are.',
    href: '/learn/ladder/multisig' },
  { id: 'distribute-keys', phase: 'backup', only: ['multisig'], t: 'Put your keys in genuinely different places',
    d: 'Multisig only removes the single point of failure if the keys can’t all be lost or seized together. A common split: home, a safe-deposit box, and a trusted person or second property.',
    href: '/learn/ladder/multisig' },

  // ── Step 3 · Prove it works ───────────────────────────────────────────────
  { id: 'prove-recovery', phase: 'prove', t: 'Prove recovery works before funding',
    d: 'Wipe the device and restore from your backup with a tiny amount. A backup you haven’t tested is a hope.',
    href: '/learn/test-your-backup' },
  { id: 'prove-passphrase', phase: 'prove', only: ['passphrase'], t: 'Restore with the passphrase, not just the seed',
    d: 'Restoring the seed alone lands you in the decoy wallet — and everything will look fine. Confirm the passphrase restores the wallet that actually holds your coins.',
    href: '/deep-dive/passphrase' },
  { id: 'prove-multisig', phase: 'prove', only: MULTI, t: 'Rehearse a spend with your backup keys',
    d: 'Prove you can sign with the keys you’d actually reach for in an emergency — not just the two sitting on your desk. Do it on a small amount before the wallet holds anything real.',
    href: '/learn/test-your-backup' },
  { id: 'custodian-recovery', phase: 'prove', only: ['collaborative'], needs: 'custodian', t: 'Confirm you can recover WITHOUT the service',
    d: 'The whole point of collaborative custody is that the service is a convenience, not a dependency. Make sure you hold enough keys — and the descriptor — to rebuild the wallet if they vanish tomorrow.',
    href: '/collaborative' },

  // ── Step 4 · Live with it ─────────────────────────────────────────────────
  { id: 'daily-safety', phase: 'live', t: 'Learn the daily-safety habits',
    d: 'Treat every unexpected message, call, or “support” contact as a trap until proven otherwise. Nobody legitimate ever needs your seed words — the demand itself is the proof.',
    href: '/learn/phishing-and-scams' },
  { id: 'low-profile', phase: 'live', t: 'Keep a low physical profile',
    d: 'Don’t advertise that you hold Bitcoin. Keep amounts vague, skip the branded gear, and reduce where your name is tied to it.',
    href: '/learn/privacy' },
  { id: 'privacy', phase: 'live', t: 'Address your privacy',
    d: 'Use a fresh address every time, be careful about combining coins, and reduce KYC exposure (the ID checks exchanges make you pass, which tie your name to your coins).',
    href: '/learn/privacy' },
  { id: 'recovery-kit', phase: 'live', t: 'Write a recovery kit and inheritance plan',
    d: 'A plain-language document your future self and your heirs can follow — without ever writing the seed words in it.',
    href: '/learn/recovery-kit' },
  { id: 'tell-heirs', phase: 'live', needs: 'heirs', t: 'Make sure the right person knows the kit exists',
    d: 'A perfect recovery kit nobody knows about is no plan at all. They don’t need the seed or the passphrase — only to know the kit exists and where to find it.',
    href: '/learn/recovery-kit' },
  // The quiz right-sizes you, so a personalized list hides this — it's already done.
  { id: 'right-size', phase: 'live', done: true, t: 'Right-size your setup',
    d: 'Check where you belong on the ladder — our map of setups from simplest to most advanced. Most people are safest at the lower rungs; climb only for a real reason.',
    href: '/learn/ladder' },

  // ── Every year ────────────────────────────────────────────────────────────
  { id: 'retest-backup', phase: 'yearly', t: 'Re-test a backup',
    d: 'Do a quick signed-message check (a built-in test that proves your keys still work, without moving any money), or a full wipe-and-restore if something has changed.',
    href: '/learn/test-your-backup' },
  { id: 'update-firmware', phase: 'yearly', t: 'Update device firmware',
    d: 'Apply the maker’s security updates from their official app only.',
    href: null },
  { id: 'review-kit', phase: 'yearly', t: 'Review your recovery kit and heirs',
    d: 'Are the instructions still accurate? Do the right people still know where to look?',
    href: '/learn/recovery-kit' },
  { id: 'confirm-locations', phase: 'yearly', t: 'Confirm your backup locations',
    d: 'Has anything moved, flooded, or changed hands? Fix it while you remember.',
    href: '/learn/back-up-your-seed' },
  { id: 'reconsider-rung', phase: 'yearly', t: 'Reconsider your rung',
    d: 'If your holdings have grown a lot, re-check whether it’s time to move up the ladder.',
    href: '/learn/ladder' },
];

/**
 * The generic view: every item, grouped by phase in teaching order.
 * Derived from `checklistItems` so the two can never drift apart.
 */
export const checklistGroups = PHASES.map((p) => ({
  key: p.key,
  tag: p.tag,
  title: p.title,
  intro: p.intro,
  items: checklistItems.filter((it) => it.phase === p.key),
}));

/**
 * Does this item apply to a given plan? Pure, so both the page and any future
 * surface (a printable PDF, /my-plan) can ask the same question.
 *   ctx = { rung, heirs, custodian }
 */
export function itemApplies(item, ctx) {
  if (!ctx || !ctx.rung) return true;              // no plan → the full generic list
  if (item.done) return false;                      // the quiz already settled it
  if (item.only && !item.only.includes(ctx.rung)) return false;
  if (item.needs === 'heirs' && !ctx.heirs) return false;
  if (item.needs === 'custodian' && !ctx.custodian) return false;
  return true;
}

/** Flat { id: title } map for resolving saved checklist keys to labels. */
export const checklistLabels = Object.fromEntries(checklistItems.map((it) => [it.id, it.t]));

/** Total number of checklist items (the full generic list). */
export const checklistCount = checklistItems.length;
