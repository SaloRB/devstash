# Current Feature

Seed Data — populate the development database with a demo user, system item types, and sample collections/items per `context/features/seed-spec.md`.

## Status

Completed

## Goals

- Create demo user (`demo@devstash.io`, password hashed with bcryptjs 12 rounds)
- Upsert all 7 system item types (idempotent)
- Create 5 collections with realistic items:
  - **React Patterns** — 3 TypeScript snippets (hooks, component patterns, utilities)
  - **AI Workflows** — 3 prompts (code review, documentation, refactoring)
  - **DevOps** — 1 snippet (GitHub Actions CI), 1 command (deploy script), 2 links
  - **Terminal Commands** — 4 commands (git, docker, process management, npm)
  - **Design Resources** — 4 links (Tailwind, shadcn/ui, Radix UI, Lucide)
- All upserts use stable seed IDs so the script is safely re-runnable

## Notes

- Run with `npm run seed` (uses `tsx` via `ts-node`)
- All item IDs are prefixed with `seed-` to distinguish from user-created data
- `bcryptjs` and `@types/bcryptjs` must be installed (done)

## History

- **2026-03-23** - Initial Next.js setup with Tailwind CSS. Removed default boilerplate.
- **2026-03-24** - Completed Dashboard UI Phase 1: ShadCN UI init, dark mode, /dashboard route with top bar, sidebar/main placeholders.
- **2026-03-24** - Completed Dashboard UI Phase 2: Collapsible sidebar with item types, favorite/all collections, user avatar, mobile drawer, shadcn Sidebar/Sheet/Avatar/Collapsible components.
- **2026-03-24** - Completed Dashboard UI Phase 3: Stats cards, collection cards, pinned items, recent items, full-width TopBar component, sidebar offset below topbar, shadcn Card/Badge components.
- **2026-03-24** - Completed Prisma + Neon PostgreSQL setup: schema.prisma (all models), prisma.config.ts, src/lib/prisma.ts singleton with PrismaNeon adapter, prisma/seed.ts, scripts/test-db.ts. Initial migration applied, all 7 system item types seeded and verified.
- **2026-03-24** - Rewrote prisma/seed.ts: added demo user, 5 collections, and 15 items (snippets, prompts, commands, links) per seed-spec.md. Installed bcryptjs.
