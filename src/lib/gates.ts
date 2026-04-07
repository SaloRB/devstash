import { prisma } from '@/lib/prisma'
import { checkRateLimit } from '@/lib/rate-limit'

export const FREE_LIMITS = {
  items: 50,
  collections: 3,
} as const

export async function getUserProStatus(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isPro: true },
  })
  return user?.isPro ?? false
}

export async function checkItemLimit(userId: string): Promise<boolean> {
  const isPro = await getUserProStatus(userId)
  if (isPro) return true

  const count = await prisma.item.count({ where: { userId } })
  return count < FREE_LIMITS.items
}

export async function checkCollectionLimit(userId: string): Promise<boolean> {
  const isPro = await getUserProStatus(userId)
  if (isPro) return true

  const count = await prisma.collection.count({ where: { userId } })
  return count < FREE_LIMITS.collections
}

export async function requireProWithRateLimit(
  userId: string
): Promise<{ allowed: true } | { allowed: false; error: 'PRO_REQUIRED' | 'RATE_LIMITED' }> {
  const isPro = await getUserProStatus(userId)
  if (!isPro) return { allowed: false, error: 'PRO_REQUIRED' }
  const { allowed } = await checkRateLimit(`ai:${userId}`, 20, '1 h')
  if (!allowed) return { allowed: false, error: 'RATE_LIMITED' }
  return { allowed: true }
}
