import { HomepageNav } from '@/components/homepage/homepage-nav'
import { HeroSection } from '@/components/homepage/hero-section'
import { FeaturesSection } from '@/components/homepage/features-section'
import { AISection } from '@/components/homepage/ai-section'
import { PricingSection } from '@/components/homepage/pricing-section'
import { CTASection } from '@/components/homepage/cta-section'
import { HomepageFooter } from '@/components/homepage/homepage-footer'

export default function HomePage() {
  return (
    <div className='min-h-screen bg-background text-foreground'>
      <HomepageNav />
      <main>
        <HeroSection />
        <FeaturesSection />
        <AISection />
        <PricingSection />
        <CTASection />
      </main>
      <HomepageFooter />
    </div>
  )
}
