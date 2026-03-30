import { Suspense } from "react";
import StatsCards from "@/components/dashboard/StatsCards";
import RecentCollections from "@/components/dashboard/RecentCollections";
import PinnedItems from "@/components/dashboard/PinnedItems";
import RecentItems from "@/components/dashboard/RecentItems";
import {
  StatsCardsSkeleton,
  RecentCollectionsSkeleton,
  PinnedItemsSkeleton,
  RecentItemsSkeleton,
} from "@/components/dashboard/skeletons";

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8 lg:px-8 xl:px-12">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Your developer knowledge hub
        </p>
      </div>

      <Suspense fallback={<StatsCardsSkeleton />}>
        <StatsCards />
      </Suspense>

      <Suspense fallback={<RecentCollectionsSkeleton />}>
        <RecentCollections />
      </Suspense>

      <Suspense fallback={<PinnedItemsSkeleton />}>
        <PinnedItems />
      </Suspense>

      <Suspense fallback={<RecentItemsSkeleton />}>
        <RecentItems />
      </Suspense>
    </div>
  );
}
