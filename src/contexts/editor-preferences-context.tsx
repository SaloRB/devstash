'use client'

import { createContext, useContext, useState } from 'react'
import type { EditorPreferences } from '@/lib/editor-preferences'

interface EditorPreferencesContextValue {
  prefs: EditorPreferences
  setPrefs: (prefs: EditorPreferences) => void
}

const EditorPreferencesContext =
  createContext<EditorPreferencesContextValue | null>(null)

export function useEditorPreferences() {
  const ctx = useContext(EditorPreferencesContext)
  if (!ctx)
    throw new Error(
      'useEditorPreferences must be used within EditorPreferencesProvider'
    )
  return ctx
}

export function EditorPreferencesProvider({
  children,
  initialPrefs,
}: {
  children: React.ReactNode
  initialPrefs: EditorPreferences
}) {
  const [prefs, setPrefs] = useState<EditorPreferences>(initialPrefs)

  return (
    <EditorPreferencesContext.Provider value={{ prefs, setPrefs }}>
      {children}
    </EditorPreferencesContext.Provider>
  )
}
