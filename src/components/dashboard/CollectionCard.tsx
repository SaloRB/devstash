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
import { getItemTypeInfo } from '@/lib/item-types'

interface CollectionItem {
  itemTypeId: string
}

interface CollectionCardProps {
  name: string
  description?: string
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
  // Derive border color from first item's type
  const firstItemType =
    items.length > 0 ? getItemTypeInfo(items[0].itemTypeId) : null
  const borderColor = firstItemType?.color ?? '#6b7280'

  // Get unique type icons from items (up to 4)
  const seenTypes = new Set<string>()
  const typeIcons: {
    icon: React.ComponentType<{
      className?: string
      style?: React.CSSProperties
    }>
    color: string
  }[] = []
  for (const item of items) {
    if (seenTypes.has(item.itemTypeId)) continue
    seenTypes.add(item.itemTypeId)
    typeIcons.push(getItemTypeInfo(item.itemTypeId))
    if (typeIcons.length >= 4) break
  }

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
          {typeIcons.map(({ icon: Icon, color }) => (
            <div
              key={color}
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
