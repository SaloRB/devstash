'use client'

import { Badge } from '@/components/ui/badge'
import { ICON_MAP } from '@/lib/item-types'
import { useItemDrawer } from '@/contexts/item-drawer-context'
import { relativeDate } from '@/lib/utils'
import type { ItemWithType } from '@/lib/db/items'

function ItemIcon({ icon, color }: { icon: string; color: string }) {
  const Icon = ICON_MAP[icon] ?? ICON_MAP['Code']
  return <Icon className="size-4 shrink-0" style={{ color }} />
}

export default function FavoriteItems({ items }: { items: ItemWithType[] }) {
  const { openDrawer } = useItemDrawer()

  if (items.length === 0) return null

  return (
    <section className="font-mono text-sm">
      <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider">
        <span>Items</span>
        <span className="text-border">—</span>
        <span>{items.length}</span>
      </div>
      <div className="divide-y divide-border/50 rounded-md border border-border/50">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => openDrawer(item.id)}
            className="flex w-full items-center gap-3 px-3 py-1.5 text-left hover:bg-accent/50 transition-colors first:rounded-t-md last:rounded-b-md"
          >
            <ItemIcon icon={item.itemType.icon} color={item.itemType.color} />
            <span className="flex-1 truncate text-foreground">{item.title}</span>
            <Badge
              variant="outline"
              className="shrink-0 font-mono text-xs capitalize"
              style={{ color: item.itemType.color, borderColor: `${item.itemType.color}60` }}
            >
              {item.itemType.name}
            </Badge>
            <span className="shrink-0 text-xs text-muted-foreground w-20 text-right">
              {relativeDate(item.updatedAt)}
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}
