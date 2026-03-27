'use server'

import { z } from 'zod'
import { auth } from '@/auth'
import { updateItem as updateItemDb, deleteItem as deleteItemDb } from '@/lib/db/items'

const updateItemSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  description: z.string().trim().nullable().optional().transform((v) => v || null),
  content: z.string().trim().nullable().optional().transform((v) => v || null),
  url: z
    .string()
    .trim()
    .nullable()
    .optional()
    .transform((v) => v || null)
    .refine((v) => !v || z.string().url().safeParse(v).success, 'Invalid URL'),
  language: z.string().trim().nullable().optional().transform((v) => v || null),
  tags: z
    .array(z.string().trim())
    .transform((arr) => arr.filter((t) => t.length > 0)),
})

export type UpdateItemInput = z.infer<typeof updateItemSchema>

const deleteItemSchema = z.object({
  itemId: z.string().min(1, 'Item ID is required'),
})

export async function deleteItem(itemId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false as const, error: 'Unauthorized' }
  }

  const parsed = deleteItemSchema.safeParse({ itemId })
  if (!parsed.success) {
    return { success: false as const, error: 'Invalid item ID' }
  }

  try {
    await deleteItemDb(parsed.data.itemId, session.user.id)
    return { success: true as const }
  } catch {
    return { success: false as const, error: 'Failed to delete item' }
  }
}

export async function updateItem(itemId: string, data: UpdateItemInput) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false as const, error: 'Unauthorized' }
  }

  const parsed = updateItemSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.flatten().fieldErrors }
  }

  try {
    const updated = await updateItemDb(itemId, session.user.id, parsed.data)
    return { success: true as const, data: updated }
  } catch {
    return { success: false as const, error: 'Failed to update item' }
  }
}
