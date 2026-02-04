# Marietta-site

Simple static website for Marietta Research Services (owner Susan F. Mercer).

This repository is a plain static site (HTML, CSS, JS). There is no build step required to serve the site — just serve the files from the repository root.

Prerequisites
- (optional) Node.js and npm — used only for convenience scripts in `package.json`
- Python 3 — for a simple local static server

Local preview

Using the included npm script (requires `npm`):
```bash
npm run preview
```
Or using Python 3 (no install required):
```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

Optional install

Install dev helpers locally (optional):
```bash
npm install
```

Deploy options

- GitHub Pages (recommended): push to the repository and the workflow at `.github/workflows/deploy-pages.yml` will publish the repository root to GitHub Pages on pushes to the `main` branch.
- Manual: use the `gh-pages` approach with the npm script:
```bash
npm run deploy:gh-pages
```
- Other static hosts: Netlify, Vercel, S3 + CloudFront — just point them at the repository root.

Notes
- Ensure your repo's default branch is `main` (or update the workflow to target your branch).
- The site content lives at the repository root (files like `index.html`, `style.css`, `site.js`).

Contact
- Owner: Susan F Mercer
# Marietta-site
owner Susan F Mercer
website
