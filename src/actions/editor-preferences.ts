'use server'

import { z } from 'zod'
import { requireAuth } from '@/lib/auth-guard'
import { prisma } from '@/lib/prisma'

const schema = z.object({
  fontSize: z.number().int().min(10).max(32),
  tabSize: z.number().int().refine((v) => [2, 4, 8].includes(v)),
  wordWrap: z.boolean(),
  minimap: z.boolean(),
  theme: z.enum(['vs-dark', 'monokai', 'github-dark']),
})

export async function updateEditorPreferences(
  input: z.infer<typeof schema>
): Promise<{ success: boolean; error?: string }> {
  const userId = await requireAuth()
  if (!userId) return { success: false, error: 'Unauthorized' }

  const parsed = schema.safeParse(input)
  if (!parsed.success) return { success: false, error: 'Invalid preferences' }

  await prisma.user.update({
    where: { id: userId },
    data: { editorPreferences: parsed.data },
  })

  return { success: true }
}
