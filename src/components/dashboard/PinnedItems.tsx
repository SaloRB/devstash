import { Pin } from "lucide-react";
import { getPinnedItems, type ItemWithType } from "@/lib/db/items";
import ItemRow from "./ItemRow";

export default async function PinnedItems() {
  const pinnedItems = await getPinnedItems();

  if (pinnedItems.length === 0) return null;

  return (
    <section>
      <div className="mb-4 flex items-center gap-2">
        <Pin className="size-4 text-muted-foreground" />
        <h2 className="text-lg font-semibold">Pinned</h2>
      </div>
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
    </section>
  );
}
