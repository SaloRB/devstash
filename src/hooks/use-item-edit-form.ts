'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { updateItem } from '@/actions/items'
import type { ItemDetail } from '@/lib/db/items'
import { CONTENT_TYPES, LANGUAGE_TYPES, MARKDOWN_TYPES, URL_TYPES } from '@/lib/item-type-sets'

export function useItemEditForm(
  item: ItemDetail,
  onSaved: (updated: ItemDetail) => void
) {
  const [title, setTitle] = useState(item.title)
  const [description, setDescription] = useState(item.description ?? '')
  const [content, setContent] = useState(item.content ?? '')
  const [language, setLanguage] = useState(item.language ?? '')
  const [url, setUrl] = useState(item.url ?? '')
  const [tagsInput, setTagsInput] = useState(
    item.tags.map((t) => t.name).join(', ')
  )
  const [saving, setSaving] = useState(false)

  const typeName = item.itemType.name.toLowerCase()
  const showContent = CONTENT_TYPES.has(typeName)
  const showLanguage = LANGUAGE_TYPES.has(typeName)
  const showMarkdown = MARKDOWN_TYPES.has(typeName)
  const showUrl = URL_TYPES.has(typeName)

  async function handleSave() {
    setSaving(true)
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    const result = await updateItem(item.id, {
      title,
      description: description || null,
      content: showContent ? content || null : item.content,
      language: showLanguage ? language || null : item.language,
      url: showUrl ? url || null : item.url,
      tags,
    })

    setSaving(false)

    if (result.success) {
      toast.success('Item updated')
      onSaved(result.data)
    } else {
      const msg =
        typeof result.error === 'string'
          ? result.error
          : 'Validation failed — check your input'
      toast.error(msg)
    }
  }

  return {
    fields: { title, description, content, language, url, tagsInput },
    setters: { setTitle, setDescription, setContent, setLanguage, setUrl, setTagsInput },
    flags: { showContent, showLanguage, showMarkdown, showUrl },
    saving,
    canSave: !!title.trim() && !saving,
    handleSave,
  }
}
