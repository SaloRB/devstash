'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select'
import { ICON_MAP } from '@/lib/item-types'
import { createItem } from '@/actions/items'
import type { ItemTypeWithCount } from '@/lib/db/items'

const CONTENT_TYPES = new Set(['snippet', 'prompt', 'command', 'note'])
const LANGUAGE_TYPES = new Set(['snippet', 'command'])
const URL_TYPES = new Set(['link'])

export default function CreateItemDialog({
  itemTypes,
}: {
  itemTypes: ItemTypeWithCount[]
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const [selectedTypeId, setSelectedTypeId] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [content, setContent] = useState('')
  const [language, setLanguage] = useState('')
  const [url, setUrl] = useState('')
  const [tagsInput, setTagsInput] = useState('')

  const selectedType = itemTypes.find((t) => t.id === selectedTypeId)
  const typeName = selectedType?.name.toLowerCase() ?? ''
  const showContent = CONTENT_TYPES.has(typeName)
  const showLanguage = LANGUAGE_TYPES.has(typeName)
  const showUrl = URL_TYPES.has(typeName)

  function resetForm() {
    setSelectedTypeId('')
    setTitle('')
    setDescription('')
    setContent('')
    setLanguage('')
    setUrl('')
    setTagsInput('')
  }

  async function handleCreate() {
    setSaving(true)
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    const result = await createItem({
      itemTypeId: selectedTypeId,
      title,
      description: description || null,
      content: showContent ? content || null : null,
      language: showLanguage ? language || null : null,
      url: showUrl ? url || null : null,
      tags,
    })

    setSaving(false)

    if (result.success) {
      toast.success('Item created')
      setOpen(false)
      resetForm()
      router.refresh()
    } else {
      const msg =
        typeof result.error === 'string'
          ? result.error
          : 'Validation failed — check your input'
      toast.error(msg)
    }
  }

  const canSubmit = selectedTypeId && title.trim() && !saving

  // Filter to only the 5 create-eligible types
  const creatableTypes = itemTypes.filter((t) =>
    ['snippet', 'prompt', 'command', 'note', 'link'].includes(
      t.name.toLowerCase()
    )
  )

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen)
        if (!isOpen) resetForm()
      }}
    >
      <DialogTrigger
        render={
          <Button>
            <Plus className="size-4" />
            New Item
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Item</DialogTitle>
          <DialogDescription>
            Add a new item to your stash.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Type</Label>
            <Select
              value={selectedTypeId}
              onValueChange={(v) => setSelectedTypeId(v ?? '')}
            >
              <SelectTrigger className="w-full">
                {selectedType ? (
                  <span className="flex items-center gap-1.5">
                    {(() => {
                      const Icon = ICON_MAP[selectedType.icon] ?? ICON_MAP['Code']
                      return <Icon className="size-4" style={{ color: selectedType.color }} />
                    })()}
                    {selectedType.name.charAt(0).toUpperCase() + selectedType.name.slice(1)}
                  </span>
                ) : (
                  <span className="text-muted-foreground">Select a type</span>
                )}
              </SelectTrigger>
              <SelectContent>
                {creatableTypes.map((type) => {
                  const Icon = ICON_MAP[type.icon] ?? ICON_MAP['Code']
                  return (
                    <SelectItem key={type.id} value={type.id}>
                      <Icon
                        className="size-4"
                        style={{ color: type.color }}
                      />
                      {type.name.charAt(0).toUpperCase() + type.name.slice(1)}
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="create-title">Title</Label>
            <Input
              id="create-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title (required)"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="create-description">Description</Label>
            <Textarea
              id="create-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              rows={2}
            />
          </div>

          {showContent && (
            <div className="space-y-1.5">
              <Label htmlFor="create-content">Content</Label>
              <Textarea
                id="create-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Content"
                rows={6}
                className="font-mono text-xs"
              />
            </div>
          )}

          {showLanguage && (
            <div className="space-y-1.5">
              <Label htmlFor="create-language">Language</Label>
              <Input
                id="create-language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                placeholder="e.g. javascript, python"
              />
            </div>
          )}

          {showUrl && (
            <div className="space-y-1.5">
              <Label htmlFor="create-url">URL</Label>
              <Input
                id="create-url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="create-tags">Tags</Label>
            <Input
              id="create-tags"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Comma-separated tags"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            disabled={!canSubmit}
            onClick={handleCreate}
          >
            {saving ? 'Creating...' : 'Create Item'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
