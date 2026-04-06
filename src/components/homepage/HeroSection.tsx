import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChaosAnimation } from './ChaosAnimation'

function DashboardMockup() {
  const navItems = [
    { label: 'Snippets', color: '#3b82f6', active: true },
    { label: 'Prompts', color: '#8b5cf6' },
    { label: 'Commands', color: '#f97316' },
    { label: 'Notes', color: '#fde047' },
    { label: 'Files', color: '#6b7280' },
    { label: 'Images', color: '#ec4899' },
    { label: 'Links', color: '#10b981' },
  ]

  const collections = [
    { color: '#3b82f6' },
    { color: '#8b5cf6' },
    { color: '#f97316' },
    { color: '#22c55e' },
    { color: '#fde047' },
    { color: '#10b981' },
  ]

  const recentItems = [
    { color: '#ec4899' },
    { color: '#3b82f6' },
    { color: '#8b5cf6' },
    { color: '#f97316' },
  ]

  return (
    <div className='rounded-xl border border-border/40 bg-card overflow-hidden shadow-2xl h-full'>
      {/* Top bar */}
      <div className='flex items-center justify-end px-3 py-2 border-b border-border/40 bg-muted/10'>
        <span className='w-4 h-4 rounded-full bg-blue-500' />
      </div>
      <div className='flex h-[calc(100%-36px)]'>
        {/* Sidebar */}
        <div className='w-24 border-r border-border/40 bg-muted/10 p-2 flex flex-col gap-0.5 shrink-0'>
          {navItems.map((item) => (
            <div
              key={item.label}
              className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] ${
                item.active ? 'bg-muted text-foreground font-medium' : 'text-muted-foreground'
              }`}
            >
              <span className='w-1.5 h-1.5 rounded-full shrink-0' style={{ background: item.color }} />
              {item.label}
            </div>
          ))}
        </div>

        {/* Main */}
        <div className='flex-1 p-3 overflow-hidden flex flex-col gap-3'>
          {/* Collections */}
          <div>
            <p className='text-[9px] font-semibold tracking-widest text-muted-foreground mb-2 uppercase'>
              Collections
            </p>
            <div className='grid grid-cols-3 gap-1.5'>
              {collections.map((c, i) => (
                <div
                  key={i}
                  className='rounded-lg border border-border/40 bg-muted/20 p-2 h-10'
                  style={{ borderBottom: `2px solid ${c.color}` }}
                >
                  <div className='w-full h-1.5 rounded bg-muted/60 mb-1.5' />
                  <div className='w-2/3 h-1 rounded bg-muted/40' />
                </div>
              ))}
            </div>
          </div>

          {/* Recent Items */}
          <div>
            <p className='text-[9px] font-semibold tracking-widest text-muted-foreground mb-2 uppercase'>
              Recent Items
            </p>
            <div className='grid grid-cols-2 gap-1.5'>
              {recentItems.map((item, i) => (
                <div
                  key={i}
                  className='rounded-lg border border-border/40 bg-muted/20 p-2 h-12'
                  style={{ borderTop: `2px solid ${item.color}` }}
                >
                  <div className='w-full h-1.5 rounded bg-muted/60 mb-1.5' />
                  <div className='w-3/4 h-1 rounded bg-muted/40 mb-1' />
                  <div className='w-1/2 h-1 rounded bg-muted/30' />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function HeroSection() {
  return (
    <section className='pt-32 pb-20 px-4 bg-muted/5'>
      <div className='max-w-6xl mx-auto'>
        <div className='text-center mb-14'>
          <span className='text-sm text-muted-foreground mb-4 block'>
            Your developer knowledge, finally organized
          </span>
          <h1 className='text-5xl md:text-6xl font-bold tracking-tight mb-6 leading-tight'>
            Stop Losing Your
            <br />
            <span className='bg-linear-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent'>
              Developer Knowledge
            </span>
          </h1>
          <p className='text-lg text-muted-foreground max-w-2xl mx-auto mb-8'>
            Snippets scattered in notes, prompts buried in chats, commands lost in terminal history.
            DevStash is one place for everything your dev brain needs.
          </p>
          <div className='flex items-center justify-center gap-3'>
            <Button size='lg' nativeButton={false} render={<Link href='/register' />}>
              Get Started Free
            </Button>
            <Button size='lg' variant='outline' nativeButton={false} render={<a href='#features' />}>
              See Features
            </Button>
          </div>
        </div>

        <div className='flex flex-col md:flex-row items-center gap-6'>
          <div className='w-full md:flex-1 flex flex-col gap-2'>
            <p className='text-xs text-muted-foreground text-center uppercase tracking-widest'>
              Your knowledge today...
            </p>
            <div className='h-72'>
              <ChaosAnimation />
            </div>
          </div>

          <div className='flex flex-col items-center gap-1 text-muted-foreground shrink-0'>
            <span className='text-2xl font-bold text-primary'>→</span>
            <span className='text-xs font-semibold tracking-wider'>DevStash</span>
          </div>

          <div className='w-full md:flex-1 flex flex-col gap-2'>
            <p className='text-xs text-muted-foreground text-center uppercase tracking-widest'>
              ...with DevStash
            </p>
            <div className='h-72'>
              <DashboardMockup />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
