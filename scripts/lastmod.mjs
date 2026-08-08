// Sitemap <lastmod> dates, resolved from GIT COMMIT HISTORY.
//
// WHY GIT AND NOT FILE MTIME. mtime is the time a file last landed on this disk,
// which is a property of the checkout rather than of the content — a fresh clone
// or a `git clean` sets every mtime to "just now", so every page would claim to
// have changed today. That is not a missing signal but a FALSE one: Google
// learns the field carries no information and ignores lastmod site-wide, which
// is strictly worse than emitting none.
//
// WHY THE DATA MODULES ARE THE SOURCE FOR DYNAMIC ROUTES. This site has no
// markdown content collection — /learn/<slug>, /setup-walkthrough/<slug> and
// /privacy-tools/<slug> are all rendered from a single JS data module each. So
// the honest lastmod for every lesson is the commit date of src/data/lessons.js.
// That is COARSE — editing one lesson moves the date on all of them — but it is
// TRUE, and the alternative (a per-page date this repo has no record of) would
// have to be invented. Coarse-and-true beats precise-and-fabricated: the field's
// only job is to tell Google which pages are worth re-fetching.
//
// SHARED SCRIPT, ONE COPY PER REPO — only the ROUTE_DATA map and urlToSources()
// may differ, the same convention scripts/check-pseudonymity.py follows.

import { execSync } from 'node:child_process';

// Dynamic route prefix -> the data module that actually holds its content.
const ROUTE_DATA = {
  learn: 'src/data/lessons.js',
  'setup-walkthrough': 'src/data/walkthrough.js',
  'privacy-tools': 'src/data/privacy-tools.js',
};

/**
 * `-c core.quotePath=false` IS LOAD-BEARING, not a style choice. By default git
 * renders any non-ASCII byte in a path as a backslash escape and wraps
 * the whole path in quotes, so a filename with an umlaut, an accent or a dash
 * from outside Latin-1 never matches a lookup key. Measured on timechain.wiki:
 * exactly 3 of 400 articles silently lost their lastmod — Bohm-Bawerk, Hulsmann
 * and Walras — and nothing failed, which is what makes it worth a comment.
 */

/**
 * Last commit date for every tracked path, from ONE `git log` pass.
 * `git log` walks newest-first, so the FIRST time a path appears is its most
 * recent commit — hence the `has()` guard rather than overwriting.
 */
function gitDates() {
  const out = execSync('git -c core.quotePath=false log --format=%x00%cI --name-only --no-renames', {
    maxBuffer: 256 * 1024 * 1024,
    encoding: 'utf8',
  });
  const dates = new Map();
  let current = null;
  for (const line of out.split('\n')) {
    if (line.startsWith('\0')) { current = line.slice(1).trim(); continue; }
    const p = line.trim();
    if (p && current && !dates.has(p)) dates.set(p, current);
  }
  return dates;
}

function pathOf(url) {
  let p;
  try { p = new URL(url).pathname; } catch { p = url; }
  if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
  return p || '/';
}

export function buildLastmod() {
  const dates = gitDates();
  const newer = (a, b) => (!a ? b : !b ? a : (a > b ? a : b));

  return (item) => {
    const p = pathOf(item.url);
    const clean = p.replace(/^\//, '');
    let date;

    // A real page file wins — every static route has one.
    for (const c of p === '/'
      ? ['src/pages/index.astro']
      : [`src/pages/${clean}.astro`, `src/pages/${clean}/index.astro`]) {
      if (dates.has(c)) { date = dates.get(c); break; }
    }

    // Dynamic route: the data module is the content, and the template that
    // renders it is a floor — a template change re-renders every page under it.
    const prefix = clean.split('/')[0];
    if (!date && ROUTE_DATA[prefix]) {
      date = newer(dates.get(ROUTE_DATA[prefix]), dates.get(`src/pages/${prefix}/[slug].astro`));
    }

    // No date resolved => emit NO lastmod rather than a guess. A sitemap may
    // carry lastmod on some entries and not others; inventing one is the exact
    // failure this file exists to avoid.
    return date ? { ...item, lastmod: date } : item;
  };
}
