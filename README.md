# Spindle

[![CI](https://github.com/maxmccutcheon59/spindle/actions/workflows/ci.yml/badge.svg)](https://github.com/maxmccutcheon59/spindle/actions/workflows/ci.yml)

**By [Max McCutcheon](https://github.com/maxmccutcheon59)** · **Email:** [maxmccutcheon59@gmail.com](mailto:maxmccutcheon59@gmail.com)

Rust LSM-tree KV engine + **Spindle Cloud** ($49 / $149) + **Spindle Agent** (built-in AI).

**Ownership:** Spindle, Spindle Cloud, and Spindle Agent are solely owned and operated by Max McCutcheon. Engine is MIT; Cloud, website, branding, and Agent are Max’s.

**Live site:** [http://127.0.0.1:43123](http://127.0.0.1:43123/) · **Agent:** [/agent](http://127.0.0.1:43123/agent/) · **About:** [/about](http://127.0.0.1:43123/about/) · [`DESIGN.md`](DESIGN.md)

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
```

| Path | What |
|------|------|
| `/agent/` | Spindle Agent (GPT if `OPENAI_API_KEY`, else Spindle brain) |
| `/playground/` | put/get/flush demo |
| `/pricing/` | Free · Builder $49 · Scale $149 |
| `/about/` | Max McCutcheon |

Deploy: Vercel for AI API, or Firebase (`SPINDLE_STATIC=1`) for Google Hosting — see `website/README.md`. Contact: maxmccutcheon59@gmail.com

## License

MIT © Max McCutcheon. Cloud via Stripe.
