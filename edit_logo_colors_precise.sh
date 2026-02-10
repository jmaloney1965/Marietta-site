#!/bin/bash
# Precise logo color editor - ONLY changes orange, leaves blue untouched

cd "$(dirname "$0")"

echo "============================================================"
echo "Precise Logo Editor: Orange → Gold/Yellow (Blue-safe)"
echo "============================================================"

for file in mrs-logo-tight2-400.png mrs-logo-tight2-600.png mrs-logo-tight2-800.png; do
    if [ -f "$file" ]; then
        echo "Processing $file..."
        
        # Create backup if not exists
        [ ! -f "${file}.backup" ] && cp "$file" "${file}.backup"
        
        # Precise method: Only replace pixels that are clearly orange
        # Orange criteria: High red (>200), medium green (100-200), low blue (<100)
        # This excludes blue pixels which have high blue values
        
        # Precise method: Only replace pixels that match orange criteria
        # Orange: High red (>200), medium green (100-200), low blue (<100)
        # Use multiple targeted replacements with tight fuzz, but only on orange-like colors
        
        # First, create a mask of orange pixels (high R, medium G, low B)
        magick "$file" \
            \( -clone 0 -colorspace RGB \
               -channel R -threshold 78% \
               -channel G -threshold 39% -threshold 78% +channel \
               -channel B -threshold 39% +channel \
               -compose Multiply -composite \
               -threshold 50% \
             \) \
            mrs_orange_mask_$$.png
        
        # Apply color replacement ONLY where mask indicates orange
        magick "$file" \
            \( -clone 0 -fill "rgb(255,215,0)" -colorize 100% \) \
            mrs_orange_mask_$$.png \
            -compose Over -composite \
            "$file"
        
        # Cleanup
        rm -f mrs_orange_mask_$$.png
        
        # Also do targeted opaque replacements with very tight fuzz on exact orange colors
        magick "$file" \
            -fuzz 8% -fill "rgb(255,215,0)" -opaque "rgb(255,140,0)" \
            -fuzz 8% -fill "rgb(255,215,0)" -opaque "rgb(255,141,0)" \
            -fuzz 8% -fill "rgb(255,215,0)" -opaque "rgb(255,142,0)" \
            "$file"
        
        echo "  ✓ Processed $file (orange only)"
    else
        echo "  ⚠ Warning: $file not found, skipping..."
    fi
done

echo "============================================================"
echo "✓ Complete!"
echo "============================================================"
