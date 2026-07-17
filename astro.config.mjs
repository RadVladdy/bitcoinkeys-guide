// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// BitcoinKeys.guide — static output, deployed to Cloudflare Pages (direct upload).
export default defineConfig({
  site: 'https://bitcoinkeys.guide',
  trailingSlash: 'ignore',
  build: {
    format: 'directory',
  },
  integrations: [sitemap()],
});
