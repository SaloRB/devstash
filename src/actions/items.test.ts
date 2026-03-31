import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('@/lib/db/items', () => ({
  createItem: vi.fn(),
  updateItem: vi.fn(),
  deleteItem: vi.fn(),
}))

vi.mock('@/lib/r2', () => ({
  r2: { send: vi.fn() },
  R2_BUCKET: 'test-bucket',
  keyFromUrl: vi.fn((url: string) => url.replace('https://pub-test.r2.dev/', '')),
}))

vi.mock('@aws-sdk/client-s3', () => ({
  DeleteObjectCommand: class DeleteObjectCommand {
    constructor(public params: unknown) {}
  },
}))

import { createItem, updateItem, deleteItem } from './items'
import { auth } from '@/auth'
import {
  createItem as createItemDb,
  updateItem as updateItemDb,
  deleteItem as deleteItemDb,
} from '@/lib/db/items'
import { r2 } from '@/lib/r2'

const mockAuth = vi.mocked(auth)
const mockCreateDb = vi.mocked(createItemDb)
const mockUpdateDb = vi.mocked(updateItemDb)
const mockDeleteDb = vi.mocked(deleteItemDb)
const mockR2Send = vi.mocked(r2.send)

const validInput = {
  title: 'Updated Title',
  description: 'A description',
  content: 'console.log("hi")',
  url: null,
  language: 'javascript',
  tags: ['react', 'hooks'],
  collectionIds: [] as string[],
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

  it('passes collectionIds to DB when provided', async () => {
    await updateItem('item-1', { ...validInput, collectionIds: ['col-1', 'col-2'] })

    expect(mockUpdateDb).toHaveBeenCalledWith(
      'item-1',
      'user-1',
      expect.objectContaining({ collectionIds: ['col-1', 'col-2'] })
    )
  })

  it('defaults collectionIds to empty array when omitted', async () => {
    await updateItem('item-1', validInput)

    expect(mockUpdateDb).toHaveBeenCalledWith(
      'item-1',
      'user-1',
      expect.objectContaining({ collectionIds: [] })
    )
  })
})

const validCreateInput = {
  itemTypeId: 'type-1',
  title: 'New Snippet',
  description: 'A description',
  content: 'console.log("hi")',
  url: null,
  language: 'javascript',
  tags: ['react', 'hooks'],
  fileUrl: null,
  fileName: null,
  fileSize: null,
  collectionIds: [] as string[],
}

const mockCreatedItem = {
  id: 'item-new',
  title: 'New Snippet',
  description: 'A description',
  content: 'console.log("hi")',
  url: null,
  language: 'javascript',
  tags: [{ id: 't1', name: 'react' }, { id: 't2', name: 'hooks' }],
  itemType: { id: 'type-1', name: 'Snippet', icon: 'Code', color: '#3b82f6', isSystem: true, userId: null },
  collections: [],
}

describe('createItem', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } } as never)
    mockCreateDb.mockResolvedValue(mockCreatedItem as never)
  })

  it('returns unauthorized when no session', async () => {
    mockAuth.mockResolvedValue(null as never)

    const result = await createItem(validCreateInput)

    expect(result).toEqual({ success: false, error: 'Unauthorized' })
    expect(mockCreateDb).not.toHaveBeenCalled()
  })

  it('returns validation error when title is empty', async () => {
    const result = await createItem({ ...validCreateInput, title: '' })

    expect(result.success).toBe(false)
    expect(result.error).toHaveProperty('title')
    expect(mockCreateDb).not.toHaveBeenCalled()
  })

  it('returns validation error when itemTypeId is empty', async () => {
    const result = await createItem({ ...validCreateInput, itemTypeId: '' })

    expect(result.success).toBe(false)
    expect(result.error).toHaveProperty('itemTypeId')
    expect(mockCreateDb).not.toHaveBeenCalled()
  })

  it('returns validation error for invalid URL', async () => {
    const result = await createItem({
      ...validCreateInput,
      url: 'not-a-url',
    })

    expect(result.success).toBe(false)
    expect(mockCreateDb).not.toHaveBeenCalled()
  })

  it('filters out empty tags', async () => {
    await createItem({
      ...validCreateInput,
      tags: ['react', '', '  ', 'hooks'],
    })

    expect(mockCreateDb).toHaveBeenCalledWith(
      'user-1',
      'type-1',
      expect.objectContaining({ tags: ['react', 'hooks'] })
    )
  })

  it('transforms empty description to null', async () => {
    await createItem({ ...validCreateInput, description: '' })

    expect(mockCreateDb).toHaveBeenCalledWith(
      'user-1',
      'type-1',
      expect.objectContaining({ description: null })
    )
  })

  it('returns created item on success', async () => {
    const result = await createItem(validCreateInput)

    expect(result).toEqual({ success: true, data: mockCreatedItem })
    expect(mockCreateDb).toHaveBeenCalledWith(
      'user-1',
      'type-1',
      expect.objectContaining({
        title: 'New Snippet',
        tags: ['react', 'hooks'],
      })
    )
  })

  it('returns error when DB throws', async () => {
    mockCreateDb.mockRejectedValue(new Error('DB error'))

    const result = await createItem(validCreateInput)

    expect(result).toEqual({ success: false, error: 'Failed to create item' })
  })

  it('passes file fields to DB when provided', async () => {
    await createItem({
      ...validCreateInput,
      fileUrl: 'https://pub-test.r2.dev/user-1/abc.pdf',
      fileName: 'abc.pdf',
      fileSize: 12345,
    })

    expect(mockCreateDb).toHaveBeenCalledWith(
      'user-1',
      'type-1',
      expect.objectContaining({
        fileUrl: 'https://pub-test.r2.dev/user-1/abc.pdf',
        fileName: 'abc.pdf',
        fileSize: 12345,
      })
    )
  })

  it('passes null file fields when not a file item', async () => {
    await createItem(validCreateInput)

    expect(mockCreateDb).toHaveBeenCalledWith(
      'user-1',
      'type-1',
      expect.objectContaining({ fileUrl: null, fileName: null })
    )
  })

  it('passes collectionIds to DB when provided', async () => {
    await createItem({ ...validCreateInput, collectionIds: ['col-1', 'col-2'] })

    expect(mockCreateDb).toHaveBeenCalledWith(
      'user-1',
      'type-1',
      expect.objectContaining({ collectionIds: ['col-1', 'col-2'] })
    )
  })

  it('defaults collectionIds to empty array when omitted', async () => {
    await createItem(validCreateInput)

    expect(mockCreateDb).toHaveBeenCalledWith(
      'user-1',
      'type-1',
      expect.objectContaining({ collectionIds: [] })
    )
  })
})

describe('deleteItem', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } } as never)
    mockDeleteDb.mockResolvedValue({ id: 'item-1', fileUrl: null } as never)
    mockR2Send.mockResolvedValue({} as never)
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

  it('deletes item without file and returns success', async () => {
    const result = await deleteItem('item-1')

    expect(result).toEqual({ success: true })
    expect(mockDeleteDb).toHaveBeenCalledWith('item-1', 'user-1')
    expect(mockR2Send).not.toHaveBeenCalled()
  })

  it('deletes R2 file when item has fileUrl', async () => {
    mockDeleteDb.mockResolvedValue({
      id: 'item-1',
      fileUrl: 'https://pub-test.r2.dev/user-1/abc.pdf',
    } as never)

    const result = await deleteItem('item-1')

    expect(result).toEqual({ success: true })
    expect(mockR2Send).toHaveBeenCalledTimes(1)
  })

  it('returns success even when R2 delete fails', async () => {
    mockDeleteDb.mockResolvedValue({
      id: 'item-1',
      fileUrl: 'https://pub-test.r2.dev/user-1/abc.pdf',
    } as never)
    mockR2Send.mockRejectedValue(new Error('R2 error'))

    const result = await deleteItem('item-1')

    expect(result).toEqual({ success: true })
  })

  it('returns error when DB throws', async () => {
    mockDeleteDb.mockRejectedValue(new Error('DB error'))

    const result = await deleteItem('item-1')

    expect(result).toEqual({ success: false, error: 'Failed to delete item' })
  })
})
