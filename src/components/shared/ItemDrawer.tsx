'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  Star,
  Pin,
  Copy,
  Pencil,
  Trash2,
  Check,
  Tag,
  FolderOpen,
  CalendarDays,
  Save,
  X,
} from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
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
import { useItemDrawer } from '@/contexts/item-drawer-context'
import { ICON_MAP } from '@/lib/item-types'
import { updateItem, deleteItem } from '@/actions/items'
import type { ItemDetail } from '@/lib/db/items'
import { CodeEditor } from '@/components/shared/CodeEditor'
import { MarkdownEditor } from '@/components/shared/MarkdownEditor'

const CONTENT_TYPES = new Set(['snippet', 'prompt', 'command', 'note'])
const LANGUAGE_TYPES = new Set(['snippet', 'command'])
const MARKDOWN_TYPES = new Set(['note', 'prompt'])
const URL_TYPES = new Set(['link'])

function DrawerSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center gap-3">
        <Skeleton className="size-10 rounded-md" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-2/3" />
          <div className="flex gap-1.5">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        </div>
      </div>
      <Separator />
      <div className="flex gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-7 w-16 rounded-lg" />
        ))}
      </div>
      <Separator />
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  )
}

function ViewMode({
  item,
  onEdit,
  onDelete,
  deleting,
}: {
  item: ItemDetail
  onEdit: () => void
  onDelete: () => void
  deleting: boolean
}) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    const text = item.content ?? item.url ?? item.fileUrl
    if (!text) return
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const formattedCreated = new Date(item.createdAt).toLocaleDateString(
    'en-US',
    { month: 'long', day: 'numeric', year: 'numeric' }
  )
  const formattedUpdated = new Date(item.updatedAt).toLocaleDateString(
    'en-US',
    { month: 'long', day: 'numeric', year: 'numeric' }
  )

  return (
    <>
      <Separator />

      <div className="flex items-center gap-1 px-2 py-2">
        <Button
          variant="ghost"
          size="sm"
          className={`gap-1.5 text-sm flex items-center ${item.isFavorite ? 'text-yellow-500 hover:text-yellow-500' : ''}`}
        >
          <Star
            className={`size-4 ${item.isFavorite ? 'fill-yellow-500' : ''}`}
          />
          Favorite
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-1.5 text-sm"
        >
          <Pin
            className={`size-4 ${item.isPinned ? 'fill-foreground' : ''}`}
          />
          Pin
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-1.5 text-sm"
          onClick={handleCopy}
        >
          {copied ? (
            <Check className="size-4 text-green-500" />
          ) : (
            <Copy className="size-4" />
          )}
          Copy
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-1.5 text-sm"
          onClick={onEdit}
        >
          <Pencil className="size-4" />
          Edit
        </Button>
        <div className="ml-auto">
          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-destructive hover:text-destructive"
                  disabled={deleting}
                />
              }
            >
              <Trash2 className="size-4" />
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this item?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete &quot;{item.title}&quot;. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={onDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {deleting ? 'Deleting…' : 'Delete'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Separator />

      <div className="flex-1 space-y-5 overflow-y-auto p-4">
        {item.description && (
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">
              Description
            </p>
            <p className="text-sm">{item.description}</p>
          </div>
        )}

        {item.content && (
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">
              Content
            </p>
            {LANGUAGE_TYPES.has(item.itemType.name.toLowerCase()) ? (
              <CodeEditor
                value={item.content}
                language={item.language ?? undefined}
                readOnly
              />
            ) : MARKDOWN_TYPES.has(item.itemType.name.toLowerCase()) ? (
              <MarkdownEditor value={item.content} readOnly />
            ) : (
              <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs leading-relaxed">
                <code>{item.content}</code>
              </pre>
            )}
          </div>
        )}

        {item.url && (
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">URL</p>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary underline"
            >
              {item.url}
            </a>
          </div>
        )}

        {item.tags.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Tag className="size-3.5 text-muted-foreground" />
              <p className="text-xs font-medium text-muted-foreground">Tags</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {item.tags.map((tag) => (
                <Badge key={tag.id} variant="secondary" className="text-xs">
                  {tag.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {item.collections.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <FolderOpen className="size-3.5 text-muted-foreground" />
              <p className="text-xs font-medium text-muted-foreground">
                Collections
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {item.collections.map(({ collection }) => (
                <Badge
                  key={collection.id}
                  variant="secondary"
                  className="text-xs"
                >
                  {collection.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <CalendarDays className="size-3.5 text-muted-foreground" />
            <p className="text-xs font-medium text-muted-foreground">
              Details
            </p>
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Created</span>
              <span>{formattedCreated}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Updated</span>
              <span>{formattedUpdated}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function EditMode({
  item,
  onCancel,
  onSaved,
}: {
  item: ItemDetail
  onCancel: () => void
  onSaved: (updated: ItemDetail) => void
}) {
  const [title, setTitle] = useState(item.title)
  const [description, setDescription] = useState(item.description ?? '')
  const [content, setContent] = useState(item.content ?? '')
  const [language, setLanguage] = useState(item.language ?? '')
  const [url, setUrl] = useState(item.url ?? '')
  const [tagsInput, setTagsInput] = useState(
    item.tags.map((t) => t.name).join(', ')
  )
  const [saving, setSaving] = useState(false)

  const typeName = item.itemType.name.toLowerCase()
  const showContent = CONTENT_TYPES.has(typeName)
  const showLanguage = LANGUAGE_TYPES.has(typeName)
  const showMarkdown = MARKDOWN_TYPES.has(typeName)
  const showUrl = URL_TYPES.has(typeName)

  async function handleSave() {
    setSaving(true)
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    const result = await updateItem(item.id, {
      title,
      description: description || null,
      content: showContent ? content || null : item.content,
      language: showLanguage ? language || null : item.language,
      url: showUrl ? url || null : item.url,
      tags,
    })

    setSaving(false)

    if (result.success) {
      toast.success('Item updated')
      onSaved(result.data)
    } else {
      const msg =
        typeof result.error === 'string'
          ? result.error
          : 'Validation failed — check your input'
      toast.error(msg)
    }
  }

  return (
    <>
      <Separator />

      <div className="flex items-center gap-2 px-2 py-2">
        <Button
          size="sm"
          className="gap-1.5"
          disabled={!title.trim() || saving}
          onClick={handleSave}
        >
          <Save className="size-4" />
          {saving ? 'Saving...' : 'Save'}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5"
          onClick={onCancel}
          disabled={saving}
        >
          <X className="size-4" />
          Cancel
        </Button>
      </div>

      <Separator />

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        <div className="space-y-1.5">
          <Label htmlFor="edit-title">Title</Label>
          <Input
            id="edit-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title (required)"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="edit-description">Description</Label>
          <Textarea
            id="edit-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description"
            rows={3}
          />
        </div>

        {showContent && (
          <div className="space-y-1.5">
            <Label>Content</Label>
            {showLanguage ? (
              <CodeEditor
                value={content}
                language={language || undefined}
                onChange={setContent}
              />
            ) : showMarkdown ? (
              <MarkdownEditor value={content} onChange={setContent} />
            ) : (
              <Textarea
                id="edit-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Content"
                rows={8}
                className="font-mono text-xs"
              />
            )}
          </div>
        )}

        {showLanguage && (
          <div className="space-y-1.5">
            <Label htmlFor="edit-language">Language</Label>
            <Input
              id="edit-language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              placeholder="e.g. javascript, python"
            />
          </div>
        )}

        {showUrl && (
          <div className="space-y-1.5">
            <Label htmlFor="edit-url">URL</Label>
            <Input
              id="edit-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="edit-tags">Tags</Label>
          <Input
            id="edit-tags"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="Comma-separated tags"
          />
        </div>

        <Separator />

        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>Type</span>
            <Badge variant="secondary" className="text-xs">
              {item.itemType.name}
            </Badge>
          </div>
          {item.collections.length > 0 && (
            <div className="flex items-center justify-between">
              <span>Collections</span>
              <div className="flex flex-wrap gap-1">
                {item.collections.map(({ collection }) => (
                  <Badge
                    key={collection.id}
                    variant="secondary"
                    className="text-xs"
                  >
                    {collection.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span>Created</span>
            <span>{new Date(item.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Updated</span>
            <span>{new Date(item.updatedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          </div>
        </div>
      </div>
    </>
  )
}

export default function ItemDrawer() {
  const { isOpen, item, loading, closeDrawer, refreshItem } = useItemDrawer()
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)


  const Icon = item ? (ICON_MAP[item.itemType.icon] ?? ICON_MAP['Code']) : null

  function handleSaved(updated: ItemDetail) {
    refreshItem(updated)
    setEditing(false)
    router.refresh()
  }

  async function handleDelete() {
    if (!item) return
    setDeleting(true)
    const result = await deleteItem(item.id)
    setDeleting(false)
    if (result.success) {
      toast.success('Item deleted')
      closeDrawer()
      router.refresh()
    } else {
      toast.error(result.error ?? 'Failed to delete item')
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => { if (!open) { setEditing(false); closeDrawer() } }}>
      <SheetContent
        side="right"
        className="flex flex-col gap-0 overflow-y-auto p-0"
        style={{ width: '100%', maxWidth: '576px' }}
      >
        {loading ? (
          <DrawerSkeleton />
        ) : item ? (
          <>
            <SheetHeader className="px-4 pb-4 pt-4">
              <div className="flex items-start gap-3 pr-6">
                {Icon && (
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted">
                    <Icon
                      className="size-5"
                      style={{ color: item.itemType.color }}
                    />
                  </div>
                )}
                <div className="min-w-0 space-y-1.5">
                  <SheetTitle className="text-lg leading-tight">
                    {item.title}
                  </SheetTitle>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="secondary" className="text-xs">
                      {item.itemType.name}
                    </Badge>
                    {item.language && (
                      <Badge variant="secondary" className="text-xs">
                        {item.language}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </SheetHeader>

            {editing ? (
              <EditMode
                item={item}
                onCancel={() => setEditing(false)}
                onSaved={handleSaved}
              />
            ) : (
              <ViewMode item={item} onEdit={() => setEditing(true)} onDelete={handleDelete} deleting={deleting} />
            )}
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
