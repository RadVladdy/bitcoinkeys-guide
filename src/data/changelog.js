// The public "what changed" log — the visible side of the freshness promise.
// Every substantive change to the guide's facts, prices, and tools, newest first.
//
// How this is maintained: the freshness runner (~/dev/bkeys-freshness) re-checks vendor
// prices/specs on a schedule and flags drift for a human to confirm. Confirmed changes get
// a line here AND the underlying data is updated — so this log and the site never disagree.
// Nothing is auto-published from an unverified check.
//
// Entry types: 'price' | 'device' | 'spec' | 'security' | 'feature' | 'content'
export const changelog = [
  {
    date: '2026-07-30',
    type: 'content',
    title: 'Rewritten: what a “wallet” actually is, and the one-way chain behind it',
    detail: 'The lesson on Bitcoin keys used to define a wallet as “a configuration of keys” — and it did so before it had explained what public and private keys are. Both halves of that were wrong. A configuration of keys answers what it takes to move your coins; it never answers which coins are yours. So the page now runs in the order the ideas actually depend on each other. First the chain: your private key produces a public key, which produces an address, and each step runs one way only — nobody can work backwards from an address to a public key, or from a public key to a private key. That is why handing out an address costs you nothing, and it is arithmetic rather than a promise anyone is making. Then the wallet, defined as the answer to two questions: which coins are mine, and what does it take to move them. The first is the extended public key — the xpub — which lets software find every address you will ever receive at and add up your balance without being able to spend anything. The second is whether one key signs, or a key plus a passphrase, or several keys where a few must agree. Both together are the wallet, and written out as one line that is a wallet descriptor. And a caution that follows from it, which was nowhere on the site before: an address is safe to share, but an xpub is not — it cannot spend, but it reveals every address in the wallet, past and future, so anyone holding it can see your whole balance and history. Finally, the explanation of why a hardware wallet is called a signing device rather than storage moved down beside the section on signing, where it belongs.',
  },
  {
    date: '2026-07-30',
    type: 'feature',
    title: 'The front page rebuilt — what we promise first, then what is actually here',
    detail: "The front page now leads with what this site promises — no device to sell, no keys held, Bitcoin only, and nothing logged — then shows what is actually here: the course laid out by level, the setup finder and the checklist it builds, the hardware comparison, and a first look at the interactive demos.",
  },
  {
    date: '2026-07-30',
    type: 'feature',
    title: 'New: a short knowledge check at the end of two lessons',
    detail: "Two lessons now end with a couple of questions on what you just read, and a short explanation when you get one wrong. A pilot for now. Nothing is scored, saved or sent anywhere — close the tab and it is gone.",
  },
  {
    date: '2026-07-30',
    type: 'content',
    title: 'The quiz is now "Find your setup" — and two safety sections got more specific',
    detail: "The setup quiz is now called Find your setup, because it never tested what you know — it asks about your situation. Old links still work. Two lessons also got sharper: spreading your keys across several places cannot protect you from a confrontation if you hold a single set of recovery words, so the privacy lesson now names the setups that can; and the inheritance lesson says plainly that keys are access, not legal title — nothing here is a will or a trust.",
  },
  {
    date: '2026-07-30',
    type: 'device',
    title: 'Correction: two Trezors were listed as clearing the bar with no caveat, and they have two',
    detail: "Correction: we described the Trezor Safe 3 and Safe 5 as clearing our bar with no caveat at all. They do clear it and their rating has not changed — but both ship multi-coin by default, so the Bitcoin-only firmware is a build you choose, and their Shamir backup only restores in wallets that understand that format. The comparison page had been showing both facts all along. That leaves the BitBox02 as the only cold-storage device with no caveat against it.",
  },
  {
    date: '2026-07-30',
    type: 'content',
    title: 'The configuration ladder is now one lesson instead of five pages',
    detail: "The configuration ladder is now a single lesson with a comparison table of all four rungs at the top, instead of five separate pages. Every old address still works. Two things moved into lessons of their own: how much of your money belongs hot versus cold, and the two options that are not rungs — BIP-85 and Shamir backup.",
  },
  {
    date: '2026-07-30',
    type: 'content',
    title: 'Fixed: some “how →” links on the quiz and checklist pointed at the wrong lesson',
    detail: "Fixed: sixteen “how →” links on the setup finder and checklist opened a real page, but not the one that answered the step you clicked. All of them now point where they say they do.",
  },
  {
    date: '2026-07-30',
    type: 'security',
    title: 'Correction: a passphrase kept only in your head is not a defence',
    detail: "We got one wrong and we are fixing it in the open. On “how people actually lose Bitcoin,” the defence against a physical attack said to keep your real coins behind a passphrase that lives “nowhere but in your head.” That contradicted the rest of this guide — a passphrase kept only in memory is the single most documented way people lose passphrase-protected Bitcoin — and it contradicted the same page four items earlier. The decoy idea is sound and stays. What changed is where the passphrase lives: backed up as carefully as the seed, and stored somewhere the seed is not.",
  },
  {
    date: '2026-07-29',
    type: 'content',
    title: 'The course now opens with twelve rules — and every lesson teaches one of them',
    detail: "The course now opens with twelve rules — one plain numbered list, no links, two minutes to read. Follow them and you have done the important part. Every lesson after it teaches one of those rules in full and says which. Several lessons were merged in the same pass, and every old address redirects.",
  },
  {
    date: '2026-07-28',
    type: 'feature',
    title: 'Learn is now a course — five numbered levels, and every lesson points to the next',
    detail: "The guides became a course: five numbered levels in reading order, with every lesson pointing to the next — so you can read the whole thing front to back without going back to the menu.",
  },
  {
    date: '2026-07-28',
    type: 'feature',
    title: 'The guide is reorganised — learn first, then act, and your checklist is now built for you',
    detail: "The site is organised around one idea: learn first, then act. The menu separates the course from the tools, and your checklist is now generated from your own plan rather than being one long list for everyone.",
  },
  {
    date: '2026-07-22',
    type: 'security',
    title: 'New: our published selection standard — every wallet now rated in three tiers',
    detail: "Every hardware wallet is now rated in three tiers against a published standard: built for cold storage, built for spending, or does not clear our bar. Two of the criteria are hard security requirements; the rest decide whether a device suits money you are locking away for years. The reasoning for every device is written out.",
  },
  {
    date: '2026-07-20',
    type: 'content',
    title: 'Sharper risk defenses + a quick way back to your plan',
    detail: "On “how people lose Bitcoin,” the physical-attack defence gained the decoy-wallet idea: your recovery words alone open only a small believable stash, while the real coins sit behind a passphrase. (The “keep it in your head” part of this was wrong, and was corrected on 30 July 2026 — see that entry.) The exchange-failure defence now points at Bitcoin-only services rather than multi-coin exchanges.",
  },
  {
    date: '2026-07-20',
    type: 'feature',
    title: 'Your recommended wallets follow you to the comparison page',
    detail: "Wallets the setup finder recommends for you are now marked on the comparison page, so you can spot them while you browse.",
  },
  {
    date: '2026-07-20',
    type: 'feature',
    title: 'The tools now talk to each other — and a clearer menu',
    detail: "The tools now talk to each other: the setup finder remembers the wallets you own and the answers you have already given, and welcomes you back rather than starting from scratch.",
  },
  {
    date: '2026-07-20',
    type: 'feature',
    title: 'New: compare collaborative custody services — honestly',
    detail: "New: an honest comparison of six collaborative-custody services, where you hold two of three keys and a Bitcoin service holds the third. Compared on KYC, whether you could recover without them, insurance, fees and minimums.",
  },
  {
    date: '2026-07-20',
    type: 'feature',
    title: 'Rework the devices in your plan · encrypt your plan file · a slimmer page',
    detail: "Your plan is now fully reworkable — move devices between key slots, set one aside as a spare, or retire it. You can also download the whole plan as a password-encrypted file.",
  },
  {
    date: '2026-07-20',
    type: 'feature',
    title: 'Your plan now knows which wallets you own — and maps the road to your setup',
    detail: "Your plan now knows which hardware wallets you already own, and maps the road from where you are to the setup you are aiming for: which key slots your devices fill, and what is still to get.",
  },
  {
    date: '2026-07-20',
    type: 'feature',
    title: 'Nostr sign-in now survives your return — fixed the failed save on a second visit',
    detail: "Fixed: signing back in to Nostr on a return visit could fail to save. Your session now resumes properly.",
  },
  {
    date: '2026-07-19',
    type: 'security',
    title: 'Nostr save now hides which app it came from',
    detail: "When you save your plan to Nostr it is stored under a scrambled tag derived from your own key, rather than a plain “bitcoinkeys.guide” label — so nobody can scan the relays to build a list of this guide’s users. The contents were already encrypted; this closes the last piece of metadata that advertised the app. Your key still signs the event, so someone who already has your public key could confirm it.",
  },
  {
    date: '2026-07-19',
    type: 'feature',
    title: 'The quiz now starts from where you are — your plan as a journey',
    detail: "The setup finder now starts from where you are today and frames the result as a journey — a roadmap from your current setup, never a verdict on it.",
  },
  {
    date: '2026-07-19',
    type: 'feature',
    title: 'BIP-85 demo: type any index and watch its wallet appear',
    detail: "The BIP-85 demo now lets you type any index and watch that child wallet appear.",
  },
  {
    date: '2026-07-19',
    type: 'feature',
    title: 'Save to Nostr sits right beside “download my plan” — and remembers you',
    detail: "Save to Nostr now sits beside “download my plan” as one of the save options, and remembers you between visits.",
  },
  {
    date: '2026-07-19',
    type: 'feature',
    title: 'The quiz now leans toward self-sovereignty — no funnel to services',
    detail: "The setup finder now leans toward holding your own keys. Where multisig fits, it offers two equal paths — do it yourself, or use a service — with the honest trade-offs of each, and the do-it-yourself option leads.",
  },
  {
    date: '2026-07-19',
    type: 'price',
    title: 'Trezor Safe 3 dropped $79 → $59',
    detail: "Trezor Safe 3 dropped from $79 to $59 — a permanent cut, confirmed at the vendor’s own store.",
  },
  {
    date: '2026-07-18',
    type: 'feature',
    title: 'The interactive “deeper dive” tier grew to 11 demonstrations',
    detail: "The interactive “deeper dive” tier grew to eleven demonstrations, all running real cryptography in your own browser on throwaway keys.",
  },
  {
    date: '2026-07-18',
    type: 'price',
    title: 'Wallet prices re-checked against every vendor’s own store',
    detail: 'Corrected the Blockstream lineup — the $79 device is the original Blockstream Jade (no camera); Jade Plus moved $149 → $169. Confirmed unchanged: Bitkey $250, Foundation Passport Prime $349, the Coldcards, and the Trezor Safe line.',
  },
  {
    date: '2026-07-18',
    type: 'security',
    title: 'Hardened the site and removed visitor analytics',
    detail: 'Added strict security headers (CSP, HSTS, and more) and switched off the Cloudflare analytics beacon at the source — so the promise that nothing about your visit is sent, stored, or logged is now literally true, not just intended.',
  },
  {
    date: '2026-07-17',
    type: 'device',
    title: 'Wallet comparison expanded to 11 devices',
    detail: 'Added the Coldcard Mk5, the full Trezor Safe line (3, 5, and 7), and both Blockstream Jade models — so the comparison covers every current model from the major independent vendors, not just one per brand.',
  },
  {
    date: '2026-07-17',
    type: 'spec',
    title: 'Foundation Passport → Passport Prime',
    detail: 'Foundation discontinued the $199 Passport and now sells only the $349 Passport Prime, a multi-function security platform. We re-derived its trust badges honestly: Bitcoin-only and air-gapped both dropped to “partial” (it runs other apps and adds Bluetooth/NFC), while it gained an independent security audit.',
  },
  {
    date: '2026-07-16',
    type: 'feature',
    title: 'BitcoinKeys.guide launched',
    detail: 'The readable self-custody guide went live — the configuration ladder, how-to guides, an honest 11-device wallet comparison, the setup quiz, and a Lightning tip jar, all with no affiliate links and nothing to sell you.',
  },
];
