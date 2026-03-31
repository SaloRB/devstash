'use server'

import { z } from 'zod'
import { DeleteObjectCommand } from '@aws-sdk/client-s3'
import { auth } from '@/auth'
import {
  createItem as createItemDb,
  updateItem as updateItemDb,
  deleteItem as deleteItemDb,
} from '@/lib/db/items'
import { r2, R2_BUCKET, keyFromUrl } from '@/lib/r2'

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
  collectionIds: z.array(z.string()).default([]),
})

export type UpdateItemInput = z.infer<typeof updateItemSchema>

const deleteItemSchema = z.object({
  itemId: z.string().min(1, 'Item ID is required'),
})

const createItemSchema = z.object({
  itemTypeId: z.string().min(1, 'Item type is required'),
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
  fileUrl: z.string().nullable().optional().transform((v) => v || null),
  fileName: z.string().nullable().optional().transform((v) => v || null),
  fileSize: z.number().nullable().optional(),
  collectionIds: z.array(z.string()).default([]),
})

export type CreateItemInput = z.infer<typeof createItemSchema>

export async function createItem(data: CreateItemInput) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false as const, error: 'Unauthorized' }
  }

  const parsed = createItemSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.flatten().fieldErrors }
  }

  const { itemTypeId, collectionIds, ...fields } = parsed.data

  try {
    const created = await createItemDb(session.user.id, itemTypeId, { ...fields, collectionIds })
    return { success: true as const, data: created }
  } catch {
    return { success: false as const, error: 'Failed to create item' }
  }
}

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
    const deleted = await deleteItemDb(parsed.data.itemId, session.user.id)

    if (deleted.fileUrl) {
      try {
        await r2.send(
          new DeleteObjectCommand({
            Bucket: R2_BUCKET,
            Key: keyFromUrl(deleted.fileUrl),
          })
        )
      } catch {
        // R2 delete failure is non-fatal — item is already removed from DB
      }
    }

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
