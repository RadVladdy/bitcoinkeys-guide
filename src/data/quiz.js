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

export const questions = [
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
    options: [
      { value: 'self-loss', label: 'Losing access myself — forgetting something, losing a backup' },
      { value: 'theft',     label: 'Someone stealing it — a remote hack, or a thief finding my backup' },
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
];

// Bitcoin-only collaborative-custody services (verified 2026-07-16). Shown when
// a collaborative-custody setup is recommended. Neutral + informational — NOT
// affiliate links, NOT ranked "best." Casa is deliberately omitted: it now
// supports Ethereum too, so it falls outside this guide's Bitcoin-only rule.
export const collaborativeVendors = [
  { name: 'Unchained',   model: '2-of-3 — you hold 2 keys, they hold 1 recovery key', kyc: 'KYC required', price: 'Free tier / $250 a yr', hw: 'You bring a supported device (BitBox · Jade · Coldcard · Trezor · Ledger)', note: 'The longest track record and a full Bitcoin-only stack (vaults, IRA, inheritance). US-regulated.', url: 'https://unchained.com' },
  { name: 'Nunchuk',     model: 'Self-sovereign or assisted multisig',                kyc: 'No KYC',        price: '~$120 a yr and up', hw: 'Supports a wide range of devices (incl. Coldcard, Tapsigner)', note: 'Open-source and privacy-friendly (no KYC), with on-chain timelock inheritance.', url: 'https://nunchuk.io' },
  { name: 'Swan Vault',  model: '2-of-3 collaborative',                               kyc: '—',             price: 'Free',              hw: 'App-based key + a supported hardware wallet', note: 'Bitcoin-only; ties into Swan’s buying and inheritance planning.', url: 'https://www.swanbitcoin.com' },
  { name: 'AnchorWatch', model: 'Insured multisig (Lloyd’s of London)',               kyc: 'KYC required', price: '0.55%+/yr · $250k min', hw: 'You hold your own 2-of-3 keys on supported hardware', note: 'The only one with real insurance — built for large holdings. US-only.', url: 'https://www.anchorwatch.com' },
  { name: 'Bitkey',      model: '2-of-3 — a consumer device + app',                   kyc: 'No KYC',        price: 'One-time (~$250)',  hw: 'The device is included — Block ships you the Bitkey', note: 'The simplest, most non-technical option; recovery is built in, no subscription.', url: 'https://bitkey.world' },
];

// Device options are always given as a PAIR of equal good fits — never a single
// funnel. "No best device, only fit-to-purpose." Prices render from wallets.js.
const DEV = {
  jade:     { name: 'Blockstream Jade',    why: 'genuinely good on a budget, simple, Bitcoin-only, air-gapped' },
  passport: { name: 'Foundation Passport Prime', why: 'a polished, US-assembled, independently audited security platform — a big touchscreen with a keyboard for easy passphrase entry, and Bitcoin multisig up to 15 keys (it also stores 2FA codes, passkeys and files, so it’s more device than a pure Bitcoin signer, at $349)' },
  bitbox:   { name: 'BitBox02 (BTC-only)', why: 'Swiss, minimalist, fully open-source — an excellent multisig component' },
  coldcard: { name: 'Coldcard Q',          why: 'the physical keyboard and clear menus make it the friendliest to operate — and it’s buy-once: the same device covers single-sig, a passphrase, and multisig, so you never re-buy as you climb (Bitcoin-only; premium price)' },
  trezor:   { name: 'Trezor Safe 5',       why: 'colour touchscreen and mainstream UX — easy passphrase entry' },
  bitkey:   { name: 'Bitkey',              why: 'phone-integrated and beginner-friendly — a 2-of-3 with recovery built in, so there’s no single seed to lose (a great first setup, especially if you live on your phone)',
    // Bitkey's onboarding is app-guided and unique — no manual seed to write down;
    // recovery is the built-in 2-of-3 (app key + hardware device + Block's server).
    checklist: [
      { text: 'Download the Bitkey app and order the Bitkey device (Block ships it to you)', howto: 'choose-a-wallet' },
      { text: 'Set up your wallet in the app — it pairs with the hardware device (those are your two everyday keys)', howto: 'hot-vs-cold' },
      { text: 'Set up recovery: add a Trusted Contact and/or cloud backup so the 2-of-3 can restore you — there’s no seed phrase to write down or lose', howto: 'back-up-your-seed' },
      { text: 'Send a small amount first, confirm it arrives, then move the rest', howto: 'hot-vs-cold' },
      { text: 'Keep the hardware device somewhere safe, separate from your phone', howto: 'physical-security' },
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
      note: 'Bitkey is a phone-based 2-of-3 with recovery built in (a light collaborative setup) — an especially easy on-ramp; the Jade is a classic single-sig hardware wallet and great value. Both are solid, low-cost first setups.',
    };
  }
  if (budgetTight) {
    return { devices: [DEV.jade, DEV.bitbox], note: 'Both are strong value for a first single-sig wallet — the Jade especially if you’re keeping costs down; the BitBox02 is a Swiss, Bitcoin-only step up that also makes a great multisig key later.' };
  }
  // Bigger stakes, budget not the deciding factor → lead with a buy-once device
  // that also carries you up the ladder (passphrase, multisig) without new hardware.
  if (a.tech === 'technical') {
    return { devices: [DEV.coldcard, DEV.passport], note: 'Both are buy-once — the same hardware climbs from single-sig to a passphrase or full multisig, no re-buying. The Coldcard Q’s keyboard makes it the easiest to operate at every rung and stays a lean Bitcoin-only signer; the Passport Prime is a pricier, audited platform with a big touchscreen (it does more than Bitcoin, too).' };
  }
  return { devices: [DEV.coldcard, DEV.jade], note: 'The Coldcard Q is the friendliest to operate (a real keyboard, simple menus) and buy-once — it climbs to a passphrase or multisig later without new hardware, which is worth the premium if you expect to grow. The Jade is the budget alternative: spend less now, re-buy only if you ever climb.' };
}

const STEP = {
  buy:        { text: 'Buy the device from the vendor directly — never a marketplace or third-party seller', howto: 'choose-a-wallet' },
  offline:    { text: 'Set it up offline and generate your seed on the device itself', howto: 'hot-vs-cold' },
  metal:      { text: 'Back up the recovery seed on metal (fire/flood-proof), not just paper', howto: 'back-up-your-seed' },
  testRecover:{ text: 'TEST RECOVERY before you fund it — wipe the device and restore from your backup', howto: 'recovery-rehearsal' },
  smallFirst: { text: 'Send a small amount first, confirm it arrives, then move the rest', howto: 'hot-vs-cold' },
  separate:   { text: 'Store the backup separate from the device — ideally a second location', howto: 'physical-security' },
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
        { text: 'Pick a non-custodial phone wallet — one where YOU hold the keys, not the company', howto: 'choose-a-wallet' },
        { text: 'Move a small amount off the exchange and practice sending & receiving', howto: 'hot-vs-cold' },
        { text: 'Write the recovery phrase down and keep it offline — never a photo or cloud note', howto: 'back-up-your-seed' },
        { text: 'As your stack grows, graduate to a hardware wallet and cold storage', howto: 'hot-vs-cold' },
      ],
      holdback: null,
    };
  }

  const bigStake = stakes === 'serious' || stakes === 'lifechanging';
  const wantsMultisig = stakes === 'lifechanging' ||
    (stakes === 'serious' && (recovery === 'heirs' || worry === 'targeted' || worry === 'self-loss'));

  if (wantsMultisig) {
    const selfRun = tech === 'technical' && stakes === 'lifechanging';
    if (selfRun) {
      return {
        tier: 'Tier 3 — advanced', rungSlug: 'multisig', rungLabel: 'Do-it-yourself multisig (2-of-3)',
        headline: 'Self-run multisig (2-of-3)',
        why: 'At life-changing stakes and with the skills to run it, multisig removes the single point of failure: two of three keys sign, so no one lost, stolen, or coerced key can move your coins — and losing any one key isn’t fatal. Use devices from two different vendors so one vendor’s bug can’t sink all your keys.',
        wallets: [DEV.coldcard, DEV.bitbox],
        walletNote: 'Use two DIFFERENT vendors (like these) so one vendor’s bug can’t sink all your keys. The Coldcard Q’s keyboard and clear menus make driving a multisig signing session the least fiddly — and if you already started single-sig on one, you don’t need new hardware to get here.',
        checklist: [
          { text: 'Read the multisig walkthrough end-to-end before buying anything', howto: 'choose-a-wallet' },
          { text: 'Buy 2–3 devices from TWO different vendors (directly from each)', howto: 'choose-a-wallet' },
          STEP.offline,
          { text: 'Back up EACH key’s seed on metal, stored in separate locations', howto: 'back-up-your-seed' },
          { text: 'Back up the wallet descriptor (the map of your keys) — without it the keys can’t be reassembled', howto: 'back-up-your-seed' },
          STEP.testRecover,
          ...(sharedNeed ? [{ text: 'Write your heirs a plain-English recovery guide and store it with the estate documents', howto: 'inheritance' }] : []),
          STEP.smallFirst,
        ],
        holdback: 'Only because you told us you’re technical and the stakes are life-changing. If DIY multisig ever feels like too much to run reliably, collaborative custody (a service holds one key) gives you most of the safety with far less to maintain.',
      };
    }
    return {
      tier: 'Tier 2–3', rungSlug: 'collaborative', rungLabel: 'Collaborative custody (2-of-3, a partner or service co-signs)',
      headline: 'Collaborative custody (2-of-3)',
      why: `Your stakes are high${sharedNeed ? ' and someone else needs to be able to recover it' : ''}${worry === 'self-loss' ? ', and your real worry is losing access yourself' : ''} — which is exactly what collaborative custody solves. You hold keys, a partner or a Bitcoin-only service holds another, and any two of three can recover. No single lost key is fatal, no memorized secret to forget, and it builds inheritance in by design — without the burden of running multisig yourself.`,
      wallets: null,
      walletNote: '<strong>Choose your service first — it comes before the hardware.</strong> Collaborative-custody services specify which hardware wallets they support, and some (like Bitkey) send you the device. Pick a service below, then use a supported device from its list — no need to choose a wallet in advance.',
      checklist: [
        { text: 'Choose your service or co-signer FIRST — a Bitcoin-only collaborative-custody service (see below) and/or a trusted partner', howto: 'choose-a-wallet' },
        { text: 'Get your hardware key(s) from the service’s supported list — some (like Bitkey) send you the device', howto: 'choose-a-wallet' },
        STEP.offline,
        { text: 'Back up each key you control on metal, in separate locations', howto: 'back-up-your-seed' },
        { text: 'Back up the wallet descriptor (the map of your keys) somewhere safe', howto: 'back-up-your-seed' },
        STEP.testRecover,
        { text: 'Document the recovery plainly for whoever needs it — partner or heirs', howto: 'inheritance' },
        STEP.smallFirst,
      ],
      holdback: 'We did NOT send you to do-it-yourself multisig on purpose — at your comfort level, collaborative custody gives you the same "no single point of failure" without the ongoing burden of running it all yourself.',
    };
  }

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
        { text: 'Choose a strong passphrase — long and unguessable; it can’t be reset or recovered', howto: 'opsec-basics' },
        { text: 'BACK UP THE PASSPHRASE separately from the seed, in a different place — a passphrase only in your head is the #1 way people lose passphrase-protected Bitcoin', howto: 'back-up-your-seed' },
        { text: 'Test recovery with BOTH the seed and the passphrase before funding', howto: 'recovery-rehearsal' },
        STEP.smallFirst,
        ...(sharedNeed ? [{ text: 'Make the passphrase inheritable — your heirs need it too, or the coins are lost', howto: 'inheritance' }] : []),
      ],
      holdback: 'A passphrase adds a brand-new way to lose everything (forget it and even the seed won’t help). It’s worth it for your threat model — but only if you back it up as carefully as the seed.',
    };
  }

  const ssd = singleSigDevices(a);
  return {
    tier: 'Tier 1', rungSlug: 'single-sig', rungLabel: 'Single-signature cold storage',
    headline: 'Single-signature cold storage',
    why: `${worry === 'self-loss'
        ? 'Since your real worry is losing access yourself, the win is a backup you can actually recover — not extra secrets or signers that add new ways to lose.'
        : 'For your stakes, one hardware wallet with a rock-solid, well-tested backup is genuinely enough.'} This is the simplest setup that isn’t negligent, and for most holders it’s the right home for a long time.`,
    wallets: ssd.devices,
    walletNote: ssd.note,
    checklist: [ STEP.buy, STEP.offline, STEP.metal, STEP.testRecover, STEP.smallFirst, STEP.separate,
      ...(recovery !== 'just-me' ? [{ text: 'Leave your partner/heirs a plain-English guide to finding the backup and recovering the wallet', howto: 'inheritance' }] : []) ],
    holdback: (worry === 'self-loss' || worry === 'unsure')
      ? 'We deliberately did NOT add a passphrase. A passphrase mainly defends against a found seed — but it’s a new single point of failure, and since your risk is losing access yourself, it would add danger, not remove it. Don’t add complexity you don’t need.'
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

  if (slug === 'single-sig') {
    // If a theft/coercion worry is anywhere in the ranking → passphrase; else if
    // someone else needs to recover → collaborative; else the natural next layer.
    if (worries.includes('theft') || worries.includes('targeted')) {
      return S('passphrase', 'Single-sig + passphrase', 'Add a passphrase (the "25th word")',
        `If ${second === 'targeted' ? 'coercion' : 'someone finding your seed'} becomes your bigger worry, add a passphrase so a found seed alone can’t spend your coins. Only take this on once you’re confident you can back the passphrase up as carefully as the seed.`);
    }
    if (a.recovery !== 'just-me') {
      return S('collaborative', 'Collaborative custody (2-of-3)', 'Move to collaborative custody',
        'When your stack grows or you want inheritance handled cleanly, collaborative custody adds a second signer so no single lost key is fatal — and builds recovery for your heirs in by design.');
    }
    return S('passphrase', 'Single-sig + passphrase', 'Add a passphrase (the "25th word")',
      'The natural next layer as your stack grows: a passphrase means a found or photographed seed alone can’t spend your coins. Back it up as carefully as the seed.');
  }
  if (slug === 'passphrase') {
    return S('collaborative', 'Collaborative custody (2-of-3)', 'Step up to collaborative multisig',
      'As the stakes climb, multisig beats a passphrase: two of three keys sign, so no single lost, stolen, or forgotten key is fatal — and a passphrase’s "forget it and it’s gone" risk disappears. Collaborative custody gets you there without running it all yourself.');
  }
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
  // learning → the graduation target
  return S('single-sig', 'Single-signature cold storage', 'Graduate to cold storage',
    'The moment your stack is more than pocket money, move it to a hardware wallet in single-sig cold storage — your first real self-custody setup.');
}

function withVendors(rec) {
  if (rec && rec.rungSlug === 'collaborative') rec.vendors = collaborativeVendors;
  return rec;
}

export function recommend(a) {
  const worryArr = Array.isArray(a.worry) ? a.worry : (a.worry ? [a.worry] : ['unsure']);
  const primary = primaryRec({ ...a, worry: worryArr[0] || 'unsure' });
  const secondary = secondaryRec({ ...a, worry: worryArr }, primary);
  return { primary: withVendors(primary), secondary: withVendors(secondary) };
}
