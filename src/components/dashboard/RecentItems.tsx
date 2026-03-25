import { getRecentItems, type ItemWithType } from "@/lib/db/items";
import ItemRow from "./ItemRow";

export default async function RecentItems() {
  const recentItems = await getRecentItems();

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Recent Items</h2>
      </div>
      <div className="flex flex-col gap-2">
        {recentItems.map((item: ItemWithType) => (
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
