import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('@/lib/db/items', () => ({
  updateItem: vi.fn(),
  deleteItem: vi.fn(),
}))

import { updateItem, deleteItem } from './items'
import { auth } from '@/auth'
import { updateItem as updateItemDb, deleteItem as deleteItemDb } from '@/lib/db/items'

const mockAuth = vi.mocked(auth)
const mockUpdateDb = vi.mocked(updateItemDb)
const mockDeleteDb = vi.mocked(deleteItemDb)

const validInput = {
  title: 'Updated Title',
  description: 'A description',
  content: 'console.log("hi")',
  url: null,
  language: 'javascript',
  tags: ['react', 'hooks'],
}

const mockUpdatedItem = {
  id: 'item-1',
  title: 'Updated Title',
  description: 'A description',
  content: 'console.log("hi")',
  url: null,
  language: 'javascript',
  tags: [{ id: 't1', name: 'react' }, { id: 't2', name: 'hooks' }],
  itemType: { id: 1, name: 'Snippet', icon: 'Code', color: '#3b82f6', isSystem: true, userId: null },
  collections: [],
}

describe('updateItem', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } } as never)
    mockUpdateDb.mockResolvedValue(mockUpdatedItem as never)
  })

  it('returns unauthorized when no session', async () => {
    mockAuth.mockResolvedValue(null as never)

    const result = await updateItem('item-1', validInput)

    expect(result).toEqual({ success: false, error: 'Unauthorized' })
    expect(mockUpdateDb).not.toHaveBeenCalled()
  })

  it('returns validation error when title is empty', async () => {
    const result = await updateItem('item-1', { ...validInput, title: '' })

    expect(result.success).toBe(false)
    expect(result.error).toHaveProperty('title')
    expect(mockUpdateDb).not.toHaveBeenCalled()
  })

  it('returns validation error when title is only whitespace', async () => {
    const result = await updateItem('item-1', { ...validInput, title: '   ' })

    expect(result.success).toBe(false)
    expect(result.error).toHaveProperty('title')
  })

  it('returns validation error for invalid URL', async () => {
    const result = await updateItem('item-1', {
      ...validInput,
      url: 'not-a-url',
    })

    expect(result.success).toBe(false)
    expect(mockUpdateDb).not.toHaveBeenCalled()
  })

  it('accepts valid URL', async () => {
    const result = await updateItem('item-1', {
      ...validInput,
      url: 'https://example.com',
    })

    expect(result.success).toBe(true)
  })

  it('accepts null URL', async () => {
    const result = await updateItem('item-1', {
      ...validInput,
      url: null,
    })

    expect(result.success).toBe(true)
  })

  it('filters out empty tags', async () => {
    await updateItem('item-1', {
      ...validInput,
      tags: ['react', '', '  ', 'hooks'],
    })

    expect(mockUpdateDb).toHaveBeenCalledWith(
      'item-1',
      'user-1',
      expect.objectContaining({ tags: ['react', 'hooks'] })
    )
  })

  it('transforms empty description to null', async () => {
    await updateItem('item-1', { ...validInput, description: '' })

    expect(mockUpdateDb).toHaveBeenCalledWith(
      'item-1',
      'user-1',
      expect.objectContaining({ description: null })
    )
  })

  it('returns updated item on success', async () => {
    const result = await updateItem('item-1', validInput)

    expect(result).toEqual({ success: true, data: mockUpdatedItem })
    expect(mockUpdateDb).toHaveBeenCalledWith(
      'item-1',
      'user-1',
      expect.objectContaining({
        title: 'Updated Title',
        tags: ['react', 'hooks'],
      })
    )
  })

  it('returns error when DB throws', async () => {
    mockUpdateDb.mockRejectedValue(new Error('DB error'))

    const result = await updateItem('item-1', validInput)

    expect(result).toEqual({ success: false, error: 'Failed to update item' })
  })
})

describe('deleteItem', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } } as never)
    mockDeleteDb.mockResolvedValue({} as never)
  })

  it('returns unauthorized when no session', async () => {
    mockAuth.mockResolvedValue(null as never)

    const result = await deleteItem('item-1')

    expect(result).toEqual({ success: false, error: 'Unauthorized' })
    expect(mockDeleteDb).not.toHaveBeenCalled()
  })

  it('returns error for empty item ID', async () => {
    const result = await deleteItem('')

    expect(result).toEqual({ success: false, error: 'Invalid item ID' })
    expect(mockDeleteDb).not.toHaveBeenCalled()
  })

  it('deletes item and returns success', async () => {
    const result = await deleteItem('item-1')

    expect(result).toEqual({ success: true })
    expect(mockDeleteDb).toHaveBeenCalledWith('item-1', 'user-1')
  })

  it('returns error when DB throws', async () => {
    mockDeleteDb.mockRejectedValue(new Error('DB error'))

    const result = await deleteItem('item-1')

    expect(result).toEqual({ success: false, error: 'Failed to delete item' })
  })
})
