import { prisma } from '@/lib/prisma'
import { DEFAULT_EDITOR_PREFS, type EditorPreferences } from '@/lib/editor-preferences'

export async function getProfileStats(userId: string) {
  const [totalItems, totalCollections, itemTypeCounts] = await Promise.all([
    prisma.item.count({ where: { userId } }),
    prisma.collection.count({ where: { userId } }),
    prisma.itemType.findMany({
      where: { isSystem: true },
      orderBy: { id: 'asc' },
      include: {
        _count: { select: { items: { where: { userId } } } },
      },
    }),
  ])

  return { totalItems, totalCollections, itemTypeCounts }
}

export async function getProfileUser(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      createdAt: true,
      accounts: { select: { provider: true } },
    },
  })
}

export async function getEditorPreferences(userId: string): Promise<EditorPreferences> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { editorPreferences: true },
  })
  const raw = user?.editorPreferences
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return DEFAULT_EDITOR_PREFS
  return { ...DEFAULT_EDITOR_PREFS, ...(raw as Partial<EditorPreferences>) }
}

export type ProfileStats = Awaited<ReturnType<typeof getProfileStats>>
export type ProfileUser = Awaited<ReturnType<typeof getProfileUser>>
