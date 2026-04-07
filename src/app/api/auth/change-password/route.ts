import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { requireApiAuth } from '@/lib/auth-guard'
import { prisma } from '@/lib/prisma'
import { applyRateLimit, getIP } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  const ip = getIP(req)
  const limited = await applyRateLimit(`change-password:${ip}`, 5, '15 m')
  if (limited) return limited

  const auth = await requireApiAuth()
  if (auth instanceof NextResponse) return auth

  const { currentPassword, newPassword } = await req.json()

  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: 'Both passwords are required' }, { status: 400 })
  }

  if (newPassword.length < 8) {
    return NextResponse.json({ error: 'New password must be at least 8 characters' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: { password: true },
  })

  if (!user?.password) {
    return NextResponse.json({ error: 'Not an email account' }, { status: 400 })
  }

  const valid = await bcrypt.compare(currentPassword, user.password)
  if (!valid) {
    return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
  }

  const hashed = await bcrypt.hash(newPassword, 10)
  await prisma.user.update({
    where: { id: auth.userId },
    data: { password: hashed },
  })

  return NextResponse.json({ ok: true })
}
