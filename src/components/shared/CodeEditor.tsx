'use client'

import { useState, useRef } from 'react'
import Editor, { type OnMount } from '@monaco-editor/react'
import { Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface CodeEditorProps {
  value: string
  language?: string
  readOnly?: boolean
  onChange?: (value: string) => void
  className?: string
}

export function CodeEditor({
  value,
  language,
  readOnly = false,
  onChange,
  className,
}: CodeEditorProps) {
  const [copied, setCopied] = useState(false)
  const [height, setHeight] = useState(120)
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null)

  function handleCopy() {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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
          {language && (
            <span className="text-xs text-[#858585]">{language}</span>
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

      {/* Monaco Editor */}
      <Editor
        height={height}
        value={value}
        language={normalizedLanguage}
        theme="vs-dark"
        onChange={(val) => onChange?.(val ?? '')}
        onMount={handleMount}
        options={{
          readOnly,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontSize: 12,
          lineNumbers: 'on',
          wordWrap: 'on',
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
    </div>
  )
}
