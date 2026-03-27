import { Star, Pin } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ICON_MAP } from '@/lib/item-types'

interface ItemType {
  icon: string
  color: string
}

interface ItemCardProps {
  title: string
  description?: string | null
  itemType: ItemType
  isFavorite: boolean
  isPinned: boolean
  tags: string[]
  createdAt: Date | string
}

export default function ItemCard({
  title,
  description,
  itemType,
  isFavorite,
  isPinned,
  tags,
  createdAt,
}: ItemCardProps) {
  const Icon = ICON_MAP[itemType.icon] ?? ICON_MAP['Code']
  const iconColor = itemType.color

  const formattedDate = new Date(createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })

  return (
    <Card className="border-l-4" style={{ borderLeftColor: iconColor }}>
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
            {isFavorite && (
              <Star className="size-3 fill-yellow-500 text-yellow-500" />
            )}
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

        <span className="shrink-0 self-start text-xs text-muted-foreground">
          {formattedDate}
        </span>
      </CardContent>
    </Card>
  )
}
