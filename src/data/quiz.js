// The setup-tier quiz — the hero interactive feature.
// PRIVACY BY DESIGN: we never ask how much Bitcoin you hold. The driver is the
// *consequence* of loss + threat model, not any amount — safer (nothing an
// observer could use) and more correct (the ladder was always about threat
// model, not dollars). Runs entirely client-side; answers live only in memory,
// never in the URL, localStorage, or a network request.
//
// recommend(answers) is PURE → returns { primary, secondary }: a recommended
// setup NOW (1st choice) and the step-up you'd move to as things change (2nd
// choice). Never a menu. Rule it encodes: the simplest setup that adequately
// covers your threat model — it holds you back from needless complexity as
// readily as it steps you up.

import { numberWord, numberWordCap } from './numbers.js';

export const questions = [
  {
    id: 'current',
    type: 'single',
    q: 'What’s your current Bitcoin setup?',
    help: 'This is your starting point — the recommendation is the destination, and we’ll show you the path from here. There’s no wrong answer; most people are near the beginning.',
    options: [
      { value: 'pre',           label: 'Nothing yet — it’s on an exchange, or in a phone / software wallet' },
      { value: 'single-sig',    label: 'One key on a hardware wallet, with a seed backup' },
      { value: 'passphrase',    label: 'One key + a passphrase (a secret “25th word”)' },
      { value: 'multisig',      label: 'Multisig I run entirely myself (2-of-3 or 3-of-5, all my own keys)' },
      { value: 'collaborative', label: 'Multisig where a service holds one key (Unchained, Nunchuk…)' },
    ],
  },
  {
    id: 'stakes',
    type: 'single',
    q: 'How much would losing this Bitcoin hurt?',
    help: "We ask about the consequence, not an amount — no website should ever ask how much Bitcoin you hold.",
    options: [
      { value: 'learning',     label: "I'm still learning — losing it wouldn't change my life" },
      { value: 'meaningful',   label: "It matters — I'd be upset, but I'd be okay" },
      { value: 'serious',      label: "It's serious — a big chunk of my savings" },
      { value: 'lifechanging', label: "It's life-changing — losing it would be devastating" },
    ],
  },
  {
    id: 'recovery',
    type: 'single',
    q: 'If something happened to you, does anyone else need to be able to recover it?',
    help: "Self-custody that only works while you're around and well isn't a plan.",
    options: [
      { value: 'just-me', label: 'No — just me, for now' },
      { value: 'partner', label: 'Yes — my partner or spouse' },
      { value: 'heirs',   label: 'Yes — my heirs / family (I want an estate plan)' },
    ],
  },
  {
    id: 'worry',
    type: 'rank',
    q: 'What worries you most? Rank them — tap in order, biggest worry first.',
    help: 'This shapes the setup more than anything else. Your top worry drives the recommendation; your second shapes the step-up option.',
    // Ordered by WHO the reader is afraid of: me → a thief → a company → someone
    // after me specifically → not sure. `exchange` was added 2026-07-30: a reader
    // whose Bitcoin is still on an exchange had no honest answer here, and that
    // fear is rule 02 and a whole lesson of this guide. They were picking
    // 'self-loss', which means something else, or 'unsure'.
    options: [
      { value: 'self-loss', label: 'Losing access myself — forgetting something, losing a backup' },
      { value: 'theft',     label: 'Someone stealing it — a remote hack, or a thief finding my backup' },
      { value: 'exchange',  label: 'A company losing it — my exchange going bust, freezing my account, or getting hacked' },
      { value: 'targeted',  label: 'Being personally targeted or coerced' },
      { value: 'unsure',    label: "Honestly, I'm not sure" },
    ],
  },
  {
    id: 'tech',
    type: 'single',
    q: 'How do you feel about fiddly, technical setup?',
    help: "There's no shame in wanting simple — the best setup is the one you'll actually use correctly.",
    options: [
      { value: 'simple',    label: 'Keep it as simple as possible' },
      { value: 'careful',   label: "I'll happily follow careful, step-by-step instructions" },
      { value: 'technical', label: "I'm technical and want maximum control" },
    ],
  },
  {
    id: 'sovereignty',
    type: 'single',
    q: 'How do you feel about a company ever holding one of your keys?',
    help: "Some setups lean on a Bitcoin service as a safety net; the most private, sovereign setups involve no company at all. Neither is wrong — it's a real trade-off, and your answer shapes what we recommend.",
    options: [
      { value: 'pure',      label: 'No third party — I want pure self-custody, maximum privacy, no one to ask permission' },
      { value: 'lean-self', label: "I lean self-reliant, but I'd consider help if it clearly lowers my risk" },
      { value: 'open-help', label: "I'd welcome a trusted service holding a backup key if it makes me safer or simpler" },
    ],
  },
];

/**
 * How many questions the quiz asks, and the same figure as an English word, so
 * page copy ("Six plain questions") derives instead of being typed. Invariant #10:
 * a typed count is a bug even when it's right today — and this one was typed on
 * eight surfaces (home ×2, /quiz ×2, /start, /checklist, /learn, /learn/ladder,
 * /404, /my-plan), every one of which would have gone stale on a seventh question.
 * The optional owned-wallets step is deliberately NOT counted: it's an interstitial
 * between Q1 and Q2, shown conditionally, and the copy promises plain questions.
 */
export const questionCount = questions.length;
export const questionCountWord = numberWord(questionCount);
export const questionCountWordCap = numberWordCap(questionCount);

// Bitcoin-only collaborative-custody services, derived LIVE from custodians.js
// (the /collaborative page's single source of truth) so the quiz and the
// comparison page can never disagree on fees, KYC, or the service list.
// Neutral + informational — NOT affiliate links, NOT ranked "best." Casa is
// deliberately omitted there (it supports other coins), so it's omitted here.
import { custodians } from './custodians.js';
const KYC_LABEL = { yes: 'No KYC', no: 'KYC required', partial: 'KYC varies' };
export const collaborativeVendors = custodians.map((c) => ({
  name: c.name,
  url: c.url,
  model: c.model,
  kyc: KYC_LABEL[c.noKyc] || '—',
  price: c.fee,
  hw: c.devices,
  note: c.bestFor,
}));

// Device options are always given as a PAIR of equal good fits — never a single
// funnel. Rule of the guide: every device is rated in three tiers against the
// published standard (/standard); savings recommendations draw from the
// cold-storage tier, and spending-tier devices are labeled as such when they
// appear. Within a tier, fit decides. Prices render from wallets.js.
const DEV = {
  jade:     { name: 'Blockstream Jade', why: 'genuinely good on a budget, simple, Bitcoin-only (connects by USB/Bluetooth — no on-device camera)' },
  bitbox:   { name: 'BitBox02 (BTC-only)', why: 'Swiss, minimalist, fully open-source — an excellent multisig component' },
  coldcard: { name: 'Coldcard Q',          why: 'the physical keyboard and clear menus make it the friendliest to operate — and it’s buy-once: the same device covers single-sig, a passphrase, and multisig, so you never re-buy as you climb (Bitcoin-only; premium price)' },
  trezor:   { name: 'Trezor Safe 5',       why: 'colour touchscreen and mainstream UX — easy passphrase entry' },
  bitkey:   { name: 'Bitkey',              why: 'phone-integrated and beginner-friendly — a 2-of-3 with recovery built in, so there’s no single seed to lose. A great first setup, especially if you live on your phone — note we rate it <a href="/standard#built-for-spending">built for spending</a>: when your stack becomes real savings, move it to a cold-storage-tier device',
    // Bitkey's onboarding is app-guided and unique — no manual seed to write down;
    // recovery is the built-in 2-of-3 (app key + hardware device + Block's server).
    checklist: [
      { text: 'Download the Bitkey app and order the Bitkey device (Block ships it to you)', howto: 'choose-a-wallet' },
      { text: 'Set up your wallet in the app — it pairs with the hardware device (those are your two everyday keys)', howto: 'bitcoin-keys' },
      // DELIBERATELY NO `howto`. Bitkey's recovery is app-guided and unlike anything
      // else the guide teaches — there is no seed to write down, so every lesson we
      // have would be a shoehorn, `back-up-your-seed` most of all. The step carries
      // its own explanation instead of sending the reader somewhere inapplicable.
      { text: 'Set up recovery in the app: add a Trusted Contact and/or a cloud backup. This is your third key — with it, any two of the three (app, device, Trusted Contact) can restore you, which is why there’s no seed phrase to write down or lose. Do it now, not later: until it’s done, a lost phone or a lost device is a real problem.' },
      { text: 'Send a small amount first, confirm it arrives, then move the rest', howto: 'send-bitcoin-safely' },
      { text: 'Keep the hardware device somewhere safe, separate from your phone', howto: 'privacy' },
    ],
  },
};

// Ordered device options for the single-sig recommendation — best fit LEADS,
// and the order shifts with the answers. Bitkey (phone-integrated, recovery
// built in) leads for entry-level holders; more capable devices lead for the
// technical (capability ≠ harder to use).
function singleSigDevices(a) {
  const budgetTight = a.stakes === 'learning' || a.stakes === 'meaningful';
  // Small amount / budget-conscious → economics leads; a cheap device is the right call.
  if (a.tech === 'simple' && budgetTight) {
    return {
      devices: [DEV.bitkey, DEV.jade],
      headline: 'Start with a simple, phone-friendly setup',
      note: 'Bitkey is a phone-based 2-of-3 with recovery built in (a light collaborative setup) — an especially easy on-ramp, though we rate it built for spending, not a long-term vault; the Jade is a classic cold-storage-tier single-sig wallet and great value. Both are solid, low-cost first setups — as your stack becomes savings, make the Jade (or a step up) its cold home.',
    };
  }
  if (budgetTight) {
    return { devices: [DEV.jade, DEV.bitbox], note: 'Both are strong value for a first single-sig wallet — the Jade especially if you’re keeping costs down; the BitBox02 is a Swiss, Bitcoin-only step up that also makes a great multisig key later.' };
  }
  // Bigger stakes, budget not the deciding factor → lead with a buy-once device
  // that also carries you up the ladder (passphrase, multisig) without new hardware.
  if (a.tech === 'technical') {
    return { devices: [DEV.coldcard, DEV.bitbox], note: 'Both are cold-storage-tier and climb the ladder without re-buying. The Coldcard Q’s keyboard makes it the easiest to operate at every rung and stays a lean Bitcoin-only signer; the BitBox02 is the minimalist Swiss alternative — fully open-source, and an excellent multisig key later.' };
  }
  return { devices: [DEV.coldcard, DEV.jade], note: 'The Coldcard Q is the friendliest to operate (a real keyboard, simple menus) and buy-once — it climbs to a passphrase or multisig later without new hardware, which is worth the premium if you expect to grow. The Jade is the budget alternative: spend less now, re-buy only if you ever climb.' };
}

// `howto` is the "how →" link beside a checklist step. It renders as /learn/<value>
// unless it starts with "/", in which case it's used verbatim (see quiz.astro).
// EVERY VALUE MUST BE SCOPE-CHECKED, NOT JUST RESOLVED: a wrong-but-real slug
// links fine and no checker catches it. Re-scoped 2026-07-30 — sixteen targets had
// gone stale against the 7/29 restructure while every one of them still resolved.
// The traps, all of them live at the time:
//   · `bitcoin-keys` had become the catch-all (6 uses) for material that now has
//     its own lesson — sending, and hot/cold tiering (rule 04 re-homed to /ladder).
//   · `inheritance` split into the PROBLEM (findability) and `recovery-kit` (the
//     document). Anything telling the reader to WRITE or REVIEW the kit is
//     `recovery-kit`; only the why-it-goes-wrong argument is `inheritance`.
//   · `choose-a-wallet` is about picking HARDWARE and says so in its title — it is
//     not the home for phone wallets, multisig walkthroughs, or picking a custodian.
//   · `back-up-your-seed` never mentions the wallet descriptor; the rung pages do.
const STEP = {
  buy:      { text: 'Buy the device from the vendor directly — never a marketplace or third-party seller', howto: 'choose-a-wallet' },
  offline:    { text: 'Set it up offline and generate your seed on the device itself', howto: 'choose-a-wallet' },
  metal:      { text: 'Back up the recovery seed on metal (fire/flood-proof), not just paper', howto: 'back-up-your-seed' },
  testRecover:{ text: 'TEST RECOVERY before you fund it — wipe the device and restore from your backup', howto: 'test-your-backup' },
  smallFirst: { text: 'Send a small amount first, confirm it arrives, then move the rest', howto: 'send-bitcoin-safely' },
  separate:   { text: 'Store the backup separate from the device — ideally a second location', howto: 'back-up-your-seed' },
};

// ── The multisig FORK ───────────────────────────────────────────────────────
// When the threat model calls for 2-of-3 multisig, we NEVER funnel to a service.
// We present two EQUAL paths — do-it-yourself self-sovereign multisig vs.
// collaborative custody — with the honest trade-off on each. The site's goal is
// sovereign, private self-custody, so DIY leads by default; collaborative leads
// ONLY when the user explicitly welcomes help AND isn't technical. Either way,
// both paths always render, side by side.
function multisigFork(a, sharedNeed) {
  const { tech } = a;
  const sovereignty = a.sovereignty || 'lean-self';
  const lead = (sovereignty === 'open-help' && tech !== 'technical') ? 'collab' : 'diy';

  const diy = {
    key: 'diy',
    label: 'Do it yourself — self-sovereign multisig',
    rungSlug: 'multisig', rungLabel: 'Do-it-yourself multisig (2-of-3)',
    essence: 'You — and, if you like, people you trust — hold all three keys. No company, no ID checks, no one who can freeze your coins or even see what you hold. This is the most private, most sovereign way to hold Bitcoin.',
    tradeoff: 'The trade-off is responsibility. You buy devices from two different vendors, back up every key and the wallet descriptor (the map of your keys), test recovery yourself, and act as your own support desk. Done carefully it’s rock-solid — done carelessly it adds ways to lose access.',
    wallets: [DEV.coldcard, DEV.bitbox],
    walletNote: 'Use two DIFFERENT vendors (like these) so one vendor’s bug can’t sink all your keys. The Coldcard Q’s keyboard and clear menus make driving a multisig signing session the least fiddly — and if you already started single-sig on one, you don’t need new hardware to get here.',
    inheritanceNote: sharedNeed
      ? 'A fully self-custodied inheritance plan is entirely achievable here — your heirs recover from the keys plus a plain-English guide, with no company in the loop. It takes deliberate planning, but sovereignty and a real estate plan are not a trade-off you have to make.'
      : null,
    checklist: [
      { text: 'Read the multisig walkthrough end-to-end before buying anything', howto: '/learn/ladder#rung-3' },
      { text: 'Buy 2–3 devices from TWO different vendors (directly from each)', howto: 'choose-a-wallet' },
      STEP.offline,
      { text: 'Back up EACH key’s seed on metal, stored in separate locations', howto: 'back-up-your-seed' },
      { text: 'Back up the wallet descriptor (the map of your keys) — without it the keys can’t be reassembled', howto: '/learn/ladder#rung-3' },
      STEP.testRecover,
      ...(sharedNeed ? [{ text: 'Write your heirs a plain-English recovery guide and store it with the estate documents', howto: 'recovery-kit' }] : []),
      STEP.smallFirst,
    ],
  };

  const collab = {
    key: 'collab',
    label: 'Share the load — collaborative custody',
    rungSlug: 'collaborative', rungLabel: 'Collaborative custody (2-of-3)',
    essence: 'A Bitcoin-only service (or a trusted partner) holds one of the three keys as a safety net. There’s far less for you to run, and recovery — including for your heirs — is built in by design.',
    tradeoff: 'The trade-off is trust and privacy. You’re bringing an outside institution into your setup: most require ID verification (KYC), which ties your identity to your holdings, and most charge an ongoing fee. They can never move your coins alone — but they are now part of your plan, and can see it.',
    walletNote: '<strong>Choose your service first — it comes before the hardware.</strong> Each service lists the devices it supports, and some (like Bitkey) send you one.',
    checklist: [
      { text: 'Choose your service or co-signer FIRST — a Bitcoin-only collaborative-custody service (see below) and/or a trusted partner', howto: '/collaborative' },
      { text: 'Get your hardware key(s) from the service’s supported list — some (like Bitkey) send you the device', howto: 'choose-a-wallet' },
      STEP.offline,
      { text: 'Back up each key you control on metal, in separate locations', howto: 'back-up-your-seed' },
      { text: 'Back up the wallet descriptor (the map of your keys) somewhere safe', howto: '/learn/ladder#rung-4' },
      STEP.testRecover,
      { text: 'Document the recovery plainly for whoever needs it — partner or heirs', howto: 'recovery-kit' },
      STEP.smallFirst,
    ],
    vendors: collaborativeVendors,
  };

  const paths = lead === 'collab' ? [collab, diy] : [diy, collab];
  const leadNote = lead === 'collab'
    ? 'Your answers suggest the collaborative path may be the easier fit — but the fully self-sovereign path is open to you too, and it’s the more private of the two. Both are laid out equally below; the choice is yours.'
    : 'Your answers lean self-reliant, so we’ve put the do-it-yourself path first — but both are genuinely valid. The only real question is who holds the third key.';

  return {
    tier: 'Tier 2–3', rungSlug: paths[0].rungSlug, rungLabel: paths[0].rungLabel,
    headline: 'Multisig (2-of-3) — your call on who holds the third key',
    why: 'You’ve reached the level where a <strong>2-of-3 multisig</strong> is the right protection: three keys exist, any two together can move or recover your coins, so no single key that’s lost, stolen, or coerced can touch them — and losing any one key isn’t fatal. There are two honest ways to get there, and the only real question is <strong>who holds the third key.</strong>',
    fork: { lead, leadNote, paths },
    holdback: null,
  };
}

// The single-sig recommendation opens by naming the reader's own top worry back to
// them, then says why this setup answers it. Keyed by worry so adding one is a copy
// change, not a nest of ternaries.
const WHY_LEAD = {
  'self-loss': 'Since your real worry is losing access yourself, the win is a backup you can actually recover — not extra secrets or signers that add new ways to lose.',
  exchange: 'Your worry is a company failing — and this setup answers it completely, on day one. The moment the keys are yours, no exchange can freeze your account, lose your coins, or take them down with it. What’s left after that is the part you control, which is exactly what the steps below are for.',
  default: 'For your stakes, one hardware wallet with a rock-solid, well-tested backup is genuinely enough.',
};

// Why we're holding this reader BACK from a passphrase. Only set for worries a
// passphrase doesn't actually answer — a passphrase defends against a found seed,
// so for these three it buys nothing and adds a way to lose everything.
const HOLDBACK_BECAUSE = {
  'self-loss': 'since your risk is losing access yourself, it would add danger, not remove it.',
  exchange: 'the risk you named is a company holding your coins — which moving to your own keys has already removed. A passphrase does nothing about it, and adds a secret that can be forgotten.',
  unsure: 'until you can name the specific threat it defends against, it would add danger, not remove it.',
};

// ── PRIMARY recommendation (uses your TOP-ranked worry) ─────────────────────
function primaryRec(a) {
  const { stakes, recovery, worry, tech } = a;
  const sharedNeed = recovery !== 'just-me';

  if (stakes === 'learning') {
    return {
      tier: 'Getting started', rungSlug: 'single-sig', rungLabel: 'Start simple — graduate to cold storage as you grow',
      headline: 'Start small and learn the moves',
      why: "Since losing this wouldn't change your life, don't over-engineer it — the worst setup is one so fiddly you avoid using it. The valuable thing right now is learning to hold your own keys, not buying gear. Keep a small amount in a reputable non-custodial phone wallet, get comfortable sending and receiving, and step up to a hardware wallet as your stack grows.",
      wallet: null,
      walletNote: 'A reputable <strong>non-custodial phone wallet</strong> to learn on (you hold the keys — not an exchange app). When you graduate to cold storage, a simple ~$79 device like the Blockstream Jade is a great first hardware wallet.',
      checklist: [
        { text: 'Pick a non-custodial phone wallet — one where YOU hold the keys, not the company', howto: 'not-your-keys' },
        { text: 'Move a small amount off the exchange and practice sending & receiving', howto: 'send-bitcoin-safely' },
        { text: 'Write the recovery phrase down and keep it offline — never a photo or cloud note', howto: 'back-up-your-seed' },
        { text: 'As your stack grows, graduate to a hardware wallet and cold storage', howto: 'ladder' },
      ],
      holdback: null,
    };
  }

  const bigStake = stakes === 'serious' || stakes === 'lifechanging';
  const wantsMultisig = stakes === 'lifechanging' ||
    (stakes === 'serious' && (recovery === 'heirs' || worry === 'targeted' || worry === 'self-loss'));

  if (wantsMultisig) return multisigFork(a, sharedNeed);

  if ((worry === 'theft' || worry === 'targeted') && worry !== 'self-loss') {
    const powerDevice = tech === 'technical' || tech === 'careful';
    return {
      tier: 'Tier 1–2', rungSlug: 'passphrase', rungLabel: 'Single-sig + a passphrase (the "25th word")',
      headline: 'Single-sig cold storage + a passphrase',
      why: `Because your worry is ${worry === 'targeted' ? 'being targeted or coerced' : 'someone getting hold of your seed'}, a passphrase earns its keep: the seed alone opens only a small decoy wallet, while the seed PLUS your passphrase opens the real one. A backup someone finds — or a seed pulled off a compromised device — can’t spend your coins.`,
      wallets: powerDevice ? [DEV.coldcard, DEV.trezor] : [DEV.trezor, DEV.coldcard],
      walletNote: 'Both of these make a passphrase easy to live with — the Coldcard Q has a full keyboard, the Trezor Safe 5 a touchscreen. You type a strong passphrase painlessly, with no on-screen fiddling and nothing typed into a computer.',
      checklist: [
        STEP.buy, STEP.offline, STEP.metal,
        { text: 'Choose a strong passphrase — long and unguessable; it can’t be reset or recovered', howto: '/learn/ladder#rung-2' },
        { text: 'BACK UP THE PASSPHRASE separately from the seed, in a different place — a passphrase only in your head is the #1 way people lose passphrase-protected Bitcoin', howto: 'back-up-your-seed' },
        { text: 'Test recovery with BOTH the seed and the passphrase before funding', howto: 'test-your-backup' },
        STEP.smallFirst,
        ...(sharedNeed ? [{ text: 'Make the passphrase inheritable — your heirs need it too, or the coins are lost', howto: 'inheritance' }] : []),
      ],
      holdback: 'A passphrase adds a brand-new way to lose everything (forget it and even the seed won’t help). It’s worth it for your threat model — but only if you back it up as carefully as the seed.',
    };
  }

  const ssd = singleSigDevices(a);
  return {
    tier: 'Tier 1', rungSlug: 'single-sig', rungLabel: 'Single-signature cold storage',
    headline: ssd.headline || 'Single-signature cold storage',
    why: `${WHY_LEAD[worry] || WHY_LEAD.default} This is the simplest setup that isn’t negligent, and for most holders it’s the right home for a long time.`,
    wallets: ssd.devices,
    walletNote: ssd.note,
    checklist: [ STEP.buy, STEP.offline, STEP.metal, STEP.testRecover, STEP.smallFirst, STEP.separate,
      ...(recovery !== 'just-me' ? [{ text: 'Leave your partner/heirs a plain-English guide to finding the backup and recovering the wallet', howto: 'recovery-kit' }] : []) ],
    holdback: HOLDBACK_BECAUSE[worry]
      ? `We deliberately did NOT add a passphrase. A passphrase mainly defends against a found seed — but it’s a new single point of failure, and ${HOLDBACK_BECAUSE[worry]} Don’t add complexity you don’t need.`
      : null,
  };
}

// ── SECONDARY recommendation — the step-up you'd move to as things change.
// Sensitive to your SECOND-ranked worry. Lighter than the primary (headline +
// "when you'd move here" + link + vendors if collaborative), never a full
// duplicate checklist.
function secondaryRec(a, primary) {
  const worries = a.worry || [];
  const second = worries[1];
  const slug = primary.rungSlug;
  const S = (rungSlug, rungLabel, headline, when) => ({ rungSlug, rungLabel, headline, when });

  // Learning-stakes users share the single-sig rung slug but their primary is
  // "phone wallet, don't buy gear" — their step-up is graduating to cold
  // storage, never a passphrase or multisig. Branch on tier BEFORE the slug.
  if (primary.tier === 'Getting started') {
    return S('single-sig', 'Single-signature cold storage', 'Graduate to cold storage',
      'The moment your stack is more than pocket money, move it to a hardware wallet in single-sig cold storage — your first real self-custody setup.');
  }

  // The multisig fork is already the top of the ladder — the step-up is more keys /
  // more resilience, kept self-sovereign by default (only mention insurance if they
  // didn't insist on pure self-custody).
  if (primary.fork) {
    if (a.sovereignty === 'pure') {
      return S('multisig', '3-of-5 multisig', 'Spread the keys wider (3-of-5)',
        'As holdings grow, a self-run 3-of-5 across separate locations tolerates more lost or stolen keys before anything is at risk — the same self-sovereign technology as your 2-of-3, just more keys and more resilience. No company required.');
    }
    // Label deliberately avoids the literal "3-of-5": keysForSetup keys off that
    // string, and this option may equally mean an insured 2-of-3 vault — so the
    // plan shouldn't demand five devices from it.
    return S('multisig', 'Wider multisig or an insured vault', 'Spread wider — or add insurance',
      'As holdings grow, a 3-of-5 across more locations adds resilience; or, if you leaned collaborative, an insured vault (AnchorWatch, backed by Lloyd’s of London) is a real backstop for large holdings. More protection, more to manage.');
  }

  if (slug === 'single-sig') {
    // If a theft/coercion worry is anywhere in the ranking → passphrase; else if
    // someone else needs to recover → collaborative; else the natural next layer.
    if (worries.includes('theft') || worries.includes('targeted')) {
      return S('passphrase', 'Single-sig + passphrase', 'Add a passphrase (the "25th word")',
        `If ${second === 'targeted' ? 'coercion' : 'someone finding your seed'} becomes your bigger worry, add a passphrase so a found seed alone can’t spend your coins. Only take this on once you’re confident you can back the passphrase up as carefully as the seed.`);
    }
    if (a.recovery !== 'just-me') {
      return S('multisig', '2-of-3 multisig', 'Step up to 2-of-3 multisig',
        'When your stack grows or you want inheritance handled cleanly, 2-of-3 multisig means no single lost key is fatal. You can run it yourself — fully self-sovereign, no company — or let a Bitcoin service hold one key; the quiz lays out both, equally, when you get there.');
    }
    // Reached ONLY when nobody ranked theft or coercion and recovery is just-me —
    // so the top worry is self-loss, exchange or unsure, which is exactly the set
    // whose primary card carries the "we deliberately did NOT add a passphrase"
    // holdback. This branch used to offer a passphrase anyway, as "the natural next
    // layer as your stack grows": a step-up that contradicted the paragraph directly
    // above it, on 135 of 6,480 answer paths (found 2026-07-30 by walking the whole
    // answer space rather than reading the code). The holdback argues on threat
    // model; a bigger stack doesn't change the threat model. Multisig is the honest
    // step-up here because it answers the worry they actually named.
    return S('multisig', '2-of-3 multisig', 'Step up to 2-of-3 multisig',
      'The step-up that answers the worry you named: with 2-of-3, any two keys can move or recover your coins — so no single key that’s lost, damaged, destroyed or forgotten can strand you. That’s the opposite trade from a passphrase, which adds one more secret you could lose, and it’s why the card above holds you back from one. This is worth taking on when your stack has grown enough that a single point of failure keeps you up at night. You can run it entirely yourself — no company involved — or let a Bitcoin service hold one key.');
  }
  if (slug === 'passphrase') {
    return S('multisig', '2-of-3 multisig', 'Step up to 2-of-3 multisig',
      'As the stakes climb, multisig beats a passphrase: two of three keys sign, so no single lost, stolen, or forgotten key is fatal — and a passphrase’s "forget it and it’s gone" risk disappears. Run it yourself for full sovereignty, or share one key with a Bitcoin service — your call.');
  }
  // NOTE: currently unreachable — primaryRec never returns a non-fork
  // 'collaborative' rung (collaborative only appears inside the multisig fork,
  // which is handled above). Kept live in case a direct collaborative primary
  // is ever added; verify this branch then.
  if (slug === 'collaborative') {
    if (a.tech === 'technical') {
      return S('multisig', 'Do-it-yourself multisig', 'Run your own multisig',
        'If you’d rather no company hold any key, self-run 2-of-3 (or 3-of-5) multisig gives you the same safety with full independence — at the cost of doing all the setup and backups yourself.');
    }
    return S('collaborative', 'Insured / larger multisig', 'Add insurance or more signers',
      'For very large holdings, an insured vault (AnchorWatch, backed by Lloyd’s of London) or a 3-of-5 spread across more locations adds another layer. See the services below.');
  }
  if (slug === 'multisig') {
    return S('multisig', '3-of-5 variant', 'Spread the risk wider (3-of-5)',
      'At the very top end, a 3-of-5 spread across separate locations tolerates more lost or compromised keys before anything is at risk — more resilience, more to manage. It’s the same technology as your 2-of-3, just more keys.');
  }
  // Unreachable fallback — every primary rung is handled above; kept as a safe
  // default so a future rung addition degrades gracefully instead of crashing.
  return S('single-sig', 'Single-signature cold storage', 'Graduate to cold storage',
    'The moment your stack is more than pocket money, move it to a hardware wallet in single-sig cold storage — your first real self-custody setup.');
}

function withVendors(rec) {
  // Forks carry their vendors inside the collaborative path, not at the top level.
  // (The non-fork case is currently unreachable — see the note on secondaryRec's
  // collaborative branch — but harmless and future-proof.)
  if (rec && !rec.fork && rec.rungSlug === 'collaborative') rec.vendors = collaborativeVendors;
  return rec;
}

// ── "Your journey" — the recommendation is a DESTINATION; frame it from where they
// are now (Q1). The current setup never changes the target (that's threat-model-driven);
// it only sets the framing — how far, the encouragement, and the difference. We are
// deliberately encouraging about wherever they are, and never tell anyone to downgrade.
const SETUP_STEP = { pre: 0, 'single-sig': 1, passphrase: 2, multisig: 3, collaborative: 4 };
const STEP_LABEL = {
  0: 'an exchange or hot wallet',
  1: 'single-signature cold storage',
  2: 'single-sig + a passphrase',
  3: 'self-run multisig (2-of-3)',
  4: 'collaborative multisig',
};

function targetStepOf(primary) {
  // The multisig fork's destination follows its LEAD path — collaborative-led
  // forks target collaborative custody (step 4), not self-run 2-of-3, so the
  // journey framing matches the card above it.
  if (primary.fork) return SETUP_STEP[primary.rungSlug] ?? 3;
  return SETUP_STEP[primary.rungSlug] ?? 1;
}

function journeyFor(a, primary) {
  const curStep = SETUP_STEP[a.current];
  if (curStep == null) return null;              // Q1 not answered → no journey block
  const targetStep = targetStepOf(primary);
  const gap = targetStep - curStep;
  const curLabel = STEP_LABEL[curStep];
  const targetLabel = STEP_LABEL[targetStep];
  let kind, headline, message;

  if (curStep === 0) {
    kind = 'start';
    headline = 'The best time to start is right now';
    message = 'Your Bitcoin is somewhere someone else can freeze or lose it. Your first move is the biggest and most valuable one: getting it onto a device where you alone hold the keys. Everything below is that first setup, one step at a time — you don’t have to do it all today.';
  } else if (gap === 0) {
    kind = 'there';
    headline = 'Good news — you’re already right where you should be';
    message = `Your current setup — ${curLabel} — is exactly what fits your situation. There’s nothing to add; the win now is keeping it healthy. Treat the checklist below as a maintenance pass: test your recovery, confirm your backups, and make sure someone could find them if they needed to.`;
  } else if (gap < 0) {
    kind = 'ahead';
    headline = 'You’re already ahead of what your situation needs';
    message = `You’re running ${curLabel}, and your answers point to ${targetLabel} as plenty. That’s not a mistake — extra protection is fine, it’s just more to maintain than your situation strictly requires. Nothing to add here; you’re in great shape. And if it ever feels heavier than you want, it’s good to know the simpler setup would also have you covered.`;
  } else if (gap === 1) {
    kind = 'one';
    headline = 'You’re just one step away';
    message = `You’re already doing the hard part — your Bitcoin is at ${curLabel}. Your situation points one rung further, to ${targetLabel}. It’s a single, well-trodden step; below is exactly what it changes and how to make it.`;
  } else {
    kind = 'few';
    headline = `You’ve got a clear path — about ${gap} steps`;
    message = `Today you’re at ${curLabel}, and the setup that fits your situation is ${targetLabel}. That’s a few rungs up — very doable, one step at a time, and there’s no rush. Below is the destination and how to get there.`;
  }
  return { kind, gap, curStep, targetStep, curLabel, targetLabel, headline, message };
}

export function recommend(a) {
  const worryArr = Array.isArray(a.worry) ? a.worry : (a.worry ? [a.worry] : ['unsure']);
  const primary = primaryRec({ ...a, worry: worryArr[0] || 'unsure' });
  const secondary = secondaryRec({ ...a, worry: worryArr }, primary);
  const journey = journeyFor(a, primary);
  return { primary: withVendors(primary), secondary: withVendors(secondary), journey };
}
