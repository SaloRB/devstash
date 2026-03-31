'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FolderOpen } from 'lucide-react'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { useSearch } from '@/contexts/search-context'
import { useItemDrawer } from '@/contexts/item-drawer-context'
import { ItemTypeIcon } from '@/components/shared/ItemTypeIcon'

export default function CommandPalette() {
  const { open, setOpen, items, collections } = useSearch()
  const { openDrawer } = useItemDrawer()
  const router = useRouter()

  useEffect(() => {
    function down(e: KeyboardEvent) {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen(true)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [setOpen])

  function handleSelectItem(id: string) {
    setOpen(false)
    openDrawer(id)
  }

  function handleSelectCollection(id: string) {
    setOpen(false)
    router.push(`/collections/${id}`)
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Search"
      description="Search items and collections"
    >
      <Command>
        <CommandInput placeholder="Search items and collections..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {items.length > 0 && (
            <CommandGroup heading="Items">
              {items.map((item) => (
                <CommandItem
                  key={item.id}
                  value={`${item.title} ${item.itemType.name}`}
                  onSelect={() => handleSelectItem(item.id)}
                  className="items-start gap-2"
                >
                  <ItemTypeIcon
                    icon={item.itemType.icon}
                    color={item.itemType.color}
                  />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate">{item.title}</span>
                    {item.description && (
                      <span className="truncate text-xs text-muted-foreground">
                        {item.description}
                      </span>
                    )}
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground capitalize">
                    {item.itemType.name}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          {items.length > 0 && collections.length > 0 && <CommandSeparator />}
          {collections.length > 0 && (
            <CommandGroup heading="Collections">
              {collections.map((col) => (
                <CommandItem
                  key={col.id}
                  value={col.name}
                  onSelect={() => handleSelectCollection(col.id)}
                >
                  <FolderOpen className="size-4 text-muted-foreground" />
                  <span className="flex-1">{col.name}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {col._count.items} items
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </Command>
    </CommandDialog>
  )
}
