#!/bin/bash
# More aggressive logo color editor using mask-based approach

cd "$(dirname "$0")"

echo "============================================================"
echo "Logo Color Editor v2: Orange → Gold/Yellow (Mask-based)"
echo "============================================================"

for file in mrs-logo-tight2-400.png mrs-logo-tight2-600.png mrs-logo-tight2-800.png; do
    if [ -f "$file" ]; then
        echo "Processing $file..."
        
        # Create backup if not exists
        [ ! -f "${file}.backup" ] && cp "$file" "${file}.backup"
        
        # Method: Create a mask of orange pixels, then colorize only those pixels
        # Step 1: Create mask of orange pixels (hue between 15-45 degrees in HSL)
        magick "$file" \
            \( -clone 0 -colorspace HSL -separate -delete 1,2 \
               -threshold 4.2% -negate \
               \( -clone 0 -threshold 12.5% \) \
               -compose Minus -composite \
               -threshold 50% \
             \) \
            -alpha off \
            mrs_mask_$$.png
        
        # Step 2: Create gold/yellow version
        magick "$file" \
            -colorspace HSL \
            -channel R -evaluate add 25% \
            -colorspace sRGB \
            mrs_gold_$$.png
        
        # Step 3: Composite: use gold where mask is white, original where mask is black
        magick "$file" \
            mrs_gold_$$.png \
            mrs_mask_$$.png \
            -composite \
            "$file"
        
        # Cleanup
        rm -f mrs_mask_$$.png mrs_gold_$$.png
        
        echo "  ✓ Processed $file"
    else
        echo "  ⚠ Warning: $file not found, skipping..."
    fi
done

echo "============================================================"
echo "✓ Complete!"
echo "============================================================"
