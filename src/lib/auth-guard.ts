import { NextResponse } from 'next/server'
import { auth } from '@/auth'

export async function requireAuth(): Promise<string | null> {
  const session = await auth()
  return session?.user?.id ?? null
}

export async function requireApiAuth(): Promise<{ userId: string } | NextResponse> {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return { userId: session.user.id }
}
