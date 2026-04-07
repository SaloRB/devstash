'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FolderPlus } from 'lucide-react'
import { useControlledDialog } from '@/hooks/use-controlled-dialog'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { createCollection } from '@/actions/collections'

export default function CreateCollectionDialog({
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: {
  open?: boolean
  onOpenChange?: (open: boolean) => void
} = {}) {
  const router = useRouter()
  const { isControlled, open, setOpen } = useControlledDialog(controlledOpen, controlledOnOpenChange)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)

  function resetForm() {
    setName('')
    setDescription('')
  }

  async function handleCreate() {
    setSaving(true)
    const result = await createCollection({ name, description: description || null })
    setSaving(false)

    if (result.success) {
      toast.success('Collection created')
      setOpen(false)
      resetForm()
      router.refresh()
    } else {
      toast.error(
        typeof result.error === 'string' ? result.error : 'Failed to create collection',
      )
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen)
        if (!isOpen) resetForm()
      }}
    >
      {!isControlled && (
        <DialogTrigger
          render={
            <Button variant="outline">
              <FolderPlus className="size-4" />
              New Collection
            </Button>
          }
        />
      )}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-md bg-primary/10">
              <FolderPlus className="size-4 text-primary" />
            </div>
            Create New Collection
          </DialogTitle>
          <DialogDescription>Organize your items into a collection.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="collection-name">Name</Label>
            <Input
              id="collection-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Collection name (required)"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="collection-description">Description</Label>
            <Textarea
              id="collection-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button disabled={!name.trim() || saving} onClick={handleCreate}>
            {saving ? 'Creating...' : 'Create Collection'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
