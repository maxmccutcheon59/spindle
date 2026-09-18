# Spindle Website

Public site for the [Spindle](https://github.com/maxmccutcheon59/spindle) LSM-tree storage engine.

## Develop

```bash
cd website
npm install
npm run dev -- --port 43123
```

Open [http://127.0.0.1:43123](http://127.0.0.1:43123).

## Production build

Static export for GitHub Pages (`basePath` `/spindle`):

```bash
cd website
npm run build
```

Output: `website/out`. Deployed by `.github/workflows/pages.yml`.

## SEO

- `metadata` + Open Graph + Twitter cards
- `robots.txt` and `sitemap.xml`
- JSON-LD `SoftwareApplication`
