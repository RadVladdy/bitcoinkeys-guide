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
    date: '2026-07-19',
    type: 'feature',
    title: 'Save to Nostr sits right beside “download my plan” — and remembers you',
    detail: 'Saving your plan to your own Nostr is now one of the options in the same place as the file download — no hunting for a separate section. The button drops you straight to where you connect your signer, and once you’re signed in your profile picture shows top-right like a login, so a return visit knows it’s you. It stays encrypted to your key; a downloaded file is still the most private option, and Nostr never sees your key or your plan.',
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
