import type { LucideIcon } from 'lucide-react'
import { ICON_MAP } from '@/lib/item-types'

interface CollectionItemForUtils {
  itemType: { id: string; icon: string; color: string }
}

export function getCollectionTypeIcons(
  items: CollectionItemForUtils[]
): { id: string; icon: LucideIcon; color: string }[] {
  const typeCounts: Record<string, { count: number; color: string }> = {}
  for (const { itemType } of items) {
    if (!typeCounts[itemType.id]) {
      typeCounts[itemType.id] = { count: 0, color: itemType.color }
    }
    typeCounts[itemType.id].count++
  }
  return Object.entries(typeCounts)
    .sort(([, a], [, b]) => b.count - a.count)
    .map(([id, { color }]) => {
      const iconName = items.find(({ itemType }) => itemType.id === id)!.itemType.icon
      return { id, icon: ICON_MAP[iconName] ?? ICON_MAP['Code'], color }
    })
}

/**
 * Returns the hex color of the most-used item type in a collection's items.
 * Accepts the minimal shape needed — just an array of itemType objects.
 */
export function getDominantTypeColor(
  itemTypes: { id: string; color: string }[]
): string {
  const counts: Record<string, { count: number; color: string }> = {}
  for (const { id, color } of itemTypes) {
    if (!counts[id]) counts[id] = { count: 0, color }
    counts[id].count++
  }
  return Object.values(counts).sort((a, b) => b.count - a.count)[0]?.color ?? '#6b7280'
}
