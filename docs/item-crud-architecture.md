# Item CRUD Architecture

Unified system for all 7 item types (snippet, prompt, command, note, file, image, link).

---

## Design Principles

- **One action file** for all mutations — type-specific logic stays in components, not actions
- **`lib/db` for queries** — called directly from server components, no API routes needed
- **One dynamic route** — `/items/[type]` handles all types
- **Shared components** — adapt by `contentType` (`TEXT` / `FILE` / `URL`), not by item type name

---

## File Structure

```
src/
├── actions/
│   └── items.ts                      # createItem, updateItem, deleteItem, toggleFavorite, togglePinned
│
├── lib/
│   └── db/
│       └── items.ts                  # getItemsByType, getItemById (+ existing queries)
│
├── app/
│   └── (dashboard)/
│       └── items/
│           └── [type]/
│               └── page.tsx          # server component — resolves type, fetches, renders
│
└── components/
    └── items/
        ├── item-list.tsx             # renders list + empty state (client)
        ├── item-card.tsx             # card shell — delegates content display by contentType
        ├── item-card-content.tsx     # type-specific content preview (code, image, link, etc.)
        ├── item-form.tsx             # shared form shell (title, description, tags, collections)
        ├── item-form-fields.tsx      # type-specific fields — switches on contentType
        ├── item-dialog.tsx           # Sheet wrapping item-form for create/edit
        └── item-actions.tsx          # edit / delete / pin / favorite buttons
```

---

## Routing: `/items/[type]`

The `[type]` param is the **plural slug** matching each system type's route:

| Param      | ItemType.name | ContentType |
|------------|---------------|-------------|
| `snippets` | `snippet`     | `TEXT`      |
| `prompts`  | `prompt`      | `TEXT`      |
| `commands` | `command`     | `TEXT`      |
| `notes`    | `note`        | `TEXT`      |
| `files`    | `file`        | `FILE`      |
| `images`   | `image`       | `FILE`      |
| `links`    | `link`        | `URL`       |

The page resolves the singular name from the param, queries the `ItemType` record by `name`, and uses `notFound()` for invalid params.

```ts
// app/(dashboard)/items/[type]/page.tsx (server component)
const singularMap: Record<string, string> = {
  snippets: 'snippet', prompts: 'prompt', commands: 'command',
  notes: 'note', files: 'file', images: 'image', links: 'link',
}

export default async function ItemTypePage({ params }: { params: { type: string } }) {
  const session = await auth()
  const typeName = singularMap[params.type]
  if (!typeName) notFound()

  const [itemType, items] = await Promise.all([
    getItemTypeByName(typeName),
    getItemsByType(session.user.id, typeName),
  ])
  if (!itemType) notFound()

  return <ItemList items={items} itemType={itemType} />
}
```

---

## Mutations: `src/actions/items.ts`

Single file. All 5 mutations live here. Type-specific branching is minimal — only for field validation and file handling.

```ts
'use server'

export async function createItem(formData: FormData): Promise<ActionResult>
export async function updateItem(id: string, formData: FormData): Promise<ActionResult>
export async function deleteItem(id: string): Promise<ActionResult>
export async function toggleFavorite(id: string, value: boolean): Promise<ActionResult>
export async function togglePinned(id: string, value: boolean): Promise<ActionResult>
```

### What actions handle by `contentType`

| ContentType | Validation                     | Side effects              |
|-------------|--------------------------------|---------------------------|
| `TEXT`      | `content` required             | none                      |
| `FILE`      | file required on create; pro gate | R2 upload/delete       |
| `URL`       | `url` required, must be valid  | none                      |

All mutations:
1. Get session → 401 if unauthenticated
2. Verify item ownership (update/delete)
3. Revalidate `/items/[type]` path on success

---

## Queries: `src/lib/db/items.ts`

Extend the existing file with type-scoped queries:

```ts
// New additions to existing file:

export async function getItemTypeByName(name: string): Promise<ItemType | null>

export async function getItemsByType(
  userId: string,
  typeName: string,
  opts?: { search?: string; orderBy?: 'createdAt' | 'updatedAt' | 'title' }
): Promise<ItemWithType[]>

export async function getItemById(
  userId: string,
  id: string
): Promise<ItemWithType | null>
```

All queries include `itemType` and `tags`. `getItemById` also includes `collections`.

---

## Component Responsibilities

### `page.tsx` (server component)
- Resolves `[type]` → `ItemType` record
- Fetches items for current user
- Passes data down — no client state

### `item-list.tsx` (client component)
- Renders the grid/list of `ItemCard`s
- Handles empty state (zero items message)
- Opens `ItemDialog` for create

### `item-card.tsx` (client component)
- Type-agnostic card shell: title, tags, timestamps, `ItemActions`
- Delegates content preview to `ItemCardContent`

### `item-card-content.tsx` (client component)
Switches on `contentType`:
- `TEXT` → syntax-highlighted code block (snippet/command) or markdown preview (note/prompt)
- `FILE` → image preview (image) or file download link (file)
- `URL` → clickable link with favicon

For snippet/command, also renders language badge.

### `item-form.tsx` (client component)
Shared fields present for all types:
- `title` (required)
- `description`
- `tags` (multi-select)
- `collections` (multi-select)

Renders `ItemFormFields` for type-specific input.

### `item-form-fields.tsx` (client component)
Switches on `contentType`:
- `TEXT` → markdown/code editor + language selector (shown only for snippet/command)
- `FILE` → file upload input (with pro gate UI)
- `URL` → URL text input

This is the **only place** item-type-specific UI logic lives.

### `item-dialog.tsx` (client component)
- shadcn `Sheet` (slide-in drawer)
- Renders `ItemForm` with optional `item` prop for edit mode
- On submit → calls `createItem` or `updateItem` server action

### `item-actions.tsx` (client component)
- Edit → opens `ItemDialog`
- Delete → calls `deleteItem` with confirm dialog
- Pin → calls `togglePinned`
- Favorite → calls `toggleFavorite`

---

## Type-Specific Logic: Where It Lives

| Logic                          | Location                  |
|-------------------------------|---------------------------|
| Which fields to show/require  | `item-form-fields.tsx`    |
| Content preview rendering     | `item-card-content.tsx`   |
| Language selector visibility  | `item-form-fields.tsx`    |
| Image preview vs download     | `item-card-content.tsx`   |
| R2 upload/delete              | `actions/items.ts`        |
| Pro gate enforcement          | `actions/items.ts`        |
| Pro gate UI                   | `item-form-fields.tsx`    |
| contentType → field mapping   | `actions/items.ts` (validation) |

Actions are **type-agnostic at the signature level** — they receive `formData` and derive behavior from the `itemType.contentType` looked up via `itemTypeId`.

---

## Data Flow

```
Server Component (page.tsx)
  │
  ├─ getItemsByType()  ──→  Prisma  ──→  Neon DB
  │
  └─ <ItemList items={items} itemType={itemType} />
        │
        ├─ <ItemCard> × N
        │     ├─ <ItemCardContent>   (display by contentType)
        │     └─ <ItemActions>
        │           └─ toggleFavorite / togglePinned / deleteItem  ──→  Server Action
        │
        └─ "+ New" button
              └─ <ItemDialog>
                    └─ <ItemForm>
                          └─ <ItemFormFields>  (input by contentType)
                                └─ createItem / updateItem  ──→  Server Action
                                                                    └─ revalidatePath
```

---

## Type Slug Utility

Add to `src/lib/item-types.ts`:

```ts
export const TYPE_SLUG_MAP: Record<string, string> = {
  snippets: 'snippet',
  prompts: 'prompt',
  commands: 'command',
  notes: 'note',
  files: 'file',
  images: 'image',
  links: 'link',
}

export const TYPE_PLURAL_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(TYPE_SLUG_MAP).map(([k, v]) => [v, k])
)
```

Used in the page to resolve params and in the sidebar to build nav links.
