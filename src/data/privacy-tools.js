// The optional privacy layer — PayJoin, Silent Payments, CoinJoin.
//
// WHY THESE ARE PAGES AND NOT A LESSON SECTION. They lived as four paragraphs at
// the end of /learn/run-a-node, under a heading that called them optional. That
// was the right size while they were a footnote to running a node, and it stopped
// being the right size once two of the three changed materially in 2026: PayJoin
// got an asynchronous, serverless version that removes the always-on server the
// old advice was built around, and Silent Payments became receivable to an
// airgapped hardware wallet. Neither of those fits in a sentence, and both change
// what we would tell a reader to do.
//
// THE ORDER IS THE ARGUMENT, and it is the same one the rest of the site runs on:
// least cost first. PayJoin costs a reader nothing and helps everyone slightly;
// Silent Payments costs nothing and solves one specific problem completely;
// CoinJoin costs money, time, discipline and some legal uncertainty, and helps
// only the readers whose situation justifies all four. Ordering them by how
// interesting they are would put CoinJoin first and quietly recommend it.
//
// WE NAME SOFTWARE AND WE DO NOT LINK TO IT. Naming the wallet that shipped a
// feature is how a reader checks the claim; linking out to it would make these
// pages behave like the Hardware & services shelf, where every page sends the
// reader somewhere to buy or sign up. These teach and hand the reader back.
//
// EVERY DATED FACT BELOW ROTS, which is why they are here rather than typed into
// four pages. Wallet support is the fastest-moving of them: this cluster's whole
// premise is that the picture changed inside one year, so it will change again.

/** ISO date every claim on the cluster was last checked against its own source. */
export const privacyToolsVerified = '2026-08-05';

// The framing the hub states once and the three pages inherit. It is here rather
// than repeated because "this layer is optional and the free habits do more" is a
// stance, and a stance typed on four surfaces is a stance that drifts on three.
export const privacyPremise = {
  doesMost: 'a fresh receiving address every single time, and never being publicly known as a holder',
  optional: 'You are not behind if you skip all of this.',
  // The honest ceiling on the whole layer, stated on the hub so no individual page
  // has to carry the disclaimer alone — and so none of them can imply more.
  cannotFix: [
    'The history you already have. Every one of these protects you forwards, never backwards.',
    'The identity checks attached to coins you bought on an exchange. That record exists off the chain and stays there.',
    'Anything already leaked by other means — a screenshot, a conversation, a breach at a company you handed your address to.',
  ],
};

export const privacyTools = [
  {
    slug: 'payjoin',
    name: 'PayJoin',
    // The hub card. One clause each, deliberately: the hub's job is to let a
    // reader rule two of these out without opening them.
    oneLine: 'An ordinary-looking payment that quietly breaks the analyst’s core assumption.',
    fixes: 'The assumption that everything paying into one transaction belongs to one person.',
    forWho: 'Anyone spending on-chain, whenever the other side offers it.',
    cost: 'Almost nothing — a slightly bigger transaction fee, and a few seconds.',
    verdict: 'Turn it on if your wallet has it.',
    spec: 'BIP-78 (2020), superseded by BIP-77 (2025)',

    h1: 'PayJoin — the ordinary-looking payment that misleads the analyst',
    lead: 'Almost all chain analysis rests on one assumption: everything paying into a transaction belongs to one person. A PayJoin makes that assumption wrong, inside a payment that looks like every other payment. It costs you close to nothing. It also does less for you personally than you might expect, and that turns out to be the interesting part.',
    diagram: {
      name: 'payjoin',
      caption: 'A PayJoin is a normal payment with one extra input — contributed by the person being paid. The two inputs are not owned by the same person, and nothing on the chain says so.',
    },

    layers: [
      {
        h: 'What is actually happening',
        body: `<p>When a Bitcoin transaction spends several coins at once, whoever is watching the chain assumes those coins had one owner. That assumption is usually right — it is your wallet, gathering up enough of your own coins to cover what you are sending — and being usually right is exactly what makes it useful. It is the backbone of the software that groups addresses into “this is one person.”</p>
<p><strong>A PayJoin is a payment where the person you are paying quietly adds a coin of their own to it.</strong> You build the payment the way you always would. Before it is broadcast, the seller adds one of their own coins as a second input and increases the amount going to themselves by exactly that much. You pay what you agreed to pay. They receive what they agreed to receive. Nobody is out of pocket, and the coin they added has simply gone from one of their pockets to another.</p>
<p>What has changed is the transaction now has two inputs owned by two different people — and there is no marker on the chain saying so. To anyone applying the assumption, it reads as one person spending two of their own coins. It is wrong, and it has no way of knowing it is wrong.</p>
<p><strong>Neither side can be cheated, because neither side signs the other’s coin.</strong> The seller signs only their input; you sign only yours, and your wallet re-checks the finished transaction before you do — the amount, the destination, the change coming back. If any of it changed, you do not sign. This is the same partial-signing machinery a multisig setup uses.</p>`,
      },
      {
        h: 'What else you could do — including what we would not bother with',
        body: `<p><strong>Nothing at all.</strong> A completely reasonable answer, and the one most readers should take. This is a small effect on top of habits that matter far more.</p>
<p><strong>Seek out sellers who offer it.</strong> We would not. Reorganising who you buy from around a marginal per-payment gain is a lot of effort in exchange for very little, and it is the kind of advice that makes privacy sound exhausting.</p>
<p><strong>Run a permanently-online server so people can PayJoin <em>you</em>.</strong> This was the standard advice for years, and it is the single reason almost nobody did it — the receiving side had to host something and be awake at the moment of payment. That requirement is gone (see below). Unless you are actually taking payments from the public, the receiving half was never the interesting one for you anyway.</p>
<p><strong>Treat it as your privacy answer.</strong> This is the one we would warn you off. A PayJoin does not fix a reused address, does not touch what an exchange already knows about you, and on its own barely moves your own picture. A reader who does this and considers the job done has swapped a real habit for a setting.</p>
<p><strong>Use Lightning instead for small, frequent payments.</strong> Often the better tool, with quite different privacy properties. It is not a replacement for on-chain payments; it is a replacement for making a lot of them.</p>`,
      },
      {
        h: 'What we would do',
        body: `<p><strong>If your wallet has the setting, turn it on. That is the whole job.</strong> Where it is offered, your wallet uses it; where it is not, your payment goes out as an ordinary payment and nothing is lost. There is no ongoing decision to make and nothing to maintain.</p>
<p><strong>If you take Bitcoin payments yourself, enable it on your payment server.</strong> That is where most of the sellers who support it come from today.</p>
<p><strong>And understand what you are actually buying, because it is unusual.</strong> The gain from any single PayJoin is small for you and permanent for everyone. Each one is a transaction where the analyst’s central assumption produced a wrong answer, and they cannot tell which transactions those were — so as more payments work this way, the error rate in <em>all</em> their grouping rises, including for people who have never done this. At a handful of a percent it is absorbed as noise. Well above that, the assumption stops being dependable at all.</p>
<p>That makes this the one tool on this site whose point is other people. We think it is worth a click for that reason, and we would rather say so plainly than oversell what it does for you.</p>`,
      },
    ],

    // The status block. Each fact is here because it changed recently enough that
    // an older guide is wrong about it.
    statusH: 'Where this stands',
    status: [
      'The original design (BIP-78, 2020) needed the receiver to run a server and be online at the moment of payment. That was the barrier, and it held adoption down for five years.',
      'Its replacement (BIP-77) was merged in 2025 and is now the recommended approach. The two wallets pass the half-built transaction through an untrusted directory instead, so neither side runs a server and neither has to be online at the same time.',
      'That directory cannot read what passes through it: the contents are encrypted end to end, and the network addresses of both parties are hidden from it as well.',
      'Bull Bitcoin’s mobile wallet shipped the first commercial send-and-receive implementation in 2026 — the evidence that the new design is deployable and not merely written down.',
      'BTCPay Server has supported the older version for years and is still where most PayJoin-capable sellers come from.',
      'Whether the negotiation leaves a recognisable fingerprint is an open research question. The effect is thought to be modest; it is not zero.',
    ],
  },

  {
    slug: 'silent-payments',
    name: 'Silent Payments',
    oneLine: 'One address you can publish anywhere, which is never actually reused.',
    fixes: 'Needing a payment address in public — the one habit this guide asks you not to have.',
    forWho: 'Anyone who genuinely needs to publish an address.',
    cost: 'Nothing, if your wallet supports it. Your wallet does more work; you do none.',
    verdict: 'The right answer if you need a public address.',
    spec: 'BIP-352, finalised 2023–2024',

    h1: 'Silent Payments — one address you can publish, that is never reused',
    lead: 'This guide asks you to use a fresh receiving address every time, and never to post a fixed one in public. That advice has always had a hole in it, and it is a real one: some people genuinely need a public address. A creator taking tips. A business taking payments. Anyone being paid back next month by a friend who is not going to ask first. Silent Payments closes the hole — and in 2026 it became something we can point a cold-storage holder at.',
    diagram: {
      name: 'silent-payments',
      caption: 'You publish one code. Every sender’s wallet turns it into a different address that only you can find and spend, and nothing on the chain links those addresses to each other.',
    },

    layers: [
      {
        h: 'How one address becomes many',
        body: `<p>You publish a single code — a string starting <code>sp1</code>. It is not an address and nothing is ever paid to it directly, which is the part worth holding on to.</p>
<p><strong>When someone pays you, their wallet does a calculation between the coins they are spending and your published code, and that calculation produces a brand-new address.</strong> It is the same trick that lets two people who have never met agree on a shared secret in the open: your code and their coins each contain half of what is needed, and only the two of them together produce the answer. The sender can work out the address to pay. Only you can recognise it afterwards, and only you can spend from it.</p>
<p>Two people paying the same published code produce two entirely unrelated addresses. So does the same person paying you twice. On the chain there is nothing tying them together and nothing tying any of them to the code you published.</p>
<p><strong>The cost lands on your side, and it is the honest catch.</strong> Because no address was ever handed out, your wallet has to check every block to find out whether anything in it was meant for you — one cheap test per transaction, done for every transaction there is. A wallet doing this itself needs to be running and connected to a node. A wallet that hands the job to a server does not.</p>
<p>What ends up on the chain is an ordinary payment of the most common modern type. There is no badge on it saying a silent payment happened.</p>`,
      },
      {
        h: 'The alternatives, and which of them are mistakes',
        body: `<p><strong>Publish one plain address and reuse it.</strong> This is what most people do, and it is the single worst on-chain privacy habit there is. Every payment anyone has ever made you lands in one visible pile, with your running balance attached, permanently, for anyone who has ever seen that address. The course gives the habit that prevents it a rule of its own, in the privacy lesson.</p>
<p><strong>Hand out a fresh address each time.</strong> Correct, free, and what the course teaches — and it works perfectly whenever you are in a conversation with the person paying you. What it cannot do is cover a tip jar, a subscription, a donation page, or being paid back at some unspecified point in the future. Those are the cases this page is about.</p>
<p><strong>Payment codes, the earlier attempt at this.</strong> They worked, but starting a payment relationship required an extra transaction announcing that it was starting — so while the payments themselves were private, the fact that you and I were about to transact was written on the chain in plain sight. Its main wallet was seized in 2024 and it lost its user base with it. We would not begin here today.</p>
<p><strong>Take tips over Lightning instead.</strong> Genuinely a good answer for small amounts, and the one we use on our own tip page. It is a different set of trade-offs rather than a substitute — Lightning is for lots of small payments, not for receiving savings.</p>
<p><strong>Let a service do the block-scanning for you.</strong> This is a real trade rather than an error, and it is what most wallets do by default. The server doing the scanning learns which payments are yours — not your keys, not your coins, but exactly the fact you came here to protect. Reasonable for a tip jar. Not what you want standing behind your savings.</p>`,
      },
      {
        h: 'What we would do',
        body: `<p><strong>If you do not need a public address, you do not need this.</strong> The habit the course already teaches — a fresh address each time — covers you completely. Nothing here is an upgrade on that; it is a fix for the case where that habit cannot be applied.</p>
<p><strong>If you do need one, use this, and 2026 is the year that got straightforward.</strong> Sparrow can send to a silent payment address and can receive to one, including with an airgapped hardware wallet holding the keys. That last part is the change that matters for readers of this guide: money sent to a code you published in public can land directly in cold storage, without a hot wallet standing in the middle of it. Cake Wallet has had both halves since 2024.</p>
<p><strong>Scan with your own node if the amounts matter to you.</strong> The convenient default hands a server the one fact you are trying to keep, and swapping it for your own node is a settings change, not a project. If you are already running one — the lesson on running your own node walks through it — you have what you need.</p>
<p><strong>Know the two limits, because they are easy to miss.</strong> It protects you going forward and does nothing about addresses you have already published. And it protects <em>you</em>, the receiver: the coins the sender used are grouped exactly as they were before, so this does nothing for their privacy, and nothing for yours when you are the one paying.</p>`,
      },
    ],

    statusH: 'Where this stands',
    status: [
      'Sparrow shipped sending in February 2026 and receiving in May 2026, including to airgapped hardware signers — the first major desktop wallet to carry both halves.',
      'Sparrow’s receiving hands block-scanning to a scanning server by default. Pointing it at your own node instead is a setting.',
      'Cake Wallet has supported sending and receiving since 2024.',
      'It is still a minority of wallets, and that is the real constraint on using it. It is also the thing moving fastest of anything on this page.',
      'Work is under way to bring it to merchant payment servers, which is what would make published business addresses ordinary.',
    ],
  },

  {
    slug: 'coinjoin',
    name: 'CoinJoin',
    oneLine: 'Many people’s coins through one transaction, so no output can be tied to an input.',
    fixes: 'Coins whose history you want to stop travelling with them.',
    forWho: 'A small number of readers with a specific reason. Most likely not you.',
    cost: 'Fees, time, permanent discipline, a visible mark on the coins, and genuine legal uncertainty.',
    verdict: 'Almost certainly not, and here is the honest reason.',
    spec: 'Proposed by Greg Maxwell in 2013',

    h1: 'CoinJoin — the heavy one, and why most readers should leave it alone',
    lead: 'This is the tool people have heard of, and the one this guide is most cautious about. It is the only thing on this site that genuinely separates coins from their past. It is also the only one that costs money, demands a practice rather than a setting, marks the coins permanently, and sits in a legal position nobody can honestly describe as settled. All four of those are true at once, and a page that gives you only two of them is selling you something.',
    diagram: {
      name: 'coinjoin',
      caption: 'Several people’s coins go into one transaction and equal-sized amounts come back out. From outside, no output can be matched to the input it came from.',
    },

    layers: [
      {
        h: 'How it separates a coin from its past',
        body: `<p>A number of people put coins into a single transaction at the same time, and equal-sized amounts come back out to each of them. Because every output is the same size, there is nothing to match them up by. Anyone watching can see the transaction happened and can see who put coins in — what they cannot do is say which output came back to which person, beyond a one-in-however-many guess.</p>
<p><strong>Nobody can take your coins, and this is the property that makes it a real tool rather than a trust exercise.</strong> Each participant signs only their own input, and only after checking that one of those equal outputs pays an address of theirs. Whoever is organising the round can refuse to run it, can stall, and can lie to you about how many of the other participants are also them — but they cannot walk off with anything, because they never hold anything.</p>
<p>What this buys is a break in the chain going forward. Everything before the transaction is still visible and still attached to whatever it was attached to. What stops is the ability to follow those particular coins onward through it.</p>
<p><strong>And it is not subtle.</strong> A transaction with fifteen identical outputs does not look like anything else on the chain. Anyone can tell one happened and can tell you took part; what they lose is the thread afterwards. That visibility is not a side effect to be engineered away — it is a permanent property of the coins that come out, and the reason for most of what follows.</p>`,
      },
      {
        h: 'What to do instead — and the four ways people get this wrong',
        body: `<p><strong>Do not acquire coins tied to your name in the first place.</strong> If buying without an identity check is available where you are, it achieves in advance what mixing tries to achieve afterwards, for less money and with none of the aftermath. This is the option most people consider last, and it is the one we would consider first.</p>
<p><strong>The everyday habits, plus keeping coins from different sources apart.</strong> A fresh address every time, not being publicly known as a holder, and not carelessly combining coins that came from different places. Most of the available benefit, none of the cost. The privacy lesson covers all three.</p>
<p>Then the four mistakes, in the order people make them:</p>
<p><strong>Mixing and then depositing to an exchange.</strong> Several exchanges freeze deposits that have been through one, and you may be asked to account for coins you have deliberately made hard to account for. If you are going to do this at all, work out how the coins come back off the chain <em>before</em> they go on it.</p>
<p><strong>Spending mixed coins alongside unmixed ones.</strong> The moment a later payment combines one of each, the assumption that put them together is the same assumption you just paid to defeat. It re-links them, and it undoes the whole exercise quietly. Mixed coins live in their own wallet, forever, or the money was wasted.</p>
<p><strong>Believing the advertised numbers.</strong> Crowd sizes have been measured by researchers and they came out materially smaller than the figures being marketed. Assume you are hidden among considerably fewer people than the tool claims, and decide whether it is still worth it on that basis.</p>
<p><strong>Expecting it to erase anything.</strong> It does not reach backwards, it does not touch what an exchange recorded when you bought, and it does not remove your name from anywhere it already appears.</p>`,
      },
      {
        h: 'What we would do',
        body: `<p><strong>For almost everyone reading this: not this.</strong> Not because it does not work — it does — but because it is a practice rather than a setting, and a practice half-kept is worse than none: you will have paid the fees, taken the permanent mark, and undone the benefit the first time you spent without thinking. Nothing else on this site asks for ongoing discipline in order not to backfire.</p>
<p><strong>If your situation genuinely calls for it</strong> — your holdings are already publicly attached to your name, you run a business whose counterparties you would rather not have reading your accounts, or being known to hold Bitcoin where you live is a physical risk rather than an inconvenience — then learn it properly before you touch it, plan the way out first, keep what comes out in its own wallet permanently, and expect rougher tools than existed a few years ago.</p>
<p><strong>On the legal position, plainly: we are not lawyers, and nothing here is legal advice.</strong> What we can give you is the record, and the record is below. Nothing in it says that using one of these is an offence. Nothing in it settles the question either — the case that would have tested it ended in guilty pleas before it was argued. If that distinction could matter to you, it is a question for a lawyer where you live, not for a guide on the internet.</p>
<p><strong>What we will not do is tell you it is fine, or tell you it is shady.</strong> It is a tool with a real purpose, whose usefulness has gone down and whose surrounding risk has gone up, and a reader deciding about it deserves both halves of that in one place rather than whichever half the page they landed on preferred.</p>`,
      },
    ],

    statusH: 'The record, as of this page’s date',
    status: [
      'In April 2024 US prosecutors charged the two people behind the Samourai wallet’s mixing service. Both pleaded guilty in July 2025 to running an unlicensed money-transmitting business, and were sentenced that November.',
      'The question the case raised — whether writing and running a tool that never holds anyone’s coins can itself be the offence — was never decided, because the pleas ended the case before it was argued.',
      'Two months after those charges, the company behind Wasabi shut down its coordinator and withdrew from the US market. The software itself is community-maintained and still being released; the newest version landed in June 2026.',
      'JoinMarket was untouched by any of it, because it has no company and no coordinator to charge. It is also much the hardest of these to operate.',
      'Several exchanges freeze deposits of coins that have been through a CoinJoin.',
      'Taken together: it remains available and it is meaningfully harder, rougher and smaller than it was in 2022.',
    ],
  },
];

export const privacyToolCount = privacyTools.length;

export const privacyToolBySlug = Object.fromEntries(
  privacyTools.map((t) => [t.slug, t]),
);

/** The cluster's own route, in one place, so a move is one edit. */
export const privacyToolsHref = '/privacy-tools';

export const privacyToolHref = (slug) => `${privacyToolsHref}/${slug}`;

// ── Data asserts ───────────────────────────────────────────────────────────
//
// THESE ASSERT THE SHAPE AND SAY NOTHING ABOUT THE WRITING. The three-layer
// standard — how it works, then what is possible including the options we advise
// against, then what we recommend — is a review step and no script will ever
// judge whether a page actually meets it. What a script CAN do is refuse a page
// that has fewer than three, which is how a layer goes missing: not deleted, just
// never written. `/learn/generate-your-seed` shipped without layer 1 for weeks.
for (const t of privacyTools) {
  if (!/^[a-z0-9-]+$/.test(t.slug)) {
    throw new Error(`privacy-tools.js: bad slug "${t.slug}"`);
  }
  if (t.layers.length !== 3) {
    throw new Error(
      `privacy-tools.js: "${t.slug}" has ${t.layers.length} layers, not 3 — ` +
      'how it works, what else is possible, what we would do',
    );
  }
  if (t.layers.some((l) => !l.h || !l.body)) {
    throw new Error(`privacy-tools.js: "${t.slug}" has a layer with no heading or no body`);
  }
  if (!t.status.length) {
    throw new Error(`privacy-tools.js: "${t.slug}" has no status facts — the whole point of this file`);
  }
}
