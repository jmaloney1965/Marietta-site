# Manual Logo Color Editing Instructions

## Option A: Photopea.com (Recommended - Free, Browser-based)

### Step 1: Open Photopea
1. Go to **https://www.photopea.com/** in your browser
2. Click **File → Open** (or drag and drop)
3. Navigate to and open: `/Users/jim.maloney/github_clone/Marietta-site/mrs-logo-tight2-800.png`
   - **Note:** The files have been restored to original versions (clean orange, no modifications)

### Step 2: Select Orange Pixels (Handling Gradients)

**Method 1: Color Range with Higher Fuzziness**
1. Go to **Select → Color Range**
2. Click on the orange "SOLUTIONS" text (or the orange swoosh on the M)
3. Adjust the **Fuzziness** slider to **80-100** to catch gradient/transition pixels
   - You should see a white preview showing selected areas
   - **Important:** Watch the preview - if blue areas start getting selected, reduce fuzziness slightly
   - The goal is to select orange AND the orange-to-blue transition pixels
4. Click **OK**

**Method 2: Use Hue/Saturation Instead (Better for Gradients)**
Skip selection entirely - use this method instead (see Step 3B below)

### Step 3: Replace with Gold/Yellow

**Method A: Fill Selected Area (for solid selections)**
1. Go to **Edit → Fill** (or press Shift+F5)
2. Choose **Color** from the dropdown
3. Click the **color swatch/box** (it will open a color picker dialog)
4. In the color picker dialog, look for a text field that says **"#"** or **"Hex"** or **"HTML"**
5. Type: `FFD700` (no # needed, or add # if it requires it: `#FFD700`)
   - This is gold color
   - Alternative: `FFC832` for yellow-gold
6. Click **OK** in the color picker
7. Click **OK** in the Fill dialog

**Method B: Using RGB Values (Alternative)**
1. Go to **Edit → Fill** (or press Shift+F5)
2. Choose **Color** from the dropdown
3. Click the **color swatch/box**
4. In the color picker, look for **R, G, B** fields
5. Enter:
   - **R:** `255`
   - **G:** `215`
   - **B:** `0`
6. Click **OK** in the color picker
7. Click **OK** in the Fill dialog

**Method C: Visual Color Picker**
1. Go to **Edit → Fill** → **Color**
2. Click the color swatch
3. In the color picker, drag the **hue slider** to yellow/gold area (around the middle-right)
4. Adjust **saturation** and **brightness** to get a nice gold color
5. Click **OK**

**Method D: Hue/Saturation Adjustment (BEST for Gradients/Transitions)**
This method preserves gradients and transitions better than Fill:

1. **DON'T select anything first** - work on the whole image
2. Go to **Image → Adjustments → Hue/Saturation** (or press Ctrl+U / Cmd+U)
3. In the dropdown at the top, select **"Reds"** (orange is close to red in the color spectrum)
4. Adjust the **Hue** slider to shift orange toward yellow/gold:
   - Move slider to the right (toward yellow) - try values around **+20 to +40**
   - Watch the preview - orange should shift to gold/yellow
5. You can also try **"Yellows"** and adjust the range sliders at the bottom to include orange tones
6. Adjust **Saturation** if needed (increase slightly for more vibrant gold)
7. Adjust **Lightness** if needed (slight increase for brighter gold)
8. Click **OK**
9. **Check the result:** Orange should be gold, but blue areas should remain unchanged
10. If blue areas changed, use **Edit → Undo** and try adjusting the color range sliders at the bottom to narrow the selection

**Method E: Replace Color (Most Precise for Gradients)**
This is often the best method for gradients:

1. Go to **Image → Adjustments → Replace Color**
2. Click on the orange area in your image (the "SOLUTIONS" text or orange swoosh)
3. Adjust **Fuzziness** slider to **100-150** to catch gradient/transition pixels
   - Higher fuzziness catches more transitional colors
   - Watch the preview window - white areas = will be changed
4. Adjust **Hue** slider to shift toward yellow/gold:
   - Move to the right: try **+20 to +40**
   - Orange should shift to gold/yellow in preview
5. Adjust **Saturation** if needed (increase for more vibrant gold)
6. Adjust **Lightness** if needed (increase for brighter gold)
7. Click **OK**
8. If some orange pixels weren't caught, repeat the process clicking on those areas

**Method F: Using Color Range + Fill (Alternative)**
1. **Select → Color Range**
2. Click on orange area
3. Set **Fuzziness** to **100-150** (very high to catch gradients)
4. Click **OK**
5. **Edit → Fill → Color** → Use RGB: R=255, G=215, B=0
6. This fills the selected gradient areas with solid gold

### Step 4: Deselect and Check
1. Press **Ctrl+D** (Cmd+D on Mac) to deselect
2. Check that:
   - Orange "SOLUTIONS" text is now gold/yellow ✓
   - Blue "M" and "Marietta Research" are unchanged ✓
   - Orange swoosh is now gold/yellow ✓

### Step 5: Save
1. Go to **File → Export As → PNG**
2. Save as `mrs-logo-tight2-800.png` (overwrite the original)
3. Repeat for `mrs-logo-tight2-600.png` and `mrs-logo-tight2-400.png`

---

## Option B: GIMP (Free Desktop App)

### Step 1: Install and Open
1. Download GIMP from **https://www.gimp.org/**
2. Install and open GIMP
3. Open `mrs-logo-tight2-800.png`

### Step 2: Select by Color
1. Go to **Select → By Color**
2. Click on the orange "SOLUTIONS" text
3. Adjust **Threshold** slider (try 30-50) to select all orange pixels
4. Make sure blue areas aren't selected

### Step 3: Replace Color
1. Go to **Colors → Colorize**
2. Adjust **Hue** slider to shift toward yellow/gold (around 45-55 degrees)
3. Adjust **Saturation** and **Lightness** as needed
4. Click **OK**

**OR** use **Colors → Hue-Saturation**:
1. Select **Orange** from the color range dropdown
2. Adjust **Hue** slider to shift orange toward yellow
3. Click **OK**

### Step 4: Save
1. **File → Export As**
2. Save as PNG (overwrite original)
3. Repeat for other sizes

---

## Option C: Preview.app + Online Tool

If you want to use Preview.app:
1. Open the PNG in Preview
2. Use **Tools → Adjust Color** (limited control)
3. Or export and use Photopea.com for better control

---

## Target Colors

- **Orange to replace:** `rgb(255,140,0)` or `#FF8C00`
- **Gold/Yellow replacement:** `rgb(255,215,0)` or `#FFD700`

## Files to Edit

Edit these three files:
- `mrs-logo-tight2-400.png`
- `mrs-logo-tight2-600.png`  
- `mrs-logo-tight2-800.png`

**Tip:** Edit the 800px version first, then scale it down to create the smaller versions if needed.

## After Editing

1. Refresh your browser (Cmd+Shift+R) to see changes
2. The version parameters (`?v=20260209g`) will ensure browsers load the new images
