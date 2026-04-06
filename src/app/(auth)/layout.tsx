import { HomepageNav } from '@/components/homepage/homepage-nav'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <HomepageNav />
      {children}
    </>
  )
}
