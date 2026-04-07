import { NextRequest, NextResponse } from 'next/server'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { requireApiAuth } from '@/lib/auth-guard'
import { r2, R2_BUCKET, R2_PUBLIC_URL } from '@/lib/clients/r2'
import { getItemById } from '@/lib/db/items'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiAuth()
  if (auth instanceof NextResponse) return auth

  const { id } = await params
  const item = await getItemById(id, auth.userId)

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
    `attachment; filename*=UTF-8''${encodeURIComponent(item.fileName ?? 'download')}`
  )
  if (obj.ContentLength) {
    headers.set('Content-Length', String(obj.ContentLength))
  }

  return new NextResponse(body, { headers })
}
