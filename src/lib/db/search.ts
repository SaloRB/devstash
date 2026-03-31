import { prisma } from '@/lib/prisma'

export type SearchItem = {
  id: string
  title: string
  description: string | null
  itemType: { name: string; icon: string; color: string }
}

export type SearchCollection = {
  id: string
  name: string
  _count: { items: number }
}

export async function getSearchData(userId: string): Promise<{
  items: SearchItem[]
  collections: SearchCollection[]
}> {
  const [items, collections] = await Promise.all([
    prisma.item.findMany({
      where: { userId },
      select: {
        id: true,
        title: true,
        description: true,
        itemType: { select: { name: true, icon: true, color: true } },
      },
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.collection.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        _count: { select: { items: true } },
      },
      orderBy: { updatedAt: 'desc' },
    }),
  ])
  return { items, collections }
}
