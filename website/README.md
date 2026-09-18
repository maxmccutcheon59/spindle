# Spindle Website (Spindle Cloud)

SaaS marketing + checkout for the Spindle LSM engine.

## Develop

```bash
cd website
cp .env.example .env.local
npm install
npm run dev
```

[http://127.0.0.1:43123](http://127.0.0.1:43123)

## Paid subscriptions (Stripe)

1. Create two [Stripe Payment Links](https://dashboard.stripe.com/payment-links) for Builder ($49/mo) and Scale ($149/mo).
2. Set in `.env.local`:

```bash
NEXT_PUBLIC_STRIPE_PAYMENT_LINK_BUILDER=https://buy.stripe.com/...
NEXT_PUBLIC_STRIPE_PAYMENT_LINK_SCALE=https://buy.stripe.com/...
```

Without those vars, `/subscribe/builder/` runs a **demo checkout** (no charge) so you can still walk the SaaS flow.

## Deploy on Google (Firebase Hosting)

```bash
cd website
npm run build
npx firebase login
npx firebase use --add   # create/select project spindle-cloud
npx firebase deploy --only hosting
```

Public URL will be `https://<project-id>.web.app` (and custom domain in Firebase console). That URL is what you submit to [Google Search Console](https://search.google.com/search-console) for indexing.

## GitHub Pages (optional)

```bash
NEXT_PUBLIC_BASE_PATH=/spindle NEXT_PUBLIC_SITE_URL=https://maxmccutcheon59.github.io/spindle npm run build
```

Workflow: `../.github/workflows/pages.yml`.
