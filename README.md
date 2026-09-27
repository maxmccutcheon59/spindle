# Spindle

[![CI](https://github.com/maxmccutcheon59/spindle/actions/workflows/ci.yml/badge.svg)](https://github.com/maxmccutcheon59/spindle/actions/workflows/ci.yml)
[![Site](https://img.shields.io/badge/site-GitHub%20Pages-0f7a7a)](https://maxmccutcheon59.github.io/spindle/)

**By [Max McCutcheon](https://github.com/maxmccutcheon59)** · **Email:** [MaxMcCutcheon1@outlook.com](mailto:MaxMcCutcheon1@outlook.com)

Rust LSM-tree KV engine (real, MIT) + **Spindle Cloud** roadmap (founding $49 / $149 hypotheses — not a live multi-tenant SaaS yet) + **Spindle Agent** (local knowledge brain on Pages; GPT needs a server key).

**Ownership:** Spindle, Spindle Cloud, and Spindle Agent are solely owned and operated by Max McCutcheon. Engine is MIT; Cloud, website, branding, and Agent are Max’s. Legal/ownership note email still listed as maxmccutcheon59@gmail.com on About until inbox consolidation.

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
| `/agent/` | Spindle Agent (GPT if `OPENAI_API_KEY` on a server; else local brain) |
| `/playground/` | put/get/flush demo |
| `/pricing/` | Free OSS · Builder/Scale founding Cloud hypotheses |
| `/enterprise/` | Positioning vs Dynamo-class KV (no fake traction) |
| `/about/` | Max McCutcheon |
| `/case-study/` | Honest product brief |

Public deploy is **GitHub Pages** (static — no `/api/checkout`). For live Stripe Checkout API + GPT Agent, deploy to Vercel — see `website/SETUP.md`. Contact: MaxMcCutcheon1@outlook.com

## License

MIT © Max McCutcheon. Cloud (when hosted) via Stripe — not live self-serve on Pages today.
