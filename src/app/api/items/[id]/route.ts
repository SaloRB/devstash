import { NextResponse } from 'next/server'
import { requireApiAuth } from '@/lib/auth-guard'
import { getItemById } from '@/lib/db/items'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiAuth()
  if (auth instanceof NextResponse) return auth
  const { id } = await params
  const item = await getItemById(id, auth.userId)
  if (!item) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return NextResponse.json(item)
}
