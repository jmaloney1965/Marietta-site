# Manual Logo Color Editing Instructions

Since automated color replacement isn't catching all orange pixels, here's how to edit the PNG files manually using Preview.app (built into macOS):

## Method 1: Using Preview.app (Recommended)

1. **Open the logo file:**
   - Navigate to `/Users/jim.maloney/github_clone/Marietta-site/`
   - Double-click `mrs-logo-tight2-800.png` (or any size)
   - It will open in Preview

2. **Use Instant Alpha (if available):**
   - In Preview, go to **Tools → Instant Alpha**
   - Click and drag on the orange "SOLUTIONS" text
   - This selects all similar orange pixels
   - Press Delete to remove the selection (if you want to replace it)

3. **Better method - Use Markup Tools:**
   - In Preview, click the **Markup** button (pen icon) in the toolbar
   - Use the **Shape** tool to draw over orange areas
   - Fill with yellow/gold color: `rgb(255,215,0)` or `rgb(255,200,50)`

## Method 2: Using a Graphics Editor

If you have Photoshop, GIMP, or another editor:

1. Open the PNG file
2. Use **Select → Color Range** (or similar)
3. Click on the orange "SOLUTIONS" text
4. Adjust tolerance to select all orange pixels
5. Fill selection with gold/yellow: `rgb(255,215,0)`
6. Save the file

## Method 3: Online Tool

Use an online image editor like:
- Photopea.com (free Photoshop clone)
- Canva.com
- Remove.bg (for color replacement)

## Target Colors

- **Orange to replace:** Various shades of orange (rgb(255,165,0), rgb(255,140,0), etc.)
- **Gold/Yellow replacement:** `rgb(255,215,0)` or `rgb(255,200,50)`

## Files to Edit

Edit these three files (or at least the 800px version):
- `mrs-logo-tight2-400.png`
- `mrs-logo-tight2-600.png`
- `mrs-logo-tight2-800.png`

After editing, refresh your browser to see the changes!
