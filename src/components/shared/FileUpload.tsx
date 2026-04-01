'use client'

import { useCallback, useRef, useState } from 'react'
import { Upload, File, ImageIcon, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent } from '@/components/ui/card'
import { formatBytes } from '@/lib/utils'
import { IMAGE_EXTS, FILE_EXTS, IMAGE_MAX, FILE_MAX } from '@/constants'

export type UploadedFile = {
  fileUrl: string
  fileName: string
  fileSize: number
}

interface FileUploadProps {
  uploadType: 'image' | 'file'
  value?: UploadedFile | null
  onChange: (file: UploadedFile | null) => void
}


export function FileUpload({ uploadType, value, onChange }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const allowedExts = uploadType === 'image' ? IMAGE_EXTS : FILE_EXTS
  const maxSize = uploadType === 'image' ? IMAGE_MAX : FILE_MAX
  const accept =
    uploadType === 'image'
      ? '.png,.jpg,.jpeg,.gif,.webp,.svg'
      : '.pdf,.txt,.md,.json,.yaml,.yml,.xml,.csv,.toml,.ini'

  const validate = useCallback(
    (file: File): string | null => {
      const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
      if (!allowedExts.has(ext)) return `Unsupported file type (.${ext})`
      if (file.size > maxSize)
        return `File too large (max ${uploadType === 'image' ? '5MB' : '10MB'})`
      return null
    },
    [allowedExts, maxSize, uploadType]
  )

  const uploadFile = useCallback(
    async (file: File) => {
      const err = validate(file)
      if (err) { setError(err); return }

      setError(null)
      setUploading(true)
      setProgress(10)

      const body = new FormData()
      body.append('file', file)

      try {
        const interval = setInterval(() => setProgress((p) => Math.min(p + 15, 85)), 200)
        const res = await fetch('/api/upload', { method: 'POST', body })
        clearInterval(interval)
        setProgress(100)

        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error ?? 'Upload failed')
        }

        const data = await res.json()
        onChange({ fileUrl: data.fileUrl, fileName: data.fileName, fileSize: data.fileSize })
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Upload failed')
      } finally {
        setUploading(false)
        setProgress(0)
      }
    },
    [validate, onChange]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) uploadFile(file)
    },
    [uploadFile]
  )

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) uploadFile(file)
      e.target.value = ''
    },
    [uploadFile]
  )

  if (value) {
    return (
      <Card size="sm">
        <CardContent className="flex items-center gap-3 py-2">
          {uploadType === 'image' ? (
            <div className="relative size-14 shrink-0 overflow-hidden rounded-md border bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={value.fileUrl} alt={value.fileName} className="size-full object-cover" />
            </div>
          ) : (
            <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
              <File className="size-4 text-muted-foreground" />
            </div>
          )}
          <div className="min-w-0 flex-1 space-y-1">
            <p className="truncate text-sm font-medium">{value.fileName}</p>
            <Badge variant="secondary" className="text-xs">{formatBytes(value.fileSize)}</Badge>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => onChange(null)}
            className="shrink-0 text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        className={`flex w-full flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed px-4 py-6 text-center transition-colors ${
          dragging
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/40'
        } ${uploading ? 'pointer-events-none opacity-60' : ''}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        {uploadType === 'image'
          ? <ImageIcon className="size-8 text-muted-foreground" />
          : <Upload className="size-8 text-muted-foreground" />}
        <span>
          <p className="text-sm font-medium">
            {uploading ? 'Uploading…' : `Drop ${uploadType} here or click to browse`}
          </p>
          <p className="text-xs text-muted-foreground">
            {uploadType === 'image'
              ? 'PNG, JPG, GIF, WebP, SVG · max 5MB'
              : 'PDF, TXT, MD, JSON, YAML, XML, CSV, TOML · max 10MB'}
          </p>
        </span>
        {uploading && <Progress value={progress} className="h-1.5 w-full max-w-xs" />}
      </button>

      {error && <p className="text-xs text-destructive">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleChange}
        disabled={uploading}
      />
    </div>
  )
}
