# Changhao Li — Personal Homepage (redesign branch)

A dependency-free static homepage (plain HTML / CSS / JS). The main site
(Jekyll, academicpages theme) lives on the `academic` branch.

## Local preview

```bash
git checkout redesign
python3 -m http.server 8000
# open http://localhost:8000
```

Or simply open `index.html` in a browser.

## Deploy to GitHub Pages

Push this branch, then on GitHub: **Settings → Pages → Build and deployment →
Branch: `redesign` / (root) → Save**. The site goes live at
https://lichangh20.github.io within a minute or two. Switch the branch back to
`academic` at any time to restore the old site.

## Where to put images

Every image below is optional — until you upload one, the page shows an
elegant auto-generated placeholder (gradient tile with the paper name, or a
monogram for logos). Filenames must match exactly; both `.png` and `.jpg`
work (`.png` is tried first, then `.jpg`).

### Paper thumbnails → `assets/img/papers/`

Recommended size: ~800×600 (4:3). A teaser figure from the paper works best.

| File | Paper |
| --- | --- |
| `dagger.png` | Revisiting DAgger in the Era of LLM-Agents |
| `exploration.png` | Exploration-Driven Optimization for Test-Time LLM Reasoning |
| `dream.png` | DREAM: Deep Research Evaluation with Agentic Metrics |
| `matryoshka.png` | Matryoshka: Learning to Drive Black-Box LLMs with LLMs |
| `mle-dojo.png` | MLE-Dojo |
| `ts-zsq.png` | Task-Specific Zero-shot Quantization-Aware Training |
| `int4.png` | Training Transformers with 4-bit Integers |

### Organization logos → `assets/img/logos/`

Prefer SVG vector marks (crisp at any size; transparent background).
`.svg` is tried first, then `.png`, then `.jpg`.

| File | Organization |
| --- | --- |
| `amazon.svg` | Amazon (experience card) |
| `gatech.svg` | Georgia Tech (education card) |
| `tsinghua.svg` | Tsinghua University (education card) |

### Profile photo

`assets/img/profile.jpg` — replace to update the portrait.

### CV

`files/CV_ChanghaoLi.pdf` — replace to update the CV download.
