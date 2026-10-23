// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { buildLastmod } from './scripts/lastmod.mjs';

// BitcoinKeys.guide — static output, deployed to Cloudflare Pages (direct upload).
export default defineConfig({
  site: 'https://bitcoinkeys.guide',
  trailingSlash: 'ignore',
  build: {
    format: 'directory',
  },
  // `serialize` stamps each entry with a <lastmod> read from git history — see
  // scripts/lastmod.mjs for why git and not file mtime, and why the dynamic
  // routes take their date from their data module. No lastmod until 2026-08-07.
  integrations: [sitemap({ serialize: buildLastmod() })],
  // Astro 7 changed the default whitespace handling ('jsx'); pinned back to the
  // v4 behaviour so the 2026-10 security upgrade changes no rendered output.
  compressHTML: true,
});
