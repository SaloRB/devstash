import { auth } from '@/auth'
import { getItemsByType, getItemTypesWithCounts } from '@/lib/db/items'
import { getUserCollections } from '@/lib/db/collections'
import ItemsGrid from '@/components/items/ItemsGrid'
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
  const [items, itemTypes, collections] = await Promise.all([
    getItemsByType(session!.user!.id!, type),
    getItemTypesWithCounts(session!.user!.id!),
    getUserCollections(session!.user!.id!),
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
        <CreateItemDialog itemTypes={itemTypes} defaultTypeName={type} collections={collections} />
      </div>

      <ItemsGrid type={type} items={items} />
    </div>
  )
}
