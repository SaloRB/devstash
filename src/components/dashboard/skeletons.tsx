import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function StatsCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} size="sm">
          <CardContent className="flex items-center gap-3">
            <Skeleton className="size-10 shrink-0 rounded-md" />
            <div className="space-y-1.5">
              <Skeleton className="h-7 w-10" />
              <Skeleton className="h-3 w-24" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function RecentCollectionsSkeleton() {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <Skeleton className="h-6 w-28" />
        <Skeleton className="h-4 w-14" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} size="sm" className="border-l-4">
            <CardHeader>
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-16 mt-1" />
              <Skeleton className="h-3 w-48 mt-1" />
            </CardHeader>
            <CardContent>
              <div className="flex gap-1.5">
                {Array.from({ length: 3 }).map((_, j) => (
                  <Skeleton key={j} className="size-5 rounded-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

function ItemCardSkeleton() {
  return (
    <Card className="min-h-18 border-l-4">
      <CardContent className="flex items-center gap-3">
        <Skeleton className="size-8 shrink-0 rounded-md" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-64" />
          <div className="mt-1.5 flex gap-1.5">
            <Skeleton className="h-4 w-12 rounded-full" />
            <Skeleton className="h-4 w-16 rounded-full" />
          </div>
        </div>
        <Skeleton className="h-3 w-10 self-start" />
      </CardContent>
    </Card>
  );
}

export function PinnedItemsSkeleton() {
  return (
    <section>
      <div className="mb-4 flex items-center gap-2">
        <Skeleton className="size-4" />
        <Skeleton className="h-6 w-16" />
      </div>
      <div className="flex flex-col gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <ItemCardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}

export function RecentItemsSkeleton() {
  return (
    <section>
      <div className="mb-4">
        <Skeleton className="h-6 w-28" />
      </div>
      <div className="flex flex-col gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <ItemCardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}
