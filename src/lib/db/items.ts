import { prisma } from '@/lib/prisma'

export async function getPinnedItems(userId: string) {
  return prisma.item.findMany({
    where: { isPinned: true, userId },
    orderBy: { updatedAt: 'desc' },
    include: {
      itemType: true,
      tags: true,
    },
  })
}

export async function getRecentItems(userId: string, limit = 10) {
  return prisma.item.findMany({
    where: { userId },
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      itemType: true,
      tags: true,
    },
  })
}

export async function getDashboardStats(userId: string) {
  const [totalItems, totalCollections, favoriteItems, favoriteCollections] =
    await prisma.$transaction([
      prisma.item.count({ where: { userId } }),
      prisma.collection.count({ where: { userId } }),
      prisma.item.count({ where: { isFavorite: true, userId } }),
      prisma.collection.count({ where: { isFavorite: true, userId } }),
    ])

  return { totalItems, totalCollections, favoriteItems, favoriteCollections }
}

export async function getItemTypesWithCounts(userId: string) {
  return prisma.itemType.findMany({
    where: { OR: [{ isSystem: true }, { userId }] },
    orderBy: { id: 'asc' },
    include: {
      _count: { select: { items: { where: { userId } } } },
    },
  })
}

export async function getItemsByType(userId: string, type: string) {
  return prisma.item.findMany({
    where: { userId, itemType: { name: type } },
    orderBy: { createdAt: 'desc' },
    include: {
      itemType: true,
      tags: true,
    },
  })
}

export async function getItemById(id: string, userId: string) {
  return prisma.item.findFirst({
    where: { id, userId },
    include: {
      itemType: true,
      tags: true,
      collections: {
        include: { collection: { select: { id: true, name: true } } },
      },
    },
  })
}

export async function updateItem(
  id: string,
  userId: string,
  data: {
    title: string
    description: string | null
    content: string | null
    url: string | null
    language: string | null
    tags: string[]
    collectionIds: string[]
  }
) {
  const { tags, collectionIds, ...fields } = data
  return prisma.item.update({
    where: { id, userId },
    data: {
      ...fields,
      tags: {
        set: [],
        connectOrCreate: tags.map((name) => ({
          where: { name },
          create: { name },
        })),
      },
      collections: {
        deleteMany: {},
        create: collectionIds.map((collectionId) => ({ collectionId })),
      },
    },
    include: {
      itemType: true,
      tags: true,
      collections: {
        include: { collection: { select: { id: true, name: true } } },
      },
    },
  })
}

export async function createItem(
  userId: string,
  itemTypeId: string,
  data: {
    title: string
    description: string | null
    content: string | null
    url: string | null
    language: string | null
    tags: string[]
    fileUrl?: string | null
    fileName?: string | null
    fileSize?: number | null
    collectionIds?: string[]
  }
) {
  const { tags, fileUrl, fileName, fileSize, collectionIds = [], ...fields } = data
  const contentType = fileUrl ? ('FILE' as const) : ('TEXT' as const)
  return prisma.item.create({
    data: {
      ...fields,
      contentType,
      fileUrl: fileUrl ?? null,
      fileName: fileName ?? null,
      fileSize: fileSize ?? null,
      userId,
      itemTypeId,
      tags: {
        connectOrCreate: tags.map((name) => ({
          where: { name },
          create: { name },
        })),
      },
      ...(collectionIds.length > 0 && {
        collections: {
          create: collectionIds.map((collectionId) => ({ collectionId })),
        },
      }),
    },
    include: {
      itemType: true,
      tags: true,
      collections: {
        include: { collection: { select: { id: true, name: true } } },
      },
    },
  })
}

export async function deleteItem(id: string, userId: string) {
  return prisma.item.delete({
    where: { id, userId },
    select: { id: true, fileUrl: true },
  })
}

export type ItemWithType = Awaited<ReturnType<typeof getPinnedItems>>[number]
export type ItemTypeWithCount = Awaited<ReturnType<typeof getItemTypesWithCounts>>[number]
export type ItemDetail = NonNullable<Awaited<ReturnType<typeof getItemById>>>
