import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function CTASection() {
  return (
    <section className='py-24 px-4 bg-muted/10'>
      <div className='max-w-2xl mx-auto text-center'>
        <h2 className='text-3xl md:text-4xl font-bold mb-4'>Ready to Organize Your Knowledge?</h2>
        <p className='text-muted-foreground mb-8'>
          Join developers who stopped losing their best snippets, commands, and prompts.
        </p>
        <Button size='lg' nativeButton={false} render={<Link href='/register' />}>
          Get Started for Free
        </Button>
      </div>
    </section>
  )
}
