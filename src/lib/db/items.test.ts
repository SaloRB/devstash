import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    $transaction: vi.fn(),
    item: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      update: vi.fn(),
    },
  },
}))

import { getItemById, getItemsByType, togglePinnedItem } from './items'
import { prisma } from '@/lib/prisma'

const mockFindFirst = vi.mocked(prisma.item.findFirst)
const mockUpdate = vi.mocked(prisma.item.update)
const mockTransaction = vi.mocked(prisma.$transaction)
const mockFindMany = vi.mocked(prisma.item.findMany)
const mockCount = vi.mocked(prisma.item.count)

const mockItem = {
  id: 'item-1',
  userId: 'user-1',
  title: 'My Snippet',
  content: 'console.log("hello")',
  description: null,
  url: null,
  fileUrl: null,
  language: 'javascript',
  isFavorite: false,
  isPinned: false,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-02'),
  itemType: { id: 1, name: 'Snippet', icon: 'Code', color: '#3b82f6', isSystem: true, userId: null },
  tags: [],
  collections: [],
}

describe('getItemsByType', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFindMany.mockResolvedValue([mockItem] as never)
    mockCount.mockResolvedValue(1 as never)
    mockTransaction.mockImplementation(((ops: unknown[]) => Promise.all(ops)) as never)
  })

  it('returns items and total', async () => {
    const result = await getItemsByType('user-1', 'snippet')

    expect(result).toEqual({ items: [mockItem], total: 1 })
  })

  it('uses page 1 skip=0 by default', async () => {
    await getItemsByType('user-1', 'snippet')

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 0, take: 21 })
    )
  })

  it('calculates skip correctly for page 2', async () => {
    await getItemsByType('user-1', 'snippet', 2, 21)

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 21, take: 21 })
    )
  })

  it('calculates skip correctly for page 3 with custom limit', async () => {
    await getItemsByType('user-1', 'snippet', 3, 10)

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 20, take: 10 })
    )
  })

  it('filters by userId and type', async () => {
    await getItemsByType('user-1', 'snippet')

    const expectedWhere = { userId: 'user-1', itemType: { name: 'snippet' } }
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expectedWhere })
    )
    expect(mockCount).toHaveBeenCalledWith(
      expect.objectContaining({ where: expectedWhere })
    )
  })
})

describe('togglePinnedItem', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('flips isPinned from false to true', async () => {
    mockFindFirst.mockResolvedValue({ isPinned: false } as never)
    mockUpdate.mockResolvedValue({ id: 'item-1', isPinned: true } as never)

    const result = await togglePinnedItem('item-1', 'user-1')

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ data: { isPinned: true } })
    )
    expect(result).toEqual({ id: 'item-1', isPinned: true })
  })

  it('flips isPinned from true to false', async () => {
    mockFindFirst.mockResolvedValue({ isPinned: true } as never)
    mockUpdate.mockResolvedValue({ id: 'item-1', isPinned: false } as never)

    const result = await togglePinnedItem('item-1', 'user-1')

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ data: { isPinned: false } })
    )
    expect(result).toEqual({ id: 'item-1', isPinned: false })
  })

  it('throws when item not found', async () => {
    mockFindFirst.mockResolvedValue(null)

    await expect(togglePinnedItem('item-1', 'user-1')).rejects.toThrow('Item not found')
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('scopes findFirst to userId', async () => {
    mockFindFirst.mockResolvedValue({ isPinned: false } as never)
    mockUpdate.mockResolvedValue({ id: 'item-1', isPinned: true } as never)

    await togglePinnedItem('item-1', 'user-1')

    expect(mockFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'item-1', userId: 'user-1' } })
    )
  })
})

describe('getItemById', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns item when id and userId match', async () => {
    mockFindFirst.mockResolvedValue(mockItem as never)

    const result = await getItemById('item-1', 'user-1')

    expect(mockFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'item-1', userId: 'user-1' },
      })
    )
    expect(result).toEqual(mockItem)
  })

  it('returns null when item does not belong to user', async () => {
    mockFindFirst.mockResolvedValue(null)

    const result = await getItemById('item-1', 'other-user')

    expect(result).toBeNull()
  })

  it('returns null when item does not exist', async () => {
    mockFindFirst.mockResolvedValue(null)

    const result = await getItemById('nonexistent-id', 'user-1')

    expect(result).toBeNull()
  })

  it('includes itemType, tags, and collections', async () => {
    mockFindFirst.mockResolvedValue(mockItem as never)

    await getItemById('item-1', 'user-1')

    expect(mockFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        include: expect.objectContaining({
          itemType: true,
          tags: true,
          collections: expect.any(Object),
        }),
      })
    )
  })
})
