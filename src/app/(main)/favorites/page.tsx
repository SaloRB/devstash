import { Star } from 'lucide-react'
import { auth } from '@/auth'
import { getFavoriteItems } from '@/lib/db/items'
import { getFavoriteCollections } from '@/lib/db/collections'
import EmptyState from '@/components/shared/EmptyState'
import FavoriteItems from '@/components/favorites/FavoriteItems'
import FavoriteCollections from '@/components/favorites/FavoriteCollections'

export const metadata = { title: 'DevStash - Favorites' }

export default async function FavoritesPage() {
  const session = await auth()
  const userId = session!.user!.id!

  const [items, collections] = await Promise.all([
    getFavoriteItems(userId),
    getFavoriteCollections(userId),
  ])

  const isEmpty = items.length === 0 && collections.length === 0

  return (
    <div className="mx-auto max-w-4xl space-y-6 lg:px-8 xl:px-12">
      <div>
        <h1 className="text-2xl font-bold">Favorites</h1>
        <p className="text-sm text-muted-foreground">
          {items.length + collections.length} favorited
        </p>
      </div>

      {isEmpty ? (
        <EmptyState
          icon={Star}
          title="No favorites yet"
          description="Star items or collections to find them here."
        />
      ) : (
        <div className="space-y-8">
          <FavoriteItems items={items} />
          <FavoriteCollections collections={collections} />
        </div>
      )}
    </div>
  )
}
