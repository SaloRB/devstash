'use client'

import { toast } from 'sonner'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useEditorPreferences } from '@/contexts/editor-preferences-context'
import { updateEditorPreferences } from '@/actions/editor-preferences'
import { FONT_SIZE_OPTIONS, TAB_SIZE_OPTIONS, THEME_OPTIONS } from '@/constants'
import type { EditorPreferences } from '@/types/editor'

export function EditorPreferencesForm() {
  const { prefs, setPrefs } = useEditorPreferences()

  async function save(next: EditorPreferences) {
    setPrefs(next)
    const result = await updateEditorPreferences(next)
    if (result.success) {
      toast.success('Editor preferences saved')
    } else {
      toast.error(result.error ?? 'Failed to save')
    }
  }

  return (
    <div className="space-y-6">
      {/* Theme */}
      <div className="flex items-center justify-between">
        <Label htmlFor="theme">Theme</Label>
        <Select
          value={prefs.theme}
          onValueChange={(v) =>
            save({ ...prefs, theme: v as EditorPreferences['theme'] })
          }
        >
          <SelectTrigger id="theme" className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {THEME_OPTIONS.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Font size */}
      <div className="flex items-center justify-between">
        <Label htmlFor="font-size">Font size</Label>
        <Select
          value={String(prefs.fontSize)}
          onValueChange={(v) => save({ ...prefs, fontSize: Number(v) })}
        >
          <SelectTrigger id="font-size" className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FONT_SIZE_OPTIONS.map((s) => (
              <SelectItem key={s} value={String(s)}>
                {s}px
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tab size */}
      <div className="flex items-center justify-between">
        <Label htmlFor="tab-size">Tab size</Label>
        <Select
          value={String(prefs.tabSize)}
          onValueChange={(v) => save({ ...prefs, tabSize: Number(v) })}
        >
          <SelectTrigger id="tab-size" className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TAB_SIZE_OPTIONS.map((s) => (
              <SelectItem key={s} value={String(s)}>
                {s} spaces
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Word wrap */}
      <div className="flex items-center justify-between">
        <Label htmlFor="word-wrap">Word wrap</Label>
        <Switch
          id="word-wrap"
          checked={prefs.wordWrap}
          onCheckedChange={(v) => save({ ...prefs, wordWrap: v })}
        />
      </div>

      {/* Minimap */}
      <div className="flex items-center justify-between">
        <Label htmlFor="minimap">Minimap</Label>
        <Switch
          id="minimap"
          checked={prefs.minimap}
          onCheckedChange={(v) => save({ ...prefs, minimap: v })}
        />
      </div>
    </div>
  )
}
