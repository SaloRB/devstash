import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import AppSidebar from '@/components/dashboard/AppSidebar'
import TopBar from '@/components/layout/TopBar'
import { ItemDrawerProvider } from '@/contexts/item-drawer-context'
import { FavoritesProvider } from '@/contexts/favorites-context'
import ItemDrawer from '@/components/shared/ItemDrawer'
import { SearchProvider } from '@/contexts/search-context'
import CommandPalette from '@/components/shared/CommandPalette'
import { EditorPreferencesProvider } from '@/contexts/editor-preferences-context'
import { auth } from '@/auth'
import { getUserCollections } from '@/lib/db/collections'
import { getSearchData } from '@/lib/db/search'
import { getEditorPreferences } from '@/lib/db/profile'
import { DEFAULT_EDITOR_PREFS } from '@/constants'
import type { EditorPreferences } from '@/types/editor'

export default async function MainLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth()
  const [collections, searchData, editorPrefs] = session?.user?.id
    ? await Promise.all([
        getUserCollections(session.user.id),
        getSearchData(session.user.id),
        getEditorPreferences(session.user.id),
      ])
    : [[], { items: [], collections: [] }, DEFAULT_EDITOR_PREFS]

  return (
    <FavoritesProvider>
    <ItemDrawerProvider>
      <SearchProvider items={searchData.items} collections={searchData.collections}>
        <EditorPreferencesProvider initialPrefs={editorPrefs as EditorPreferences}>
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
          <ItemDrawer collections={collections} isPro={session?.user?.isPro ?? false} />
        </EditorPreferencesProvider>
      </SearchProvider>
    </ItemDrawerProvider>
    </FavoritesProvider>
  )
}
