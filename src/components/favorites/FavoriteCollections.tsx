'use client'

import { useRouter } from 'next/navigation'
import { FolderOpen } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { relativeDate } from '@/lib/utils'
import type { FavoriteCollection } from '@/types/collections'

export default function FavoriteCollections({ collections }: { collections: FavoriteCollection[] }) {
  const router = useRouter()

  if (collections.length === 0) return null

  return (
    <section className="font-mono text-sm">
      <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider">
        <span>Collections</span>
        <span className="text-border">—</span>
        <span>{collections.length}</span>
      </div>
      <div className="divide-y divide-border/50 rounded-md border border-border/50">
        {collections.map((col) => (
          <button
            key={col.id}
            onClick={() => router.push(`/collections/${col.id}`)}
            className="flex w-full items-center gap-3 px-3 py-1.5 text-left hover:bg-accent/50 transition-colors first:rounded-t-md last:rounded-b-md"
          >
            <FolderOpen className="size-4 shrink-0 text-muted-foreground" />
            <span className="flex-1 truncate text-foreground">{col.name}</span>
            <Badge variant="outline" className="shrink-0 font-mono text-xs">
              collection
            </Badge>
            <span className="shrink-0 text-xs text-muted-foreground w-20 text-right">
              {relativeDate(col.updatedAt)}
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}
