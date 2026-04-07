'use client'

import { useState } from 'react'
import { Sparkles, Check, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { generateAutoTags } from '@/actions/ai'
import { AI_ERROR_MESSAGES } from '@/constants/ai'

export function SuggestTagsButton({
  title,
  content,
  isPro,
  onAcceptTag,
}: {
  title: string
  content?: string | null
  isPro?: boolean
  onAcceptTag: (tag: string) => void
}) {
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])

  if (!isPro) return null

  async function handleSuggest() {
    setLoading(true)
    setSuggestions([])
    const result = await generateAutoTags({ title, content })
    setLoading(false)

    if (result.success) {
      if (result.data.length === 0) {
        toast.info('No tag suggestions returned.')
      } else {
        setSuggestions(result.data)
      }
    } else {
      toast.error(AI_ERROR_MESSAGES[result.error] ?? 'AI request failed.')
    }
  }

  function handleAccept(tag: string) {
    onAcceptTag(tag)
    setSuggestions((prev) => prev.filter((t) => t !== tag))
  }

  function handleReject(tag: string) {
    setSuggestions((prev) => prev.filter((t) => t !== tag))
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-7 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground"
        onClick={handleSuggest}
        disabled={loading || !title.trim()}
      >
        <Sparkles className="size-3.5" />
        {loading ? 'Suggesting...' : 'Suggest Tags'}
      </Button>

      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {suggestions.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-0.5 rounded-full border bg-muted/50 px-2 py-0.5 text-xs"
            >
              {tag}
              <button
                type="button"
                className="ml-0.5 text-green-500 hover:text-green-400"
                onClick={() => handleAccept(tag)}
                aria-label={`Accept tag ${tag}`}
              >
                <Check className="size-3" />
              </button>
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => handleReject(tag)}
                aria-label={`Reject tag ${tag}`}
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
