'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Star, Pin, Copy, Check } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ICON_MAP } from '@/lib/item-types'
import { useItemDrawer } from '@/contexts/item-drawer-context'
import { relativeDate } from '@/lib/utils'
import { toggleFavoriteItem } from '@/actions/items'

interface ItemType {
  icon: string
  color: string
}

interface ItemCardProps {
  id: string
  title: string
  description?: string | null
  itemType: ItemType
  isFavorite: boolean
  isPinned: boolean
  tags: string[]
  createdAt: Date | string
}

export default function ItemCard({
  id,
  title,
  description,
  itemType,
  isFavorite,
  isPinned,
  tags,
  createdAt,
}: ItemCardProps) {
  const { openDrawer } = useItemDrawer()
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const [favorited, setFavorited] = useState(isFavorite)

  useEffect(() => {
    setFavorited(isFavorite)
  }, [isFavorite])
  const Icon = ICON_MAP[itemType.icon] ?? ICON_MAP['Code']
  const iconColor = itemType.color

  async function handleToggleFavorite(e: React.MouseEvent) {
    e.stopPropagation()
    setFavorited((prev) => !prev)
    const result = await toggleFavoriteItem(id)
    if (result.success) {
      setFavorited(result.data.isFavorite)
      router.refresh()
    } else {
      setFavorited(favorited)
    }
  }

  async function handleCopy(e: React.MouseEvent) {
    e.stopPropagation()
    const res = await fetch(`/api/items/${id}`)
    const item = await res.json()
    const text = item.content ?? item.url ?? title
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <Card
      className="group min-h-18 cursor-pointer border-l-4 transition-colors hover:bg-muted/50"
      style={{ borderLeftColor: iconColor }}
      onClick={() => openDrawer(id)}
    >
      <CardContent className="flex items-center gap-3">
        <div
          className="flex size-8 shrink-0 items-center justify-center rounded-md"
          style={{ backgroundColor: `${iconColor}15` }}
        >
          <Icon className="size-4" style={{ color: iconColor }} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-medium">{title}</p>
            {isPinned && <Pin className="size-3 text-muted-foreground" />}
            <button
              onClick={handleToggleFavorite}
              title={favorited ? 'Remove from favorites' : 'Add to favorites'}
              className="shrink-0"
            >
              <Star
                className={`size-3 ${favorited ? 'fill-yellow-500 text-yellow-500' : 'text-muted-foreground hover:text-yellow-500'}`}
              />
            </button>
          </div>
          {description && (
            <p className="truncate text-xs text-muted-foreground">
              {description}
            </p>
          )}
          {tags.length > 0 && (
            <div className="mt-1.5 flex items-center gap-1.5">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-[0.65rem]">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1 self-start">
          <span className="text-xs text-muted-foreground">
            {relativeDate(createdAt)}
          </span>
          <button
            onClick={handleCopy}
            className="opacity-0 transition-opacity group-hover:opacity-100"
            title="Copy"
          >
            {copied ? (
              <Check className="size-3.5 text-green-500" />
            ) : (
              <Copy className="size-3.5 text-muted-foreground hover:text-foreground" />
            )}
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
