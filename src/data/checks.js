// Per-lesson knowledge checks — "did that land?", not "what setup do you need?".
//
// Deliberately the SECOND thing built after /quiz was
// renamed /find-your-setup: the setup finder was never a quiz (it tests nothing —
// it asks about your situation), and shipping real knowledge checks while that
// page still owned the word would have left two things called "quiz", one of them
// wrongly. The rename freed the word; this is what it was freed for.
//
// KEYED BY RULE KEY, NOT BY LESSON SLUG. Every lesson exists to teach exactly one
// rule, so a check tests THAT rule and is found the same way <RuleBand> finds its
// rule — via rulesFor(pathname) in rules.js. Three consequences worth knowing:
//   · A lesson that owns no rule (the rules page itself, plus the concept lessons
//     — bitcoin-keys, beyond-the-ladder, generate-your-seed) gets no check and
//     renders nothing, rather than inventing one.
//   · TWO lessons own two rules each and so carry two checks each: /learn/ladder
//     (since 2026-08-06) and /learn/privacy. The ladder's pair are deliberately
//     different questions about different rules — one asks WHEN to climb
//     (consequence-scaling), one asks HOW SIMPLE to build — and if they ever
//     start reading as the same question, the rules have drifted back together.
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
//      means the feature needs no consent copy at all.
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
// curriculum.js imports rules.js and nothing imports THIS file back, so there is no
// cycle. It is imported for one job: proving a declared lesson-keyed exception
// names a real lesson (see lessonChecks at the bottom).
import { levels } from './curriculum.js';

const norm = (p) => (p || '').replace(/\/+$/, '') || '/';

/** @type {Record<string, { q: string, options: { t: string, c?: true }[], why: string }[]>} */
export const checks = {
  // ── Rule 01 · /learn/not-your-keys ───────────────────────────────────────
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

  // ── Rule 02 · /learn/how-bitcoin-is-lost ─────────────────────────────────
  // ADDED 2026-08-06 with the rule itself. The second question is the one this
  // lesson has always asked — it moved here from the merged-away `self-inflicted`
  // key without changing a word of the question, because the LESSON did not move
  // and its headline fact is still the thing worth testing. Only its `why` gained
  // a closing line, to land on the rule this check now hangs from.
  'independent-things': [
    {
      q: 'Which of these leaves no single failure able to take everything?',
      options: [
        { t: 'Three hardware wallets from the same maker, each held in a different room' },
        { t: 'One seed phrase, plus a passphrase that device has never seen, backed up separately', c: true },
        { t: 'One hardware wallet with a long PIN, kept in a good safe' },
      ],
      why: 'This rule is about independence, not about how many pieces you own — and it is not an argument against single-signature wallets. One seed plus a passphrase the device never saw is two genuinely independent things: whoever finds the words still cannot spend, and a flaw in the device does not reach the passphrase. Three keys from one manufacturer look like three things and behave like one, because the same firmware defect, the same bad batch or the same company reaches all of them at once. A PIN protects the hardware, not the wallet — anyone holding your words is never asked for it. Count what has to fail.',
    },
    {
      q: 'Of all the Bitcoin that has been lost so far, what accounts for the largest share?',
      options: [
        { t: 'Hackers breaking into wallets and exchanges over the internet' },
        { t: 'Owners losing access to it themselves, with no thief involved', c: true },
        { t: 'Exchange bankruptcies and government seizures' },
      ],
      why: 'Most Bitcoin that has been lost was never stolen. It went to a backup nobody copied, a single copy that burned, a word miscopied and never checked, or an owner who died leaving no instructions. Even among the losses people do call theft, over 80% turn out to be a scam or a simple slip rather than anyone breaking security. Thieves are real and worth defending against — they are just not the main thing standing between you and your Bitcoin. Notice the shape of nearly every one of those: one thing failed, and there was nothing behind it.',
    },
  ],

  // ── Rule 03 · /learn/hot-and-cold ────────────────────────────────────────
  'savings-offline': [
    {
      q: 'A friend keeps their savings in a phone wallet where they hold the keys themselves — no company can touch the coins. Is that cold storage?',
      options: [
        { t: 'Yes — they hold their own keys, so the wallet is genuinely theirs' },
        { t: 'No — holding your own keys and keeping them offline are two different questions', c: true },
        { t: 'Yes, as long as the phone is locked with a fingerprint and the app encrypts the keys' },
      ],
      why: 'Non-custodial is about who holds the keys, and a phone wallet passes that test — the keys really are theirs. Hot and cold is about what can reach those keys, and there it fails: the phone goes online, so the keys are reachable by whatever reaches any online device. Both things are true at once, and it is easy to answer the wrong one. A fingerprint and encryption protect the device against whoever is holding it; they do not take it offline. Spending money can be hot. Savings are cold, and they stay cold.',
    },
    {
      q: 'You decide to keep everything — spending money and savings alike — in one hardware wallet that stays offline. What is the objection?',
      options: [
        { t: 'There is none; one cold wallet for everything is the safest arrangement available' },
        { t: 'A wallet you are reluctant to touch is a wallet you stop rehearsing', c: true },
        { t: 'Hardware wallets handle small everyday amounts badly' },
      ],
      why: 'One cold wallet for everything is safe, and it quietly stops you using Bitcoin — which matters more than it sounds, because a wallet you avoid touching is a wallet whose backup never gets tested. The opposite arrangement fails differently: keep everything hot and the balance climbs a little at a time, with no day on which it obviously becomes savings. Nobody decides to keep their savings on a phone; they just never move them off it. Run a small hot balance for spending, sweep the rest to cold, and let the two stay separate.',
    },
  ],

  // ── Rule 04 · /learn/ladder ──────────────────────────────────────────────
  // ADDED 2026-08-06. The first question moved here intact from `simplest-setup`,
  // where it had always been the odd one out: "when do I climb?" tests scaling,
  // not simplicity. It now sits on the rule it was actually asking about.
  'more-at-stake': [
    {
      q: 'Which of these is a real reason to move up a rung?',
      options: [
        { t: 'Your holdings have multiplied, and thinking about them on a single key now makes you uneasy', c: true },
        { t: 'You have read about a more advanced setup and want to try it out' },
        { t: 'A year has passed since you built the setup you are on' },
      ],
      why: 'The clearest reason to climb is that what you are securing has outgrown the rung you are on — that unease is the signal, and it counts. Curiosity and the calendar are not reasons. Every rung solves a real problem and introduces new ways to fail, so climbing without a reason you can name buys you complexity and nothing else. When a real reason does arrive, move up one rung deliberately and test the new setup as carefully as you tested the first.',
    },
    {
      q: 'You built your setup two years ago for a small amount you were learning with. Nothing about it has changed, and what it holds has grown twenty-fold. What has happened to your security?',
      options: [
        { t: 'Nothing — the setup is exactly as strong as it was the day you built it' },
        { t: 'It has fallen behind, because security is only ever measured against what it is holding', c: true },
        { t: 'It has improved — two years without an incident is evidence the setup works' },
      ],
      why: 'The setup is unchanged and that is the problem: it is doing the same job against a much larger consequence. Security is not a property an arrangement has on its own, it is a relationship between the arrangement and what it protects — so the same wallet can be entirely adequate in one year and thin in the next without anybody touching it. Nothing warns you, because nothing about it changed. And years without an incident say nothing either: a setup with a single point of failure looks identical to a sound one right up until the day it does not. Re-ask the question when what you hold moves, not when the calendar does.',
    },
  ],

  // ── Rule 05 · /learn/ladder ──────────────────────────────────────────────
  // MERGED 2026-08-06 — this rule absorbed the old rule 01 ("you are the main
  // risk"), so its second question is that rule's, kept intact. It is the better
  // test of the merged idea than anything written fresh would be: the trade it
  // describes is exactly why the simplest adequate setup wins.
  'simplest-setup': [
    {
      q: 'You are about to build a setup for savings you would genuinely miss. Which question should decide it?',
      options: [
        { t: '"What is the most secure setup I can build?" — then build that one' },
        { t: '"What is the simplest setup that covers the risks I can actually name?" — with a floor under it', c: true },
        { t: '"What does the maker of my hardware wallet recommend?" — they know their own device best' },
      ],
      why: 'Ask for the simplest setup that adequately covers risks you can name out loud, not the most impressive one. Complexity you do not fully control is itself a threat, and adopting more of it than you can manage is the most repeated cause of lost Bitcoin there is. The maker knows their device and not your situation, and the most secure setup available is almost never the one you can still operate correctly in ten years. But "simplest" has a bottom: it never means leaving one thing whose failure takes the lot, and where those two ideas collide the floor is what wins.',
    },
    {
      q: 'You add a secret passphrase so that a burglar who finds your written words still cannot spend the coins. What has that done to your overall risk?',
      options: [
        { t: 'Lowered it with no downside — the seed backup is exactly as safe as it was' },
        { t: 'Defended against theft and created a fresh way to lock yourself out', c: true },
        { t: 'Mostly protected you against someone reaching your device over the internet' },
      ],
      why: 'There are only two ways to lose Bitcoin: you cannot get to it, or someone else can. Almost every defence against one of those makes the other worse. A passphrase genuinely stops someone who finds your words, and it adds a second secret you can forget, mistype, or fail to pass on. Spreading a backup across three cities survives a fire and makes reassembly harder for you too. That trade is why there is no single "just do this" answer, and why a setup is worth choosing deliberately rather than piling on protections.',
    },
  ],

  // ── Rule 06 · /learn/choose-a-wallet ─────────────────────────────────────
  'buy-direct': [
    {
      q: 'Your new hardware wallet arrives with a card in the box listing its 24 seed words, so you do not have to copy them down yourself. What is that?',
      options: [
        { t: 'A convenience some makers offer — check the card against what the device shows' },
        { t: 'A compromised device, because somebody else has already seen those words', c: true },
        { t: 'A spare backup, worth storing somewhere separate from your handwritten copy' },
      ],
      why: 'A trustworthy device generates brand-new seed words in front of you the first time you power it on — that is the entire point of it. Words that arrive already printed, or a device that shows you a seed phrase the moment you switch it on, mean somebody else has seen them and can spend anything you ever send there. There is nothing to check and no way to make it safe. Do not use it; return it.',
    },
    {
      q: 'Where should you buy the device?',
      options: [
        { t: 'A large online marketplace, for the buyer protection and easy returns' },
        { t: 'Direct from the manufacturer’s own website', c: true },
        { t: 'Any reputable reseller, as long as the box is still sealed when it arrives' },
      ],
      why: 'Order from the maker’s own website. A marketplace listing or a reseller can put a tampered unit in your hands — one already loaded with somebody else’s keys — and you would not find out until your coins left. The tamper-evident packaging is worth a 30-second look when it arrives, but a seal is a check rather than a proof; resealing a box is not hard. Buying direct also avoids creating a public record tying "owns a hardware wallet" to your name and address.',
    },
  ],

  // ── Rule 07 · /learn/back-up-your-seed ───────────────────────────────────
  'never-digital': [
    {
      q: 'Which of these counts as keeping your seed phrase off anything digital?',
      options: [
        { t: 'Storing it in a password manager that encrypts everything on your own device' },
        { t: 'Photographing the words on a phone that has its internet connection turned off' },
        { t: 'Writing them by hand, then stamping them into metal', c: true },
      ],
      why: 'Your seed should only ever exist in two places: written by hand on a physical object, and — for a moment during setup — on the wallet’s own screen. A password manager swaps a secret you must protect for a password you must never forget or leak, and leaves an encrypted copy sitting permanently in somebody else’s backup history. A phone with the internet switched off is still a phone: they get backed up, updated, handed in for repair, upgraded and sold, and the photo outlives the intention every time. Paper for the moment of setup, then metal for the long haul.',
    },
    {
      q: 'You split your 24 words so that 12 live at home and 12 at your sister’s house — neither place holds the whole phrase. Is that a good backup?',
      options: [
        { t: 'Yes — neither half is enough to steal, so it halves your risk' },
        { t: 'No — it doubles the ways to lose everything, and half a phrase is a large head start', c: true },
        { t: 'Yes, provided both halves are stamped into metal rather than left on paper' },
      ],
      why: 'It sounds like it halves your risk and it does the opposite: now both halves have to survive, so you have doubled the ways to lose the lot — and someone who finds one half holds a very large head start rather than nothing. There is a properly engineered version of this idea, Shamir backup, and a hand-split list is not it. The boring answer keeps winning because a backup has to work decades from now, for a tired version of you or for somebody who has never heard of any of this: at least two complete copies, each in a genuinely separate place.',
    },
  ],

  // ── Rule 08 · /learn/test-your-backup ────────────────────────────────────
  'test-backup': [
    {
      q: 'You wrote the words down and read them back against the device twice, carefully. What have you proved?',
      options: [
        { t: 'That the backup works — a word-perfect copy is a working backup' },
        { t: 'That your handwriting is legible, not that those words rebuild your wallet', c: true },
        { t: 'That the device stored the seed correctly when it generated it' },
      ],
      why: 'Reading the words back tests your copy against your copy. A word written down as a different valid word reads perfectly, can pass the wallet’s own built-in check too, and opens somebody else’s empty wallet without a murmur. The only thing that answers the real question is a restore: put a trivial amount in, wipe the device back to factory settings, and rebuild the wallet from your written words alone. Then send the test amount out and back — a balance reappearing proves the words rebuild the right addresses, not that the restored wallet can still sign.',
    },
    {
      q: 'When is the right moment for the first wipe-and-restore rehearsal?',
      options: [
        { t: 'Once your savings are in the wallet — that is when getting it right matters' },
        { t: 'Right after setup, with a tiny test amount, before any real money goes in', c: true },
        { t: 'Only when something changes — a device update, a house move, a new setup' },
      ],
      why: 'The whole value of a rehearsal is that a mistake costs you nothing, and funding the wallet first spends exactly that. Do it once at setup with roughly coffee money in the wallet, so any failure surfaces at the cheapest possible moment — while the written copy you checked against the device is still intact and can be re-read word by word. Then keep it verified: a full wipe-and-restore every year or two, and after any device update, move, or change to your setup. Passing once does not mean passing forever.',
    },
  ],

  // /learn/send-bitcoin-safely's two questions did not move here — they moved to
  // `lessonChecks` at the bottom of this file, the one declared exception to the
  // rule-keyed scheme. See the note there for why the exception exists and why it
  // is a list of one.

  // ── Rule 09 · /learn/phishing-and-scams ──────────────────────────────────
  'seed-words-scam': [
    {
      q: 'An email from your hardware wallet’s maker warns of a firmware flaw and asks you to enter your recovery words on their site to move to a safe wallet. The sender’s address is correct and the site shows a padlock. What do you do?',
      options: [
        { t: 'Check the site’s security certificate, and continue if it is valid' },
        { t: 'Nothing — being asked for the words is itself the proof that it is an attack', c: true },
        { t: 'Call the support number in the email to confirm the warning is genuine first' },
      ],
      why: 'No legitimate service ever needs your seed words, for any reason — so there is no story to weigh up and no judgement call to make. The demand itself is the answer, whatever else the message got right. The padlock only means the connection is encrypted, not that the site is who it claims to be; a sender address is trivially forged, and lookalike domains are cheap; and a phone number printed inside the message reaches whoever wrote it. The only time those words are typed anywhere is a recovery you started, on a device you chose, at a moment you picked.',
    },
    {
      q: 'Nearly every version of this attack includes a reason it has to happen right now. Why is the urgency there?',
      options: [
        { t: 'Because the attacker’s fake site is usually taken offline within hours' },
        { t: 'Because it stops you checking through a channel the attacker does not control', c: true },
        { t: 'Because a hurried payment pays a higher fee and confirms before anyone notices' },
      ],
      why: 'Urgency is not decoration; it is the working part. The attack borrows credibility you already extend to a company you trust, then needs you to act before you do the one thing that defeats it — contacting them yourself, at an address you already had. So the defence is simply to wait. Nothing about your Bitcoin is ever so urgent that it cannot wait an hour, and the same rule covers more than scams: never operate your wallet while tired, stressed, upset or being rushed. A hurried owner is the most common cause of loss there is.',
    },
  ],

  // ── Rule 10 · /learn/privacy ─────────────────────────────────────────────
  'never-talk': [
    {
      q: 'Physical attacks on Bitcoin holders are almost never random. What typically starts one?',
      options: [
        { t: 'Someone watching the public ledger for unusually large balances' },
        { t: 'A leaked customer list, cross-referenced with what you have said publicly', c: true },
        { t: 'A visitor noticing a hardware wallet or a metal plate in your home' },
      ],
      why: 'The pipeline runs leak, then list, then your door. An ID check at an exchange records your name, home address and the fact that you hold Bitcoin in one file, and those files get out — through breaches, court orders, and data sold on. You cannot un-leak one. What you still control is the second half: the public clues. A post under your real name, a talk you gave, a balance screenshot, a branded hat — each is harmless on its own, and combined with a leaked home address they turn a maybe into a yes. The single most effective thing you can do is not talk about Bitcoin using your real name or face.',
    },
    {
      q: 'You tell your brother-in-law roughly what you hold. He would never rob you. Where is the risk?',
      options: [
        { t: 'There is none — the rule is about strangers online, not people you trust' },
        { t: 'He may mention it at work, and by the third telling it has reached someone you have never met', c: true },
        { t: 'He could be pressured into revealing it if he is ever targeted himself' },
      ],
      why: 'The instinct is that this rule is about strangers on the internet. It is not: almost everyone who gets targeted was known to hold Bitcoin by somebody who told somebody else. He mentions it at work, the colleague repeats it at a bar, and by the third telling it has reached a stranger — still attached to your name and the town you live in. You control the first telling and nothing after it. None of this requires lying: "I own some Bitcoin" is a perfectly good answer to a friend, and "I would rather not get into numbers" is a complete sentence. What you cannot do is un-say a figure.',
    },
  ],

  // ── Rule 11 · /learn/privacy ─────────────────────────────────────────────
  'fresh-address': [
    {
      q: 'Your wallet offers a new receiving address each time, but reusing the old one is easier. What does reusing it cost you?',
      options: [
        { t: 'Nothing on its own — an address is a nickname, and yours is not your name' },
        { t: 'A permanent, public diary of your money, all of it obviously one recipient', c: true },
        { t: 'Nothing now, but the wallet slows down as one address accumulates history' },
      ],
      why: 'Address reuse is the single most damaging privacy habit there is. The ledger is public and permanent, so every payment to a reused address is obviously the same recipient — no clever guessing required. Reuse one for years and you have handed an analyst every coin in, every coin out and everyone you dealt with, already grouped and waiting for a real name to be attached. The habit costs nothing to fix: your wallet usually offers a fresh address by default, so let it, and never post a fixed public address on a website or profile.',
    },
    {
      q: 'Does taking a fresh address every time mean a new backup each time?',
      options: [
        { t: 'Yes — each address has its own key, so each one has to be recorded' },
        { t: 'No — every address comes from the single backup you already made', c: true },
        { t: 'Only once you are past a few dozen addresses' },
      ],
      why: 'Your wallet generates an endless supply of addresses from your one backup, at no cost, including ones it has not handed out yet. That is exactly what makes the habit free — there is nothing extra to write down and nothing extra to lose. One related habit is worth knowing: your wallet holds separate chunks of coin from past payments, and when you spend it may pull several of them into one payment, which quietly tells an analyst they all belong to the same person. Wallets that offer coin control let you choose which chunks to spend, and keeping coins from different sources apart protects what fresh addresses buy you.',
    },
  ],

  // ── Rule 12 · /learn/inheritance (and /learn/recovery-kit, via `also`) ────
  // Both lessons carry this band, so the check renders on both — every question
  // has to be answerable from the FIRST of the two, which is where a reader meets
  // it. Nothing here depends on the Kit lesson's own material.
  'leave-a-plan': [
    {
      q: 'Your heirs find a metal plate with your seed words on it and load them into a wallet app. It shows an empty wallet. What is the most likely explanation?',
      options: [
        { t: 'A word was copied down wrong, so the phrase rebuilds nothing' },
        { t: 'The real funds sit behind a passphrase nobody told them about', c: true },
        { t: 'The coins were moved elsewhere before death, so there is nothing to find' },
      ],
      why: 'This is the most common way Bitcoin is lost to death, and it is why the passphrase deserves its own line in your plan. A passphrase opens a separate, hidden wallet; the seed words on their own open a different one, which looks entirely normal while being empty. The family concludes there was nothing there and stops looking. If you use one, it has to be backed up and inheritable, stored somewhere the seed is not, and your instructions must state plainly that it exists — the fact of it, never the passphrase itself. "It is only in my head" is not a plan.',
    },
    {
      q: 'Your multisig is solid: three keys, three locations, and your heirs know exactly where each one is. What is still missing?',
      options: [
        { t: 'Nothing — two of the three keys is everything a wallet needs' },
        { t: 'The descriptor, the file describing how those keys form one wallet', c: true },
        { t: 'A wallet app that supports multisig — a modern one finds the coins from the keys alone' },
      ],
      why: 'For multisig the keys are not enough. Your heirs also need the descriptor: a short configuration file saying which keys make up the wallet and the technical settings that go with them. Without it, even somebody holding every key can struggle to rebuild the wallet, because no software can work out from keys alone what wallet they belong to. It holds no private keys and cannot spend anything, so it is safe to include in your written instructions — and it has to be. The wider point: for inheritance the problem is almost never security, it is findability. A rock-solid wallet with no instructions is worse than a simple wallet with good ones.',
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

// ── THE ONE DECLARED EXCEPTION: A CHECK KEYED TO A LESSON ───────────────────
//
// ADDED 2026-08-06, immediately after the rules restructure that made it
// necessary, and DECLARED rather than left to a pattern — the same shape as
// check-lesson-exits.py's and check-device-coverage.py's exemptions, for the same
// reason: an exception nobody can see is indistinguishable from a rule that never
// applied.
//
// WHY IT EXISTS. Checks hang off rules, so when verifying the address on the
// device stopped being one of the twelve that day, /learn/send-bitcoin-safely lost
// its two questions with it — the only lesson ever to LOSE a check rather than
// never having had one. The call was to demote the topic from THE RULES, not from
// importance; the lesson still teaches the habit in full, and address-swapping
// malware is the top real-world attack this course names. A safety-critical lesson
// with no way for a reader to discover they misunderstood it is a worse outcome
// than an exception with a reason attached.
//
// WHY IT IS NOT THE NEW DEFAULT. Keying on the rule is what makes re-homing a rule
// MOVE its check automatically; a slug map strands checks on old lessons, which is
// invariant #11's failure mode. So this stays a short, asserted list, and the
// assertion below refuses two things outright:
//   · a lesson that ALREADY owns a rule (it would then have two sources for one
//     check — this project's house bug, two surfaces about one subject);
//   · a path that is not a lesson at all.
// If this list ever grows past a couple of entries, the scheme is wrong and the
// argument should be reopened, not the list extended.
export const lessonChecks = {
  '/learn/send-bitcoin-safely': [
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

// Validate the exception list at import, same as the rule-keyed map above.
{
  const owned = new Set(rules.flatMap((r) => [norm(r.href), norm(r.also || '')]));
  const lessonPaths = new Set(levels.flatMap((lv) => lv.lessons.map((l) => norm(l.href))));
  for (const path of Object.keys(lessonChecks)) {
    const p = norm(path);
    if (!lessonPaths.has(p)) {
      throw new Error(`checks.js: lessonChecks key "${path}" is not a lesson in curriculum.js`);
    }
    if (owned.has(p)) {
      throw new Error(
        `checks.js: lessonChecks key "${path}" already owns a rule, so it would carry two sources for one check — key it to the rule instead.`,
      );
    }
    for (const [i, c] of lessonChecks[path].entries()) {
      const correct = c.options.filter((o) => o.c).length;
      if (correct !== 1) {
        throw new Error(`checks.js: lessonChecks "${path}" question ${i + 1} has ${correct} correct options, expected exactly 1`);
      }
    }
  }
}

/** The checks for a given rule key, or null. */
export const checksFor = (key) => checks[key] || null;

/** The declared lesson-keyed checks for a path, or null. Almost always null. */
export const lessonChecksFor = (pathname) => lessonChecks[norm(pathname)] || null;

/** How many rules currently have a check — derived, never typed (invariant #10). */
export const checkedRuleCount = Object.keys(checks).length;

/** How many lessons carry a declared exception. Expected to stay tiny. */
export const lessonCheckCount = Object.keys(lessonChecks).length;
