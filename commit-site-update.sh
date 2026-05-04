#!/bin/bash
# ============================================================================
# Marietta Research Solutions — Site Update Commit Script (May 2026)
# ============================================================================
# Adds 3 new pages (Fragmented Aperture, Blade Antennas, Case Studies),
# updates Services + Dr. Maloney + FAQ, patches nav across all other pages,
# and rewrites the (malformed) sitemap.xml.
#
# USAGE:
#   1. Unzip the bundle so you have a folder like ~/Downloads/live-site-changes/
#   2. cd into your local Marietta-site repo (the one with .git/)
#   3. Run:
#        bash /path/to/commit-site-update.sh /path/to/live-site-changes
#
# Example:
#   cd ~/Marietta-site
#   bash ~/Downloads/commit-site-update.sh ~/Downloads/live-site-changes
# ============================================================================

set -e  # Stop on first error

# ---- 1. Sanity check ------------------------------------------------------
if [ -z "$1" ]; then
  echo "❌ Usage: bash commit-site-update.sh /path/to/live-site-changes"
  exit 1
fi

BUNDLE="$1"

if [ ! -d "$BUNDLE" ]; then
  echo "❌ Bundle folder not found: $BUNDLE"
  exit 1
fi

if [ ! -d ".git" ]; then
  echo "❌ Not a git repo. cd into your Marietta-site folder first."
  exit 1
fi

echo "✅ Bundle: $BUNDLE"
echo "✅ Repo:   $(pwd)"
echo ""

# ---- 2. Make sure we're on main and up to date ----------------------------
echo "▶ Switching to main and pulling latest…"
git checkout main
git pull origin main
echo ""

# ---- 3. Create a feature branch -------------------------------------------
BRANCH="site-update-$(date +%Y%m%d)"
echo "▶ Creating branch: $BRANCH"
git checkout -b "$BRANCH" 2>/dev/null || git checkout "$BRANCH"
echo ""

# ---- 4. Copy all bundled files into the repo root -------------------------
echo "▶ Copying files from bundle…"
FILES=(
  # New pages
  "fragmented-aperture.html"
  "case-studies.html"
  # Updated content pages
  "services.html"
  "dr-maloney.html"
  "faq.html"
  # Sitemap (rewritten clean)
  "sitemap.xml"
  # Nav-only patches
  "index.html"
  "about.html"
  "contact.html"
  "software.html"
  "coming-soon.html"
  "privacy.html"
  "engineering.html"
  "antenna-integration.html"
  "ai.html"
  "sbir.html"
  "patents.html"
)

for f in "${FILES[@]}"; do
  if [ -f "$BUNDLE/$f" ]; then
    cp "$BUNDLE/$f" "./$f"
    echo "  ✓ $f"
  else
    echo "  ⚠ MISSING in bundle: $f"
  fi
done
echo ""

# ---- 5. Show what changed -------------------------------------------------
echo "▶ Files changed (git status):"
git status --short
echo ""

# ---- 6. Stage and commit --------------------------------------------------
echo "▶ Staging and committing…"
git add "${FILES[@]}"

git commit -m "Add Fragmented Aperture and Case Studies pages

- New: fragmented-aperture.html (patented antenna technology landing page)
- New: case-studies.html (representative engagements page; placeholder content)
- Updated: services.html restructured into 3 tiers (Specialty / Core / Proposal & IP). Blade Antennas tile points to existing coming-soon.html (the Fragmented Blade Antennas product line)
- Updated: dr-maloney.html links to the specialty pages
- Updated: faq.html
- Rewrote sitemap.xml (fixed duplicate </urlset> tag) and added new pages
- Added 'Case Studies' link to nav across all 11 other pages
- Bumped style.css and site.js cache busters to v=20260504"

echo ""
echo "✅ Committed to branch: $BRANCH"
echo ""

# ---- 7. Push & next steps -------------------------------------------------
echo "▶ Push the branch with:"
echo "    git push origin $BRANCH"
echo ""
echo "▶ Then either:"
echo "    a) Open a PR on GitHub and merge to main, OR"
echo "    b) Merge locally:"
echo "         git checkout main"
echo "         git merge $BRANCH"
echo "         git push origin main"
echo ""
echo "▶ After merge, in Google Search Console:"
echo "    Resubmit https://www.mariettaresearchsolutions.com/sitemap.xml"
echo ""
echo "🎉 Done."
