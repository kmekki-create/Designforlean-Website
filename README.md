# Design for Lean

Marketing site for Design for Lean — Lean Six Sigma certification, training, and consulting.

Static HTML/CSS/JS, no build step or framework dependencies.

## Structure

- `index.html`, `programs.html`, `consulting.html`, `about.html`, `contact.html`, `field-notes.html` — main pages
- `field-notes/` — article pages
- `css/styles.css` — design system and all styles
- `js/main.js` — nav, scroll reveals, FAQ accordion, contact form handling
- `assets/` — self-hosted fonts and images
- `contact-handler.php` — server-side contact form handler (requires a PHP-capable host; **does not run on GitHub Pages**)

## Local preview

Open `index.html` directly in a browser, or serve the folder with any static file server.

## Deploying

If hosting on GitHub Pages, the contact form's PHP backend will not execute — swap the form's
submission target in `contact.html` / `js/main.js` for a static-friendly form service instead.
