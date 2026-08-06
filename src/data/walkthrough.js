// The setup walkthroughs — what a cold-storage device actually shows you, drawn.
//
// WHY THE SCREENS ARE DRAWN AND NOT CAPTURED. Four reasons, and the fourth is the
// one that decides it. (1) There is no licensing question about artwork we made,
// on a site whose whole pitch is that it reproduces nobody's material and takes
// nobody's money. (2) A photograph of a menu goes stale the moment the vendor
// repaints it, silently — and NOTHING here can see that a screenshot has aged,
// which would make it the first artifact on this site owing a freshness entry
// that no check could ever satisfy. (3) A drawing is verifiable:
// scripts/measure-diagrams.mjs reads its geometry in a real browser, which is
// this project's standing answer for a printed or drawn artifact. (4) It scales
// past whichever devices are physically in hand.
//
// THE COST IS REAL AND THE PAGES SAY SO. A schematic loses the beginner's
// reassurance of seeing the literal screen, and pretending otherwise would be the
// dishonest version of this decision. `drawnNotCaptured` below is stated on every
// page for that reason, in the reader's own interest rather than as a disclaimer.
//
// AND THE DRAWINGS ARE PITCHED ABOVE THE FIRMWARE VERSION ON PURPOSE. Reason (2)
// is only true if the artwork is not a faithful copy of this month's menu tree. So
// what is drawn is the SHAPE of the moment — four words on a screen, a question
// the device asks back, an address to compare — never a menu path. Menu paths and
// button labels are the fastest-rotting thing a vendor owns; where a reader needs
// one, this hands them the maker's own guide instead of holding a stale copy.
//
// COVERAGE IS THE COLD-STORAGE TIER, AND THAT IS AN EDITORIAL POSITION, not an
// omission. A step-by-step walkthrough is an endorsement in the shape of a
// diagram. Making the two spending-tier devices and the one that does not clear
// our bar easier to follow onto than /standard says they should be would undo
// with a drawing what the rating says in words. The roster is derived from
// `coldWallets` and asserted below, so a device cannot fall out of it the way one
// once fell out of both derived lists on the seed lesson.

import { coldWallets, deviceCatalog, shortName, tierOf } from './wallets.js';
import { checklistItems } from './checklist.js';
import { deviceDice } from './dice.js';

/** ISO date the per-device claims here were last read against each maker's own guide. */
export const walkthroughVerified = '2026-08-05';

export const walkthroughHref = '/setup-walkthrough';
export const walkthroughFor = (slug) => `${walkthroughHref}/${slug}`;

/**
 * Stated on every page in this cluster, once, from here. It is the honest half of
 * the decision to draw rather than photograph, and a stance typed on ten surfaces
 * is a stance that drifts on nine.
 */
export const drawnNotCaptured =
  'Every screen below is a drawing, not a photograph of your device. It shows what the '
  + 'moment is for and what you have to do — not the exact pixels, wording or menu path, '
  + 'which change with every firmware release. Your device will look different and say '
  + 'the same things.';

// ── The interface classes ──────────────────────────────────────────────────
//
// A class is HARDWARE — how you say yes and how you type. That is the one thing
// about a hardware wallet that cannot change under a firmware update, which is
// exactly why the drawings are keyed to it rather than to a model. Two devices in
// one class genuinely share a walkthrough; two devices in one FAMILY often do not,
// which is why the Coldcards are split and the Jades are split.
//
// `glyph` is the control drawn under each screen panel, in a 225 x 26 box.
//
// TWO CONSTRAINTS ON THESE SHAPES, both from measure-diagrams.mjs and both worth
// stating because they are invisible until the run goes red. A stroked path with
// no fill reads as a CONNECTOR and has to join something at both ends, so the
// arrows here are filled markers rather than strokes. And a rect taller than the
// glyphs sitting near it is read as that text's CONTAINER, so every shape stays
// above y=14 and every caption sits on the baseline at y=23 — the caption is
// beside these controls, never inside one.
export const deviceInterfaces = [
  {
    key: 'keyboard',
    controls: 'a full keyboard and a large colour screen',
    saysYes: 'the ENTER key',
    types: 'letter by letter, like a keyboard',
    glyph: [
      ...Array.from({ length: 10 }, (_, i) => ({ t: 'rect', x: 42 + i * 15, y: 1, w: 11, h: 5 })),
      ...Array.from({ length: 9 }, (_, i) => ({ t: 'rect', x: 49 + i * 15, y: 8, w: 11, h: 5 })),
      { t: 'text', x: 112.5, y: 23, s: 'full keyboard', size: 8 },
    ],
  },
  {
    key: 'keypad',
    controls: 'a twelve-key number pad and a small single-colour screen',
    saysYes: 'the OK key',
    types: 'digits directly; letters by cycling a key',
    glyph: [
      ...Array.from({ length: 12 }, (_, i) => ({
        t: 'rect', x: 87 + (i % 4) * 14, y: 1 + Math.floor(i / 4) * 6, w: 10, h: 4,
      })),
      { t: 'text', x: 112.5, y: 23, s: 'number pad', size: 8 },
    ],
  },
  {
    key: 'two-button',
    controls: 'two physical buttons and a small single-colour screen',
    saysYes: 'both buttons together',
    types: 'by stepping to each character and confirming it',
    glyph: [
      { t: 'rect', x: 80, y: 2, w: 22, h: 11, rx: 5 },
      { t: 'rect', x: 124, y: 2, w: 22, h: 11, rx: 5 },
      { t: 'text', x: 112.5, y: 23, s: 'both buttons = yes', size: 8 },
    ],
  },
  {
    key: 'touch',
    controls: 'a colour touchscreen',
    saysYes: 'a tap',
    types: 'on an on-screen keyboard',
    glyph: [
      { t: 'circle', x: 112.5, y: 8, r: 6.5 },
      { t: 'circle', x: 112.5, y: 8, r: 2.5 },
      { t: 'text', x: 112.5, y: 23, s: 'tap the screen', size: 8 },
    ],
  },
  {
    key: 'slider',
    controls: 'two hidden touch strips — no buttons at all',
    saysYes: 'a tap on the strip',
    types: 'by sliding a finger to each character',
    glyph: [
      { t: 'rect', x: 64, y: 4, w: 44, h: 6, rx: 3 },
      { t: 'rect', x: 118, y: 4, w: 44, h: 6, rx: 3 },
      { t: 'text', x: 112.5, y: 23, s: 'slide, then tap', size: 8 },
    ],
  },
  {
    key: 'wheel',
    controls: 'a jog wheel and one button, beside a small colour screen',
    saysYes: 'a press of the wheel',
    types: 'by rolling to each character and pressing',
    glyph: [
      { t: 'circle', x: 101, y: 8, r: 6.5 },
      { t: 'rect', x: 116, y: 3, w: 13, h: 10, rx: 4 },
      { t: 'text', x: 112.5, y: 23, s: 'roll, then press', size: 8 },
    ],
  },
  {
    key: 'side-buttons',
    controls: 'left and right selection buttons beside a colour screen',
    saysYes: 'the select button',
    types: 'by stepping to each character and selecting it',
    glyph: [
      { t: 'path', d: 'M88 8 l10 -6 l0 12 z' },
      { t: 'path', d: 'M137 8 l-10 -6 l0 12 z' },
      { t: 'rect', x: 103, y: 3, w: 19, h: 10, rx: 4 },
      { t: 'text', x: 112.5, y: 23, s: 'step, then select', size: 8 },
    ],
  },
];

export const interfaceByKey = Object.fromEntries(deviceInterfaces.map((i) => [i.key, i]));

// ── The four screens every one of these devices shows you ──────────────────
//
// These are not four screens out of many; they are the four where the device's
// own display IS the security boundary, and every one of them corresponds to a
// rule the course already teaches. The words below are deliberately generic — a
// device that says "Recovery phrase" where this says "Your 24 words" is the same
// screen, and writing the vendor's exact string here is how a drawing starts
// rotting.
//
// THEY ARE NOT NUMBERED, AND THAT IS A CLAIM THE ARTWORK DELIBERATELY DOES NOT
// MAKE. Makers disagree about when the PIN is set — before the device will make a
// seed at all on some, after the backup is written on others — so numbering these
// panels would put a false sequence into the one artifact on the page that a
// reader takes at a glance. The steps below are ordered, because the ordering
// that matters (nothing is funded before the restore is proven) is real; the
// screens are four moments, not four numbers.
export const screenPanels = [
  {
    tag: 'the PIN',
    lines: ['Set a PIN', '• • • •', 'on the device'],
  },
  {
    tag: 'the words',
    lines: ['1 army    2 velvet', '3 ocean   4 pupil', 'write these down'],
  },
  {
    tag: 'the check',
    lines: ['Which was word 3?', 'ocean · ripple', 'modest · canyon'],
  },
  {
    tag: 'the address',
    lines: ['Receive to', 'bc1q…k4f2', 'does it match?'],
  },
];

// ── The procedure ──────────────────────────────────────────────────────────
//
// A WALKTHROUGH IS A PROCEDURE, so it runs on the same ordering discipline as
// /checklist and it does not get to invent its own. Every step names the
// checklist item or items it corresponds to, and the assert at the foot of this
// file refuses to build unless those ids appear in checklist.js's own order.
// That is what makes "nothing tells a reader to fund a wallet before the backup
// is proven" a property of the build rather than a promise: moving `fund` above
// `restore` here fails, because `test-send` sits after `prove-recovery` there.
export const walkthroughSteps = [
  {
    id: 'seal',
    for: ['get-device'],
    title: 'Check the seal before you power it on',
    body: 'The box should be sealed and the device should be blank. <strong>If it ever shows you a '
      + 'seed phrase it has already generated, or hands you one on a card, it is compromised and '
      + 'you stop there.</strong> A device that arrives pre-loaded with someone else’s keys '
      + 'behaves perfectly right up until your coins leave.',
    rule: 'buy-direct',
  },
  {
    id: 'app',
    for: ['install-app'],
    title: 'Install the maker’s app, and let it install the firmware',
    body: 'Type the maker’s address in yourself rather than following a search result — '
      + 'the paid results above a wallet download are a standing attack. Most of these devices ship '
      + 'with no firmware at all, and the app installing it is normal. What is <em>not</em> normal is '
      + 'any prompt, from the app or a website, asking for words you have not created yet.',
    rule: 'seed-words-scam',
  },
  {
    id: 'create',
    for: ['generate-seed'],
    title: 'Tell it to make a new wallet',
    body: 'Not <em>recover</em> — that is the option beside it, and it is for a wallet you already '
      + 'have. What matters about this step is where the keys come from: they are made '
      + '<em>by the device, in front of you</em>, out of randomness you did not choose and cannot '
      + 'predict, and nobody — including the maker — sees the result. That is the whole reason the '
      + 'device is worth what you paid for it, and it is over in about four seconds.',
    rule: 'buy-direct',
  },
  {
    id: 'words',
    for: ['generate-seed'],
    title: 'Write the words down while the screen still holds them',
    screens: [1],
    body: 'The device shows the words once. Write them on paper, in order, by hand, with the device in '
      + 'front of you — <strong>and nowhere else.</strong> Not a photo, not a note, not a password '
      + 'manager, not “just to check.” This is the single moment on this page where a mistake '
      + 'is silent and permanent, and it is also the moment people reach for a camera.',
    rule: 'never-digital',
  },
  {
    id: 'confirm',
    for: ['generate-seed'],
    title: 'Give the words back to the device',
    screens: [2],
    body: 'It will ask for some of them back, and this is not a formality — it is the only check '
      + 'that happens between your handwriting and your money. It proves the device can read what you '
      + 'wrote, in the order you wrote it. <strong>It does not prove your backup works</strong>, because '
      + 'the words are still in the device’s memory while it asks. That proof comes later, and it is '
      + 'the step people skip.',
    rule: 'test-backup',
  },
  {
    id: 'pin',
    for: ['set-pin'],
    title: 'Set a PIN on the device itself',
    screens: [0],
    body: 'Somewhere around here the device asks for a PIN, and <strong>which side of the words it '
      + 'lands on depends entirely on the maker</strong> — before it will generate anything on some, '
      + 'after the backup is written on others. It genuinely does not matter, and a page that told '
      + 'you a firm order would be wrong within a release. What is worth being clear about is what '
      + 'the PIN is for: <strong>it stops a person who has picked up your device.</strong> It '
      + 'protects the hardware, not the wallet — anybody holding your written words does not need '
      + 'it and will never be asked for it.',
  },
  {
    id: 'address',
    for: ['verify-address'],
    title: 'Read the receiving address on the device’s own screen',
    screens: [3],
    body: 'Your computer shows you an address. The device shows you an address. <strong>Compare them, '
      + 'and treat the device as the one telling the truth.</strong> Malware that swaps a copied address '
      + 'for an attacker’s is ordinary, cheap and invisible on a screen the malware controls — '
      + 'and the little display in your hand is the one surface it cannot reach. This is the habit the '
      + 'whole device exists to make possible.',
    rule: 'verify-address',
  },
  {
    id: 'testfund',
    for: ['test-receive'],
    title: 'Send a small test amount — and only a small one',
    body: 'An amount you would shrug at. It confirms the address is really yours and that the wallet '
      + 'sees what arrives. <strong>It confirms nothing about your backup</strong>, so this is as far '
      + 'as the money goes until the restore below has actually been done.',
  },
  {
    id: 'metal',
    for: ['back-up-seed'],
    title: 'Check the paper, then put the words on metal',
    body: 'Read every word back against the device once more, then move them to metal. Paper is the '
      + 'draft; it survives neither a fire nor a leaking roof nor twenty years in a drawer. The house '
      + 'guidance on which metal, and the tested failures behind it, sits under Metal backups in the '
      + 'Hardware &amp; services menu.',
    rule: 'never-digital',
  },
  {
    id: 'restore',
    for: ['prove-recovery'],
    title: 'Wipe it, and restore from what you wrote',
    body: '<strong>This is the step that makes the rest of it real, and it is the one almost nobody '
      + 'does.</strong> Reset the device to factory, then restore it from your own writing and nothing '
      + 'else — not the app’s copy, not your memory, not the card the device came with. If the '
      + 'test amount reappears, your backup works. If it does not, you have found that out today, for '
      + 'the price of a rounding error, instead of on the day the device dies.',
    rule: 'test-backup',
  },
  {
    id: 'fund',
    for: ['test-send'],
    title: 'Now move the rest',
    body: 'Not before. Everything above this line is reversible for the cost of the test amount; '
      + 'everything below it is your savings. Move them in one go, verify the address on the device’s '
      + 'own screen again, and then leave the device alone — the whole point of cold storage is that '
      + 'the interesting part is over.',
    rule: 'savings-offline',
  },
];

// ── The devices ────────────────────────────────────────────────────────────
//
// Per-device facts are kept to what a walkthrough needs and what does not rot in
// a month: the controls (hardware), the maker's own guide (a link, watched), and
// the two or three places where THIS device's setup diverges from the shape above
// in a way that changes what a reader should do. Everything else about a device
// — price, tier, badges, caveats — is /wallets' job and is not restated here.
//
// A DIVERGENCE MAY NAME THE STEP IT OVERRIDES, and the BitBox02 is why that field
// exists. Its standard setup never shows the words, while the shared step says
// "the device shows the words once" — two statements on ONE page, each internally
// consistent, which is this project's house bug arriving inside a single document.
// A divergence carrying `step` renders as an explicit override with a link to the
// step it contradicts, and the assert below refuses a `step` that names nothing.
export const deviceWalkthroughs = {
  'coldcard-q': {
    ui: 'keyboard',
    docs: 'https://coldcard.com/guides/setup/coldcard-q-setup',
    docsLabel: 'Coinkite’s own Coldcard Q setup guide',
    diverges: [
      'The PIN has two halves, with two words shown in between. <strong>Those words are yours and '
      + 'nobody else’s.</strong> Learn them at setup: if they are ever different, you are not '
      + 'holding the device you set up, and you stop before typing the second half.',
      'It can be driven entirely by camera and screen, so it never has to touch a computer at all. '
      + 'That is the strongest version of this setup and it costs nothing extra to choose at the start.',
    ],
  },
  'coldcard-mk5': {
    ui: 'keypad',
    docs: 'https://coldcard.com/guides/setup/coldcard-mk5-setup',
    docsLabel: 'Coinkite’s own Coldcard Mk5 setup guide',
    diverges: [
      'The PIN has two halves, with two words shown in between. <strong>Those words are yours and '
      + 'nobody else’s.</strong> Learn them at setup: if they are ever different, you are not '
      + 'holding the device you set up, and you stop before typing the second half.',
      'There is no camera. It moves data on a MicroSD card instead, which is the same idea done with '
      + 'a card rather than a picture — the computer and the device never speak directly.',
      'Everything is typed on a number pad. Reading a long address on the small screen is the part '
      + 'people rush, and it is the one worth slowing down for.',
    ],
  },
  'trezor-safe-3': {
    ui: 'two-button',
    docs: 'https://trezor.io/guides/trezor-devices/trezor-safe-3/get-started-with-the-trezor-safe-3',
    docsLabel: 'Trezor’s own Safe 3 setup guide',
    diverges: [
      'The firmware install offers a <strong>Bitcoin-only build</strong> at that moment. Take it. '
      + 'It is less code doing fewer things on the device holding your savings, and choosing it later '
      + 'is a reinstall.',
      'The backup type is a choice, and the default is not the portable one. A Trezor backup of '
      + 'twenty words only restores in wallets that understand that format; <strong>a plain seed '
      + 'restores anywhere.</strong> Unless you specifically want the split-share option, take the '
      + 'plain one — a backup you can only use in one maker’s software is a dependency you '
      + 'did not mean to buy.',
      'The two buttons move a cursor whose position deliberately shifts as you go, so watching over '
      + 'your shoulder teaches an onlooker nothing.',
    ],
  },
  'trezor-safe-5': {
    ui: 'touch',
    docs: 'https://trezor.io/guides/trezor-devices/trezor-safe-5/get-started-with-the-trezor-safe-5',
    docsLabel: 'Trezor’s own Safe 5 setup guide',
    diverges: [
      'The firmware install offers a <strong>Bitcoin-only build</strong> at that moment. Take it.',
      'The backup type is a choice, and the default is not the portable one. A Trezor backup of '
      + 'twenty words only restores in wallets that understand that format; <strong>a plain seed '
      + 'restores anywhere.</strong> Take the plain one unless you specifically want the split-share '
      + 'option.',
      'The touchscreen makes word entry and address reading the easiest of any device here, which is '
      + 'most of what you are paying the extra for over the Safe 3.',
    ],
  },
  'trezor-safe-7': {
    ui: 'touch',
    docs: 'https://trezor.io/guides/trezor-devices/trezor-safe-7/get-started-with-the-trezor-safe-7',
    docsLabel: 'Trezor’s own Safe 7 setup guide',
    diverges: [
      'The firmware install offers a <strong>Bitcoin-only build</strong> at that moment. Take it.',
      'The backup type is a choice, and the default is not the portable one. A Trezor backup of '
      + 'twenty words only restores in wallets that understand that format; <strong>a plain seed '
      + 'restores anywhere.</strong> Take the plain one unless you specifically want the split-share '
      + 'option.',
      'This is the one device here with a Bluetooth radio. Every spend still has to be approved on '
      + 'the device’s own screen, which is why we treat the radio as a caveat rather than a '
      + 'disqualifier — but if it is off and you never need it, leave it off.',
    ],
  },
  bitbox02: {
    ui: 'slider',
    docs: 'https://support.bitbox.swiss/en_US/basics/bitbox02-setup-microsd-backup',
    docsLabel: 'BitBox’s own BitBox02 setup guide',
    diverges: [
      // NO EXCLUSIVITY CLAIM HERE. This said "the one default on any device in this
      // tier that we would tell you to change" while the three Trezor Safe pages refuse
      // a second one (the backup type), and the registry carries a watcher for each —
      // so the sentence was false against this project's own data, and false in the way
      // that is hardest to see: each page read correctly on its own. A claim about the
      // OTHER devices in the tier cannot be made from inside one device's divergence.
      { step: 'words', body: '<strong>Its standard setup never shows you the words at all.</strong> The bundled microSD card '
      + 'takes the backup instead, as a file, and the setup finishes without you having written '
      + 'anything down. That is a digital copy of your keys sitting on a card — the one thing every '
      + 'backup rule here exists to prevent — so treat it as a default to refuse rather than accept: '
      + 'BitBox publishes a separate no-microSD path, and that is the one to follow. If you have already set one up the '
      + 'standard way, the device will show you the words from its settings — do that today rather '
      + 'than starting over. Keep the card as well if you like it. Not instead.' },
      'There are no buttons. The password and every confirmation are a finger slid along two touch '
      + 'strips, which feels wrong for about a minute and then does not.',
      'The app and the device each show a pairing code at setup. <strong>If the two ever differ, '
      + 'stop</strong> — that is the check telling you something is between them.',
    ],
  },
  'jade-core': {
    ui: 'wheel',
    docs: 'https://help.blockstream.com/blockstream-jade/faqs/blockstream-jade-quickstart-guide-for-desktop',
    docsLabel: 'Blockstream’s own Jade quickstart guide',
    diverges: [
      'It has no dedicated secure-element chip, and its PIN is checked against a Blockstream server '
      + 'that never learns the PIN or your keys. That is a deliberate design rather than a corner cut '
      + '— <strong>but it means the device needs to reach the internet to unlock</strong>, which '
      + 'is a dependency the other devices here do not have. Read that before you choose it, not after.',
      'No camera. It connects by cable or Bluetooth, so the computer and the device do speak directly.',
    ],
  },
  'jade-core-2026': {
    ui: 'side-buttons',
    docs: 'https://help.blockstream.com/blockstream-jade/faqs/blockstream-jade-quickstart-guide-for-desktop',
    docsLabel: 'Blockstream’s own Jade quickstart guide',
    diverges: [
      'Setup is guided step by step from Blockstream’s app, and it runs an authenticity check on '
      + 'the device before anything else. That check is genuinely useful and it is not a substitute '
      + 'for the tamper seal — look at both.',
      'Same server-checked PIN as the rest of the Jade line, and the same consequence: '
      + '<strong>unlocking needs a connection.</strong>',
      'No camera and no battery. It connects by cable or Bluetooth.',
    ],
  },
  'jade-plus': {
    ui: 'side-buttons',
    docs: 'https://help.blockstream.com/blockstream-jade/faqs/blockstream-jade-quickstart-guide-for-desktop',
    docsLabel: 'Blockstream’s own Jade quickstart guide',
    diverges: [
      'It has a camera, so it can be driven by QR codes without ever being plugged into a computer. '
      + 'That is the reason to pick this one over the cheaper Jade, and it is worth choosing at setup '
      + 'rather than later.',
      'Same server-checked PIN as the rest of the Jade line, and the same consequence: '
      + '<strong>unlocking needs a connection.</strong> A camera does not remove that.',
    ],
  },
};

/**
 * The roster, in the order /wallets already publishes them. Derived from the cold
 * tier — never a list typed here, because a typed list is how a device goes
 * missing from one surface while every other surface stays internally consistent.
 */
export const walkthroughDevices = coldWallets.map((w) => {
  const cat = deviceCatalog.find((d) => d.name === w.name);
  const wt = deviceWalkthroughs[cat.slug];
  const dice = deviceDice.find((d) => d.name === w.name);
  return {
    slug: cat.slug,
    name: w.name,
    // The rated name carries a qualifier on one device ("BitBox02 (BTC-only)"),
    // which is right in a roster and reads badly four times inside a sentence.
    // Headings and the glance strip keep the rated name; prose uses this.
    short: shortName(w.name),
    vendor: w.vendor,
    image: w.image,
    ui: interfaceByKey[wt.ui],
    docs: wt.docs,
    docsLabel: wt.docsLabel,
    // Normalised so a divergence can be written as a bare string when it overrides
    // nothing, and as { step, body } when it contradicts a shared step.
    diverges: wt.diverges.map((x) => (typeof x === 'string' ? { body: x } : x)),
    // Derived, not typed: whether the device will take your own dice rolls is
    // dice.js's judgement and is already published on /roll-your-own-seed.
    takesDice: !!dice && (dice.enrich === 'yes' || dice['dice-only'] === 'yes'),
    // A WALKTHROUGH IS AN ENDORSEMENT IN THE SHAPE OF A DIAGRAM — this file's own
    // words, and the reason coverage is the cold tier. That argument does not
    // survive a device staying in the tier while we tell people not to buy it,
    // so the page has to say so itself: the roster is unchanged, because an
    // owner mid-setup is exactly who this cluster serves, and the endorsement
    // reading is closed by printing our position on the page rather than by
    // removing the page. Carried through here so the template cannot forget it
    // for one device.
    notRecommended: w.notRecommended || null,
  };
});

export const walkthroughBySlug = Object.fromEntries(walkthroughDevices.map((d) => [d.slug, d]));
export const walkthroughCount = walkthroughDevices.length;

/** The interface classes actually in use, in roster order — the hub groups by these. */
export const walkthroughGroups = deviceInterfaces
  .map((i) => ({ ui: i, devices: walkthroughDevices.filter((d) => d.ui.key === i.key) }))
  .filter((g) => g.devices.length);

// ── Asserts ────────────────────────────────────────────────────────────────
//
// These assert COVERAGE AND ORDER and say nothing about whether the prose is any
// good. The three-layer standard lives on the hub and stays a review step; what a
// script can do is refuse a walkthrough that has drifted off the checklist's
// ordering, or a roster that no longer matches the tier it claims to be.

const coldSlugs = coldWallets.map((w) => deviceCatalog.find((d) => d.name === w.name).slug);
const written = Object.keys(deviceWalkthroughs);

for (const slug of coldSlugs) {
  if (!written.includes(slug)) {
    throw new Error(
      `walkthrough.js: "${slug}" is rated built for cold storage and has no walkthrough. `
      + 'Coverage is the whole cold tier — write one, or the roster silently shrinks.',
    );
  }
}
for (const slug of written) {
  if (!coldSlugs.includes(slug)) {
    const d = deviceCatalog.find((x) => x.slug === slug);
    throw new Error(
      `walkthrough.js: "${slug}" has a walkthrough but is rated "${d ? tierOf(d) : 'unknown'}". `
      + 'A step-by-step walkthrough is an endorsement in the shape of a diagram, and this cluster '
      + 'covers the cold-storage tier only.',
    );
  }
}
for (const [slug, w] of Object.entries(deviceWalkthroughs)) {
  if (!interfaceByKey[w.ui]) throw new Error(`walkthrough.js: "${slug}" names unknown interface "${w.ui}"`);
  if (!/^https:\/\//.test(w.docs || '')) throw new Error(`walkthrough.js: "${slug}" has no maker's guide link`);
  if (!w.diverges || !w.diverges.length) {
    throw new Error(
      `walkthrough.js: "${slug}" lists nothing that diverges from the shared procedure. `
      + 'If it really diverges in nothing it does not need its own page.',
    );
  }
  for (const x of w.diverges) {
    const step = typeof x === 'string' ? null : x.step;
    if (step && !walkthroughSteps.some((s2) => s2.id === step)) {
      throw new Error(
        `walkthrough.js: "${slug}" has a divergence overriding step "${step}", which does not exist. `
        + 'An override pointing at nothing leaves the shared step standing and contradicted.',
      );
    }
  }
}

// THE ORDERING ASSERT, and it is the reason this file imports checklist.js at all.
// A walkthrough is a procedure, so /checklist owns its order. Flattening every
// step's `for` ids in page order must produce a NON-DECREASING walk through
// checklistItems — which is what makes "nothing tells a reader to fund before the
// backup is proven" hold by construction rather than by review.
//
// NON-DECREASING RATHER THAN STRICTLY INCREASING, and the difference is real
// rather than a loosening to make this pass. One checklist item can be several
// screens: "generate a fresh seed" is three separate things at the device — tell
// it to make one, copy the words down, hand some of them back — and splitting
// them into three steps is the walkthrough doing its job. What must never happen
// is going BACKWARDS, and that is what this refuses.
{
  const idx = Object.fromEntries(checklistItems.map((it, i) => [it.id, i]));
  let last = -1;
  let lastId = '(start)';
  for (const s of walkthroughSteps) {
    for (const id of s.for) {
      if (!(id in idx)) {
        throw new Error(
          `walkthrough.js: step "${s.id}" cites checklist item "${id}", which does not exist. `
          + 'A walkthrough step with no checklist step behind it is a procedure nothing orders.',
        );
      }
      if (idx[id] < last) {
        throw new Error(
          `walkthrough.js: step "${s.id}" cites "${id}", which /checklist puts before `
          + `"${lastId}". The walkthrough may not reorder the checklist — fix the order here, `
          + 'or change checklist.js if the checklist is the thing that is wrong.',
        );
      }
      last = idx[id];
      lastId = id;
    }
  }
}

for (const s of walkthroughSteps) {
  for (const n of s.screens || []) {
    if (!screenPanels[n]) throw new Error(`walkthrough.js: step "${s.id}" names screen ${n}, which is not drawn`);
  }
}
