'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

const freeFeatures = [
  'Up to 50 items',
  '3 collections',
  'All item types',
  'Code editor',
  'Markdown support',
]

const proFeatures = [
  'Unlimited items',
  'Unlimited collections',
  'File & image uploads',
  'AI-powered tagging',
  'Semantic search',
  'Priority support',
]

export function UpgradePricingCards() {
  const [isYearly, setIsYearly] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleUpgrade() {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interval: isYearly ? 'yearly' : 'monthly' }),
      })
      const data = await res.json()
      if (data.url) {
        router.push(data.url)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className='flex items-center justify-center gap-3 mb-10'>
        <span className={`text-sm font-medium ${!isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
          Monthly
        </span>
        <Switch checked={isYearly} onCheckedChange={setIsYearly} />
        <span className={`text-sm font-medium ${isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
          Yearly
        </span>
        <span className='text-xs font-semibold px-2 py-0.5 rounded-full bg-green-500/15 text-green-400'>
          Save 25%
        </span>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto'>
        {/* Free */}
        <div className='rounded-xl border border-border/40 bg-card p-8 flex flex-col'>
          <p className='text-sm font-medium text-muted-foreground mb-2'>Free</p>
          <div className='flex items-start gap-1 mb-1'>
            <span className='text-2xl font-bold mt-1'>$</span>
            <span className='text-5xl font-bold'>0</span>
          </div>
          <p className='text-sm text-muted-foreground mb-6'>forever</p>
          <div className='border-t border-border/40 mb-6' />
          <ul className='space-y-3 mb-8 flex-1'>
            {freeFeatures.map((f) => (
              <li key={f} className='flex items-center gap-2 text-sm'>
                <Check className='w-4 h-4 text-primary shrink-0' />
                {f}
              </li>
            ))}
          </ul>
          <Button variant='outline' className='w-full' disabled>
            Current Plan
          </Button>
        </div>

        {/* Pro */}
        <div className='rounded-xl border border-primary/40 bg-card p-8 flex flex-col relative ring-1 ring-primary/30'>
          <span className='absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-semibold px-3 py-1 rounded-full bg-primary text-primary-foreground'>
            Most Popular
          </span>
          <p className='text-sm font-medium text-muted-foreground mb-2'>Pro</p>
          <div className='flex items-start gap-1 mb-1'>
            <span className='text-2xl font-bold mt-1'>$</span>
            <span className='text-5xl font-bold'>{isYearly ? '72' : '8'}</span>
          </div>
          <p className='text-sm text-muted-foreground mb-6'>{isYearly ? 'per year' : 'per month'}</p>
          <div className='border-t border-border/40 mb-6' />
          <ul className='space-y-3 mb-8 flex-1'>
            {proFeatures.map((f) => (
              <li key={f} className='flex items-center gap-2 text-sm'>
                <Check className='w-4 h-4 text-primary shrink-0' />
                {f}
              </li>
            ))}
          </ul>
          <Button className='w-full' onClick={handleUpgrade} disabled={loading}>
            {loading ? 'Redirecting…' : 'Upgrade to Pro'}
          </Button>
        </div>
      </div>
    </div>
  )
}
