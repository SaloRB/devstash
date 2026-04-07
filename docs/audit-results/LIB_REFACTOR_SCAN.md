# Refactor Scan — `src/lib/`

Re-scanned: 2026-04-07 (second pass)  
Files: `action-utils.ts`, `auth-guard.ts`, `collection-utils.ts`, `gates.ts`, `item-types.ts`, `prisma.ts`, `rate-limit.ts`, `schemas.ts`, `utils.ts`, `clients/email.ts`, `clients/openai.ts`, `clients/r2.ts`, `clients/stripe.ts`, `db/collections.ts`, `db/items.ts`, `db/profile.ts`, `db/search.ts`

---

## Completed Since Last Scan

All high-priority items from the prior scan are done. Verified by reading current file state:

| Item | Status |
|------|--------|
| `stripe.ts`, `r2.ts`, `openai.ts`, `email.ts` → `lib/clients/` | Done |
| `requireApiAuth()` added to `auth-guard.ts` | Done — all 7 routes use it (`instanceof NextResponse` guard) |
| `IMAGE_MAX`/`FILE_MAX` in `upload/route.ts` | Done — imports from `@/constants` |
| `ICON_MAP` re-declared in `profile/page.tsx` | Done — imports from `@/lib/item-types` |
| `keyFromUrl` extracted to `lib/clients/r2.ts` | Done — used correctly in `actions/items.ts` |

---

## Remaining Open Items

### 1. `buildTypeCounts` loop duplicated — `lib/collection-utils.ts`

**Priority: Medium**

`getCollectionTypeIcons` (lines 11–17) and `getDominantTypeColor` (lines 33–38) both build a `Record<string, { count: number; color: string }>` accumulator with identical loop logic. The only difference is the input shape (`{ itemType }` wrapper vs flat `{ id, color }`).

```ts
// getCollectionTypeIcons lines 11–17
const typeCounts: Record<string, { count: number; color: string }> = {}
for (const { itemType } of items) {
  if (!typeCounts[itemType.id]) typeCounts[itemType.id] = { count: 0, color: itemType.color }
  typeCounts[itemType.id].count++
}

// getDominantTypeColor lines 33–38
const counts: Record<string, { count: number; color: string }> = {}
for (const { id, color } of itemTypes) {
  if (!counts[id]) counts[id] = { count: 0, color }
  counts[id].count++
}
```

**Extraction target:** Private `function buildTypeCounts(types: { id: string; color: string }[])` at top of `collection-utils.ts`. `getCollectionTypeIcons` normalises its input before calling it. No new file needed.

---

### 2. Email HTML shell duplicated — `lib/clients/email.ts`

**Priority: Medium**

`sendVerificationEmail` (lines 9–23) and `sendPasswordResetEmail` (lines 26–44) share:
- Identical outer `<div>` wrapper with the same inline styles
- Identical `<a>` CTA button styles
- Identical `resend.emails.send(...)` call shape
- Identical `if (error) throw new Error(error.message)` tail

Only the heading text, body copy, CTA label, URL, and footer expiry text differ.

**Extraction target:** Private `buildEmailHtml({ heading, body, ctaUrl, ctaLabel, footer }: EmailHtmlOptions)` helper and private `sendEmail({ to, subject, html })` wrapper — both within `lib/clients/email.ts`. No new file.

---

### 3. `collectionListSelect` shape duplicated — `lib/db/collections.ts`

**Priority: Medium**

`getRecentCollections` (lines 8–24) and `getAllCollections` (lines 72–88) use a verbatim identical `select` block:

```ts
select: {
  id: true,
  name: true,
  description: true,
  isFavorite: true,
  items: {
    select: {
      item: {
        select: {
          itemType: { select: { id: true, icon: true, color: true } },
        },
      },
    },
  },
  _count: { select: { items: true } },
}
```

Note: `getSidebarCollections` (lines 27–48) uses a narrower shape (no `description`, no `icon`) — intentionally different, do not consolidate with the above.

**Extraction target:** `const collectionListSelect = { ... } as const` near top of `db/collections.ts`. Used in both `getRecentCollections` and `getAllCollections`. Internal to the file.

---

### 4. `itemBaseInclude` shape repeated — `lib/db/items.ts`

**Priority: Low**

`{ itemType: true, tags: true }` appears 7 times in the file (lines 8–9, 20–21, 62–63, 75–76, 115–116, 164–165, 205–206). Three of those (lines 75–76, 115–116, 164–165) extend it with a `collections` key — they would not benefit from the const. The three simple query functions (`getPinnedItems`, `getRecentItems`, `getFavoriteItems`) use the identical base shape.

**Extraction target:** `const itemBaseInclude = { itemType: true, tags: true } as const` near top of `db/items.ts`. Apply to the three simple queries. The extended shapes (`getItemById`, `updateItem`, `createItem`) keep their inline `include` since they add `collections`. Internal to the file.

---

### 5. `nullableUrl` re-chains `nullableString` base — `lib/schemas.ts`

**Priority: Low**

Lines 3–17: `nullableUrl` copies the full `.string().trim().nullable().optional().transform()` chain from `nullableString` and appends `.refine()`. Could be expressed as `nullableString().refine(...)`.

One-line change within `lib/schemas.ts`. Not blocking anything.

---

## No-Action Items (Confirmed)

These were flagged in prior scans and are confirmed non-issues after re-reading current file state:

- **`toggleFavorite`/`togglePinned` read-then-write** (`db/items.ts` lines 180–198, `db/collections.ts` lines 153–161) — Prisma's model-specific types make a shared toggle helper unergonomic. Acceptable boilerplate.
- **`checkItemLimit`/`checkCollectionLimit` dual Pro fetch** (`gates.ts` lines 17–31) — each is called independently in its own code path; no caller currently needs both. Defer.
- **`lib/item-types.ts` vs `constants/item-types.ts`** — different concerns; `lib/` has Lucide refs, `constants/` has string Sets. Intentionally separate.
- **`rate-limit.ts` split** — `checkRateLimit` (pure check for `gates.ts`) vs `applyRateLimit` (NextResponse wrapper for API routes) is correct layering.
- **`utils.ts` and `collection-utils.ts` separation** — correct; `collection-utils.ts` depends on Lucide, `utils.ts` does not.
- **`requireApiAuth` adoption** — fully consistent across all API routes; no stragglers.

---

## Summary Table

| # | Finding | File | Action | Priority |
|---|---------|------|--------|----------|
| 1 | `buildTypeCounts` loop duplicated | `lib/collection-utils.ts` | Private helper in same file | Medium |
| 2 | Email HTML shell + send pattern | `lib/clients/email.ts` | `buildEmailHtml()` + `sendEmail()` in same file | Medium |
| 3 | `collectionListSelect` shape duplicated | `lib/db/collections.ts` | Named const in same file | Medium |
| 4 | `itemBaseInclude` repeated 3× (simple queries) | `lib/db/items.ts` | Named const in same file | Low |
| 5 | `nullableUrl` re-chains `nullableString` base | `lib/schemas.ts` | Inline refactor in same file | Low |
