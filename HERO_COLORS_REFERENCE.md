# Zeli Hero Section – Color & Design Reference

The hero has **no background image**. It is built with **CSS gradients and text**. Use these values to recreate it in Figma/Canva or to replace it with your own asset.

---

## Background (main gradient)

Linear gradient, 135° angle, 3 stops:

| Stop | Color name   | Hex       | Use in gradient        |
|------|--------------|-----------|------------------------|
| 0%   | Hero dark 1  | `#120806` | Start (top-left)       |
| 55%  | Hero dark 2  | `#2b1510` | Mid                    |
| 100% | Hero dark 3  | `#0f0706` | End (bottom-right)     |

**CSS:**  
`linear-gradient(135deg, #120806, #2b1510 55%, #0f0706)`

---

## Overlay (soft highlight)

A radial gradient is drawn on top of the main gradient:

- **Shape:** Ellipse, ~1200×800px
- **Position:** 78% from left, 35% from top
- **Stops:**  
  - Center: `rgba(255, 255, 255, 0.08)`  
  - 55%: `rgba(255, 255, 255, 0)`

**CSS:**  
`radial-gradient(1200px 800px at 78% 35%, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0) 55%)`

---

## Decorative blurred circles (::before and ::after)

- **Color:** `radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0) 70%)`
- **::before:** 520×520px, right: -220px, top: 40px, opacity 0.25
- **::after:** 420×420px, right: -140px, top: 150px, opacity 0.18

---

## Text colors

| Element   | Color                         | Notes              |
|----------|-------------------------------|--------------------|
| Title    | `rgba(255, 255, 255, 0.9)`    | “ZELI”             |
| Subtitle | Same white, opacity 0.78      | “Discover Exceptional Talent” |
| Copy     | Same white, opacity 0.7       | Body paragraph     |
| Hairline | `#8b6f55` (zeli-accent), 0.9  | Thin line under subtitle |

---

## Summary – hex / RGB for design tools

```
Hero gradient (background):
  #120806  (RGB 18, 8, 6)
  #2b1510  (RGB 43, 21, 16)
  #0f0706  (RGB 15, 7, 6)

Accent (hairline):
  #8b6f55  (RGB 139, 111, 85)

Text (white with opacity):
  #ffffff at 90%  (title)
  #ffffff at 78%  (subtitle)
  #ffffff at 70%  (copy)
```

---

## Replacing with an image

If you design a new hero image (e.g. same gradient + text in Figma/Canva):

1. Export as PNG or JPG (e.g. `hero-bg.jpg`).
2. Put it in `public/` (e.g. `public/hero-bg.jpg`).
3. In `Hero.module.css`, set `.hero` to use the image, e.g.:

```css
.hero {
  background-image: url('/hero-bg.jpg');
  background-size: cover;
  background-position: center;
  /* keep or remove the radial overlay for a soft highlight */
}
```

You can keep the current text in the HTML and layer it over the image, or bake the text into the image and hide the on-page text.
