import { Search, Plus, FolderPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import AppSidebar from "@/components/dashboard/AppSidebar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex items-center gap-3 border-b border-border px-4 py-3">
          <SidebarTrigger />
          <div className="flex items-center gap-2 text-lg font-semibold">
            <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground text-sm">
              S
            </div>
            DevStash
          </div>

          <div className="relative ml-4 flex-1 max-w-md">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search items..." className="pl-9" />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline">
              <FolderPlus className="size-4" />
              New Collection
            </Button>
            <Button>
              <Plus className="size-4" />
              New Item
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
