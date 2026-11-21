# Design notes (benpaternostro.com)

Pure Ink, All Serif.

- **Palette:** pure white `#ffffff`, black ink `#111111`, muted grey `#595956`, hairlines `#e8e8e4`. No accent colour; Angla's screenshot provides the only colour on the page. Light only (`color-scheme: only light`).
- **Type:** upright variable `Literata` (OFL, local woff2, preloaded) across the entire homepage. No italics, no diagonal link arrows. Tabular lining figures for career years.
- **Structure:** single 820 px canvas. Top hero with name, one-line bio and three plain underlined links (`Résumé`, `Email`, `LinkedIn`). Below a single hairline rule, a two-column grid pairs the 7-company career list (company and years only, newest first) beside the Angla side project preview. Full work history and highlights stay on `/resume/print/`.
- **Performance:** zero JavaScript on the homepage, one preloaded woff2 font (52 KB) and one WebP image.
