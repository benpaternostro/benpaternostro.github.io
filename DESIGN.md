---
name: "Trace (Riso)"
description: "Ben Paternostro's résumé and portfolio"
colors:
  paper: "#f2ede1"
  ink: "#20307a"
  muted: "#4a5791"
  rule: "#20307a"
  rule-soft: "#8990bd"
  red: "#e8442e"
  bar-build: "#e8442e"
  bar-test: "#20307a"
  bar-run: "#6f79b0"
  selection: "#ffb9ab"
typography:
  display: {fontFamily: '"Bricolage Grotesque", system-ui, sans-serif', fontSize: "clamp(2.8rem,5.712vw,5.32rem)", fontWeight: 800, fontStretch: "78%", lineHeight: 0.98, letterSpacing: "-.02em"}
  headline: {fontFamily: '"Bricolage Grotesque", system-ui, sans-serif', fontSize: "clamp(2.1375rem,3.648vw,3.135rem)", fontWeight: 800, fontStretch: "82%", lineHeight: 1.1, letterSpacing: "-.016em"}
  row-title: {fontFamily: '"Bricolage Grotesque", system-ui, sans-serif', fontSize: "clamp(1.63875rem,2.28vw,1.92375rem)", fontWeight: 800, fontStretch: "82%", lineHeight: 1.2, letterSpacing: "-.01em"}
  body: {fontFamily: '"Libre Franklin", system-ui, sans-serif', fontSize: "1.125rem", lineHeight: 1.6}
  reading: {fontFamily: '"Libre Franklin", system-ui, sans-serif', fontSize: "1.0625rem", lineHeight: 1.55}
  label: {fontFamily: '"Libre Franklin", system-ui, sans-serif', fontSize: ".875rem", fontWeight: 550, letterSpacing: ".005em"}
rounded: {all: "0"}
spacing: {gutter: "max(20px, (100% - 1200px) / 2)", topbar: "68px", section-rule: "4px"}
components:
  link-button: {textColor: "{colors.ink}", underline: "2px {colors.red}", height: "46px"}
  button-primary: {backgroundColor: "{colors.ink}", textColor: "{colors.paper}", height: "50px"}
  now-block: {backgroundColor: "{colors.ink}", textColor: "{colors.paper}"}
---

## Overview

**Direction: "Trace", in the "Riso" look**

The page is the same short résumé as before: who Ben is and what he does now,
then the career, a side project, the toolkit and contact. Copy is first person,
plain and modest: no slogans. What changed is how it is drawn. The career is a
trace: every role is a bar on one time axis from 2016 to now, coloured by the
kind of work. The look is a two-colour print, blue and red ink on paper.

Templates read `data/resume.toml`; eleven roles appear in seven employer rows.
The separate print résumé route is unchanged.

## Colors

Two inks on paper. Blue (`#20307a`) is for everything that is read. Red
(`#e8442e`) only draws: bars, lines and underlines, never small text, because
red on this paper is 3.39:1. Ink on paper is 10.18:1 and muted text 5.87:1.
The "Now" block is solid blue with paper-coloured text.

Bar colours: red is software engineering, solid blue is test automation, hatched
blue is site reliability. The key above the bars names them.

There is one light look and no dark version: the design is ink on paper.

`trace.js` reads `--bg`, `--ridge`, `--hot`, `--build`, `--test` and `--run`
from the stylesheet for its canvas, so they stay plain six-digit colours.

## Typography

Local Bricolage Grotesque (variable WOFF2, weight and width axes) carries the
headings, set heavy and narrow: weight 800 at 78% width for the two big lines,
82% for the rest. Local Libre Franklin (variable WOFF2) carries all other text
and the small labels. Its digits differ in width, so the clock gives each digit
its own box.

## Layout

Maximum width 1200px with a 20px minimum gutter. From 1024px the introduction
sits beside the "Now" block and a field of red lines closes the first screen;
below that everything is one column. The time axis stays at the top of the
screen while the career list scrolls. From 900px each row's bar sits in a column
beside the employer; narrower screens put it under the heading, full width. Side
project and toolkit sit side by side from 900px.

The top bar drops pieces as it narrows: the section links below 820px, the
monogram below 430px, the clock below 390px. The résumé link always stays.

## Elevation & Depth

Flat. The only shadow is a hard red offset on the main button when hovered. From
900px the row summaries carry a paper-coloured halo, so the year lines behind
them do not cut through the words.

## Shapes

Square corners throughout. The only round shapes are two small red dots that
mark the present: one in the "Now" block, one at the end of the current role's
bar. Rules instead of boxes: a 4px blue rule above each section and 1px rules
between rows. Links are underlined in red rather than drawn as pills.

## Components

Seven native disclosures, one per employer, start closed. Supporting browsers
interpolate height over 320ms; native opening is the fallback.

`static/trace.js` adds everything that moves. Without it the page is a plain,
complete list.

- Career waterfall: bars built from each role's `data-start`, `data-end` and
  `data-kind`. The first time the list is seen, the bars are drawn in from 2016
  to now. The current role's bar shimmers slowly and ends in a pulsing red dot.
  With a mouse a crosshair follows the pointer along the axis and names the
  month. One row at a time is active and its dates are marked on the axis: the
  row under the mouse, the row with keyboard focus, or on a touch screen the row
  nearest the middle of the screen.
- Lines: two canvases of red lines, under the introduction and at the end of the
  page. They drift slowly and are pushed by the mouse, a finger or fast
  scrolling.
- Clock: Sydney time in the top bar, from `timezone` in the data.
- Small effects, once each: headings settle into place, the toolkit names
  resolve, the Angla picture is wiped in.

Reduced motion keeps the bars, the lines (as a still picture) and the clock, and
turns off drawing in, the shimmer and pulse, drifting, the small effects, smooth
scrolling and the height animation.

Angla is the side project panel. Zola derives a 720px-wide WebP from
`assets/angla-app.jpg`; the stylesheet prints it in blue. Provenance:
`assets/README.md`.

Print opens every row and drops the bars, lines and top bar.

## Do's and Don'ts

- Do keep copy plain and factual, keep every role reachable, and preserve
  visible focus, keyboard access, 44px tap targets and reduced motion.
- Do keep the page complete without the script.
- Don't use red for small text, and don't add a third ink.
- Don't add taglines, em dashes, or content that only appears through animation.
- Don't add rounded cards, glows, pill chips or code-font labels.

Recorded checks (14 Nov 2026): 30 site contracts, `zola check`, and in headless
Chromium: no sideways overflow and a sound top bar at 20 widths from 320 to
2560px with every row open, the page without the script, reduced motion,
keyboard order and focus, 44px tap targets, contrast of every piece of text,
a row opening while the effects run, the clock, and print. Other engines
(Safari, Firefox) and real devices are unverified.
