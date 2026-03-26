import Link from 'next/link'
import { Star, ChevronRight } from 'lucide-react'
import { auth } from '@/auth'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
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
} from '@/components/ui/sidebar'
import { Badge } from '@/components/ui/badge'
import { SidebarUserMenu } from '@/components/dashboard/SidebarUserMenuClient'
import { ICON_MAP } from '@/lib/item-types'
import { getItemTypesWithCounts } from '@/lib/db/items'
import { getSidebarCollections } from '@/lib/db/collections'
import { getDominantTypeColor } from '@/lib/collection-utils'

export default async function AppSidebar() {
  const session = await auth()
  const userId = session!.user!.id!
  const [itemTypes, collections] = await Promise.all([
    getItemTypesWithCounts(userId),
    getSidebarCollections(userId),
  ])

  const favorites = collections.filter((c) => c.isFavorite)
  const recents = collections.filter((c) => !c.isFavorite)

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <Collapsible defaultOpen className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel render={<CollapsibleTrigger />}>
              TYPES
              <ChevronRight className="ml-auto transition-transform group-data-open/collapsible:rotate-90" />
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarMenu>
                {itemTypes.map((type) => {
                  const Icon = ICON_MAP[type.icon] ?? ICON_MAP['Code']
                  return (
                    <SidebarMenuItem key={type.id}>
                      <SidebarMenuButton
                        render={<Link href={`/items/${type.name}`} />}
                        tooltip={`${type.name[0].toUpperCase()}${type.name.slice(1)}s`}
                      >
                        <Icon style={{ color: type.color }} />
                        <span className="capitalize">{type.name}s</span>
                        {(type.name === 'file' || type.name === 'image') && (
                          <Badge variant="secondary" className="text-[0.6rem] px-1 py-0 h-4 font-medium">
                            PRO
                          </Badge>
                        )}
                      </SidebarMenuButton>
                      <SidebarMenuBadge>{type._count.items}</SidebarMenuBadge>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

        <SidebarSeparator className="group-data-[collapsible=icon]:hidden" />

        <Collapsible
          defaultOpen
          className="group/collapsible group-data-[collapsible=icon]:hidden"
        >
          <SidebarGroup>
            <SidebarGroupLabel render={<CollapsibleTrigger />}>
              COLLECTIONS
              <ChevronRight className="ml-auto transition-transform group-data-open/collapsible:rotate-90" />
            </SidebarGroupLabel>
            <CollapsibleContent>
              {favorites.length > 0 && (
                <>
                  <p className="px-2 pt-1 pb-1 text-[0.65rem] font-medium uppercase tracking-wider text-sidebar-foreground/40">
                    Favorites
                  </p>
                  <SidebarMenu>
                    {favorites.map((col) => (
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

              {recents.length > 0 && (
                <>
                  <p className="px-2 pt-3 pb-1 text-[0.65rem] font-medium uppercase tracking-wider text-sidebar-foreground/40">
                    Recent
                  </p>
                  <SidebarMenu>
                    {recents.map((col) => {
                      const color = getDominantTypeColor(col.items.map(({ item }) => item.itemType))
                      return (
                        <SidebarMenuItem key={col.id}>
                          <SidebarMenuButton
                            render={<Link href={`/collections/${col.id}`} />}
                            tooltip={col.name}
                          >
                            <span
                              className="size-3.5 rounded-full shrink-0"
                              style={{ backgroundColor: color }}
                            />
                            <span>{col.name}</span>
                          </SidebarMenuButton>
                          <SidebarMenuBadge>
                            {col._count.items}
                          </SidebarMenuBadge>
                        </SidebarMenuItem>
                      )
                    })}
                  </SidebarMenu>
                </>
              )}

              <div className="px-2 pt-3">
                <Link
                  href="/collections"
                  className="text-[0.7rem] text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors"
                >
                  VIEW ALL COLLECTIONS
                </Link>
              </div>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
      </SidebarContent>

      <SidebarSeparator />

      <SidebarFooter>
        <SidebarUserMenu
          name={session?.user?.name}
          email={session?.user?.email}
          image={session?.user?.image}
        />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
