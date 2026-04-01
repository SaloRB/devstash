'use client'

import { useState } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import FavoriteItems from '@/components/favorites/FavoriteItems'
import FavoriteCollections from '@/components/favorites/FavoriteCollections'
import { SORT_FIELDS } from '@/constants'
import type { ItemWithType, SortField, SortDir } from '@/types/items'
import type { FavoriteCollection } from '@/types/collections'

function sortItems(items: ItemWithType[], field: SortField, dir: SortDir): ItemWithType[] {
  return [...items].sort((a, b) => {
    let cmp = 0
    if (field === 'name') cmp = a.title.localeCompare(b.title)
    else if (field === 'date') cmp = b.updatedAt.getTime() - a.updatedAt.getTime()
    else if (field === 'type') cmp = a.itemType.name.localeCompare(b.itemType.name)
    return dir === 'asc' ? cmp : -cmp
  })
}

function sortCollections(collections: FavoriteCollection[], field: SortField, dir: SortDir): FavoriteCollection[] {
  return [...collections].sort((a, b) => {
    let cmp = 0
    if (field === 'name' || field === 'type') cmp = a.name.localeCompare(b.name)
    else if (field === 'date') cmp = b.updatedAt.getTime() - a.updatedAt.getTime()
    return dir === 'asc' ? cmp : -cmp
  })
}

interface Props {
  items: ItemWithType[]
  collections: FavoriteCollection[]
}

export default function FavoritesSortableContent({ items, collections }: Props) {
  const [field, setField] = useState<SortField>('date')
  const [dir, setDir] = useState<SortDir>('asc')

  function handleSort(f: SortField) {
    if (f === field) {
      setDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setField(f)
      setDir('asc')
    }
  }

  const sortedItems = sortItems(items, field, dir)
  const sortedCollections = sortCollections(collections, field, dir)

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-1 font-mono text-xs text-muted-foreground">
        <span className="mr-1 uppercase tracking-wider">Sort:</span>
        {SORT_FIELDS.map(({ label, value }) => {
          const active = field === value
          return (
            <Button
              key={value}
              variant={active ? 'secondary' : 'ghost'}
              size="xs"
              onClick={() => handleSort(value)}
              className="gap-0.5 font-mono text-xs"
            >
              {label}
              {active && (
                dir === 'asc' ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />
              )}
            </Button>
          )
        })}
      </div>
      <FavoriteItems items={sortedItems} />
      <FavoriteCollections collections={sortedCollections} />
    </div>
  )
}
