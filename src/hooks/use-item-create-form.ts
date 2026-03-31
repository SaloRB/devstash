'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { createItem } from '@/actions/items'
import type { ItemTypeWithCount } from '@/lib/db/items'
import type { UploadedFile } from '@/components/shared/FileUpload'
import { CONTENT_TYPES, LANGUAGE_TYPES, MARKDOWN_TYPES, URL_TYPES, FILE_TYPES } from '@/lib/item-type-sets'

export function useItemCreateForm(
  itemTypes: ItemTypeWithCount[],
  defaultTypeName?: string,
  onCreated?: () => void,
) {
  const defaultTypeId =
    itemTypes.find(
      (t) => t.name.toLowerCase() === (defaultTypeName ?? 'snippet')
    )?.id ?? ''

  const [selectedTypeId, setSelectedTypeId] = useState(defaultTypeId)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [content, setContent] = useState('')
  const [language, setLanguage] = useState('')
  const [url, setUrl] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null)
  const [selectedCollectionIds, setSelectedCollectionIds] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  const selectedType = itemTypes.find((t) => t.id === selectedTypeId)
  const typeName = selectedType?.name.toLowerCase() ?? ''
  const showContent = CONTENT_TYPES.has(typeName)
  const showLanguage = LANGUAGE_TYPES.has(typeName)
  const showMarkdown = MARKDOWN_TYPES.has(typeName)
  const showUrl = URL_TYPES.has(typeName)
  const showFileUpload = FILE_TYPES.has(typeName)

  function resetForm() {
    setSelectedTypeId(defaultTypeId)
    setTitle('')
    setDescription('')
    setContent('')
    setLanguage('')
    setUrl('')
    setTagsInput('')
    setUploadedFile(null)
    setSelectedCollectionIds([])
  }

  async function handleCreate() {
    setSaving(true)
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    const result = await createItem({
      itemTypeId: selectedTypeId,
      title,
      description: description || null,
      content: showContent ? content || null : null,
      language: showLanguage ? language || null : null,
      url: showUrl ? url || null : null,
      fileUrl: showFileUpload ? (uploadedFile?.fileUrl ?? null) : null,
      fileName: showFileUpload ? (uploadedFile?.fileName ?? null) : null,
      fileSize: showFileUpload ? (uploadedFile?.fileSize ?? null) : null,
      tags,
      collectionIds: selectedCollectionIds,
    })

    setSaving(false)

    if (result.success) {
      toast.success('Item created')
      resetForm()
      onCreated?.()
    } else {
      const msg =
        typeof result.error === 'string'
          ? result.error
          : 'Validation failed — check your input'
      toast.error(msg)
    }
  }

  return {
    fields: { selectedTypeId, title, description, content, language, url, tagsInput, uploadedFile, selectedCollectionIds },
    setters: { setSelectedTypeId, setTitle, setDescription, setContent, setLanguage, setUrl, setTagsInput, setUploadedFile, setSelectedCollectionIds },
    flags: { showContent, showLanguage, showMarkdown, showUrl, showFileUpload },
    selectedType,
    typeName,
    saving,
    canSubmit: !!selectedTypeId && !!title.trim() && !saving && (!showFileUpload || uploadedFile !== null),
    resetForm,
    handleCreate,
  }
}
