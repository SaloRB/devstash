import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { auth } from '@/auth'
import { r2, R2_BUCKET, R2_PUBLIC_URL } from '@/lib/r2'

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

const IMAGE_MAX = 5 * 1024 * 1024
const FILE_MAX = 10 * 1024 * 1024

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

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
  const key = `${session.user.id}/${randomUUID()}.${ext}`
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
