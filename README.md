# Onjaal website (V0)

Marketing site for **Onjaal**, an early-stage company building practical business software.
First product: **Onjaal HRMS** (in development).

Plain HTML, CSS and JavaScript. No framework, no build step, no runtime dependencies.

## Preview locally
```bash
npx http-server . -p 8080      # or: python3 -m http.server 8080
# open http://localhost:8080/
```

## Build (run before every commit that touches html, css or js)
```bash
node scripts/build.mjs
```
There is no compile step. "Build" means: (1) copy the shared header/footer from `index.html` into the other pages,
(2) stamp `styles.css` and `main.js` URLs with a content hash (`?v=...`), (3) run the integrity checks
(links, anchors, assets, duplicate ids, one h1, alt text, icon sizes, stamps current). It must print `OK`.

Why the stamps matter: GitHub Pages caches assets for about 10 minutes. Without a changing URL, a browser can combine
new HTML with an old `styles.css`, which renders giant icons and a stretched layout. Never edit the `?v=` values by hand.

Individual steps: `node scripts/sync-chrome.mjs`, `node scripts/stamp-assets.mjs`, `node scripts/check.mjs`.
Edit the shared header and footer **once**, in `index.html` between the `chrome:` comments.

### Troubleshooting: page looks unstyled or has huge icons
Hard-refresh (Ctrl/Cmd+Shift+R). If it persists, confirm the HTML references the current stamp:
`curl -s https://abhayak47.github.io/onjaal/ | grep styles.css` and that `styles.css?v=<same value>` returns 200.
Every inline icon carries explicit `width`/`height`, so even without CSS the page degrades to a readable layout.

## Deploy (GitHub Pages)
Served from `https://abhayak47.github.io/onjaal/`. All asset paths are relative, so it works under the `/onjaal/`
sub-path. Deploying means merging into the branch that Pages publishes (see **Settings > Pages**; this
was not verifiable from the build environment, and no deployment configuration was changed).

1. Run `node scripts/build.mjs` and commit any files it changed.
2. Merge the working branch into `main` through a pull request.
3. When the Pages build finishes, open the live URL and test the enquiry form (below).

`.nojekyll` is present. `404.html` is served for unknown URLs and uses absolute URLs so it renders at any depth.

### Custom domain later
Update the absolute URLs in `index.html` (canonical, `og:*`, JSON-LD), `scripts/sync-chrome.mjs` and
`scripts/check.mjs` (`BASE`), `robots.txt`, `sitemap.xml`, then run `node scripts/sync-chrome.mjs`
and add a `CNAME` file.

## Make the enquiry form work (required before launch)
A static site has no backend, so the form needs a form service or a contact address. Until one is set, the form
says plainly that it is not connected and offers the message to copy. It never reports a false success.

**Option A, form service (recommended).** Create a form at a service that accepts JSON POSTs with CORS
(for example Formspree) and set the endpoint on the form in `index.html`:
```html
<form id="contactForm" ... data-endpoint="https://formspree.io/f/YOUR_ID" data-contact-email="">
```
Success appears only after a 2xx response. Failures keep the visitor's input and show an error. Name the
provider in `privacy.html`.

**Option B, email draft.** Set `data-contact-email="you@yourdomain"` (a verified address). The form then opens a
pre-filled draft in the visitor's email app. That is not delivery, and the page says so.

## Structure
- `index.html` single-page site: hero, HRMS (task explorer), status, approach, FAQ, contact
- `privacy.html`, `terms.html` drafts, `noindex` until legally reviewed
- `404.html`, `robots.txt`, `sitemap.xml`, `site.webmanifest`
- `assets/css/styles.css` tokens (colour, spacing, type, radii), components, sections
- `assets/js/main.js` menu, task tabs, concept interactions, form
- `assets/fonts/` self-hosted Inter (SIL OFL, see `LICENSE.txt`), Latin subset
- `scripts/` `build.mjs` (runs the others), `sync-chrome.mjs`, `stamp-assets.mjs`, `check.mjs`
- `docs/CLAIMS.md` register of every product claim and its evidence level

## Content rules
- The HRMS screens are **illustrative concepts** with **fictional people**, labelled as such. Replace them with
  real screenshots once the product exists. Keep `docs/CLAIMS.md` current.
- No feature claims, statistics, customers, logos or contact details until verified.
- After legal review: remove the draft banner and `noindex` from the legal pages and add them to `sitemap.xml`.
