import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { getProfileUser } from '@/lib/db/profile'
import { ChangePasswordForm } from '@/components/settings/ChangePasswordForm'
import { DeleteAccountButton } from '@/components/settings/DeleteAccountButton'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
export default async function SettingsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/sign-in')

  const user = await getProfileUser(session.user.id)
  if (!user) redirect('/sign-in')

  const isEmailUser = !user.accounts.some((a) => a.provider === 'github')

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account settings</p>
      </div>

      {/* Account */}
      {isEmailUser && (
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Manage your password</CardDescription>
          </CardHeader>
          <CardContent>
            <ChangePasswordForm />
          </CardContent>
        </Card>
      )}

      {/* Danger Zone */}
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
