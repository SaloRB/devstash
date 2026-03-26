'use client'

import dynamic from 'next/dynamic'

const SidebarUserMenu = dynamic(
  () => import('@/components/dashboard/SidebarUserMenu').then((m) => m.SidebarUserMenu),
  { ssr: false }
)

export { SidebarUserMenu }
