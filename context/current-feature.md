# Current Feature

Dashboard UI Phase 3 - Main content area with recent collections, pinned items, recent items, and stats cards.

## Status

Completed

## Goals

- Build the main area to the right of the sidebar
- Recent collections section
- Pinned items section
- 10 recent items
- 4 stats cards at the top for number of items, collections, favorite items and favorite collections

## Notes

- Use [Dashboard UI Main screenshot](./screenshots/dashboard-ui-main.png) as reference
- Import data directly from [Mock Data](../src/lib/mock-data.ts) until database is implemented
- See full spec: [Dashboard Phase 3 Spec](./features/dashboard-phase-3-spec.md)

## History

- **2026-03-23** - Initial Next.js setup with Tailwind CSS. Removed default boilerplate.
- **2026-03-24** - Completed Dashboard UI Phase 1: ShadCN UI init, dark mode, /dashboard route with top bar, sidebar/main placeholders.
- **2026-03-24** - Completed Dashboard UI Phase 2: Collapsible sidebar with item types, favorite/all collections, user avatar, mobile drawer, shadcn Sidebar/Sheet/Avatar/Collapsible components.
- **2026-03-24** - Completed Dashboard UI Phase 3: Stats cards, collection cards, pinned items, recent items, full-width TopBar component, sidebar offset below topbar, shadcn Card/Badge components.
