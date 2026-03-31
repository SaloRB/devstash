import { FolderOpen } from 'lucide-react'
import { auth } from '@/auth'
import { getAllCollections } from '@/lib/db/collections'
import { COLLECTIONS_PER_PAGE } from '@/lib/constants'
import CollectionCard from '@/components/dashboard/CollectionCard'
import EmptyState from '@/components/shared/EmptyState'
import Pagination from '@/components/shared/Pagination'

export const metadata = { title: 'DevStash - Collections' }

interface CollectionsPageProps {
  searchParams: Promise<{ page?: string }>
}

export default async function CollectionsPage({ searchParams }: CollectionsPageProps) {
  const { page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? '1', 10) || 1)

  const session = await auth()
  const { collections, total } = await getAllCollections(session!.user!.id!, page, COLLECTIONS_PER_PAGE)
  const totalPages = Math.ceil(total / COLLECTIONS_PER_PAGE)

  return (
    <div className="mx-auto max-w-6xl space-y-6 lg:px-8 xl:px-12">
      <div>
        <h1 className="text-2xl font-bold">Collections</h1>
        <p className="text-sm text-muted-foreground">
          {total} collection{total !== 1 ? 's' : ''}
        </p>
      </div>

      {total === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="No collections yet"
          description="Create a collection to organize your items."
        />
      ) : (
        <>
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

          <Pagination page={page} totalPages={totalPages} basePath="/collections" />
        </>
      )}
    </div>
  )
}
