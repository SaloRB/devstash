import { NextRequest, NextResponse } from 'next/server'
import { requireApiAuth } from '@/lib/auth-guard'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/clients/stripe'

export async function POST(req: NextRequest) {
  const auth = await requireApiAuth()
  if (auth instanceof NextResponse) return auth

  const { interval } = await req.json()
  if (interval !== 'monthly' && interval !== 'yearly') {
    return NextResponse.json({ error: 'Invalid interval' }, { status: 400 })
  }

  const priceId =
    interval === 'monthly'
      ? process.env.STRIPE_PRICE_ID_MONTHLY!
      : process.env.STRIPE_PRICE_ID_YEARLY!

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: { email: true, stripeCustomerId: true },
  })

  let customerId = user?.stripeCustomerId ?? undefined

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user?.email ?? undefined,
      metadata: { userId: auth.userId },
    })
    customerId = customer.id
    await prisma.user.update({
      where: { id: auth.userId },
      data: { stripeCustomerId: customerId },
    })
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: { userId: auth.userId },
    success_url: `${process.env.NEXTAUTH_URL}/settings?tab=billing&checkout=success`,
    cancel_url: `${process.env.NEXTAUTH_URL}/settings?tab=billing&checkout=cancelled`,
  })

  return NextResponse.json({ url: checkoutSession.url })
}
