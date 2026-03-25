# Current Feature: Quick Win Code Quality Fixes

## Status

In Progress

## Goals

- Remove unnecessary `'use client'` directive from `TopBar` (no state/hooks/handlers)
- Fix React list key collision in `CollectionCard` — use `itemType.id` instead of `color`
- Add explicit `DATABASE_URL` guard in `src/lib/prisma.ts` instead of non-null assertion
- Extract shared `getDominantTypeColor` utility to `src/lib/utils/collections.ts` to eliminate duplication between `CollectionCard` and `AppSidebar`
- Use `select` instead of `include` in `getRecentCollections` and `getSidebarCollections` to avoid over-fetching full item rows

## Notes

- Skipping the `url` field in `prisma/schema.prisma` — Prisma 7 adapter-based setup does not require it
- Skipping unscoped DB queries (`userId` filtering) — that belongs in the auth feature, not here
- Skipping `PinnedItems`/`RecentItems` abstraction — deferred, not a quick win
- All changes are isolated refactors with no behavior change expected

## History

- **2026-03-23** - Initial Next.js setup with Tailwind CSS. Removed default boilerplate.
- **2026-03-24** - Completed Dashboard UI Phase 1: ShadCN UI init, dark mode, /dashboard route with top bar, sidebar/main placeholders.
- **2026-03-24** - Completed Dashboard UI Phase 2: Collapsible sidebar with item types, favorite/all collections, user avatar, mobile drawer, shadcn Sidebar/Sheet/Avatar/Collapsible components.
- **2026-03-24** - Completed Dashboard UI Phase 3: Stats cards, collection cards, pinned items, recent items, full-width TopBar component, sidebar offset below topbar, shadcn Card/Badge components.
- **2026-03-24** - Completed Prisma + Neon PostgreSQL setup: schema.prisma (all models), prisma.config.ts, src/lib/prisma.ts singleton with PrismaNeon adapter, prisma/seed.ts, scripts/test-db.ts. Initial migration applied, all 7 system item types seeded and verified.
- **2026-03-24** - Rewrote prisma/seed.ts: added demo user, 5 collections, and 15 items (snippets, prompts, commands, links) per seed-spec.md. Installed bcryptjs.
- **2026-03-24** - Started Dashboard Collections feature: replace mock collection data with real Neon/Prisma data, derive card colors and icons from collection content types.
- **2026-03-25** - Completed Dashboard Collections: created src/lib/db/collections.ts, updated RecentCollections to async server component fetching from Neon via Prisma, updated CollectionCard to derive border color from most-used item type.
- **2026-03-25** - Completed Dashboard Items: created src/lib/db/items.ts, updated PinnedItems/RecentItems/StatsCards to async server components fetching from Neon via Prisma, updated ItemRow to use itemType directly, removed mock-data dependency from item-types.ts.
- **2026-03-25** - Completed Stats & Sidebar: added getItemTypesWithCounts/getSidebarCollections, AppSidebar converted to async server component with live item types/counts/collections, favorites show star, recents show colored circle, "View all collections" link added, seeded React Patterns and AI Workflows as favorites.
- **2026-03-25** - Completed Add Pro Badge to Sidebar: added ShadCN Badge (secondary variant, small) to file and image item types in AppSidebar, displaying "PRO" inline next to the type label.
- **2026-03-25** - Completed Add Empty State to Collections and Recent Items: created reusable EmptyState component (icon, title, description), used in RecentCollections, RecentItems, and PinnedItems when data arrays are empty.
