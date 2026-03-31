import { notFound } from 'next/navigation'
import { auth } from '@/auth'
import { getCollectionWithItems } from '@/lib/db/collections'
import ItemCard from '@/components/shared/ItemCard'
import ImageCard from '@/components/shared/ImageCard'
import FileListRow from '@/components/shared/FileListRow'
import EmptyState from '@/components/shared/EmptyState'

interface CollectionDetailPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: CollectionDetailPageProps) {
  const { id } = await params
  const session = await auth()
  const collection = await getCollectionWithItems(id, session!.user!.id!)
  if (!collection) return { title: 'DevStash - Collection' }
  return { title: `DevStash - ${collection.name}` }
}

export default async function CollectionDetailPage({
  params,
}: CollectionDetailPageProps) {
  const { id } = await params
  const session = await auth()
  const collection = await getCollectionWithItems(id, session!.user!.id!)

  if (!collection) notFound()

  const items = collection.items.map(({ item }) => item)

  return (
    <div className="mx-auto max-w-6xl space-y-6 lg:px-8 xl:px-12">
      <div>
        <h1 className="text-2xl font-bold">{collection.name}</h1>
        {collection.description && (
          <p className="text-sm text-muted-foreground">
            {collection.description}
          </p>
        )}
        <p className="text-sm text-muted-foreground">
          {collection._count.items} item{collection._count.items !== 1 ? 's' : ''}
        </p>
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="No items in this collection"
          description="Add items to this collection from the item editor."
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const typeName = item.itemType.name

            if (typeName === 'image') {
              return (
                <ImageCard
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  fileUrl={item.fileUrl}
                  isFavorite={item.isFavorite}
                  isPinned={item.isPinned}
                />
              )
            }

            if (typeName === 'file') {
              return (
                <FileListRow
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  fileName={item.fileName}
                  fileSize={item.fileSize}
                  createdAt={item.createdAt}
                />
              )
            }

            return (
              <ItemCard
                key={item.id}
                id={item.id}
                title={item.title}
                description={item.description}
                itemType={item.itemType}
                isFavorite={item.isFavorite}
                isPinned={item.isPinned}
                tags={item.tags.map((t) => t.name)}
                createdAt={item.createdAt}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
