import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: { findUnique: vi.fn() },
    item: { count: vi.fn() },
    collection: { count: vi.fn() },
  },
}))

import { getUserProStatus, checkItemLimit, checkCollectionLimit, FREE_LIMITS } from './gates'
import { prisma } from '@/lib/prisma'

const mockUserFindUnique = vi.mocked(prisma.user.findUnique)
const mockItemCount = vi.mocked(prisma.item.count)
const mockCollectionCount = vi.mocked(prisma.collection.count)

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getUserProStatus', () => {
  it('returns true when user isPro', async () => {
    mockUserFindUnique.mockResolvedValue({ isPro: true } as never)
    expect(await getUserProStatus('u1')).toBe(true)
  })

  it('returns false when user is not pro', async () => {
    mockUserFindUnique.mockResolvedValue({ isPro: false } as never)
    expect(await getUserProStatus('u1')).toBe(false)
  })

  it('returns false when user not found', async () => {
    mockUserFindUnique.mockResolvedValue(null)
    expect(await getUserProStatus('u1')).toBe(false)
  })
})

describe('checkItemLimit', () => {
  it('returns true for pro user regardless of count', async () => {
    mockUserFindUnique.mockResolvedValue({ isPro: true } as never)
    expect(await checkItemLimit('u1')).toBe(true)
    expect(mockItemCount).not.toHaveBeenCalled()
  })

  it('returns true when free user is under item limit', async () => {
    mockUserFindUnique.mockResolvedValue({ isPro: false } as never)
    mockItemCount.mockResolvedValue(FREE_LIMITS.items - 1)
    expect(await checkItemLimit('u1')).toBe(true)
  })

  it('returns false when free user is at item limit', async () => {
    mockUserFindUnique.mockResolvedValue({ isPro: false } as never)
    mockItemCount.mockResolvedValue(FREE_LIMITS.items)
    expect(await checkItemLimit('u1')).toBe(false)
  })
})

describe('checkCollectionLimit', () => {
  it('returns true for pro user regardless of count', async () => {
    mockUserFindUnique.mockResolvedValue({ isPro: true } as never)
    expect(await checkCollectionLimit('u1')).toBe(true)
    expect(mockCollectionCount).not.toHaveBeenCalled()
  })

  it('returns true when free user is under collection limit', async () => {
    mockUserFindUnique.mockResolvedValue({ isPro: false } as never)
    mockCollectionCount.mockResolvedValue(FREE_LIMITS.collections - 1)
    expect(await checkCollectionLimit('u1')).toBe(true)
  })

  it('returns false when free user is at collection limit', async () => {
    mockUserFindUnique.mockResolvedValue({ isPro: false } as never)
    mockCollectionCount.mockResolvedValue(FREE_LIMITS.collections)
    expect(await checkCollectionLimit('u1')).toBe(false)
  })
})
