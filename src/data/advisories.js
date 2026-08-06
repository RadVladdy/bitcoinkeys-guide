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
    ourTake:
      'We rate the Coldcard in our cold-storage tier and recommend it in the setup finder, so this lands on our own recommendation and we are not going to be quiet about it. Two things are true at once, and conflating them helps nobody. A device bought today, running fixed firmware, generates a proper seed — the defect is in seeds already created, not in every Coldcard forever. But a five-year-old flaw in open-source firmware that nobody caught, in the single most security-critical function a signing device performs, is a serious mark against a maker. We said we would re-read it against our published standard rather than assume our rating still held, and that whatever we concluded would be published rather than quietly applied. That review is below.',

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
