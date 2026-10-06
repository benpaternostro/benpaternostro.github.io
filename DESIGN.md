---
name: "Chronicle"
description: "Ben Paternostro’s production career portfolio"
colors:
  paper: "#f3e7e0"
  ink: "#49313e"
  muted: "#735c65"
  rule: "#c6b0b7"
  accent: "#803b55"
  panel: "#e7d6d0"
  dark-paper: "#241e24"
  dark-ink: "#f1e7e9"
  dark-muted: "#c4adb8"
  dark-rule: "#5a454f"
  dark-accent: "#e5a6bd"
  dark-panel: "#362a32"
typography:
  display: {fontFamily: '"Source Serif 4", Georgia, serif', fontSize: "clamp(50px,6.4vw,90px)", fontWeight: 500, lineHeight: 1.02, letterSpacing: "-.035em"}
  headline: {fontFamily: '"Source Serif 4", Georgia, serif', fontSize: "34px", fontWeight: 500, lineHeight: 1.15, letterSpacing: "-.025em"}
  body: {fontFamily: '"Source Serif 4", Georgia, serif', fontSize: "16px", lineHeight: 1.55}
  description: {fontFamily: '"Source Serif 4", Georgia, serif', fontSize: "18px", lineHeight: 1.65}
  label: {fontFamily: '"Bricolage", sans-serif', fontSize: "13px", lineHeight: 1.5}
  date: {fontFamily: '"Bricolage", sans-serif', fontSize: "29px", fontWeight: 500, lineHeight: 1.1, letterSpacing: "-.035em"}
rounded: {circle: "50%"}
spacing: {gutter: "clamp(22px,4vw,64px)", timeline-row: "30px"}
components:
  theme-toggle: {backgroundColor: "transparent", textColor: "{colors.ink}", rounded: "{rounded.circle}", size: "44px", padding: "0"}
  theme-toggle-hover: {backgroundColor: "{colors.panel}"}
---

## Overview

**Creative North Star: "Chronicle"**

Chronicle is production visual authority. Historical prototype records remain explorations. Templates read `data/resume.toml`: ten roles appear in seven groups. The separate print résumé route remains unchanged.

## Colors

Rose paper and wine ink become deep plum and pale text in dark mode. Rules divide content; accent marks the spine, focus, and links.

## Typography

Local Source Serif 4 carries names and reading text; local Bricolage carries dates, metadata, navigation, and controls.

## Layout

Maximum width 1320px; dated timeline beside a 240px sidebar. At 1000px the sidebar narrows to 210px. At 760px it follows the timeline; at 520px the masthead and sidebar stack. Dates remain beside roles; small dates reach 11px. On phones the date column is 64px, the gap 36px, and the spine axis 80px, leaving clear space between the year and its dot. The navigation stands alone without a tagline; phone links share the available row width.

## Elevation & Depth

Flat surfaces, tonal contrast, and fine rules; no shadows.

## Shapes

App screenshots and reading regions, circular timeline dots and theme button.

## Components

Nine independent native disclosures start closed. Supporting browsers interpolate height over 420ms; native opening remains the fallback. Reduced motion disables transitions, smooth scrolling, and hover movement.

Existing theme JavaScript persists the choice and synchronizes button labels and browser theme color; light is the default.

Side projects is a section heading, with Angla as a project entry. Zola derives a 720px-wide WebP from `assets/angla-app.jpg`, preserving the full app screenshot’s aspect ratio. Provenance: `assets/README.md` and JPEG metadata.

## Do's and Don'ts

- Do preserve concise summaries, canonical roles, visible focus, keyboard access, and reduced motion.
- Don't promote historical mockups into production authority or hide initial content behind animation.

Recorded checks: 17 site contracts, Zola check, Chromium overflow checks at 320–1440px, keyboard disclosures, theme persistence/labels/meta, and print navigation. Chromium motion was observed; other engines/devices remain unverified. [Independent finish review](.impeccable/review/chronicle-refinement-review.md): ship.
