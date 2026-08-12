# bitcoinkeys-guide

Source for **[bitcoinkeys.guide](https://bitcoinkeys.guide)** — an independent,
Bitcoin-only, plain-English guide to self-custody. A RadVladdy project.

**Positioning:** we hold no keys and sell no device. The independence wedge —
no hardware brand, no custody service, no affiliate money — is the whole point.

## Stack

[Astro](https://astro.build) static site. Content lives in `.astro` pages and
`src/data/*.js` single-source-of-truth files (so "last verified" dates stay
honest). No client JS beyond the theme toggle.

## Structure

```
src/
  layouts/Base.astro        page shell (SEO, theme, "last verified" stamp)
  components/               Nav, Footer, Ladder
  data/ladder.js           the 6-rung configuration ladder (the spine)
  data/wallets.js          the 7-device comparison (verified 2026-05-14)
  pages/
    index.astro            home — the thesis + independence pledge
    start.astro            "Start here" — the newcomer on-ramp
    ladder/index.astro     the configuration ladder overview
    ladder/single-sig.astro   rung 1 — full walkthrough (template for the rest)
    ladder/[slug].astro    rungs 2–6 — summary stubs until each is written
    wallets.astro          honest hardware-wallet comparison
    about.astro            the independence pledge / how it works
legacy/coming-soon.html    the prior placeholder (superseded by this build)
```

Content backbone: the Obsidian vault's Bitcoin KB *Practical self-custody and
sovereignty* area (39 primary notes).

## Develop

```
npm install
npm run dev        # local dev server
npm run build      # → dist/
npm run preview    # serve the built dist/
```

## Deploy

Cloudflare Pages, **direct upload** (not git-triggered):

```
npm run build
npx wrangler pages deploy dist --project-name=bitcoinkeys-guide --branch=main
```

The GitHub remote is source-of-record/backup, not a deploy trigger (deploys are
direct upload). Deploy credentials are kept out of the repo.

## Licence

**Code: [MIT](LICENSE). Content: [CC BY 4.0](LICENSE-CONTENT).**

The lessons, rules, comparison data and diagrams are yours to copy, translate,
remix or feed to a model — just credit RadVladdy and link back to the source
page. The attribution link matters here for a specific reason: this is
self-custody advice, and a copy that has gone stale is the one way it becomes
dangerous. The link is how a reader finds the version that is still checked.
