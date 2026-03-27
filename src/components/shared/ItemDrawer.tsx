'use client'

import { useState } from 'react'
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
import { useItemDrawer } from '@/contexts/item-drawer-context'
import { ICON_MAP } from '@/lib/item-types'

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

export default function ItemDrawer() {
  const { isOpen, item, loading, closeDrawer } = useItemDrawer()
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    const text = item?.content ?? item?.url ?? item?.fileUrl
    if (!text) return
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const Icon = item ? (ICON_MAP[item.itemType.icon] ?? ICON_MAP['Code']) : null

  const formattedCreated = item
    ? new Date(item.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : ''

  const formattedUpdated = item
    ? new Date(item.updatedAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : ''

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeDrawer()}>
      <SheetContent
        side="right"
        className="flex flex-col gap-0 overflow-y-auto p-0"
        style={{ width: '100%', maxWidth: '576px' }}
      >
        {loading ? (
          <DrawerSkeleton />
        ) : item ? (
          <>
            {/* Header */}
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

            <Separator />

            {/* Action bar */}
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
              >
                <Pencil className="size-4" />
                Edit
              </Button>
              <div className="ml-auto">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>

            <Separator />

            {/* Detail content */}
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
                  <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs leading-relaxed">
                    <code>{item.content}</code>
                  </pre>
                </div>
              )}

              {item.tags.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <Tag className="size-3.5 text-muted-foreground" />
                    <p className="text-xs font-medium text-muted-foreground">
                      Tags
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {item.tags.map((tag) => (
                      <Badge
                        key={tag.id}
                        variant="secondary"
                        className="text-xs"
                      >
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
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
