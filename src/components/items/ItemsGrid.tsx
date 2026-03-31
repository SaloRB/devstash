import type { getItemsByType } from '@/lib/db/items'
import ItemCard from '@/components/shared/ItemCard'
import ImageCard from '@/components/shared/ImageCard'
import FileListRow from '@/components/shared/FileListRow'
import EmptyState from '@/components/shared/EmptyState'

type GridItem = Awaited<ReturnType<typeof getItemsByType>>['items'][number]

interface ItemsGridProps {
  type: string
  items: GridItem[]
}

export default function ItemsGrid({ type, items }: ItemsGridProps) {
  if (items.length === 0) {
    const label = `${type[0].toUpperCase()}${type.slice(1)}s`
    return (
      <EmptyState
        title={`No ${label.toLowerCase()} yet`}
        description={`Items of type "${type}" will appear here.`}
      />
    )
  }

  if (type === 'file') {
    return (
      <div className="flex flex-col gap-2">
        {items.map((item) => (
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
    )
  }

  return (
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
  )
}
