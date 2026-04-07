'use client'

import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { useControlledDialog } from '@/hooks/use-controlled-dialog'
import { appendTag } from '@/lib/utils'
import { LanguageSelect } from '@/components/shared/LanguageSelect'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select'
import { ICON_MAP } from '@/lib/item-types'
import type { ItemTypeWithCount } from '@/lib/db/items'
import type { UserCollection } from '@/lib/db/collections'
import { FileUpload } from '@/components/shared/FileUpload'
import { useItemCreateForm } from '@/hooks/use-item-create-form'
import { ItemContentField } from '@/components/shared/ItemContentField'
import { ItemTypeIcon } from '@/components/shared/ItemTypeIcon'
import { CollectionMultiSelect } from '@/components/shared/CollectionMultiSelect'
import { SuggestTagsButton } from '@/components/shared/SuggestTagsButton'
import { GenerateDescriptionButton } from '@/components/shared/GenerateDescriptionButton'

export default function CreateItemDialog({
  itemTypes,
  defaultTypeName,
  collections = [],
  isPro,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: {
  itemTypes: ItemTypeWithCount[]
  defaultTypeName?: string
  collections?: UserCollection[]
  isPro?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const router = useRouter()
  const { isControlled, open, setOpen } = useControlledDialog(controlledOpen, controlledOnOpenChange)

  const { fields, setters, flags, selectedType, typeName, saving, canSubmit, resetForm, handleCreate } =
    useItemCreateForm(itemTypes, defaultTypeName, () => { setOpen(false); router.refresh() })
  const { selectedTypeId, title, description, content, language, url, tagsInput, uploadedFile, selectedCollectionIds } = fields
  const { setSelectedTypeId, setTitle, setDescription, setContent, setLanguage, setUrl, setTagsInput, setUploadedFile, setSelectedCollectionIds } = setters
  const { showContent, showLanguage, showMarkdown, showUrl, showFileUpload } = flags

  const creatableTypes = itemTypes.filter((t) =>
    ['snippet', 'prompt', 'command', 'note', 'link', 'file', 'image'].includes(
      t.name.toLowerCase(),
    ),
  )

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen)
        if (!isOpen) resetForm()
      }}
    >
      {!isControlled && (
        <DialogTrigger
          render={
            <Button>
              <Plus className="size-4" />
              {defaultTypeName
                ? `Add ${defaultTypeName.charAt(0).toUpperCase()}${defaultTypeName.slice(1)}`
                : 'New Item'}
            </Button>
          }
        />
      )}
      <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ItemTypeIcon
              icon={selectedType?.icon ?? 'Code'}
              color={selectedType?.color ?? '#888'}
            />
            Create New Item
          </DialogTitle>
          <DialogDescription>Add a new item to your stash.</DialogDescription>
        </DialogHeader>

        <div className="markdown-editor-scroll -mr-4 flex-1 space-y-4 overflow-y-auto pr-4">
          <div className="space-y-1.5">
            <Label>Type</Label>
            <Select
              value={selectedTypeId}
              onValueChange={(v) => setSelectedTypeId(v ?? '')}
            >
              <SelectTrigger className="w-50">
                {selectedType ? (
                  <span className="flex items-center gap-1.5">
                    {(() => {
                      const Icon =
                        ICON_MAP[selectedType.icon] ?? ICON_MAP['Code']
                      return (
                        <Icon
                          className="size-4"
                          style={{ color: selectedType.color }}
                        />
                      )
                    })()}
                    {selectedType.name.charAt(0).toUpperCase() +
                      selectedType.name.slice(1)}
                  </span>
                ) : (
                  <span className="text-muted-foreground">Select a type</span>
                )}
              </SelectTrigger>
              <SelectContent>
                {creatableTypes.map((type) => {
                  const Icon = ICON_MAP[type.icon] ?? ICON_MAP['Code']
                  return (
                    <SelectItem key={type.id} value={type.id} className="p-2">
                      <Icon className="size-4" style={{ color: type.color }} />
                      {type.name.charAt(0).toUpperCase() + type.name.slice(1)}
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="create-title">Title</Label>
            <Input
              id="create-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title (required)"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="create-description">Description</Label>
              <GenerateDescriptionButton
                title={title}
                typeName={typeName ?? ''}
                content={content}
                url={url}
                tags={tagsInput}
                isPro={isPro}
                onGenerate={setDescription}
              />
            </div>
            <Textarea
              id="create-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              rows={2}
            />
          </div>

          {showFileUpload && (
            <div className="space-y-1.5">
              <Label>
                {typeName === 'image' ? 'Image' : 'File'}
              </Label>
              <FileUpload
                uploadType={typeName === 'image' ? 'image' : 'file'}
                value={uploadedFile}
                onChange={setUploadedFile}
              />
            </div>
          )}

          {showContent && (
            <>
              {showLanguage && (
                <div className="space-y-1.5">
                  <Label>Language</Label>
                  <LanguageSelect value={language} onChange={setLanguage} />
                </div>
              )}
              <div className="space-y-1.5">
                <Label>Content</Label>
                <ItemContentField
                  value={content}
                  language={language || undefined}
                  showLanguage={showLanguage}
                  showMarkdown={showMarkdown}
                  onChange={setContent}
                />
              </div>
            </>
          )}

          {showUrl && (
            <div className="space-y-1.5">
              <Label htmlFor="create-url">URL</Label>
              <Input
                id="create-url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
          )}

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="create-tags">Tags</Label>
              <SuggestTagsButton
                title={title}
                content={content}
                isPro={isPro}
                onAcceptTag={(tag) => setTagsInput(appendTag(tagsInput, tag))}
              />
            </div>
            <Input
              id="create-tags"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Comma-separated tags"
            />
          </div>

          {collections.length > 0 && (
            <div className="space-y-1.5">
              <Label>Collections</Label>
              <CollectionMultiSelect
                collections={collections}
                value={selectedCollectionIds}
                onChange={setSelectedCollectionIds}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button disabled={!canSubmit} onClick={handleCreate}>
            {saving ? 'Creating...' : 'Create Item'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
