'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select'
import { CODE_LANGUAGES } from '@/constants/editor'

interface LanguageSelectProps {
  value: string
  onChange: (value: string) => void
}

export function LanguageSelect({ value, onChange }: LanguageSelectProps) {
  return (
    <Select
      value={value || 'plaintext'}
      onValueChange={(v) => onChange(v === 'plaintext' ? '' : (v ?? ''))}
    >
      <SelectTrigger className="w-48">
        <span>
          {CODE_LANGUAGES.find((l) => l.value === (value || 'plaintext'))?.label ?? 'Plain Text'}
        </span>
      </SelectTrigger>
      <SelectContent>
        {CODE_LANGUAGES.map((l) => (
          <SelectItem key={l.value} value={l.value}>
            {l.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
