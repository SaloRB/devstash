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

export async function getAllCollections(userId: string) {
  return prisma.collection.findMany({
    where: { userId },
    orderBy: [{ isFavorite: 'desc' }, { updatedAt: 'desc' }],
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

export async function getCollectionWithItems(id: string, userId: string) {
  return prisma.collection.findFirst({
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
        orderBy: { item: { createdAt: 'desc' } },
      },
      _count: { select: { items: true } },
    },
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
