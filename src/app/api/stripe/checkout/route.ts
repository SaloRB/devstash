import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { interval } = await req.json()
  if (interval !== 'monthly' && interval !== 'yearly') {
    return NextResponse.json({ error: 'Invalid interval' }, { status: 400 })
  }

  const priceId =
    interval === 'monthly'
      ? process.env.STRIPE_PRICE_ID_MONTHLY!
      : process.env.STRIPE_PRICE_ID_YEARLY!

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, stripeCustomerId: true },
  })

  let customerId = user?.stripeCustomerId ?? undefined

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user?.email ?? undefined,
      metadata: { userId: session.user.id },
    })
    customerId = customer.id
    await prisma.user.update({
      where: { id: session.user.id },
      data: { stripeCustomerId: customerId },
    })
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: { userId: session.user.id },
    success_url: `${process.env.NEXTAUTH_URL}/dashboard?upgraded=1`,
    cancel_url: `${process.env.NEXTAUTH_URL}/dashboard`,
  })

  return NextResponse.json({ url: checkoutSession.url })
}
