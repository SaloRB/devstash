'use client'

import { useState, useRef } from 'react'
import Editor, { type OnMount, type BeforeMount } from '@monaco-editor/react'
import { Copy, Check, Sparkles, Loader2, Crown } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { useEditorPreferences } from '@/contexts/editor-preferences-context'
import { explainCode } from '@/actions/ai'
import { AI_ERROR_MESSAGES } from '@/constants/ai'

interface CodeEditorProps {
  value: string
  language?: string
  readOnly?: boolean
  onChange?: (value: string) => void
  className?: string
  isPro?: boolean
  showExplain?: boolean
  typeName?: string
}

const handleBeforeMount: BeforeMount = (monaco) => {
  monaco.editor.defineTheme('monokai', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '75715e', fontStyle: 'italic' },
      { token: 'keyword', foreground: 'f92672' },
      { token: 'string', foreground: 'e6db74' },
      { token: 'number', foreground: 'ae81ff' },
      { token: 'type', foreground: '66d9e8' },
      { token: 'function', foreground: 'a6e22e' },
    ],
    colors: {
      'editor.background': '#272822',
      'editor.foreground': '#f8f8f2',
      'editorLineNumber.foreground': '#75715e',
      'editor.selectionBackground': '#49483e',
      'editor.lineHighlightBackground': '#3e3d32',
    },
  })

  monaco.editor.defineTheme('github-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '8b949e', fontStyle: 'italic' },
      { token: 'keyword', foreground: 'ff7b72' },
      { token: 'string', foreground: 'a5d6ff' },
      { token: 'number', foreground: '79c0ff' },
      { token: 'type', foreground: 'ffa657' },
      { token: 'function', foreground: 'd2a8ff' },
    ],
    colors: {
      'editor.background': '#0d1117',
      'editor.foreground': '#c9d1d9',
      'editorLineNumber.foreground': '#6e7681',
      'editor.selectionBackground': '#388bfd33',
      'editor.lineHighlightBackground': '#161b22',
    },
  })
}

export function CodeEditor({
  value,
  language,
  readOnly = false,
  onChange,
  className,
  isPro,
  showExplain = false,
  typeName,
}: CodeEditorProps) {
  const { prefs } = useEditorPreferences()
  const [copied, setCopied] = useState(false)
  const [height, setHeight] = useState(120)
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null)
  const [explanation, setExplanation] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'code' | 'explain'>('code')
  const [explaining, setExplaining] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleExplain() {
    setExplaining(true)
    const result = await explainCode({
      content: value,
      language,
      typeName: typeName ?? 'snippet',
    })
    setExplaining(false)
    if (result.success) {
      setExplanation(result.data)
      setActiveTab('explain')
    } else {
      toast.error(AI_ERROR_MESSAGES[result.error] ?? 'AI request failed.')
    }
  }

  const handleMount: OnMount = (editor) => {
    editorRef.current = editor

    const updateHeight = () => {
      const contentHeight = Math.min(
        Math.max(editor.getContentHeight(), 80),
        400
      )
      setHeight(contentHeight)
      editor.layout()
    }

    updateHeight()
    editor.onDidContentSizeChange(updateHeight)
  }

  const normalizedLanguage = language?.toLowerCase() || 'plaintext'

  return (
    <div
      className={cn(
        'overflow-hidden rounded-md border border-white/10 bg-[#1e1e1e]',
        className
      )}
    >
      {/* macOS header */}
      <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
        <div className="flex items-center gap-1.5">
          <div className="size-3 rounded-full bg-[#ff5f57]" />
          <div className="size-3 rounded-full bg-[#febc2e]" />
          <div className="size-3 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex items-center gap-2">
          {showExplain && explanation && (
            <div className="flex rounded border border-white/10 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('code')}
                className={cn(
                  'px-2 py-0.5 transition-colors',
                  activeTab === 'code'
                    ? 'bg-white/10 text-white'
                    : 'text-[#858585] hover:text-white'
                )}
              >
                Code
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('explain')}
                className={cn(
                  'px-2 py-0.5 transition-colors',
                  activeTab === 'explain'
                    ? 'bg-white/10 text-white'
                    : 'text-[#858585] hover:text-white'
                )}
              >
                Explain
              </button>
            </div>
          )}
          {language && (
            <span className="text-xs text-[#858585]">{language}</span>
          )}
          {showExplain && !explanation && (
            isPro ? (
              <Button
                variant="ghost"
                size="icon-sm"
                className="size-6 text-[#858585] hover:bg-white/10 hover:text-white"
                onClick={handleExplain}
                disabled={explaining}
                title="Explain code"
              >
                {explaining ? (
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

      {/* Content */}
      {activeTab === 'explain' && explanation ? (
        <div
          className="markdown-preview markdown-editor-scroll overflow-y-auto p-4"
          style={{ minHeight: height }}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {explanation}
          </ReactMarkdown>
        </div>
      ) : (
        <Editor
          height={height}
          value={value}
          language={normalizedLanguage}
          theme={prefs.theme}
          onChange={(val) => onChange?.(val ?? '')}
          beforeMount={handleBeforeMount}
          onMount={handleMount}
          options={{
            readOnly,
            minimap: { enabled: prefs.minimap },
            scrollBeyondLastLine: false,
            fontSize: prefs.fontSize,
            tabSize: prefs.tabSize,
            lineNumbers: 'on',
            wordWrap: prefs.wordWrap ? 'on' : 'off',
            padding: { top: 12, bottom: 12 },
            scrollbar: {
              vertical: 'auto',
              horizontal: 'auto',
              verticalScrollbarSize: 6,
              horizontalScrollbarSize: 6,
              useShadows: false,
            },
            overviewRulerLanes: 0,
            hideCursorInOverviewRuler: true,
            overviewRulerBorder: false,
            renderLineHighlight: readOnly ? 'none' : 'line',
            contextmenu: !readOnly,
            folding: false,
            glyphMargin: false,
            lineDecorationsWidth: 4,
          }}
        />
      )}
    </div>
  )
}
