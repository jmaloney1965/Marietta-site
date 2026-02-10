# Logo Color Variations Guide

## Overview
The site uses the `mrs-logo-tight2-*` versions (400px, 600px, 800px) as the main logo across all pages. These tight versions are properly cropped to remove surrounding white space. CSS filter classes have been added to `style.css` to allow easy color variations without editing image files.

## How to Apply Color Variations

Add one of the following classes to the `<img>` tag with class `site-logo-img`:

### Example:
```html
<img
  class="site-logo-img logo-bright"
  src="mrs-logo-full-800.png"
  alt="Marietta Research Solutions"
/>
```

## Available Color Options

1. **`.logo-bright`** - Brighter and more vibrant (brightness: 1.15, saturation: 1.2)
2. **`.logo-muted`** - Softer, muted appearance (brightness: 0.9, saturation: 0.85)
3. **`.logo-bold`** - High contrast, bold look (contrast: 1.2, brightness: 1.1)
4. **`.logo-warm`** - Warmer tone with slight orange/yellow shift
5. **`.logo-cool`** - Cooler tone with slight blue shift
6. **`.logo-dark`** - Darker, professional appearance
7. **`.logo-light`** - Light, subtle appearance
8. **`.logo-invert`** - Inverted (white) - useful for dark backgrounds
9. **`.logo-sepia`** - Sepia/toned effect
10. **`.logo-blue-tint`** - Blue tint overlay

## Customization

To create your own color variation, edit `style.css` and add a new class:

```css
.logo-custom-name {
  filter: brightness(1.0) saturate(1.0) hue-rotate(0deg);
}
```

### Filter Properties Explained:
- **brightness()** - Controls lightness (1.0 = normal, >1.0 = brighter, <1.0 = darker)
- **saturate()** - Controls color intensity (1.0 = normal, >1.0 = more vibrant, <1.0 = more muted)
- **hue-rotate()** - Shifts colors around the color wheel (0deg = no change, 180deg = opposite colors)
- **contrast()** - Adjusts contrast (1.0 = normal, >1.0 = higher contrast)
- **sepia()** - Adds sepia tone (0 = none, 1.0 = full sepia)

## Notes

- All filters include a smooth transition (0.3s ease) for smooth color changes
- Filters can be combined - experiment with different values
- For PNG images, filters work best when the logo has good contrast
- Test on different backgrounds to ensure readability
