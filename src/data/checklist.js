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

import { ruleByKey } from './rules.js';

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
  // `done: true` — shown on the GENERIC list, hidden once you have a plan. Placing
  // you on a rung IS the hot/cold decision, so the finder already settled it three
  // minutes ago. Same reasoning `right-size` has always used; this item predates the
  // "Learn teaches, /checklist acts" principle (7/30) and was never revisited.
  { id: 'learn-hot-cold', phase: 'setup', done: true, t: 'Understand hot vs cold before you move anything',
    d: 'A hot wallet is connected to the internet — fine for spending money. A cold wallet keeps the keys offline — that’s where savings belong. Getting this straight first stops the most common beginner mistake.',
    href: '/learn/hot-and-cold', rule: 'savings-offline' },
  // Three states, resolved on the page against what you actually own (the client
  // calls assessDevices()). "Get a REAL hardware wallet" shipped to everyone with a
  // plan — including people who already owned one — and the page helpfully appended
  // "— you have Ledger Nano". Telling someone to go and get the thing they just told
  // you they have, and calling theirs unreal, was the worst of both.
  // The custodian comes BEFORE the hardware on a collaborative plan — the quiz says
  // so in as many words ("Choose your service first — it comes before the hardware"):
  // each service lists the devices it supports, and some send you one. Ordered here
  // to match; its `only` keeps it off every other plan.
  { id: 'choose-custodian', phase: 'setup', only: ['collaborative'], t: 'Choose your collaborative custodian',
    d: 'The service holds one key of your multisig — you hold the rest, and they can never move your coins alone. Choose the service before the hardware: each one lists the devices it supports, and some send you one. Compare them on recovery terms and whether you could rebuild the wallet without them.',
    href: '/collaborative' },
  { id: 'get-device', phase: 'setup', t: 'Get a hardware wallet',
    d: 'A device from our cold-storage tier — Bitcoin-only firmware available, its own screen, offline signing. Buy direct from the maker and check the tamper seal.',
    href: '/wallets', deviceSlot: true, rule: 'buy-direct' },
  { id: 'multisig-brands', phase: 'setup', only: MULTI, t: 'Use different brands for your keys',
    d: 'The cheapest big upgrade in all of self-custody. Three identical devices share one point of failure — a flaw in that brand hits every key at once. Different makers means a problem with one brand can only ever cost you one key.',
    href: '/learn/choose-a-wallet' },
  // Every USB cold-tier device pairs with companion software, and until 2026-07-31
  // no page on the site said so — the step between "buy the device" and "generate
  // the seed" simply wasn't written down.
  { id: 'install-app', phase: 'setup', t: 'Install the maker’s wallet app',
    d: 'Your hardware wallet pairs with an app on your computer or phone — that’s where you’ll see balances and prepare the payments the device signs. Get it from the maker’s official site only, typed by hand, never from a search result or an ad: fake copies of these apps exist, and they are built to steal.',
    href: '/learn/phishing-and-scams' },
  // The link is REPOINTED at runtime to the dice option this reader's own
  // hardware can perform (see checklist.astro). The static href is the lesson,
  // which is the right destination for anyone without a saved plan.
  { id: 'generate-seed', phase: 'setup', t: 'Generate a fresh seed — and add your own randomness',
    d: 'Power the device on and follow the maker’s official start page — the address printed in the box or on their site, not a link someone sent you. Set a PIN when it asks, then let the device create the seed in front of you: it shows the words on its own screen, and you copy them down by hand. Never use pre-set words, and never type the words into a computer or phone. Where your device allows it, add your own dice throws to the randomness it generates — it takes a few minutes, it cannot make the result worse, and it removes the one part of your setup you otherwise have to take on trust.',
    href: '/learn/generate-your-seed', rule: 'buy-direct' },
  { id: 'passphrase-choose', phase: 'setup', only: ['passphrase'], t: 'Choose your passphrase carefully',
    d: 'The secret “25th word” that opens your real wallet — the seed alone opens a decoy. It can’t be reset, rate-limited, or recovered, so a weak or guessable one is almost as bad as none.',
    href: '/learn/ladder#rung-2' },
  { id: 'set-pin', phase: 'setup', t: 'Set a PIN on the device',
    d: 'The PIN stops someone who physically grabs the device from using it. It does NOT protect the seed — anyone holding your recovery words needs no PIN at all, which is why the backup is the thing that must never be seen. Set one anyway; it is free and it closes the easiest theft there is.',
    href: '/learn/ladder' },
  { id: 'verify-address', phase: 'setup', t: 'Verify every address on the device’s own screen',
    d: 'Malware exists that silently swaps the address you copied for an attacker’s, and your computer will show you the swap without blinking. The hardware wallet’s own screen can’t be faked that way. Read the address there, confirm it, then approve — every single time.',
    href: '/learn/send-bitcoin-safely', rule: 'verify-address' },
  // SPLIT 2026-07-31 (safety-critical ordering). One item used to say "send a test
  // amount… then move the rest" HERE — before the backup existed (Step 2) or had been
  // tested (Step 3), and Step 3 then tells you to wipe the device. The test amount
  // belongs here; the rest of your Bitcoin moves only after recovery is proven. The
  // funding step kept the old `test-send` id so previously ticked plans stay ticked.
  { id: 'test-receive', phase: 'setup', t: 'Send a small test amount to your new wallet',
    d: 'Move a little off the exchange — enough to prove the route works, small enough that a mistake costs nothing. Verify the receive address on the device’s own screen first, then confirm it arrives. The rest of your Bitcoin stays put until your backup is proven.',
    href: '/learn/send-bitcoin-safely', rule: 'not-your-keys' },

  // ── Step 2 · Secure the backup ────────────────────────────────────────────
  // Was "Back up the seed on metal, in two places" — metal-first, which is not what
  // anyone actually does on day one and not what the lesson teaches. Paper, checked,
  // THEN metal — nobody has a steel plate on day one.
  { id: 'back-up-seed', phase: 'backup', t: 'Write the seed on paper, check it, then move it to metal',
    d: 'Copy the words by hand and check them against the device. Paper is fine for today; get it onto metal before the wallet holds anything you would miss, and keep each copy in a genuinely separate place. No photos, no cloud, ever.',
    // Points at the metal-backup PAGE, not the lesson: this step is the moment someone
    // actually buys a plate, and "move it to metal" is the one instruction on this
    // list that names a product category without naming a product.
    href: '/metal-backups', rule: 'never-digital' },
  { id: 'passphrase-backup', phase: 'backup', only: ['passphrase'], t: 'Back up the passphrase — separately from the seed',
    d: 'The single most documented way people lose passphrase-protected Bitcoin: they memorise it, never write it down, then forget it or die. The seed is backed up so the wallet LOOKS recoverable — it isn’t. Back up the passphrase as carefully as the seed, in a different place.',
    href: '/learn/ladder#rung-2' },
  { id: 'multisig-descriptor', phase: 'backup', only: MULTI, t: 'Back up the wallet descriptor',
    d: 'Multisig needs one thing single-sig doesn’t: the descriptor — the small file describing how your keys combine. Without it your keys alone can’t rebuild the wallet. It holds no secrets, so back it up everywhere your keys are.',
    href: '/learn/ladder#rung-3' },
  { id: 'distribute-keys', phase: 'backup', only: ['multisig'], t: 'Put your keys in genuinely different places',
    d: 'Multisig only removes the single point of failure if the keys can’t all be lost or seized together. A common split: home, a safe-deposit box, and a trusted person or second property.',
    href: '/learn/ladder#rung-3' },

  // ── Step 3 · Prove it works ───────────────────────────────────────────────
  { id: 'prove-recovery', phase: 'prove', t: 'Prove recovery works before funding',
    d: 'Wipe the device and restore from your backup with a tiny amount. A backup you haven’t tested is a hope.',
    href: '/learn/test-your-backup', rule: 'test-backup' },
  { id: 'prove-passphrase', phase: 'prove', only: ['passphrase'], t: 'Restore with the passphrase, not just the seed',
    d: 'Restoring the seed alone lands you in the decoy wallet — and everything will look fine. Confirm the passphrase restores the wallet that actually holds your coins.',
    href: '/deep-dive/passphrase' },
  { id: 'prove-multisig', phase: 'prove', only: MULTI, t: 'Rehearse a spend with your backup keys',
    d: 'Prove you can sign with the keys you’d actually reach for in an emergency — not just the two sitting on your desk. Do it on a small amount before the wallet holds anything real.',
    href: '/learn/test-your-backup' },
  { id: 'custodian-recovery', phase: 'prove', only: ['collaborative'], needs: 'custodian', t: 'Confirm you can recover WITHOUT the service',
    d: 'The whole point of collaborative custody is that the service is a convenience, not a dependency. Make sure you hold enough keys — and the descriptor — to rebuild the wallet if they vanish tomorrow.',
    href: '/collaborative' },
  // Closes the prove phase — this is the moment the setup earns real money. Kept its
  // original `test-send` id (see the id-stability rule at the top of this file).
  { id: 'test-send', phase: 'prove', t: 'Move the rest — now that the backup is proven',
    d: 'Your backup exists, lives in more than one place, and has restored the wallet in a real test. Now the rest of your Bitcoin can follow the test amount. Verify the receive address on the device’s screen each time, and move it in a couple of pieces rather than one blind step.',
    href: '/learn/send-bitcoin-safely', rule: 'not-your-keys' },

  // ── Step 4 · Live with it ─────────────────────────────────────────────────
  { id: 'daily-safety', phase: 'live', t: 'Learn the daily-safety habits',
    d: 'Treat every unexpected message, call, or “support” contact as a trap until proven otherwise. Nobody legitimate ever needs your seed words — the demand itself is the proof.',
    href: '/learn/phishing-and-scams', rule: 'seed-words-scam' },
  { id: 'low-profile', phase: 'live', t: 'Keep a low physical profile',
    d: 'Don’t advertise that you hold Bitcoin. Keep amounts vague, skip the branded gear, and reduce where your name is tied to it.',
    href: '/learn/privacy', rule: 'never-talk' },
  { id: 'privacy', phase: 'live', t: 'Address your privacy',
    d: 'Use a fresh address every time, be careful about combining coins, and reduce KYC exposure (the ID checks exchanges make you pass, which tie your name to your coins).',
    href: '/learn/privacy', rule: 'fresh-address' },
  { id: 'recovery-kit', phase: 'live', t: 'Write a recovery kit and inheritance plan',
    d: 'A plain-language document your future self and your heirs can follow — without ever writing the seed words in it.',
    href: '/learn/recovery-kit', rule: 'leave-a-plan' },
  { id: 'tell-heirs', phase: 'live', needs: 'heirs', t: 'Make sure the right person knows the kit exists',
    d: 'A perfect recovery kit nobody knows about is no plan at all. They don’t need the seed or the passphrase — only to know the kit exists and where to find it.',
    href: '/learn/recovery-kit' },
  // The quiz right-sizes you, so a personalized list hides this — it's already done.
  { id: 'right-size', phase: 'live', done: true, t: 'Right-size your setup',
    d: 'Check where you belong on the ladder — our map of setups from simplest to most advanced. Most people are safest at the lower rungs; climb only for a real reason.',
    href: '/learn/ladder', rule: 'simplest-setup' },

  // ── Every year ────────────────────────────────────────────────────────────
  { id: 'retest-backup', phase: 'yearly', t: 'Re-test a backup',
    d: 'Do a quick signed-message check (a built-in test that proves your keys still work, without moving any money), or a full wipe-and-restore if something has changed.',
    href: '/learn/test-your-backup', rule: 'test-backup' },
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

// ── Risk-assessment emphasis (Phase C of the finder redesign, 2026-07-31) ───
// When a saved plan carries a risk assessment (finder.js scores — or a legacy
// ranked-worries answer shimmed into one) and a concern lands ELEVATED or HIGH,
// /checklist tags that concern's steps with a "matters extra for you" chip and
// one sentence of why. EMPHASIS ONLY, NEVER ORDER: the step order above is
// safety-critical (test amount → backup → prove recovery → only then fund) and
// was corrected 2026-07-31 — personalization must not move a single item.
// Steps that don't apply to the plan's setup (e.g. distribute-keys on a
// single-sig plan) are already hidden by itemApplies() and get no chip.
// {word} interpolates the visitor's own level (elevated / high) — the same
// word scale the finder uses, never a number.
export const concernEmphasis = {
  'self-loss': {
    steps: ['back-up-seed', 'prove-recovery', 'retest-backup', 'test-receive'],
    why: 'Locking yourself out is {word} in your risk picture — this step is exactly what answers it.',
  },
  physical: {
    steps: ['low-profile', 'confirm-locations', 'distribute-keys'],
    why: 'Targeted theft is {word} in your risk picture — this step is one of the few that actually lowers it.',
  },
  remote: {
    steps: ['verify-address', 'install-app', 'daily-safety'],
    why: 'Scams and remote theft are {word} in your risk picture — this habit is what stops them.',
  },
  custodial: {
    steps: ['test-send'],
    why: 'Company failure is {word} in your risk picture, and this move is the whole answer — don’t stall here.',
  },
};

// Fail the build, not the reader: every emphasized step id must exist. A typo
// here would otherwise just silently never chip anything.
{
  const ids = new Set(checklistItems.map((it) => it.id));
  for (const [concern, em] of Object.entries(concernEmphasis)) {
    for (const s of em.steps) {
      if (!ids.has(s)) throw new Error(`checklist.js: concernEmphasis["${concern}"] names unknown step id "${s}"`);
    }
  }
}

/** Flat { id: title } map for resolving saved checklist keys to labels. */
export const checklistLabels = Object.fromEntries(checklistItems.map((it) => [it.id, it.t]));

/**
 * A step may name the rule it IS — the checklist is the course's own advice in
 * doing form. Cited by stable KEY, never by number (invariant #8), and validated
 * here so a bad key fails the build rather than rendering a dead chip — the same
 * contract <RuleRef> enforces in prose.
 */
for (const it of checklistItems) {
  if (it.rule && !ruleByKey(it.rule)) {
    throw new Error(`checklist.js: item "${it.id}" cites unknown rule key "${it.rule}" — see src/data/rules.js`);
  }
}

/** The rule a checklist item teaches, or null. */
export const ruleForItem = (item) => (item && item.rule ? ruleByKey(item.rule) : null);

/** Total number of checklist items (the full generic list). */
export const checklistCount = checklistItems.length;
