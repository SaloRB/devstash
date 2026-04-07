import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('@/lib/gates', () => ({
  getUserProStatus: vi.fn(),
}))

vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn(),
}))

vi.mock('@/lib/openai', () => ({
  AI_MODEL: 'gpt-5-nano',
  openai: {
    responses: {
      create: vi.fn(),
    },
  },
}))

import { generateAutoTags } from './ai'
import { auth } from '@/auth'
import { getUserProStatus } from '@/lib/gates'
import { checkRateLimit } from '@/lib/rate-limit'
import { openai } from '@/lib/openai'

const mockAuth = vi.mocked(auth)
const mockGetUserProStatus = vi.mocked(getUserProStatus)
const mockCheckRateLimit = vi.mocked(checkRateLimit)
const mockResponsesCreate = vi.mocked(openai.responses.create)

beforeEach(() => {
  vi.clearAllMocks()
  mockAuth.mockResolvedValue({ user: { id: 'user-1', isPro: true } } as never)
  mockGetUserProStatus.mockResolvedValue(true)
  mockCheckRateLimit.mockResolvedValue({ allowed: true, retryAfterSecs: 0 })
})

describe('generateAutoTags', () => {
  it('returns Unauthorized when no session', async () => {
    mockAuth.mockResolvedValue(null)
    const result = await generateAutoTags({ title: 'Test' })
    expect(result).toEqual({ success: false, error: 'Unauthorized' })
  })

  it('returns PRO_REQUIRED for free users', async () => {
    mockGetUserProStatus.mockResolvedValue(false)
    const result = await generateAutoTags({ title: 'Test' })
    expect(result).toEqual({ success: false, error: 'PRO_REQUIRED' })
  })

  it('returns RATE_LIMITED when rate limit exceeded', async () => {
    mockCheckRateLimit.mockResolvedValue({ allowed: false, retryAfterSecs: 3600 })
    const result = await generateAutoTags({ title: 'Test' })
    expect(result).toEqual({ success: false, error: 'RATE_LIMITED' })
  })

  it('returns Invalid input for empty title', async () => {
    const result = await generateAutoTags({ title: '' })
    expect(result).toEqual({ success: false, error: 'Invalid input' })
  })

  it('returns tags from {"tags": [...]} response format', async () => {
    mockResponsesCreate.mockResolvedValue({
      output_text: JSON.stringify({ tags: ['react', 'typescript', 'hooks'] }),
    } as never)
    const result = await generateAutoTags({ title: 'React Hooks Guide' })
    expect(result).toEqual({ success: true, data: ['react', 'typescript', 'hooks'] })
  })

  it('returns tags from array response format', async () => {
    mockResponsesCreate.mockResolvedValue({
      output_text: JSON.stringify(['react', 'typescript', 'hooks']),
    } as never)
    const result = await generateAutoTags({ title: 'React Hooks Guide' })
    expect(result).toEqual({ success: true, data: ['react', 'typescript', 'hooks'] })
  })

  it('normalizes tags to lowercase', async () => {
    mockResponsesCreate.mockResolvedValue({
      output_text: JSON.stringify({ tags: ['React', 'TypeScript', 'HOOKS'] }),
    } as never)
    const result = await generateAutoTags({ title: 'Test' })
    expect(result).toEqual({ success: true, data: ['react', 'typescript', 'hooks'] })
  })

  it('filters out non-string tags', async () => {
    mockResponsesCreate.mockResolvedValue({
      output_text: JSON.stringify({ tags: ['react', 42, null, 'typescript'] }),
    } as never)
    const result = await generateAutoTags({ title: 'Test' })
    expect(result).toEqual({ success: true, data: ['react', 'typescript'] })
  })

  it('truncates content to 2000 chars before sending', async () => {
    mockResponsesCreate.mockResolvedValue({
      output_text: JSON.stringify({ tags: ['tag'] }),
    } as never)
    const longContent = 'a'.repeat(5000)
    await generateAutoTags({ title: 'Test', content: longContent })
    const callArg = mockResponsesCreate.mock.calls[0][0] as { input: string }
    expect(callArg.input).toContain('a'.repeat(2000))
    expect(callArg.input).not.toContain('a'.repeat(2001))
  })

  it('returns AI_ERROR on OpenAI failure', async () => {
    mockResponsesCreate.mockRejectedValue(new Error('Network error'))
    const result = await generateAutoTags({ title: 'Test' })
    expect(result).toEqual({ success: false, error: 'AI_ERROR' })
  })

  it('works without content', async () => {
    mockResponsesCreate.mockResolvedValue({
      output_text: JSON.stringify({ tags: ['cli', 'bash'] }),
    } as never)
    const result = await generateAutoTags({ title: 'Shell alias', content: null })
    expect(result).toEqual({ success: true, data: ['cli', 'bash'] })
  })
})
