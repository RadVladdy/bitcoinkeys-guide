// The configuration ladder — the spine of the whole guide.
// Source: Bitcoin KB "Self-custody configuration ladder" + per-configuration notes.
// Ascending complexity; each rung solves a real problem and introduces new failure modes.
// The rule: the SIMPLEST setup that adequately covers your threat model.
//
// A wallet here is a CONFIGURATION OF KEYS that can sign — separate from the
// hardware those keys happen to live on. The rungs describe configurations;
// hardware devices are just the recommended place to keep a key.
//
// Rung 1 (single-sig) has its own bespoke page (ladder/single-sig.astro).
// Rungs 2-4 render from the rich fields below via ladder/[slug].astro.
// Shamir is an OPTIONAL backup method (shamirNote), not a numbered rung.

// Rung 2's construction guidance derives every figure from the same file the
// dice procedure uses — words, bits and throws are never typed here.
import { passphraseByKey, PBKDF2_ITERATIONS } from './dice.js';

const ppFloor = passphraseByKey.floor;
const ppSavings = passphraseByKey.savings;

export const ladder = [
  {
    slug: 'single-sig',
    step: 1,
    name: 'Single-signature',
    accent: 'Single',
    pageName: 'Single-signature wallet',
    short: 'Single-sig',
    tagline: 'One key, one seed, one backup — kept on a hardware device you control. The simplest self-custody that isn’t negligent.',
    forWho: 'Most newcomers · modest stack relative to net worth',
    solves: 'Your coins leave someone else’s balance sheet and come under a key only you hold. That is the single biggest jump in safety on this whole ladder.',
    introduces: 'One seed backup that must never be lost and never be seen. Everything now rests on that one thing.',
    whatItIs: 'One hardware wallet holds a single seed. The device signs transactions; you confirm on its own screen and buttons. Your seed is backed up once or twice on metal, stored somewhere secure. That’s the whole setup — and for most people starting out, it’s the right one. This is the simplest setup that genuinely protects your coins, and there is a single mental model to learn.',
    gains: [
      '<strong>Simplicity.</strong> One device, one seed, one backup. Little to get wrong, little to forget.',
      '<strong>Cost.</strong> A capable device runs $59–$249. No coordination software, no service fees.',
      '<strong>Fast recovery.</strong> One seed phrase into one wallet and you’re back — no extra files or coordination to piece together.',
      '<strong>Universal support.</strong> Every wallet app and every guide supports it.',
    ],
    costs: [
      '<strong>No second layer.</strong> If someone gets the seed, they can spend the coins. Nothing else stands in the way.',
      '<strong>Coercion exposure.</strong> With one seed, an attacker who forces you to hand it over sees the whole balance. A passphrase — the next rung — is the usual answer to that specific worry.',
    ],
    keyRisk: {
      label: 'The single point of failure',
      body: 'Everything rests on that one seed backup: it must <strong>never be lost</strong> and <strong>never be seen</strong>. Any single event that breaks one of those — a fire that takes an untested backup, a photo of the words, a nosy visitor — can take everything. Every rung above exists to remove exactly this weakness, at the cost of complexity.',
    },
    whoShould: 'Holders whose stack is modest relative to their net worth; anyone in their first year of self-custody; anyone whose main concern is exchange risk rather than a targeted physical attacker. The near-universal pattern across custody experts is <em>small balance on single-sig for convenience; large balance on multisig for security</em>. Leaping straight to a five-key setup adds complexity you’re not yet equipped to manage — and at this scale that complexity is a larger threat than the ones it defends against.',
    whenToClimb: 'If losing this Bitcoin would genuinely hurt, our position is that you climb — this rung is a single point of failure, and one thing failing should never be able to take everything. A passphrase is the next rung and the smallest step that fixes it: a second secret that has to be right as well, which also answers a found or photographed seed. Multisig removes the single point of failure at the hardware level, so no one device or maker can ever be enough. And if you want a professional safety net for your heirs, collaborative custody is rung 4. Learning with a small amount? Staying here is genuinely fine.',
    cost: '$59–$249',
    built: true,
  },

  {
    slug: 'passphrase',
    step: 2,
    name: 'Single-signature + passphrase',
    accent: 'passphrase',
    pageName: 'Single-signature wallet + passphrase',
    diagram: 'passphrase',
    short: '+ Passphrase',
    tagline: 'Add a secret “25th word.” The seed alone opens a decoy; seed + passphrase opens the real wallet.',
    forWho: 'Holders worried about seed-phrase exposure or coercion',
    cost: '$59–$249 (same device)',
    solves: 'A found or photographed seed is no longer enough to steal your coins. Plausible deniability.',
    introduces: 'A new way to lose everything — forget the passphrase and the funds are gone, even with the seed.',
    built: true,
    whatItIs: 'Exactly rung 1, plus a passphrase you choose when you set up the wallet. The seed phrase on its own opens one wallet — a <em>decoy</em>. The seed phrase <strong>plus</strong> the passphrase opens a different, hidden wallet — your real one. The passphrase is sometimes called the “25th word.” <a href="/deep-dive/passphrase">Watch a passphrase open a different wallet →</a>',
    gains: [
      '<strong>Protection against a found seed.</strong> A metal backup someone discovers, a photographed seed, a seed pulled off a compromised device — none of them alone can spend your real funds.',
      '<strong>Plausible deniability.</strong> The decoy wallet doesn’t look like a decoy. Under coercion you can hand over the seed and the (small) decoy wallet without revealing the real one.',
      '<strong>Cheap to add.</strong> You already own the device. You just choose a passphrase during setup.',
    ],
    costs: [
      '<strong>A brand-new single point of failure.</strong> Lose or forget the passphrase and the coins are gone — even though the seed is safe.',
      '<strong>A passphrase is not a password.</strong> It can’t be reset, rate-limited, or recovered. A weak or guessable one is almost as bad as none.',
      '<strong>Deniability is a belief, not a guarantee.</strong> There are documented cases where a decoy didn’t convince an attacker and the victim was harmed anyway.',
    ],
    keyRisk: {
      label: 'The passphrase-backup problem — the #1 inheritance failure',
      body: 'The most common documented way people lose passphrase-protected Bitcoin: they pick a strong passphrase, memorise it, never write it down (“if someone finds it, the whole point is gone”), then forget it or die. The seed is backed up, so the wallet <em>looks</em> recoverable — it isn’t. If you use a passphrase, you must back it up as carefully as the seed, stored separately from it, in a different place.',
    },
    // LAYER 1 AND 2 OF THREE — how it works, then what is functionally possible,
    // and only then the best practice below. Decided 2026-08-03 as the standard
    // shape for every teaching surface here. This block was written SECOND, after
    // `craft`, and the gap is the argument for the standard: the guidance below
    // was a list of rules with the mechanism that produces them left out, so a
    // reader could follow it and still not be able to explain any of it.
    mechanism: {
      label: 'How it actually works — and what that makes possible',
      lead: 'A passphrase is not stored anywhere. Not on the device, not in your backup, not in the wallet file. It is an <em>ingredient</em>: your seed words and your passphrase go into one standard calculation, and a wallet comes out. Change a single character and the calculation produces a different wallet — not an error, a different wallet. Almost everything else about a passphrase follows from that one fact.',
      points: [
        '<strong>It is why there is no “wrong passphrase” message.</strong> Nothing has a copy of the right one to compare yours against. Every passphrase is valid; they simply open different wallets. Put a capital in the wrong place and your device shows you a real, empty, perfectly ordinary wallet and says nothing is amiss.',
        '<strong>It is why it cannot be reset, rate-limited, or recovered.</strong> A password lives inside a system that can lock someone out after three wrong tries. This is arithmetic. Anyone holding your seed backup runs that same calculation on their own machine, as often as they like, with nobody to stop them.',
        '<strong>Any string at all is a passphrase.</strong> Letters, digits, punctuation, spaces — any length your device accepts. Nothing is rejected and no format is required, which is a freedom and a hazard in the same breath, because a typo is also a perfectly valid passphrase.',
        '<strong>One seed can open any number of wallets.</strong> A different passphrase gives you a different wallet from the very same words, and you are never choosing between them — that is exactly what makes the decoy above work. The “no passphrase” wallet is simply one more of them: an empty passphrase is what your seed opens on its own.',
        '<strong>Most devices will show you a wallet fingerprint</strong> — a short code identifying the wallet you have just opened. It is the only feedback the design allows, and it is genuinely useful: the same passphrase always produces the same fingerprint, so a code that does not match the one you noted means you mistyped something.',
      ],
    },
    // LAYER 3 — best practice, and it now sits on top of the mechanism above.
    // ADDED 2026-08-03. The site has told readers to "choose it carefully" and
    // that "a weak one is almost as bad as none" since the rung was written, and
    // has never once said HOW. That gap got worse the day this guide made rung 2
    // its floor for money whose loss would hurt: we now route people here on
    // purpose, so a passphrase anyone could guess is a floor we built ourselves.
    craft: {
      label: 'How to actually build one',
      lead: 'A passphrase is the one part of this setup with no safety net anywhere in it. It cannot be reset, nothing rate-limits a guess, and there is no such thing as a “wrong passphrase” error — mistype it and a different wallet opens, empty and perfectly valid, with nothing to tell you which one you are looking at. Everything below follows from that.',
      points: [
        `<strong>Generate it. Don’t invent it.</strong> This is the whole thing, and it is the step almost everyone skips. A passphrase you thought of is worth a small fraction of the strength it feels like, because the part that makes it memorable — real words in a sensible order, a name, a date, a lyric, a substitution you thought was clever — is the first thing a cracking rig models. Roll it, the same way you rolled your seed, off <a href="/dice-word-table">the same printed word table</a>.`,
        `<strong>${ppFloor.wordsWord.charAt(0).toUpperCase() + ppFloor.wordsWord.slice(1)} words is the floor. ${ppSavings.wordsWord.charAt(0).toUpperCase() + ppSavings.wordsWord.slice(1)} if it is protecting savings.</strong> That is ${ppFloor.bits} bits and ${ppSavings.bits} bits respectively — ${ppFloor.throws} throws and ${ppFloor.flips} coin flips for the first, ${ppSavings.throws} and ${ppSavings.flips} for the second. Ten minutes with dice you already have out. <a href="/roll-your-own-seed">The procedure is the same one</a> you use for a seed; you are just taking fewer words.`,
        `<strong>Length, not symbols.</strong> BIP-39 stretches your passphrase with only ${PBKDF2_ITERATIONS.toLocaleString()} rounds of hashing — a number frozen into the standard and thin by any modern measure. Someone holding your seed backup can therefore test candidates offline, on their own hardware, with nothing to slow them down. Swapping letters for punctuation buys you a handful of bits and costs you accuracy when you copy it; another word off the table buys eleven.`,
        `<strong>Plain ASCII, and no space at either end.</strong> Wallets genuinely disagree about how they treat accented letters, emoji and other non-ASCII characters, so a passphrase built from them can open your wallet on one make of device and not on another. A leading or trailing space is worse: invisible on paper, and part of the secret. Capitals and the spaces between words count too — write it down exactly as it is.`,
        `<strong>Check the length your devices actually accept.</strong> Makers set different limits, and a passphrase longer than some other wallet’s maximum is a passphrase you cannot recover on that wallet. Find the limit for every device you might restore on, not just the one you are typing it into today.`,
        `<strong>Prove it somewhere else before you fund it.</strong> The point of a passphrase is that your words plus your passphrase rebuild the wallet <em>anywhere</em>. That is a claim about other software, so test it on other software — restore on a second wallet, confirm the addresses match, and only then move coins. Testing a backup is its own lesson later in the course — <strong>Test your backup</strong>, in 103 · The build — and a passphrase doubles what there is to get wrong.`,
        `<strong>Write down the wallet fingerprint too.</strong> It is the one check the design gives you, and it costs nothing: note the code your device shows for the passphrase wallet, alongside the passphrase itself. Next time you restore, a fingerprint that matches means you typed it correctly — which is otherwise a thing you simply cannot know.`,
      ],
      foot: 'And then back it up as carefully as the seed, kept somewhere the seed is not — which is the failure directly above, and the one that actually costs people their Bitcoin.',
    },
    whoShould: 'Holders who want a second cryptographic layer without taking on the operational weight of multisig — especially when your realistic worry is “someone finds my seed backup” rather than a targeted attacker. Less useful if your real concern is sophisticated coercion, where the deniability argument gets shaky.',
    whenToClimb: 'If your holdings grow to where a single seed backup — decoy or not — feels like too much resting on one thing, the answer is to remove the single point of failure entirely with multisig (rung 3). If you want split backups without full multisig, look at the optional Shamir backup.',
  },

  {
    slug: 'multisig',
    step: 3,
    name: 'Multi-signature',
    accent: 'Multi',
    pageName: 'Multi-signature wallet',
    diagram: 'multisig',
    short: 'Multi-sig',
    tagline: 'Several keys, and it takes more than one to sign — commonly 2-of-3. No single key, lost or stolen, can move or lose your coins.',
    forWho: 'Substantial, hands-on holders willing to learn the tooling',
    cost: '$275–$800 (three devices)',
    solves: 'Removes the single point of failure entirely. One key can be lost OR stolen and you’re still safe.',
    introduces: 'Six-plus items to manage, the <a href="/glossary#wallet-descriptor">wallet descriptor</a> to protect, and real operational complexity.',
    built: true,
    whatItIs: 'A wallet made of several keys where more than one is needed to sign — most commonly <strong>2-of-3</strong>: three keys, any two together can spend. Each key ideally lives on its own hardware device, from a <em>different</em> manufacturer, all held by you. The keys live in different places (a common split: home, a bank safe-deposit box, and a trusted family member or second property). This is the first rung that genuinely removes single points of failure for personal-scale holdings. <a href="/deep-dive/multisig">Tap through a live 2-of-3 wallet →</a>',
    gains: [
      '<strong>No single point of failure.</strong> Losing any one key, or one location, or trusting any one vendor, no longer risks your coins.',
      '<strong>Full sovereignty.</strong> No company is involved. Nothing to freeze, fail, or subpoena.',
      '<strong>Recoverable.</strong> Lose one key and you simply sign with the other two, move funds to a fresh 2-of-3, and you’re whole again.',
    ],
    costs: [
      '<strong>Complexity — the top cause of lost Bitcoin.</strong> You now manage six sensitive items (three keys, three seed backups), plus the <a href="/glossary#wallet-descriptor">wallet descriptor</a> and coordinator software.',
      '<strong>Geographic coordination.</strong> To spend you need to reach two of three locations — manageable normally, hard during a crisis.',
      '<strong>Harder inheritance.</strong> “Just give them the seed” no longer works (see below).',
      '<strong>Arduous re-keying.</strong> A lost key means sweeping everything to a fresh setup and paying on-chain fees.',
    ],
    keyRisk: {
      label: 'Complexity is the risk here',
      body: 'The most-repeated finding across every serious source: <em>the most common way people lose Bitcoin self-custodying is by introducing too much complexity.</em> Don’t adopt multisig until you’re genuinely comfortable with single-sig — multisig amplifies your operational discipline, it doesn’t supply it.',
    },
    keyNote: {
      tone: 'safe',
      label: 'Use keys from three different manufacturers',
      body: 'If all three keys sit on devices from the same brand, one firmware bug or supply-chain problem could compromise all three at once — defeating the whole point. Mixing brands (say Coldcard + BitBox02 + Blockstream Jade Plus) means a single-vendor failure costs you at most one key. It’s the cheapest meaningful upgrade to any multisig.',
    },
    also: {
      label: 'Beyond 2-of-3: the 3-of-5 variant',
      body: 'You’ll hear about <strong>3-of-5</strong> — five keys, any three sign. It’s the <em>same technology</em> as 2-of-3, just with more keys, so there’s nothing new to learn here. What changes is the trade-off: a 3-of-5 survives losing <em>two</em> keys (a 2-of-3 can’t), at the cost of six-to-eight secure locations and much heavier re-keying. For almost everyone that’s the wrong trade — the extra protection is small, the extra self-inflicted loss risk is large. 3-of-5 earns its keep only for a genuine multi-party or multi-jurisdiction need (family offices, distributed trustees, institutional custody with explicit inheritance planning). If that’s not you, stay at 2-of-3.',
    },
    whoShould: 'Holders with material Bitcoin exposure, the discipline to manage six distributed items, and a real plan for how the setup gets recovered if you’re unavailable. Everyone agrees it’s overkill for small balances, and a mistake to adopt before you’re confident with single-sig.',
    whenToClimb: 'If managing the whole thing yourself — and especially handing it to your heirs — feels like too much, collaborative custody (rung 4) keeps the same multisig security while a partner carries the complexity. Adding more keys (3-of-5, above) is rarely the right move for an individual.',
  },

  {
    slug: 'collaborative',
    step: 4,
    name: 'Collaborative multi-signature',
    accent: 'Collaborative',
    pageName: 'Collaborative multi-signature wallet',
    short: 'Collaborative',
    tagline: 'You hold two keys; a service holds the third — for signing help and inheritance, not custody.',
    forWho: 'Inheritance-minded holders who want a professional safety net',
    cost: 'Device cost + annual service fee',
    solves: 'Multisig security with a partner who can help your heirs recover. Sovereign recovery keeps you in control.',
    introduces: 'A third party in the loop and an annual fee. Sovereign recovery is the make-or-break criterion.',
    built: true,
    whatItIs: 'The same 2-of-3 setup as rung 3 — but one of the three keys is held by a collaborative-custody company (Unchained, Nunchuk, AnchorWatch, The Bitcoin Adviser, and others). They hold one key and help coordinate spending, recovery, and inheritance. They <strong>cannot move your funds</strong> — they only hold one of three, and you hold the other two. You keep unilateral control. What you outsource is complexity, not custody.',
    gains: [
      '<strong>Much less to manage.</strong> Typically five items instead of seven — for many holders, the difference between “manageable” and “overwhelming.”',
      '<strong>Convenient spending.</strong> Sign with one key, ask the partner to co-sign; your second key stays untouched in its secure spot.',
      '<strong>A safety net.</strong> Lose a key and the partner can help you recover to a fresh setup — they can only help when asked, never spend alone.',
      '<strong>Inheritance gets dramatically simpler.</strong> Your heirs contact the partner, prove who they are, and get help — no <a href="/glossary#psbt">PSBT</a> wrangling.',
    ],
    costs: [
      '<strong>A partner is now in the loop.</strong> You’ve disclosed that you hold Bitcoin, and usually a rough amount — a privacy trade-off.',
      '<strong>Counterparty longevity.</strong> What if they go out of business? (See the sovereign-recovery note.)',
      '<strong>Ongoing cost.</strong> Free tiers exist, but assisted service runs hundreds to thousands per year for larger balances.',
    ],
    keyNote: {
      tone: 'safe',
      label: 'Sovereign recovery is the make-or-break test',
      body: 'The one criterion that matters most when choosing a partner: can you still spend using your two keys plus the <a href="/glossary#wallet-descriptor">wallet descriptor</a> <strong>if the partner vanishes tomorrow</strong>? Reputable partners publish open-source recovery tools that prove yes. Verify this before you commit — it’s the difference between a helper and a dependency.',
    },
    providers: [
      { name: 'Unchained', note: 'White-glove partnership; documented inheritance protocols; attorney coordination.' },
      { name: 'AnchorWatch', note: 'Insured 2-of-3 (Lloyd’s of London); you keep your own keys — built for larger holdings.' },
      { name: 'Nunchuk', note: 'Sovereignty and minimum trust; minimal disclosure (“don’t rely on us”).' },
      { name: 'The Bitcoin Adviser', note: 'Estate-planning end; multisig as infrastructure for a broader inheritance plan.' },
    ],
    whoShould: 'Holders with substantial exposure who honestly recognise that <em>they themselves</em> are their own biggest risk — and who’d rather outsource complexity than build operational discipline from scratch. Especially attractive when your inheritance situation is non-trivial (substantial estate, multiple heirs, complex family), where the partner’s standing process adds real value.',
    whenToClimb: 'For nearly everyone, this is the practical ceiling. From here the work isn’t “more keys” — it’s a <strong>tiered portfolio</strong> (a hot wallet for spending, single-sig for near-term reserves, multisig for deep cold storage) and a rock-solid inheritance plan. Adding keys beyond this adds complexity, not safety.',
  },
];

// Shamir is an OPTIONAL backup method that sits beside the ladder, not a rung on it.
// It's a way to split ONE seed's backup into shares — orthogonal to the signing
// configurations above, so it isn't part of the numbered climb.
export const shamirNote = {
  slug: 'shamir',
  optional: true,
  name: 'SLIP-39 / Shamir backup',
  accent: 'Shamir',
  short: 'Shamir',
  diagram: 'shamir',
  tagline: 'An optional way to back up a seed: split it into several pieces where any few, say 3 of 5, rebuild it — and no single piece reveals anything.',
  forWho: 'Holders who want split backups without running multisig',
  cost: '$129+ (Trezor supports it natively)',
  solves: 'No single backup location is a complete secret. Distribute shares across people or places.',
  introduces: 'At recovery the seed is reassembled on one device — a momentary single point. And more parts to track.',
  built: true,
  whatItIs: 'This isn’t a signing configuration like the rungs — it’s a <strong>backup method</strong>, which is why it sits beside the ladder rather than on it. Instead of one or two complete seed backups, a single seed is mathematically split into several <em>shares</em> — for example, five shares where any three can rebuild the seed, but two or fewer reveal nothing at all. You distribute the shares across locations or trusted people. <a href="/deep-dive/shamir">Split a secret and rebuild it yourself →</a>',
  gains: [
    '<strong>A single found share is useless.</strong> Someone who discovers one share (below the threshold) learns nothing about your seed.',
    '<strong>Redundancy without full copies.</strong> In a 3-of-5 split you can lose two shares entirely and still recover.',
    '<strong>Looks like a normal wallet on-chain.</strong> Unlike multisig, blockchain observers can’t see that it’s a split arrangement — a small privacy edge.',
  ],
  costs: [
    '<strong>More parts to track.</strong> Several shares, each of which must stay secure for years or decades.',
    '<strong>Best for savings, not spending.</strong> It’s a backup scheme for a seed you rarely touch, not a convenient day-to-day wallet.',
    '<strong>Uneven device support.</strong> Trezor supports SLIP-39 natively; other devices vary.',
  ],
  keyRisk: {
    label: 'The recovery moment is a single point of failure',
    body: 'To recover, the shares must be combined <strong>on one device</strong> to rebuild the whole seed. At that instant, that device holds everything. If it’s compromised, or the process is watched, the entire point of splitting is undone. This is exactly why Casa and Lopp often prefer multisig — where the keys never have to meet — over Shamir for actively-used funds.',
  },
  whoShould: 'Holders who want their backups geographically distributed but don’t want the operational complexity of multisig, and whose main use is long-term cold storage rather than frequent spending. Shamir-split backup paired with an on-device passphrase is a reasonable option between plain single-sig and full multisig.',
  whenToClimb: 'If you find yourself wanting the keys to <em>never</em> have to come together in one place — the weakness above — that’s the case for multisig (rung 3), which solves the same distribution problem without a risky reassembly step.',
};

export const bip85 = {
  name: 'BIP-85 — the orthogonal simplifier',
  note: 'BIP-85 sits beside the ladder rather than on it: it derives many child seeds from one master, cutting how many backups you keep. Useful at any rung — but it concentrates failure on that one master, which must then be protected at the level of everything derived from it. <a href="/deep-dive/bip85">See one master spawn child seeds →</a>',
};

export function getRung(slug) {
  if (slug === shamirNote.slug) return shamirNote;
  return ladder.find((r) => r.slug === slug);
}

/**
 * Where a rung lives now. The four rung PAGES were merged into the ladder lesson
 * on 2026-07-30, so every surface that used to link `/learn/ladder/<slug>` needs
 * `/learn/ladder#rung-N` — and several of those surfaces build the URL at runtime
 * from a saved plan. One function so the slug→anchor map exists once; an unknown
 * slug degrades to the lesson itself rather than a 404.
 */
export function rungAnchor(slug) {
  const r = ladder.find((x) => x.slug === slug);
  return r ? `/learn/ladder#rung-${r.step}` : '/learn/ladder';
}
