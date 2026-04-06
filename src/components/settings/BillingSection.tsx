'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
const FREE_LIMITS = { items: 50, collections: 3 }

interface BillingSectionProps {
  isPro: boolean
  planInterval?: 'month' | 'year' | null
  itemCount: number
  collectionCount: number
  checkoutStatus?: string | null
}

export function BillingSection({
  isPro,
  planInterval,
  itemCount,
  collectionCount,
  checkoutStatus,
}: BillingSectionProps) {
  const [loadingInterval, setLoadingInterval] = useState<'monthly' | 'yearly' | null>(null)
  const [loadingPortal, setLoadingPortal] = useState(false)

  useEffect(() => {
    if (checkoutStatus === 'success') {
      toast.success('You are now on the Pro plan!')
    } else if (checkoutStatus === 'cancelled') {
      toast('Upgrade cancelled — you can upgrade anytime.')
    }
  }, [checkoutStatus])

  async function handleUpgrade(interval: 'monthly' | 'yearly') {
    setLoadingInterval(interval)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interval }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        toast.error('Failed to start checkout')
      }
    } catch {
      toast.error('Failed to start checkout')
    } finally {
      setLoadingInterval(null)
    }
  }

  async function handleManageBilling() {
    setLoadingPortal(true)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        toast.error('Failed to open billing portal')
      }
    } catch {
      toast.error('Failed to open billing portal')
    } finally {
      setLoadingPortal(false)
    }
  }

  const planLabel = isPro
    ? planInterval === 'year' ? 'Pro — Annual' : 'Pro — Monthly'
    : 'Free'

  const itemLimit = isPro ? '∞' : String(FREE_LIMITS.items)
  const collectionLimit = isPro ? '∞' : String(FREE_LIMITS.collections)

  return (
    <div className="space-y-6">
      <div className="space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Current plan</span>
          <Badge variant={isPro ? 'default' : 'secondary'}>{planLabel}</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Items</span>
          <span>{itemCount} / {itemLimit}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Collections</span>
          <span>{collectionCount} / {collectionLimit}</span>
        </div>
      </div>

      {isPro ? (
        <Button variant="outline" onClick={handleManageBilling} disabled={loadingPortal}>
          {loadingPortal ? 'Opening portal…' : 'Manage Billing'}
        </Button>
      ) : (
        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={() => handleUpgrade('monthly')} disabled={loadingInterval !== null}>
            {loadingInterval === 'monthly' ? 'Loading…' : 'Upgrade Monthly — $8/mo'}
          </Button>
          <Button variant="outline" onClick={() => handleUpgrade('yearly')} disabled={loadingInterval !== null}>
            {loadingInterval === 'yearly' ? 'Loading…' : 'Upgrade Yearly — $72/yr'}
          </Button>
        </div>
      )}
    </div>
  )
}
