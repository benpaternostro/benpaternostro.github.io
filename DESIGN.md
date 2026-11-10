---
name: "Proof first"
description: "Ben Paternostro's résumé and portfolio"
colors:
  paper: "#f7f3ee"
  card: "#fffdfa"
  ink: "#1f1a1d"
  muted: "#6b6166"
  rule: "#e0d7d1"
  accent: "#803b55"
  tint: "#f1e3e3"
  plum: "#803b55"
  on-plum: "#fbeef0"
  dark-paper: "#1d181b"
  dark-card: "#272024"
  dark-ink: "#f3ecee"
  dark-muted: "#b9a9b0"
  dark-rule: "#40353b"
  dark-accent: "#e5a6bd"
  dark-tint: "#3a2a32"
typography:
  display: {fontFamily: '"Bricolage", system-ui, sans-serif', fontSize: "clamp(42px,6.1vw,88px)", fontWeight: 600, lineHeight: 0.98, letterSpacing: "-.045em"}
  headline: {fontFamily: '"Bricolage", system-ui, sans-serif', fontSize: "clamp(28px,3vw,40px)", fontWeight: 600, letterSpacing: "-.035em"}
  card-title: {fontFamily: '"Bricolage", system-ui, sans-serif', fontSize: "29px", fontWeight: 600, lineHeight: 1.08, letterSpacing: "-.035em"}
  body: {fontFamily: '"Bricolage", system-ui, sans-serif', fontSize: "16px", lineHeight: 1.55}
  reading: {fontFamily: '"Source Serif 4", Georgia, serif', fontSize: "16.5px", lineHeight: 1.55}
  label: {fontFamily: '"Bricolage", system-ui, sans-serif', fontSize: "12px", fontWeight: 600, letterSpacing: ".08em"}
rounded: {card: "18px", button: "12px", chip: "7px", contact: "24px"}
spacing: {gutter: "clamp(20px,4vw,64px)", section: "84px", card-gap: "20px"}
components:
  button: {textColor: "{colors.ink}", rounded: "{rounded.button}", height: "48px", border: "1.5px solid {colors.ink}"}
  button-primary: {backgroundColor: "{colors.ink}", textColor: "{colors.paper}"}
  theme-toggle: {backgroundColor: "transparent", textColor: "{colors.ink}", size: "44px"}
---

## Overview

**Direction: "Proof first"**

The first screen says who Ben is and what he does now, with email, résumé and
LinkedIn one tap away. Results come next as three "Recent work" cards. The full
career follows as a compact table that opens for detail. Copy is first person,
plain and modest: no slogans. Templates read `data/resume.toml`; eleven roles
appear in seven employer rows. The separate print résumé route is unchanged.

## Colors

Warm near-white paper, off-white cards, near-black ink, and one plum accent.
Dark mode uses deep plum-black paper and a rose accent. The contact panel stays
plum in both modes. All text pairs meet WCAG AA (lowest is muted text on paper
at 5.4:1).

## Typography

Local Bricolage Grotesque (WOFF2, latin subset) carries headings, labels,
navigation and controls. Local Source Serif 4 carries reading text: the
introduction, card summaries, career summaries and highlights.

## Layout

Maximum width 1240px. Introduction beside a 340px "Now" card; three work cards;
three numbered habits; career table (years, employer and role, summary,
disclosure); two panels (side project, toolkit with education); contact panel.
At 900px everything stacks to one column and career summaries show only when a
row is open. At 720px the section links leave the top bar, which keeps the
résumé button and theme switch. At 360px the monogram is dropped.

## Elevation & Depth

Flat cards with a one-pixel rule; no shadows.

## Shapes

18px card corners, 12px buttons, 7px chips, 24px contact panel.

## Components

Seven native disclosures, one per employer, start closed. Supporting browsers
interpolate height over 320ms; native opening is the fallback. Reduced motion
disables transitions, smooth scrolling and hover movement.

The theme follows the device setting. The toggle overrides it, persists the
choice, and keeps the button label and browser theme colour in step.

Angla is the side project panel. Zola derives a 720px-wide WebP from
`assets/angla-app.jpg`. Provenance: `assets/README.md`.

## Do's and Don'ts

- Do keep copy plain and factual, keep every role reachable, and preserve
  visible focus, keyboard access, 44px tap targets and reduced motion.
- Don't add taglines, em dashes, or content that only appears through animation.

Recorded checks (10 Nov 2026): 24 site contracts, `zola check`, Chromium overflow
checks at 320 to 1920px with every row open, keyboard disclosures, theme
follow/override/persistence/labels/meta, 44px tap targets at phone width, and
contrast ratios for both palettes. Other engines and real devices are unverified.
