'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { updateCollection, deleteCollection, toggleFavoriteCollection } from '@/actions/collections'

interface UseCollectionActionsOptions {
  collectionId: string
  isFavorite: boolean
  afterDelete?: () => void
}

export function useCollectionActions({
  collectionId,
  isFavorite,
  afterDelete,
}: UseCollectionActionsOptions) {
  const router = useRouter()
  const [favorited, setFavorited] = useState(isFavorite)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [togglingFavorite, setTogglingFavorite] = useState(false)

  async function handleToggleFavorite() {
    setTogglingFavorite(true)
    const result = await toggleFavoriteCollection(collectionId)
    setTogglingFavorite(false)
    if (result.success) {
      setFavorited(result.data.isFavorite)
      router.refresh()
    } else {
      toast.error(typeof result.error === 'string' ? result.error : 'Failed to update favorite')
    }
  }

  async function handleSave(name: string, description: string, onSuccess: () => void) {
    setSaving(true)
    const result = await updateCollection({ id: collectionId, name, description })
    setSaving(false)
    if (result.success) {
      toast.success('Collection updated')
      onSuccess()
      router.refresh()
    } else {
      toast.error(typeof result.error === 'string' ? result.error : 'Failed to update')
    }
  }

  async function handleDelete() {
    setDeleting(true)
    const result = await deleteCollection({ id: collectionId })
    setDeleting(false)
    if (result.success) {
      toast.success('Collection deleted')
      afterDelete?.()
    } else {
      toast.error(typeof result.error === 'string' ? result.error : 'Failed to delete')
    }
  }

  return {
    favorited,
    saving,
    deleting,
    togglingFavorite,
    handleToggleFavorite,
    handleSave,
    handleDelete,
  }
}
