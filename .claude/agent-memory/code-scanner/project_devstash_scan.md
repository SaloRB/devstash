---
name: DevStash Code Scan - April 2026
description: Architectural snapshot of devstash as of April 10 2026 — full auth, items/collections CRUD, file uploads, AI features, Stripe billing, all in production-ready shape
type: project
---

DevStash is feature-complete as of April 10 2026.

Implemented: NextAuth v5 (email/password + GitHub OAuth), email verification, password reset, items CRUD (Server Actions + API routes), file upload to Cloudflare R2, item drawer (Sheet) with view/edit/delete, dashboard with stats/pinned/recent, AppSidebar with types and collections, CreateItemDialog and ItemDrawer are the two main entry points for item creation/editing. AI features (explain, optimize, auto-tag, generate description) behind Pro gate. Stripe checkout + billing portal. Rate limiting via Upstash Redis.

Shared utilities and hooks:
- `src/constants/item-types.ts` — CONTENT_TYPES / LANGUAGE_TYPES / MARKDOWN_TYPES / URL_TYPES / FILE_TYPES
- `src/constants/files.ts` — IMAGE_EXTS / FILE_EXTS / IMAGE_MAX / FILE_MAX
- `src/lib/utils.ts` — formatBytes, formatLongDate, relativeDate, cn, appendTag
- `src/lib/collection-utils.ts` — getDominantTypeColor, getCollectionTypeIcons
- `src/hooks/use-item-edit-form.ts` — form state + save logic for EditMode
- `src/hooks/use-item-create-form.ts` — form state + create logic for CreateItemDialog
- `src/components/shared/ItemContentField.tsx` — unified CodeEditor/MarkdownEditor/Textarea switcher
- `src/lib/gates.ts` — getUserProStatus, checkItemLimit, checkCollectionLimit, requireProWithRateLimit
- `src/lib/auth-guard.ts` — requireAuth (Server Actions), requireApiAuth (API routes)
- `src/lib/action-utils.ts` — withAction wrapper
- `src/proxy.ts` — middleware (NOT middleware.ts — named proxy.ts, re-exported as middleware via next.config or similar)
- All queries scoped by userId

Known issues found during April 10 2026 audit:
- `/collections` and `/collections/[id]` missing from middleware matcher + PROTECTED_ROUTES (unauthenticated GET crashes with non-null assertion)
- `generateMetadata` in collections/[id]/page.tsx issues a full getCollectionWithItems DB call independent of the page's own call (no React cache deduplication)
- `getCollectionWithItems` pagination bug: skip/take applied to nested relation, not outer join count — total count from `_count.items` reflects all items but paginated items only returns first `limit` per page
- `jwt` callback in auth.ts fetches user on every token refresh (DB hit per request)
- `FREE_LIMITS` duplicated in BillingSection.tsx (local const) and lib/gates.ts
- ItemCard `handleCopy` silently swallows clipboard errors
- `/api/download/[id]/route.ts` has no error handling around the R2 GetObjectCommand call

**Why:** Helps future scans avoid re-reporting already-fixed issues and focus on current state.

**How to apply:** When asked to audit or scan, use this as a baseline. Verify current state before reporting anything as missing.
