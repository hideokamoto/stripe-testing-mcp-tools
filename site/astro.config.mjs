// @ts-check
import { defineConfig } from 'astro/config';

// Static marketing LP. English at "/", Japanese at "/ja".
// Deploys as static output (default) to Cloudflare Pages / GitHub Pages / any static host.
export default defineConfig({
  // Override with SITE_URL env var at build time (e.g. on Cloudflare Pages).
  // Fallback is the expected Cloudflare Pages domain — update once confirmed.
  site: process.env.SITE_URL ?? 'https://stripe-fixtures.pages.dev',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ja'],
    routing: {
      // EN served at root (/), JA at /ja — no /en prefix.
      prefixDefaultLocale: false,
    },
  },
});
