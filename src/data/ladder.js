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
    cost: '$79–$250',
    tier: 'Tier 1 ($1K–$50K)',
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
    cost: '$79–$250 (same device)',
    tier: 'Tier 1–2',
    solves: 'A found or photographed seed is no longer enough to steal your coins. Plausible deniability.',
    introduces: 'A new way to lose everything — forget the passphrase and the funds are gone, even with the seed.',
    built: true,
    whatItIs: 'Exactly rung 1, plus a passphrase you choose when you set up the wallet. The seed phrase on its own opens one wallet — a <em>decoy</em>. The seed phrase <strong>plus</strong> the passphrase opens a different, hidden wallet — your real one. The passphrase is sometimes called the “25th word.”',
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
    whoShould: 'Holders who want a second cryptographic layer without taking on the operational weight of multisig — especially when your realistic worry is “someone finds my seed backup” rather than a targeted attacker. Less useful if your real concern is sophisticated coercion, where the deniability argument gets shaky.',
    inheritance: 'This rung lives or dies on making the passphrase inheritable. A passphrase only in your head is a plan that fails the moment you can’t answer the phone. The cleanest fix is to back up the passphrase separately from the seed, in a place your heirs can reach with instructions — or, for the disciplined, to split it into shares (see the optional <a href="/ladder/shamir">Shamir backup</a>) so no single location holds the whole secret.',
    whenToClimb: 'If your holdings grow to where a single seed backup — decoy or not — feels like too much resting on one thing, the answer is to remove the single point of failure entirely with <a href="/ladder/multisig">multisig (rung 3)</a>. If you want split backups without full multisig, look at the optional <a href="/ladder/shamir">Shamir backup</a>.',
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
    cost: '$300–$800 (three devices)',
    tier: 'Tier 2 ($50K–$1M+) · high discipline',
    solves: 'Removes the single point of failure entirely. One key can be lost OR stolen and you’re still safe.',
    introduces: 'Six-plus items to manage, the wallet descriptor to protect, and real operational complexity.',
    built: true,
    whatItIs: 'A wallet made of several keys where more than one is needed to sign — most commonly <strong>2-of-3</strong>: three keys, any two together can spend. Each key ideally lives on its own hardware device, from a <em>different</em> manufacturer, all held by you. The keys live in different places (a common split: home, a bank safe-deposit box, and a trusted family member or second property). This is the first rung that genuinely removes single points of failure for personal-scale holdings.',
    gains: [
      '<strong>No single point of failure.</strong> Losing any one key, or one location, or trusting any one vendor, no longer risks your coins.',
      '<strong>Full sovereignty.</strong> No company is involved. Nothing to freeze, fail, or subpoena.',
      '<strong>Recoverable.</strong> Lose one key and you simply sign with the other two, move funds to a fresh 2-of-3, and you’re whole again.',
    ],
    costs: [
      '<strong>Complexity — the top cause of lost Bitcoin.</strong> You now manage six sensitive items (three keys, three seed backups), plus the wallet descriptor and coordinator software.',
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
      body: 'If all three keys sit on devices from the same brand, one firmware bug or supply-chain problem could compromise all three at once — defeating the whole point. Mixing brands (say Coldcard + BitBox02 + Foundation Passport Prime) means a single-vendor failure costs you at most one key. It’s the cheapest meaningful upgrade to any multisig.',
    },
    also: {
      label: 'Beyond 2-of-3: the 3-of-5 variant',
      body: 'You’ll hear about <strong>3-of-5</strong> — five keys, any three sign. It’s the <em>same technology</em> as 2-of-3, just with more keys, so there’s nothing new to learn here. What changes is the trade-off: a 3-of-5 survives losing <em>two</em> keys (a 2-of-3 can’t), at the cost of six-to-eight secure locations and much heavier re-keying. For almost everyone that’s the wrong trade — the extra protection is small, the extra self-inflicted loss risk is large. 3-of-5 earns its keep only for a genuine multi-party or multi-jurisdiction need (family offices, distributed trustees, institutional custody with explicit inheritance planning). If that’s not you, stay at 2-of-3.',
    },
    whoShould: 'Holders with material Bitcoin exposure, the discipline to manage six distributed items, and a real plan for how the setup gets recovered if you’re unavailable. Everyone agrees it’s overkill for small balances, and a mistake to adopt before you’re confident with single-sig.',
    inheritance: 'Your heirs need to locate three keys or seed backups, hold the wallet descriptor, know which software coordinates a spend, and understand the signing flow. That’s a high bar for a grieving non-technical person — which is exactly why many holders with substantial stacks choose the collaborative version (rung 4), where a professional partner carries that knowledge for your heirs.',
    whenToClimb: 'If managing the whole thing yourself — and especially handing it to your heirs — feels like too much, <a href="/ladder/collaborative">collaborative custody (rung 4)</a> keeps the same multisig security while a partner carries the complexity. Adding more keys (3-of-5, above) is rarely the right move for an individual.',
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
    tier: 'Tier 2–3 · lower discipline OK',
    solves: 'Multisig security with a partner who can help your heirs recover. Sovereign recovery keeps you in control.',
    introduces: 'A third party in the loop and an annual fee. Sovereign recovery is the make-or-break criterion.',
    built: true,
    whatItIs: 'The same 2-of-3 setup as rung 3 — but one of the three keys is held by a collaborative-custody company (Unchained, Casa, Nunchuk, The Bitcoin Adviser, and others). They hold one key and help coordinate spending, recovery, and inheritance. They <strong>cannot move your funds</strong> — they only hold one of three, and you hold the other two. You keep unilateral control. What you outsource is complexity, not custody.',
    gains: [
      '<strong>Much less to manage.</strong> Typically five items instead of seven — for many holders, the difference between “manageable” and “overwhelming.”',
      '<strong>Convenient spending.</strong> Sign with one key, ask the partner to co-sign; your second key stays untouched in its secure spot.',
      '<strong>A safety net.</strong> Lose a key and the partner can help you recover to a fresh setup — they can only help when asked, never spend alone.',
      '<strong>Inheritance gets dramatically simpler.</strong> Your heirs contact the partner, prove who they are, and get help — no PSBT wrangling.',
    ],
    costs: [
      '<strong>A partner is now in the loop.</strong> You’ve disclosed that you hold Bitcoin, and usually a rough amount — a privacy trade-off.',
      '<strong>Counterparty longevity.</strong> What if they go out of business? (See the sovereign-recovery note.)',
      '<strong>Ongoing cost.</strong> Free tiers exist, but assisted service runs hundreds to thousands per year for larger balances.',
    ],
    keyNote: {
      tone: 'safe',
      label: 'Sovereign recovery is the make-or-break test',
      body: 'The one criterion that matters most when choosing a partner: can you still spend using your two keys plus the wallet descriptor <strong>if the partner vanishes tomorrow</strong>? Reputable partners publish open-source recovery tools that prove yes. Verify this before you commit — it’s the difference between a helper and a dependency.',
    },
    providers: [
      { name: 'Unchained', note: 'White-glove partnership; documented inheritance protocols; attorney coordination.' },
      { name: 'Casa', note: 'Multi-key architecture and tools first; lighter partner role.' },
      { name: 'Nunchuk', note: 'Sovereignty and minimum trust; minimal disclosure (“don’t rely on us”).' },
      { name: 'The Bitcoin Adviser', note: 'Estate-planning end; multisig as infrastructure for a broader inheritance plan.' },
    ],
    whoShould: 'Holders with substantial exposure who honestly recognise that <em>they themselves</em> are their own biggest risk — and who’d rather outsource complexity than build operational discipline from scratch. Especially attractive when your inheritance situation is non-trivial (substantial estate, multiple heirs, complex family), where the partner’s standing process adds real value.',
    inheritance: 'This is the rung’s biggest strength. Your heirs contact the partner — who holds one key, the descriptor, and the expertise — prove their identity, and are walked through accessing one of your two keys. A far lower bar than DIY multisig, and the reason inheritance often tips a holder from rung 3 to rung 4.',
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
  tier: 'Optional · long-term cold storage',
  solves: 'No single backup location is a complete secret. Distribute shares across people or places.',
  introduces: 'At recovery the seed is reassembled on one device — a momentary single point. And more parts to track.',
  built: true,
  whatItIs: 'This isn’t a signing configuration like the rungs — it’s a <strong>backup method</strong>, which is why it sits beside the ladder rather than on it. Instead of one or two complete seed backups, a single seed is mathematically split into several <em>shares</em> — for example, five shares where any three can rebuild the seed, but two or fewer reveal nothing at all. You distribute the shares across locations or trusted people.',
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
  inheritance: 'Shamir can help inheritance — hand shares to trusted parties with instructions — but it’s fragile if your heirs aren’t coordinated: a share treated as junk, a family fall-out, or a share that ends up in a phone photo can break it. For most people a documented plan (or a <a href="/ladder/collaborative">collaborative partner</a>) is more robust than heirs holding shares.',
  whenToClimb: 'If you find yourself wanting the keys to <em>never</em> have to come together in one place — the weakness above — that’s the case for <a href="/ladder/multisig">multisig (rung 3)</a>, which solves the same distribution problem without a risky reassembly step.',
};

export const bip85 = {
  name: 'BIP-85 — the orthogonal simplifier',
  note: 'BIP-85 sits beside the ladder rather than on it: it derives many child seeds from one master, cutting how many backups you keep. Useful at any rung — but it concentrates failure on that one master, which must then be protected at the level of everything derived from it.',
};

export function getRung(slug) {
  if (slug === shamirNote.slug) return shamirNote;
  return ladder.find((r) => r.slug === slug);
}
