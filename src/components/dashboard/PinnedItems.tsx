import { Pin } from "lucide-react";
import { mockItems } from "@/lib/mock-data";
import ItemRow from "./ItemRow";

export default function PinnedItems() {
  const pinnedItems = mockItems.filter((item) => item.isPinned);

  if (pinnedItems.length === 0) return null;

  return (
    <section>
      <div className="mb-4 flex items-center gap-2">
        <Pin className="size-4 text-muted-foreground" />
        <h2 className="text-lg font-semibold">Pinned</h2>
      </div>
      <div className="flex flex-col gap-2">
        {pinnedItems.map((item) => (
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
