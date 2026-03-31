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
  Download,
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
import { deleteItem } from '@/actions/items'
import type { ItemDetail } from '@/lib/db/items'
import type { UserCollection } from '@/lib/db/collections'
import { useItemEditForm } from '@/hooks/use-item-edit-form'
import { ItemContentField } from '@/components/shared/ItemContentField'
import { CollectionMultiSelect } from '@/components/shared/CollectionMultiSelect'
import {
  LANGUAGE_TYPES,
  MARKDOWN_TYPES,
  FILE_TYPES,
} from '@/lib/item-type-sets'
import { formatBytes, formatLongDate } from '@/lib/utils'

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

  const formattedCreated = formatLongDate(item.createdAt)
  const formattedUpdated = formatLongDate(item.updatedAt)

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
          <Pin className={`size-4 ${item.isPinned ? 'fill-foreground' : ''}`} />
          Pin
        </Button>
        {!FILE_TYPES.has(item.itemType.name.toLowerCase()) && (
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
        )}
        {FILE_TYPES.has(item.itemType.name.toLowerCase()) && item.fileUrl && (
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1.5 text-sm"
            onClick={() => {
              window.location.href = `/api/download/${item.id}`
            }}
          >
            <Download className="size-4" />
            Download
          </Button>
        )}
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
                  This will permanently delete &quot;{item.title}&quot;. This
                  action cannot be undone.
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

      <div className="markdown-editor-scroll flex-1 space-y-5 overflow-y-auto p-4">
        {item.description && (
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">
              Description
            </p>
            <p className="text-sm">{item.description}</p>
          </div>
        )}

        {item.itemType.name.toLowerCase() === 'image' && item.fileUrl && (
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">Image</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.fileUrl}
              alt={item.fileName ?? item.title}
              className="w-full rounded-md border object-contain"
            />
            {item.fileName && (
              <p className="text-xs text-muted-foreground">
                {item.fileName}
                {item.fileSize ? ` · ${formatBytes(item.fileSize)}` : ''}
              </p>
            )}
          </div>
        )}

        {item.itemType.name.toLowerCase() === 'file' && item.fileUrl && (
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">File</p>
            <div className="flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2">
              <Badge variant="secondary" className="text-xs">
                {item.fileName?.split('.').pop()?.toUpperCase() ?? 'FILE'}
              </Badge>
              <span className="min-w-0 flex-1 truncate text-sm">
                {item.fileName}
              </span>
              {item.fileSize && (
                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatBytes(item.fileSize)}
                </span>
              )}
            </div>
          </div>
        )}

        {item.content && (
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">Content</p>
            <ItemContentField
              value={item.content}
              language={item.language ?? undefined}
              showLanguage={LANGUAGE_TYPES.has(
                item.itemType.name.toLowerCase(),
              )}
              showMarkdown={MARKDOWN_TYPES.has(
                item.itemType.name.toLowerCase(),
              )}
              readOnly
            />
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
            <p className="text-xs font-medium text-muted-foreground">Details</p>
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
  collections,
  onCancel,
  onSaved,
}: {
  item: ItemDetail
  collections: UserCollection[]
  onCancel: () => void
  onSaved: (updated: ItemDetail) => void
}) {
  const { fields, setters, flags, saving, canSave, handleSave } =
    useItemEditForm(item, onSaved)
  const {
    title,
    description,
    content,
    language,
    url,
    tagsInput,
    selectedCollectionIds,
  } = fields
  const {
    setTitle,
    setDescription,
    setContent,
    setLanguage,
    setUrl,
    setTagsInput,
    setSelectedCollectionIds,
  } = setters
  const { showContent, showLanguage, showMarkdown, showUrl } = flags

  return (
    <>
      <Separator />

      <div className="flex items-center gap-2 px-2 py-2">
        <Button
          size="sm"
          className="gap-1.5"
          disabled={!canSave}
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

      <div className="markdown-editor-scroll flex-1 space-y-4 overflow-y-auto p-4">
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
            <ItemContentField
              value={content}
              language={language || undefined}
              showLanguage={showLanguage}
              showMarkdown={showMarkdown}
              onChange={setContent}
              rows={8}
            />
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

        {collections.length > 0 && (
          <div className="space-y-1.5">
            <Label>Collections</Label>
            <CollectionMultiSelect
              collections={collections}
              value={selectedCollectionIds}
              onChange={setSelectedCollectionIds}
            />
          </div>
        )}

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
            <span>{formatLongDate(item.createdAt)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Updated</span>
            <span>{formatLongDate(item.updatedAt)}</span>
          </div>
        </div>
      </div>
    </>
  )
}

export default function ItemDrawer({
  collections = [],
}: {
  collections?: UserCollection[]
}) {
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
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          setEditing(false)
          closeDrawer()
        }
      }}
    >
      <SheetContent
        side="right"
        className="markdown-editor-scroll flex flex-col gap-0 overflow-y-auto p-0"
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
                    <Badge
                      variant="secondary"
                      className="capitalize text-xs"
                      style={{
                        backgroundColor: `${item.itemType.color}10`,
                        color: item.itemType.color,
                      }}
                    >
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
                collections={collections}
                onCancel={() => setEditing(false)}
                onSaved={handleSaved}
              />
            ) : (
              <ViewMode
                item={item}
                onEdit={() => setEditing(true)}
                onDelete={handleDelete}
                deleting={deleting}
              />
            )}
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
