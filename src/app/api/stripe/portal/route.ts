import { NextResponse } from 'next/server'
import { requireApiAuth } from '@/lib/auth-guard'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/clients/stripe'

export async function POST() {
  const auth = await requireApiAuth()
  if (auth instanceof NextResponse) return auth

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: { stripeCustomerId: true },
  })

  if (!user?.stripeCustomerId) {
    return NextResponse.json({ error: 'No billing account found' }, { status: 400 })
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${process.env.NEXTAUTH_URL}/settings`,
  })

  return NextResponse.json({ url: portalSession.url })
}
