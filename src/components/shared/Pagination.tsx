import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  page: number
  totalPages: number
  basePath: string
}

function pageHref(basePath: string, page: number) {
  return `${basePath}?page=${page}`
}

export default function Pagination({ page, totalPages, basePath }: PaginationProps) {
  if (totalPages <= 1) return null

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
  const hasPrev = page > 1
  const hasNext = page < totalPages

  return (
    <nav className="flex items-center justify-center gap-1">
      {hasPrev ? (
        <Link
          href={pageHref(basePath, page - 1)}
          className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
        </Link>
      ) : (
        <span className="flex size-8 items-center justify-center rounded-md text-muted-foreground/30">
          <ChevronLeft className="size-4" />
        </span>
      )}

      {pages.map((p) => (
        <Link
          key={p}
          href={pageHref(basePath, p)}
          className={`flex size-8 items-center justify-center rounded-md text-sm transition-colors ${
            p === page
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-accent hover:text-foreground'
          }`}
        >
          {p}
        </Link>
      ))}

      {hasNext ? (
        <Link
          href={pageHref(basePath, page + 1)}
          className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <ChevronRight className="size-4" />
        </Link>
      ) : (
        <span className="flex size-8 items-center justify-center rounded-md text-muted-foreground/30">
          <ChevronRight className="size-4" />
        </span>
      )}
    </nav>
  )
}
