import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('@/lib/db/collections', () => ({
  createCollection: vi.fn(),
  updateCollection: vi.fn(),
  deleteCollection: vi.fn(),
  toggleFavoriteCollection: vi.fn(),
}))

vi.mock('@/lib/gates', () => ({
  getUserProStatus: vi.fn(),
  checkCollectionLimit: vi.fn(),
}))

import { createCollection, updateCollection, deleteCollection, toggleFavoriteCollection } from './collections'
import { auth } from '@/auth'
import {
  createCollection as createCollectionDb,
  updateCollection as updateCollectionDb,
  deleteCollection as deleteCollectionDb,
  toggleFavoriteCollection as toggleFavoriteCollectionDb,
} from '@/lib/db/collections'
import { getUserProStatus, checkCollectionLimit } from '@/lib/gates'

const mockAuth = vi.mocked(auth)
const mockCreateDb = vi.mocked(createCollectionDb)
const mockUpdateDb = vi.mocked(updateCollectionDb)
const mockDeleteDb = vi.mocked(deleteCollectionDb)
const mockToggleFavoriteDb = vi.mocked(toggleFavoriteCollectionDb)
const mockGetUserProStatus = vi.mocked(getUserProStatus)
const mockCheckCollectionLimit = vi.mocked(checkCollectionLimit)

const mockCreated = { id: 'col-1', name: 'My Collection', description: 'A desc' }
const mockUpdated = { id: 'col-1', name: 'Updated Name', description: null }

describe('createCollection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } } as never)
    mockCreateDb.mockResolvedValue(mockCreated as never)
    mockGetUserProStatus.mockResolvedValue(false)
    mockCheckCollectionLimit.mockResolvedValue(true)
  })

  it('returns COLLECTION_LIMIT_REACHED when free user is at collection limit', async () => {
    mockCheckCollectionLimit.mockResolvedValue(false)

    const result = await createCollection({ name: 'My Collection', description: null })

    expect(result).toEqual({ success: false, error: 'COLLECTION_LIMIT_REACHED' })
    expect(mockCreateDb).not.toHaveBeenCalled()
  })

  it('skips collection limit for pro user', async () => {
    mockGetUserProStatus.mockResolvedValue(true)
    mockCheckCollectionLimit.mockResolvedValue(false)

    const result = await createCollection({ name: 'My Collection', description: null })

    expect(result).toEqual({ success: true, data: mockCreated })
    expect(mockCheckCollectionLimit).not.toHaveBeenCalled()
  })

  it('returns unauthorized when no session', async () => {
    mockAuth.mockResolvedValue(null as never)

    const result = await createCollection({ name: 'My Collection', description: null })

    expect(result).toEqual({ success: false, error: 'Unauthorized' })
    expect(mockCreateDb).not.toHaveBeenCalled()
  })

  it('returns validation error when name is empty', async () => {
    const result = await createCollection({ name: '', description: null })

    expect(result.success).toBe(false)
    expect(result.error).toHaveProperty('name')
    expect(mockCreateDb).not.toHaveBeenCalled()
  })

  it('returns validation error when name is only whitespace', async () => {
    const result = await createCollection({ name: '   ', description: null })

    expect(result.success).toBe(false)
    expect(result.error).toHaveProperty('name')
    expect(mockCreateDb).not.toHaveBeenCalled()
  })

  it('creates collection with name only', async () => {
    const result = await createCollection({ name: 'My Collection', description: null })

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

    const result = await createCollection({ name: 'My Collection', description: null })

    expect(result).toEqual({ success: false, error: 'Failed to create collection' })
  })
})

describe('updateCollection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } } as never)
    mockUpdateDb.mockResolvedValue(mockUpdated as never)
  })

  it('returns unauthorized when no session', async () => {
    mockAuth.mockResolvedValue(null as never)

    const result = await updateCollection({ id: 'col-1', name: 'New Name', description: null })

    expect(result).toEqual({ success: false, error: 'Unauthorized' })
    expect(mockUpdateDb).not.toHaveBeenCalled()
  })

  it('returns validation error when name is empty', async () => {
    const result = await updateCollection({ id: 'col-1', name: '', description: null })

    expect(result.success).toBe(false)
    expect(result.error).toHaveProperty('name')
    expect(mockUpdateDb).not.toHaveBeenCalled()
  })

  it('returns validation error when name is only whitespace', async () => {
    const result = await updateCollection({ id: 'col-1', name: '   ', description: null })

    expect(result.success).toBe(false)
    expect(result.error).toHaveProperty('name')
    expect(mockUpdateDb).not.toHaveBeenCalled()
  })

  it('updates with name and no description', async () => {
    const result = await updateCollection({ id: 'col-1', name: 'Updated Name', description: null })

    expect(result).toEqual({ success: true, data: mockUpdated })
    expect(mockUpdateDb).toHaveBeenCalledWith('col-1', 'user-1', {
      name: 'Updated Name',
      description: null,
    })
  })

  it('updates with name and description', async () => {
    await updateCollection({ id: 'col-1', name: 'Updated Name', description: 'New desc' })

    expect(mockUpdateDb).toHaveBeenCalledWith('col-1', 'user-1', {
      name: 'Updated Name',
      description: 'New desc',
    })
  })

  it('transforms empty description to null', async () => {
    await updateCollection({ id: 'col-1', name: 'Updated Name', description: '' })

    expect(mockUpdateDb).toHaveBeenCalledWith('col-1', 'user-1', expect.objectContaining({ description: null }))
  })

  it('returns error when DB throws', async () => {
    mockUpdateDb.mockRejectedValue(new Error('DB error'))

    const result = await updateCollection({ id: 'col-1', name: 'Updated Name', description: null })

    expect(result).toEqual({ success: false, error: 'Failed to update collection' })
  })
})

describe('deleteCollection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } } as never)
    mockDeleteDb.mockResolvedValue(undefined as never)
  })

  it('returns unauthorized when no session', async () => {
    mockAuth.mockResolvedValue(null as never)

    const result = await deleteCollection({ id: 'col-1' })

    expect(result).toEqual({ success: false, error: 'Unauthorized' })
    expect(mockDeleteDb).not.toHaveBeenCalled()
  })

  it('returns validation error when id is empty', async () => {
    const result = await deleteCollection({ id: '' })

    expect(result).toEqual({ success: false, error: 'Invalid collection id' })
    expect(mockDeleteDb).not.toHaveBeenCalled()
  })

  it('deletes collection and returns success', async () => {
    const result = await deleteCollection({ id: 'col-1' })

    expect(result).toEqual({ success: true })
    expect(mockDeleteDb).toHaveBeenCalledWith('col-1', 'user-1')
  })

  it('returns error when DB throws', async () => {
    mockDeleteDb.mockRejectedValue(new Error('DB error'))

    const result = await deleteCollection({ id: 'col-1' })

    expect(result).toEqual({ success: false, error: 'Failed to delete collection' })
  })
})

describe('toggleFavoriteCollection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } } as never)
    mockToggleFavoriteDb.mockResolvedValue({ id: 'col-1', isFavorite: true } as never)
  })

  it('returns unauthorized when no session', async () => {
    mockAuth.mockResolvedValue(null as never)

    const result = await toggleFavoriteCollection('col-1')

    expect(result).toEqual({ success: false, error: 'Unauthorized' })
    expect(mockToggleFavoriteDb).not.toHaveBeenCalled()
  })

  it('calls DB with id and userId', async () => {
    await toggleFavoriteCollection('col-1')

    expect(mockToggleFavoriteDb).toHaveBeenCalledWith('col-1', 'user-1')
  })

  it('returns updated isFavorite true on success', async () => {
    const result = await toggleFavoriteCollection('col-1')

    expect(result).toEqual({ success: true, data: { id: 'col-1', isFavorite: true } })
  })

  it('returns updated isFavorite false on success', async () => {
    mockToggleFavoriteDb.mockResolvedValue({ id: 'col-1', isFavorite: false } as never)

    const result = await toggleFavoriteCollection('col-1')

    expect(result).toEqual({ success: true, data: { id: 'col-1', isFavorite: false } })
  })

  it('returns error when DB throws', async () => {
    mockToggleFavoriteDb.mockRejectedValue(new Error('DB error'))

    const result = await toggleFavoriteCollection('col-1')

    expect(result).toEqual({ success: false, error: 'Failed to update favorite' })
  })
})
