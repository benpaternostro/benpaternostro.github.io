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
- `static/` static assets, hand-written `styles.css`, self-hosted `fonts/`, and `CNAME`
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

## Design

- No third-party theme or CSS framework. Styling is a single hand-written
  stylesheet at `static/styles.css` using CSS custom properties.
- Swiss-typographic single page: a `data/resume.toml`-driven hero plus numbered
  sections (experience, skills, projects, education, awards).
- Light and dark palettes follow `prefers-color-scheme`, with a toggle that
  persists an override in `localStorage`.
- Typography is self-hosted Inter (`static/fonts/inter-latin-wght-normal.woff2`)
  with a system monospace stack for dates and labels.
- Design decisions are recorded in
  `docs/superpowers/specs/2026-07-01-resume-redesign-design.md`.

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