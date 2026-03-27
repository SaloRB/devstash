# Current Feature

## Status

<!-- Not Started|In Progress|Completed -->

## Goals

<!-- Goals & requirements -->

## Notes

<!-- Any extra notes -->

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
- **2026-03-25** - Completed Quick Win Code Quality Fixes: removed 'use client' from TopBar, fixed React key collision in CollectionCard (id vs color), added DATABASE_URL guard in prisma.ts, extracted getDominantTypeColor to collection-utils.ts eliminating duplication between CollectionCard and AppSidebar, switched getRecentCollections/getSidebarCollections from include to select.
- **2026-03-25** - Completed Auth Setup Phase 1: installed next-auth@beta + @auth/prisma-adapter, split config (auth.config.ts edge-safe + auth.ts with Prisma adapter/JWT), GitHub OAuth provider, proxy.ts middleware protecting /dashboard/*, session type augmentation.
- **2026-03-25** - Completed Auth Credentials Phase 2: added Credentials provider (edge-safe placeholder in auth.config.ts, bcrypt validation in auth.ts), POST /api/auth/register route (validate/hash/create), redirect callback to /dashboard after sign-in.
- **2026-03-26** - Completed Auth UI Phase 3: custom /sign-in (credentials + GitHub) and /register pages in (auth) route group, reusable UserAvatar (image or initials), SidebarUserMenu client component with live session data and sign-out dropdown, proxy.ts redirects to /sign-in, ssr:false wrapper to fix Base UI hydration mismatch.
- **2026-03-26** - Completed UI Folder Cleanup: moved EmptyState and UserAvatar from components/ui/ to components/shared/, renamed empty-state.tsx to EmptyState.tsx (PascalCase), updated all import paths. ui/ now contains only shadcn-generated primitives.
- **2026-03-26** - Completed Auto Sign-In After Registration: after successful user creation, RegisterForm calls signIn('credentials', { email, password, redirectTo: '/dashboard' }) instead of redirecting to /sign-in. Register → auto sign in → dashboard in one flow.
- **2026-03-26** - Completed Filter Queries by User ID: added userId param to all db queries (collections, items, stats, sidebar counts), added jwt/session callbacks to auth.ts to populate session.user.id from JWT. Each server component calls auth() and passes userId to queries.
- **2026-03-26** - Completed Email Verification on Register: installed Resend, created src/lib/email.ts helper, added /api/auth/verify-email route (validates token, stamps emailVerified, redirects), added /check-email page, updated register route to generate VerificationToken + send email (rollback on failure), blocked unverified credentials sign-in via custom EmailNotVerified error, updated SignInForm to show verification feedback.
- **2026-03-26** - Completed Fix Build - Suspense Boundary on Sign-In: wrapped SignInForm in Suspense on /sign-in page to resolve useSearchParams() prerender error. Build now passes.
- **2026-03-26** - Completed Delete Users Script: added scripts/delete-users.ts to delete all non-demo users and their content via Prisma cascade, with manual VerificationToken cleanup by email. Added db:delete-users npm script.
- **2026-03-26** - Completed Email Verification Toggle: added EMAIL_VERIFICATION_ENABLED env var (default false). When false, register stamps emailVerified immediately and auto signs in; credentials sign-in skips emailVerified gate. When true, full Resend verification flow active. No code paths break regardless of flag value.
- **2026-03-26** - Completed Forgot Password: added /forgot-password and /reset-password pages with forms, POST /api/auth/forgot-password (generates VerificationToken with reset: prefix, sends email via Resend), POST /api/auth/reset-password (validates token, updates bcrypt hash, deletes token, 1hr expiry), sendPasswordResetEmail helper, Forgot password? link on sign-in page.
- **2026-03-26** - Completed Profile Page: added /profile route (protected via middleware), user info card with avatar/email/member-since and inline change-password dialog (email users only), usage stats card with item/collection counts and per-type progress bars with colored Lucide icons, danger zone card with delete account AlertDialog. New files: src/app/profile/, src/lib/db/profile.ts, src/components/profile/, src/app/api/auth/change-password/, src/app/api/user/delete-account/, shadcn alert-dialog and dialog components.
- **2026-03-26** - Completed Rate Limiting for Auth: installed @upstash/ratelimit + @upstash/redis, created src/lib/rate-limit.ts (getIP, checkRateLimit, applyRateLimit — sliding window, fail-open). Protected register (3/1h IP), forgot-password (3/1h IP), reset-password (5/15m IP), and credentials login (5/15m IP+email via authorize callback). SignInForm handles rate_limit_exceeded error code. Requires UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN env vars.
- **2026-03-26** - Completed Fix GitHub OAuth Redirect: created src/actions/auth.ts with signInWithGitHub server action, updated SignInForm to use <form action={signInWithGitHub}> replacing client-side signIn. Eliminates double-click issue — GitHub OAuth now redirects reliably in one click.
- **2026-03-27** - Completed Protect Auth Routes: extended proxy.ts middleware to redirect authenticated users from /sign-in, /register, /forgot-password, /reset-password → /dashboard. Expanded matcher to include all auth routes.
- **2026-03-27** - Completed Items List View: dynamic /items/[type] route with type-filtered 2-col grid, ItemCard shared component (replaces ItemRow on dashboard too), (main) route group consolidating dashboard/items/profile into single shared layout, getItemsByType DB query, PROTECTED_ROUTES constant, dynamic page title via generateMetadata.
