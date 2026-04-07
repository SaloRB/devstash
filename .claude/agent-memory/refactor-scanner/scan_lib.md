---
name: scan_lib
description: Refactor scan results for src/lib/ — second pass (2026-04-07), high-priority items completed
type: project
---

Re-scanned 2026-04-07 (second pass). Files: action-utils.ts, auth-guard.ts, collection-utils.ts, gates.ts, item-types.ts, prisma.ts, rate-limit.ts, schemas.ts, utils.ts, clients/(email, openai, r2, stripe), db/(collections, items, profile, search).

## Completed (do not re-suggest)
- clients/ split (stripe, r2, openai, email → lib/clients/)
- requireApiAuth() in auth-guard.ts — all 7 API routes use it; fully consistent
- IMAGE_MAX/FILE_MAX in upload/route.ts — imports from @/constants
- ICON_MAP in profile/page.tsx — imports from @/lib/item-types
- keyFromUrl in lib/clients/r2.ts — used by actions/items.ts

## Open findings (not yet acted on)
1. **buildTypeCounts loop** — collection-utils.ts lines 11–17 and 33–38 share identical accumulator loop. Extract private helper in same file.
2. **Email HTML shell** — clients/email.ts: both send functions share identical HTML wrapper and send+throw pattern. Extract buildEmailHtml() + sendEmail() within same file.
3. **collectionListSelect** — db/collections.ts: getRecentCollections and getAllCollections use verbatim identical select block. Extract named const in same file. (getSidebarCollections is intentionally narrower — do not merge.)
4. **itemBaseInclude** — db/items.ts: { itemType: true, tags: true } used 7 times; 3 simple query fns (getPinnedItems, getRecentItems, getFavoriteItems) use bare base shape — extract named const. Extended shapes (getItemById, updateItem, createItem) keep inline include.
5. **nullableUrl re-chains nullableString** — schemas.ts: minor, one-liner inline refactor.

## Intentional patterns (do not flag)
- toggleFavorite/togglePinned read-then-write in db/items.ts and db/collections.ts — Prisma type system makes generic abstraction unergonomic
- checkItemLimit / checkCollectionLimit in gates.ts — each called independently; no caller needs both simultaneously
- checkRateLimit vs applyRateLimit split in rate-limit.ts — correct layering
- utils.ts and collection-utils.ts separation — collection-utils depends on Lucide, utils.ts does not
- lib/item-types.ts (ICON_MAP Lucide refs) vs constants/item-types.ts (string Sets) — different purposes, different consumers
