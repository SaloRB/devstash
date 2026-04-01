import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/auth', () => ({ auth: vi.fn() }))
vi.mock('@/lib/prisma', () => ({
  prisma: { user: { update: vi.fn() } },
}))

import { updateEditorPreferences } from './editor-preferences'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

const mockAuth = vi.mocked(auth)
const mockUpdate = vi.mocked(prisma.user.update)

const validPrefs = {
  fontSize: 14,
  tabSize: 2,
  wordWrap: true,
  minimap: false,
  theme: 'vs-dark' as const,
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('updateEditorPreferences', () => {
  it('returns unauthorized when no session', async () => {
    mockAuth.mockResolvedValue(null)
    const result = await updateEditorPreferences(validPrefs)
    expect(result).toEqual({ success: false, error: 'Unauthorized' })
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('saves valid preferences and returns success', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } } as never)
    mockUpdate.mockResolvedValue({} as never)

    const result = await updateEditorPreferences(validPrefs)

    expect(result).toEqual({ success: true })
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { editorPreferences: validPrefs },
    })
  })

  it('rejects invalid fontSize (below min)', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } } as never)
    const result = await updateEditorPreferences({ ...validPrefs, fontSize: 5 })
    expect(result).toEqual({ success: false, error: 'Invalid preferences' })
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('rejects invalid fontSize (above max)', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } } as never)
    const result = await updateEditorPreferences({ ...validPrefs, fontSize: 40 })
    expect(result).toEqual({ success: false, error: 'Invalid preferences' })
  })

  it('rejects invalid tabSize', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } } as never)
    const result = await updateEditorPreferences({ ...validPrefs, tabSize: 3 })
    expect(result).toEqual({ success: false, error: 'Invalid preferences' })
  })

  it('rejects invalid theme', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } } as never)
    const result = await updateEditorPreferences({
      ...validPrefs,
      theme: 'light' as never,
    })
    expect(result).toEqual({ success: false, error: 'Invalid preferences' })
  })

  it('accepts all valid tab sizes', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } } as never)
    mockUpdate.mockResolvedValue({} as never)
    for (const tabSize of [2, 4, 8]) {
      const result = await updateEditorPreferences({ ...validPrefs, tabSize })
      expect(result).toEqual({ success: true })
    }
  })

  it('accepts all valid themes', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } } as never)
    mockUpdate.mockResolvedValue({} as never)
    for (const theme of ['vs-dark', 'monokai', 'github-dark'] as const) {
      const result = await updateEditorPreferences({ ...validPrefs, theme })
      expect(result).toEqual({ success: true })
    }
  })
})
