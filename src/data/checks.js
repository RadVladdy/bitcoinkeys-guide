// Per-lesson knowledge checks — "did that land?", not "what setup do you need?".
//
// ADDED 2026-07-30 (the owner). Deliberately the SECOND thing built after /quiz was
// renamed /find-your-setup: the setup finder was never a quiz (it tests nothing —
// it asks about your situation), and shipping real knowledge checks while that
// page still owned the word would have left two things called "quiz", one of them
// wrongly. The rename freed the word; this is what it was freed for.
//
// KEYED BY RULE KEY, NOT BY LESSON SLUG. Every lesson exists to teach exactly one
// rule, so a check tests THAT rule and is found the same way <RuleBand> finds its
// rule — via rulesFor(pathname) in rules.js. Three consequences worth knowing:
//   · A lesson that owns no rule (the rules page itself, and the two that set it
//     up) gets no check and renders nothing, rather than inventing one.
//   · /learn/privacy owns rules 10 and 11, so it can carry two checks.
//   · Re-homing a rule to a different lesson MOVES ITS CHECK AUTOMATICALLY. That
//     is the whole reason for keying on the rule: a slug map would have silently
//     stranded the check on the old lesson, which is invariant #11's failure mode.
//
// THREE CONSTRAINTS, each one already paid for on this site:
//
//   1. NOTHING IS EVER SAVED. Not to the plan, not to localStorage, not anywhere.
//      The site auto-saves "every deliberate action" — but a wrong answer is not a
//      deliberate action, it is learning, and filing it would put the three privacy
//      promises (/find-your-setup, /my-plan, /checklist) back in question exactly
//      the way /my-plan did on 2026-07-30. Transient by construction, which also
//      means the feature needs no consent copy at all. the owner's call and the right
//      one: "nothing would ever be saved… transient or ephemeral."
//   2. ZERO ANALYTICS (invariant #7). Answers never leave the DOM, so there is
//      nothing to leak and no request to make.
//   3. LINKS POINT BACKWARDS (invariant #9). An explanation teaches IN PLACE. No
//      check may link to another lesson, name material further along the course,
//      or hint at what is coming — feedback is written here, in full, or not at
//      all. That is why `why` is prose and carries no anchors.
//
// The correct answer is marked in the rendered HTML (`data-c`), so it is readable
// in view-source. That is fine and deliberate: this is a self-check, not an exam,
// and obfuscating it would mean shipping logic to hide something that does not
// matter. Grading stays client-side so nothing is ever transmitted.
//
// WRITING STANDARD. These are graded against the same bar as the lessons: safety-
// critical accuracy outranks cleverness. A distractor must be wrong for a reason
// the reader can learn from — a plausible half-truth people actually believe, not
// a joke option. `why` is shown only on a miss and must teach the point on its
// own, without assuming the reader goes back and re-reads.

import { rules } from './rules.js';

/** @type {Record<string, { q: string, options: { t: string, c?: true }[], why: string }[]>} */
export const checks = {
  // ── Rule 02 · /learn/not-your-keys ───────────────────────────────────────
  'not-your-keys': [
    {
      q: 'You buy Bitcoin on an exchange and leave it sitting there. What do you actually hold?',
      options: [
        { t: 'Bitcoin, in a wallet that belongs to you' },
        { t: 'A promise from the company to give you Bitcoin later', c: true },
        { t: 'A legally protected share of the exchange’s Bitcoin' },
      ],
      why: 'Coins left on an exchange are an IOU. The exchange holds the keys; you hold a row in their database. That is why a bankruptcy, a hack, or a freeze can put your coins out of reach without anyone stealing anything — Mt. Gox lost roughly 850,000 coins, and FTX vaporised about $8 billion of customer funds.',
    },
    {
      q: 'Which one of these actually means your Bitcoin is in your own custody?',
      options: [
        { t: 'The exchange is regulated, insured, and publishes proof of reserves' },
        { t: 'You can log in and see your balance whenever you want' },
        { t: 'You hold the seed phrase that controls the coins', c: true },
      ],
      why: 'Custody is about keys — not about a balance on a screen, and not about how solid the company looks. Proof of reserves shows that an exchange holds coins; it does not make any of them yours, and it says nothing about what it owes. If you cannot sign a transaction without asking someone’s permission, you are not in custody.',
    },
  ],

  // ── Rule 08 · /learn/send-bitcoin-safely ─────────────────────────────────
  'verify-address': [
    {
      q: 'You copy an address, paste it into your wallet software, and it looks right on your computer screen. Is that enough to approve the payment?',
      options: [
        { t: 'Yes — you checked it against what you copied' },
        { t: 'No — the computer is the thing that might be lying to you', c: true },
        { t: 'Only if you are on your own network rather than public Wi-Fi' },
      ],
      why: 'Address-swapping malware watches your clipboard and quietly substitutes an attacker’s address — and it can show you the address you expected while doing it. Checking on the computer therefore proves nothing, because the computer is the compromised part. The hardware wallet’s own small screen cannot be faked that way: read the address there, confirm it matches where you meant to send, and only then approve. Every single time, not just for large amounts.',
    },
    {
      q: 'You are moving a meaningful amount to a wallet you have never sent to before. What do you do first?',
      options: [
        { t: 'Send a small test amount, confirm it arrives, then send the rest', c: true },
        { t: 'Send the whole amount at once — extra transactions only cost extra fees' },
        { t: 'Split it into several equal payments so no single mistake loses everything' },
      ],
      why: 'A test send proves the address, the network, and your receiving wallet all work, for the price of a few cents in fees. Splitting the amount into equal chunks feels safer but proves nothing: if the address is wrong, every chunk goes to the same wrong place. Send a little, confirm it arrived and that you can see it in the destination wallet, then send the rest.',
    },
  ],
};

// Validate at import, so a typo throws the BUILD rather than rendering a check on
// no lesson at all — the same contract <RuleRef> and checklist.js `rule:` enforce.
// A check keyed to a rule that no longer exists would otherwise vanish silently.
const ruleKeys = new Set(rules.map((r) => r.key));
for (const key of Object.keys(checks)) {
  if (!ruleKeys.has(key)) {
    throw new Error(`checks.js: no rule with key "${key}" — see src/data/rules.js`);
  }
  for (const [i, c] of checks[key].entries()) {
    const correct = c.options.filter((o) => o.c).length;
    if (correct !== 1) {
      throw new Error(`checks.js: "${key}" question ${i + 1} has ${correct} correct options, expected exactly 1`);
    }
  }
}

/** The checks for a given rule key, or null. */
export const checksFor = (key) => checks[key] || null;

/** How many rules currently have a check — derived, never typed (invariant #10). */
export const checkedRuleCount = Object.keys(checks).length;
