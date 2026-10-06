---
version: 1
slug: "templates-index-html"
primary_target: "templates/index.html"
related_targets: ["templates/base.html", "templates/partials/career-index.html", "static/styles.css"]
---

# Chronicle homepage

User selection: "Implement chronicle". Previous preferences: minimal, brief copy,
considered transitions, mobile and desktop. Mode: Experience, through a readable
career chronology. Production Zola homepage; no deployment requested.

## Direction contract

THESIS: Make Ben's career progression the composition, with concise summaries
and details available on demand. Preserve all ten source roles and the print résumé.

OWN-WORLD: The selected Chronicle prototype is visual authority: pale rose paper,
wine ink, Source Serif 4 reading type, Bricolage metadata, and a dated vertical
spine. A plum dark theme carries the same hierarchy. Existing favicon is retained.

STORY: Identify Ben, read current engineering work, follow earlier experience,
inspect Angla or the full résumé, then contact him.

FIRST VIEWPORT: A compact navigation bar and two-line nameplate lead into the
current role on the year spine. The desktop sidebar starts with Side projects,
with Angla as an entry; it follows the timeline on phones. Dates stay beside their roles.

FORM: The explicit selection replaces the production surface with the Chronicle
mockup's visual system. Seven timeline rows preserve ten roles, grouping Rokt and
Medical Director progression. Expanded detail uses the canonical résumé data.

MOTION: Native disclosures expand in place with 420ms size interpolation where
supported, plus/minus feedback, short arrow shifts, a restrained image hover, and
220ms theme transitions. Reduced motion removes transitions and smooth scrolling.
No extra JavaScript dependency, concealed initial content, or automatic loops.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Implementation and checks

- `data/resume.toml` remains authoritative. Explicit presentation groups and two
  short group summaries are the only career data additions.
- `assets/angla-app.jpg` is a direct browser capture of Angla’s public example
  dashboard, captured 6 October 2026. Zola emits a 720px-wide WebP preserving the
  full card. Source provenance is in the JPEG and `assets/README.md`.
- Seventeen site contracts pass, including role/date retention, fragment links,
  print content, image publication, and single escaping of summary text.
- Browser geometry has no horizontal overflow at 320, 375, 390, 768, 1024, 1280,
  and 1440px. All nine disclosures open and close with Enter at 320px; focus is
  visible. Opening height was observed changing from 44px to 1619px for the long
  current-role detail at 320px. Theme label, meta color, and reload persistence work.
- Print résumé navigation was checked in the browser; all ten roles remain.
- One static detector pass reported a flat type hierarchy because it did not
  resolve the generated absolute stylesheet link. Rendered desktop values are
  h1 90px, h2 34px, body 16px and timeline body 18px; the warning is inapplicable.
- Reduced-motion fallback is verified in source. Browser testing uses Chromium;
  no claim of device or other browser-engine testing is made.

Independent finish review: **ship**, with no material findings or required fixes.
Production tokens and components are recorded in root `DESIGN.md` and
`.impeccable/design.json` (validated schemaVersion 2). Prototype records remain
historical explorations. Implementation is local; no commit, push, or deployment.

## Requested refinement — 6 October

Removed the header tagline and changed the introduction to “Software engineering,
quality engineering, and production reliability.” Side projects now contains Angla
as a distinct entry with an actual dashboard screenshot. The phone date column,
gap, and spine axis are 64/36/80px; the year has about 26px clearance from the dot’s
outline. Navigation uses the available row width on narrow phones. Existing 17
site checks pass. Fresh visual review of this refinement: **ship**, no material
findings or required fixes. Final captures confirm one-row navigation at 320px,
clear mobile date spacing, and the full app screenshot. Review record:
`.impeccable/review/chronicle-refinement-review.md`.
