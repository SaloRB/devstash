import { prisma } from '@/lib/prisma'

export async function getRecentCollections(userId: string, limit = 6) {
  return prisma.collection.findMany({
    where: { userId },
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

export async function getSidebarCollections(userId: string, limit = 8) {
  return prisma.collection.findMany({
    where: { userId },
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

export async function createCollection(
  userId: string,
  data: { name: string; description?: string | null },
) {
  return prisma.collection.create({
    data: {
      name: data.name,
      description: data.description ?? null,
      userId,
    },
    select: { id: true, name: true, description: true },
  })
}

export async function getAllCollections(userId: string, page = 1, limit = 21) {
  const where = { userId }
  const [collections, total] = await prisma.$transaction([
    prisma.collection.findMany({
      where,
      orderBy: [{ isFavorite: 'desc' }, { updatedAt: 'desc' }],
      skip: (page - 1) * limit,
      take: limit,
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
    }),
    prisma.collection.count({ where }),
  ])
  return { collections, total }
}

export async function getCollectionWithItems(
  id: string,
  userId: string,
  page = 1,
  limit = 21,
) {
  const collection = await prisma.collection.findFirst({
    where: { id, userId },
    select: {
      id: true,
      name: true,
      description: true,
      isFavorite: true,
      items: {
        select: {
          item: {
            select: {
              id: true,
              title: true,
              description: true,
              isFavorite: true,
              isPinned: true,
              fileUrl: true,
              fileName: true,
              fileSize: true,
              createdAt: true,
              itemType: { select: { id: true, name: true, icon: true, color: true } },
              tags: { select: { name: true } },
            },
          },
        },
        orderBy: [{ item: { isPinned: 'desc' } }, { item: { createdAt: 'desc' } }],
        skip: (page - 1) * limit,
        take: limit,
      },
      _count: { select: { items: true } },
    },
  })
  return collection
}

export async function updateCollection(
  id: string,
  userId: string,
  data: { name: string; description?: string | null },
) {
  return prisma.collection.update({
    where: { id, userId },
    data: { name: data.name, description: data.description ?? null },
    select: { id: true, name: true, description: true },
  })
}

export async function deleteCollection(id: string, userId: string) {
  return prisma.collection.delete({
    where: { id, userId },
  })
}

export async function toggleFavoriteCollection(id: string, userId: string) {
  const collection = await prisma.collection.findFirst({ where: { id, userId }, select: { isFavorite: true } })
  if (!collection) throw new Error('Collection not found')
  return prisma.collection.update({
    where: { id, userId },
    data: { isFavorite: !collection.isFavorite },
    select: { id: true, isFavorite: true },
  })
}

export async function getFavoriteCollections(userId: string) {
  return prisma.collection.findMany({
    where: { isFavorite: true, userId },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      name: true,
      description: true,
      updatedAt: true,
      _count: { select: { items: true } },
    },
  })
}

export type FavoriteCollection = Awaited<ReturnType<typeof getFavoriteCollections>>[number]

export async function getCollectionName(id: string, userId: string) {
  return prisma.collection.findFirst({
    where: { id, userId },
    select: { name: true },
  })
}

export async function getUserCollections(userId: string) {
  return prisma.collection.findMany({
    where: { userId },
    orderBy: { name: 'asc' },
    select: { id: true, name: true },
  })
}

export type CollectionWithItems = Awaited<
  ReturnType<typeof getRecentCollections>
>[number]
export type SidebarCollection = Awaited<ReturnType<typeof getSidebarCollections>>[number]
export type UserCollection = Awaited<ReturnType<typeof getUserCollections>>[number]
