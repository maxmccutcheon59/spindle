# Spindle

[![CI](https://github.com/maxmccutcheon59/spindle/actions/workflows/ci.yml/badge.svg)](https://github.com/maxmccutcheon59/spindle/actions/workflows/ci.yml)
[![Site](https://img.shields.io/badge/site-GitHub%20Pages-0f7a7a)](https://maxmccutcheon59.github.io/spindle/)

**Spindle** by **[Max McCutcheon](https://github.com/maxmccutcheon59)** · [maxmccutcheon59@gmail.com](mailto:maxmccutcheon59@gmail.com)

LSM-tree key-value engine in Rust + **Spindle Cloud** ($49 / $149) + **Spindle Agent** (AI).

**Public website (Google):** [https://maxmccutcheon59.github.io/spindle/](https://maxmccutcheon59.github.io/spindle/)  
**Repo:** [github.com/maxmccutcheon59/spindle](https://github.com/maxmccutcheon59/spindle)  
**Ownership:** Solely owned by Max McCutcheon.

Search tips after Pages is live: `Max McCutcheon Spindle`, `Spindle Cloud Max McCutcheon`, `maxmccutcheon59 spindle`.

## Engine

```bash
cargo test && cargo clippy --all-targets -- -D warnings
```

```rust
use spindle::{Db, Options};
let db = Db::open(Options::new("./spindle-data"))?;
db.put(b"hello", b"world")?;
```

## Website

```bash
cd website && cp .env.example .env.local && npm install && npm run dev
```

| Path | What |
|------|------|
| `/agent/` | Spindle Agent AI |
| `/playground/` | put/get/flush demo |
| `/pricing/` | Free · Builder $49 · Scale $149 |
| `/about/` | Max McCutcheon · email |

**Go live on Google:** enable **Settings → Pages → GitHub Actions**, then Actions → “Deploy website”. Submit `https://maxmccutcheon59.github.io/spindle/sitemap.xml` in [Google Search Console](https://search.google.com/search-console).

## License

MIT © Max McCutcheon. Cloud via Stripe.
