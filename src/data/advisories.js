// Security advisories — active incidents affecting hardware this guide rates.
//
// WHY THIS IS A DATA FILE and not just a page: the site-wide banner, the
// advisory page, the notices on the affected device cards, and the nav badge
// all state the same facts. Typed four times they would disagree within a week
// (invariant #10 — no count is ever typed). They all derive from here.
//
// WHAT BELONGS HERE: an incident where a device we rate has a confirmed defect
// that puts existing users' coins at risk. Not vendor drama, not a disclosed-
// and-patched bug with no exposure, not a price change.
//
// THE STANDING RULE FOR WRITING ONE: separate what is CONFIRMED from what is
// still moving, and separate "am I at risk" from "is this device still worth
// buying". Those are different questions with different answers, and a reader
// in a panic will conflate them unless the page refuses to.
//
// AND A SECOND THING LIVES HERE NOW: `notRecommended`, our own purchase
// recommendation, held DELIBERATELY APART from the tier. The tier is /standard
// applied and it is not ours to move on a feeling; the recommendation is ours
// and always was. Keeping them in one file with two fields is what lets a page
// say both at once without either one quietly becoming the other.

export const advisories = [
  {
    id: 'coldcard-seed-entropy-2026',
    // Stated, never derived from the id. The banner links here from every page,
    // and a clever id→URL transform is exactly the kind of thing that breaks
    // silently the first time an id is named differently.
    href: '/advisory/coldcard-seed-entropy',
    status: 'active',
    severity: 'critical',
    // Devices we rate that are implicated. Slugs match wallets.js names.
    affectsDevices: ['Coldcard Q', 'Coldcard Mk5'],
    vendor: 'Coinkite',
    title: 'Coldcard seed-generation flaw — check whether your seed is affected',
    // The one-line version, used by the banner. Keep it to the ACTION.
    bannerText: 'Coldcard seeds generated between March 2021 and 31 July 2026 may be weak. Coins have been stolen. Check if yours is affected —',
    published: '2026-08-01',
    lastUpdated: '2026-08-06',

    // ── what is CONFIRMED ───────────────────────────────────────────────────
    summary:
      'A build-configuration error introduced into Coldcard firmware in March 2021 caused seed generation to silently fall back to a non-cryptographic random number generator, seeded largely from non-secret chip data. Seeds created on affected firmware carry far less randomness than the 128 bits they should — and on the worst-affected devices, little enough to be brute-forced. On 30 July 2026 an attacker did exactly that, sweeping hundreds of wallets in under an hour.',

    // Entropy figures are the vendor/researcher figures, not ours.
    exposure: [
      {
        band: 'Highest risk',
        who: 'Seeds generated on a Coldcard Mk2 or Mk3 running any 4.x firmware before 4.2.0 — that is 4.0.1 through 4.1.9.',
        detail: 'Roughly 40 bits of effective randomness instead of 128 — within reach of an offline brute-force search. This is the group the 30 July sweeps came from. Coinkite gives the Mk3 range as 4.0.1–4.1.9 and Block’s analysis puts the Mk2 and Mk3 range at 4.0.0–4.1.9; either way, anything below the 4.2.0 fix is in scope.',
      },
      {
        band: 'Also affected',
        who: 'Seeds generated on a Coldcard Mk4, Mk5 or Q before the fixed firmware for your release track — standard 5.6.0+ (Mk4/Mk5) or 1.5.0Q+ (Q), Edge 6.6.0X+ (Mk4/Mk5) or 6.6.0QX+ (Q).',
        detail: 'Partial secure-element mixing left these stronger — around 72 bits by Coinkite’s reckoning — but that is still far below what a seed is supposed to have. Block’s analysis is harsher: once the fallback state and call history are pinned down, it puts the securely-distinguished search space at no more than 2³². Treat this band as serious, not as cleared.',
      },
      {
        // The trap Coinkite calls out by name: Edge version numbers run AHEAD of
        // the standard track, so arithmetic on the version number gives the wrong
        // answer. Stated as its own band because a reader who gets this wrong
        // concludes they are safe and stops reading.
        band: 'The version-number trap',
        who: 'Anyone on the Edge release track.',
        detail: 'Standard and Edge are separate tracks and Edge numbers are higher. An Edge 6.x release is not fixed merely because 6 is greater than 5.6.0 — only 6.6.0X (Mk4/Mk5) and 6.6.0QX (Q) and later carry the fix. Check your track, then your version, in that order.',
      },
      {
        // A seed is affected by where it was BORN, so moving it elsewhere carries
        // the weakness along. Without this, a reader who migrated to another
        // maker reads the bands above and correctly concludes none apply to them.
        band: 'Still affected even though you left',
        who: 'Anyone who generated a seed on an affected Coldcard and later restored it onto a different wallet — another maker’s device, a phone wallet, or software.',
        detail: 'The weakness is in the seed itself, not in the device holding it. Restoring a weak seed somewhere else copies the weakness across. Your exposure is decided by where and when the seed was first generated, and nothing you do afterwards short of generating a new one changes that.',
      },
      {
        band: 'Out of scope, or genuinely protected',
        who: 'Seeds generated before the vulnerable firmware window (Mk2 and Mk3 through 3.2.2 used the hardware generator directly); seeds you created with at least 50 of your own dice rolls, rolled independently and privately and never written down anywhere digital; and TAPSIGNER, OPENDIME and SATSCARD, which run different code entirely.',
        detail: 'On affected firmware the device hashed your dice in alongside its own weak randomness, so your rolls still count: Coinkite puts 50–98 independent private rolls at 128 bits or better from the dice alone, and 99+ at roughly 256. If you cannot remember how many you rolled, or whether the sequence was recorded, treat the seed as in scope.',
      },
      {
        // Deliberately NOT filed under the clear band. A passphrase blocks this
        // attack but leaves a weak seed underneath it, and the vendor's own
        // guidance is to migrate anyway. Filing it as "safe" would be the
        // difference between a reader acting and a reader stopping here.
        band: 'Protected for now, but still migrate',
        who: 'Seeds behind a strong, unique BIP-39 passphrase, and multisig wallets where at least one key was generated somewhere unaffected.',
        detail: 'These are real mitigations and they are why nothing was taken from wallets that had them — a guessed seed does not reach coins behind a phrase the attacker does not have, and one weak key out of several does not move a multisig. But the weak seed is still underneath, so the protection is only as good as the passphrase. A short, common, patterned, quoted or reused passphrase is guessable; if that describes yours, treat the funds as at risk today. Everyone in this band should migrate in their own time rather than treat it as closed.',
      },
    ],

    // The thing readers get wrong. Called out on its own because it inverts the
    // instinct everyone has ("I updated, so I'm fine").
    keyMisunderstanding: {
      claim: 'I updated my firmware, so I am fine.',
      truth:
        'Updating does not repair a seed that already exists. Your exposure was decided by the firmware running at the moment the seed was first generated — not by the firmware on the device today, and not by when you bought it. Restoring a weak seed onto a brand-new device leaves it exactly as weak. The only fix for an affected seed is to generate a new one on fixed firmware and move the coins.',
    },

    // Both release tracks, because Edge numbers are HIGHER than standard ones
    // and a reader comparing version numbers alone reaches the wrong answer.
    fixedFirmware: [
      // Mk2 AND Mk3 — the `who` line above scopes the risk to both, and Coinkite's
      // own advisory lists them as one row. Naming only the Mk3 here left an Mk2
      // holder reading the fix table for a model that was not in it, on the one page
      // where the reader is looking up their own device to decide whether to act.
      { model: 'Mk2 and Mk3', version: '4.2.0 or later' },
      { model: 'Mk4 and Mk5 (standard track)', version: '5.6.0 or later' },
      { model: 'Mk4 and Mk5 (Edge track)', version: '6.6.0X or later' },
      { model: 'Q (standard track)', version: '1.5.0Q or later' },
      { model: 'Q (Edge track)', version: '6.6.0QX or later' },
    ],

    // What we tell a reader to actually DO, in order. Deliberately calm: the
    // vendor's own guidance is that panicked migration causes its own losses
    // (wrong addresses, lost backups), and we agree with that.
    whatToDo: [
      'Do not rush. A botched migration loses coins too — more people lose Bitcoin to a panicked move than to any single exploit. Work through this deliberately.',
      'Work out whether your seed is in scope: which Coldcard model, and roughly when you first generated the seed on it. If it was generated between March 2021 and 31 July 2026 on any of the affected models, assume it is in scope until you can show otherwise.',
      'If you used a strong unique passphrase, or generated your seed with 50+ dice rolls, or your coins sit in a multisig with a key from another maker, you have a real mitigation. It is still worth migrating in your own time.',
      'Update to the fixed firmware first, so the device you are about to trust generates properly.',
      'Generate a brand-new seed on the updated device — do not restore the old one — back it up, test the backup by restoring it, and only then move your coins to the new wallet.',
      'Treat the old seed as burned afterwards. Do not reuse it anywhere, for any amount.',
    ],

    // Attribution, because none of this is our research.
    sources: [
      { label: 'Coinkite security advisory', url: 'https://blog.coinkite.com/coldcard-mk3-seed-generation-warning/' },
      { label: 'Block engineering — technical analysis', url: 'https://engineering.block.xyz/blog/predictable-rng-fallback-and-32-bit-reseed-in-coldcard-firmware' },
    ],

    // Our own position, kept separate from the reporting above.
    //
    // This paragraph opened "We rate the Coldcard in our cold-storage tier and
    // recommend it in the setup finder" until 2026-08-06. The first half is
    // still true and the second is not: the device came off our recommended
    // list that day. Rewritten rather than annotated, because a "Where we
    // stand" section stating a position we have since reversed is the house
    // bug — two surfaces about one subject, each internally consistent — on the
    // one page a reader arrives at to find out where we stand.
    ourTake:
      'We rate the Coldcard in our cold-storage tier, and until 6 August 2026 we recommended it in the setup finder, so this lands squarely on our own recommendation and we are not going to be quiet about it. Two things are true at once, and conflating them helps nobody. A device bought today, running fixed firmware, generates a proper seed — the defect is in seeds already created, not in every Coldcard forever. But a five-year-old flaw in open-source firmware that nobody caught, in the single most security-critical function a signing device performs, is a serious mark against a maker. We said we would re-read it against our published standard rather than assume our rating still held, and that whatever we concluded would be published rather than quietly applied. That review is below — and so is what we decided afterwards, which is a different decision and went the other way.',

    // ── THE PROMISED REVIEW, DISCHARGED ─────────────────────────────────────
    // The advisory promised in writing that the cold-tier rating was being
    // re-read against /standard and that the conclusion would be published
    // rather than quietly applied. This is that conclusion. It stays on the
    // page rather than becoming a silent rating change, which is the whole
    // point of having made the promise.
    ratingReview: {
      published: '2026-08-01',
      verdict: 'The Coldcard keeps its place in our cold-storage tier.',
      intro:
        'We said we would re-read the Coldcard against our published standard rather than assume the old rating survived, and that we would publish whatever we found. Here it is, gate by gate. The short version is that nothing in our standard fails — and that the reasoning is more uncomfortable than the verdict.',
      gates: [
        {
          gate: 'Your keys can never leave over the internet',
          holds: true,
          note: 'Holds. No Coldcard feature exports your seed to anyone, and none did here. The flaw made seeds guessable from the outside; it never shipped one anywhere. The distinction matters for the rating even though the outcome for the victims was the same.',
        },
        {
          gate: 'Verifiable — not a closed black box',
          holds: true,
          note: 'Holds, and this is the uncomfortable one. The firmware is source-available and independently reproducible, and it still is. But the defect sat in that public source for five years, and researchers were able to link the exact lines the day it surfaced. Reproducible builds did their job perfectly: they guaranteed the shipped binary faithfully matched the source, and the source had the bug in it.',
        },
        { gate: 'Bitcoin-only firmware', holds: true, note: 'Unaffected.' },
        { gate: 'A minimal, single-purpose signer', holds: true, note: 'Unaffected.' },
        { gate: 'Self-sovereign, portable recovery', holds: true, note: 'Unaffected — a standard BIP-39 seed, restorable anywhere.' },
      ],
      // The honest reckoning, kept separate from the gate-by-gate so it cannot
      // read as one more box being ticked.
      reckoning:
        'We are not going to pretend the verdict is a clean bill of health. A five-year-old flaw in the single most security-critical function a signing device performs, in open code that anyone could read, is a serious mark against a maker — and it is a mark against the rest of us too, because "it is open, so someone would have caught it" is exactly what everybody assumed, including us. Nobody had. What verifiability actually buys you is the ability to find out afterwards, quickly and precisely, which is genuinely worth having and is not the same thing as prevention.',
      // Why the standard is NOT changing — the decision, stated as a decision.
      whyNoNewGate:
        'The obvious move would be to add a criterion about entropy: where a device gets its randomness, and whether anyone outside the company can check it. We considered it and decided against, and it is worth saying why, because the argument is not that the gap does not exist. Open, reproducible code is the highest bar available today — there is no stronger standard to hold a maker to, and the Coldcard already clears it. A rule written now would be a rule written against the specific thing that just went wrong, and the next failure will be something nobody has thought of yet. A standard that grows a new clause after every incident stops being a standard and becomes a list of past events.',
      // What changed instead. Only claims things that have actually shipped.
      instead:
        'What we changed is what we tell you to do about it. The people whose coins survived this were the ones who had not left the randomness entirely to the device — their own dice, a passphrase the device never saw, or a key from a different maker. So we have published a full procedure for generating a seed from your own dice rolls, on the devices we rate, checked against each maker\'s own current documentation. That is a thing you can act on today, and unlike a new gate it would have helped against this failure and against ones we have not imagined.',
      insteadHref: '/roll-your-own-seed',
      insteadLabel: 'Roll your own seed with dice',
      // Added 2026-08-06. The review above is the record of a decision about the
      // RATING and it still stands unamended — that is the point of having
      // published it. What changed five days later is the RECOMMENDATION, which
      // the review never claimed to settle. Without this line the two sections
      // read as a contradiction to anyone scrolling, which is exactly the
      // failure mode a page like this has to refuse.
      supersededNote:
        'This review still stands and has not been rewritten. It answered one question — does the Coldcard still clear our published standard — and the answer is still yes. On 6 August 2026 we answered a different question, about whether we would tell you to buy one, and that answer changed. The section below is that decision.',
    },

    // ── OUR RECOMMENDATION, WHICH IS NOT OUR RATING ─────────────────────────
    //
    // Sourced from here rather than from standardGates ON PURPOSE. A rating is a
    // published standard applied, never a preference, and a criterion added
    // after an incident to fit the incident stops being a standard — so the
    // rubric does not move and this sits beside it, disclosed, as ours.
    //
    // `devices` is stated rather than reusing affectsDevices. They hold the same
    // two names today and they are not the same list: affectsDevices is who the
    // INCIDENT touches, this is who our POSITION touches, and a future advisory
    // will separate them the first time we keep recommending an affected device.
    notRecommended: {
      since: '2026-08-06',
      devices: ['Coldcard Q', 'Coldcard Mk5'],
      // The short form, rendered on device cards and comparison rows. Kept to
      // the position and the pointer — the reasoning is a click away and does
      // not fit beside a price.
      flag: 'Not recommended for purchase',
      short:
        'The rating below is unchanged and this device still clears our published standard. We are nonetheless telling you not to buy one right now — that is our own call, on the maker rather than the hardware, and here is the whole of the reasoning.',
      anchor: '/advisory/coldcard-seed-entropy#not-recommended',

      headline: 'We no longer recommend buying a Coldcard',

      // WHY, in our own voice. This is the part that is explicitly a judgement
      // and it says so, because dressing a judgement as a finding is how a
      // rating gets bent to an event.
      why: [
        'The defect is fixed and a Coldcard bought today generates a proper seed. We are not telling you otherwise, and if the hardware were the whole question we would not be writing this. What we cannot get past is everything around it. A build-configuration error sat in the seed generator — the single function a signing device exists to perform — for five years, in source anyone could read, at a company whose entire pitch is that you do not have to trust it. It was not found by an audit, or by the reproducible builds, or by us. It was found by an attacker, and the first anyone knew was money leaving.',
        'What follows from that is not a technical claim, and we are not going to pretend it is one. It is a judgement about a company under conditions we cannot see the end of: losses still being counted, legal exposure publicly threatened, and no way for anyone outside Coinkite to know what the next twelve months hold for it. On a device whose whole job is to still be trustworthy in ten years, that uncertainty is itself the problem. We would rather point a first-time buyer somewhere with fewer open questions and be wrong about a good device than be right about the odds and wrong about someone\'s savings.',
        'And there is a plainer reason underneath both, which is ours and which we would rather state than have inferred. We are an independent guide with no affiliate money and no house brand, so the only thing we have is a recommendation that means something. A recommendation you would hesitate to give a friend today is not one to leave standing on a page because the rubric technically permits it.',
      ],

      // WHAT IS DOCUMENTED — attributed, ranged, and dated, because every one of
      // these figures has moved in the week this was written and the honest
      // rendering of a moving number is a range with a name on it.
      documented: {
        intro:
          'Everything in this section is somebody else\'s reporting and is attributed to them. It was re-read against the sources on 6 August 2026 and the numbers were still moving that day.',
        items: [
          {
            label: 'The mechanism',
            body: 'A 2021 build migration routed seed generation through a guard, MICROPY_HW_ENABLE_RNG, that checked only whether the setting was defined and not whether it was non-zero. Coinkite had defined it as zero, so the guard never fired and the firmware silently linked MicroPython\'s deterministic software fallback instead of the hardware generator. Both had the same function signature, so the build raised nothing. Coinkite\'s own advisory and Block\'s same-day analysis agree on this.',
          },
          {
            label: 'The losses — a range, not a number',
            body: 'TRM Labs puts the opening sweep at roughly 594 BTC, about $38 million, out of some 500 wallets in twenty-five minutes on 30 July. Further waves followed, and Galaxy Research\'s running tally is reported at around 1,816 BTC — close to $116 million — across more than 5,200 addresses. Other outlets have reported totals between $100 and $130 million and Galaxy\'s assessment that at least fifteen distinct attackers were involved. Every tracker publishing a figure calls it preliminary, and this advisory was originally written around the 594 BTC number, which turned out to be the first hour rather than the total.',
          },
          {
            label: 'The legal position',
            body: 'A class action against Coinkite has been publicly threatened and plaintiff firms are soliciting claimants. As of 6 August 2026 we are not aware of a filed case.',
          },
          {
            label: 'What we are NOT claiming',
            body: 'We have found no evidence that any government, regulator or law-enforcement body is investigating Coinkite, and we are not going to imply one by leaving the sentence vague. The investigating that has happened is technical — Block, Galaxy Research, TRM Labs and independent researchers — and the legal exposure is threatened rather than active. Claims circulating that an AI tool found this bug before disclosure trace back to a single anonymous post made after the flaw was already public, and we are not repeating them.',
          },
        ],
      },

      // THE OTHER AUDIENCE. This is half the page's job and it is written to
      // someone who already owns the device and has just read the section above.
      ifYouOwnOne: {
        headline: 'If you already own one, read this instead',
        body: [
          'Nothing above says your device is unsafe to use today. It says we would not tell someone to buy a new one. Those are different sentences and the difference matters, because the worst thing you could do with this page is panic-migrate a working setup and lose coins to a fumbled transfer — which happens far more often than exploits do.',
          'What actually decides your exposure is the seed, not the device: when and where it was first generated, and whether you rolled your own dice or set a passphrase. That is what the bands above are for, and they are the part of this page to act on. If your seed is in scope, migrate deliberately using the steps above. If it is not, you own a capable signer and there is no emergency.',
          'We are keeping everything that serves you. The setup walkthrough for your device stays, the dice procedures stay — including the two that only Coinkite hardware can perform — and your device keeps its cold-storage rating on the comparison table, because it earned it. When you next replace or add hardware, that is the moment to weigh what is above. Not tonight.',
        ],
      },

      // WHEN WE WOULD CHANGE OUR MINDS. Stated because a position with no exit
      // condition is a grudge, and because writing it down is what stops this
      // becoming permanent by inattention.
      revisit:
        'This is a position about uncertainty, so it should end when the uncertainty does. We will re-read it when the loss accounting settles, when the legal position resolves one way or the other, and when there is a track record of the maker\'s process changes on the other side of it. If those land well, the recommendation comes back and we will say so as plainly as we said this. It is reviewed on a fixed schedule rather than when we happen to think of it.',

      // Separate from the advisory's own `sources`, which cover the FLAW. These
      // cover the figures and the legal position — the claims added on 08-06 —
      // so a reader can see which source carries which claim rather than being
      // handed one undifferentiated list.
      sources: [
        { label: 'TRM Labs — on-chain analysis and loss tally (5 Aug 2026)', url: 'https://www.trmlabs.com/resources/blog/the-largest-hardware-wallet-exploit-of-2026-inside-the-usd-116-million-coldcard-hack' },
        { label: 'Bitcoin.com News — class action threatened (2 Aug 2026)', url: 'https://news.bitcoin.com/regulation-and-legal/coinkite-faces-class-action-threat-as-bitcoin-wallet-bug-costs-users-over-1300-btc/' },
      ],
    },

    // The wider lesson — this is the part that outlives the incident.
    lesson:
      'This is the argument for a second factor that does not come from your device. A passphrase you chose, dice you rolled yourself, or a key from a different maker in a multisig — each of them meant this flaw could not reach your coins on its own. Every wallet drained on 30 July was single-signature with no passphrase. "The device generates it for you" is a single point of failure even when the device is a good one.',
  },
];

export const activeAdvisories = advisories.filter((a) => a.status === 'active');
export const advisoryFor = (deviceName) =>
  activeAdvisories.find((a) => a.affectsDevices.includes(deviceName)) || null;
export const advisoryCount = activeAdvisories.length;

/**
 * Our purchase recommendation for a device, where we have withdrawn it.
 * Returns the advisory's `notRecommended` block plus the advisory it came from,
 * or null — and null is the answer for every device we have never flagged,
 * which is all of them but two.
 *
 * THE FLAG IS SOURCED HERE AND NOT FROM standardGates, and that is the whole
 * design. Moving a device's TIER because of an incident would mean the rubric
 * bends to events, which is the one thing an independent rating cannot do and
 * still be worth publishing. So the rating stays where the standard puts it and
 * this rides beside it, in our own name, with the reasoning one click away.
 */
export const notRecommendedFor = (deviceName) => {
  const a = activeAdvisories.find(
    (x) => x.notRecommended && x.notRecommended.devices.includes(deviceName),
  );
  return a ? { ...a.notRecommended, advisoryHref: a.href, advisoryTitle: a.title } : null;
};

/** Every device name currently carrying a withdrawn recommendation. */
export const notRecommendedDevices = activeAdvisories.flatMap(
  (a) => (a.notRecommended ? a.notRecommended.devices : []),
);
export const anyNotRecommended = (names = []) => names.some((n) => !!notRecommendedFor(n));
