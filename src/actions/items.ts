'use server'

import { z } from 'zod'
import { DeleteObjectCommand } from '@aws-sdk/client-s3'
import { requireAuth } from '@/lib/auth-guard'
import { nullableString, nullableUrl } from '@/lib/schemas'
import { withAction } from '@/lib/action-utils'
import {
  createItem as createItemDb,
  updateItem as updateItemDb,
  deleteItem as deleteItemDb,
  toggleFavoriteItem as toggleFavoriteItemDb,
  togglePinnedItem as togglePinnedItemDb,
} from '@/lib/db/items'
import { r2, R2_BUCKET, keyFromUrl } from '@/lib/clients/r2'
import { prisma } from '@/lib/prisma'
import { getUserProStatus, checkItemLimit } from '@/lib/gates'
import { FILE_TYPES } from '@/constants/item-types'

const updateItemSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  description: nullableString(),
  content: nullableString(),
  url: nullableUrl(),
  language: nullableString(),
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
  description: nullableString(),
  content: nullableString(),
  url: nullableUrl(),
  language: nullableString(),
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
  const userId = await requireAuth()
  if (!userId) return { success: false as const, error: 'Unauthorized' }

  const parsed = createItemSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.flatten().fieldErrors }
  }

  const { itemTypeId, collectionIds, ...fields } = parsed.data

  const isPro = await getUserProStatus(userId)

  if (!isPro) {
    const itemType = await prisma.itemType.findUnique({
      where: { id: itemTypeId },
      select: { name: true },
    })
    if (itemType && FILE_TYPES.has(itemType.name.toLowerCase())) {
      return { success: false as const, error: 'PRO_REQUIRED' }
    }

    const allowed = await checkItemLimit(userId)
    if (!allowed) {
      return { success: false as const, error: 'ITEM_LIMIT_REACHED' }
    }
  }

  return withAction(
    () => createItemDb(userId, itemTypeId, { ...fields, collectionIds }),
    'Failed to create item'
  )
}

export async function deleteItem(itemId: string) {
  const userId = await requireAuth()
  if (!userId) return { success: false as const, error: 'Unauthorized' }

  const parsed = deleteItemSchema.safeParse({ itemId })
  if (!parsed.success) {
    return { success: false as const, error: 'Invalid item ID' }
  }

  try {
    const deleted = await deleteItemDb(parsed.data.itemId, userId)

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

export async function toggleFavoriteItem(itemId: string) {
  const userId = await requireAuth()
  if (!userId) return { success: false as const, error: 'Unauthorized' }
  return withAction(() => toggleFavoriteItemDb(itemId, userId), 'Failed to update favorite')
}

export async function toggleItemPin(itemId: string) {
  const userId = await requireAuth()
  if (!userId) return { success: false as const, error: 'Unauthorized' }
  return withAction(() => togglePinnedItemDb(itemId, userId), 'Failed to update pin')
}

export async function updateItem(itemId: string, data: UpdateItemInput) {
  const userId = await requireAuth()
  if (!userId) return { success: false as const, error: 'Unauthorized' }

  const parsed = updateItemSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.flatten().fieldErrors }
  }

  return withAction(() => updateItemDb(itemId, userId, parsed.data), 'Failed to update item')
}
