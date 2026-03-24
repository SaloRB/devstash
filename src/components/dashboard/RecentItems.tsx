import { mockItems } from "@/lib/mock-data";
import ItemRow from "./ItemRow";

export default function RecentItems() {
  const recentItems = [...mockItems]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 10);

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Recent Items</h2>
      </div>
      <div className="flex flex-col gap-2">
        {recentItems.map((item) => (
          <ItemRow
            key={item.id}
            title={item.title}
            description={item.description}
            itemTypeId={item.itemTypeId}
            isFavorite={item.isFavorite}
            isPinned={item.isPinned}
            tags={item.tags}
            createdAt={item.createdAt}
          />
        ))}
      </div>
    </section>
  );
}
