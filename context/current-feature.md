# Current Feature

Prisma + Neon PostgreSQL Setup — configure the ORM, create the initial schema, run the first migration, and seed system item types.

## Status

Completed

## Goals

- Install and configure Prisma 7 (review upgrade guide for breaking changes)
- Set up Neon PostgreSQL as the database provider (serverless)
- Create `prisma/schema.prisma` with all models from the data architecture: User, Item, ItemType, Collection, ItemCollection, Tag, and NextAuth models (Account, Session, VerificationToken)
- Add appropriate indexes and cascade deletes per the schema in project-overview.md
- Create the initial migration with `prisma migrate dev` (never use `prisma db push`)
- Create `prisma/seed.ts` and seed the 7 system item types
- Create `src/lib/prisma.ts` singleton client

## Notes

- Use the `DATABASE_URL` env var pointing to the Neon development branch; production uses a separate branch
- Always create migrations — never push directly to the database
- Prisma 7 has breaking changes; read the full upgrade guide before implementing
- `@db.Text` annotations required for long-form fields (content, description, refresh_token, access_token, id_token)

## History

- **2026-03-23** - Initial Next.js setup with Tailwind CSS. Removed default boilerplate.
- **2026-03-24** - Completed Dashboard UI Phase 1: ShadCN UI init, dark mode, /dashboard route with top bar, sidebar/main placeholders.
- **2026-03-24** - Completed Dashboard UI Phase 2: Collapsible sidebar with item types, favorite/all collections, user avatar, mobile drawer, shadcn Sidebar/Sheet/Avatar/Collapsible components.
- **2026-03-24** - Completed Dashboard UI Phase 3: Stats cards, collection cards, pinned items, recent items, full-width TopBar component, sidebar offset below topbar, shadcn Card/Badge components.
- **2026-03-24** - Completed Prisma + Neon PostgreSQL setup: schema.prisma (all models), prisma.config.ts, src/lib/prisma.ts singleton with PrismaNeon adapter, prisma/seed.ts, scripts/test-db.ts. Initial migration applied, all 7 system item types seeded and verified.
