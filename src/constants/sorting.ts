import type { SortField } from '@/types/items'

export const SORT_FIELDS: { label: string; value: SortField }[] = [
  { label: 'Name', value: 'name' },
  { label: 'Date', value: 'date' },
  { label: 'Type', value: 'type' },
]
