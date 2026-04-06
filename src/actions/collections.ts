'use server'

import { z } from 'zod'
import { auth } from '@/auth'
import { getUserProStatus, checkCollectionLimit } from '@/lib/gates'
import {
  createCollection as createCollectionDb,
  updateCollection as updateCollectionDb,
  deleteCollection as deleteCollectionDb,
  toggleFavoriteCollection as toggleFavoriteCollectionDb,
} from '@/lib/db/collections'

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

  const isPro = await getUserProStatus(session.user.id)
  if (!isPro) {
    const allowed = await checkCollectionLimit(session.user.id)
    if (!allowed) {
      return { success: false as const, error: 'COLLECTION_LIMIT_REACHED' }
    }
  }

  try {
    const created = await createCollectionDb(session.user.id, parsed.data)
    return { success: true as const, data: created }
  } catch {
    return { success: false as const, error: 'Failed to create collection' }
  }
}

const updateCollectionSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1, 'Name is required'),
  description: z
    .string()
    .trim()
    .nullable()
    .optional()
    .transform((v) => v || null),
})

export type UpdateCollectionInput = z.infer<typeof updateCollectionSchema>

export async function updateCollection(data: UpdateCollectionInput) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false as const, error: 'Unauthorized' }
  }

  const parsed = updateCollectionSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.flatten().fieldErrors }
  }

  try {
    const { id, ...fields } = parsed.data
    const updated = await updateCollectionDb(id, session.user.id, fields)
    return { success: true as const, data: updated }
  } catch {
    return { success: false as const, error: 'Failed to update collection' }
  }
}

const deleteCollectionSchema = z.object({
  id: z.string().min(1),
})

export async function toggleFavoriteCollection(id: string) {
  const session = await auth()
  if (!session?.user?.id) return { success: false as const, error: 'Unauthorized' }
  try {
    const result = await toggleFavoriteCollectionDb(id, session.user.id)
    return { success: true as const, data: result }
  } catch {
    return { success: false as const, error: 'Failed to update favorite' }
  }
}

export async function deleteCollection(data: { id: string }) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false as const, error: 'Unauthorized' }
  }

  const parsed = deleteCollectionSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false as const, error: 'Invalid collection id' }
  }

  try {
    await deleteCollectionDb(parsed.data.id, session.user.id)
    return { success: true as const }
  } catch {
    return { success: false as const, error: 'Failed to delete collection' }
  }
}
