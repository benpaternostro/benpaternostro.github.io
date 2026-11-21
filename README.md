# benpaternostro.com — Zola Resume & Portfolio

Minimal personal site built with Zola and deployed to GitHub Pages.

## Stack

- Zola static site generator
- GitHub Pages hosting
- GitHub Actions deployment (`main` -> `gh-pages`)
- Data-driven resume from `data/resume.toml`

## Project Structure

- `content/` markdown pages
- `templates/` Tera templates (`base.html`, `index.html`, `404.html`, `resume-print.html`)
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

- No third-party theme, CSS framework or script library. Styling is a single hand-written stylesheet at `static/styles.css` and the homepage ships zero JavaScript.
- Pure Ink, All Serif: pure white `#ffffff` and black ink `#111111`, upright variable `Literata` across the entire homepage. Full work history and highlights live at `/resume/print/` (using Inter).
- Roles that share a `timeline_group` collapse into one company row on the homepage; `short_company` and `short_summary` optionally shorten display names while keeping full text on `/resume/print/`.
- One light look. No dark toggle and nothing saved in the browser.
- Link previews: Open Graph and Twitter tags, `Person` structured data, and `static/og.png` (1200 x 630 from `design/og-card.html`).
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