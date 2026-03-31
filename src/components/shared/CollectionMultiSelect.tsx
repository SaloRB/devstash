'use client'

import { useState } from 'react'
import { Check, ChevronsUpDown, FolderOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import type { UserCollection } from '@/lib/db/collections'

interface CollectionMultiSelectProps {
  collections: UserCollection[]
  value: string[]
  onChange: (ids: string[]) => void
}

export function CollectionMultiSelect({
  collections,
  value,
  onChange,
}: CollectionMultiSelectProps) {
  const [open, setOpen] = useState(false)

  function toggle(id: string) {
    onChange(
      value.includes(id) ? value.filter((v) => v !== id) : [...value, id],
    )
  }

  const selectedNames = collections
    .filter((c) => value.includes(c.id))
    .map((c) => c.name)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal"
          />
        }
      >
        {selectedNames.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {selectedNames.map((name) => (
              <Badge key={name} variant="secondary" className="text-xs">
                {name}
              </Badge>
            ))}
          </div>
        ) : (
          <span className="text-muted-foreground flex items-center gap-1.5">
            <FolderOpen className="size-4" />
            Select collections...
          </span>
        )}
        <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Search collections..." />
          <CommandList>
            <CommandEmpty>No collections found.</CommandEmpty>
            <CommandGroup>
              {collections.map((c) => (
                <CommandItem
                  key={c.id}
                  value={c.name}
                  onSelect={() => toggle(c.id)}
                >
                  <Check
                    className={`mr-2 size-4 ${value.includes(c.id) ? 'opacity-100' : 'opacity-0'}`}
                  />
                  <FolderOpen className="mr-1.5 size-4 text-muted-foreground" />
                  {c.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
