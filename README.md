# Changhao Li — Personal Homepage

Personal academic homepage of Changhao Li (李昶昊), Ph.D. student in
Computational Science and Engineering at Georgia Tech.

Live at **https://lichangh20.github.io**.

## Design

A single-page static site — plain HTML / CSS / JS, no framework, no build
step. Inter typography, a soft-white background, and blue links, with generous
type sizes and compact, full-width content sections. The design decisions live
in [DESIGN.md](DESIGN.md). Features:

- Light / dark theme (follows the system, manual toggle persisted)
- Goal-led research introduction, readable immediately and without JavaScript
- Right-hand profile spanning the biography and News, with the name, italic degree direction, and concise school affiliations beneath the portrait
- Five accessible email/social-icon links with tooltips; the CV entry is temporarily hidden pending an update
- Compact, full-width sticky navigation with evenly distributed section links and scrollspy highlighting, without a repeated logo/name
- Uniform text-only publication rows with readable titles, authors, and venue labels
- Software section featuring STACX and MLE-Dojo with concise descriptions and repository links
- Qwen, ByteDance Seed, and AWS AI Lab experience with concise location details
- A locally rendered, draggable visitor globe with a separate, owner-controlled Cloudflare Worker + D1 statistics service
- Reduced-motion support and keyboard-accessible controls
- Fully responsive layout

The purple-and-white Qwen icon comes from [Qwen's official blog](https://qwenlm.github.io/favicon.png).
The colored ByteDance mark comes from the
[official corporate site](https://www.bytedance.com/en/); AWS uses its
[official colored logo](https://docs.aws.amazon.com/assets/r/images/aws_logo_light.svg). These remain their respective owners' brand
assets, not newly licensed project artwork.

The inline GitHub, LinkedIn, and X icons come from
[Bootstrap Icons](https://github.com/twbs/icons), with the
[MIT license](assets/licenses/bootstrap-icons.txt) included locally. No icon font or package dependency is required.
Globe coastlines use [Natural Earth](https://www.naturalearthdata.com/about/terms-of-use/)'s public-domain 1:110m land data, rendered locally without a map library.

## Structure

```
index.html          — all content (bio, news, publications, experience, …)
assets/css/style.css — all styling, themed via CSS custom properties
assets/js/main.js    — theme toggle and scrollspy
assets/js/visitors.js — local globe, aggregate counts, production-only recording
analytics/          — Cloudflare Worker, D1 migration, tests, and setup guide
assets/visitor-globe.html — inert legacy URL; the incorrectly attributed tracker is disabled
assets/img/          — portrait, organization logos, preserved unused paper images
files/               — CV
```

The outdated CV entry is temporarily hidden. Its PDF remains at `files/CV_ChanghaoLi.pdf`
and is still accessible by direct URL. After updating the PDF, remove `hidden` from
the `.contact__cv` link in `index.html` to restore the existing button.

The previous MapMyVisitors token resolved to another website's dashboard and is disabled.
The independent service is deployed at
`https://changhao-visitor-stats.lichangh20.workers.dev` and configured in the visitor section's
`data-stats-endpoint`. See [the analytics guide](analytics/README.md) for maintenance and usage monitoring.
An empty URL deliberately shows unknown counts rather than invented numbers; network errors show an unavailable state.
Only `https://lichangh20.github.io` records a hit; localhost previews are read-only.
Counts begin with the new database. They represent best-effort session visits and coarse
location buckets, not unique people; no raw IP addresses are stored by the application.

Drag the globe with a mouse, pen, or one finger to rotate and tilt it. When focused,
use arrow keys to rotate (hold Shift for larger steps) or Home to reset. Auto-spin
pauses during interaction or focus and honors reduced-motion preferences. Pinch
zoom and scrolling outside the globe remain available. These interactions are
entirely local and do not record extra visits or trigger statistics requests.

## Local preview

```bash
python3 -m http.server 8765 --bind 127.0.0.1
# Open http://127.0.0.1:8765
```

## Deployment

Local edits are not published until pushed to the GitHub Pages source branch.

Served by GitHub Pages from this branch (`redesign`): repository
**Settings → Pages → Branch**. The previous Jekyll site is preserved on
the `academic` branch.

## Checks

Run the globe interaction and analytics regressions without installing dependencies:

```bash
node --test tests/visitors.test.mjs analytics/worker.test.mjs
```

The frontend tests use an isolated DOM/canvas harness and mocked network responses;
they never send real visitor hits. Also check mouse, touch, keyboard, and responsive
behavior in the local browser preview before publishing interaction changes.
