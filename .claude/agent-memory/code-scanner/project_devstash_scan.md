---
name: DevStash Code Scan - March 2026 (updated)
description: Architectural snapshot of devstash as of March 30 2026 — auth, items CRUD, file uploads, item drawer, and dashboard all implemented
type: project
---

DevStash is in active development with significant features in place as of March 30 2026.

Implemented: NextAuth v5 (email/password + GitHub OAuth), email verification, password reset, items CRUD (Server Actions + API routes), file upload to Cloudflare R2, item drawer (Sheet) with view/edit/delete, dashboard with stats/pinned/recent, AppSidebar with types and collections, CreateItemDialog and ItemDrawer are the two main entry points for item creation/editing.

Shared utilities and hooks (post-refactor, March 30 2026):
- `src/lib/item-type-sets.ts` — single source for CONTENT_TYPES / LANGUAGE_TYPES / MARKDOWN_TYPES / URL_TYPES / FILE_TYPES
- `src/lib/utils.ts` — formatBytes, formatLongDate, relativeDate, cn
- `src/lib/collection-utils.ts` — getDominantTypeColor, getCollectionTypeIcons
- `src/hooks/use-item-edit-form.ts` — form state + save logic for EditMode
- `src/hooks/use-item-create-form.ts` — form state + create logic for CreateItemDialog
- `src/components/shared/ItemContentField.tsx` — unified CodeEditor/MarkdownEditor/Textarea switcher
- `src/components/shared/ItemTypeIcon.tsx` — colored circle + icon for item types
- `src/components/items/ItemsGrid.tsx` — layout switcher for the items list page
- All queries scoped by userId

**Why:** Helps future scans avoid re-reporting already-fixed issues and focus on current state.

**How to apply:** When asked to audit or scan: use this as a baseline of what exists. Verify current state before reporting anything as missing.
