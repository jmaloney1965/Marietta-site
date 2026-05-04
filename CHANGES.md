# Marietta Research Solutions — Site Update (May 2026)

This bundle is a **drop-in replacement** for the public site. Files in this folder map 1:1 to the repo root.

## Summary of changes

**Visual refresh — site-wide**
- New `style.css` with a unified design-token system (navy/gold palette, Source Serif display type, consistent shadows, radii, and spacing).
- New `site.js` provides: active-nav highlighting, back-to-top, FAQ accordion, services task-filter, and form-submit overlay.
- Every page now uses a serif display headline, navy gradient hero, and a consistent CTA box.
- Mobile breakpoints reviewed; nav wraps cleanly at 600px and below.

**Page rewrites (8)**
- `index.html` — new hero, proof strip, three-card capability summary, leadership cards.
- `about.html` — editorial layout with pull-quote, leadership cards, patents-as-cards, contractor-network triad.
- `dr-maloney.html` — bio with at-a-glance stats, signature contributions as cards, awards list.
- `services.html` — task-filter chips ("I need to…") + capability cards + engagement-rail tiles.
- `case-studies.html` — **NEW** — five worked-example cards (CC1101 matching network, GPS CRPA, wide-scan PCB array, switched aperture, custom FDTD).
- `fragmented-aperture.html` — long-form research page with patents, key papers, applications, book cross-link.
- `faq.html` — accordion of grouped Q&A (engagement, IP, technical, products).
- `contact.html` — three-section form (who/what/details) + quick-contact card + escape-hatch links.

**Nav patched on legacy pages (9)**
`ai.html`, `antenna-integration.html`, `blade-antennas.html`, `coming-soon.html`, `engineering.html`, `patents.html`, `privacy.html`, `sbir.html`, `software.html` — nav rewritten to the new 8-link set; `style.css` and `site.js` versions bumped to `?v=20260504`.

**Other**
- `sitemap.xml` updated with all 17 URLs and 2026-05-04 lastmod.
- Existing `jargon-translator.js` left untouched; still wired on every page.

## Deployment checklist

1. Drop the contents of `live-site-changes/` into the repo root, overwriting existing files.
2. Confirm assets referenced by the new pages exist:
   - `mrs-logo-full-{400,600,800}-tight-gold_decontam.png` ✓ (already live)
   - `favicon.svg`, `favicon-16.png`, `favicon-32.png`, `apple-touch-icon.png` ✓
   - `og-image.png` ✓
   - `manifest.json` ✓
   - `capabilities.pdf` ✓
   - `jargon-translator.js` ✓
3. Optional new asset: `assets/fragmented/improved-patent.png` (a placeholder appears on `fragmented-aperture.html` if missing — design works without it).
4. Hard-refresh + test on mobile (≤480px) and desktop. The cache-bust query string `?v=20260504` should force fresh CSS/JS.
5. Smoke test: every page nav, FAQ accordion (`faq.html`), services task-filter chips (`services.html`).

## Versions

- `style.css?v=20260504`
- `site.js?v=20260504`
- Last updated: May 2026
