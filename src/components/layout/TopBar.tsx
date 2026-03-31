import { Search } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { auth } from "@/auth";
import { getItemTypesWithCounts } from "@/lib/db/items";
import { getUserCollections } from "@/lib/db/collections";
import CreateItemDialog from "@/components/shared/CreateItemDialog";
import CreateCollectionDialog from "@/components/shared/CreateCollectionDialog";

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
      <SidebarTrigger />
      <Link href="/dashboard" className="flex items-center gap-2 text-lg font-semibold">
        <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground text-sm">
          S
        </div>
        DevStash
      </Link>

      <div className="relative ml-4 flex-1 max-w-md">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search items..." className="pl-9" />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <CreateCollectionDialog />
        <CreateItemDialog itemTypes={itemTypes} collections={collections} />
      </div>
    </header>
  );
}
