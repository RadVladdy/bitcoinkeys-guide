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
    date: '2026-07-31',
    type: 'content',
    title: 'After you choose a setup, the next step is your plan again — not the checklist',
    detail: 'There are three steps here and the site had flattened the middle one. You choose a setup, then you build that plan out — which hardware fills it, whether anything you already own clears our bar, and for a collaborative setup who holds the service key — and only then do you work the checklist. Yesterday’s change moved the hardware decisions off your plan entirely and onto the checklist, which was one page too far: the checklist is for doing the thing, and it can only name your devices if the plan already knows them. So the wallet slots, the recommendations and the verdict on hardware you already own are back on your plan, where you are choosing. Choosing a setup stays a clean single decision with no device talk in it. And the big button on the result page no longer sends you past your plan to a checklist that has nothing to trim yet — after you save, it points at your plan; before you save, it isn’t there at all, because the thing to do first is save. The plan card also stopped congratulating you on a full set of slots when one of them holds a device we would move you off: it now says which one, and why, while leaving the choice to you.',
  },
  {
    date: '2026-07-30',
    type: 'content',
    title: 'Choosing a setup and choosing hardware are now two separate steps',
    detail: 'Your plan page was asking you to pick hardware and judging the hardware you already own, at a point where neither decision was in front of you. Those have moved. Your plan now describes the setup you chose and what it takes — one hardware wallet, or three from different makers, or two of your own plus a service key — and for a collaborative setup it asks who holds that service key, because which service you run with is part of which setup you are running. Everything about which device fills it now happens on your checklist, where you are actually doing it: which model to get, and whether something you already own clears our bar or is worth replacing. The result is that you are never told to consider upgrading a device at a moment when you are only trying to decide what kind of setup you want.',
  },
  {
    date: '2026-07-30',
    type: 'content',
    title: 'Fixed: a saved step-up was named after the action, not the setup — and your plan said the same thing three times',
    detail: 'If you saved the second choice, your plan came back reading "Plan: Add a passphrase" — an instruction where a plan should carry a setup name, and it ran straight into the wallet count, which made the line hard to parse at all. Two causes, both fixed. The step-up card was headed with its action ("Add a passphrase") while the first choice was headed with a setup ("Single-signature cold storage"), so the two were not comparable side by side; the step-up now leads with the setup it produces — single-sig plus a passphrase — with the action underneath it. And the plan itself now saves the setup name rather than the heading. Separately, a plan with an unchosen wallet was giving the same instruction three times: once on the empty slot, once in a line underneath the slots, and once again under "your next step", each with its own link to the same page — and the line underneath the slots still called hardware wallets keys. The slots now show the state, and "your next step" gives the instruction, once. On a multisig plan the different-makers advice was likewise printed twice, word for word; it is said once now, where the instruction is.',
  },
  {
    date: '2026-07-30',
    type: 'content',
    title: 'The lowest setup we recommend is now cold storage, not a phone wallet',
    detail: 'If you told the setup finder that losing this Bitcoin wouldn’t change your life, it used to recommend keeping a small amount in a non-custodial phone wallet and graduating to a hardware wallet later. That has changed. The lowest setup this guide recommends is now single-signature cold storage for everybody, and low stakes change the budget rather than the setup. Two reasons. A phone wallet really is self-custody, so the objection was never custody — it is temperature: the rule this whole guide rests on is that savings do not live on an internet-connected device, and it was odd to publish a standard for eleven cold devices and then point the least experienced reader somewhere else. And "graduate later" puts the single riskiest thing a holder ever does, moving a wallet, in front of the person least equipped for it. Cold storage starts at the price of the Trezor Safe 3, which is less than the spread on a lot of first Bitcoin purchases, and the cheap devices in our cold-storage tier do the same job as the ones costing four times as much. None of this changes what the guide says about phone wallets for money you are actually spending — a hot wallet for walking-around money is still exactly right, and the lesson on hot and cold says so.',
  },
  {
    date: '2026-07-30',
    type: 'content',
    title: 'The checklist now tells you when it isn’t yours yet',
    detail: 'If you have chosen a setup but not yet picked the hardware for it, the checklist page used to look exactly like a finished, personalised one. It now says plainly that your plan is not finished, names what is missing — a hardware wallet, two more of them, a collaborative custodian — and points you back at the step that closes it. The page is not blocked and never will be: the first steps on it are how to get the hardware a finished plan would name, and reading ahead is reasonable. What it no longer does is dress the full list of everything up as a list built for you. Once the plan is complete it trims to just your steps and says so, exactly as before.',
  },
  {
    date: '2026-07-30',
    type: 'content',
    title: 'Your plan now says what to do next, instead of announcing a checklist that isn’t ready',
    detail: 'A saved plan with no hardware wallet chosen was still telling you "your checklist is ready — 16 steps", which was backwards: the first thing that checklist would have said is to go and choose the device you had not chosen. The next step is now whatever is actually next. No wallet picked yet and it says choose your hardware wallet, and explains that your checklist gets built around that exact device once you have. Multisig with one of three chosen says choose two more, and mentions that different makers is the point. A collaborative plan with its own wallets set says the last piece is who holds the service key. The page also stopped talking about keys where it meant hardware wallets — "needs 1 key" and "1 more key to add" now say what they mean, and the slots read Wallet 1, Wallet 2 rather than Key 1, Key 2. The only place that still says key is the collaborative service key, which genuinely is one and is not a device you buy. "Rework devices" no longer appears when there are no devices to rework, and the link out to a rung walkthrough has left the top of your plan, where it was a detour at the moment you most wanted a next step.',
  },
  {
    date: '2026-07-30',
    type: 'content',
    title: 'Fixed: saving one recommendation marked both of them as your plan',
    detail: 'When the setup finder gave you a first and a second choice, saving either one put a green "this is your saved plan" tick on both. Only one was actually saved — the page was deciding which band to mark by comparing the rung each recommendation lands on, and two different recommendations can honestly land on the same rung. Starting simple on a phone and graduating to cold storage, and going straight to cold storage, are both single-signature setups; they differ in where you begin, not in where you end up. The page now matches on which recommendation you actually saved. In the same pass, the wording after you save puts your plan first and the checklist second, which is the order they happen in — and before you save, the page no longer offers you a checklist, because until there is a plan the checklist is just the full list of everything, which is not yours in any meaningful sense.',
  },
  {
    date: '2026-07-30',
    type: 'feature',
    title: 'Clearing your plan no longer forgets everything else — and a footer you can read',
    detail: 'There was one button, and it deleted the lot: the setup you chose, your checklist progress, every answer you had given, and the list of hardware you own. Those are not the same thing. What you own is a fact about you — you can mark devices on the comparison page without ever opening the setup finder — and your answers are what your setup was derived from. So there are now two actions and they do what they say. "Clear my plan" clears the setup you chose and the checklist progress under it, and keeps your answers and your hardware, so you can pick a different setup without starting over. "Forget everything" removes all of it, and says so rather than hiding behind a gentler label. Starting the finder fresh now also clears a stale setup, because re-answering the questions while the old answer sits saved made no sense. Separately, the footer has been rebuilt. It had been listing all seventeen lessons in one narrow column beside three columns of three links, which crushed the lesson titles into two-word lines and made the thing a thousand pixels taller than it needed to be. It now lists the five levels instead — every lesson is one click away in the menu on every page, so the footer was carrying a second copy of something you already had — and the glossary and further reading get a column of their own instead of hiding under Learn.',
  },
  {
    date: '2026-07-30',
    type: 'feature',
    title: 'The guide now checks whether the hardware you own actually meets the standard — and how to pick a metal backup',
    detail: 'Tell the setup finder you own a Ledger and, until now, it recommended two other devices without ever mentioning yours, and your checklist said "get a real hardware wallet" underneath the name of the one you have. That is fixed everywhere. The result page now names what you own and says plainly whether it clears our bar, why, and that you are not obliged to replace it. Your plan shows a verdict beside every device — clears our bar, built for spending, doesn\u2019t clear our bar, or simply not rated by us, because most models never have been and pretending otherwise would be inventing a judgement. And the checklist stops telling you to buy hardware you already have: own something that clears the bar and the step disappears, own something we would move away from and it becomes "consider upgrading", with the reason. If that device is the one you deliberately chose, it drops to the end as a note rather than blocking a build you already decided on. Two other things came out of the same pass. The checklist was being generated in two places, which is why the one on the checklist page looked generic next to the one on your results; there is now one, on the page called checklist. And "back up the seed on metal" has become "write it on paper, check it, then move it to metal", because nobody has a steel plate on the day they set up a wallet and the lesson never said they should. Which exposed a real gap: this guide rates eleven hardware wallets against a published standard and then said "move it to metal" without a word on which metal. There is now a section on choosing one — what actually matters (punched or stamped rather than engraved, one solid plate rather than loose tiles, stainless being genuinely enough, no proprietary format) and five that survive independent stress testing, with prices as bands rather than figures because we do not track them the way we track wallet prices. We did not run those tests ourselves and we say so: they are fire, acid and a twenty-ton press, Jameson Lopp has run them on seventy-five devices, and the criteria are ours while every verdict is his.',
  },
  {
    date: '2026-07-30',
    type: 'content',
    title: 'Rewritten: what a “wallet” actually is, and the one-way chain behind it',
    detail: 'The lesson on Bitcoin keys used to define a wallet as “a configuration of keys” — and it did so before it had explained what public and private keys are. Both halves of that were wrong. A configuration of keys answers what it takes to move your coins; it never answers which coins are yours. So the page now runs in the order the ideas actually depend on each other. First the chain: your private key produces a public key, which produces an address, and each step runs one way only — nobody can work backwards from an address to a public key, or from a public key to a private key. That is why handing out an address costs you nothing, and it is arithmetic rather than a promise anyone is making. Then the wallet, defined as the answer to two questions: which coins are mine, and what does it take to move them. The first is the extended public key — the xpub — which lets software find every address you will ever receive at and add up your balance without being able to spend anything. The second is whether one key signs, or a key plus a passphrase, or several keys where a few must agree. Both together are the wallet, and written out as one line that is a wallet descriptor. And a caution that follows from it, which was nowhere on the site before. Nothing below your private key can spend your coins — but that is not the same as harmless, because everything below it is public and permanent, and whatever can be linked together eventually is. Handing out an address is normal and costs you nothing in coins. Handing out an xpub is different: it still cannot spend, but it reveals every address in that wallet, past and future, so anyone holding it can see your whole balance and history. Finally, the explanation of why a hardware wallet is called a signing device rather than storage moved down beside the section on signing, where it belongs.',
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
