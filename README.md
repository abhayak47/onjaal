# Onjaal

Marketing website for Onjaal, a business technology brand. Current product: Onjaal HRMS (in development).

Plain HTML/CSS/JS, no build step or dependencies. Open `index.html` or serve the folder (e.g. `npx http-server`).

## Structure
- `index.html` – single-page site (Home, Products, Solutions, About, Contact)
- `privacy.html`, `terms.html` – **draft pages that need legal review before launch**
- `assets/css/styles.css` – design tokens and components
- `assets/js/main.js` – menu, scroll reveal, tabs, form validation
- `assets/favicon.svg`

## Content to finalize
- Product copy is deliberately general; no HRMS features, customers, metrics or contact details are claimed. The HRMS UI is an illustrative mockup with sample data.
- The contact form does not submit anywhere. Set `data-contact-email` on `#contactForm` to a verified address to enable a mailto draft, or connect a form service.
- Review and complete the Privacy Policy and Terms.
