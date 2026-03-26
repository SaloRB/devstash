'use client'

import { signOut } from 'next-auth/react'
import Link from 'next/link'
import { LogOut, User } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { UserAvatar } from '@/components/shared/UserAvatar'

interface SidebarUserMenuProps {
  name?: string | null
  email?: string | null
  image?: string | null
}

export function SidebarUserMenu({ name, email, image }: SidebarUserMenuProps) {
  return (
    <div className="flex items-center gap-2.5">
      <DropdownMenu>
        <DropdownMenuTrigger>
          <UserAvatar name={name} image={image} size="sm" />
        </DropdownMenuTrigger>
        <DropdownMenuContent side="top" align="start" className="w-48">
          <DropdownMenuItem>
            <Link href="/profile" className="flex items-center gap-1.5 w-full">
              <User className="size-4" />
              Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => signOut({ callbackUrl: '/sign-in' })}
            variant="destructive"
          >
            <LogOut className="size-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
        <p className="truncate text-sm font-medium">{name ?? 'User'}</p>
        <p className="truncate text-xs text-muted-foreground">{email}</p>
      </div>
    </div>
  )
}
