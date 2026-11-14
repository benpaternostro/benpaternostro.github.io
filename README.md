# benpaternostro.com — Zola Resume & Portfolio

Minimal personal site built with Zola and deployed to GitHub Pages.

## Stack

- Zola static site generator
- GitHub Pages hosting
- GitHub Actions deployment (`main` -> `gh-pages`)
- Data-driven resume from `data/resume.toml`

## Project Structure

- `content/` markdown pages
- `templates/` Tera templates (`index.html` single-page resume, `partials/`, `resume-print.html`)
- `data/resume.toml` source of truth for resume content
- `static/` static assets, hand-written `styles.css` and `trace.js`, self-hosted `fonts/`, `og.png`, and `CNAME`
- `design/og-card.html` source for the link preview image `static/og.png`
- `tests/` contract tests that build the site and check the output
- `.github/workflows/deploy.yml` deployment workflow

## Local Development

1. Install Zola: https://www.getzola.org/documentation/getting-started/installation/
2. Run locally:

```bash
zola serve
```

3. Build production output:

```bash
zola build
```

Generated files are output to `public/` (ignored by git).

## Tests

```bash
python3 -m unittest discover -s tests
```

The tests run `zola build` into a temporary folder, so Zola must be on `PATH`.

## Design

- No third-party theme, CSS framework or script library. Styling is a single
  hand-written stylesheet at `static/styles.css` using CSS custom properties; the
  effects are one hand-written script at `static/trace.js`.
- "Trace" single page in the "Riso" look (blue and red ink on paper), all driven
  by `data/resume.toml`: introduction with email, résumé and LinkedIn links and a
  "Now" block, the career with one expandable row per employer, side projects,
  toolkit, and contact.
- Roles that share a `timeline_group` appear as one career row. `timeline_role`
  and `timeline_summary` set the text shown on the closed row.
- `trace.js` draws each role as a bar on one time axis from its `start_date`,
  `end_date` and `kind`, so the dates must be written like `Sep 2026` (or
  `Present`) and `kind` must be `build` (software engineering), `test` (test
  automation) or `run` (site reliability). It also draws the two fields of
  lines and runs the clock, which uses `timezone` under `[basics]`.
- The page is complete without the script: a plain list with every role. Reduced
  motion turns the movement off.
- One light look. There is no dark version and nothing is saved in the browser.
- Self-hosted fonts: Bricolage Grotesque (variable, with its width axis) for
  headings, Libre Franklin (variable) for everything else. The print résumé uses
  Inter.
- Link previews: Open Graph and Twitter tags, `Person` structured data, and
  `static/og.png` (1200 x 630). To refresh the image after changing the headline,
  edit `design/og-card.html` and screenshot it at 1200 x 630.
- Tab icon: `static/favicon.svg` is a blue square with the heading font's B in
  the paper colour, drawn as a path; `static/favicon.ico` holds the same icon at
  16 and 32 px for browsers without SVG icons.
- Design decisions are recorded in `DESIGN.md` and `PRODUCT.md`.

## Resume Update Workflow (PDF -> TOML)

1. Upload your latest resume PDF to Copilot.
2. Ask Copilot to return content in this repository's `data/resume.toml` schema.
3. Replace/update `data/resume.toml`.
4. Run `zola serve` and verify `/` (and the print view at `/resume/print`).
5. Commit and push to `main`.

## Deployment

- Workflow: `.github/workflows/deploy.yml`
- Trigger: push to `main`
- Action builds and deploys `public/` to `gh-pages`
- Custom domain is preserved via `static/CNAME`

## Domain

- `base_url` in `config.toml` is set to `https://benpaternostro.com`
- `static/CNAME` contains `benpaternostro.com`