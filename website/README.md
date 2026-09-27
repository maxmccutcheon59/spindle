# Spindle Website

By **Max McCutcheon** — engine-first marketing, Cloud roadmap / founding pricing hypotheses, Stripe checkout scaffold, playground, and **Spindle Agent**.

**Honesty:** the Rust LSM is live OSS. Spindle Cloud hosted durability is not a live billed multi-tenant product yet; GitHub Pages has no Checkout API.

## Develop

```bash
cd website
cp .env.example .env.local
# Add Stripe keys so checkout charges for real — see SETUP.md
npm install
npm run dev
```

[http://127.0.0.1:43123](http://127.0.0.1:43123)

## Get paid (Stripe)

When Stripe is connected, checkout can charge a **credit card** or **US bank (ACH)**. Funds land in that Stripe balance, then pay out to the linked bank.

Full steps: **[SETUP.md](./SETUP.md)**

Quick path:

1. Create a Stripe account, link your bank under **Payouts**
2. Create recurring products: Builder **$49/mo**, Scale **$149/mo**
3. Either:
   - **Vercel:** set `STRIPE_SECRET_KEY` + `STRIPE_PRICE_BUILDER` / `STRIPE_PRICE_SCALE` (Checkout API), or
   - **GitHub Pages:** set `NEXT_PUBLIC_STRIPE_PAYMENT_LINK_*` (Payment Links)
4. Toggle live mode when ready — test with `4242…` cards first

Without keys, `/subscribe/*` stays in **demo mode** (no charges).

## Google / production

| Target | Command | Notes |
|--------|---------|--------|
| **Vercel** (recommended) | `vercel --cwd website` | `/api/checkout`, `/api/agent`, webhooks |
| **GitHub Pages** | `SPINDLE_STATIC=1` build | Payment Links for live charges |
| **Firebase Hosting** | `SPINDLE_STATIC=1 npm run build && firebase deploy` | Static |

Public: https://maxmccutcheon59.github.io/spindle/ · Enterprise: `/enterprise/` · Case study: `/case-study/`
