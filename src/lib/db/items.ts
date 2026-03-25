import { prisma } from '@/lib/prisma'

export async function getPinnedItems() {
  return prisma.item.findMany({
    where: { isPinned: true },
    orderBy: { updatedAt: 'desc' },
    include: {
      itemType: true,
      tags: true,
    },
  })
}

export async function getRecentItems(limit = 10) {
  return prisma.item.findMany({
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      itemType: true,
      tags: true,
    },
  })
}

export async function getDashboardStats() {
  const [totalItems, totalCollections, favoriteItems, favoriteCollections] =
    await prisma.$transaction([
      prisma.item.count(),
      prisma.collection.count(),
      prisma.item.count({ where: { isFavorite: true } }),
      prisma.collection.count({ where: { isFavorite: true } }),
    ])

  return { totalItems, totalCollections, favoriteItems, favoriteCollections }
}

export async function getItemTypesWithCounts() {
  return prisma.itemType.findMany({
    orderBy: { id: 'asc' },
    include: {
      _count: { select: { items: true } },
    },
  })
}

export type ItemWithType = Awaited<ReturnType<typeof getPinnedItems>>[number]
export type ItemTypeWithCount = Awaited<ReturnType<typeof getItemTypesWithCounts>>[number]
