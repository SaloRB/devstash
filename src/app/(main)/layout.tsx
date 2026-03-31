import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import AppSidebar from '@/components/dashboard/AppSidebar'
import TopBar from '@/components/layout/TopBar'
import { ItemDrawerProvider } from '@/contexts/item-drawer-context'
import ItemDrawer from '@/components/shared/ItemDrawer'
import { auth } from '@/auth'
import { getUserCollections } from '@/lib/db/collections'

export default async function MainLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth()
  const collections = session?.user?.id
    ? await getUserCollections(session.user.id)
    : []

  return (
    <ItemDrawerProvider>
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
      <ItemDrawer collections={collections} />
    </ItemDrawerProvider>
  )
}
