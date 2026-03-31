import { Star, MoreHorizontal } from 'lucide-react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardAction,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getDominantTypeColor, getCollectionTypeIcons } from '@/lib/collection-utils'

interface CollectionItemType {
  id: string
  icon: string
  color: string
}

interface CollectionItem {
  itemType: CollectionItemType
}

interface CollectionCardProps {
  name: string
  description?: string | null
  itemCount: number
  isFavorite: boolean
  items: CollectionItem[]
}

export default function CollectionCard({
  name,
  description,
  itemCount,
  isFavorite,
  items,
}: CollectionCardProps) {
  // Derive border color from most-used item type
  const borderColor = itemCount > 0
    ? getDominantTypeColor(items.map(({ itemType }) => itemType))
    : 'transparent'

  const typeIcons = getCollectionTypeIcons(items)

  return (
    <Card
      size="sm"
      className="border-l-4 bg-teal-950/20 ring-teal-900/30 transition-colors hover:bg-teal-950/30"
      style={{ borderLeftColor: borderColor }}
    >
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle className="text-sm">{name}</CardTitle>
          {isFavorite && (
            <Star className="size-3.5 fill-yellow-500 text-yellow-500" />
          )}
        </div>
        <CardAction>
          <Button variant="ghost" size="icon-xs">
            <MoreHorizontal className="size-4 text-muted-foreground" />
          </Button>
        </CardAction>
        <CardDescription className="text-xs">{itemCount} items</CardDescription>
        {description && (
          <CardDescription className="line-clamp-1 text-xs text-muted-foreground/70">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-1.5">
          {typeIcons.map(({ id, icon: Icon, color }) => (
            <div
              key={id}
              className="flex size-5 items-center justify-center rounded-full"
              style={{ backgroundColor: `${color}20` }}
            >
              <Icon className="size-3" style={{ color }} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
