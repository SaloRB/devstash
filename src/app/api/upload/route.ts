import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { requireApiAuth } from '@/lib/auth-guard'
import { r2, R2_BUCKET, R2_PUBLIC_URL } from '@/lib/clients/r2'
import { applyRateLimit } from '@/lib/rate-limit'
import { IMAGE_MAX, FILE_MAX } from '@/constants'

const IMAGE_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'image/svg+xml',
])

const FILE_TYPES = new Set([
  'application/pdf',
  'text/plain',
  'text/markdown',
  'application/json',
  'application/x-yaml',
  'text/yaml',
  'application/xml',
  'text/xml',
  'text/csv',
  'application/toml',
])

export async function POST(req: NextRequest) {
  const auth = await requireApiAuth()
  if (auth instanceof NextResponse) return auth

  const limited = await applyRateLimit(`upload:${auth.userId}`, 20, '1 h')
  if (limited) return limited

  const formData = await req.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  const isImage = IMAGE_TYPES.has(file.type)
  const isFile = FILE_TYPES.has(file.type)

  if (!isImage && !isFile) {
    return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 })
  }

  const maxSize = isImage ? IMAGE_MAX : FILE_MAX
  if (file.size > maxSize) {
    const limit = isImage ? '5MB' : '10MB'
    return NextResponse.json({ error: `File too large (max ${limit})` }, { status: 400 })
  }

  const ext = file.name.split('.').pop() ?? 'bin'
  const key = `${auth.userId}/${randomUUID()}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())

  await r2.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: file.type,
      ContentDisposition: `attachment; filename="${file.name}"`,
    })
  )

  return NextResponse.json({
    fileUrl: `${R2_PUBLIC_URL}/${key}`,
    fileName: file.name,
    fileSize: file.size,
  })
}
