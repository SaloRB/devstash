import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { getProfileUser, getProfileStats } from '@/lib/db/profile'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { ChangePasswordForm } from '@/components/profile/ChangePasswordForm'
import { DeleteAccountButton } from '@/components/profile/DeleteAccountButton'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Code, Sparkles, Terminal, StickyNote, File, Image, Link, LucideIcon,
} from 'lucide-react'

const ICON_MAP: Record<string, LucideIcon> = {
  Code, Sparkles, Terminal, StickyNote, File, Image, Link,
}

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/sign-in')

  const [user, stats] = await Promise.all([
    getProfileUser(session.user.id),
    getProfileStats(session.user.id),
  ])

  if (!user) redirect('/sign-in')

  const isEmailUser = !user.accounts.some((a) => a.provider === 'github')

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-sm text-muted-foreground">Your account details and settings</p>
      </div>

      {/* User Info */}
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <UserAvatar name={user.name} image={user.image} size="lg" />
              <div>
                {user.name && <p className="font-medium">{user.name}</p>}
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
            {isEmailUser && <ChangePasswordForm />}
          </div>
          <Separator />
          <p className="text-sm text-muted-foreground">
            Member since{' '}
            {new Intl.DateTimeFormat('en-US', { dateStyle: 'long' }).format(user.createdAt)}
          </p>
        </CardContent>
      </Card>

      {/* Usage Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Usage</CardTitle>
          <CardDescription>Your content at a glance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border p-4 text-center">
              <p className="text-2xl font-bold">{stats.totalItems}</p>
              <p className="text-sm text-muted-foreground">Total items</p>
            </div>
            <div className="rounded-lg border p-4 text-center">
              <p className="text-2xl font-bold">{stats.totalCollections}</p>
              <p className="text-sm text-muted-foreground">Collections</p>
            </div>
          </div>
          <Separator />
          <div className="space-y-3">
            {stats.itemTypeCounts.map((type) => {
              const Icon = ICON_MAP[type.icon]
              const count = type._count.items
              const pct = stats.totalItems > 0 ? Math.round((count / stats.totalItems) * 100) : 0
              return (
                <div key={type.id} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      {Icon && (
                        <Icon className="size-3.5" style={{ color: type.color }} />
                      )}
                      <span className="capitalize">{type.name}</span>
                    </div>
                    <span className="tabular-nums text-muted-foreground">{count}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: type.color }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Danger zone</CardTitle>
          <CardDescription>Irreversible account actions</CardDescription>
        </CardHeader>
        <CardContent>
          <DeleteAccountButton />
        </CardContent>
      </Card>
    </div>
  )
}
