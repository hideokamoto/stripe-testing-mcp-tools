# stripe-fixtures — landing page

Marketing landing page for the [`stripe-fixtures`](../skills/stripe-fixtures) Agent Skill.
Built with [Astro](https://astro.build) as a static site.

It ships as its **own** Cloudflare Worker (Workers Static Assets) and is mounted under a
subpath of the parent site (`revtrona.com`, Next.js on Workers) via Worker Routes — the
parent site stays unchanged. Live URLs:

- English → `https://revtrona.com/tools/stripe-agent-skills-for-testing/`
- Japanese → `https://revtrona.com/tools/stripe-agent-skills-for-testing/ja/`

## Why plain Astro (and not Starlight)?

This is a **single-skill** project, so its reference docs live in the repo README and
`SKILL.md` — there is no multi-page docs tree to justify a docs framework. Plain Astro
gives a marketing LP with built-in i18n routing, zero shipped JS, and the lowest
dependency/maintenance surface. If a browseable docs section is ever needed, Starlight
can be added later under `/docs`.

## Local development

This is a self-contained project inside the `stripe-testing-mcp-tools` monorepo.
It manages its own dependencies with pnpm — run everything from `site/`:

```bash
cd site
pnpm install       # installs this project's deps
pnpm run dev       # http://localhost:4321
pnpm run build     # static output → dist/
pnpm run preview   # serve the built site
pnpm run typecheck # astro check
pnpm run test      # vitest (JUnit → site/reports/results.xml)
```

## Content & i18n

All copy lives in [`src/i18n/content.ts`](src/i18n/content.ts) as `content.en` / `content.ja`.
The page components (`src/components/Landing.astro`, `src/layouts/Base.astro`) are
language-agnostic and render from that object, so adding/editing copy never touches markup.

- English → [`src/pages/index.astro`](src/pages/index.astro) → served at `<base>/`
- Japanese → [`src/pages/ja/index.astro`](src/pages/ja/index.astro) → served at `<base>/ja/`
- Language switcher and `hreflang` tags are wired in `Landing.astro` / `Base.astro`.

All internal links and assets resolve through `import.meta.env.BASE_URL`, so the LP keeps
working when mounted under the `base` subpath. `site` (`https://revtrona.com`) and `base`
(`/tools/stripe-agent-skills-for-testing`) are set in [`astro.config.mjs`](astro.config.mjs)
and can be overridden at build time via the `SITE_URL` / `BASE_PATH` env vars.

## Deploy (Cloudflare Workers — static assets)

The site is purely pre-rendered, so it ships via [Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/):
no adapter and no Worker script. [`wrangler.jsonc`](wrangler.jsonc) points `assets.directory`
at `./dist`, and Cloudflare serves those files directly.

Because Astro builds with `base: /tools/stripe-agent-skills-for-testing`, `./dist` already
mirrors that path (`dist/tools/stripe-agent-skills-for-testing/...`). The two `routes` in
`wrangler.jsonc` (`revtrona.com/tools/stripe-agent-skills-for-testing` and `.../*`) mount
this Worker under that subpath; Cloudflare matches them at the edge before the parent
Worker runs, and every other path falls through to the parent unchanged. See Cloudflare's
[Serving a subdirectory](https://developers.cloudflare.com/workers/static-assets/routing/advanced/serving-a-subdirectory/)
docs.

**Requirements (Cloudflare side):** `revtrona.com` must be a Zone in the target Cloudflare
account, the `CLOUDFLARE_API_TOKEN` must have Workers Routes edit rights on that zone, and
the parent site must not use the `/tools/stripe-agent-skills-for-testing*` path namespace.

Deploy on every push to `main` by running, from `site/`:

```bash
pnpm run deploy    # astro build && wrangler deploy
```

`wrangler deploy` authenticates from the `CLOUDFLARE_API_TOKEN` (and, if needed,
`CLOUDFLARE_ACCOUNT_ID`) environment variables.

> **Migration note:** this site previously lived in the `stripe-fixtures-skills`
> repo and was deployed from there via CircleCI. After the move into this
> monorepo, re-point the deploy pipeline (CircleCI/GitHub Actions + the
> `CLOUDFLARE_*` secrets) at this repository.

To deploy by hand:

```bash
cd site
pnpm run build
pnpm exec wrangler deploy
```

The same `dist/` also works on GitHub Pages, Netlify, Vercel, or any static host.
