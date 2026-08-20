# DanDoku

The homepage for [DanDoku](https://thrd-gh.github.io/DanDoku/) — a small collection of
Sudoku variants and other number games. One page, no account, no tracking.

It links out to four games, each hosted in its own repository:

| Game | Link |
| --- | --- |
| Classic Sudoku | [SodukuCombined `?v=S`](https://thrd-gh.github.io/SodukuCombined/?v=S) |
| Sudoku Variants | [SodukuCombined `?v=XJ`](https://thrd-gh.github.io/SodukuCombined/?v=XJ) |
| Killer Sudoku | [KillerSoduku](https://thrd-gh.github.io/KillerSoduku/) |
| Solduku | [Solduku](https://thrd-gh.github.io/Solduku/) |

Classic and Variants are the same engine; the `?v=` query string selects the rule
mix, so a card link that loses its query string silently sends players to the
wrong game. A test covers this.

## Prerequisites

- Node.js `>=22.13.0`

## Quick start

```bash
npm install
npm run dev
```

## How it ships

The site is a static snapshot deployed to GitHub Pages.

1. `npm run build` produces the vinext build in `dist/`.
2. `npm run build:pages` starts the production server, snapshots the rendered
   HTML into `static-site/`, rewrites root-relative asset paths onto the
   base path derived from `SITE_URL`, and verifies the result before writing it.
3. `.github/workflows/pages.yml` runs all of the above on every push to `main`
   and deploys what it just built.

CI builds the snapshot rather than deploying the committed copy of
`static-site/`, so editing `app/` is enough — the snapshot in the repo is only a
build artifact.

## Where the site lives

The Pages site has the custom domain **dandoku.com** configured, so GitHub serves
the project at the *root* of that domain and 301-redirects
`thrd-gh.github.io/DanDoku` to it.

`SITE_URL` in [`app/layout.tsx`](app/layout.tsx) is the single source of truth.
`scripts/build-pages.mjs` parses it to derive the base path and to emit the
`CNAME` file, so changing that one line moves the site.

Because the custom domain serves at the root, **there is no base path**. Adding
one is not cosmetic: the build previously rewrote every asset onto a `/DanDoku/`
prefix that does not exist on dandoku.com, so every stylesheet and script on the
live site returned 404 and the page rendered unstyled. `build:pages` now fails
the build if a base-path prefix reappears while `SITE_URL` points at a root
domain.

### Outstanding: HTTPS

`https://dandoku.com` does **not** work yet. It serves GitHub's `*.github.io`
wildcard certificate, which does not cover the custom domain — GitHub never
provisioned one, because the DNS is inconsistent:

- `A` records point at GitHub Pages (`185.199.108–111.153`) — correct
- `AAAA` records point at Cloudflare (`2606:4700:…`) — **wrong**
- `www` is a `CNAME` to `thrd-gh.github.io` — correct

To finish the setup, in the DNS provider for dandoku.com either delete the two
`AAAA` records or repoint them at GitHub Pages
(`2606:50c0:8000::153` through `2606:50c0:8003::153`), and make sure the records
resolve directly to GitHub rather than through a proxy. Then re-save the custom
domain in the repository's Pages settings to trigger certificate issuance, and
turn on **Enforce HTTPS**.

Until that is done the site is reachable over HTTP only, and `og:image` — which
correctly points at `https://dandoku.com/og.png` — will not load for scrapers.

## Commands

- `npm run dev` — local development server
- `npm run build` — production build into `dist/`
- `npm run build:pages` — regenerate the `static-site/` snapshot
- `npm test` — render the built worker and assert the page (run after `build`)
- `npm run lint` — ESLint

## Layout

- `app/` — the entire site: `page.tsx` (markup and game data), `globals.css`,
  `layout.tsx` (metadata and `SITE_URL`)
- `scripts/build-pages.mjs` — snapshot builder
- `static-site/` — generated snapshot, rebuilt by CI
- `worker/` — Cloudflare Worker entry used by the vinext build
