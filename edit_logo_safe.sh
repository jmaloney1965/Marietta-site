#!/bin/bash
# Safe logo editor - ONLY targets exact orange colors, leaves everything else alone

cd "$(dirname "$0")"

echo "============================================================"
echo "Safe Logo Editor: Orange → Gold (Blue-safe, precise)"
echo "============================================================"

for file in mrs-logo-tight2-400.png mrs-logo-tight2-600.png mrs-logo-tight2-800.png; do
    if [ -f "$file" ]; then
        echo "Processing $file..."
        
        # Create backup if not exists
        [ ! -f "${file}.backup" ] && cp "$file" "${file}.backup"
        
        # Use VERY tight fuzz (5-10%) to only match exact orange colors
        # Target the exact RGB values we found: rgb(255,140,0), rgb(255,141,0), etc.
        # This won't affect blue pixels which have completely different RGB values
        
        magick "$file" \
            -fuzz 8% -fill "rgb(255,215,0)" -opaque "rgb(255,140,0)" \
            -fuzz 8% -fill "rgb(255,215,0)" -opaque "rgb(255,141,0)" \
            -fuzz 8% -fill "rgb(255,215,0)" -opaque "rgb(255,142,0)" \
            -fuzz 8% -fill "rgb(255,215,0)" -opaque "rgb(255,143,0)" \
            -fuzz 8% -fill "rgb(255,215,0)" -opaque "rgb(255,144,0)" \
            -fuzz 8% -fill "rgb(255,215,0)" -opaque "rgb(255,145,0)" \
            -fuzz 8% -fill "rgb(255,215,0)" -opaque "rgb(255,146,0)" \
            -fuzz 8% -fill "rgb(255,215,0)" -opaque "rgb(255,147,0)" \
            -fuzz 8% -fill "rgb(255,215,0)" -opaque "rgb(255,148,0)" \
            -fuzz 8% -fill "rgb(255,215,0)" -opaque "rgb(255,149,0)" \
            -fuzz 8% -fill "rgb(255,215,0)" -opaque "rgb(255,150,0)" \
            "$file"
        
        echo "  ✓ Processed $file (orange only, 8% fuzz)"
    else
        echo "  ⚠ Warning: $file not found, skipping..."
    fi
done

echo "============================================================"
echo "✓ Complete!"
echo "============================================================"
echo ""
echo "This uses tight 8% fuzz on exact orange RGB values."
echo "Blue pixels (which have high B values) won't match."
