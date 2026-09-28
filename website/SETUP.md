# Spindle website setup

**Honesty gate:** Spindle Cloud is **not built** and nothing is for sale. The
site offers a waitlist (`/cloud/`, a pre-filled email to
**MaxMcCutcheon1@outlook.com**). Do not market PITR, dashboards, storage
quotas, uptime targets, or prices as real until they exist.

---

## 1. Custom domain (optional)

1. Buy a domain (Cloudflare, Namecheap, etc.).
2. Point it at Vercel (server mode, GPT Agent) **or** GitHub Pages (static).
3. Set:

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_BASE_PATH=
```

---

## 2. OpenAI for Spindle Agent (optional GPT mode)

```bash
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
```

Needs a server host (Vercel). GitHub Pages still runs the local Spindle brain in-browser.

---

## 3. Google Search Console

See [GOOGLE.md](./GOOGLE.md). Submit `sitemap.xml`.

---
