# Spindle

[![CI](https://github.com/maxmccutcheon59/spindle/actions/workflows/ci.yml/badge.svg)](https://github.com/maxmccutcheon59/spindle/actions/workflows/ci.yml)
[![Site](https://img.shields.io/badge/site-GitHub%20Pages-0f7a7a)](https://maxmccutcheon59.github.io/spindle/)

**By [Max McCutcheon](https://github.com/maxmccutcheon59)** · **Email:** [maxmccutcheon59@gmail.com](mailto:maxmccutcheon59@gmail.com)

Rust LSM-tree KV engine + **Spindle Cloud** ($49 / $149) + **Spindle Agent** (built-in AI).

**Ownership:** Spindle, Spindle Cloud, and Spindle Agent are solely owned and operated by Max McCutcheon. Engine is MIT; Cloud, website, branding, and Agent are Max’s.

**Live site:** [https://maxmccutcheon59.github.io/spindle/](https://maxmccutcheon59.github.io/spindle/) · **Agent:** [Agent](https://maxmccutcheon59.github.io/spindle/agent/) · **Enterprise:** [Enterprise](https://maxmccutcheon59.github.io/spindle/enterprise/) · **About:** [About](https://maxmccutcheon59.github.io/spindle/about/) · [`DESIGN.md`](DESIGN.md)

## Engine

```bash
cargo test && cargo clippy --all-targets -- -D warnings
```

```rust
use spindle::{Db, Options};
let db = Db::open(Options::new("./spindle-data"))?;
db.put(b"hello", b"world")?;
```

## Website + AI Agent

```bash
cd website && cp .env.example .env.local && npm install && npm run dev
# local only: http://127.0.0.1:43123
```

| Path | What |
|------|------|
| `/agent/` | Spindle Agent (GPT if `OPENAI_API_KEY`, else Spindle brain) |
| `/playground/` | put/get/flush demo |
| `/pricing/` | Free · Builder $49 · Scale $149 |
| `/enterprise/` | Why companies choose Spindle vs Dynamo-class KV |
| `/about/` | Max McCutcheon |

Public deploy is **GitHub Pages** (link above). For live Stripe Checkout API + GPT Agent, also deploy to Vercel — see `website/SETUP.md`. Contact: maxmccutcheon59@gmail.com

## License

MIT © Max McCutcheon. Cloud via Stripe.
