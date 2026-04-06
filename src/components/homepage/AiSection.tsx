import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

const checklist = [
  'Auto-generate tags from your snippet or prompt content',
  'Smart item suggestions as you type titles',
  'Semantic search across all your stored knowledge',
  'Automatic collection grouping by topic or project',
  'Duplicate detection across similar snippets',
]

function CodeEditorMockup() {
  return (
    <div className='rounded-xl border border-border/40 bg-[#1e1e2e] overflow-hidden shadow-2xl'>
      <div className='flex items-center gap-1.5 px-4 py-3 border-b border-border/20'>
        <span className='w-3 h-3 rounded-full bg-red-500/80' />
        <span className='w-3 h-3 rounded-full bg-yellow-500/80' />
        <span className='w-3 h-3 rounded-full bg-green-500/80' />
        <span className='ml-3 text-xs text-muted-foreground font-mono'>useDebounce.ts</span>
      </div>
      <div className='p-4 font-mono text-[13px] leading-relaxed'>
        <div>
          <span className='text-purple-400'>import</span>
          <span className='text-foreground'> {'{ '}</span>
          <span className='text-blue-300'>useState</span>
          <span className='text-foreground'>, </span>
          <span className='text-blue-300'>useEffect</span>
          <span className='text-foreground'>{' }'} </span>
          <span className='text-purple-400'>from</span>
          <span className='text-green-400'> &apos;react&apos;</span>
        </div>
        <div className='mt-2'>
          <span className='text-purple-400'>export function</span>
          <span className='text-yellow-300'> useDebounce</span>
          <span className='text-foreground'>&lt;</span>
          <span className='text-blue-300'>T</span>
          <span className='text-foreground'>&gt;(</span>
        </div>
        <div className='pl-4'>
          <span className='text-blue-300'>value</span>
          <span className='text-foreground'>: </span>
          <span className='text-blue-300'>T</span>
          <span className='text-foreground'>,</span>
        </div>
        <div className='pl-4'>
          <span className='text-blue-300'>delay</span>
          <span className='text-foreground'>: </span>
          <span className='text-purple-400'>number</span>
          <span className='text-foreground'> = </span>
          <span className='text-orange-300'>300</span>
        </div>
        <div>
          <span className='text-foreground'>): </span>
          <span className='text-blue-300'>T</span>
          <span className='text-foreground'> {'{'}</span>
        </div>
        <div className='pl-4 mt-1'>
          <span className='text-purple-400'>const</span>
          <span className='text-foreground'> [</span>
          <span className='text-blue-300'>debounced</span>
          <span className='text-foreground'>, </span>
          <span className='text-yellow-300'>setDebounced</span>
          <span className='text-foreground'>] = </span>
          <span className='text-yellow-300'>useState</span>
          <span className='text-foreground'>(</span>
          <span className='text-blue-300'>value</span>
          <span className='text-foreground'>)</span>
        </div>
        <div className='text-foreground'>{'}'}</div>
      </div>
      <div className='px-4 pb-4 border-t border-border/20 pt-3'>
        <div className='text-xs text-muted-foreground mb-2'>✦ AI Generated Tags</div>
        <div className='flex flex-wrap gap-1.5'>
          {[
            { label: 'react', color: '#3b82f6' },
            { label: 'typescript', color: '#06b6d4' },
            { label: 'hooks', color: '#22c55e' },
            { label: 'performance', color: '#f59e0b' },
            { label: 'utility', color: '#6366f1' },
          ].map((tag) => (
            <span
              key={tag.label}
              className='text-xs px-2 py-0.5 rounded'
              style={{ background: `${tag.color}25`, color: tag.color }}
            >
              {tag.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export function AISection() {
  return (
    <section id='ai' className='py-24 px-4 bg-muted/10'>
      <div className='max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center'>
        <div>
          <span className='inline-block text-xs font-semibold px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-400 mb-5'>
            ✦ Pro Feature
          </span>
          <h2 className='text-3xl md:text-4xl font-bold mb-6'>Let AI Organize Your Knowledge</h2>
          <ul className='space-y-3 mb-8'>
            {checklist.map((item) => (
              <li key={item} className='flex items-start gap-3 text-sm text-muted-foreground'>
                <Check className='w-4 h-4 text-primary mt-0.5 shrink-0' />
                {item}
              </li>
            ))}
          </ul>
          <Button nativeButton={false} render={<a href='#pricing' />}>Upgrade to Pro</Button>
        </div>

        <CodeEditorMockup />
      </div>
    </section>
  )
}
