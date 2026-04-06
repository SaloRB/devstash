'use client'

import { Search } from 'lucide-react'
import { useSearch } from '@/contexts/search-context'

export function SearchTrigger() {
  const { setOpen } = useSearch()

  return (
    <>
      {/* Icon-only button on mobile */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Search"
        className="flex sm:hidden size-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
      >
        <Search className="size-4" />
      </button>

      {/* Full search bar on sm+ */}
      <button
        onClick={() => setOpen(true)}
        className="hidden sm:flex h-9 w-full max-w-sm items-center gap-2 rounded-md border border-input bg-background px-3 text-sm text-muted-foreground shadow-sm transition-colors hover:bg-accent"
      >
        <Search className="size-4 shrink-0" />
        <span className="flex-1 text-left">Search items...</span>
        <span className="pointer-events-none flex items-center gap-1">
          <kbd className="inline-flex h-6 select-none items-center rounded border border-border bg-muted px-2 font-sans text-xs font-medium text-muted-foreground">
            ⌘K
          </kbd>
        </span>
      </button>
    </>
  )
}
