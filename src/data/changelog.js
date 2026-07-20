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
