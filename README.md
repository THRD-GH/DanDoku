# DanDoku

The homepage for [DanDoku](https://thrd-gh.github.io/DanDoku/) — a small collection of
Sudoku variants and other number games. One page, no account, no tracking.

The four games are served from this same domain, assembled into the site at
deploy time. Each lives in its own repository:

| Game | Path | Source |
| --- | --- | --- |
| Classic Sudoku | `/sudoku/?v=S` | [SodukuCombined](https://github.com/THRD-GH/SodukuCombined) |
| Sudoku Variants | `/sudoku/?v=XJ` | [SodukuCombined](https://github.com/THRD-GH/SodukuCombined) |
| Killer Sudoku | `/killer/` | [KillerSoduku](https://github.com/THRD-GH/KillerSoduku) |
| Solduku | `/solduku/` | [Solduku](https://github.com/THRD-GH/Solduku) |

Classic and Variants are the same engine; the `?v=` query string selects the rule
mix, so a card link that loses its query string silently sends players to the
wrong game. A test covers this.

Each game repo also still publishes its own standalone Pages site, so the old
`thrd-gh.github.io/<repo>/` links keep working.

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
3. The workflow then clones each game listed in [`games.json`](games.json),
   builds it, and copies its `dist` into `static-site/<slug>/`.
4. `.github/workflows/pages.yml` runs all of the above on every push to `main`
   and deploys what it just built.

CI builds the snapshot rather than deploying the committed copy of
`static-site/`, so editing `app/` is enough — the snapshot in the repo is only a
build artifact.

## games.json

[`games.json`](games.json) is the single source of truth for which games are
deployed and where:

```json
[
  { "slug": "sudoku", "repo": "THRD-GH/SodukuCombined", "ref": "main" },
  { "slug": "killer", "repo": "THRD-GH/KillerSoduku", "ref": "main" },
  { "slug": "solduku", "repo": "THRD-GH/Solduku", "ref": "master" }
]
```

The deploy clones from it, assembles from it, and polls it for changes;
`app/page.tsx` builds its play links from it, keyed on `repo` — the stable
identifier — so renaming a `slug` moves the deployed path and the links to it
together. A test asserts that every link on the page points at a slug the
manifest actually deploys, and that every slug is linked, because a mismatch
otherwise passes lint, the build and the sub-path gate and only shows up as a
404 in production.

`ref` is any git ref. It is normally the default branch, so the site tracks each
game automatically — note these are not uniform, `Solduku` still uses `master`.
Pin one to a tag when you want a game held still, and rollback becomes editing a
single line.

## How the games get here

GitHub Pages allows one custom domain per repository and has no cross-repo path
routing, so `dandoku.com/killer/` cannot be served *from* the KillerSoduku repo.
The games are therefore built and copied into this site during deploy.

This works because every game builds with Vite `base: './'` — its assets are
relative, so its `dist/` runs from any sub-path unchanged. The service workers
register as `` `${base}sw.js` `` with `{ scope: base }`, so each scopes to its own
directory rather than taking over the domain, and each game namespaces its
storage (`sv:v1:`, `sd:v1:`, `ks:v1:`) and prunes only its own prefix — so
sharing one origin is safe.

The workflow fails the build if a game's `index.html` starts requesting
root-absolute assets, since those would 404 under a sub-path.

### Keeping the games current

A push to a game repo deploys that repo's own Pages site but does not rebuild
this one. Rather than give every game repo a token to poke this one, the site
polls itself — **no secrets exist anywhere**:

1. Each deploy writes `build-info.json` into the site, recording the commit of
   this repo and of each game it was built from, plus a combined `fingerprint`.
2. A scheduled `check` job every 15 minutes reads the current head of each game
   with `git ls-remote` — public repos need no credentials — and compares the
   result against the `fingerprint` published at
   [`/build-info.json`](https://dandoku.com/build-info.json).
3. If they match, nothing has moved and the deploy is skipped. If they differ —
   or the file is missing or unreadable — it rebuilds.

The check costs a few seconds and does no work on a quiet tick, so the common
case is a cheap no-op rather than three needless game builds. Pushes here and
manual runs from the Actions tab always deploy without consulting the poll.

Two things to know about scheduled workflows: GitHub queues them on a
best-effort basis, so a tick can land late, and it disables schedules
automatically in a repository with no activity for 60 days. If the games stop
picking up changes, check that the schedule is still enabled.

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

### DNS and HTTPS

The domain is served directly by GitHub Pages, with a GitHub-issued certificate
covering `dandoku.com` and `www.dandoku.com`, and **Enforce HTTPS** is on.

The records must resolve straight to GitHub, on both address families:

- `A` → `185.199.108.153` – `185.199.111.153`
- `AAAA` → `2606:50c0:8000::153` – `2606:50c0:8003::153`
- `www` → `CNAME thrd-gh.github.io`

Keep them unproxied. Pointing either family at a proxy breaks GitHub's domain
validation, and the certificate silently never gets issued — the symptom is
`https://dandoku.com` serving GitHub's `*.github.io` wildcard instead of its own
certificate.

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
- `games.json` — which games are deployed, and from which ref
- `scripts/write-build-info.mjs` — records the commits a deploy was built from
- `static-site/` — generated snapshot with the games assembled in; not
  committed, rebuilt by CI on every deploy
- `worker/` — Cloudflare Worker entry used by the vinext build
