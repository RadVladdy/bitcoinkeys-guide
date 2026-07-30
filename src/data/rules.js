// The fifteen rules — the spine of the whole course.
//
// ADDED 2026-07-29. Before this, /learn/rules was a list of ten rules that each
// linked OUT to the lesson that explained it. Sitting at position 5 of 17, seven
// of those ten links pointed FORWARD to material the reader hadn't reached yet:
// a table of contents wearing a lesson's clothes, and the single most anti-linear
// thing on the site.
//
// The fix inverts it. The rules now come FIRST — lesson 1 of 101 — as a preface
// and a contract: these fifteen rules are the whole thing; follow them and you're
// safe; everything after this is one rule at a time, in full. The page itself
// carries NO outbound links (that's what made the old one a hub). Instead each
// rule names, in plain text, the level and the exact lesson title that expands it.
//
// The lessons then reference the rules BACKWARD — every lesson opens with the
// numbered rule it exists to teach, linking back here. That's the invariant worth
// keeping: on this site, links point backwards. Nothing points forward except
// "next lesson."
//
// ONE SOURCE for: the /learn/rules page, the rule band at the top of each lesson,
// and the rule line under each lesson in the /start syllabus.
//
// `href` is here so the LESSONS can find their own rule. The rules page
// deliberately ignores it — see above.

export const rules = [
  // ---- 101 · Foundations ----
  {
    n: 1,
    short: 'Your Bitcoin is a key',
    rule: 'Your Bitcoin is a key. Hold the key, hold the coins.',
    body: 'Your coins don’t sit inside a wallet the way cash sits in a leather one. They live on a public ledger everyone can see, and what makes them <em>yours</em> is that you, and only you, hold the secret key that can move them. There is no bank to call and no password to reset. There is just the key.',
    href: '/learn/bitcoin-keys',
    level: '101',
    lesson: 'What Bitcoin keys are, and how they work',
  },
  {
    n: 2,
    short: 'Hot for spending, cold for savings',
    rule: 'Spending money hot, savings cold — and never mix the two.',
    body: 'A wallet is <strong>hot</strong> when its keys live on something connected to the internet, and <strong>cold</strong> when they don’t. Keep only walking-around money hot, on your phone, where losing it would sting but not hurt. Everything you’re actually saving belongs cold, on a device that stays offline.',
    href: '/learn/bitcoin-keys',
    level: '101',
    lesson: 'What Bitcoin keys are, and how they work',
  },
  {
    n: 3,
    short: 'Most losses are self-inflicted',
    rule: 'Most lost Bitcoin was never stolen. The owner lost it.',
    body: 'The mental picture is a hacker. The reality is a house fire, a single backup nobody copied, a word miscopied and never checked, or an owner who died without leaving instructions. Thieves are real and worth defending against — but they are not the main thing that stands between you and your Bitcoin. You are.',
    href: '/learn/how-bitcoin-is-lost',
    level: '101',
    lesson: 'How people lose Bitcoin',
  },
  {
    n: 4,
    short: 'Not your keys, not your coins',
    rule: 'Not your keys, not your coins.',
    body: 'Bitcoin sitting on an exchange isn’t really your Bitcoin. It’s a promise from a company to give you some later — and companies go bankrupt, get hacked, and freeze accounts. Mt. Gox lost roughly 850,000 coins. FTX vaporised about $8 billion. Move your coins off the exchange after you buy. That one step is what this whole guide is about.',
    href: '/learn/not-your-keys',
    level: '101',
    lesson: 'Not your keys, not your coins',
  },

  // ---- 102 · Your setup ----
  {
    n: 5,
    short: 'Simplest setup that covers you',
    rule: 'The simplest setup that covers you wins.',
    body: 'Not the most impressive one. Not the one a vendor is selling. The simplest one that defends against the risks you can actually name out loud. Every real setup fits on one ladder — find the lowest rung that covers you, and then stop climbing.',
    href: '/learn/ladder',
    level: '102',
    lesson: 'The configuration ladder',
  },
  {
    n: 6,
    short: 'Complexity is not security',
    rule: 'More complexity isn’t more security.',
    body: 'This is the rule people find hardest to believe, and it’s the one that costs the most when ignored. Complexity is the single biggest cause of lost Bitcoin: more keys, more devices and more clever schemes mean more ways for <em>you</em> to lose access. Climb the ladder only for a reason you can say in one sentence.',
    href: '/learn/ladder',
    level: '102',
    lesson: 'The configuration ladder',
  },
  {
    n: 7,
    short: 'The words are the money',
    rule: 'The device is replaceable. The words are the money.',
    body: 'A hardware wallet is a safe place to keep a key and put it to work — but it is not your Bitcoin. Lose it, break it, or drop it in a lake and you buy another one and type your words back in. Lose the words and the money is gone forever. Choose the device carefully; guard the words with your life.',
    href: '/learn/choose-a-wallet',
    level: '102',
    lesson: 'How to choose a hardware wallet',
  },

  // ---- 103 · The build ----
  {
    n: 8,
    short: 'Never digital',
    rule: 'Never let your words touch anything digital.',
    body: 'No photo. No cloud note. No password manager. No typing them into a phone or a computer, not even for a second, not even to “check” them. A digital copy of your words is a hot wallet holding everything you own, and it can leak years later when some account you forgot about gets breached. Paper, or better, metal.',
    href: '/learn/back-up-your-seed',
    level: '103',
    lesson: 'Back up your seed phrase',
  },
  {
    n: 9,
    short: 'Test the backup',
    rule: 'A backup you haven’t tested is a hope.',
    body: 'One miscopied word and your backup is worthless — and you find out on the day you need it, which is the worst possible day. Wipe the device and restore from your words with a tiny amount before you trust it with savings. Then do it again once a year. Trust nothing you have not personally tested.',
    href: '/learn/test-your-backup',
    level: '103',
    lesson: 'Test your backup',
  },
  {
    n: 10,
    short: 'Verify on the device screen',
    rule: 'Verify the address on the device’s own screen.',
    body: 'Malware exists that silently swaps the address you copied for an attacker’s, and your computer will show you the swap without blinking. The hardware wallet’s own little screen can’t be faked that way. Read the address there, confirm it matches, and only then approve. Every single time.',
    href: '/learn/send-bitcoin-safely',
    level: '103',
    lesson: 'Send Bitcoin safely',
  },
  {
    n: 11,
    short: 'Only real Bitcoin',
    rule: 'Only ever send real, native Bitcoin.',
    body: 'There is one Bitcoin. There are also dozens of look-alike copies on other blockchains, and some apps will happily let you send your coins out onto one of them. If anything asks you to pick a “network,” choose Bitcoin. A wrong-network send lands your coins somewhere your wallet cannot see, and no typo check will save you.',
    href: '/learn/send-bitcoin-safely',
    level: '103',
    lesson: 'Send Bitcoin safely',
  },

  // ---- 104 · The long haul ----
  {
    n: 12,
    short: 'Nobody asks for your words',
    rule: 'Nobody legitimate will ever ask for your seed words.',
    body: 'Not your wallet maker. Not your exchange. Not support, not a wallet “migration,” not a security check, not an urgent message about suspicious activity on your account. There is no exception and there never will be. Phishing is the number-one real-world attack, and this one sentence defeats nearly all of it.',
    href: '/learn/phishing-and-scams',
    level: '104',
    lesson: 'Phishing and everyday safety',
  },
  {
    n: 13,
    short: 'Don’t be known as a holder',
    rule: 'Don’t be known as a holder.',
    body: 'Physical attacks are almost never random. They start with a leaked customer list, get cross-referenced against anything you’ve said publicly about owning Bitcoin, and end at your door. Cryptography can’t protect you from someone standing in your kitchen. Being unremarkable can. Share the idea, never your holdings.',
    href: '/learn/privacy',
    level: '104',
    lesson: 'Privacy and a low profile',
  },
  {
    n: 14,
    short: 'A fresh address every time',
    rule: 'A fresh receiving address, every single time.',
    body: 'Reusing one address publishes your whole financial history to anyone who looks — the ledger is public, and every payment to that address is permanently linked to every other. Your wallet generates a new address for free, forever. Use it. This one free habit does most of the privacy work.',
    href: '/learn/privacy',
    level: '104',
    lesson: 'Privacy and a low profile',
  },
  {
    n: 15,
    short: 'Plan for the day you’re gone',
    rule: 'Plan for the day you’re gone.',
    body: 'Most Bitcoin that vanishes forever wasn’t stolen — it was left behind with no instructions. Your family finds a metal plate and a strange gadget, has no idea what either is, and bins them. Write down what you have, where it is, and how to reach it, in language a grieving non-technical person can follow. Then rehearse it with them.',
    href: '/learn/inheritance',
    // Rule 15 is the one rule taught across TWO lessons: why it goes wrong, then
    // how to build the fix. `also` lets the second lesson carry the same band
    // rather than being the only lesson on the site without one.
    also: '/learn/recovery-kit',
    level: '104',
    lesson: 'Why Bitcoin doesn’t inherit like money',
  },
];

/** The one idea the other fifteen are all expressions of. Deliberately unnumbered. */
export const umbrella = {
  rule: 'Verify. Don’t trust.',
  body: 'Check your backup instead of assuming it. Check the address on the screen instead of trusting the computer. Check the rules yourself, with your own node, instead of taking a company’s word for what’s yours. Every rule above is one instance of this one.',
  href: '/learn/run-a-node',
  level: '201',
  lesson: 'Run your own node',
};

export const ruleCount = rules.length;

const normalize = (p) => (p || '').replace(/\/+$/, '') || '/';

/** Every rule a given lesson is responsible for teaching (some lessons own two). */
export function rulesFor(pathname) {
  const path = normalize(pathname);
  return rules
    .filter((r) => normalize(r.href) === path || normalize(r.also || '') === path)
    .map((r) => ({ ...r, isPartTwo: normalize(r.also || '') === path }));
}

/** Rules grouped by the level whose lessons teach them — how the rules page renders. */
export const rulesByLevel = rules.reduce((acc, r) => {
  (acc[r.level] ||= []).push(r);
  return acc;
}, {});
