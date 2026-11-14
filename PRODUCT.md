# Ben Paternostro

<!-- impeccable:product-schema 1 -->

## Platform

web

## Product Purpose

A personal résumé and portfolio for Ben Paternostro, a software engineer
in Sydney, Australia. "Trace", in the "Riso" look, is the selected design
(14 November 2026). It keeps the page and wording of "Proof first"
(10 November 2026) and replaces Chronicle.

## Users

Working assumption: engineering hiring managers and peers
evaluating Ben's experience and independent work. Audience emphasis is open.

## Positioning

Full-stack product delivery, AI-assisted workflows, testing, and production
observability. Professional experience spans software engineering, quality
engineering, and site reliability engineering.

## Capabilities and Constraints

The production website uses Zola, Tera templates, hand-written CSS, one
hand-written script, and GitHub Pages. The résumé data and print route are
preserved.
Email, LinkedIn, the print résumé, and the independent Angla project are real links.
The user wants striking effects that work on phone and desktop, brief copy, and
nothing that is hard to read. Copy is first person, plain and modest: no taglines
and no em dashes. The homepage opens with a short introduction and a "Now" block,
then the career as native expandable rows drawn as bars on one time axis,
the Angla side project, toolkit, and contact. There is one light look, with no
dark version and no saved settings.
All eleven roles remain available; roles at the same employer share a row.

## Evidence on Hand

- `data/resume.toml`: source of truth for identity, roles, dates, achievements,
  skills, education, and the Angla description.
- `assets/angla-app.jpg`: browser capture of Angla’s public example dashboard
  on 6 October 2026. The forecast data is illustrative.
- `assets/README.md`: screenshot provenance; Zola publishes an optimized WebP.

## Accessibility & Inclusion

Keep readable contrast, semantic structure, keyboard navigation, visible focus,
responsive layouts, and reduced-motion support. Native disclosures work without
JavaScript, and so does the whole page: the script only adds the bars, the lines
and the clock. Size interpolation enhances motion in supporting browsers.
