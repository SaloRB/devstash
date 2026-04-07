import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { UpgradePricingCards } from '@/components/upgrade/UpgradePricingCards'

export const metadata = { title: 'Upgrade to Pro — DevStash' }

export default async function UpgradePage() {
  const session = await auth()
  if (session?.user?.isPro) redirect('/settings?tab=billing')

  return (
    <div className='max-w-4xl mx-auto py-12'>
      <div className='text-center mb-12'>
        <p className='text-sm text-muted-foreground mb-2'>Simple pricing</p>
        <h1 className='text-3xl md:text-4xl font-bold mb-4'>Upgrade to Pro</h1>
        <p className='text-muted-foreground'>Unlock unlimited items, AI features, file uploads, and more.</p>
      </div>
      <UpgradePricingCards />
    </div>
  )
}
