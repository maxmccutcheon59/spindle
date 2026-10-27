# Spindle Website

By **Max McCutcheon** — documentation site for the Spindle Rust LSM: design notes, an in-browser playground, and **Spindle Agent** (a Q&A assistant over the design notes).

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

Public: https://maxmccutcheon59.github.io/spindle/
