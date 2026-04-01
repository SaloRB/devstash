'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Star, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { updateCollection, deleteCollection, toggleFavoriteCollection } from '@/actions/collections'

interface CollectionDetailActionsProps {
  collectionId: string
  collectionName: string
  collectionDescription?: string | null
  isFavorite: boolean
}

export default function CollectionDetailActions({
  collectionId,
  collectionName,
  collectionDescription,
  isFavorite,
}: CollectionDetailActionsProps) {
  const router = useRouter()
  const [editOpen, setEditOpen] = useState(false)
  const [name, setName] = useState(collectionName)
  const [description, setDescription] = useState(collectionDescription ?? '')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [favorited, setFavorited] = useState(isFavorite)
  const [togglingFavorite, setTogglingFavorite] = useState(false)

  async function handleSave() {
    setSaving(true)
    const result = await updateCollection({ id: collectionId, name, description })
    setSaving(false)
    if (result.success) {
      toast.success('Collection updated')
      setEditOpen(false)
      router.refresh()
    } else {
      toast.error(typeof result.error === 'string' ? result.error : 'Failed to update')
    }
  }

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

  async function handleDelete() {
    setDeleting(true)
    const result = await deleteCollection({ id: collectionId })
    setDeleting(false)
    if (result.success) {
      toast.success('Collection deleted')
      router.push('/collections')
    } else {
      toast.error(typeof result.error === 'string' ? result.error : 'Failed to delete')
    }
  }

  return (
    <div className="flex items-center gap-1.5">
      <Dialog
        open={editOpen}
        onOpenChange={(isOpen) => {
          setEditOpen(isOpen)
          if (isOpen) {
            setName(collectionName)
            setDescription(collectionDescription ?? '')
          }
        }}
      >
        <DialogTrigger
          render={
            <Button variant="outline" size="icon-sm" title="Edit collection" />
          }
        >
          <Pencil className="size-4" />
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Collection</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="detail-col-name">Name</Label>
              <Input
                id="detail-col-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="detail-col-desc">Description</Label>
              <Textarea
                id="detail-col-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving || !name.trim()}>
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Button
        variant="outline"
        size="icon-sm"
        title={favorited ? 'Remove from favorites' : 'Add to favorites'}
        onClick={handleToggleFavorite}
        disabled={togglingFavorite}
        className={favorited ? 'text-yellow-500 hover:text-yellow-500' : ''}
      >
        <Star className={`size-4 ${favorited ? 'fill-yellow-500' : ''}`} />
      </Button>

      <AlertDialog>
        <AlertDialogTrigger
          render={
            <Button
              variant="outline"
              size="icon-sm"
              title="Delete collection"
              className="text-destructive hover:text-destructive"
              disabled={deleting}
            />
          }
        >
          <Trash2 className="size-4" />
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &ldquo;{collectionName}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              The collection will be removed. Items inside will not be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Deleting…' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
