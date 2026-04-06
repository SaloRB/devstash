# Stripe Subscription Integration Plan

DevStash Pro — $8/mo monthly, $72/yr annual.

---

## Current State

### User Model
`prisma/schema.prisma` already has all required fields:

```prisma
isPro                Boolean   @default(false)
stripeCustomerId     String?   @unique
stripeSubscriptionId String?   @unique
```

### Auth
- NextAuth v5, JWT strategy (`src/auth.ts` + `src/auth.config.ts`)
- Session type augmentation in `src/types/next-auth.d.ts` — only `id` is on session
- `isPro` is **not** currently in the JWT or session
- All server actions get user via `const session = await auth()` → `session.user.id`

### Env Vars
`.env.example` already has Stripe vars templated:
```
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_ID_MONTHLY=
STRIPE_PRICE_ID_YEARLY=
```

### What Doesn't Exist Yet
- `stripe` npm package not installed
- No checkout or billing API routes
- No webhook handler
- No feature gate checks (items/collections are uncapped)
- No Billing section in settings

---

## Free vs Pro Limits

| Feature | Free | Pro |
|---|---|---|
| Items | 50 | Unlimited |
| Collections | 3 | Unlimited |
| Item types | Snippet, Prompt, Command, Note, Link | + File, Image |
| AI features | No | Yes |
| File uploads | No | Yes |
| Data export | No | Yes |

---

## Implementation Order

1. Install Stripe SDK + add env vars
2. Update auth (JWT callback + session type)
3. Create Stripe lib helper
4. Create checkout API route
5. Create customer portal API route
6. Create webhook handler
7. Add feature gate utility
8. Add gate checks to server actions (items, collections, item types)
9. Add Billing section to settings page
10. Configure Stripe Dashboard

---

## Step-by-Step Implementation

### 1. Install Stripe SDK

```bash
npm install stripe
```

---

### 2. Update Auth — Sync `isPro` in JWT Callback

**File:** `src/auth.config.ts`

`isPro` must be synced from DB on every token validation so webhook updates are reflected after a page reload (no manual session update needed).

```typescript
// src/auth.config.ts
import type { NextAuthConfig } from "next-auth";
import { prisma } from "@/lib/prisma";

export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      // Always sync isPro from DB — catches webhook-driven updates
      if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { isPro: true },
        });
        token.isPro = dbUser?.isPro ?? false;
      }
      return token;
    },
    session({ session, token }) {
      if (token.id) session.user.id = token.id as string;
      if (typeof token.isPro === "boolean") session.user.isPro = token.isPro;
      return session;
    },
  },
};
```

**File:** `src/types/next-auth.d.ts` — add `isPro` to session:

```typescript
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      isPro: boolean;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    isPro?: boolean;
  }
}
```

---

### 3. Create Stripe Helper

**New file:** `src/lib/stripe.ts`

```typescript
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});
```

---

### 4. Create Checkout API Route

**New file:** `src/app/api/stripe/checkout/route.ts`

Creates a Stripe Checkout Session, reuses existing customer if one exists.

```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

const PRICE_IDS = {
  monthly: process.env.STRIPE_PRICE_ID_MONTHLY!,
  yearly: process.env.STRIPE_PRICE_ID_YEARLY!,
};

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { interval } = await req.json();
  if (interval !== "monthly" && interval !== "yearly") {
    return NextResponse.json({ error: "Invalid interval" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, stripeCustomerId: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Reuse existing customer or let Stripe create one
  const customer = user.stripeCustomerId
    ? { customer: user.stripeCustomerId }
    : { customer_email: user.email ?? undefined };

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    ...customer,
    line_items: [{ price: PRICE_IDS[interval], quantity: 1 }],
    success_url: `${process.env.NEXTAUTH_URL}/settings?tab=billing&checkout=success`,
    cancel_url: `${process.env.NEXTAUTH_URL}/settings?tab=billing&checkout=cancelled`,
    metadata: { userId: session.user.id },
    subscription_data: { metadata: { userId: session.user.id } },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
```

---

### 5. Create Customer Portal API Route

**New file:** `src/app/api/stripe/portal/route.ts`

Sends user to Stripe's self-serve billing portal for cancellations, plan changes, payment method updates.

```typescript
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { stripeCustomerId: true },
  });

  if (!user?.stripeCustomerId) {
    return NextResponse.json({ error: "No billing account found" }, { status: 400 });
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${process.env.NEXTAUTH_URL}/settings?tab=billing`,
  });

  return NextResponse.json({ url: portalSession.url });
}
```

---

### 6. Create Webhook Handler

**New file:** `src/app/api/stripe/webhook/route.ts`

Handles subscription lifecycle events from Stripe.

```typescript
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode !== "subscription") break;

      const userId = session.metadata?.userId;
      const customerId = session.customer as string;
      const subscriptionId = session.subscription as string;

      if (!userId) break;

      await prisma.user.update({
        where: { id: userId },
        data: {
          isPro: true,
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscriptionId,
        },
      });
      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.userId;
      if (!userId) break;

      const isActive = sub.status === "active" || sub.status === "trialing";
      await prisma.user.update({
        where: { id: userId },
        data: { isPro: isActive },
      });
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.userId;
      if (!userId) break;

      await prisma.user.update({
        where: { id: userId },
        data: {
          isPro: false,
          stripeSubscriptionId: null,
        },
      });
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const sub = invoice.subscription
        ? await stripe.subscriptions.retrieve(invoice.subscription as string)
        : null;
      const userId = sub?.metadata?.userId;
      if (!userId) break;

      // Optionally send an email here — don't revoke access immediately
      // Stripe will retry and eventually cancel the subscription
      break;
    }
  }

  return NextResponse.json({ received: true });
}

// Required — disable body parsing so raw body is available for signature verification
export const config = { api: { bodyParser: false } };
```

> **Note:** The `config` export for `bodyParser: false` is a Pages Router pattern. In App Router, `req.text()` already reads the raw body correctly — no extra config needed.

---

### 7. Feature Gate Utility

**New file:** `src/lib/gates.ts`

```typescript
import { prisma } from "@/lib/prisma";

export const FREE_LIMITS = {
  items: 50,
  collections: 3,
} as const;

export async function checkItemLimit(userId: string): Promise<{ allowed: boolean; count: number }> {
  const count = await prisma.item.count({ where: { userId } });
  return { allowed: count < FREE_LIMITS.items, count };
}

export async function checkCollectionLimit(userId: string): Promise<{ allowed: boolean; count: number }> {
  const count = await prisma.collection.count({ where: { userId } });
  return { allowed: count < FREE_LIMITS.collections, count };
}

export async function getUserProStatus(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isPro: true },
  });
  return user?.isPro ?? false;
}
```

---

### 8. Add Gate Checks to Server Actions

#### Items — `src/actions/items.ts`

Add before the `try` block in `createItem`:

```typescript
import { checkItemLimit, getUserProStatus } from "@/lib/gates";

export async function createItem(data: CreateItemInput) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false as const, error: "Unauthorized" };
  }

  const isPro = await getUserProStatus(session.user.id);

  // Block pro-only types for free users
  const proOnlyTypes = ["file", "image"];
  if (!isPro && proOnlyTypes.includes(data.itemTypeId /* or type slug */)) {
    return { success: false as const, error: "PRO_REQUIRED" };
  }

  // Enforce item limit for free users
  if (!isPro) {
    const { allowed } = await checkItemLimit(session.user.id);
    if (!allowed) {
      return { success: false as const, error: "ITEM_LIMIT_REACHED" };
    }
  }

  // ... rest of existing logic
}
```

> Use distinct error codes (`PRO_REQUIRED`, `ITEM_LIMIT_REACHED`) so the client can show upgrade prompts.

#### Collections — `src/actions/collections.ts`

Add before the `try` block in `createCollection`:

```typescript
import { checkCollectionLimit, getUserProStatus } from "@/lib/gates";

export async function createCollection(data: CreateCollectionInput) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false as const, error: "Unauthorized" };
  }

  const isPro = await getUserProStatus(session.user.id);

  if (!isPro) {
    const { allowed } = await checkCollectionLimit(session.user.id);
    if (!allowed) {
      return { success: false as const, error: "COLLECTION_LIMIT_REACHED" };
    }
  }

  // ... rest of existing logic
}
```

---

### 9. Billing Section in Settings

**File:** `src/app/(main)/settings/page.tsx`

Add a Billing tab. The component reads `session.user.isPro` (available after the JWT callback update) and shows either:
- Free user: pricing cards + upgrade CTAs
- Pro user: current plan info + "Manage Billing" button → portal

```typescript
// Upgrade to Pro (free user)
async function handleUpgrade(interval: "monthly" | "yearly") {
  const res = await fetch("/api/stripe/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ interval }),
  });
  const { url } = await res.json();
  window.location.href = url;
}

// Manage subscription (pro user)
async function handleManageBilling() {
  const res = await fetch("/api/stripe/portal", { method: "POST" });
  const { url } = await res.json();
  window.location.href = url;
}
```

---

## Stripe Dashboard Setup

1. **Create products:**
   - Product: "DevStash Pro"
   - Price 1: $8.00 / month (recurring) → copy Price ID → `STRIPE_PRICE_ID_MONTHLY`
   - Price 2: $72.00 / year (recurring) → copy Price ID → `STRIPE_PRICE_ID_YEARLY`

2. **Configure Customer Portal:**
   - Stripe Dashboard → Billing → Customer Portal → Activate
   - Allow: cancel subscriptions, update payment methods, view invoices

3. **Configure Webhooks:**
   - Add endpoint: `https://yourdomain.com/api/stripe/webhook`
   - Events to listen for:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_failed`
   - Copy Signing Secret → `STRIPE_WEBHOOK_SECRET`

4. **Local dev — Stripe CLI:**
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
   The CLI prints a webhook secret — use that for `STRIPE_WEBHOOK_SECRET` locally.

---

## Files to Create

| File | Purpose |
|---|---|
| `src/lib/stripe.ts` | Stripe client singleton |
| `src/lib/gates.ts` | Free tier limit check utilities |
| `src/app/api/stripe/checkout/route.ts` | Create Checkout Session |
| `src/app/api/stripe/portal/route.ts` | Create Customer Portal Session |
| `src/app/api/stripe/webhook/route.ts` | Handle Stripe webhook events |

## Files to Modify

| File | Change |
|---|---|
| `src/auth.config.ts` | Add `isPro` sync to JWT callback |
| `src/types/next-auth.d.ts` | Add `isPro: boolean` to Session and JWT types |
| `src/actions/items.ts` | Add pro/limit gate before create |
| `src/actions/collections.ts` | Add limit gate before create |
| `src/app/(main)/settings/page.tsx` | Add Billing tab/section |
| `.env.example` | Already has Stripe vars — just ensure they're documented |
| `package.json` | Add `stripe` dependency |

---

## Testing Checklist

### Stripe CLI Setup
- [ ] Install Stripe CLI: `brew install stripe/stripe-cli/stripe`
- [ ] Login: `stripe login`
- [ ] Forward webhooks: `stripe listen --forward-to localhost:3000/api/stripe/webhook`

### Checkout Flow
- [ ] Free user sees upgrade CTAs
- [ ] Clicking monthly/yearly CTA redirects to Stripe Checkout
- [ ] Completing checkout with test card `4242 4242 4242 4242` redirects back to settings
- [ ] After checkout: user has `isPro=true` in DB
- [ ] After page reload: `session.user.isPro` is `true`
- [ ] Settings page shows Pro status

### Feature Gates
- [ ] Free user blocked from creating item 51+
- [ ] Free user blocked from creating collection 4+
- [ ] Free user blocked from creating File/Image type items
- [ ] Pro user can create unlimited items
- [ ] Pro user can create unlimited collections
- [ ] Pro user can create File/Image type items

### Webhook Events
- [ ] `checkout.session.completed` → sets isPro, customerId, subscriptionId
- [ ] `customer.subscription.deleted` → clears isPro, subscriptionId
- [ ] `customer.subscription.updated` with status `active` → isPro stays true
- [ ] `customer.subscription.updated` with status `canceled` → isPro becomes false

### Customer Portal
- [ ] Pro user can open billing portal
- [ ] Can cancel subscription from portal
- [ ] After cancellation: webhook fires, isPro cleared in DB
- [ ] After page reload: session reflects non-pro status

### Test Cards
- `4242 4242 4242 4242` — successful payment
- `4000 0000 0000 9995` — card declined
- `4000 0025 0000 3155` — requires 3D Secure

---

## Error Code Handling (Client)

Server actions return these string error codes — map them to upgrade prompts:

| Code | Trigger | UI Response |
|---|---|---|
| `ITEM_LIMIT_REACHED` | createItem, free user at 50 | Toast + upgrade modal |
| `COLLECTION_LIMIT_REACHED` | createCollection, free user at 3 | Toast + upgrade modal |
| `PRO_REQUIRED` | createItem with File/Image type | Toast + upgrade modal |
