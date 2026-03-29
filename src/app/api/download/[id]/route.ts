import { NextRequest, NextResponse } from 'next/server'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { auth } from '@/auth'
import { r2, R2_BUCKET, R2_PUBLIC_URL } from '@/lib/r2'
import { getItemById } from '@/lib/db/items'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const item = await getItemById(id, session.user.id)

  if (!item?.fileUrl) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const key = item.fileUrl.replace(`${R2_PUBLIC_URL}/`, '')

  const obj = await r2.send(new GetObjectCommand({ Bucket: R2_BUCKET, Key: key }))

  const body = obj.Body as ReadableStream
  const headers = new Headers()
  headers.set('Content-Type', obj.ContentType ?? 'application/octet-stream')
  headers.set(
    'Content-Disposition',
    `attachment; filename="${item.fileName ?? 'download'}"`
  )
  if (obj.ContentLength) {
    headers.set('Content-Length', String(obj.ContentLength))
  }

  return new NextResponse(body, { headers })
}
