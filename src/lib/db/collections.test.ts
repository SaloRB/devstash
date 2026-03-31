import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    $transaction: vi.fn(),
    collection: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
  },
}))

import { getCollectionWithItems, getAllCollections } from './collections'
import { prisma } from '@/lib/prisma'

const mockFindFirst = vi.mocked(prisma.collection.findFirst)
const mockFindMany = vi.mocked(prisma.collection.findMany)
const mockCount = vi.mocked(prisma.collection.count)
const mockTransaction = vi.mocked(prisma.$transaction)

const mockCollection = {
  id: 'col-1',
  name: 'My Collection',
  description: 'A description',
  isFavorite: false,
  items: [
    {
      item: {
        id: 'item-1',
        title: 'Snippet 1',
        description: null,
        isFavorite: false,
        isPinned: false,
        fileUrl: null,
        fileName: null,
        fileSize: null,
        createdAt: new Date('2026-01-01'),
        itemType: { id: 1, name: 'snippet', icon: 'Code', color: '#3b82f6' },
        tags: [],
      },
    },
  ],
  _count: { items: 1 },
}

const mockCollectionCard = {
  id: 'col-1',
  name: 'My Collection',
  description: 'A description',
  isFavorite: false,
  items: [],
  _count: { items: 5 },
}

describe('getCollectionWithItems', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns collection with items', async () => {
    mockFindFirst.mockResolvedValue(mockCollection as never)

    const result = await getCollectionWithItems('col-1', 'user-1')

    expect(result).toEqual(mockCollection)
  })

  it('returns null when collection not found', async () => {
    mockFindFirst.mockResolvedValue(null)

    const result = await getCollectionWithItems('col-1', 'user-1')

    expect(result).toBeNull()
  })

  it('filters by id and userId', async () => {
    mockFindFirst.mockResolvedValue(mockCollection as never)

    await getCollectionWithItems('col-1', 'user-1')

    expect(mockFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'col-1', userId: 'user-1' },
      })
    )
  })

  it('uses page 1 skip=0 by default', async () => {
    mockFindFirst.mockResolvedValue(mockCollection as never)

    await getCollectionWithItems('col-1', 'user-1')

    expect(mockFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        select: expect.objectContaining({
          items: expect.objectContaining({ skip: 0, take: 21 }),
        }),
      })
    )
  })

  it('calculates skip correctly for page 2', async () => {
    mockFindFirst.mockResolvedValue(mockCollection as never)

    await getCollectionWithItems('col-1', 'user-1', 2, 21)

    expect(mockFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        select: expect.objectContaining({
          items: expect.objectContaining({ skip: 21, take: 21 }),
        }),
      })
    )
  })

  it('calculates skip correctly for page 3 with custom limit', async () => {
    mockFindFirst.mockResolvedValue(mockCollection as never)

    await getCollectionWithItems('col-1', 'user-1', 3, 10)

    expect(mockFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        select: expect.objectContaining({
          items: expect.objectContaining({ skip: 20, take: 10 }),
        }),
      })
    )
  })
})

describe('getAllCollections', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFindMany.mockResolvedValue([mockCollectionCard] as never)
    mockCount.mockResolvedValue(1 as never)
    mockTransaction.mockImplementation(((ops: unknown[]) => Promise.all(ops)) as never)
  })

  it('returns collections and total', async () => {
    const result = await getAllCollections('user-1')

    expect(result).toEqual({ collections: [mockCollectionCard], total: 1 })
  })

  it('uses page 1 skip=0 by default', async () => {
    await getAllCollections('user-1')

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 0, take: 21 })
    )
  })

  it('calculates skip correctly for page 2', async () => {
    await getAllCollections('user-1', 2, 21)

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 21, take: 21 })
    )
  })

  it('calculates skip correctly for page 3 with custom limit', async () => {
    await getAllCollections('user-1', 3, 10)

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 20, take: 10 })
    )
  })

  it('filters by userId', async () => {
    await getAllCollections('user-1')

    const expectedWhere = { userId: 'user-1' }
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expectedWhere })
    )
    expect(mockCount).toHaveBeenCalledWith(
      expect.objectContaining({ where: expectedWhere })
    )
  })
})
