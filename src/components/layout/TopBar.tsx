import Link from "next/link";
import { Star, Zap } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { auth } from "@/auth";
import { getItemTypesWithCounts } from "@/lib/db/items";
import { getUserCollections } from "@/lib/db/collections";
import TopBarCreateMenu from "@/components/layout/TopBarCreateMenu";
import { SearchTrigger } from "@/components/layout/SearchTrigger";

export default async function TopBar() {
  const session = await auth();
  const [itemTypes, collections] = session?.user?.id
    ? await Promise.all([
        getItemTypesWithCounts(session.user.id),
        getUserCollections(session.user.id),
      ])
    : [[], []];

  return (
    <header className="fixed top-0 left-0 right-0 z-20 flex h-(--topbar-height,57px) items-center gap-3 border-b border-border bg-background px-4 py-3">
      <div className="flex shrink-0 items-center gap-3">
        <SidebarTrigger />
        <Link href="/dashboard" className="flex items-center gap-2 text-lg font-semibold">
          <Zap className="w-5 h-5 text-primary" />
          <span className="hidden sm:inline">DevStash</span>
        </Link>
      </div>

      <div className="flex flex-1 justify-center">
        <SearchTrigger />
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {!session?.user?.isPro && (
          <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/upgrade" />}>
            Upgrade
          </Button>
        )}
        <Link
          href="/favorites"
          className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          title="Favorites"
        >
          <Star className="size-4" />
        </Link>
        <TopBarCreateMenu itemTypes={itemTypes} collections={collections} />
      </div>
    </header>
  );
}
