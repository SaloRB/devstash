import { ChevronRight } from 'lucide-react'
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
  SidebarRail,
  SidebarSeparator,
} from '@/components/ui/sidebar'
import { SidebarUserMenu } from '@/components/dashboard/SidebarUserMenuClient'
import { SidebarTypeItems, SidebarCollectionItems } from '@/components/dashboard/SidebarNavContent'
import { getItemTypesWithCounts } from '@/lib/db/items'
import { getSidebarCollections } from '@/lib/db/collections'

export default async function AppSidebar() {
  const session = await auth()
  const userId = session!.user!.id!
  const [itemTypes, collections] = await Promise.all([
    getItemTypesWithCounts(userId),
    getSidebarCollections(userId),
  ])

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
              <SidebarTypeItems itemTypes={itemTypes} />
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
              <SidebarCollectionItems collections={collections} />
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
