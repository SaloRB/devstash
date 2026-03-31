'use server'

import { z } from 'zod'
import { auth } from '@/auth'
import { createCollection as createCollectionDb } from '@/lib/db/collections'

const createCollectionSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  description: z
    .string()
    .trim()
    .nullable()
    .optional()
    .transform((v) => v || null),
})

export type CreateCollectionInput = z.infer<typeof createCollectionSchema>

export async function createCollection(data: CreateCollectionInput) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false as const, error: 'Unauthorized' }
  }

  const parsed = createCollectionSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.flatten().fieldErrors }
  }

  try {
    const created = await createCollectionDb(session.user.id, parsed.data)
    return { success: true as const, data: created }
  } catch {
    return { success: false as const, error: 'Failed to create collection' }
  }
}
