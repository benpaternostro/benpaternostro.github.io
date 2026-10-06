# Ben Paternostro

<!-- impeccable:product-schema 1 -->

## Platform

web

## Product Purpose

A personal résumé and portfolio for Ben Paternostro, a Senior Software Engineer
in Sydney, Australia. Chronicle is the selected production design.

## Users

Working assumption: engineering hiring managers and peers
evaluating Ben's experience and independent work. Audience emphasis is open.

## Positioning

Full-stack product delivery, AI-assisted workflows, testing, and production
observability. Professional experience spans software engineering, quality
engineering, and site reliability engineering.

## Capabilities and Constraints

The production website uses Zola, Tera templates, hand-written CSS, and GitHub
Pages. Chronicle is implemented in the production Tera templates and CSS.
The résumé data, print route, and earlier prototypes are preserved.
Email, LinkedIn, the print résumé, and the independent Angla project are real links.
The user wants a minimal interface, brief copy, considered transitions, and full
mobile/desktop usability. The homepage presents a dated career timeline with
native expandable details, a Side projects sidebar with Angla, and a persistent theme switch.
All ten roles remain available; contiguous early-career roles may share a row.

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
