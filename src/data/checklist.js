// The self-custody checklist — shared so both /checklist (the interactive list)
// and /my-plan (which resolves saved item IDs back to their titles) read one
// source. Each item's `id` is the stable key stored in the user's plan.

export const checklistGroups = [
  {
    tag: 'Do first',
    title: 'Getting off the exchange',
    intro: 'The moves that get your Bitcoin into your own hands, safely.',
    items: [
      { id: 'test-send', t: 'Move a test amount off the exchange first', d: 'Send a small amount to your own wallet, confirm it arrives, then move the rest. Never move everything in one blind step.', href: '/how-to/send-bitcoin-safely' },
      { id: 'get-device', t: 'Get a real hardware wallet', d: 'A Bitcoin-only device with its own screen and offline signing. Buy direct from the maker and check the tamper seal.', href: '/wallets' },
      { id: 'generate-seed', t: 'Generate a fresh seed on the device yourself', d: 'Never use pre-set words. Let the device create the seed in front of you.', href: '/ladder/single-sig' },
      { id: 'back-up-seed', t: 'Back up the seed on metal, in two places', d: 'Write it by hand, move it to steel, store two copies in separate locations. No photos, no cloud, ever.', href: '/how-to/back-up-your-seed' },
      { id: 'prove-recovery', t: 'Prove recovery works before funding', d: 'Wipe the device and restore from your backup with a tiny amount. A backup you haven’t tested is a hope.', href: '/how-to/recovery-rehearsal' },
    ],
  },
  {
    tag: 'Do next',
    title: 'Harden and protect',
    intro: 'Once your coins are in cold storage, close the everyday gaps.',
    items: [
      { id: 'daily-safety', t: 'Learn the daily-safety habits', d: 'Verify addresses on the device screen, treat unexpected messages as scams, and keep your Bitcoin off your public identity.', href: '/how-to/opsec-basics' },
      { id: 'low-profile', t: 'Keep a low physical profile', d: 'Don’t advertise that you hold Bitcoin. Keep amounts vague, skip the branded gear, and reduce where your name is tied to it.', href: '/how-to/physical-security' },
      { id: 'privacy', t: 'Address your privacy', d: 'Use a fresh address every time, be careful about combining coins, and reduce KYC exposure (the ID checks exchanges make you pass, which tie your name to your coins).', href: '/how-to/privacy' },
      { id: 'right-size', t: 'Right-size your setup', d: 'Check where you belong on the ladder — our map of setups from simplest to most advanced. Most people are safest at the lower rungs; climb only for a real reason.', href: '/ladder' },
      { id: 'recovery-kit', t: 'Write a recovery kit and inheritance plan', d: 'A plain-language document your future self and your heirs can follow — without ever writing the seed words in it.', href: '/how-to/inheritance' },
    ],
  },
  {
    tag: 'Every year',
    title: 'Keep it alive',
    intro: 'A setup is a practice, not a one-time event. Once a year, in one sitting:',
    items: [
      { id: 'retest-backup', t: 'Re-test a backup', d: 'Do a quick signed-message check (a built-in test that proves your keys still work, without moving any money), or a full wipe-and-restore if something has changed.', href: '/how-to/recovery-rehearsal' },
      { id: 'update-firmware', t: 'Update device firmware', d: 'Apply the maker’s security updates from their official app only.', href: null },
      { id: 'review-kit', t: 'Review your recovery kit and heirs', d: 'Are the instructions still accurate? Do the right people still know where to look?', href: '/how-to/inheritance' },
      { id: 'confirm-locations', t: 'Confirm your backup locations', d: 'Has anything moved, flooded, or changed hands? Fix it while you remember.', href: null },
      { id: 'reconsider-rung', t: 'Reconsider your rung', d: 'If your holdings have grown a lot, re-check whether it’s time to move up the ladder.', href: '/ladder' },
    ],
  },
];

/** Flat { id: title } map for resolving saved checklist keys to labels. */
export const checklistLabels = Object.fromEntries(
  checklistGroups.flatMap((g) => g.items.map((it) => [it.id, it.t]))
);

/** Total number of checklist items. */
export const checklistCount = checklistGroups.reduce((n, g) => n + g.items.length, 0);
