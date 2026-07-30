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
    type: 'security',
    title: 'Correction: a passphrase kept only in your head is not a defence',
    detail: 'We got one wrong and we are fixing it in the open. On “how people actually lose Bitcoin,” the defence against a physical attack described keeping your real coins behind a passphrase that “lives nowhere but in your head.” That contradicted the rest of this guide, which says — correctly, on the ladder, in the inheritance lesson, on your checklist and in your plan — that a passphrase living only in your memory is the single most documented way people lose passphrase-protected Bitcoin. It also contradicted the same page four items earlier, where “I’ll just remember it” is listed as a way Bitcoin gets lost. The decoy-wallet idea is sound and it stays: your recovery words alone open a small believable stash, while the real coins sit behind a passphrase. What changed is where that passphrase lives — backed up as carefully as the seed, and stored somewhere the seed is not. That still defeats a searcher who finds your words, and it does not lose your family the coins when you are gone. In the same pass, the “run your own node” lesson was missing the air-gapped-signing section its heading promised — the wrong text had been pasted under it — so the explanation of signing by QR code or memory card, and of what a PSBT actually is, is back where it belongs.',
  },
  {
    date: '2026-07-29',
    type: 'content',
    title: 'The course now opens with twelve rules — and every lesson teaches one of them',
    detail: 'The guide used to have a “core principles” page sitting fifth in the first level, listing ten rules that each linked out to the page explaining them. Seven of those ten links jumped forward to lessons you had not reached yet, so the one page meant to hold the guide together was also the page most likely to scatter you across it. It has been rebuilt as the opposite. “The twelve rules” is now the very first thing you read, it is one plain numbered list, and it carries no outbound links at all — each rule simply names the level and lesson that expands it, so nothing pulls you out of order. Read it once and you have the whole guide in two minutes; everything after it is a single rule in full. Every lesson from there on opens by naming its numbered rule, linking back to the rules page you have already read. Each rule is now written as either a plain statement you can remember (“Not your keys, not your coins”) or a direct instruction (“Every time you receive Bitcoin, generate a new address”) — anything that was merely a true observation was cut or rewritten, and rules that said the same thing twice were merged. Two genuinely new ones earned their place: buy your hardware wallet new and direct from the maker and set it up yourself, and the one that beats the most common real attack there is — if someone requires your seed words for any reason, they are trying to steal your Bitcoin. Alongside that, the lessons themselves were consolidated. Hot vs cold storage folded into “What Bitcoin keys are” (what hot and cold mean) and the ladder (how much money belongs at each temperature). “The wrong-network trap” merged into “Send Bitcoin safely,” because choosing the right network is part of sending, not a separate skill. “Protect your privacy” and “Physical safety” became one lesson: both were telling the same story — a public ledger, plus an ID check that leaks, puts your name and your holdings in one file, and that file becomes a target list — and both had been printing the same 2020 breach of 270,000 customer records as their centrepiece. And the inheritance guide, by far the longest page here, split into the problem (why Bitcoin does not inherit like money) and the fix (building a Recovery Kit). Every lesson also moved to a clearer web address under /learn/, and every old address redirects, so nothing you have bookmarked breaks.',
  },
  {
    date: '2026-07-28',
    type: 'feature',
    title: 'Learn is now a course — five numbered levels, and every lesson points to the next',
    detail: 'The twelve how-to guides used to sit behind a single “How-to guides” menu item: no visible order, and no way to tell there was a whole second body of learning material inside. So they have been regrouped — not by format, but by level. Open “Learn” now and you see all 17 lessons at once, arranged as 101 Foundations, 102 Your setup, 103 The build, 104 The long haul, and 201 Under the hood (optional). Nothing is hidden behind a category you have to open first. Four guides also moved to where they actually belong: “hot vs cold storage” and “when the exchange blows up” are foundational ideas, so they now sit in 101 beside “how your Bitcoin works”, and “how to choose a hardware wallet” sits in 102 next to the ladder — they had only ever been filed as how-tos because of the web address they live at. The bigger change is that every lesson now ends by pointing at the next one, with its level and position (“103 The build · lesson 1 of 4”), so you can read the whole course start to finish without going back to the menu. “Start here” lays out the same five levels with a line on why each comes where it does, and if you would rather scan one flat list, every lesson is still on a single page. Nothing was removed and no web address changed.',
  },
  {
    date: '2026-07-28',
    type: 'feature',
    title: 'The guide is reorganised — learn first, then act, and your checklist is now built for you',
    detail: 'The biggest structural change since launch. The site had grown three separate ways to work out which setup you needed, which was confusing — and the configuration ladder, the idea the whole guide rests on, was filed as a tool rather than as something to learn. So the menu now leads with “Learn”: a proper syllabus of six chapters that build on each other, from what a Bitcoin key actually is, through how people really lose Bitcoin, to the ladder of real setups. “Start here” moved into it as chapter zero — the whole guide mapped out in the order it makes sense, with nothing to decide yet. “Take action” is now one straight line: take the quiz, get your plan, work your checklist. The quiz is the single place that tells you where you belong; the “where am I on the ladder?” tool moved to your plan page, where it makes more sense — for re-checking yourself when your situation changes. “Research” was renamed “Hardware & services,” which is what it actually is. And the checklist is now built from your plan: it hides every step that doesn’t apply to you, names the hardware you own, tracks your progress, and highlights one clear next action so you always know what to do next. Eleven new steps were added along the way — including backing up your passphrase separately from your seed (the most documented way passphrase users lose their coins), backing up a multisig descriptor, and confirming you could still recover without your collaborative-custody service. Nothing was removed: every page is still here at the same web address, and any checklist progress you had already saved is untouched.',
  },
  {
    date: '2026-07-22',
    type: 'security',
    title: 'New: our published selection standard — every wallet now rated in three tiers',
    detail: 'The biggest editorial change since launch. The guide no longer pretends every device is equal: a new “Our selection standard” page (/standard) publishes the bar we hold every hardware wallet to, and every device now carries a tier. Two separate judgements: a hard security floor (your keys can never leave over the internet; the firmware must be verifiable, not a closed black box) and savings-grade criteria (Bitcoin-only firmware available; a minimal single-purpose signer; self-sovereign, portable recovery). That yields three tiers — “Built for cold storage” (8 devices we’d trust with long-term savings), “Built for spending” (Bitkey and the Foundation Passport Prime: secure and genuinely good for active use, but with extra surface or company-dependence we wouldn’t want on a decade-long vault), and “Doesn’t clear our bar” (the Ledger Nano family: its closed firmware proved, via 2023’s Recover service, that it can ship your seed off the device over the internet — so your safety reduces to trusting an unauditable black box). Every device is still covered in full, with the reasoning spelled out; the comparison page, quiz, and how-to guides now all reflect the tiers.',
  },
  {
    date: '2026-07-20',
    type: 'content',
    title: 'Sharper risk defenses + a quick way back to your plan',
    detail: 'On “how people lose Bitcoin,” the physical-attack defense now covers the passphrase / decoy-wallet trick (your recovery words alone open only a believable decoy, while the real coins sit behind a passphrase in your head) — the “in your head” part was wrong and was corrected on 30 July 2026, see that entry — and the exchange-failure defense now points you at reputable Bitcoin-only services (River, Swan, Strike) rather than multi-coin “crypto casinos.” And on the wallet comparison, once you add a device to your plan you’ll see a “↩ back to your plan” link so you can jump straight back.',
  },
  {
    date: '2026-07-20',
    type: 'feature',
    title: 'Your recommended wallets follow you to the comparison page',
    detail: 'When the quiz recommends specific hardware wallets for your setup, those recommendations now stick: your plan’s empty key slots suggest them by name, and over on the wallet comparison page the recommended devices are flagged “★ Recommended for your plan” so they’re easy to spot and add. The “My plan” page was also cleaned up — “where you are” (your current setup, ladder rung, and the wallets you own, shown read-only with a tuck-away editor) and “your saved plan” (the setup you’re building, with its wallet slots) are now two clearly separated, equal sections.',
  },
  {
    date: '2026-07-20',
    type: 'feature',
    title: 'The tools now talk to each other — and a clearer menu',
    detail: 'Everything you do across the site now flows into one plan, and back out again. Mark a wallet you own on the comparison page, pick a custodian, or place yourself on the ladder, and the quiz will greet you with “welcome back” and prefill what you’ve already told it — so it feels like the site is keeping track (it is, entirely in your browser). A quick banner on the wallet and custodian pages shows what’s noted and links to your plan. The menu was also reorganized into four clearer groups — Take action, Learn, Research, and About.',
  },
  {
    date: '2026-07-20',
    type: 'feature',
    title: 'New: compare collaborative custody services — honestly',
    detail: 'A new “Compare custodians” page puts the six Bitcoin-only collaborative-custody services (Unchained, Nunchuk, Swan Vault, AnchorWatch, Bitkey, The Bitcoin Adviser) side by side — the same honest, no-affiliate treatment as the wallet comparison. Each is scored on the questions that matter: no-KYC, whether you can recover your coins on your own if they vanish (open-source recovery — the most important one), insurance, fees, and minimums. Facts verified against each provider’s own site plus independent sources. And if the quiz points you to collaborative custody, your plan now has a “service key” slot: pick your custodian right from the comparison and it slots into your roadmap alongside the two keys you hold.',
  },
  {
    date: '2026-07-20',
    type: 'feature',
    title: 'Rework the devices in your plan · encrypt your plan file · a slimmer page',
    detail: 'Your plan’s key slots are now fully editable on “My plan”: take a wallet out of a slot, add one you own, or swap them — extra wallets you own sit off to the side as spare (with a Retire option), and “Rework devices” takes you to the comparison page to add more. You can also now download your plan as a password-encrypted file (click “Encrypt & download,” choose a password — the file is unreadable without it; there’s no recovery, and it holds no seed words). The “Save to Nostr” button now says “Save to Nostr (encrypted)” to be clear it’s private, and once you’re signed in to Nostr the long explainer collapses so the page stays lean.',
  },
  {
    date: '2026-07-20',
    type: 'feature',
    title: 'Your plan now knows which wallets you own — and maps the road to your setup',
    detail: 'If your current setup already involves hardware, the quiz now has a quick optional step to note which wallet(s) you own — pick make then model from a full list (older and discontinued models included), add as many as you have, or choose “I’d rather not say.” Your plan turns that into a roadmap: on “My plan” you’ll see where you are now, the setup you’re aiming for, and exactly how many keys it needs — with the wallets you own already filling those slots and only what’s left showing as a short “still to get” list. You can also tap “I own this” or “Add to my plan” on any device on the Compare page, and it all flows into the same plan. As always: nothing is saved unless you choose to save it.',
  },
  {
    date: '2026-07-20',
    type: 'feature',
    title: 'Nostr sign-in now survives your return — fixed the failed save on a second visit',
    detail: 'If you signed in with a bunker (like Amber), came back later, and tried to save, it failed — the site was redialing your signer as a stranger with an already-used invite. Now it remembers the exact connection your signer approved and resumes it, so a return visit just saves (your signer still approves every request). Also: when a signer refuses, you now see its actual reason instead of a generic error. Verified end-to-end with a real signer on the live site — save and restore both round-trip.',
  },
  {
    date: '2026-07-19',
    type: 'security',
    title: 'Nostr save now hides which app it came from',
    detail: 'When you save your plan to Nostr, we now store it under a scrambled tag derived from your own key instead of a plain “bitcoinkeys.guide” label — so no one can scan the relays to build a list of this guide’s users. The contents were already encrypted; this closes the last bit of metadata that advertised the app. (Your key still signs the event, so someone who already has your public key could confirm it — use a key you’re comfortable associating with self-custody, or just keep a downloaded file, which shares nothing.)',
  },
  {
    date: '2026-07-19',
    type: 'feature',
    title: 'The quiz now starts from where you are — your plan as a journey',
    detail: 'The quiz asks about your current setup (on an exchange, one hardware wallet, a passphrase, multisig…), then frames the recommendation as a path from there: whether you’re one step away, a few steps, already exactly where you should be, or even a little ahead of what your situation needs. It’s encouraging about wherever you are and never tells you to downgrade — a destination only means something once you know your starting point.',
  },
  {
    date: '2026-07-19',
    type: 'feature',
    title: 'BIP-85 demo: type any index and watch its wallet appear',
    detail: 'The “one seed to rule them all” demonstration now lets you type any child number — 5, 7, 500 — and it derives that wallet’s 12 words on the spot. Ask for the same number twice and it shows you the words are identical: the whole point of BIP-85, that you back up one master and re-derive any child, on demand, forever.',
  },
  {
    date: '2026-07-19',
    type: 'feature',
    title: 'Save to Nostr sits right beside “download my plan” — and remembers you',
    detail: 'Saving your plan to your own Nostr is now one of the options in the same place as the file download — no hunting for a separate section. If you’re not signed in yet it drops you to where you connect your signer; once you are, it just saves. Your profile picture shows top-right like a login (click it to open your plan or sign out), and when you’re signed out that spot offers a sign-in. It stays encrypted to your key; a downloaded file is still the most private option, and Nostr never sees your key or your plan.',
  },
  {
    date: '2026-07-19',
    type: 'feature',
    title: 'The quiz now leans toward self-sovereignty — no funnel to services',
    detail: 'Added a question about how you feel about a company ever holding one of your keys, and changed the multisig outcome: instead of routing you to collaborative custody, the quiz now presents two equal paths — do-it-yourself self-sovereign multisig vs. collaborative custody — each with its honest trade-off (full responsibility vs. trusting an outside institution and its privacy cost). Self-custody leads by default; a service only leads if you explicitly ask for that help. Where heirs are involved, the DIY path notes that a fully self-custodied inheritance plan is achievable, no company in the loop.',
  },
  {
    date: '2026-07-19',
    type: 'price',
    title: 'Trezor Safe 3 dropped $79 → $59',
    detail: 'Trezor cut the Safe 3’s price from $79 to $59 — a permanent reduction, verified on trezor.io. That makes the budget Trezor an even stronger first hardware wallet, and lowers the entry cost of a single-signature setup on the ladder to $59. Jade Plus ($169) and BitBox02 ($137) were re-checked at the same time and are unchanged.',
  },
  {
    date: '2026-07-18',
    type: 'feature',
    title: 'The interactive “deeper dive” tier grew to 11 demonstrations',
    detail: 'Added five hands-on demos: the four address formats, one seed’s address tree (and the watch-only xpub), splitting a backup with Shamir/SLIP-39, why a key can’t be guessed (2²⁵⁶), and how the checksum catches a typo. Each runs entirely in your browser on a throwaway seed — never your real one.',
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
