// Content-hashed links for the printable PDFs.
//
// THE PROBLEM THIS SOLVES, and it looked exactly like a broken deploy: these
// files are MUTABLE CONTENT AT A FIXED FILENAME. Cloudflare Pages serves static
// assets with `cache-control: public, max-age=14400`, so a reader who had opened
// a PDF kept their copy for four hours no matter what the CDN held — and had no
// way to tell. Rebuilding, redeploying and re-verifying all showed the new file
// while the reader still saw the old one.
//
// `_headers` CANNOT FIX IT. Its rules do reach these files — X-Frame-Options and
// the rest arrive — but Pages overrides Cache-Control for assets and ignores
// what you ask for. Verified against the live response after two deploys, one
// with `/*.pdf` and one listing every file explicitly. Do not try it a third
// time.
//
// So the LINKS carry the version instead. `?v=<hash of the file>` makes each
// revision a distinct URL to the browser while the canonical path never moves,
// so bookmarks and anything already printed stay valid. The hash is read from
// the built file at build time, which means it cannot be forgotten: change the
// PDF and every link to it changes with it, automatically.
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const cache = new Map();

/**
 * `/name.pdf` → `/name.pdf?v=abc12345`, hashed from the file in public/.
 * Falls back to the bare path if the file is not there yet — a missing PDF
 * should surface as a 404 on a real link, not as a build failure that blocks
 * every other page.
 */
export function pdfHref(path) {
  if (cache.has(path)) return cache.get(path);
  let href = path;
  try {
    const buf = readFileSync(new URL(`../../public${path}`, import.meta.url));
    href = `${path}?v=${createHash('sha256').update(buf).digest('hex').slice(0, 8)}`;
  } catch {
    // left bare on purpose — see above
  }
  cache.set(path, href);
  return href;
}

/**
 * THE PRINTABLE PACK — one ordered list, offered identically wherever it is
 * offered. Registered here because it was typed twice and the two copies had
 * already diverged: /roll-your-own-seed offered these three documents while
 * /dice-word-table still offered a browser-print of all eight sheets plus the
 * legacy 8-page combined PDF, so the same reader met two different answers to
 * "what do I print?" depending on which door they came in by.
 *
 * `pages` is derived per entry (see pdfPages) — never typed.
 *
 * The legacy /dice-word-table.pdf is deliberately NOT here. It is the
 * everything-at-once document these three replaced; the file stays in public/
 * so any existing bookmark or printed reference still resolves, but nothing
 * offers it.
 *
 * IT IS FROZEN, AND IT HAS NO BUILDER ANY MORE. `scripts/build-dice-pdf.sh`
 * (singular) regenerated it from whatever /dice-word-table currently renders,
 * which meant a page-layout change would silently rewrite an artifact people
 * have already printed — and it sat next to build-dice-pdfs.sh with no way for
 * a reader to tell which one was live. Cut 2026-08-04. The file is checked in
 * and complete (8 sheets, all 2,048 words verified present); if it ever has to
 * move, retire the URL with a `_redirects` line rather than rebuilding it.
 */
export const printablePdfs = [
  { file: '/roll-24-word-seed.pdf', label: '24-word seed', note: 'method + worksheet + the table' },
  { file: '/roll-12-word-seed.pdf', label: '12-word seed', note: 'method + worksheet + the table' },
  { file: '/bip39-word-table.pdf', label: 'Just the table', note: 'the word table alone' },
].map((p) => ({ ...p, get pages() { return pdfPages(p.file); } }));

const pageCache = new Map();

/**
 * `/roll-24-word-seed.pdf` → 6, read from the built file.
 *
 * WHY THIS EXISTS: two pages offer these documents by name AND BY LENGTH
 * ("24-word seed — 6 pages"), and a PDF's page count is a moving constraint,
 * not a fixed fact. The worksheet's row-height ceiling went 22pt → 21pt the day
 * one example row was added, because one extra row is worth a whole extra
 * sheet. A typed "6 pages" survives that change silently and is then wrong on
 * every surface that offers the file — the exact shape invariant #10 exists to
 * stop. Deriving it means a print-CSS change carries its own copy.
 *
 * Reads the page-tree /Count rather than opening the file with a PDF library,
 * so the build keeps its zero-dependency posture. Cross-checked against
 * PyMuPDF's own page_count for all four shipped documents (4 / 6 / 6 / 8).
 * Returns null if the file or the count is unreadable — callers must render
 * the link without a length rather than print a wrong one.
 */
export function pdfPages(path) {
  if (pageCache.has(path)) return pageCache.get(path);
  let n = null;
  try {
    const s = readFileSync(new URL(`../../public${path}`, import.meta.url)).toString('latin1');
    const counts = [...s.matchAll(/\/Count\s+(\d+)/g)].map((m) => Number(m[1]));
    const pages = (s.match(/\/Type\s*\/Page[^s]/g) || []).length;
    // The page tree's root /Count is the answer; agreeing with a direct count of
    // /Type /Page objects is what makes it trustworthy without a parser.
    if (counts.length && pages && Math.max(...counts) === pages) n = pages;
  } catch {
    // null — see above
  }
  pageCache.set(path, n);
  return n;
}
