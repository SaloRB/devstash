import { prisma } from '@/lib/prisma'

export async function getRecentCollections(limit = 6) {
  return prisma.collection.findMany({
    take: limit,
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      name: true,
      description: true,
      isFavorite: true,
      items: {
        select: {
          item: {
            select: {
              itemType: { select: { id: true, icon: true, color: true } },
            },
          },
        },
      },
      _count: { select: { items: true } },
    },
  })
}

export async function getSidebarCollections(limit = 8) {
  return prisma.collection.findMany({
    take: limit,
    orderBy: [{ isFavorite: 'desc' }, { updatedAt: 'desc' }],
    select: {
      id: true,
      name: true,
      isFavorite: true,
      items: {
        select: {
          item: {
            select: {
              itemType: { select: { id: true, color: true } },
            },
          },
        },
      },
      _count: { select: { items: true } },
    },
  })
}

export type CollectionWithItems = Awaited<
  ReturnType<typeof getRecentCollections>
>[number]
export type SidebarCollection = Awaited<ReturnType<typeof getSidebarCollections>>[number]
