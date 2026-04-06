import { PricingToggle } from './PricingToggle'

export function PricingSection() {
  return (
    <section id='pricing' className='py-24 px-4'>
      <div className='max-w-6xl mx-auto'>
        <div className='text-center mb-12'>
          <p className='text-sm text-muted-foreground mb-2'>Simple pricing</p>
          <h2 className='text-3xl md:text-4xl font-bold mb-4'>Start Free, Scale When Ready</h2>
          <p className='text-muted-foreground'>No credit card required to get started.</p>
        </div>
        <PricingToggle />
      </div>
    </section>
  )
}
