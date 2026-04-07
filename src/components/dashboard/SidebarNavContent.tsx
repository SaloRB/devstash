'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Star } from 'lucide-react'
import {
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { Badge } from '@/components/ui/badge'
import { ICON_MAP } from '@/lib/item-types'
import { getDominantTypeColor } from '@/lib/collection-utils'
import type { ItemTypeWithCount } from '@/lib/db/items'
import type { getSidebarCollections } from '@/lib/db/collections'

type SidebarCollection = Awaited<ReturnType<typeof getSidebarCollections>>[number]

interface Props {
  itemTypes: ItemTypeWithCount[]
  collections: SidebarCollection[]
}

export function SidebarTypeItems({ itemTypes }: { itemTypes: ItemTypeWithCount[] }) {
  const pathname = usePathname()

  return (
    <SidebarMenu>
      {itemTypes.map((type) => {
        const Icon = ICON_MAP[type.icon] ?? ICON_MAP['Code']
        const isActive = pathname === `/items/${type.name}`
        return (
          <SidebarMenuItem key={type.id}>
            <SidebarMenuButton
              render={<Link href={`/items/${type.name}`} />}
              tooltip={`${type.name[0].toUpperCase()}${type.name.slice(1)}s`}
              isActive={isActive}
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
  )
}

export function SidebarCollectionItems({ collections }: { collections: SidebarCollection[] }) {
  const pathname = usePathname()
  const favorites = collections.filter((c) => c.isFavorite)
  const recents = collections.filter((c) => !c.isFavorite)

  return (
    <>
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
                  isActive={pathname === `/collections/${col.id}`}
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
                    isActive={pathname === `/collections/${col.id}`}
                  >
                    <span
                      className="size-3.5 rounded-full shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <span>{col.name}</span>
                  </SidebarMenuButton>
                  <SidebarMenuBadge>{col._count.items}</SidebarMenuBadge>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </>
      )}

      <SidebarMenu className="pt-2">
        <SidebarMenuItem>
          <SidebarMenuButton
            render={<Link href="/collections" />}
            isActive={pathname === '/collections'}
          >
            <span className="text-[0.7rem] uppercase tracking-wider">View all collections</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </>
  )
}
