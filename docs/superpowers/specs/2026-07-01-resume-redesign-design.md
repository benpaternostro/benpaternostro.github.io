# Resume site redesign — Swiss minimalist

Date: 2026-07-01
Status: Approved

## Goal

Replace the current generic, inconsistent site with a single, intentional,
modern-minimalist resume page. Remove the templated "BelResume" look and the
redundancy between the home page and the `/resume/` page.

## Decisions

- **Structure:** one polished single page at `/`. Retire the redundant
  `/resume/` route. Keep a restyled printable/PDF page at `/resume/print`.
- **Aesthetic:** Swiss typographic — stark grid, strong type hierarchy,
  hairline rules, mono for dates/labels, numbered sections.
- **Accent:** cobalt blue, used sparingly. Everything else black/white/grey.
- **Typography:** Inter (self-hosted variable `woff2`) for display/body;
  system monospace stack for dates, labels, and section numbers. Two weights
  (regular + medium). Sentence case throughout.
- **Color mode:** light and dark palettes; light is the default, with a small
  toggle that switches to dark and persists the choice in `localStorage`.
- **Implementation:** hand-written CSS with CSS custom properties. Remove the
  Tailwind CDN, Font Awesome, and the `BelResume` theme entirely.

## Architecture / file changes (Zola)

- `config.toml`: remove `theme = "BelResume"`.
- Delete `themes/BelResume/`.
- Delete `content/resume.md` and `templates/resume.html` (retire `/resume/`).
- `templates/base.html`: single shared layout — head (meta, self-hosted Inter,
  one `styles.css`, favicon, `theme-color`), a no-flash inline theme script, a
  slim sticky top bar, and a footer.
- `templates/index.html`: the single-page resume, composed of small clean
  partials (no Tailwind).
- `templates/partials/`: rewrite `hero`, `experience`, `skills`, `projects`,
  `education`, `awards` as semantic HTML reading from `data/resume.toml`. Each
  partial is self-contained and independently understandable.
- `static/styles.css`: one hand-crafted stylesheet (~8-10KB) — CSS variables,
  `prefers-color-scheme` + `[data-theme]` override, screen + print rules.
- `static/fonts/`: self-hosted Inter `woff2` (fallback: Google Fonts `<link>`
  if the binary cannot be vendored in the build environment).
- `templates/resume-print.html`: keep; harmonize typography and heading
  treatment with the new design, but keep monochrome and print-optimized.
- Data source unchanged: `data/resume.toml`.
- Deployment unchanged: GitHub Actions `main` -> `gh-pages`, CNAME preserved.

## Page layout (top -> bottom)

- **Top bar** (slim, sticky, hairline underline): name at left; at right —
  `Resume PDF`, `LinkedIn`, and a theme-toggle icon button.
- **Hero:** oversized bold name (`clamp()`), a mono accent kicker for the
  headline, a ~60-character summary, a contact row
  (location - email - website - LinkedIn), and the PDF link. Strong hairline
  rule below.
- **Numbered sections:** `01 — Experience`, `02 — Skills`, `03 — Projects`,
  `04 — Education`, `05 — Awards`. Numbers in cobalt; labels uppercase mono with
  letter-spacing.
- **Experience:** two-column rows (mono dates left; role/company, summary, and
  highlight bullets right). Collapses to stacked on mobile. Hairline dividers
  between roles.
- **Skills / Education / Awards / Projects:** label-left / content-right rows
  consistent with the grid.
- **Footer:** copyright year, name, small links.

## Visual system

- **Type:** Inter for display/body; system mono for meta. Tight heading
  tracking; fluid name size via `clamp()`.
- **Color — light:** bg `#ffffff`, text `#111`, secondary `#555`, hairline
  `#e5e5e5`, accent `#2b50ec`.
- **Color — dark:** bg `#0d0d0f`, text `#ededed`, secondary `#a0a0a0`, hairline
  `#262626`, accent `#5b78ff`.
- Accent limited to section numbers, links, the headline kicker, and focus
  rings.
- Generous whitespace, left-aligned, container max-width ~800px.

## Light/dark toggle

- Defaults to light; dark applies only when explicitly chosen.
- Toggle writes an explicit choice to `localStorage`, applied as `[data-theme]`
  on `<html>`.
- A tiny inline `<head>` script sets the theme before first paint to avoid a
  flash of the wrong theme.
- `prefers-reduced-motion` respected.

## Accessibility & performance

- Single `h1`, sectioned `h2`s, skip-to-content link, `aria-label`ed toggle,
  full keyboard support.
- WCAG AA contrast verified in both modes; nudge the cobalt shade if a pairing
  misses AA.
- No render-blocking CDNs; self-hosted font with `font-display: swap`; target
  Lighthouse ~100.

## Removed

Tailwind CDN, Font Awesome, the BelResume theme, floating-blob background, the
3-color theme switcher, and the duplicate `/resume/` route.

## Verification

- `zola build` succeeds with no warnings; `zola check` passes.
- Manual/preview check of `/` and `/resume/print` in light and dark, desktop and
  mobile widths.
- Contrast spot-check of accent-on-background pairings.
