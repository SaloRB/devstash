import { prisma } from '@/lib/prisma'

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
