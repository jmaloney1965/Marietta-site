#!/usr/bin/env python3
"""
Script to change orange text in logo PNGs to yellow/gold.
Edits mrs-logo-tight2-*.png files to replace orange with yellow/gold.
"""

import sys
import os

try:
    from PIL import Image
except ImportError:
    print("Installing Pillow...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "Pillow", "--quiet"])
    from PIL import Image
    print("Pillow installed successfully!")

def rgb_to_hsv(r, g, b):
    """Convert RGB to HSV for better color matching."""
    r, g, b = r/255.0, g/255.0, b/255.0
    max_val = max(r, g, b)
    min_val = min(r, g, b)
    delta = max_val - min_val
    
    # Value (brightness)
    v = max_val
    
    # Saturation
    if max_val == 0:
        s = 0
    else:
        s = delta / max_val
    
    # Hue
    if delta == 0:
        h = 0
    elif max_val == r:
        h = 60 * (((g - b) / delta) % 6)
    elif max_val == g:
        h = 60 * (((b - r) / delta) + 2)
    else:  # max_val == b
        h = 60 * (((r - g) / delta) + 4)
    
    return h, s, v

def is_orange_color(r, g, b, threshold=30):
    """
    Check if a color is orange (hue around 20-40 degrees).
    Returns True if the color is in the orange range.
    """
    h, s, v = rgb_to_hsv(r, g, b)
    # Orange hue is typically 15-45 degrees
    # Also check saturation and value to avoid grays/blacks
    return (15 <= h <= 45) and s > 0.3 and v > 0.2

def orange_to_gold(r, g, b):
    """
    Convert orange RGB to gold/yellow RGB.
    Gold/yellow is around hue 45-60 degrees.
    """
    h, s, v = rgb_to_hsv(r, g, b)
    
    # Shift hue from orange (20-40) to yellow/gold (45-55)
    if 15 <= h <= 45:
        # Map orange range to yellow/gold range
        new_h = 50  # Yellow-gold hue
        # Keep saturation high for vibrant gold
        new_s = min(s * 1.1, 1.0)
        # Slightly brighter for gold
        new_v = min(v * 1.05, 1.0)
    else:
        # Not orange, return original
        return r, g, b
    
    # Convert HSV back to RGB
    c = new_v * new_s
    x = c * (1 - abs((new_h / 60) % 2 - 1))
    m = new_v - c
    
    if 0 <= new_h < 60:
        r_new, g_new, b_new = c, x, 0
    elif 60 <= new_h < 120:
        r_new, g_new, b_new = x, c, 0
    else:
        r_new, g_new, b_new = c, c, 0
    
    return int((r_new + m) * 255), int((g_new + m) * 255), int((b_new + m) * 255)

def edit_logo_file(filepath):
    """Edit a logo PNG file to change orange to gold/yellow."""
    print(f"Processing {filepath}...")
    
    # Open image
    img = Image.open(filepath)
    
    # Convert to RGBA if needed (to preserve transparency)
    if img.mode != 'RGBA':
        img = img.convert('RGBA')
    
    # Get pixel data
    pixels = img.load()
    width, height = img.size
    
    # Count changes
    changed_pixels = 0
    
    # Process each pixel
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            
            # Check if pixel is orange
            if is_orange_color(r, g, b):
                # Convert to gold/yellow
                r_new, g_new, b_new = orange_to_gold(r, g, b)
                pixels[x, y] = (r_new, g_new, b_new, a)
                changed_pixels += 1
    
    # Save the modified image
    output_path = filepath  # Overwrite original
    img.save(output_path, 'PNG', optimize=True)
    print(f"  ✓ Changed {changed_pixels} pixels from orange to gold/yellow")
    print(f"  ✓ Saved to {output_path}")
    
    return changed_pixels

def main():
    """Main function to process all logo files."""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    logo_files = [
        'mrs-logo-tight2-400.png',
        'mrs-logo-tight2-600.png',
        'mrs-logo-tight2-800.png'
    ]
    
    print("=" * 60)
    print("Logo Color Editor: Orange → Gold/Yellow")
    print("=" * 60)
    
    total_changed = 0
    for filename in logo_files:
        filepath = os.path.join(script_dir, filename)
        if os.path.exists(filepath):
            changed = edit_logo_file(filepath)
            total_changed += changed
        else:
            print(f"⚠ Warning: {filename} not found, skipping...")
    
    print("=" * 60)
    print(f"✓ Complete! Processed {len(logo_files)} files")
    print("=" * 60)
    print("\nNext steps:")
    print("1. Refresh your browser to see the changes")
    print("2. If the color needs adjustment, edit the orange_to_gold() function")
    print("   and run this script again")

if __name__ == '__main__':
    main()
