'use client'

import Link from 'next/link'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

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

interface PricingCardsProps {
  isYearly: boolean
}

export function PricingCards({ isYearly }: PricingCardsProps) {
  return (
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
        <Button variant='outline' className='w-full' nativeButton={false} render={<Link href='/register' />}>
          Get Started
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
        <Button className='w-full' nativeButton={false} render={<Link href='/register' />}>
          Upgrade to Pro
        </Button>
      </div>
    </div>
  )
}
