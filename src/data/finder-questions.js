// The setup finder's five plain questions, and the phrase every page uses to
// promise what the finder is.
//
// SPLIT OUT OF quiz.js 2026-08-04, when that file's recommendation engine was
// retired (its scoring successor is finder.js). This half had nothing to do with
// the engine and everything to do with the rest of the site: eight surfaces import
// `finderPromise` to describe the finder, and only one of them is the finder.
//
// WHY IT IS ITS OWN FILE RATHER THAN PART OF finder.js. `/my-plan` imports
// finderPromise inside a CLIENT script and imports nothing else from the finder;
// so does `/find-your-setup` for `questions`. Sourcing a sentence from finder.js
// would pull the whole scoring engine — concerns, prompt bank, protection matrix
// — into those bundles to render one phrase. That is invariant #5's failure with
// a different cause: a glob once dragged twelve demo scripts and their crypto
// libraries into /start. This module imports numbers.js and nothing else, so it
// is free to import from anywhere.
//
// PRIVACY BY DESIGN, and it is a property of these questions specifically: we
// never ask how much Bitcoin you hold. The driver is the CONSEQUENCE of loss plus
// threat model, not any amount — safer (nothing an observer could use) and more
// correct (the ladder was always about threat model, not dollars). Answers live
// only in memory, never in the URL, localStorage, or a network request.

import { numberWord, numberWordCap } from './numbers.js';

export const questions = [
  {
    id: 'current',
    type: 'single',
    q: 'What’s your current Bitcoin setup?',
    help: 'This is your starting point — the recommendation is the destination, and we’ll show you the path from here. There’s no wrong answer; most people are near the beginning.',
    options: [
      { value: 'pre',           label: 'Nothing yet — it’s on an exchange, or in a phone / software wallet' },
      { value: 'single-sig',    label: 'One key on a hardware wallet, with a seed backup' },
      { value: 'passphrase',    label: 'One key + a passphrase (a secret “25th word”)' },
      { value: 'multisig',      label: 'Multisig I run entirely myself (2-of-3 or 3-of-5, all my own keys)' },
      { value: 'collaborative', label: 'Multisig where a service holds one key (Unchained, Nunchuk…)' },
    ],
  },
  {
    id: 'stakes',
    type: 'single',
    q: 'How much would losing this Bitcoin hurt?',
    help: "We ask about the consequence, not an amount — no website should ever ask how much Bitcoin you hold.",
    // `short` is the two-or-three-word version, for surfaces that show the
    // reader their own answer back rather than asking it. Added 2026-08-04 for
    // the risk picture on /find-your-setup: those two rows carried a band word
    // that could only ever read "typical", because their score IS their default
    // by construction — a label incapable of saying anything else, presented as
    // if it measured the reader. The answer is the honest thing to show there.
    options: [
      { value: 'learning',     short: 'still learning',  label: "I'm still learning — losing it wouldn't change my life" },
      { value: 'meaningful',   short: 'meaningful',      label: "It matters — I'd be upset, but I'd be okay" },
      { value: 'serious',      short: 'serious',         label: "It's serious — a big chunk of my savings" },
      { value: 'lifechanging', short: 'life-changing',   label: "It's life-changing — losing it would be devastating" },
    ],
  },
  {
    id: 'recovery',
    type: 'single',
    q: 'If something happened to you, does anyone else need to be able to recover it?',
    help: "Self-custody that only works while you're around and well isn't a plan.",
    options: [
      { value: 'just-me', label: 'No — just me, for now' },
      { value: 'partner', label: 'Yes — my partner or spouse' },
      { value: 'heirs',   label: 'Yes — my heirs / family (I want an estate plan)' },
    ],
  },
  // The ranked-worries question was REMOVED 2026-07-31: the risk assessment
  // (finder.js prompts → four scored concerns) sits where it used to be, between
  // stakes and recovery. Its 'worry' ANSWER values (self-loss / theft / exchange /
  // targeted / unsure) live on in SAVED PLANS ONLY — shimScores() in finder.js
  // maps them to a score vector so a plan saved before 2026-07-31 still loads.
  // Nothing asks the question and nothing else reads those values. They are also
  // NOT the same thing as `statedWorry`, the live key: the values overlap the
  // concern keys without meaning the same thing, and that collision has already
  // shipped once (see finder.js § applyStatedWorry).
  // Nothing indexes `questions` by position — every consumer looks up by id.
  {
    id: 'tech',
    type: 'single',
    q: 'How do you feel about fiddly, technical setup?',
    help: "There's no shame in wanting simple — the best setup is the one you'll actually use correctly.",
    options: [
      { value: 'simple',    label: 'Keep it as simple as possible' },
      { value: 'careful',   label: "I'll happily follow careful, step-by-step instructions" },
      { value: 'technical', label: "I'm technical and want maximum control" },
    ],
  },
  {
    id: 'sovereignty',
    type: 'single',
    q: 'How do you feel about a company ever holding one of your keys?',
    help: "Some setups lean on a Bitcoin service as a safety net; the most private, sovereign setups involve no company at all. Neither is wrong — it's a real trade-off, and your answer shapes what we recommend.",
    options: [
      { value: 'pure',      short: 'no third party',   label: 'No third party — I want pure self-custody, maximum privacy, no one to ask permission' },
      { value: 'lean-self', short: 'lean self-reliant', label: "I lean self-reliant, but I'd consider help if it clearly lowers my risk" },
      { value: 'open-help', short: 'open to help',     label: "I'd welcome a trusted service holding a backup key if it makes me safer or simpler" },
    ],
  },
];

/**
 * How many questions the finder asks, and the same figure as an English word, so
 * page copy ("Five plain questions") derives instead of being typed. Invariant #10:
 * a typed count is a bug even when it's right today — and this one was typed on
 * eight surfaces (home ×2, the finder ×2, /start, /checklist, /learn, /learn/ladder,
 * /404, /my-plan), every one of which would have gone stale on a seventh question.
 * The optional owned-wallets step is deliberately NOT counted: it's an interstitial
 * between Q1 and Q2, shown conditionally, and the copy promises plain questions.
 * The risk assessment isn't counted either — it is not a question, and the pages
 * that promise it use finderPromise below, which names it separately.
 */
export const questionCount = questions.length;
export const questionCountWord = numberWord(questionCount);
export const questionCountWordCap = numberWordCap(questionCount);

/**
 * THE one phrase every surface uses to promise what the finder is — built from
 * the live count, never typed. When "six plain questions" became five (the
 * worry question retired into the risk assessment, 2026-07-31), eight pages
 * were each saying it their own way; now they all say this, and a sixth
 * question or a renamed assessment is a one-line change here.
 */
export const finderPromise = `${questionCountWord} plain questions and a short risk assessment`;
export const finderPromiseCap = `${questionCountWordCap} plain questions and a short risk assessment`;
