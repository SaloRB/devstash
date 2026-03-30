'use client'

import { FileText, FileCode, FileJson, File, Download } from 'lucide-react'
import { useItemDrawer } from '@/contexts/item-drawer-context'
import { formatBytes } from '@/lib/utils'

interface FileListRowProps {
  id: string
  title: string
  fileName?: string | null
  fileSize?: number | null
  createdAt: Date
}

function getFileIcon(fileName?: string | null) {
  const ext = fileName?.split('.').pop()?.toLowerCase()

  if (ext === 'json')
    return <FileJson className="size-5 shrink-0 text-yellow-400" />
  if (ext === 'xml' || ext === 'toml' || ext === 'yaml' || ext === 'yml')
    return <FileCode className="size-5 shrink-0 text-green-400" />
  if (ext === 'pdf' || ext === 'txt' || ext === 'md' || ext === 'csv')
    return <FileText className="size-5 shrink-0 text-orange-400" />

  return <File className="size-5 shrink-0 text-muted-foreground" />
}


function formatDate(date: Date) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function FileListRow({
  id,
  title,
  fileName,
  fileSize,
  createdAt,
}: FileListRowProps) {
  const { openDrawer } = useItemDrawer()

  return (
    <div
      className="flex cursor-pointer items-center gap-4 rounded-lg border border-border px-4 py-3 transition-colors hover:bg-muted/50"
      onClick={() => openDrawer(id)}
    >
      {getFileIcon(fileName)}

      <p className="min-w-0 flex-1 truncate text-sm font-medium">
        {fileName ?? title}
      </p>

      <div className="hidden shrink-0 text-xs text-muted-foreground sm:block">
        {formatBytes(fileSize)}
      </div>

      <div className="hidden shrink-0 text-xs text-muted-foreground md:block">
        {formatDate(createdAt)}
      </div>

      <a
        href={`/api/download/${id}`}
        download
        className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        onClick={(e) => e.stopPropagation()}
      >
        <Download className="size-4" />
      </a>
    </div>
  )
}
