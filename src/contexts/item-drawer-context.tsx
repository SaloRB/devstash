'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import type { ItemDetail } from '@/lib/db/items'

interface ItemDrawerContextValue {
  selectedId: string | null
  isOpen: boolean
  item: ItemDetail | null
  loading: boolean
  openDrawer: (id: string) => void
  closeDrawer: () => void
}

const ItemDrawerContext = createContext<ItemDrawerContextValue | null>(null)

export function useItemDrawer() {
  const ctx = useContext(ItemDrawerContext)
  if (!ctx) throw new Error('useItemDrawer must be used within ItemDrawerProvider')
  return ctx
}

export function ItemDrawerProvider({ children }: { children: React.ReactNode }) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [item, setItem] = useState<ItemDetail | null>(null)

  useEffect(() => {
    if (!selectedId || !isOpen) return
    let cancelled = false
    fetch(`/api/items/${selectedId}`)
      .then((r) => r.json())
      .then((data: ItemDetail) => { if (!cancelled) setItem(data) })
    return () => { cancelled = true }
  }, [selectedId, isOpen])

  const loading = isOpen && !!selectedId && item?.id !== selectedId

  function openDrawer(id: string) {
    setSelectedId(id)
    setIsOpen(true)
  }

  function closeDrawer() {
    setIsOpen(false)
  }

  return (
    <ItemDrawerContext.Provider value={{ selectedId, isOpen, item, loading, openDrawer, closeDrawer }}>
      {children}
    </ItemDrawerContext.Provider>
  )
}
