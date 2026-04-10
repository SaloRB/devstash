'use client'

import NextImage from 'next/image'
import { ImageIcon, Star, Pin } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { useItemDrawer } from '@/contexts/item-drawer-context'

interface ImageCardProps {
  id: string
  title: string
  fileUrl?: string | null
  isFavorite: boolean
  isPinned: boolean
}

export default function ImageCard({
  id,
  title,
  fileUrl,
  isFavorite,
  isPinned,
}: ImageCardProps) {
  const { openDrawer } = useItemDrawer()

  return (
    <Card
      className="cursor-pointer overflow-hidden transition-colors hover:bg-muted/50"
      onClick={() => openDrawer(id)}
    >
      <div className="aspect-video overflow-hidden bg-muted">
        {fileUrl ? (
          <NextImage
            src={fileUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            <ImageIcon className="size-8 text-muted-foreground" />
          </div>
        )}
      </div>
      <CardContent className="py-2.5">
        <div className="flex items-center gap-2">
          <p className="min-w-0 flex-1 truncate text-sm font-medium">{title}</p>
          {isPinned && <Pin className="size-3 shrink-0 text-muted-foreground" />}
          {isFavorite && (
            <Star className="size-3 shrink-0 fill-yellow-500 text-yellow-500" />
          )}
        </div>
      </CardContent>
    </Card>
  )
}
