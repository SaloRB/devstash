'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MoreHorizontal, Pencil, Star, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { CollectionEditDialog } from '@/components/collections/CollectionEditDialog'
import { useCollectionActions } from '@/hooks/use-collection-actions'

interface CollectionActionsDropdownProps {
  collectionId: string
  collectionName: string
  collectionDescription?: string | null
  isFavorite: boolean
  onFavoriteChange?: (value: boolean) => void
}

export default function CollectionActionsDropdown({
  collectionId,
  collectionName,
  collectionDescription,
  isFavorite,
  onFavoriteChange,
}: CollectionActionsDropdownProps) {
  const router = useRouter()
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [name, setName] = useState(collectionName)
  const [description, setDescription] = useState(collectionDescription ?? '')

  const { favorited, saving, deleting, handleToggleFavorite, handleSave, handleDelete } =
    useCollectionActions({
      collectionId,
      isFavorite,
      afterDelete: () => { setDeleteOpen(false); router.refresh() },
      onFavoriteChange,
    })

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          className="inline-flex size-7 cursor-pointer items-center justify-center rounded-[min(var(--radius-md),12px)] border border-border bg-background hover:bg-muted"
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
        >
          <MoreHorizontal className="size-4 text-muted-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Pencil className="mr-2 size-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleToggleFavorite}>
            <Star className={`mr-2 size-4 ${favorited ? 'fill-yellow-500 text-yellow-500' : ''}`} />
            {favorited ? 'Unfavorite' : 'Favorite'}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setDeleteOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CollectionEditDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        name={name}
        onNameChange={setName}
        description={description}
        onDescriptionChange={setDescription}
        saving={saving}
        onSave={() => handleSave(name, description, () => setEditOpen(false))}
        stopPropagation
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
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
    </>
  )
}
