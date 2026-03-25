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
