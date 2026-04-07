'use client'

import { Textarea } from '@/components/ui/textarea'
import { CodeEditor } from '@/components/shared/CodeEditor'
import { MarkdownEditor } from '@/components/shared/MarkdownEditor'

interface ItemContentFieldProps {
  value: string
  language?: string
  showLanguage: boolean
  showMarkdown: boolean
  onChange?: (value: string) => void
  onAccept?: (value: string) => void
  readOnly?: boolean
  rows?: number
  isPro?: boolean
  showExplain?: boolean
  showOptimize?: boolean
  typeName?: string
}

export function ItemContentField({
  value,
  language,
  showLanguage,
  showMarkdown,
  onChange,
  onAccept,
  readOnly = false,
  rows = 6,
  isPro,
  showExplain = false,
  showOptimize = false,
  typeName,
}: ItemContentFieldProps) {
  if (showLanguage) {
    return (
      <CodeEditor
        value={value}
        language={language || undefined}
        onChange={readOnly ? undefined : onChange}
        readOnly={readOnly}
        isPro={isPro}
        showExplain={showExplain}
        typeName={typeName}
      />
    )
  }
  if (showMarkdown) {
    return (
      <MarkdownEditor
        value={value}
        onChange={readOnly ? undefined : onChange}
        onAccept={onAccept}
        readOnly={readOnly}
        isPro={isPro}
        showOptimize={showOptimize}
      />
    )
  }
  if (readOnly) {
    return (
      <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs leading-relaxed">
        <code>{value}</code>
      </pre>
    )
  }
  return (
    <Textarea
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder="Content"
      rows={rows}
      className="font-mono text-xs"
    />
  )
}
