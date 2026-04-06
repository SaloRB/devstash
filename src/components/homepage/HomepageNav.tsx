'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function HomepageNav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled
          ? 'bg-background/80 backdrop-blur-md shadow-sm border-b border-border/40'
          : 'bg-transparent'
      }`}
    >
      <div className='max-w-6xl mx-auto px-4 h-16 flex items-center justify-between'>
        <Link href='/' className='flex items-center gap-2 font-bold text-lg'>
          <Zap className='w-5 h-5 text-primary' />
          DevStash
        </Link>

        <ul className='hidden md:flex items-center gap-6 text-sm text-muted-foreground'>
          <li>
            <a href='/#features' className='hover:text-foreground transition-colors'>
              Features
            </a>
          </li>
          <li>
            <a href='/#pricing' className='hover:text-foreground transition-colors'>
              Pricing
            </a>
          </li>
        </ul>

        <div className='flex items-center gap-2'>
          <Button variant='ghost' size='sm' nativeButton={false} render={<Link href='/sign-in' />}>
            Sign In
          </Button>
          <Button size='sm' nativeButton={false} render={<Link href='/register' />}>
            Get Started
          </Button>
        </div>
      </div>
    </nav>
  )
}
