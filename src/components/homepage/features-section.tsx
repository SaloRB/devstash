import { Code, Sparkles, Terminal, StickyNote, FolderOpen, Search } from 'lucide-react'

const features = [
  {
    icon: Code,
    title: 'Code Snippets',
    desc: 'Save reusable code with Monaco editor, syntax highlighting, and smart language detection.',
    color: '#3b82f6',
  },
  {
    icon: Sparkles,
    title: 'AI Prompts',
    desc: 'Store your best prompts with markdown preview. Never re-write a perfect prompt from scratch.',
    color: '#8b5cf6',
  },
  {
    icon: Terminal,
    title: 'Commands',
    desc: 'CLI commands, scripts, and one-liners. One click to copy and paste into your terminal.',
    color: '#f97316',
  },
  {
    icon: StickyNote,
    title: 'Notes',
    desc: 'Full markdown support for documentation, checklists, and architectural decisions.',
    color: '#22c55e',
  },
  {
    icon: FolderOpen,
    title: 'Files & Docs',
    desc: 'Upload config files, PDFs, and docs. Stored securely in the cloud, accessible anywhere.',
    color: '#6b7280',
  },
  {
    icon: Search,
    title: 'Instant Search',
    desc: 'Cmd+K command palette searches across all your items and collections in real time.',
    color: '#6366f1',
  },
]

export function FeaturesSection() {
  return (
    <section id='features' className='py-24 px-4 bg-muted/20'>
      <div className='max-w-6xl mx-auto'>
        <div className='text-center mb-14'>
          <p className='text-sm text-muted-foreground mb-2'>Everything you need</p>
          <h2 className='text-3xl md:text-4xl font-bold mb-4'>All Your Dev Knowledge, One Place</h2>
          <p className='text-muted-foreground max-w-xl mx-auto'>
            Seven item types covering every artifact a developer creates or collects.
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'>
          {features.map((f) => {
            const Icon = f.icon
            return (
              <div
                key={f.title}
                className='rounded-xl border border-border/40 bg-card p-6 hover:bg-muted/30 transition-colors'
                style={{ borderTop: `2px solid ${f.color}` }}
              >
                <div
                  className='w-10 h-10 rounded-lg flex items-center justify-center mb-4'
                  style={{ background: `${f.color}20` }}
                >
                  <Icon className='w-5 h-5' style={{ color: f.color }} />
                </div>
                <h3 className='font-semibold mb-2'>{f.title}</h3>
                <p className='text-sm text-muted-foreground leading-relaxed'>{f.desc}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
