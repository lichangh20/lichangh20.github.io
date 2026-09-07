# Design

## Source of truth

- Status: Active
- Updated: 2026-09-06
- Surfaces: the personal academic homepage in `index.html`, including mobile and dark mode.
- The owner requests larger, clearer typography, new section-heading fonts, less empty space, and a uniformly text-only publication list. Paper image files stay in the repository.
- Reference evidence: [Haotian's CSS](https://haotiansun.tech/styles.css) uses Inter for biography text and a strong heading hierarchy; [Rushi's CSS](https://rushi-q.github.io/assets/css/main.css) uses compact, text-only publication rows. Browser screenshots and computed styles were inspected on 2026-09-06. These inform principles, not a copied template.
- Existing publication titles, author order, venues, and destinations are preserved. The owner supplied the Qwen / Research Intern (May–Aug 2026, Seattle, OPD in agentic training) and ByteDance Seed / Student Researcher (Aug 2026–Present, San Jose) details directly after the LinkedIn profile could not be retrieved.
- Follow-up: omit work descriptions, on-site labels, and mentor/manager details from industry entries. Rename the third employer to AWS AI Lab, with location New York, United States. Conference reviewing lists NeurIPS, ICLR, ICML, and ACL Rolling Review without years.
- Software: the owner confirms the same two projects listed by Rushi. Descriptions are independently summarized from [STACX](https://github.com/STACX/stacx) and [MLE-Dojo](https://github.com/MLE-Dojo/MLE-Dojo), not copied from the reference homepage.
- STACX copy refers to support for multiple training algorithms without listing individual algorithms.
- Logo sources: the original colored favicon from [ByteDance](https://www.bytedance.com/en/) and the [AWS docs color SVG](https://docs.aws.amazon.com/assets/r/images/aws_logo_light.svg). Both are self-contained local assets, with unchanged original colors. Browser pixel checks must confirm chromatic ByteDance pixels and AWS's orange smile, rather than merely checking that the files load.
- Profile-layout follow-up: remove the blue tagline and Chinese name, put the English name below the portrait, and group email, social links, CV, and visitor statistics in the right column. Reference Rushi's profile hierarchy and Haotian's compact social-icon row, without adopting either template or changing the approved research prose.
- Visitor audit: the inherited MapMyVisitors account `1c5cj` identifies `pppyb.github.io`, not this site. Rushi's aggregate visit/place counts come from a separate Cloudflare Worker, not that widget. The wrong tracker is disabled. The owner authorized an independent Worker + D1 service; its code and setup guide live in `analytics/`. The homepage uses its own canvas renderer and public-domain Natural Earth coastlines, not Rushi's code or data.
- Qwen uses the unmodified purple-and-white icon from [the official Qwen blog](https://qwenlm.github.io/favicon.png), embedded locally as `qwen-purple.svg` to avoid reusing the old blue icon's cache.

## Brand

A direct, welcoming academic homepage. Clear type and substantive research lead; a personal ocean portrait adds character. Use a soft white background, charcoal text, and restrained blue links. No decorative display serif, oversized cards, animated slogans, or numbered section labels.

## Product goals

1. Make the research focus and contact details immediately readable.
2. Let readers scan all seven publications without image gaps or inconsistent rows.
3. Clearly present industry roles and academic background without inventing dates or responsibilities.
4. Deliver a local preview before any publishing decision.

## Personas and jobs

- Researchers: understand the research direction, identify papers, and open code.
- Prospective collaborators: find email, academic profiles, and CV quickly.
- Hiring teams: read industry experience and education without searching through decorative elements.

## Information architecture

Navigation → introduction and News beside the portrait / name / contacts / visitor statistics → Publications & Preprints → Software → Industry Experience → Academic Service → Awards & Honors → Education → footer.

The right profile column spans the introduction and News, so its height does not create a blank area beneath the biography. Publications and all later sections use the full reading width. On smaller screens, profile details precede the biography and News; tablet layouts pair the portrait/name with contacts/statistics, and phones stack the profile information.

## Design principles

- Readability first: increase the entire type scale, not just the hero.
- Consistency: every publication has the same text-only structure; no thumbnail or placeholder frame.
- Density through alignment: modest section spacing, natural text heights, and no page-length sidebar.
- Preserve factual content and existing functionality; add no speculative career claims.
- Use references for hierarchy and rhythm while keeping an independent layout, palette, and typographic treatment.

## Visual language

- Font: Inter, with native system sans-serif and Chinese sans-serif fallbacks. All headings use the same family, with weight rather than ornament creating hierarchy.
- Desktop type: profile name 32px, section heading 32px, paper title 22px, biography 19px, general text 18px, authors/profile contacts/navigation 17px, metadata 16px. No separate research tagline.
- Mobile type: profile name 30px, section headings 28px, paper titles 21px, body 18px, authors and profile contacts 17px, metadata 16px. Do not shrink the root size to fit content.
- Layout: 1088px outer maximum, 32px desktop gutters, 20px phone gutters; 256px profile column with a 48px gap.
- Color tokens: soft white background, charcoal foreground, medium-gray secondary text, blue accents. Dark mode has an equivalent high-contrast palette.
- Spacing: 8px base rhythm; 18–24px within content groups, 44–48px between major sections. Thin separators, no paper cards or shadows.

## Components

- Navigation: a compact row aligned with the full content width, with evenly distributed 17px section links (including About) and a theme toggle. No repeated name/logo or empty brand column. Keep the active underline, keyboard focus, and horizontally scrollable links on narrow screens; never shrink the labels to fit.
- Introduction: readable biography with an italic 500-weight Inter opening goal, without the blue tagline or Chinese name. Link the five named projects using the existing underlined prose-link style; keep the goal and supporting work in one paragraph. Follow with the third-year Ph.D. background, then the current Student Researcher role and contributions at ByteDance Seed, then the prior undergraduate background. End the research invitation with a visible, underlined `cli911@gatech.edu` mail link; retain the profile's email icon as a shortcut. The invitation uses the same foreground color as the body, not muted gray.
- Profile: intentional square portrait crop with a small corner radius, followed by the English name as the single h1, italic “Ph.D. Student in Computational Science & Engineering”, then “Ph.D. @ Georgia Tech” and “B.Eng. @ Tsinghua” on separate lines in the same muted text color. Five aligned 44px email/social-icon links have accessible labels and focus/hover tooltips; the mail icon reveals the address and opens the mail app. Place a full-width CV link immediately below, aligned with the icon row. Use local inline SVGs instead of icon fonts or arrow suffixes.
- Publications: venue / title / authors / Paper and Code links; no images, reserved image tracks, badges with tiny uppercase type, or fixed row heights. Resource links use subtle outlined buttons with document/code icons, 16px labels, and at least 40px hit height, without arrow suffixes.
- Software: two compact text rows, each with a 22px linked project name and an 18px description. Heading links use a subtle underline that strengthens on hover/focus, without arrows. Descriptions summarize verified execution, rollout, training and feedback capabilities from the official repositories. Keep STACX's multiple-algorithm phrasing, without a list of algorithms. No cards, figures, or duplicate GitHub buttons.
- Experience: consistently sized organization-logo tiles, company, role, date, and location ending in United States. No on-site labels, work descriptions, or mentor/manager lines. Use authentic colored ByteDance and AWS logos and the official purple/white Qwen mark. Color-specific asset paths prevent reuse of previous versions. Keep the white tiles in both themes; these remain their respective owners' brand assets, not openly licensed artwork.
- Education: existing small organization logos with readable degree and school details.
- Back to top: a 44px button in the footer rather than a floating control that can obscure text. Keep the top anchor even though the redundant navigation brand link is removed.
- Visitor statistics: a 190px locally rendered coastline globe below contacts, followed by `visits · places`, without a Page views heading or arrow. The Worker provides independent aggregate totals and up to 500 coarse location points; never compute totals from a capped marker list. Only the production origin records hits, once per session on a best-effort basis. Local previews only read. Until an endpoint is configured, show em dashes and an explicit unconnected note; empty real databases show zero, errors show unavailable. No historical third-party counts are imported.

## Accessibility

Maintain readable light/dark contrast, visible focus, skip navigation, semantic headings, descriptive link names, live statistic text, and 44px utility controls. All core content and email/CV links work without JavaScript. Respect reduced motion; pause the decorative globe when offscreen, hovered, or in a hidden tab. Keep link underlines in prose so color is not the only link cue.

## Responsive behavior

Navigation remains one compact row at every width; section links scroll within their own container when needed, and the theme toggle stays visible. At 900px and below, profile, biography, and News stack; the profile uses a compact two-column arrangement until 600px, when it becomes a centered vertical stack with a 184px portrait. At phone widths, all main text stays at least 18px and supplemental text at least 16px. Paper titles wrap naturally; author lists never truncate. Check 320, 390, 768, 1024, and 1440px widths plus breakpoint boundaries for document overflow.

## Interaction states

Preserve system-aware theme selection and persisted overrides, navigation scroll tracking, and back-to-top. Visitor states include unconnected, ready with real zero/positive totals, unavailable, no-JavaScript fallback, and coastlines unavailable without hiding the counters. Unavailable statistics must not hide core content.

## Content voice

First-person, precise, and friendly. No unverified claims, invented employment dates, ornamental labels, copied research prose, or generic promotional sections.

The research introduction connects Matryoshka Pilot, Agent DAgger, STACX, MLE-Dojo, and DREAM as complementary efforts toward agents that learn from experience to solve complex, long-horizon tasks. Describe Agent DAgger specifically as training long-horizon agents through on-policy data aggregation. The ByteDance Seed sentence connects that agenda to contributions to frontier models' long-horizon agentic capabilities without implying project leadership.

## Implementation constraints

Plain HTML / CSS / JavaScript on the existing GitHub Pages repository. No framework, application package dependency, or website hosting migration. The owner approved the local design and authorized a GitHub push after the new Cloudflare analytics service passes live checks. Keep original paper image assets and the CV. Validate browser content, typography, responsive layout, theme, navigation, icon access, and no-JavaScript states; inspect screenshots. Test the Worker with SQLite-backed unit tests and local Cloudflare runtime checks before deployment.

## Open questions

- Cloudflare authorization is complete; the dedicated database and Worker are deployed at `https://changhao-visitor-stats.lichangh20.workers.dev`. The homepage is configured to read this service in local preview.
- The owner approved publication after successful live analytics verification; production visit recording begins only once the updated homepage is published.
