import Link from 'next/link'
import { FolderOpen } from 'lucide-react'
import { auth } from '@/auth'
import { getRecentCollections, type CollectionWithItems } from '@/lib/db/collections'
import CollectionCard from './CollectionCard'
import EmptyState from '@/components/shared/EmptyState'

export default async function RecentCollections() {
  const session = await auth()
  const collections = await getRecentCollections(session!.user!.id!)

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Collections</h2>
        <Link
          href="/collections"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          View all
        </Link>
      </div>
      {collections.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="No collections yet"
          description="Create a collection to organize your items."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((col: CollectionWithItems) => (
            <CollectionCard
              key={col.id}
              name={col.name}
              description={col.description}
              itemCount={col._count.items}
              isFavorite={col.isFavorite}
              items={col.items.map(({ item }) => ({ itemType: item.itemType }))}
            />
          ))}
        </div>
      )}
    </section>
  )
}
