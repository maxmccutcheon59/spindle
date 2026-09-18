# Production setup — get paid, domain, OpenAI, Google

Public site today: https://maxmccutcheon59.github.io/spindle/

**Goal:** real customers enter a **credit card or US bank account**, Stripe charges them, and **you (Max) receive the money** in Stripe → your bank.

---

## 1. Stripe — receive real money (required for live checkout)

### A. Create your account & bank payout

1. Sign up at [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register) with **maxmccutcheon59@gmail.com**.
2. Complete identity / business verification (Stripe asks for this before large payouts).
3. **Settings → Payouts** → link **your personal or business bank account**.
4. Turn **off Test mode** (toggle in the Dashboard) when you want live cards.

Money flow: Customer pays → Stripe balance → automatic **payouts to your bank** (usually 2 business days in the US after first settlements).

### B. Create the products (recurring)

1. **Product catalog → Add product**
2. **Spindle Cloud Builder** — recurring **$49 / month** (USD)
3. **Spindle Cloud Scale** — recurring **$149 / month** (USD)
4. Copy each **Price ID** (`price_...`) — you need these for Checkout API.

### C. Enable card + bank

1. **Settings → Payment methods**
2. Keep **Cards** on.
3. Enable **ACH Direct Debit** / US bank account if you want “Pay with bank.”
4. Optional: Apple Pay / Google Pay / Link — turn on for more conversion.

### D. Wire the site (pick one or both)

#### Option 1 — Checkout API (best: card + bank on `/subscribe/...`)

Deploy the Next.js app somewhere that runs **API routes** (Vercel recommended — GitHub Pages is static-only).

```bash
STRIPE_SECRET_KEY=sk_live_...          # or sk_test_... while testing
STRIPE_PRICE_BUILDER=price_...
STRIPE_PRICE_SCALE=price_...
STRIPE_ENABLE_ACH=1                    # optional — US bank on Checkout
STRIPE_WEBHOOK_SECRET=whsec_...        # from Webhooks endpoint
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

Webhook (Dashboard → Developers → Webhooks):

- URL: `https://your-domain.com/api/webhooks/stripe`
- Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`

#### Option 2 — Payment Links (works on GitHub Pages — every public customer)

1. On each Price → **Create payment link**
2. Paste into env (local) **and** GitHub → **Settings → Secrets and variables → Actions**:

| Secret name | Value |
|-------------|--------|
| `NEXT_PUBLIC_STRIPE_PAYMENT_LINK_BUILDER` | `https://buy.stripe.com/...` |
| `NEXT_PUBLIC_STRIPE_PAYMENT_LINK_SCALE` | `https://buy.stripe.com/...` |

3. Re-run **Deploy website** workflow (or push to `main`). The Pages build bakes the links into the static site so **every visitor worldwide** can pay by card/bank.

Checkout order: **API first** → **Payment Links** → on localhost demo → on public site **email Max** until links exist (never fake-charges customers).

### E. Test without real money

1. Toggle **Test mode** in Stripe.
2. Use `sk_test_...` and test cards: `4242 4242 4242 4242`, any future expiry, any CVC.
3. Confirm the payment appears in Stripe → **Payments**, then switch to live keys.

### F. You get paid

- Stripe Dashboard → **Balances / Payouts** shows money heading to your bank.
- Customers get Stripe receipts at the email they entered on `/subscribe/builder/` or `/subscribe/scale/`.

---

## 2. Custom domain (optional)

1. Buy a domain (Cloudflare, Namecheap, etc.).
2. Point it at Vercel (for live Checkout API) **or** GitHub Pages (Payment Links only).
3. Set:

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_BASE_PATH=
```

---

## 3. OpenAI for Spindle Agent (optional GPT mode)

```bash
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
```

Needs a server host (Vercel). GitHub Pages still runs the local Spindle brain in-browser.

---

## 4. Google Search Console

See [GOOGLE.md](./GOOGLE.md). Submit `sitemap.xml`.

---

## 5. Quick checklist

| Step | Done when |
|------|-----------|
| Stripe account + bank linked | Payouts page shows your account |
| Products $49 / $149 | Price IDs copied |
| Env keys on host | `/subscribe/builder/` says “Opening secure checkout” (not demo) |
| Test charge | Appears under Stripe → Payments |
| Live mode | Real cards charge; money → your bank |
