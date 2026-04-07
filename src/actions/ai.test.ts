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

import { generateAutoTags, generateDescription, explainCode, optimizePrompt } from './ai'
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
    mockAuth.mockResolvedValue(null as never)
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

describe('generateDescription', () => {
  it('returns Unauthorized when no session', async () => {
    mockAuth.mockResolvedValue(null as never)
    const result = await generateDescription({ title: 'Test', typeName: 'snippet' })
    expect(result).toEqual({ success: false, error: 'Unauthorized' })
  })

  it('returns PRO_REQUIRED for free users', async () => {
    mockGetUserProStatus.mockResolvedValue(false)
    const result = await generateDescription({ title: 'Test', typeName: 'snippet' })
    expect(result).toEqual({ success: false, error: 'PRO_REQUIRED' })
  })

  it('returns RATE_LIMITED when rate limit exceeded', async () => {
    mockCheckRateLimit.mockResolvedValue({ allowed: false, retryAfterSecs: 3600 })
    const result = await generateDescription({ title: 'Test', typeName: 'snippet' })
    expect(result).toEqual({ success: false, error: 'RATE_LIMITED' })
  })

  it('returns Invalid input for empty title', async () => {
    const result = await generateDescription({ title: '', typeName: 'snippet' })
    expect(result).toEqual({ success: false, error: 'Invalid input' })
  })

  it('returns Invalid input for empty typeName', async () => {
    const result = await generateDescription({ title: 'Test', typeName: '' })
    expect(result).toEqual({ success: false, error: 'Invalid input' })
  })

  it('returns generated description on success', async () => {
    mockResponsesCreate.mockResolvedValue({
      output_text: 'A React hook for managing async state with loading and error handling.',
    } as never)
    const result = await generateDescription({ title: 'useAsync hook', typeName: 'snippet' })
    expect(result).toEqual({
      success: true,
      data: 'A React hook for managing async state with loading and error handling.',
    })
  })

  it('trims whitespace from generated description', async () => {
    mockResponsesCreate.mockResolvedValue({
      output_text: '  A handy bash alias for git status.  ',
    } as never)
    const result = await generateDescription({ title: 'gs alias', typeName: 'command' })
    expect(result).toEqual({ success: true, data: 'A handy bash alias for git status.' })
  })

  it('returns AI_ERROR when output_text is empty', async () => {
    mockResponsesCreate.mockResolvedValue({ output_text: '   ' } as never)
    const result = await generateDescription({ title: 'Test', typeName: 'note' })
    expect(result).toEqual({ success: false, error: 'AI_ERROR' })
  })

  it('returns AI_ERROR on OpenAI failure', async () => {
    mockResponsesCreate.mockRejectedValue(new Error('Network error'))
    const result = await generateDescription({ title: 'Test', typeName: 'link' })
    expect(result).toEqual({ success: false, error: 'AI_ERROR' })
  })

  it('includes url in context when provided', async () => {
    mockResponsesCreate.mockResolvedValue({ output_text: 'A link to the React docs.' } as never)
    await generateDescription({ title: 'React Docs', typeName: 'link', url: 'https://react.dev' })
    const callArg = mockResponsesCreate.mock.calls[0][0] as { input: string }
    expect(callArg.input).toContain('URL: https://react.dev')
  })

  it('includes tags in context when provided', async () => {
    mockResponsesCreate.mockResolvedValue({ output_text: 'A snippet.' } as never)
    await generateDescription({ title: 'Hook', typeName: 'snippet', tags: 'react, hooks' })
    const callArg = mockResponsesCreate.mock.calls[0][0] as { input: string }
    expect(callArg.input).toContain('Tags: react, hooks')
  })

  it('truncates content to 2000 chars before sending', async () => {
    mockResponsesCreate.mockResolvedValue({ output_text: 'A snippet.' } as never)
    const longContent = 'x'.repeat(5000)
    await generateDescription({ title: 'Test', typeName: 'snippet', content: longContent })
    const callArg = mockResponsesCreate.mock.calls[0][0] as { input: string }
    expect(callArg.input).toContain('x'.repeat(2000))
    expect(callArg.input).not.toContain('x'.repeat(2001))
  })

  it('works without optional fields', async () => {
    mockResponsesCreate.mockResolvedValue({ output_text: 'A quick note.' } as never)
    const result = await generateDescription({ title: 'My Note', typeName: 'note' })
    expect(result).toEqual({ success: true, data: 'A quick note.' })
  })
})

describe('explainCode', () => {
  it('returns Unauthorized when no session', async () => {
    mockAuth.mockResolvedValue(null as never)
    const result = await explainCode({ content: 'const x = 1', typeName: 'snippet' })
    expect(result).toEqual({ success: false, error: 'Unauthorized' })
  })

  it('returns PRO_REQUIRED for free users', async () => {
    mockGetUserProStatus.mockResolvedValue(false)
    const result = await explainCode({ content: 'const x = 1', typeName: 'snippet' })
    expect(result).toEqual({ success: false, error: 'PRO_REQUIRED' })
  })

  it('returns RATE_LIMITED when rate limit exceeded', async () => {
    mockCheckRateLimit.mockResolvedValue({ allowed: false, retryAfterSecs: 3600 })
    const result = await explainCode({ content: 'const x = 1', typeName: 'snippet' })
    expect(result).toEqual({ success: false, error: 'RATE_LIMITED' })
  })

  it('returns Invalid input for empty content', async () => {
    const result = await explainCode({ content: '   ', typeName: 'snippet' })
    expect(result).toEqual({ success: false, error: 'Invalid input' })
  })

  it('returns Invalid input for empty typeName', async () => {
    const result = await explainCode({ content: 'const x = 1', typeName: '' })
    expect(result).toEqual({ success: false, error: 'Invalid input' })
  })

  it('returns explanation on success', async () => {
    mockResponsesCreate.mockResolvedValue({
      output_text: 'This snippet declares a constant variable `x` with value 1.',
    } as never)
    const result = await explainCode({ content: 'const x = 1', typeName: 'snippet' })
    expect(result).toEqual({
      success: true,
      data: 'This snippet declares a constant variable `x` with value 1.',
    })
  })

  it('trims whitespace from explanation', async () => {
    mockResponsesCreate.mockResolvedValue({ output_text: '  An explanation.  ' } as never)
    const result = await explainCode({ content: 'ls -la', typeName: 'command' })
    expect(result).toEqual({ success: true, data: 'An explanation.' })
  })

  it('returns AI_ERROR when output_text is empty', async () => {
    mockResponsesCreate.mockResolvedValue({ output_text: '   ' } as never)
    const result = await explainCode({ content: 'const x = 1', typeName: 'snippet' })
    expect(result).toEqual({ success: false, error: 'AI_ERROR' })
  })

  it('truncates content to 3000 chars before sending', async () => {
    mockResponsesCreate.mockResolvedValue({ output_text: 'Explanation.' } as never)
    const longContent = 'a'.repeat(5000)
    await explainCode({ content: longContent, typeName: 'snippet' })
    const callArg = mockResponsesCreate.mock.calls[0][0] as { input: string }
    expect(callArg.input).toContain('a'.repeat(3000))
    expect(callArg.input).not.toContain('a'.repeat(3001))
  })

  it('includes language in context when provided', async () => {
    mockResponsesCreate.mockResolvedValue({ output_text: 'Explanation.' } as never)
    await explainCode({ content: 'const x = 1', typeName: 'snippet', language: 'typescript' })
    const callArg = mockResponsesCreate.mock.calls[0][0] as { input: string }
    expect(callArg.input).toContain('Language: typescript')
  })

  it('returns AI_ERROR on OpenAI failure', async () => {
    mockResponsesCreate.mockRejectedValue(new Error('Network error'))
    const result = await explainCode({ content: 'const x = 1', typeName: 'snippet' })
    expect(result).toEqual({ success: false, error: 'AI_ERROR' })
  })
})

describe('optimizePrompt', () => {
  it('returns Unauthorized when no session', async () => {
    mockAuth.mockResolvedValue(null as never)
    const result = await optimizePrompt({ content: 'Write me a story.' })
    expect(result).toEqual({ success: false, error: 'Unauthorized' })
  })

  it('returns PRO_REQUIRED for free users', async () => {
    mockGetUserProStatus.mockResolvedValue(false)
    const result = await optimizePrompt({ content: 'Write me a story.' })
    expect(result).toEqual({ success: false, error: 'PRO_REQUIRED' })
  })

  it('returns RATE_LIMITED when rate limit exceeded', async () => {
    mockCheckRateLimit.mockResolvedValue({ allowed: false, retryAfterSecs: 3600 })
    const result = await optimizePrompt({ content: 'Write me a story.' })
    expect(result).toEqual({ success: false, error: 'RATE_LIMITED' })
  })

  it('returns Invalid input for empty content', async () => {
    const result = await optimizePrompt({ content: '   ' })
    expect(result).toEqual({ success: false, error: 'Invalid input' })
  })

  it('returns optimized prompt on success', async () => {
    mockResponsesCreate.mockResolvedValue({
      output_text: 'Write a 500-word short story set in a post-apocalyptic world.',
    } as never)
    const result = await optimizePrompt({ content: 'Write me a story.' })
    expect(result).toEqual({
      success: true,
      data: 'Write a 500-word short story set in a post-apocalyptic world.',
    })
  })

  it('trims whitespace from optimized output', async () => {
    mockResponsesCreate.mockResolvedValue({ output_text: '  Optimized prompt.  ' } as never)
    const result = await optimizePrompt({ content: 'My prompt' })
    expect(result).toEqual({ success: true, data: 'Optimized prompt.' })
  })

  it('returns AI_ERROR when output_text is empty', async () => {
    mockResponsesCreate.mockResolvedValue({ output_text: '   ' } as never)
    const result = await optimizePrompt({ content: 'My prompt' })
    expect(result).toEqual({ success: false, error: 'AI_ERROR' })
  })

  it('truncates content to 3000 chars before sending', async () => {
    mockResponsesCreate.mockResolvedValue({ output_text: 'Optimized.' } as never)
    const longContent = 'a'.repeat(5000)
    await optimizePrompt({ content: longContent })
    const callArg = mockResponsesCreate.mock.calls[0][0] as { input: string }
    expect(callArg.input).toContain('a'.repeat(3000))
    expect(callArg.input).not.toContain('a'.repeat(3001))
  })

  it('returns AI_ERROR on OpenAI failure', async () => {
    mockResponsesCreate.mockRejectedValue(new Error('Network error'))
    const result = await optimizePrompt({ content: 'My prompt' })
    expect(result).toEqual({ success: false, error: 'AI_ERROR' })
  })
})
