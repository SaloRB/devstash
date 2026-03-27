# Item Types

DevStash has 7 system item types. All are immutable (`isSystem: true`, `userId: null` in DB).

---

## Type Reference

### Snippet
| Field | Value |
|---|---|
| Icon | `Code` (Lucide) |
| Color | `#3b82f6` (blue) |
| Content Type | `TEXT` |
| Route | `/items/snippets` |
| Tier | Free |

**Purpose:** Store reusable code blocks with syntax highlighting. Primary type for developers saving patterns, hooks, utilities, and boilerplate.

**Key fields:** `content` (the code), `language` (for syntax highlighting), `description`

---

### Prompt
| Field | Value |
|---|---|
| Icon | `Sparkles` (Lucide) |
| Color | `#8b5cf6` (purple) |
| Content Type | `TEXT` |
| Route | `/items/prompts` |
| Tier | Free |

**Purpose:** Store AI prompts, system messages, and workflow templates. Supports `{{variable}}` placeholder conventions.

**Key fields:** `content` (prompt text), `description`

---

### Command
| Field | Value |
|---|---|
| Icon | `Terminal` (Lucide) |
| Color | `#f97316` (orange) |
| Content Type | `TEXT` |
| Route | `/items/commands` |
| Tier | Free |

**Purpose:** Save shell commands, scripts, and CLI one-liners. May contain multi-line bash scripts or single commands.

**Key fields:** `content` (command/script), `description`, `language` (e.g. `bash`, `yaml`)

---

### Note
| Field | Value |
|---|---|
| Icon | `StickyNote` (Lucide) |
| Color | `#fde047` (yellow) |
| Content Type | `TEXT` |
| Route | `/items/notes` |
| Tier | Free |

**Purpose:** Free-form markdown notes, documentation, and reference material. Uses markdown editor.

**Key fields:** `content` (markdown), `description`

---

### File
| Field | Value |
|---|---|
| Icon | `File` (Lucide) |
| Color | `#6b7280` (gray) |
| Content Type | `FILE` |
| Route | `/items/files` |
| Tier | Pro only |

**Purpose:** Upload and store arbitrary files (context files, PDFs, configs, etc.) via Cloudflare R2.

**Key fields:** `fileUrl` (R2 URL), `fileName` (original name), `fileSize` (bytes), `description`

---

### Image
| Field | Value |
|---|---|
| Icon | `Image` (Lucide) |
| Color | `#ec4899` (pink) |
| Content Type | `FILE` |
| Route | `/items/images` |
| Tier | Pro only |

**Purpose:** Upload and store images (screenshots, diagrams, reference assets) via Cloudflare R2.

**Key fields:** `fileUrl` (R2 URL), `fileName` (original name), `fileSize` (bytes), `description`

---

### Link
| Field | Value |
|---|---|
| Icon | `Link` (Lucide) |
| Color | `#10b981` (emerald) |
| Content Type | `URL` |
| Route | `/items/links` |
| Tier | Free |

**Purpose:** Bookmark URLs — documentation, tools, references, external resources.

**Key fields:** `url` (the link), `description`

---

## Content Type Classification

| ContentType | Types | Primary Storage |
|---|---|---|
| `TEXT` | snippet, prompt, command, note | `content` field (`@db.Text`) |
| `FILE` | file, image | `fileUrl`, `fileName`, `fileSize` |
| `URL` | link | `url` field |

---

## Shared Properties

All item types share these fields regardless of content type:

| Field | Type | Purpose |
|---|---|---|
| `title` | String | Display name |
| `description` | String? | Short summary |
| `isFavorite` | Boolean | Star/favorite flag |
| `isPinned` | Boolean | Pin to top of list |
| `tags` | Tag[] | Many-to-many tagging |
| `collections` | ItemCollection[] | Collection membership |
| `userId` | String | Owner |
| `itemTypeId` | String | FK → ItemType |
| `createdAt` / `updatedAt` | DateTime | Timestamps |

---

## Display Differences

| Type | Editor | Display | Pro Gate |
|---|---|---|---|
| snippet | Markdown/code editor + language selector | Syntax-highlighted code block | No |
| prompt | Markdown editor | Formatted text | No |
| command | Markdown/code editor | Syntax-highlighted (bash/yaml/etc.) | No |
| note | Markdown editor | Rendered markdown | No |
| file | File upload input | Download link + file metadata | Yes |
| image | File upload input | Image preview + metadata | Yes |
| link | URL input | Clickable link + description | No |

---

## Icon Map (Runtime)

Icons are stored as strings in the DB (`ItemType.icon`) and resolved at runtime via `ICON_MAP` in [src/lib/item-types.ts](../src/lib/item-types.ts):

```ts
export const ICON_MAP: Record<string, LucideIcon> = {
  Code, Sparkles, Terminal, StickyNote, File, Image, Link: LinkIcon,
};
```
