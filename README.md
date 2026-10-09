# Onjaal website (V0)

Marketing site for **Onjaal**, a business technology company. First product: **Onjaal HRMS** (in development).

Plain HTML, CSS and JavaScript. No framework, no build step, no runtime dependencies.

## Preview locally
```bash
npx http-server . -p 8080      # or: python3 -m http.server 8080
# open http://localhost:8080/
```

## Check before you deploy
```bash
node scripts/check.mjs          # internal links, anchors, assets, duplicate ids, titles, h1, alt text
```

## Deploy (GitHub Pages)
The site is served from `https://abhayak47.github.io/onjaal/`. All asset paths are relative, so it works under the
`/onjaal/` sub-path. Deploying = merging to the branch Pages is configured to publish (check **Settings > Pages**;
this was not verifiable from the build environment).

1. Open a pull request from your working branch into `main` and merge it.
2. Wait for the Pages build, then open the live URL and test the enquiry form (see below).

`.nojekyll` is present so Pages serves files as-is. `404.html` is used for unknown URLs.

### If you add a custom domain later
Update the absolute URLs in: `index.html` (canonical, `og:*`, JSON-LD), `404.html` (asset links),
`robots.txt`, `sitemap.xml`, and `scripts/check.mjs` (`BASE`). Add a `CNAME` file.

## Make the enquiry form work (required before launch)
The static site has no backend, so the form needs a form-handling service or an email address. Until one is set,
the form says plainly that it is not connected and offers the message to copy. It never reports a false success.

Option A, form service (recommended). Create a form at a service that accepts JSON POSTs and has a CORS-enabled
endpoint (for example Formspree), then set the endpoint on the form in `index.html`:
```html
<form id="contactForm" ... data-endpoint="https://formspree.io/f/YOUR_ID" data-contact-email="">
```
Success is shown only when the service responds with a 2xx status; any failure shows an error and keeps the
visitor's input. Name the provider in `privacy.html`.

Option B, email draft. Set `data-contact-email="you@yourdomain"` (a verified address). Submitting opens a pre-filled
draft in the visitor's email app. This is not delivery, and the page says so.

## Structure
- `index.html` single-page site: Hero, What it's for, Product concept, How it works, Vision, Company, FAQ, Contact
- `privacy.html`, `terms.html` drafts, marked `noindex` until legally reviewed
- `404.html`, `robots.txt`, `sitemap.xml`, `site.webmanifest`
- `assets/css/styles.css` design tokens (colour, spacing, type, radii) + components
- `assets/js/main.js` menu, tabs, concept interactions, form
- `assets/fonts/` self-hosted Inter (SIL OFL, see `LICENSE.txt`), subset to Latin
- `scripts/check.mjs` static integrity check

Header and footer markup is repeated in each HTML page. If you change navigation, update all four pages.

## Content rules
- The HRMS interface is an **illustrative concept** with **fictional people and data**, labelled as such. Replace it
  with real screenshots once the product exists.
- Do not add feature claims, statistics, customers or contact details until verified.
- When the legal pages have been reviewed, remove the draft banner and the `noindex` tag, and add them to `sitemap.xml`.
