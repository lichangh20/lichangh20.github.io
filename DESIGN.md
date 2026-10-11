# Design

## Source of truth

- Status: Active
- Updated: 2026-10-11
- Surfaces: the personal academic homepage in `index.html`, including mobile and dark mode.
- The owner requests larger, clearer typography, new section-heading fonts, less empty space, and a uniformly text-only publication list. Paper image files stay in the repository.
- Reference evidence: [Haotian's CSS](https://haotiansun.tech/styles.css) uses Inter for biography text and a strong heading hierarchy; [Rushi's CSS](https://rushi-q.github.io/assets/css/main.css) uses compact, text-only publication rows. Browser screenshots and computed styles were inspected on 2026-09-06. These inform principles, not a copied template.
- Existing publication titles, author order, venues, and destinations are preserved. The owner supplied the Qwen / Research Intern (May–Aug 2026, Seattle, OPD in agentic training) and ByteDance Seed / Student Researcher (Aug 2026–Present, San Jose) details directly after the LinkedIn profile could not be retrieved.
- Follow-up: omit work descriptions, on-site labels, and mentor/manager details from industry entries. Rename the third employer to AWS AI Lab, with location New York, United States. Conference reviewing lists NeurIPS, ICLR, ICML, and ACL Rolling Review without years.
- Software: the owner confirms the same two projects listed by Rushi. Descriptions are independently summarized from [STACX](https://github.com/STACX/stacx) and [MLE-Dojo](https://github.com/MLE-Dojo/MLE-Dojo), not copied from the reference homepage.
- Software copy follow-up: keep one concise sentence per project aligned with the research story. STACX emphasizes modular training infrastructure connecting agent experience with model updates; MLE-Dojo emphasizes executable ML experimentation environments, with 200+ Kaggle competitions as the concrete supporting detail.
- Logo sources: the original colored favicon from [ByteDance](https://www.bytedance.com/en/) and the [AWS docs color SVG](https://docs.aws.amazon.com/assets/r/images/aws_logo_light.svg). Both are self-contained local assets, with unchanged original colors. Browser pixel checks must confirm chromatic ByteDance pixels and AWS's orange smile, rather than merely checking that the files load.
- Profile-layout follow-up: remove the blue tagline and Chinese name, put the English name below the portrait, and group email, social links, CV, and visitor statistics in the right column. Reference Rushi's profile hierarchy and Haotian's compact social-icon row, without adopting either template or changing the approved research prose.
- CV update: restore the profile's CV button with the September 2026 PDF at its existing URL. Keep the matching LaTeX source in `.github/cv/CV.tex` as a repository backup without a homepage link.
- Publication update: add Matryoshka Agent with its title, author order, equal-second-author markers, and arXiv Paper link from the updated CV; add the STACX Code link to Revisiting DAgger.
- Visitor audit: the inherited MapMyVisitors account `1c5cj` identifies `pppyb.github.io`, not this site. Rushi's aggregate visit/place counts come from a separate Cloudflare Worker, not that widget. The wrong tracker is disabled. The owner authorized an independent Worker + D1 service; its code and setup guide live in `analytics/`. The homepage uses its own canvas renderer and public-domain Natural Earth coastlines, not Rushi's code or data.
- Globe interaction follow-up: retain the existing renderer and visual style while adding mouse, pen, and single-finger two-axis dragging, inspired by the reference globe's direct manipulation. Use native pointer capture, keep pinch zoom and scrolling outside the globe available, and add keyboard rotation without changing analytics requests or counts.
- Qwen uses the unmodified purple-and-white icon from [the official Qwen blog](https://qwenlm.github.io/favicon.png), embedded locally as `qwen-purple.svg` to avoid reusing the old blue icon's cache.

## Brand

A direct, welcoming academic homepage. Clear type and substantive research lead; a personal ocean portrait adds character. Use a soft white background, charcoal text, and restrained blue links. No decorative display serif, oversized cards, animated slogans, or numbered section labels.

## Product goals

1. Make the research focus and contact details immediately readable.
2. Let readers scan all eight publications without image gaps or inconsistent rows.
3. Clearly present industry roles and academic background without inventing dates or responsibilities.
4. Deliver a local preview before any publishing decision.

## Personas and jobs

- Researchers: understand the research direction, identify papers, and open code.
- Prospective collaborators: find email, academic profiles, and the current CV quickly.
- Hiring teams: read industry experience and education without searching through decorative elements.

## Information architecture

Navigation → research goal and biography → Research, with these two sections beside the portrait / name / contacts / visitor statistics → full-width News → Publications & Preprints → Software → Industry Experience → Academic Service → Awards & Honors → Education → footer.

The right profile column spans only the biography and Research. On desktop, stack identity, contacts, and visitor statistics naturally, with 32px between the CV and globe. Avoid stretching the sidebar or using auto margins to force its bottom to align with Research; natural space below the sidebar is preferable to a large gap within it. News and all later sections use the full reading width. On smaller screens, profile details precede the biography, Research, and News; tablet layouts pair the portrait/name with contacts/statistics, and phones stack the profile information.

## Design principles

- Readability first: increase the entire type scale, not just the hero.
- Consistency: every publication has the same text-only structure; no thumbnail or placeholder frame.
- Density through alignment: modest section spacing, natural text heights, and no page-length sidebar.
- Preserve factual content and existing functionality; add no speculative career claims.
- Use references for hierarchy and rhythm while keeping an independent layout, palette, and typographic treatment.

## Visual language

- Font: Inter, with native system sans-serif and Chinese sans-serif fallbacks. All headings use the same family, with weight rather than ornament creating hierarchy.
- Desktop type: profile name 32px, section heading 32px, paper title 22px, opening motivation 24px, biography 19px, general text 18px, authors/profile contacts/navigation 17px, metadata 16px. No separate research tagline.
- Mobile type: profile name 30px, section headings 28px, paper titles 21px, opening motivation 21px, body 18px, authors and profile contacts 17px, metadata 16px. Do not shrink the root size to fit content.
- Layout: 1088px outer maximum, 32px desktop gutters, 20px phone gutters; 256px profile column with a 48px gap.
- Color tokens: soft white background, charcoal foreground, medium-gray secondary text, blue accents. Dark mode has an equivalent high-contrast palette.
- Spacing: 8px base rhythm; 18–24px within content groups, 44–48px between major sections. Thin separators, no paper cards or shadows.

## Components

- Navigation: a compact row aligned with the full content width, with evenly distributed 17px section links (including About) and a theme toggle. No repeated name/logo or empty brand column. Keep the active underline, keyboard focus, and horizontally scrollable links on narrow screens; never shrink the labels to fit.
- Introduction: one concise italic opening sentence beginning “I work toward”, with Agentic Recursive Self-Improvement, AutoResearch, and Long-Horizon Problem Solving capitalized and emphasized. AutoResearch and Long-Horizon Problem Solving are parallel goals. Follow the goal immediately with the third-year Ph.D. background, current Student Researcher role at ByteDance Seed, and prior undergraduate background. The ByteDance sentence connects both directions to current work: improving model behavior for long-horizon coding tasks and building AutoResearch agents that identify worthwhile questions and develop promising ideas. End with the visible, underlined `cli911@gatech.edu` invitation in the same foreground color as the body.
- Research: a separate section after the biography and before News, in the same left content column. Add a Research navigation link and an h2 heading matching News. Introduce the grid with “My research spans the core technical stack for Agentic RSI, including:”; keep the AutoResearch explanation in the current ByteDance role, since existing papers do not yet cover AutoResearch. Keep the flat 2-by-2 grid with thin horizontal rules, 21px h3 component headings, 18px descriptions, and underlined 16px project links. The headings are Harness Evolution, Efficient On-Policy Learning, Data, Environments & Rubrics, and Training Infrastructure. Each description briefly states the corresponding contribution: learned control and orchestration; on-policy learning with dense expert feedback; executable experimentation tasks and evaluation rubrics; or integrated execution, rollouts, and model updates. Align links at the bottom of each row; stack the four components at 600px and below.
- Profile: intentional square portrait crop with a small corner radius, followed by the English name as the single h1, italic “Ph.D. Student in Computational Science & Engineering”, then “Ph.D. @ Georgia Tech” and “B.Eng. @ Tsinghua” on separate lines in the same muted text color. Five aligned 44px email/social-icon links have accessible labels and focus/hover tooltips; the mail icon reveals the address and opens the mail app. The full-width CV link below the icon row opens the latest PDF and is keyboard-accessible. Use local inline SVGs instead of icon fonts or arrow suffixes.
- News: keep the heading outside a 320px maximum-height scroll region, with a thin theme-aware scrollbar and a stable scrollbar gutter. The labeled region is keyboard-focusable; native scrolling works without JavaScript. Keep the date/body columns on desktop and stacked dates on phones. All project and paper links, including older announcements, share the same blue, underlined, 600-weight style. List updates newest first, including joining ByteDance Seed in August 2026 (long-horizon coding agents and AutoResearch), releasing STACX in July 2026, and releasing Agent DAgger in May 2026 (on-policy experience and dense expert feedback for long-horizon coding agents). Preserve older announcements.
- Publications: venue / title / authors / Paper and Code links; no images, reserved image tracks, badges with tiny uppercase type, or fixed row heights. Resource links use subtle outlined buttons with document/code icons, 16px labels, and at least 40px hit height, without arrow suffixes.
- Software: two compact text rows, each with a 22px linked project name and an 18px description. Heading links use a subtle underline that strengthens on hover/focus, without arrows. Keep each description to one sentence: STACX supplies modular training infrastructure connecting agent experience with model updates; MLE-Dojo supplies executable environments for iterative ML experimentation across 200+ Kaggle competitions. Avoid a comprehensive feature or algorithm list. No cards, figures, or duplicate GitHub buttons.
- Experience: consistently sized organization-logo tiles, company, role, date, and location ending in United States. No on-site labels, work descriptions, or mentor/manager lines. Use authentic colored ByteDance and AWS logos and the official purple/white Qwen mark. Color-specific asset paths prevent reuse of previous versions. Keep the white tiles in both themes; these remain their respective owners' brand assets, not openly licensed artwork.
- Education: existing small organization logos with readable degree and school details.
- Back to top: a 44px button in the footer rather than a floating control that can obscure text. Keep the top anchor even though the redundant navigation brand link is removed.
- Visitor statistics: a 190px locally rendered coastline globe below contacts, followed by `visits · places`, without a Page views heading or arrow. The Worker provides independent aggregate totals and up to 500 coarse location points; never compute totals from a capped marker list. Only the production origin records hits, once per session on a best-effort basis. Local previews only read. Until an endpoint is configured, show em dashes and an explicit unconnected note; empty real databases show zero, errors show unavailable. No historical third-party counts are imported.
- Globe controls: drag horizontally to rotate longitude and vertically to tilt, clamped to ±85 degrees to avoid flipping. Use grab/grabbing cursors, a 16px muted “Drag to rotate” hint, and a focus ring. Arrow keys rotate by 10 degrees (Shift: 20); Home restores the initial view. Single-pointer capture keeps dragging active outside the canvas and releases on pointer up/cancel, capture loss, blur, or page hiding. Ignore secondary buttons and additional fingers.
- Globe location details: hover reveals the nearest visible marker's coarse label and visit count; click or tap pins the detail and pauses spin. Blank taps, outside clicks, Escape, or manual rotation dismiss it. Use a 6px tap/drag threshold, 22px touch hit radius, 10px mouse radius, and stable response order for equal-distance overlaps. The native “Locations” disclosure below the globe exposes available locations as 16px, minimum-44px buttons; selection centers and highlights the location, and activating the selected button again clears it. Keep the list capped at the API's 500 points, scroll it beyond 240px, and never derive global totals from it. Location names are untrusted text, limited to 80 characters with “Unknown location” fallback. No additional network requests, dependencies, precise address inference, or persistent orientation state.

## Accessibility

Maintain readable light/dark contrast, visible focus, skip navigation, semantic headings, descriptive link names, live statistic text, and 44px utility controls. All core content, email links, and the CV link work without JavaScript. The interactive globe is keyboard-focusable with rotation instructions; keep the textual visit/place totals separate. Respect reduced motion by disabling auto-spin while retaining manual rotation. Pause auto-spin while offscreen, hovered, focused, dragging, or in a hidden tab. Keep link underlines in prose so color is not the only link cue.

## Responsive behavior

Navigation remains one compact row at every width; section links scroll within their own container when needed, and the theme toggle stays visible. At 900px and below, profile, biography, Research, and News stack; the profile uses a compact two-column arrangement until 600px, when it becomes a centered vertical stack with a 184px portrait. At phone widths, all main text stays at least 18px and supplemental text at least 16px. Paper titles wrap naturally; author lists never truncate. Check 320, 390, 768, 1024, and 1440px widths plus breakpoint boundaries for document overflow.

## Interaction states

Preserve system-aware theme selection and persisted overrides, navigation scroll tracking, and back-to-top. Visitor states include unconnected, ready with real zero/positive totals, unavailable, no-JavaScript fallback, and coastlines unavailable without hiding the counters. Unavailable statistics must not hide core content. Manual globe rotation works even if statistics or coastlines fail; a missing canvas context or JavaScript leaves the static placeholder and hides the interaction hint. Globe orientation is local UI state only, never persisted or sent to analytics.

## Content voice

First-person, precise, and friendly. No unverified claims, invented employment dates, ornamental labels, copied research prose, or generic promotional sections.

The research introduction presents Agentic Recursive Self-Improvement as a research goal with two related aims: research taste for AutoResearch, including proposing good research ideas, and model behavior on long-horizon tasks, improved through post-training. Keep the opening compact by naming only AutoResearch and Long-Horizon Problem Solving; explain both through the current ByteDance role, with model behavior for long-horizon coding tasks and AutoResearch agents that identify worthwhile questions and develop promising ideas. Existing papers do not yet cover AutoResearch. Existing projects contribute components rather than claiming a completed self-improvement loop. Use a single concise goal sentence without parenthetical abbreviations or an additional explanation of recursive improvement. Harness evolution connects learned black-box model control in Matryoshka Pilot with sub-agent orchestration for long-horizon ML engineering in Matryoshka Agent. Agent DAgger connects on-policy experience with dense expert feedback; MLE-Dojo and DREAM provide experimentation environments and evaluation criteria; STACX supports task execution, rollouts, and model updates. Describe the ByteDance work without implying project leadership.

## Implementation constraints

Plain HTML / CSS / JavaScript on the existing GitHub Pages repository. No framework, application package dependency, or website hosting migration. The owner approved the local design and authorized a GitHub push after the new Cloudflare analytics service passes live checks. Keep original paper image assets and the CV. Validate browser content, typography, responsive layout, theme, navigation, icon access, and no-JavaScript states; inspect screenshots. Test the Worker with SQLite-backed unit tests and local Cloudflare runtime checks before deployment.

## Open questions

- Cloudflare authorization is complete; the dedicated database and Worker are deployed at `https://changhao-visitor-stats.lichangh20.workers.dev`. The homepage is configured to read this service in local preview.
- The owner approved publication after successful live analytics verification; production visit recording begins only once the updated homepage is published.
