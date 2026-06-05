// @ts-check
import { defineConfig } from 'astro/config';

// Static marketing LP, deployed as its own Worker (Workers Static Assets) and
// mounted under a subpath of the parent site (revtrona.com, Next.js on Workers)
// via Cloudflare Worker Routes — the parent site stays unchanged.
//
// Final URLs: EN  https://revtrona.com/tools/stripe-agent-skills-for-testing/
//             JA  https://revtrona.com/tools/stripe-agent-skills-for-testing/ja/
//
// `base` is what makes the build emit files mirroring that path
// (dist/tools/stripe-agent-skills-for-testing/...), so the Worker Route can
// serve them directly. Both `site` and `base` can be overridden at build time.
// Normalize to a guaranteed leading slash so a BASE_PATH override without one
// (e.g. "tools/foo") still yields a valid base and ./dist/tools/foo outDir.
const rawBase = process.env.BASE_PATH ?? '/tools/stripe-agent-skills-for-testing';
const base = rawBase.startsWith('/') ? rawBase : `/${rawBase}`;

export default defineConfig({
  site: process.env.SITE_URL ?? 'https://revtrona.com',
  base,
  // Astro applies `base` to generated links but does NOT nest the output dir.
  // Workers Static Assets match by full request path, so the built files must
  // physically mirror the route path. Emit into ./dist<base> and point
  // wrangler's assets.directory at ./dist (see wrangler.jsonc).
  outDir: `./dist${base}`,
  // Folder index pages are served with a trailing slash; keep links consistent
  // with Workers Static Assets `auto-trailing-slash` handling.
  trailingSlash: 'always',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ja'],
    routing: {
      // EN served at <base>/, JA at <base>/ja — no /en prefix.
      prefixDefaultLocale: false,
    },
  },
});
