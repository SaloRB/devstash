import { HomepageNav } from '@/components/homepage/HomepageNav'
import { HeroSection } from '@/components/homepage/HeroSection'
import { FeaturesSection } from '@/components/homepage/FeaturesSection'
import { AISection } from '@/components/homepage/AiSection'
import { PricingSection } from '@/components/homepage/PricingSection'
import { CTASection } from '@/components/homepage/CtaSection'
import { HomepageFooter } from '@/components/homepage/HomepageFooter'

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
