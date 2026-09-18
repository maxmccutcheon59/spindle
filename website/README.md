# Spindle Website (Spindle Cloud)

By **Max McCutcheon** — SaaS marketing, checkout, playground, and **Spindle Agent** (AI).

## Develop (AI API enabled)

```bash
cd website
cp .env.example .env.local
# optional: OPENAI_API_KEY=sk-... for GPT mode
npm install
npm run dev
```

[http://127.0.0.1:43123](http://127.0.0.1:43123) · Agent: [/agent](http://127.0.0.1:43123/agent/) · floating **AI** button site-wide.

## Google / production

| Target | Command | Notes |
|--------|---------|--------|
| **Vercel** (recommended for Agent) | `vercel --cwd website` | Keeps `/api/agent` + GPT |
| **Firebase (Google Hosting)** | `SPINDLE_STATIC=1 npm run build && firebase deploy` | Static; Agent needs Vercel or disable FAB |
| **GitHub Pages** | `SPINDLE_STATIC=1 NEXT_PUBLIC_BASE_PATH=/spindle npm run build` | Workflow in repo |

After public deploy: add the URL in [Google Search Console](https://search.google.com/search-console) (sitemap at `/sitemap.xml`).

## Stripe

Set `NEXT_PUBLIC_STRIPE_PAYMENT_LINK_BUILDER` / `_SCALE` in `.env.local`.
