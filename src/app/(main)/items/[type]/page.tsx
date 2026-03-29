import { auth } from '@/auth'
import { getItemsByType, getItemTypesWithCounts } from '@/lib/db/items'
import ItemCard from '@/components/shared/ItemCard'
import ImageCard from '@/components/shared/ImageCard'
import EmptyState from '@/components/shared/EmptyState'
import CreateItemDialog from '@/components/shared/CreateItemDialog'

interface ItemsPageProps {
  params: Promise<{ type: string }>
}

function getLabel(type: string) {
  return `${type[0].toUpperCase()}${type.slice(1)}s`
}

export async function generateMetadata({ params }: ItemsPageProps) {
  const { type } = await params
  return { title: `DevStash - ${getLabel(type)}` }
}

export default async function ItemsPage({ params }: ItemsPageProps) {
  const { type } = await params
  const session = await auth()
  const [items, itemTypes] = await Promise.all([
    getItemsByType(session!.user!.id!, type),
    getItemTypesWithCounts(session!.user!.id!),
  ])

  const label = getLabel(type)

  return (
    <div className="mx-auto max-w-6xl space-y-6 lg:px-8 xl:px-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{label}</h1>
          <p className="text-sm text-muted-foreground">
            {items.length} item{items.length !== 1 ? 's' : ''}
          </p>
        </div>
        <CreateItemDialog itemTypes={itemTypes} defaultTypeName={type} />
      </div>

      {items.length === 0 ? (
        <EmptyState
          title={`No ${label.toLowerCase()} yet`}
          description={`Items of type "${type}" will appear here.`}
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) =>
            type === 'image' ? (
              <ImageCard
                key={item.id}
                id={item.id}
                title={item.title}
                fileUrl={item.fileUrl}
                isFavorite={item.isFavorite}
                isPinned={item.isPinned}
              />
            ) : (
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
          )}
        </div>
      )}
    </div>
  )
}
