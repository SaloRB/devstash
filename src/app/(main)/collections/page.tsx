import { FolderOpen } from 'lucide-react'
import { auth } from '@/auth'
import { getAllCollections } from '@/lib/db/collections'
import CollectionCard from '@/components/dashboard/CollectionCard'
import EmptyState from '@/components/shared/EmptyState'

export const metadata = { title: 'DevStash - Collections' }

export default async function CollectionsPage() {
  const session = await auth()
  const collections = await getAllCollections(session!.user!.id!)

  return (
    <div className="mx-auto max-w-6xl space-y-6 lg:px-8 xl:px-12">
      <div>
        <h1 className="text-2xl font-bold">Collections</h1>
        <p className="text-sm text-muted-foreground">
          {collections.length} collection{collections.length !== 1 ? 's' : ''}
        </p>
      </div>

      {collections.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="No collections yet"
          description="Create a collection to organize your items."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((col) => (
            <CollectionCard
              key={col.id}
              id={col.id}
              name={col.name}
              description={col.description}
              itemCount={col._count.items}
              isFavorite={col.isFavorite}
              items={col.items.map(({ item }) => ({ itemType: item.itemType }))}
            />
          ))}
        </div>
      )}
    </div>
  )
}
