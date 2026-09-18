# Legal & company formation (founder notes)

This is **not legal advice**. Talk to a lawyer/CPA in your state before you
take meaningful revenue or hire anyone. It is the operating plan for Spindle.

## Do you need a company name?

**Yes — before serious Stripe volume.** Taking card/bank payments as a solo
person is allowed, but an **LLC** (or C-Corp if you raise VC later) gives you:

- Clear ownership of Spindle Cloud, branding, and Agent
- A bank account / Stripe entity that matches the business
- Liability separation for customer contracts
- A clean place to assign IP when you grow

Until then, **Max McCutcheon personally** owns Spindle, Spindle Cloud, and
Spindle Agent (engine remains MIT).

## What kind of company should Spindle be?

| Path | Verdict |
|------|---------|
| **Storage / infra SaaS** (KV + Cloud + Agent that knows your store) | **Yes — this is Spindle.** Defendable, ships today. |
| Multi-product SaaS layers on the same data plane | Later, after Cloud has real tenants |
| Agentic AI / LLM *on top of Spindle* | Natural expansion (Agent already exists) — not a new company name |
| Own “certain infrastructure” (storage, regions, ops) | Same company — that’s Cloud maturing |
| Hardware / robotics mega-corp | **Different company.** Don’t dilute Spindle’s brand or legal entity with that pitch yet |
| “Massive AI company” rebrand | **No.** Looks unserious while the product is early-access KV Cloud |

**Rule:** one legal entity, one primary product story, expand capabilities —
don’t invent five industries on the homepage.

## Suggested sequence

1. Keep shipping Spindle Cloud; take payments via Stripe (see SETUP.md).
2. Form **Spindle LLC** (or similar) in your state — file articles, EIN, business bank.
3. Update Stripe + site footer: “Spindle LLC · founded by Max McCutcheon”.
4. Sign a short **IP assignment**: Max → LLC (engine license stays MIT; Cloud/Agent/trademarks assign).
5. Only then consider a second entity if you truly start robotics/hardware.

## Naming

- Product can stay **Spindle** / **Spindle Cloud**.
- Legal name can be `Spindle LLC`, `Spindle Labs LLC`, etc. — check name
  availability with your state + USPTO if you trademark.
- Don’t rename the public brand to something like “OmniAI Robotics” while
  selling a KV store.

## Customers & contracts

Until an LLC exists, invoices and Stripe payouts are under your name/email
(`maxmccutcheon59@gmail.com`). After formation, re-issue Stripe under the LLC
and update the site ownership line.
