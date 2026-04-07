'use client'

import { useState } from 'react'
import { Plus, FolderPlus } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import CreateItemDialog from '@/components/shared/CreateItemDialog'
import CreateCollectionDialog from '@/components/shared/CreateCollectionDialog'
import type { ItemTypeWithCount } from '@/lib/db/items'
import type { UserCollection } from '@/lib/db/collections'

export default function TopBarCreateMenu({
  itemTypes,
  collections,
  isPro,
}: {
  itemTypes: ItemTypeWithCount[]
  collections: UserCollection[]
  isPro?: boolean
}) {
  const [itemOpen, setItemOpen] = useState(false)
  const [collectionOpen, setCollectionOpen] = useState(false)

  return (
    <>
      {/* Mobile: + icon dropdown (below md) */}
      <div className="flex md:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button size="icon" aria-label="Create new">
                <Plus className="size-4" />
              </Button>
            }
          />
          <DropdownMenuContent align="end" alignOffset={-8} className="whitespace-nowrap">
            <DropdownMenuItem onClick={() => setItemOpen(true)}>
              <Plus className="size-4" />
              New Item
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setCollectionOpen(true)}>
              <FolderPlus className="size-4" />
              New Collection
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Desktop: separate buttons (md+) */}
      <div className="hidden md:flex items-center gap-2">
        <CreateCollectionDialog />
        <CreateItemDialog itemTypes={itemTypes} collections={collections} isPro={isPro} />
      </div>

      {/* Controlled dialogs for mobile dropdown */}
      <CreateItemDialog
        itemTypes={itemTypes}
        collections={collections}
        isPro={isPro}
        open={itemOpen}
        onOpenChange={setItemOpen}
      />
      <CreateCollectionDialog
        open={collectionOpen}
        onOpenChange={setCollectionOpen}
      />
    </>
  )
}
