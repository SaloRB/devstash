import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('@/lib/db/collections', () => ({
  createCollection: vi.fn(),
}))

import { createCollection } from './collections'
import { auth } from '@/auth'
import { createCollection as createCollectionDb } from '@/lib/db/collections'

const mockAuth = vi.mocked(auth)
const mockCreateDb = vi.mocked(createCollectionDb)

const mockCreated = { id: 'col-1', name: 'My Collection', description: 'A desc' }

describe('createCollection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } } as never)
    mockCreateDb.mockResolvedValue(mockCreated as never)
  })

  it('returns unauthorized when no session', async () => {
    mockAuth.mockResolvedValue(null as never)

    const result = await createCollection({ name: 'My Collection' })

    expect(result).toEqual({ success: false, error: 'Unauthorized' })
    expect(mockCreateDb).not.toHaveBeenCalled()
  })

  it('returns validation error when name is empty', async () => {
    const result = await createCollection({ name: '' })

    expect(result.success).toBe(false)
    expect(result.error).toHaveProperty('name')
    expect(mockCreateDb).not.toHaveBeenCalled()
  })

  it('returns validation error when name is only whitespace', async () => {
    const result = await createCollection({ name: '   ' })

    expect(result.success).toBe(false)
    expect(result.error).toHaveProperty('name')
    expect(mockCreateDb).not.toHaveBeenCalled()
  })

  it('creates collection with name only', async () => {
    const result = await createCollection({ name: 'My Collection' })

    expect(result).toEqual({ success: true, data: mockCreated })
    expect(mockCreateDb).toHaveBeenCalledWith('user-1', {
      name: 'My Collection',
      description: null,
    })
  })

  it('creates collection with name and description', async () => {
    const result = await createCollection({ name: 'My Collection', description: 'A desc' })

    expect(result).toEqual({ success: true, data: mockCreated })
    expect(mockCreateDb).toHaveBeenCalledWith('user-1', {
      name: 'My Collection',
      description: 'A desc',
    })
  })

  it('transforms empty description to null', async () => {
    await createCollection({ name: 'My Collection', description: '' })

    expect(mockCreateDb).toHaveBeenCalledWith('user-1', expect.objectContaining({ description: null }))
  })

  it('returns error when DB throws', async () => {
    mockCreateDb.mockRejectedValue(new Error('DB error'))

    const result = await createCollection({ name: 'My Collection' })

    expect(result).toEqual({ success: false, error: 'Failed to create collection' })
  })
})
