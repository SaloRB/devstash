# Current Feature

Dashboard Collections — replace dummy collection data in the dashboard main area with real data from the Neon database via Prisma, per `context/features/dashboard-collections-spec.md`.

## Status

Completed

## Goals

- Create `src/lib/db/collections.ts` with data fetching functions
- Fetch collections directly in server component
- Collection card border color derived from most-used content type in that collection
- Show small icons of all types in that collection
- Keep the current design
- Update collection stats display

## Notes

- Do not add items underneath collection cards yet (future feature)
- Reference screenshot at `context/screenshots/dashboard-ui-main.png` for design

## History

- **2026-03-23** - Initial Next.js setup with Tailwind CSS. Removed default boilerplate.
- **2026-03-24** - Completed Dashboard UI Phase 1: ShadCN UI init, dark mode, /dashboard route with top bar, sidebar/main placeholders.
- **2026-03-24** - Completed Dashboard UI Phase 2: Collapsible sidebar with item types, favorite/all collections, user avatar, mobile drawer, shadcn Sidebar/Sheet/Avatar/Collapsible components.
- **2026-03-24** - Completed Dashboard UI Phase 3: Stats cards, collection cards, pinned items, recent items, full-width TopBar component, sidebar offset below topbar, shadcn Card/Badge components.
- **2026-03-24** - Completed Prisma + Neon PostgreSQL setup: schema.prisma (all models), prisma.config.ts, src/lib/prisma.ts singleton with PrismaNeon adapter, prisma/seed.ts, scripts/test-db.ts. Initial migration applied, all 7 system item types seeded and verified.
- **2026-03-24** - Rewrote prisma/seed.ts: added demo user, 5 collections, and 15 items (snippets, prompts, commands, links) per seed-spec.md. Installed bcryptjs.
- **2026-03-24** - Started Dashboard Collections feature: replace mock collection data with real Neon/Prisma data, derive card colors and icons from collection content types.
- **2026-03-25** - Completed Dashboard Collections: created src/lib/db/collections.ts, updated RecentCollections to async server component fetching from Neon via Prisma, updated CollectionCard to derive border color from most-used item type.
