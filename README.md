# Changhao Li — Personal Homepage

Personal academic homepage of Changhao Li (李昶昊), Ph.D. student in
Computational Science and Engineering at Georgia Tech.

Live at **https://lichangh20.github.io**.

## Design

A single-page static site — plain HTML / CSS / JS, no framework, no build
step. Navy & brass editorial palette with Fraunces serif display type,
Figtree body text, and JetBrains Mono accents. Features:

- Light / dark theme (follows the system, manual toggle persisted)
- Typewriter intro line in the hero
- Sticky navigation with scrollspy highlighting
- Publication cards with teaser figures and venue badges
- Scroll-reveal animations (honors `prefers-reduced-motion`)
- Fully responsive layout

## Structure

```
index.html          — all content (bio, news, publications, experience, …)
assets/css/style.css — all styling, themed via CSS custom properties
assets/js/main.js    — theme toggle, scrollspy, typewriter, reveal
assets/img/          — portrait, paper teasers, organization logos
files/               — CV
```

## Local preview

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

## Deployment

Served by GitHub Pages from this branch (`redesign`): repository
**Settings → Pages → Branch**. The previous Jekyll site is preserved on
the `academic` branch.
