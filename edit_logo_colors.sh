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
        
        # Use selective color replacement with -opaque to only change orange pixels
        # This method only affects pixels that match the specified colors, leaving
        # blue and other colors unchanged
        
        magick "$file" \
            -fuzz 15% -fill "rgb(255,215,0)" -opaque "rgb(255,140,0)" \
            -fuzz 15% -fill "rgb(255,215,0)" -opaque "rgb(255,165,0)" \
            -fuzz 12% -fill "rgb(255,200,50)" -opaque "rgb(255,150,20)" \
            -fuzz 12% -fill "rgb(255,220,80)" -opaque "rgb(255,180,50)" \
            -fuzz 10% -fill "rgb(255,210,60)" -opaque "rgb(255,160,30)" \
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
