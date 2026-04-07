'use server'

import { z } from 'zod'
import { requireAuth } from '@/lib/auth-guard'
import { nullableString } from '@/lib/schemas'
import { withAction } from '@/lib/action-utils'
import { getUserProStatus, checkCollectionLimit } from '@/lib/gates'
import {
  createCollection as createCollectionDb,
  updateCollection as updateCollectionDb,
  deleteCollection as deleteCollectionDb,
  toggleFavoriteCollection as toggleFavoriteCollectionDb,
} from '@/lib/db/collections'

const createCollectionSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  description: nullableString(),
})

export type CreateCollectionInput = z.infer<typeof createCollectionSchema>

export async function createCollection(data: CreateCollectionInput) {
  const userId = await requireAuth()
  if (!userId) return { success: false as const, error: 'Unauthorized' }

  const parsed = createCollectionSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.flatten().fieldErrors }
  }

  const isPro = await getUserProStatus(userId)
  if (!isPro) {
    const allowed = await checkCollectionLimit(userId)
    if (!allowed) return { success: false as const, error: 'COLLECTION_LIMIT_REACHED' }
  }

  return withAction(() => createCollectionDb(userId, parsed.data), 'Failed to create collection')
}

const updateCollectionSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1, 'Name is required'),
  description: nullableString(),
})

export type UpdateCollectionInput = z.infer<typeof updateCollectionSchema>

export async function updateCollection(data: UpdateCollectionInput) {
  const userId = await requireAuth()
  if (!userId) return { success: false as const, error: 'Unauthorized' }

  const parsed = updateCollectionSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.flatten().fieldErrors }
  }

  const { id, ...fields } = parsed.data
  return withAction(() => updateCollectionDb(id, userId, fields), 'Failed to update collection')
}

const deleteCollectionSchema = z.object({
  id: z.string().min(1),
})

export async function toggleFavoriteCollection(id: string) {
  const userId = await requireAuth()
  if (!userId) return { success: false as const, error: 'Unauthorized' }
  return withAction(() => toggleFavoriteCollectionDb(id, userId), 'Failed to update favorite')
}

export async function deleteCollection(data: { id: string }) {
  const userId = await requireAuth()
  if (!userId) return { success: false as const, error: 'Unauthorized' }

  const parsed = deleteCollectionSchema.safeParse(data)
  if (!parsed.success) return { success: false as const, error: 'Invalid collection id' }

  try {
    await deleteCollectionDb(parsed.data.id, userId)
    return { success: true as const }
  } catch {
    return { success: false as const, error: 'Failed to delete collection' }
  }
}
