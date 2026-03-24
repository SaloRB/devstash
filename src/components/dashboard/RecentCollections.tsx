import Link from "next/link";
import { mockCollections, mockItems } from "@/lib/mock-data";
import CollectionCard from "./CollectionCard";

export default function RecentCollections() {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Collections</h2>
        <Link
          href="/collections"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          View all
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {mockCollections.map((col) => {
          const collectionItems = mockItems.filter(
            (item) => item.collectionId === col.id
          );
          return (
            <CollectionCard
              key={col.id}
              name={col.name}
              description={col.description}
              itemCount={col.itemCount}
              isFavorite={col.isFavorite}
              items={collectionItems}
            />
          );
        })}
      </div>
    </section>
  );
}
