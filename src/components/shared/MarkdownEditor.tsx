'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Copy, Check, Sparkles, Loader2, Crown } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { optimizePrompt } from '@/actions/ai'
import { AI_ERROR_MESSAGES } from '@/constants/ai'

interface MarkdownEditorProps {
  value: string
  readOnly?: boolean
  onChange?: (value: string) => void
  onAccept?: (value: string) => void
  className?: string
  isPro?: boolean
  showOptimize?: boolean
}

export function MarkdownEditor({
  value,
  readOnly = false,
  onChange,
  onAccept,
  className,
  isPro,
  showOptimize = false,
}: MarkdownEditorProps) {
  const [tab, setTab] = useState<'write' | 'preview' | 'optimized'>(
    readOnly ? 'preview' : 'write'
  )
  const [copied, setCopied] = useState(false)
  const [optimized, setOptimized] = useState<string | null>(null)
  const [optimizing, setOptimizing] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(tab === 'optimized' && optimized ? optimized : value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleOptimize() {
    setOptimizing(true)
    const result = await optimizePrompt({ content: value })
    setOptimizing(false)
    if (result.success) {
      setOptimized(result.data)
      setTab('optimized')
    } else {
      toast.error(AI_ERROR_MESSAGES[result.error] ?? 'AI request failed.')
    }
  }

  function handleAccept() {
    if (optimized) {
      if (onAccept) {
        onAccept(optimized)
      } else {
        onChange?.(optimized)
      }
      setOptimized(null)
      setTab(readOnly ? 'preview' : 'write')
    }
  }

  return (
    <div
      className={cn(
        'overflow-hidden rounded-md border border-white/10 bg-[#1e1e1e]',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 bg-[#2d2d2d] px-3 py-2">
        <div className="flex items-center gap-1.5">
          <div className="size-3 rounded-full bg-[#ff5f57]" />
          <div className="size-3 rounded-full bg-[#febc2e]" />
          <div className="size-3 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex items-center gap-2">
          {!readOnly && (
            <div className="flex rounded border border-white/10 text-xs">
              <button
                type="button"
                onClick={() => setTab('write')}
                className={cn(
                  'px-2 py-0.5 transition-colors',
                  tab === 'write'
                    ? 'bg-white/10 text-white'
                    : 'text-[#858585] hover:text-white'
                )}
              >
                Write
              </button>
              <button
                type="button"
                onClick={() => setTab('preview')}
                className={cn(
                  'px-2 py-0.5 transition-colors',
                  tab === 'preview'
                    ? 'bg-white/10 text-white'
                    : 'text-[#858585] hover:text-white'
                )}
              >
                Preview
              </button>
              {optimized && (
                <button
                  type="button"
                  onClick={() => setTab('optimized')}
                  className={cn(
                    'px-2 py-0.5 transition-colors',
                    tab === 'optimized'
                      ? 'bg-white/10 text-white'
                      : 'text-[#858585] hover:text-white'
                  )}
                >
                  Optimized
                </button>
              )}
            </div>
          )}
          {showOptimize && !optimized && (
            isPro ? (
              <Button
                variant="ghost"
                size="icon-sm"
                className="size-6 text-[#858585] hover:bg-white/10 hover:text-white"
                onClick={handleOptimize}
                disabled={optimizing}
                title="Optimize prompt"
              >
                {optimizing ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Sparkles className="size-3.5" />
                )}
              </Button>
            ) : (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="size-6 cursor-not-allowed text-[#858585] opacity-50"
                        disabled
                      />
                    }
                  >
                    <Crown className="size-3.5" />
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    AI features require Pro subscription
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )
          )}
          <Button
            variant="ghost"
            size="icon-sm"
            className="size-6 text-[#858585] hover:bg-white/10 hover:text-white"
            onClick={handleCopy}
          >
            {copied ? (
              <Check className="size-3.5 text-green-400" />
            ) : (
              <Copy className="size-3.5" />
            )}
          </Button>
        </div>
      </div>

      {/* Body */}
      {tab === 'optimized' && optimized ? (
        <div className="flex flex-col">
          <div className="markdown-preview markdown-editor-scroll min-h-50 max-h-100 overflow-y-auto p-3 text-sm">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{optimized}</ReactMarkdown>
          </div>
          <div className="flex justify-end gap-2 border-t border-white/10 px-3 py-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-[#858585] hover:text-white"
              onClick={() => { setOptimized(null); setTab(readOnly ? 'preview' : 'write') }}
            >
              Dismiss
            </Button>
            <Button
              size="sm"
              className="h-7 text-xs"
              onClick={handleAccept}
            >
              Use this
            </Button>
          </div>
        </div>
      ) : tab === 'write' ? (
        <textarea
          value={value}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange?.(e.target.value)}
          className="markdown-editor-scroll min-h-50 max-h-100 w-full resize-none overflow-y-auto bg-transparent p-3 font-mono text-sm text-white outline-none placeholder:text-[#858585]"
          placeholder="Write markdown..."
        />
      ) : (
        <div className="markdown-preview markdown-editor-scroll min-h-50 max-h-100 overflow-y-auto p-3 text-sm">
          {value.trim() ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
          ) : (
            <p className="text-[#858585]">Nothing to preview.</p>
          )}
        </div>
      )}
    </div>
  )
}
