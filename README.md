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
- `static/` static assets, hand-written `styles.css`, self-hosted `fonts/`, `og.png`, and `CNAME`
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

- No third-party theme or CSS framework. Styling is a single hand-written
  stylesheet at `static/styles.css` using CSS custom properties.
- "Proof first" single page, all driven by `data/resume.toml`: introduction with
  email, résumé and LinkedIn buttons and a "Now" card, three "Recent work" cards
  (`[[cases]]`), a career table
  with one expandable row per employer, side projects, toolkit, and contact.
- Roles that share a `timeline_group` appear as one career row. `timeline_role`
  and `timeline_summary` set the text shown on the closed row.
- Follows the device light or dark setting. The toggle overrides it and stores
  the choice in `localStorage`.
- Self-hosted fonts: Bricolage Grotesque for headings and labels, Source Serif 4
  for reading text. The print résumé uses Inter.
- Link previews: Open Graph and Twitter tags, `Person` structured data, and
  `static/og.png` (1200 x 630). To refresh the image after changing the headline,
  edit `design/og-card.html` and screenshot it at 1200 x 630.
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