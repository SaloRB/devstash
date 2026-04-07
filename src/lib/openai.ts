import OpenAI from 'openai'

export const AI_MODEL = 'gpt-5-nano'

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  maxRetries: 2,
})

export function handleOpenAIError(err: unknown): { success: false; error: 'RATE_LIMITED' | 'AI_ERROR' } {
  if (err instanceof OpenAI.RateLimitError) {
    return { success: false, error: 'RATE_LIMITED' }
  }
  if (err instanceof OpenAI.AuthenticationError) {
    console.error('OpenAI auth error — check OPENAI_API_KEY')
    return { success: false, error: 'AI_ERROR' }
  }
  return { success: false, error: 'AI_ERROR' }
}
