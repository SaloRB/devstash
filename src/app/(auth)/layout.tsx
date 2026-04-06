import { HomepageNav } from '@/components/homepage/HomepageNav'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <HomepageNav />
      {children}
    </>
  )
}
