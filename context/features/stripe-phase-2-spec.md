# Stripe Integration — Phase 2: Webhooks, Feature Gates & Billing UI

## Overview

Wire up the Stripe webhook handler, add feature gate checks to server actions, and build the Billing section in settings. Requires Stripe CLI for local webhook testing.

## Prerequisites

- Phase 1 complete (`stripe` installed, `isPro` in session, API routes, `gates.ts`)
- Stripe CLI installed and `stripe listen` running locally

## Requirements

- Webhook handler at `/api/stripe/webhook`
- Gate checks in `createItem` and `createCollection` server actions
- Billing tab in `/settings` page
- Client-side upgrade modal/toast on gate errors

## New Files

| File | Purpose |
|---|---|
| `src/app/api/stripe/webhook/route.ts` | Handle Stripe lifecycle events |

## Files to Modify

| File | Change |
|---|---|
| `src/actions/items.ts` | Add pro/limit gates to `createItem` |
| `src/actions/collections.ts` | Add limit gate to `createCollection` |
| `src/app/(main)/settings/page.tsx` | Add Billing tab |

## Webhook Handler

**`src/app/api/stripe/webhook/route.ts`**

- Read raw body via `req.text()`
- Verify signature with `stripe.webhooks.constructEvent` + `STRIPE_WEBHOOK_SECRET`
- Return 400 on missing or invalid signature

### Events to Handle

| Event | Action |
|---|---|
| `checkout.session.completed` | Set `isPro: true`, store `stripeCustomerId` + `stripeSubscriptionId` |
| `customer.subscription.updated` | Set `isPro` based on `status === "active" \| "trialing"` |
| `customer.subscription.deleted` | Set `isPro: false`, clear `stripeSubscriptionId` |
| `invoice.payment_failed` | No access revocation — Stripe retries; optionally trigger email |

All events resolve `userId` from `metadata.userId` on the subscription or checkout session.

## Feature Gates — Server Actions

### `createItem` (`src/actions/items.ts`)

Before the existing try block:
1. `getUserProStatus(userId)` → `isPro`
2. If `!isPro` and item type is `file` or `image` → return `{ success: false, error: "PRO_REQUIRED" }`
3. If `!isPro` → `checkItemLimit(userId)` → if `!allowed` → return `{ success: false, error: "ITEM_LIMIT_REACHED" }`

### `createCollection` (`src/actions/collections.ts`)

Before the existing try block:
1. `getUserProStatus(userId)` → `isPro`
2. If `!isPro` → `checkCollectionLimit(userId)` → if `!allowed` → return `{ success: false, error: "COLLECTION_LIMIT_REACHED" }`

### Error Codes

| Code | Trigger | UI Response |
|---|---|---|
| `ITEM_LIMIT_REACHED` | Free user at 50 items | Toast + upgrade prompt |
| `COLLECTION_LIMIT_REACHED` | Free user at 3 collections | Toast + upgrade prompt |
| `PRO_REQUIRED` | Free user selects File/Image type | Toast + upgrade prompt |

## Billing Settings UI

**`src/app/(main)/settings/page.tsx`** — add Billing tab.

### Free User View

- Free/Pro plan comparison table matching homepage pricing section
- Monthly ($8/mo) and yearly ($72/yr) upgrade buttons
- Clicking either → POST `/api/stripe/checkout` with `{ interval }` → redirect to Stripe Checkout

### Pro User View

- Current plan badge ("Pro — Monthly" or "Pro — Annual")
- Next billing date (if available from session/API)
- "Manage Billing" button → POST `/api/stripe/portal` → redirect to Stripe Customer Portal

### Success/Cancel Handling

- On `/settings?tab=billing&checkout=success` → show success toast, display Pro status
- On `/settings?tab=billing&checkout=cancelled` → show neutral toast

## Local Dev — Stripe CLI

```bash
brew install stripe/stripe-cli/stripe
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

The CLI prints a webhook signing secret — use it for `STRIPE_WEBHOOK_SECRET` locally (different from the Dashboard secret).

## Stripe Dashboard Setup

1. Create product "DevStash Pro" with two prices:
   - $8.00/month recurring → `STRIPE_PRICE_ID_MONTHLY`
   - $72.00/year recurring → `STRIPE_PRICE_ID_YEARLY`
2. Billing → Customer Portal → Activate (allow cancel, update payment, view invoices)
3. Webhooks → Add endpoint `https://yourdomain.com/api/stripe/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
   - Copy signing secret → `STRIPE_WEBHOOK_SECRET` (prod)

## Testing Checklist

### Checkout Flow
- [ ] Free user sees upgrade CTAs on Billing tab
- [ ] Monthly/yearly CTA → Stripe Checkout redirect
- [ ] Complete with `4242 4242 4242 4242` → redirect back to settings
- [ ] DB: `isPro=true`, `stripeCustomerId`, `stripeSubscriptionId` set
- [ ] Page reload: `session.user.isPro === true`

### Feature Gates
- [ ] Free user blocked at item 51 (`ITEM_LIMIT_REACHED`)
- [ ] Free user blocked at collection 4 (`COLLECTION_LIMIT_REACHED`)
- [ ] Free user blocked on File/Image type (`PRO_REQUIRED`)
- [ ] Pro user: no limits enforced

### Webhook Events
- [ ] `checkout.session.completed` → isPro set
- [ ] `customer.subscription.deleted` → isPro cleared
- [ ] `customer.subscription.updated` active → isPro true
- [ ] `customer.subscription.updated` canceled → isPro false

### Customer Portal
- [ ] Pro user → Manage Billing → portal redirect
- [ ] Cancel in portal → webhook fires → isPro cleared in DB
- [ ] Reload → session reflects non-pro status

### Test Cards
- `4242 4242 4242 4242` — success
- `4000 0000 0000 9995` — declined
- `4000 0025 0000 3155` — 3D Secure required
