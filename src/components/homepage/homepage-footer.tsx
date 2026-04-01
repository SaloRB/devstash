import Link from 'next/link'
import { Zap } from 'lucide-react'

const productLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Changelog', href: '#' },
  { label: 'Roadmap', href: '#' },
]

const resourceLinks = [
  { label: 'Documentation', href: '#' },
  { label: 'API', href: '#' },
  { label: 'Blog', href: '#' },
  { label: 'Support', href: '#' },
]

const companyLinks = [
  { label: 'About', href: '#' },
  { label: 'Privacy', href: '#' },
  { label: 'Terms', href: '#' },
  { label: 'Contact', href: '#' },
]

function FooterCol({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <p className='text-sm font-semibold mb-4'>{title}</p>
      <ul className='space-y-2'>
        {links.map((l) => (
          <li key={l.label}>
            <a href={l.href} className='text-sm text-muted-foreground hover:text-foreground transition-colors'>
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function HomepageFooter() {
  return (
    <footer className='border-t border-border/40 px-4 py-14'>
      <div className='max-w-6xl mx-auto'>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-10 mb-10'>
          <div className='col-span-2 md:col-span-1'>
            <Link href='/' className='flex items-center gap-2 font-bold text-lg mb-3'>
              <Zap className='w-5 h-5 text-primary' />
              DevStash
            </Link>
            <p className='text-sm text-muted-foreground leading-relaxed'>
              The developer knowledge hub for snippets, prompts, commands, notes, files, images, and links.
            </p>
          </div>
          <FooterCol title='Product' links={productLinks} />
          <FooterCol title='Resources' links={resourceLinks} />
          <FooterCol title='Company' links={companyLinks} />
        </div>

        <div className='border-t border-border/40 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground'>
          <span>© {new Date().getFullYear()} DevStash. All rights reserved.</span>
          <span>Built for developers, by developers.</span>
        </div>
      </div>
    </footer>
  )
}
