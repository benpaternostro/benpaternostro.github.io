# Ben Paternostro

<!-- impeccable:product-schema 1 -->

## Platform

web

## Product Purpose

A personal résumé and portfolio for Ben Paternostro, a software engineer
in Sydney, Australia. "Proof first" is the selected production design
(10 November 2026); it replaced Chronicle.

## Users

Working assumption: engineering hiring managers and peers
evaluating Ben's experience and independent work. Audience emphasis is open.

## Positioning

Full-stack product delivery, AI-assisted workflows, testing, and production
observability. Professional experience spans software engineering, quality
engineering, and site reliability engineering.

## Capabilities and Constraints

The production website uses Zola, Tera templates, hand-written CSS, and GitHub
Pages. The résumé data and print route are preserved.
Email, LinkedIn, the print résumé, and the independent Angla project are real links.
The user wants a minimal interface, brief copy, considered transitions, and full
mobile/desktop usability. Copy is first person, plain and modest: no taglines
and no em dashes. The homepage opens with a short introduction and a "Now" card,
then a career table with native expandable rows,
the Angla side project, toolkit, and contact. The theme follows the device
setting, with a switch that remembers an override.
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
JavaScript; size interpolation enhances motion in supporting browsers.
