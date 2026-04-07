'use server'

import { z } from 'zod'
import OpenAI from 'openai'
import { auth } from '@/auth'
import { getUserProStatus } from '@/lib/gates'
import { openai, AI_MODEL } from '@/lib/openai'
import { checkRateLimit } from '@/lib/rate-limit'

const generateAutoTagsSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  content: z.string().nullable().optional(),
})

export async function generateAutoTags(data: {
  title: string
  content?: string | null
}) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false as const, error: 'Unauthorized' }
  }

  const parsed = generateAutoTagsSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false as const, error: 'Invalid input' }
  }

  const isPro = await getUserProStatus(session.user.id)
  if (!isPro) {
    return { success: false as const, error: 'PRO_REQUIRED' }
  }

  const { allowed } = await checkRateLimit(`ai:${session.user.id}`, 20, '1 h')
  if (!allowed) {
    return { success: false as const, error: 'RATE_LIMITED' }
  }

  const { title, content } = parsed.data
  const truncated = content ? content.slice(0, 2000) : ''

  try {
    const response = await openai.responses.create({
      model: AI_MODEL,
      instructions:
        'You are a developer tool assistant that suggests concise, relevant tags for code snippets, prompts, commands, notes, and links. Tags should be lowercase technical terms.',
      input: `Suggest 3-5 relevant tags for this item.\nTitle: ${title}${truncated ? `\nContent: ${truncated}` : ''}\nRespond with JSON: {"tags": ["tag1", "tag2", "tag3"]}`,
      text: {
        format: { type: 'json_object' },
      },
    })

    const raw = response.output_text
    const parsed2 = JSON.parse(raw)

    let tags: string[] = []
    if (Array.isArray(parsed2)) {
      tags = parsed2
    } else if (Array.isArray(parsed2.tags)) {
      tags = parsed2.tags
    }

    tags = tags
      .filter((t) => typeof t === 'string' && t.length > 0)
      .map((t) => t.toLowerCase().trim())

    return { success: true as const, data: tags }
  } catch (err) {
    if (err instanceof OpenAI.RateLimitError) {
      return { success: false as const, error: 'RATE_LIMITED' }
    }
    if (err instanceof OpenAI.AuthenticationError) {
      console.error('OpenAI auth error — check OPENAI_API_KEY')
      return { success: false as const, error: 'AI_ERROR' }
    }
    if (err instanceof OpenAI.BadRequestError) {
      return { success: false as const, error: 'AI_ERROR' }
    }
    return { success: false as const, error: 'AI_ERROR' }
  }
}
