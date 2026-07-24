# Design for Lean

Marketing site for Design for Lean — Lean Six Sigma certification, training, and consulting.

Static HTML/CSS/JS, no build step or framework dependencies.

## Structure

- `index.html`, `programs.html`, `consulting.html`, `about.html`, `contact.html`, `field-notes.html` — main pages
- `field-notes/` — article pages
- `css/styles.css` — design system and all styles
- `js/main.js` — nav, scroll reveals, FAQ accordion, contact form handling
- `assets/` — self-hosted fonts and images

The contact form submits to [Web3Forms](https://web3forms.com) (see the hidden `access_key`
input in `contact.html`), which works on static hosting like GitHub Pages — no server-side
code required.

## Local preview

Open `index.html` directly in a browser, or serve the folder with any static file server.
