# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Marketing site for a longevity / clinical-nutrition practice (menopause, andropause, anti-aging, estrogen metabolism). The `.nojekyll` file is also present in case GitHub Pages serves a fallback. Git remote: `github.com/mdacenko916-droid/VIA-L-LONGEVITY`.

## Two products in one repo + where the architecture lives

This repo holds **two products**, each with its own ARCHITECTURE.md (NOT auto-loaded each session — open the relevant one before non-trivial work):
- **Marketing site** (repo root: `index.html`, `*-program.html`, `book/`, booking) — European market, **4 languages** (uk/ru/en/es). Top-level map of the whole repo: [`ARCHITECTURE.md`](ARCHITECTURE.md) (site + ИП + backend + integrations; §0 «два продукта»).
- **Interpreter / ИП** (`interpreter/`) — global wearable-biomarker interpreter + nutritionist funnel, **12 languages**, primary EN. Deep-dive: [`interpreter/ARCHITECTURE.md`](interpreter/ARCHITECTURE.md) (file map §2, tariffs §3, deploy §12, wearable integrations §15–16). Do **not** conflate ИП's 12-lang/global model with the site's 4-lang one.

### Hosting & deploy (no build system)
- `via-l.com` = **GitHub Pages from this repo**. All HTML (site **and** interpreter) deploys automatically on `git push origin main` (~1–2 min). There is **no separate "upload to site" step** — the push *is* the deploy.
- **Cloudflare Worker** (`interpreter/cloudflare-worker.js`, domain `interpreter.viaelcom.workers.dev`) deploys separately: `cd interpreter && wrangler deploy`. Secrets via `wrangler secret put NAME`; KV namespaces in `interpreter/wrangler.jsonc`.

## Build / run

There is **no build system, no package manager, no tests**. Files are served as-is.

- Local preview: open `index.html` in a browser, or use VS Code Live Preview (configured default path is `/about-premium-preview.html` in `.vscode/settings.json` — that file may not exist; override or use `/index.html`).

## Top-level layout

- `index.html` (~3.8k lines) — landing page. All CSS, JS, and translations are inline.
- `*-program.html` — one self-contained page per program: `Menopauza`, `Andropauza`, `Antivikove`, `Estrogen`. Each is also fully inline.
- `book/` — the guide flipbook system (see below).
- `monogram/index .html` (note the space in the filename) — single-SVG logo asset.
- `приложение   Oura копія/` — separate Oura Ring lab-interpreter app, **not part of the main site** (`<meta name="robots" content="noindex,nofollow">`).
- `images/`, `book/foto/` — image assets.
- `sitemap.xml` lists only the main page + the four `*-program.html` pages.

## Architecture notes that aren't obvious from one file

### Two different i18n implementations coexist — match the page you're editing

Pages support **uk / ru / es / en**. Strings live inline in JS objects on each page. Two strategies are in use; do **not** mix them on the same page:

1. **`data-i18n` + JS translation dict** (used by `index.html`, `Antivikove-program.html`, `accompaniment-block.html`). Each translatable element has `data-i18n="key"`; `applyLang(lang)` looks up `translations[lang][key]` and sets `el.innerHTML`. SVG children are preserved via clone-and-reappend. Persisted in `localStorage.selectedLang`. The `translations` object is one giant inline literal — search for `var translations = {` near line ~2259 of `index.html`.
2. **`.lang-content[data-lang="..."]` + CSS visibility** (used by `Andropauza-program.html`, `Menopauza-program.html`). HTML carries one copy of the text per language wrapped in `<span class="lang-content lang-XX" data-lang="XX">`; CSS rules `html[data-current-lang="XX"] .lang-XX { display: block }` reveal the active one. `setLang(code)` toggles the attribute on `<html>`. `Menopauza-program.html` also has a runtime helper that walks JS data and emits `<span class="lang-content">` markup (search for `applyLanguage` / `escapeHtml`).

Lang code naming is **inconsistent across files** — Ukrainian is `uk` in most pages but `ua` in `Andropauza-program.html` (`html[data-current-lang="ua"]`). When editing language logic, grep the specific page for which code it expects before changing anything.

### Guide-book system (multi-iframe, postMessage protocol)

The `#guides` section on `index.html` embeds `book/carousel.html` in an iframe; clicking a book in the carousel opens one of seven `book/*_index.html` files (Hormones, Testosteron, Blood_Tests, Longevity, Sugar_40, Inflammation, Beauty) in a second iframe layered on top of `index.html`.

- **Carousel → parent** (book/carousel.html:441): `window.parent.postMessage({ action: 'openBook', file: '/book/X_index.html' }, '*')`.
- **Parent handler** (index.html:3628): on `openBook`, calls `openBookIframe(file)` which sets `#book-iframe-frame.src` and shows `#book-iframe-overlay`.
- **Book → parent** (e.g. book/Hormones_index.html:914,960): once the reader is initialized, posts `{action: 'bookReady'}`. The parent only adds `.open` to the overlay after it receives this — without `bookReady`, the modal stays invisible. Any new book file must post this message.
- Desktop reader uses **turn.js + jQuery 1.12.4** (root `turn.min.js`, also duplicated as `book/turn.min.js`) on a fixed 960×600 canvas; the iframe is the full 1200×860 canvas scaled to viewport via `applyBookScale()` in the parent.
- Mobile reader: each book file detects `window.innerWidth < 768` and runs `initMobileReader()` instead of `book.turn(...)` — a custom CSS-translate slide carousel with swipe (`touchstart`/`touchend`, 40px threshold) and prev/next/back buttons. **All seven book files duplicate this same script block** — when changing reader behavior, update all seven.
- There is also a parallel `#book-modal` / `openBookModal(idx)` system in `index.html` (around line 3685) that opens books in a fixed-size modal indexed by `BOOK_FILES`. This coexists with the iframe-overlay path; check git log before assuming one is unused.

### Hotmart payment links

Each guide × language combination has a hardcoded Hotmart checkout URL. The matrix lives in `index.html` around line 3371 as `[{uk, ru, es, en}, ...]` indexed by guide. The accompanying spreadsheet `адреса гайдов.xlsx` is the source of truth — when adding/changing links, update both, and verify the per-language pages too (the program pages may have their own copies).

### Index page section map

`index.html` is organized as numbered "blocks" — comments `<!-- BLOCK N: ... -->` and `/* ════ BLOCK N — ... ════ */` mark CSS/HTML for each:

1. HERO → `#hero`
2. ABOUT → `#about`
3. HOW → `#how`
4. PROGRAMS → `#programs` (cards link to `*-program.html`)
   4.5. GUIDES → `#guides` (iframe → `book/carousel.html`)
5. FOR WHOM → `#for-whom`
6. REVIEWS → `#reviews`
7. ABOUT ME → `#me`
8. FAQ → `#faq`
9. BOOKING → `#booking`

### Email obfuscation

All `mailto:` links are wrapped by Cloudflare's email-protection (`/cdn-cgi/l/email-protection#...`) and decoded by `email-decode.min.js` (loaded inline at index.html:2256). Don't expect plain `mailto:` strings — search for `email-protection` instead.

## Working with these files

- **Edit, don't recreate**. Files are 1k–4k lines of inline HTML+CSS+JS; use targeted `Edit` rather than rewriting. Look at recent git history before large refactors — the book viewer in particular has been iterated heavily.
- **iCloud working directory**: the project lives in `~/Library/Mobile Documents/com~apple~CloudDocs/VIA-L LONGEVITY` (note the space). Quote paths in shell commands.
- **No linter, no formatter, no test runner.** Verify changes by opening the page in a browser and toggling each of the four languages; for book changes, test both desktop (turn.js, ≥768px) and mobile (custom reader, <768px) paths.
