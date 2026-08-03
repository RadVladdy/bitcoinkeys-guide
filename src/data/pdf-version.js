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
