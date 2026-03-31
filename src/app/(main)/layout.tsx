import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import AppSidebar from '@/components/dashboard/AppSidebar'
import TopBar from '@/components/layout/TopBar'
import { ItemDrawerProvider } from '@/contexts/item-drawer-context'
import ItemDrawer from '@/components/shared/ItemDrawer'
import { SearchProvider } from '@/contexts/search-context'
import CommandPalette from '@/components/shared/CommandPalette'
import { auth } from '@/auth'
import { getUserCollections } from '@/lib/db/collections'
import { getSearchData } from '@/lib/db/search'

export default async function MainLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth()
  const [collections, searchData] = session?.user?.id
    ? await Promise.all([
        getUserCollections(session.user.id),
        getSearchData(session.user.id),
      ])
    : [[], { items: [], collections: [] }]

  return (
    <ItemDrawerProvider>
      <SearchProvider items={searchData.items} collections={searchData.collections}>
        <SidebarProvider
          style={{ '--topbar-height': '57px' } as React.CSSProperties}
        >
          <AppSidebar />
          <SidebarInset>
            <TopBar />
            <main className="mt-(--topbar-height) flex-1 overflow-y-auto p-6">
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
        <CommandPalette />
      </SearchProvider>
      <ItemDrawer collections={collections} />
    </ItemDrawerProvider>
  )
}
