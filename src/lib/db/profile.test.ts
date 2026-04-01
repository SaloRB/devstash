import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: { user: { findUnique: vi.fn() } },
}))

import { getEditorPreferences } from './profile'
import { prisma } from '@/lib/prisma'
import { DEFAULT_EDITOR_PREFS } from '@/constants'

const mockFindUnique = vi.mocked(prisma.user.findUnique)

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getEditorPreferences', () => {
  it('returns defaults when user not found', async () => {
    mockFindUnique.mockResolvedValue(null)
    const result = await getEditorPreferences('user-1')
    expect(result).toEqual(DEFAULT_EDITOR_PREFS)
  })

  it('returns defaults when editorPreferences is null', async () => {
    mockFindUnique.mockResolvedValue({ editorPreferences: null } as never)
    const result = await getEditorPreferences('user-1')
    expect(result).toEqual(DEFAULT_EDITOR_PREFS)
  })

  it('returns defaults when editorPreferences is an array', async () => {
    mockFindUnique.mockResolvedValue({ editorPreferences: [] } as never)
    const result = await getEditorPreferences('user-1')
    expect(result).toEqual(DEFAULT_EDITOR_PREFS)
  })

  it('merges stored prefs over defaults', async () => {
    mockFindUnique.mockResolvedValue({
      editorPreferences: { fontSize: 18, theme: 'monokai' },
    } as never)
    const result = await getEditorPreferences('user-1')
    expect(result).toEqual({
      ...DEFAULT_EDITOR_PREFS,
      fontSize: 18,
      theme: 'monokai',
    })
  })

  it('returns fully stored prefs when all fields present', async () => {
    const stored = {
      fontSize: 16,
      tabSize: 4,
      wordWrap: false,
      minimap: true,
      theme: 'github-dark',
    }
    mockFindUnique.mockResolvedValue({ editorPreferences: stored } as never)
    const result = await getEditorPreferences('user-1')
    expect(result).toEqual(stored)
  })
})
