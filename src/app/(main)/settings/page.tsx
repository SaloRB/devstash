import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { getProfileUser, getProfileStats } from '@/lib/db/profile'
import { stripe } from '@/lib/clients/stripe'
import { ChangePasswordForm } from '@/components/settings/ChangePasswordForm'
import { DeleteAccountButton } from '@/components/settings/DeleteAccountButton'
import { EditorPreferencesForm } from '@/components/settings/EditorPreferencesForm'
import { BillingSection } from '@/components/settings/BillingSection'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface SettingsPageProps {
  searchParams: Promise<{ checkout?: string }>
}

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const session = await auth()
  if (!session?.user?.id) redirect('/sign-in')

  const [user, stats] = await Promise.all([
    getProfileUser(session.user.id),
    getProfileStats(session.user.id),
  ])
  if (!user) redirect('/sign-in')

  const { checkout } = await searchParams
  const isEmailUser = !user.accounts.some((a) => a.provider === 'github')

  let planInterval: 'month' | 'year' | null = null
  if (session.user.isPro && user.stripeSubscriptionId) {
    try {
      const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId)
      const price = subscription.items.data[0]?.price
      planInterval = (price?.recurring?.interval as 'month' | 'year') ?? null
    } catch {
      // Non-fatal
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account settings</p>
      </div>

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

      <Card>
        <CardHeader>
          <CardTitle>Editor</CardTitle>
          <CardDescription>Customize your code editor appearance</CardDescription>
        </CardHeader>
        <CardContent>
          <EditorPreferencesForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Billing</CardTitle>
          <CardDescription>Manage your plan and subscription</CardDescription>
        </CardHeader>
        <CardContent>
          <BillingSection
            isPro={session.user.isPro ?? false}
            planInterval={planInterval}
            itemCount={stats.totalItems}
            collectionCount={stats.totalCollections}
            checkoutStatus={checkout ?? null}
          />
        </CardContent>
      </Card>

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
