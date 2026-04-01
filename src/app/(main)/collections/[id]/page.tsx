import { notFound } from 'next/navigation'
import { Image, File } from 'lucide-react'
import { auth } from '@/auth'
import { getCollectionWithItems } from '@/lib/db/collections'
import { COLLECTIONS_PER_PAGE } from '@/constants'
import { ICON_MAP } from '@/lib/item-types'
import ItemCard from '@/components/shared/ItemCard'
import ImageCard from '@/components/shared/ImageCard'
import FileListRow from '@/components/shared/FileListRow'
import EmptyState from '@/components/shared/EmptyState'
import CollectionDetailActions from '@/components/collections/CollectionDetailActions'
import Pagination from '@/components/shared/Pagination'

interface CollectionDetailPageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ page?: string }>
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
  searchParams,
}: CollectionDetailPageProps) {
  const { id } = await params
  const { page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? '1', 10) || 1)

  const session = await auth()
  const collection = await getCollectionWithItems(id, session!.user!.id!, page, COLLECTIONS_PER_PAGE)

  if (!collection) notFound()

  const totalItems = collection._count.items
  const totalPages = Math.ceil(totalItems / COLLECTIONS_PER_PAGE)

  const items = collection.items.map(({ item }) => item)
  const images = items.filter((i) => i.itemType.name === 'image')
  const files = items.filter((i) => i.itemType.name === 'file')
  const others = items.filter(
    (i) => i.itemType.name !== 'image' && i.itemType.name !== 'file'
  )

  const typeCounts = items.reduce<Record<string, { count: number; icon: string; color: string }>>(
    (acc, item) => {
      const name = item.itemType.name
      if (!acc[name]) {
        acc[name] = { count: 0, icon: item.itemType.icon, color: item.itemType.color }
      }
      acc[name].count++
      return acc
    },
    {}
  )

  return (
    <div className="mx-auto max-w-6xl space-y-6 lg:px-8 xl:px-12">
      <div>
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-2xl font-bold">{collection.name}</h1>
          <CollectionDetailActions
            collectionId={collection.id}
            collectionName={collection.name}
            collectionDescription={collection.description}
            isFavorite={collection.isFavorite}
          />
        </div>
        {collection.description && (
          <p className="text-sm text-muted-foreground">
            {collection.description}
          </p>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-3">
          {Object.entries(typeCounts)
            .sort(([, a], [, b]) => b.count - a.count)
            .map(([name, { count, icon, color }]) => {
              const Icon = name === 'image'
                ? Image
                : name === 'file'
                  ? File
                  : ICON_MAP[icon] ?? ICON_MAP['Code']
              return (
                <div key={name} className="flex items-center gap-1.5">
                  <Icon className="size-3.5" style={{ color }} />
                  <span className="text-xs text-muted-foreground">{count}</span>
                </div>
              )
            })}
        </div>
      </div>

      {totalItems === 0 ? (
        <EmptyState
          title="No items in this collection"
          description="Add items to this collection from the item editor."
        />
      ) : (
        <>
          <div className="space-y-8">
            {others.length > 0 && (
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {others.map((item) => (
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
                ))}
              </div>
            )}

            {images.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Image className="size-4 text-muted-foreground" />
                  <h2 className="text-sm font-medium text-muted-foreground">
                    Images
                  </h2>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {images.map((item) => (
                    <ImageCard
                      key={item.id}
                      id={item.id}
                      title={item.title}
                      fileUrl={item.fileUrl}
                      isFavorite={item.isFavorite}
                      isPinned={item.isPinned}
                    />
                  ))}
                </div>
              </div>
            )}

            {files.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <File className="size-4 text-muted-foreground" />
                  <h2 className="text-sm font-medium text-muted-foreground">
                    Files
                  </h2>
                </div>
                <div className="grid gap-3">
                  {files.map((item) => (
                    <FileListRow
                      key={item.id}
                      id={item.id}
                      title={item.title}
                      fileName={item.fileName}
                      fileSize={item.fileSize}
                      createdAt={item.createdAt}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <Pagination page={page} totalPages={totalPages} basePath={`/collections/${id}`} />
        </>
      )}
    </div>
  )
}
