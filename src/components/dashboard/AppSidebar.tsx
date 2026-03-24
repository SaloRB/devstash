"use client";

import Link from "next/link";
import {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link as LinkIcon,
  Star,
  FolderOpen,
  Settings,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  mockItemTypes,
  mockItemTypeCounts,
  mockCollections,
  mockUser,
} from "@/lib/mock-data";

const ICON_MAP: Record<string, LucideIcon> = {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link: LinkIcon,
};

export default function AppSidebar() {
  const favoriteCollections = mockCollections.filter((c) => c.isFavorite);
  const allCollections = mockCollections.filter((c) => !c.isFavorite);

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <Collapsible defaultOpen className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel render={<CollapsibleTrigger />}>
              Types
              <ChevronRight className="ml-auto transition-transform group-data-open/collapsible:rotate-90" />
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarMenu>
                {mockItemTypes.map((type) => {
                  const Icon = ICON_MAP[type.icon] ?? Code;
                  const count =
                    mockItemTypeCounts[
                      type.name as keyof typeof mockItemTypeCounts
                    ] ?? 0;
                  return (
                    <SidebarMenuItem key={type.id}>
                      <SidebarMenuButton
                        render={<Link href={`/items/${type.name}`} />}
                        tooltip={`${type.name[0].toUpperCase()}${type.name.slice(1)}s`}
                      >
                        <Icon style={{ color: type.color }} />
                        <span className="capitalize">{type.name}s</span>
                      </SidebarMenuButton>
                      <SidebarMenuBadge>{count}</SidebarMenuBadge>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

        <SidebarSeparator className="group-data-[collapsible=icon]:hidden" />

        <Collapsible defaultOpen className="group/collapsible group-data-[collapsible=icon]:hidden">
          <SidebarGroup>
            <SidebarGroupLabel render={<CollapsibleTrigger />}>
              Collections
              <ChevronRight className="ml-auto transition-transform group-data-open/collapsible:rotate-90" />
            </SidebarGroupLabel>
            <CollapsibleContent>
              {favoriteCollections.length > 0 && (
                <>
                  <p className="px-2 pt-1 pb-1 text-[0.65rem] font-medium uppercase tracking-wider text-sidebar-foreground/40">
                    Favorites
                  </p>
                  <SidebarMenu>
                    {favoriteCollections.map((col) => (
                      <SidebarMenuItem key={col.id}>
                        <SidebarMenuButton
                          render={<Link href={`/collections/${col.id}`} />}
                          tooltip={col.name}
                        >
                          <Star className="fill-yellow-500 text-yellow-500" />
                          <span>{col.name}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </>
              )}

              {allCollections.length > 0 && (
                <>
                  <p className="px-2 pt-3 pb-1 text-[0.65rem] font-medium uppercase tracking-wider text-sidebar-foreground/40">
                    All Collections
                  </p>
                  <SidebarMenu>
                    {allCollections.map((col) => (
                      <SidebarMenuItem key={col.id}>
                        <SidebarMenuButton
                          render={<Link href={`/collections/${col.id}`} />}
                          tooltip={col.name}
                        >
                          <FolderOpen className="text-muted-foreground" />
                          <span>{col.name}</span>
                        </SidebarMenuButton>
                        <SidebarMenuBadge>{col.itemCount}</SidebarMenuBadge>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </>
              )}
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
      </SidebarContent>

      <SidebarSeparator />

      <SidebarFooter>
        <div className="flex items-center gap-2.5">
          <Avatar size="sm">
            <AvatarFallback>
              {mockUser.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
            <p className="truncate text-sm font-medium">{mockUser.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {mockUser.email}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon-xs"
            className="group-data-[collapsible=icon]:hidden"
          >
            <Settings className="size-4 text-muted-foreground" />
          </Button>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
