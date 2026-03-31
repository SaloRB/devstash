'use client'

import { createContext, useContext, useState } from 'react'
import type { SearchItem, SearchCollection } from '@/lib/db/search'

interface SearchContextValue {
  open: boolean
  setOpen: (open: boolean) => void
  items: SearchItem[]
  collections: SearchCollection[]
}

const SearchContext = createContext<SearchContextValue | null>(null)

export function useSearch() {
  const ctx = useContext(SearchContext)
  if (!ctx) throw new Error('useSearch must be used within SearchProvider')
  return ctx
}

export function SearchProvider({
  children,
  items,
  collections,
}: {
  children: React.ReactNode
  items: SearchItem[]
  collections: SearchCollection[]
}) {
  const [open, setOpen] = useState(false)

  return (
    <SearchContext.Provider value={{ open, setOpen, items, collections }}>
      {children}
    </SearchContext.Provider>
  )
}
