'use client'

import { createContext, useContext, useState } from 'react'

type FavoritesMap = Record<string, boolean>

interface FavoritesContextValue {
  overrides: FavoritesMap
  setFavorite: (id: string, value: boolean) => void
}

const FavoritesContext = createContext<FavoritesContextValue>({
  overrides: {},
  setFavorite: () => {},
})

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [overrides, setOverrides] = useState<FavoritesMap>({})

  function setFavorite(id: string, value: boolean) {
    setOverrides((prev) => ({ ...prev, [id]: value }))
  }

  return (
    <FavoritesContext.Provider value={{ overrides, setFavorite }}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  return useContext(FavoritesContext)
}
