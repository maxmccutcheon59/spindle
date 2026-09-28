# Spindle Website

By **Max McCutcheon** — engine-first site for the Spindle Rust LSM: design notes, an in-browser playground, **Spindle Agent**, and a waitlist for a possible managed **Spindle Cloud**.

**Honesty:** the Rust LSM is real, MIT-licensed OSS. Spindle Cloud is not built and nothing is for sale; `/cloud/` collects waitlist interest by email.

## Develop

```bash
cd website
cp .env.example .env.local
npm install
npm run dev
```

[http://127.0.0.1:43123](http://127.0.0.1:43123)

## Deploy

| Target | Command | Notes |
|--------|---------|--------|
| **Vercel** | `vercel --cwd website` | Server mode: `/api/agent` can use `OPENAI_API_KEY` |
| **GitHub Pages** | `npm run build:static` | Static export; Agent uses the local brain |
| **Firebase Hosting** | `npm run build:static && firebase deploy` | Static |

Setup details (domain, OpenAI key, Search Console): **[SETUP.md](./SETUP.md)**

Public: https://maxmccutcheon59.github.io/spindle/ · Cloud waitlist: `/cloud/` · Case study: `/case-study/`
