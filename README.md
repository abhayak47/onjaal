# Onjaal website (V0)

Marketing site for **Onjaal**, an early-stage company building practical business software.
First product: **Onjaal HRMS** (in development).

Plain HTML, CSS and JavaScript. No framework, no build step, no runtime dependencies.

## Preview locally
```bash
npx http-server . -p 8080      # or: python3 -m http.server 8080
# open http://localhost:8080/
```

## Checks (run before every deploy)
```bash
node scripts/check.mjs          # links, anchors, assets, duplicate ids, titles, one h1, alt text, header/footer sync
```

## Editing the shared header and footer
Edit them **once**, in `index.html` (between the `chrome:` comments), then run:
```bash
node scripts/sync-chrome.mjs    # copies them into privacy.html, terms.html and 404.html with correct links
```
`check.mjs` fails if the pages drift apart.

## Deploy (GitHub Pages)
Served from `https://abhayak47.github.io/onjaal/`. All asset paths are relative, so it works under the `/onjaal/`
sub-path. Deploying means merging into the branch that Pages publishes (see **Settings > Pages**; this
was not verifiable from the build environment, and no deployment configuration was changed).

1. Run the checks above.
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
- `scripts/` `check.mjs`, `sync-chrome.mjs`
- `docs/CLAIMS.md` register of every product claim and its evidence level

## Content rules
- The HRMS screens are **illustrative concepts** with **fictional people**, labelled as such. Replace them with
  real screenshots once the product exists. Keep `docs/CLAIMS.md` current.
- No feature claims, statistics, customers, logos or contact details until verified.
- After legal review: remove the draft banner and `noindex` from the legal pages and add them to `sitemap.xml`.
