'use client'

import { useState } from 'react'
import { Wand2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { generateDescription } from '@/actions/ai'
import { AI_ERROR_MESSAGES } from '@/constants/ai'

export function GenerateDescriptionButton({
  title,
  typeName,
  content,
  url,
  tags,
  isPro,
  onGenerate,
}: {
  title: string
  typeName: string
  content?: string | null
  url?: string | null
  tags?: string | null
  isPro?: boolean
  onGenerate: (description: string) => void
}) {
  const [loading, setLoading] = useState(false)

  if (!isPro) return null

  async function handleGenerate() {
    setLoading(true)
    const result = await generateDescription({ title, typeName, content, url, tags })
    setLoading(false)

    if (result.success) {
      onGenerate(result.data)
    } else {
      toast.error(AI_ERROR_MESSAGES[result.error] ?? 'AI request failed.')
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="h-7 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground"
      onClick={handleGenerate}
      disabled={loading || !title.trim()}
    >
      <Wand2 className="size-3.5" />
      {loading ? 'Generating...' : 'Generate'}
    </Button>
  )
}
