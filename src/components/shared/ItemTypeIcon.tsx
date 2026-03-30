'use client'

import { ICON_MAP } from '@/lib/item-types'

interface ItemTypeIconProps {
  icon: string
  color: string
}

export function ItemTypeIcon({ icon, color }: ItemTypeIconProps) {
  const Icon = ICON_MAP[icon] ?? ICON_MAP['Code']
  return (
    <span
      className="inline-flex size-7 items-center justify-center rounded-full"
      style={{ backgroundColor: `${color}25` }}
    >
      <Icon className="size-4" style={{ color }} />
    </span>
  )
}
