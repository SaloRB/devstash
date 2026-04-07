import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/clients/stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId
        if (!userId) break

        const subscription = session.subscription
          ? await stripe.subscriptions.retrieve(session.subscription as string)
          : null

        await prisma.user.update({
          where: { id: userId },
          data: {
            isPro: true,
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: subscription?.id ?? null,
          },
        })
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata?.userId
        if (!userId) break

        const isPro = subscription.status === 'active' || subscription.status === 'trialing'
        await prisma.user.update({
          where: { id: userId },
          data: { isPro },
        })
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata?.userId
        if (!userId) break

        await prisma.user.update({
          where: { id: userId },
          data: { isPro: false, stripeSubscriptionId: null },
        })
        break
      }

      case 'invoice.payment_failed': {
        // No access revocation — Stripe retries automatically
        break
      }
    }
  } catch {
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
