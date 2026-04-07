import { NextResponse } from 'next/server'
import { requireApiAuth } from '@/lib/auth-guard'
import { prisma } from '@/lib/prisma'

export async function DELETE() {
  const auth = await requireApiAuth()
  if (auth instanceof NextResponse) return auth

  await prisma.user.delete({ where: { id: auth.userId } })

  return NextResponse.json({ ok: true })
}
