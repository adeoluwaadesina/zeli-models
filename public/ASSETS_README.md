# Where to put your images

Put these files in this folder (`public/`):

| File | Used for |
|------|----------|
| **logo.jpg** (or logo.png / logo.svg) | Header logo – replaces the "ZELI / MODELS" text. The site expects **logo.jpg** by default; if you use PNG or SVG, update the `src` in `src/components/SiteHeader.tsx`. |
| **hero-logo.jpg** | White logo shown in the hero section (replaces the "ZELI" text). Place your white/light logo JPEG here; the site uses `/hero-logo.jpg`. If you use PNG, change the `src` in `src/components/Hero.tsx` to `/hero-logo.png`. |
| **hero-with-logo.jpg** | Hero section background (with your logo on it). The tagline and paragraph appear below. PNG also works – if you use `hero-with-logo.png`, update the path in `src/components/Hero.module.css`. |

After adding the files, the site will use them automatically.
