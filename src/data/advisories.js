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
    lastUpdated: '2026-08-01',

    // ── what is CONFIRMED ───────────────────────────────────────────────────
    summary:
      'A build-configuration error introduced into Coldcard firmware in March 2021 caused seed generation to silently fall back to a non-cryptographic random number generator, seeded largely from non-secret chip data. Seeds created on affected firmware carry far less randomness than the 128 bits they should — and on the worst-affected devices, little enough to be brute-forced. On 30 July 2026 an attacker did exactly that, sweeping hundreds of wallets in under an hour.',

    // Entropy figures are the vendor/researcher figures, not ours.
    exposure: [
      {
        band: 'Highest risk',
        who: 'Seeds generated on a Coldcard Mk3 running firmware 4.0.1 through 5.0.3.',
        detail: 'Roughly 40 bits of effective randomness instead of 128 — within reach of an offline brute-force search. This is the group the 30 July sweeps came from.',
      },
      {
        band: 'Also affected',
        who: 'Seeds generated on a Coldcard Mk4, Mk5 or Q before the emergency firmware (5.6.0+ for Mk4/Mk5, 1.5.0Q+ for Q).',
        detail: 'Partial secure-element mixing left these stronger — around 72 bits — but that is still far below what a seed is supposed to have, and far below what we would call safe. Treat it as serious, not as cleared.',
      },
      {
        band: 'Not affected by this flaw',
        who: 'Seeds generated before the vulnerable firmware window; seeds you created with at least 50 of your own dice rolls; seeds protected by a strong, unique BIP-39 passphrase; multisig where at least one key was generated somewhere unaffected; and TAPSIGNER, OPENDIME and SATSCARD, which run different code.',
        detail: 'A passphrase helps here because it is mixed in after seed generation — an attacker who guesses a weak seed still cannot reach coins behind a phrase they do not have.',
      },
    ],

    // The thing readers get wrong. Called out on its own because it inverts the
    // instinct everyone has ("I updated, so I'm fine").
    keyMisunderstanding: {
      claim: 'I updated my firmware, so I am fine.',
      truth:
        'Updating does not repair a seed that already exists. Your exposure was decided by the firmware running at the moment the seed was first generated — not by the firmware on the device today, and not by when you bought it. Restoring a weak seed onto a brand-new device leaves it exactly as weak. The only fix for an affected seed is to generate a new one on fixed firmware and move the coins.',
    },

    fixedFirmware: [
      { model: 'Mk3', version: '4.2.0 or later' },
      { model: 'Mk4 and Mk5', version: '5.6.0 or later' },
      { model: 'Q', version: '1.5.0Q or later' },
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
      'We rate the Coldcard in our cold-storage tier and recommend it in the setup finder, so this lands on our own recommendation and we are not going to be quiet about it. Two things are true at once, and conflating them helps nobody. A device bought today, running fixed firmware, generates a proper seed — the defect is in seeds already created, not in every Coldcard forever. But a five-year-old flaw in open-source firmware that nobody caught, in the single most security-critical function a signing device performs, is a serious mark against a maker, and we are re-reading it against our published standard rather than assuming our rating still holds. What we will not do is quietly change a rating and hope nobody noticed the old one.',

    // The wider lesson — this is the part that outlives the incident.
    lesson:
      'This is the argument for a second factor that does not come from your device. A passphrase you chose, dice you rolled yourself, or a key from a different maker in a multisig — each of them meant this flaw could not reach your coins on its own. Every wallet drained on 30 July was single-signature with no passphrase. "The device generates it for you" is a single point of failure even when the device is a good one.',
  },
];

export const activeAdvisories = advisories.filter((a) => a.status === 'active');
export const advisoryFor = (deviceName) =>
  activeAdvisories.find((a) => a.affectsDevices.includes(deviceName)) || null;
export const advisoryCount = activeAdvisories.length;
