import { Pin } from "lucide-react";
import { getPinnedItems, type ItemWithType } from "@/lib/db/items";
import ItemRow from "./ItemRow";
import EmptyState from "@/components/shared/EmptyState";

export default async function PinnedItems() {
  const pinnedItems = await getPinnedItems();

  return (
    <section>
      <div className="mb-4 flex items-center gap-2">
        <Pin className="size-4 text-muted-foreground" />
        <h2 className="text-lg font-semibold">Pinned</h2>
      </div>
      {pinnedItems.length === 0 ? (
        <EmptyState
          icon={Pin}
          title="No pinned items"
          description="Pin items to keep them easy to find."
        />
      ) : (
        <div className="flex flex-col gap-2">
          {pinnedItems.map((item: ItemWithType) => (
            <ItemRow
              key={item.id}
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
    </section>
  );
}
