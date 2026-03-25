import { prisma } from '@/lib/prisma'

export async function getRecentCollections(limit = 6) {
  const collections = await prisma.collection.findMany({
    take: limit,
    orderBy: { updatedAt: 'desc' },
    include: {
      items: {
        include: {
          item: {
            include: {
              itemType: true,
            },
          },
        },
      },
      _count: {
        select: { items: true },
      },
    },
  })

  return collections
}

export type CollectionWithItems = Awaited<
  ReturnType<typeof getRecentCollections>
>[number]
