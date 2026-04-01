'use client'

import { useState } from 'react'
import { Switch } from '@/components/ui/switch'
import { PricingCards } from './pricing-cards'

export function PricingToggle() {
  const [isYearly, setIsYearly] = useState(false)

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
      <PricingCards isYearly={isYearly} />
    </div>
  )
}
