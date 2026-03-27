import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    item: {
      findFirst: vi.fn(),
    },
  },
}))

import { getItemById } from './items'
import { prisma } from '@/lib/prisma'

const mockFindFirst = vi.mocked(prisma.item.findFirst)

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
