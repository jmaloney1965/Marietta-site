#!/bin/bash
# Script to change orange to gold/yellow in logo PNGs using ImageMagick

cd "$(dirname "$0")"

echo "============================================================"
echo "Logo Color Editor: Orange → Gold/Yellow"
echo "============================================================"

for file in mrs-logo-tight2-400.png mrs-logo-tight2-600.png mrs-logo-tight2-800.png; do
    if [ -f "$file" ]; then
        echo "Processing $file..."
        
        # Create backup
        cp "$file" "${file}.backup"
        
        # Use ImageMagick to replace orange colors with gold/yellow
        # Method: Convert to HSL, shift hue from orange (30deg) to yellow/gold (55deg)
        # This affects ALL pixels in the orange hue range, regardless of texture
        
        # Step 1: Convert to HSL colorspace
        # Step 2: Shift hue channel: orange (30deg/360 = 0.083) to yellow (55deg/360 = 0.153)
        # Step 3: Convert back to RGB
        
        magick "$file" \
            -colorspace HSL \
            -channel R \
            -evaluate multiply 0 \
            -evaluate add 0.153 \
            -channel G -evaluate multiply 1.0 \
            -channel B -evaluate multiply 1.0 \
            -colorspace sRGB \
            "$file" 2>/dev/null || \
        
        # Fallback: Use very aggressive fuzz with multiple passes
        magick "$file" \
            -fuzz 60% -fill "rgb(255,215,0)" -opaque "rgb(255,140,0)" \
            -fuzz 60% -fill "rgb(255,215,0)" -opaque "rgb(255,165,0)" \
            -fuzz 50% -fill "rgb(255,200,50)" -opaque "rgb(255,150,20)" \
            -fuzz 50% -fill "rgb(255,220,80)" -opaque "rgb(255,180,50)" \
            "$file"
        
        echo "  ✓ Processed $file"
    else
        echo "  ⚠ Warning: $file not found, skipping..."
    fi
done

echo "============================================================"
echo "✓ Complete!"
echo "============================================================"
echo ""
echo "Backups saved as *.backup files"
echo "Refresh your browser to see the changes"
