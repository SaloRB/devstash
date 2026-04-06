# Stripe Integration — Phase 1: Core Infrastructure

## Overview

Install Stripe SDK, wire `isPro` into the auth session, create the Stripe helper and API routes (checkout + portal), and build the usage-limits module with unit tests. No UI changes or feature gates in this phase.

## Requirements

- Install `stripe` npm package
- Add `isPro: boolean` to JWT + session types
- Sync `isPro` from DB on every JWT callback (catches webhook-driven updates)
- Stripe singleton helper at `src/lib/stripe.ts`
- POST `/api/stripe/checkout` — creates Checkout Session, reuses existing customer
- POST `/api/stripe/portal` — creates Customer Portal session
- `src/lib/gates.ts` usage-limits module with unit tests

## Environment Variables

```
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_ID_MONTHLY=
STRIPE_PRICE_ID_YEARLY=
```

Already templated in `.env.example` — just ensure `.env.local` has real values.

## Auth Changes

**`src/auth.config.ts`** — add `isPro` sync to JWT callback:
- On every token refresh, query `prisma.user.findUnique` for `isPro`
- Set `token.isPro` from DB result (default `false`)
- Pass `token.isPro` → `session.user.isPro` in session callback

**`src/types/next-auth.d.ts`** — extend types:
- `Session.user`: add `isPro: boolean`
- `JWT`: add `isPro?: boolean`

## New Files

| File | Purpose |
|---|---|
| `src/lib/stripe.ts` | Stripe client singleton |
| `src/lib/gates.ts` | Free-tier limit check utilities |
| `src/app/api/stripe/checkout/route.ts` | Create Checkout Session |
| `src/app/api/stripe/portal/route.ts` | Create Customer Portal Session |

## gates.ts — Usage Limits Module

```
FREE_LIMITS = { items: 50, collections: 3 }

checkItemLimit(userId)       → { allowed: boolean, count: number }
checkCollectionLimit(userId) → { allowed: boolean, count: number }
getUserProStatus(userId)     → boolean
```

## Unit Tests — `src/lib/gates.test.ts`

Test `checkItemLimit`, `checkCollectionLimit`, and `getUserProStatus` with a mocked Prisma client.

| Case | Expected |
|---|---|
| Item count < 50 | `allowed: true` |
| Item count = 50 | `allowed: false` |
| Item count > 50 | `allowed: false` |
| Collection count < 3 | `allowed: true` |
| Collection count = 3 | `allowed: false` |
| User with `isPro: true` | returns `true` |
| User with `isPro: false` | returns `false` |
| User not found | returns `false` |

Target 100% coverage on `gates.ts`.

## Checkout Route Behavior

- Auth-guard: 401 if no session
- Validate `interval` param: `"monthly"` or `"yearly"` — 400 otherwise
- Reuse `stripeCustomerId` if present, else pass `customer_email`
- Set `metadata.userId` on both the session and `subscription_data`
- `success_url` → `/settings?tab=billing&checkout=success`
- `cancel_url` → `/settings?tab=billing&checkout=cancelled`
- Returns `{ url }` — client redirects

## Portal Route Behavior

- Auth-guard: 401 if no session
- 400 if user has no `stripeCustomerId`
- `return_url` → `/settings?tab=billing`
- Returns `{ url }` — client redirects

## Notes

- No webhook handler in this phase — that's Phase 2
- No feature gates on server actions yet — Phase 2
- No Billing UI yet — Phase 2
- The `config = { api: { bodyParser: false } }` export is NOT needed in App Router routes; `req.text()` reads raw body directly
