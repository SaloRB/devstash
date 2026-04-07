import { auth } from '@/auth'

export async function requireAuth(): Promise<string | null> {
  const session = await auth()
  return session?.user?.id ?? null
}
