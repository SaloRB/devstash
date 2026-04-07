'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Star, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
import { CollectionEditDialog } from '@/components/collections/CollectionEditDialog'
import { useCollectionActions } from '@/hooks/use-collection-actions'

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

  const { favorited, saving, deleting, togglingFavorite, handleToggleFavorite, handleSave, handleDelete } =
    useCollectionActions({
      collectionId,
      isFavorite,
      afterDelete: () => router.push('/collections'),
    })

  return (
    <div className="flex items-center gap-1.5">
      <Button
        variant="outline"
        size="icon-sm"
        title="Edit collection"
        onClick={() => {
          setName(collectionName)
          setDescription(collectionDescription ?? '')
          setEditOpen(true)
        }}
      >
        <Pencil className="size-4" />
      </Button>

      <CollectionEditDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        name={name}
        onNameChange={setName}
        description={description}
        onDescriptionChange={setDescription}
        saving={saving}
        onSave={() => handleSave(name, description, () => setEditOpen(false))}
      />

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
