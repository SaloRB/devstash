import { auth } from '@/auth'
import { getItemsByType, getItemTypesWithCounts } from '@/lib/db/items'
import { getUserCollections } from '@/lib/db/collections'
import { ITEMS_PER_PAGE } from '@/lib/constants'
import ItemsGrid from '@/components/items/ItemsGrid'
import CreateItemDialog from '@/components/shared/CreateItemDialog'
import Pagination from '@/components/shared/Pagination'

interface ItemsPageProps {
  params: Promise<{ type: string }>
  searchParams: Promise<{ page?: string }>
}

function getLabel(type: string) {
  return `${type[0].toUpperCase()}${type.slice(1)}s`
}

export async function generateMetadata({ params }: ItemsPageProps) {
  const { type } = await params
  return { title: `DevStash - ${getLabel(type)}` }
}

export default async function ItemsPage({ params, searchParams }: ItemsPageProps) {
  const { type } = await params
  const { page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? '1', 10) || 1)

  const session = await auth()
  const userId = session!.user!.id!

  const [{ items, total }, itemTypes, collections] = await Promise.all([
    getItemsByType(userId, type, page, ITEMS_PER_PAGE),
    getItemTypesWithCounts(userId),
    getUserCollections(userId),
  ])

  const label = getLabel(type)
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE)

  return (
    <div className="mx-auto max-w-6xl space-y-6 lg:px-8 xl:px-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{label}</h1>
          <p className="text-sm text-muted-foreground">
            {total} item{total !== 1 ? 's' : ''}
          </p>
        </div>
        <CreateItemDialog itemTypes={itemTypes} defaultTypeName={type} collections={collections} />
      </div>

      <ItemsGrid type={type} items={items} />

      <Pagination page={page} totalPages={totalPages} basePath={`/items/${type}`} />
    </div>
  )
}
