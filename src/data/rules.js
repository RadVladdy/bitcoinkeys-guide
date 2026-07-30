// The rules — the spine of the whole course.
//
// ADDED 2026-07-29. Before this, /principles was a list of ten rules that each
// linked OUT to the lesson that explained it. Sitting at position 5 of 17, seven
// of those ten links pointed FORWARD to material the reader hadn't reached yet:
// a table of contents wearing a lesson's clothes, and the single most anti-linear
// thing on the site.
//
// The fix inverts it. The rules now come FIRST — lesson 1 of 101 — as a preface
// and a contract: these rules are the whole thing; follow them and you're safe;
// everything after this is one rule at a time, in full. The page itself carries NO
// outbound links (that's what made the old one a hub). Instead each rule names, in
// plain text, the level and the exact lesson title that expands it.
//
// The lessons then reference the rules BACKWARD — every lesson opens with the
// numbered rule it exists to teach, linking back here. That's the invariant worth
// keeping: on this site, links point backwards. Nothing points forward except
// "next lesson."
//
// REVISED 2026-07-29 (later) — fifteen rules down to twelve, and every one of them
// rewritten to a single standard: a rule is either a MEME-GRADE STATEMENT ("Not
// your keys, not your coins") or a DIRECTIVE ("Every time you receive Bitcoin,
// generate a new address"). Anything that was merely a true observation is not a
// rule and was cut or rewritten. Three removals, all redundancy the owner caught:
//
// RE-HOMED 2026-07-29 (later 2) — the hot/cold rule ("never keep long-term savings
// on an internet-connected device") used to be rule 01, on the keys lesson. Two
// things were wrong with that. It opened the whole course on a storage directive
// before the reader had any reason to care, and it sat on the lesson that DEFINES
// hot and cold rather than the one where temperature becomes a decision. It now
// lives on the ladder, beside the "how much belongs at each temperature" section,
// which is that rule in its decision form. The keys lesson keeps teaching the
// concept and simply owns no rule — same as the rules page itself.
//
// The section did NOT move. Moving it to choose-a-wallet was considered and
// rejected: the ladder is 102 lesson 1 and choose-a-wallet is 102 lesson 2, and
// the ladder's tiering section builds on hot/cold explicitly — so the move would
// have created exactly the forward reference this whole restructure removed.
//
//   · "Your Bitcoin is a key, hold the key hold the coins" — this WAS "not
//     your keys, not your coins") wearing different words, and "understand your
//     keys" is a premise of the course rather than something you can follow or
//     break. Cut. The lesson keeps teaching it; it just isn't a rule.
//   · "The simplest setup wins" + "more complexity isn't more security" were one
//     idea split in two. Merged into one.
//   · "The device is replaceable, the words are the money" restated the cut key rule
//     from the other side. Its slot on the hardware-wallet lesson now carries a
//     rule that lesson actually needs and nothing else covered: buy it new, direct,
//     and set it up yourself (the supply-chain attack).
//   · "Only ever send real, native Bitcoin" — true and worth teaching, but too
//     narrow a trap to sit among twelve rules that carry the whole guide. Dropped
//     as a rule; the material stays on the sending lesson.
//
// ONE SOURCE for: the /learn/rules page, the rule band at the top of each lesson,
// and every count of "the N rules" across the site.
//
// `href` is here so the LESSONS can find their own rule. The rules page
// deliberately ignores it — see above.

import { numberWord, numberWordCap } from './numbers.js';

export const rules = [
  // ---- 101 · Foundations ----
  {
    n: 1,
    key: 'self-inflicted',
    short: 'You are the main risk',
    rule: 'You’re more likely to lose access to your Bitcoin than have it stolen.',
    body: 'The mental picture is a hacker. The reality is a house fire, a single backup nobody copied, a word miscopied and never checked, or an owner who died without leaving instructions. Thieves are real and worth defending against — but they are not the main thing standing between you and your Bitcoin. You are.',
    href: '/learn/how-bitcoin-is-lost',
    level: '101',
    lesson: 'How people lose Bitcoin',
  },
  {
    n: 2,
    key: 'not-your-keys',
    short: 'Not your keys, not your coins',
    rule: 'Not your keys, not your coins.',
    body: 'Bitcoin sitting on an exchange isn’t really your Bitcoin. It’s a promise from a company to give you some later — and companies go bankrupt, get hacked, and freeze accounts. Mt. Gox lost roughly 850,000 coins. FTX vaporised about $8 billion. Move your coins off the exchange after you buy. That one step is what this whole guide is about.',
    href: '/learn/not-your-keys',
    level: '101',
    lesson: 'Not your keys, not your coins',
  },

  // ---- 102 · Your setup ----
  {
    n: 3,
    key: 'simplest-setup',
    short: 'Simplest setup that covers you',
    rule: 'Choose the simplest setup that covers you.',
    body: 'Not the most impressive one, and not the one a vendor is selling — the simplest one that defends against risks you can name out loud. <strong>No setup is simply “right”: every choice here trades one risk for another.</strong> What makes it harder for a thief to reach your Bitcoin usually makes it easier for you to lock yourself out, and what makes recovery easy for you makes it easier for someone else too. There is no arrangement without a downside — only the one whose downsides you chose on purpose.',
    // Rule 03 is the only rule with a second paragraph, and it earns it: the first
    // states the PRINCIPLE (every choice is a trade), the second the DIRECTIVE that
    // follows from it. Run together they were 187 words against a 96-word longest,
    // a wall on the one page whose whole job is twelve scannable lines.
    body2: 'Which is why climbing higher is never free: more keys, more devices and more clever schemes are the single biggest cause of lost Bitcoin, so complexity you don’t fully control is itself a threat. But <strong>“covers you” changes as your situation does</strong>: when the amount you’re securing has outgrown the rung you’re on — when thinking about it starts to make you uneasy — that is a real reason to move up. Climb for that. Don’t climb for the sake of it.',
    href: '/learn/ladder',
    level: '102',
    lesson: 'The wallet configuration ladder',
  },
  {
    n: 4,
    key: 'savings-offline',
    short: 'Savings never go online',
    rule: 'Never keep long-term savings on an internet-connected device.',
    body: 'A wallet is <strong>hot</strong> when its keys sit on something that goes online, and <strong>cold</strong> when they don’t. Phone and desktop wallets are hot: fine for walking-around money, wrong for savings. Anything you are actually saving belongs on a device that stays offline — and writing your words into a note, a photo or a password manager puts them straight back online.',
    href: '/learn/ladder',
    level: '102',
    lesson: 'The wallet configuration ladder',
  },
  {
    n: 5,
    key: 'buy-direct',
    short: 'Buy it new and direct',
    rule: 'Buy your hardware wallet new, direct from the maker, and set it up yourself.',
    body: 'A device bought second-hand, or from a marketplace reseller, can reach you already loaded with someone else’s keys — and you would not find out until your coins left. Order from the manufacturer’s own website, check the tamper seal when it arrives, and make the device generate a brand-new seed phrase in front of you. If one ever arrives already showing you a seed phrase, it is compromised. Don’t use it.',
    href: '/learn/choose-a-wallet',
    level: '102',
    lesson: 'How to choose a hardware wallet',
  },

  // ---- 103 · The build ----
  {
    n: 6,
    key: 'never-digital',
    short: 'Never digital',
    rule: 'Never let your seed words touch anything digital.',
    body: 'No photo. No cloud note. No password manager. No typing them into a phone or a computer, not even for a second, not even to “check” them. A digital copy of your words is a hot wallet holding everything you own, and it can leak years later when some account you forgot about gets breached. Paper, or better, metal.',
    href: '/learn/back-up-your-seed',
    level: '103',
    lesson: 'Back up your seed phrase',
  },
  {
    n: 7,
    key: 'test-backup',
    short: 'Test before you fund',
    rule: 'Fully test your backup before you send any significant Bitcoin to your wallet.',
    body: 'One miscopied word makes a backup worthless, and you find that out on the day you need it — the worst possible day there is. Wipe the device and restore from your written words with a trivial amount first. Only once you have watched it work should real money go in. Then prove it again about once a year.',
    href: '/learn/test-your-backup',
    level: '103',
    lesson: 'Test your backup',
  },
  {
    n: 8,
    key: 'verify-address',
    short: 'Verify on the hardware wallet',
    rule: 'When sending Bitcoin, verify the address on the hardware wallet’s own screen.',
    body: 'Malware exists that silently swaps the address you copied for an attacker’s, and your computer will show you the swap without blinking. The hardware wallet’s own little screen cannot be faked that way. Read the address there, confirm it matches where you meant to send, and only then approve. Every single time.',
    href: '/learn/send-bitcoin-safely',
    level: '103',
    lesson: 'Send Bitcoin safely',
  },

  // ---- 104 · The long haul ----
  {
    n: 9,
    key: 'seed-words-scam',
    short: 'Requiring your words = theft',
    rule: 'If someone requires your seed words for any reason, they’re trying to steal your Bitcoin.',
    body: 'Not your wallet maker, not your exchange, not support, not a “migration,” not a security check, not an urgent message about suspicious activity. No legitimate service ever needs those words — so there is no judgement call to make and no story to weigh up. <strong>The demand itself is the proof.</strong> The only time your words are ever typed anywhere is a recovery <em>you</em> started, on a device <em>you</em> chose, at a moment <em>you</em> picked. Anything else is theft in progress. Phishing is the number-one real-world attack, and this one rule defeats nearly all of it.',
    href: '/learn/phishing-and-scams',
    level: '104',
    lesson: 'Phishing and everyday safety',
  },
  {
    n: 10,
    key: 'never-talk',
    short: 'Talk about Bitcoin, not yours',
    rule: 'Talk about Bitcoin. Never talk about your Bitcoin.',
    body: 'Physical attacks are almost never random. They start with a leaked customer list, get cross-referenced against anything you have said publicly about owning Bitcoin, and end at your door. So talk about Bitcoin <em>the idea</em> as loudly as you like — the technology, the economics, the freedom. Just never attach your own name to the fact that you hold it, and never attach a number. <strong>That includes people you trust:</strong> they have people they trust too, and you don’t control the third telling.',
    href: '/learn/privacy',
    level: '104',
    lesson: 'Privacy and a low profile',
  },
  {
    n: 11,
    key: 'fresh-address',
    short: 'A fresh address every time',
    rule: 'Every time you receive Bitcoin, generate a new address.',
    body: 'Reusing one address publishes your whole financial history to anyone who looks — the ledger is public, and every payment to that address is permanently linked to every other. Your wallet makes fresh addresses for free, endlessly, and usually offers a new one by default. Let it. This single free habit does most of the privacy work there is.',
    href: '/learn/privacy',
    level: '104',
    lesson: 'Privacy and a low profile',
  },
  {
    n: 12,
    key: 'leave-a-plan',
    short: 'Leave a plan they can follow',
    rule: 'Leave your family a plan they can actually follow.',
    body: 'Most Bitcoin that vanishes forever wasn’t stolen — it was left behind with no instructions. Your family finds a metal plate and a strange gadget, has no idea what either is, and bins them. Write down what you have, where it is, and how to reach it, in language a grieving non-technical person can follow. Then rehearse it with them while you still can.',
    href: '/learn/inheritance',
    // Rule 12 is the one rule taught across TWO lessons: why it goes wrong, then
    // how to build the fix. `also` lets the second lesson carry the same band
    // rather than being the only lesson on the site without one.
    also: '/learn/recovery-kit',
    level: '104',
    lesson: 'Why Bitcoin doesn’t inherit like money',
  },
];

/** The one idea the other rules are all expressions of. Deliberately unnumbered. */
export const umbrella = {
  rule: 'Verify. Don’t trust.',
  body: 'Check your backup instead of assuming it. Check the address on the screen instead of trusting the computer. Check the rules yourself, with your own node, instead of taking a company’s word for what’s yours. Every rule above is one instance of this one.',
  href: '/learn/run-a-node',
  level: '201',
  lesson: 'Run your own node',
};

export const ruleCount = rules.length;

/**
 * The count as an English word, so page copy ("Twelve rules. That's the whole
 * thing.") can never drift from the array the way a hardcoded numeral would.
 */
export const ruleCountWord = numberWord(ruleCount);
export const ruleCountWordCap = numberWordCap(ruleCount);

const normalize = (p) => (p || '').replace(/\/+$/, '') || '/';

/**
 * Cite a rule from prose by its stable key rather than its number — e.g.
 * ruleByKey('never-digital'). Numbers shift whenever a rule is added, cut or
 * re-homed; keys don't. Use this (or <RuleRef>) anywhere a page names a rule.
 */
export const ruleByKey = (key) => rules.find((r) => r.key === key) || null;

/** Every rule a given lesson is responsible for teaching (some lessons own two). */
export function rulesFor(pathname) {
  const path = normalize(pathname);
  return rules
    .filter((r) => normalize(r.href) === path || normalize(r.also || '') === path)
    .map((r) => ({ ...r, isPartTwo: normalize(r.also || '') === path }));
}
