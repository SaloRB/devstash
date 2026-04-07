'use server'

import { z } from 'zod'
import OpenAI from 'openai'
import { auth } from '@/auth'
import { getUserProStatus } from '@/lib/gates'
import { openai, AI_MODEL } from '@/lib/openai'
import { checkRateLimit } from '@/lib/rate-limit'

const generateDescriptionSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  typeName: z.string().trim().min(1),
  content: z.string().nullable().optional(),
  url: z.string().nullable().optional(),
  tags: z.string().nullable().optional(),
})

export async function generateDescription(data: {
  title: string
  typeName: string
  content?: string | null
  url?: string | null
  tags?: string | null
}) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false as const, error: 'Unauthorized' }
  }

  const parsed = generateDescriptionSchema.safeParse(data)
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

  const { title, typeName, content, url, tags } = parsed.data
  const truncated = content ? content.slice(0, 2000) : ''

  const contextParts = [`Title: ${title}`, `Type: ${typeName}`]
  if (url) contextParts.push(`URL: ${url}`)
  if (tags) contextParts.push(`Tags: ${tags}`)
  if (truncated) contextParts.push(`Content:\n${truncated}`)

  try {
    const response = await openai.responses.create({
      model: AI_MODEL,
      instructions:
        'You are a developer tool assistant. Write a concise 1-2 sentence description/summary for a developer knowledge item. Be specific and informative. Return only the description text — no quotes, no JSON, no extra formatting.',
      input: contextParts.join('\n'),
    })

    const description = response.output_text.trim()
    if (!description) {
      return { success: false as const, error: 'AI_ERROR' }
    }

    return { success: true as const, data: description }
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

const explainCodeSchema = z.object({
  content: z.string().trim().min(1, 'Content is required'),
  language: z.string().nullable().optional(),
  typeName: z.string().trim().min(1),
})

export async function explainCode(data: {
  content: string
  language?: string | null
  typeName: string
}) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false as const, error: 'Unauthorized' }
  }

  const parsed = explainCodeSchema.safeParse(data)
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

  const { content, language, typeName } = parsed.data
  const truncated = content.slice(0, 3000)

  const contextParts = [`Type: ${typeName}`]
  if (language) contextParts.push(`Language: ${language}`)
  contextParts.push(`Code:\n${truncated}`)

  try {
    const response = await openai.responses.create({
      model: AI_MODEL,
      instructions:
        'You are a developer tool assistant. Explain the following code concisely for a developer audience. Cover what it does and any key concepts or patterns used. Target 200-300 words. Use markdown formatting with clear sections where helpful. Return only the explanation — no preamble.',
      input: contextParts.join('\n'),
    })

    const explanation = response.output_text.trim()
    if (!explanation) {
      return { success: false as const, error: 'AI_ERROR' }
    }

    return { success: true as const, data: explanation }
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

const optimizePromptSchema = z.object({
  content: z.string().trim().min(1, 'Content is required'),
})

export async function optimizePrompt(data: { content: string }) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false as const, error: 'Unauthorized' }
  }

  const parsed = optimizePromptSchema.safeParse(data)
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

  const truncated = parsed.data.content.slice(0, 3000)

  try {
    const response = await openai.responses.create({
      model: AI_MODEL,
      instructions:
        'You are an expert prompt engineer. Optimize the given AI prompt to be clearer, more specific, and more effective. Improve structure, add context where needed, and remove ambiguity. Return only the optimized prompt text — no explanations, no preamble, no quotes.',
      input: truncated,
    })

    const optimized = response.output_text.trim()
    if (!optimized) {
      return { success: false as const, error: 'AI_ERROR' }
    }

    return { success: true as const, data: optimized }
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
