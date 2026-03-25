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
import { ICON_MAP } from '@/lib/item-types'

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
  const typeCounts: Record<string, { count: number; color: string }> = {}
  for (const { itemType } of items) {
    if (!typeCounts[itemType.id]) {
      typeCounts[itemType.id] = { count: 0, color: itemType.color }
    }
    typeCounts[itemType.id].count++
  }
  const dominant = Object.values(typeCounts).sort((a, b) => b.count - a.count)[0]
  const borderColor = dominant?.color ?? '#6b7280'

  // Get unique type icons sorted by usage (most to least)
  const typeIcons = Object.entries(typeCounts)
    .sort(([, a], [, b]) => b.count - a.count)
    .map(([id, { color }]) => {
      const iconName = items.find(({ itemType }) => itemType.id === id)!.itemType.icon
      return { icon: ICON_MAP[iconName] ?? ICON_MAP['Code'], color }
    })

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
